import { validateMessageInput } from '../../utils/index.js';
/**
 * Parses websocket message payload.
 * 解析 WebSocket 消息 payload。
 *
 * @param message - WebSocket message content / WebSocket 消息内容。
 * @returns Parsed event/payload tuple / 解析后的 event+payload，非 JSON 文本将作为原始 payload 返回。
 */
export const parseIncomingWsPayload = (message) => {
    if (typeof message !== 'string')
        return { event: 'message.binary', payload: null };
    try {
        const parsed = JSON.parse(message);
        return { event: parsed.event || 'message.created', payload: parsed.payload ?? null };
    }
    catch {
        return { event: 'message.created', payload: message };
    }
};
/**
 * Parses and validates HTTP publish body.
 * 解析并校验 HTTP 发布消息体。
 *
 * @param request - Incoming publish request / 发布请求。
 * @param maxEventNameLength - Event name max length / 事件名最大长度。
 * @param maxPayloadBytes - Payload max serialized bytes / payload 序列化后最大字节数。
 * @returns Result with body or error response / 成功返回解析结果，失败返回错误响应。
 */
export const parseAndValidatePublishBody = async (request, maxEventNameLength, maxPayloadBytes) => {
    let body;
    try {
        body = (await request.json());
    }
    catch {
        return {
            ok: false,
            response: Response.json({ error: 'invalid_json', message: '消息体必须是 JSON' }, { status: 400 })
        };
    }
    const invalid = validateMessageInput({ event: body.event, payload: body.payload }, { maxEventNameLength, maxPayloadBytes });
    if (invalid) {
        return {
            ok: false,
            response: Response.json({ error: 'invalid_message', message: invalid }, { status: 400 })
        };
    }
    return { ok: true, body };
};
//# sourceMappingURL=parsers.js.map