import { formatTime } from '../../utils/index.js';
import { appendHistoryEvent } from './history-store.js';
import { getIdempotentEvent, storeIdempotentEvent } from './idempotency-store.js';
import { parseAndValidatePublishBody } from './parsers.js';
import { createRoomEvent } from './types.js';
/**
 * Process publish flow with validation, deduplication and event persistence.
 * 处理发布流程，包含参数校验、幂等去重与事件落库。
 *
 * @param input Request context and persistence limits. 请求上下文与存储限制配置。
 * @returns Publish execution result: validation error, deduplicated hit, or newly created event.
 * 返回发布处理结果：校验失败、命中幂等，或创建新事件。
 */
export const processPublishRequest = async (input) => {
    const parsed = await parseAndValidatePublishBody(input.request, input.maxEventNameLength, input.maxPayloadBytes);
    if (!parsed.ok) {
        return { type: 'error', response: parsed.response };
    }
    const body = parsed.body;
    const idempotencyKey = input.request.headers.get('x-nebula-idempotency-key') || body.idempotencyKey;
    if (idempotencyKey) {
        const existing = await getIdempotentEvent(input.storage, idempotencyKey, input.idempotencyTTLSeconds, input.idempotencyCacheSize);
        if (existing) {
            return {
                type: 'deduplicated',
                response: Response.json({
                    status: 'ok',
                    roomId: input.roomId,
                    event: existing,
                    deduplicated: true
                })
            };
        }
    }
    const event = createRoomEvent(input.protocolVersion, input.roomId, formatTime(), 'message', body.event || 'message.created', body.senderId || input.request.headers.get('x-nebula-user-id') || 'http', body.payload ?? null);
    await appendHistoryEvent(input.storage, event, input.historyLimit, input.historyChunkSize);
    if (idempotencyKey) {
        await storeIdempotentEvent(input.storage, idempotencyKey, event, input.idempotencyTTLSeconds, input.idempotencyCacheSize);
    }
    return { type: 'created', response: Response.json({ status: 'ok', roomId: input.roomId, event }), event };
};
//# sourceMappingURL=publish.js.map