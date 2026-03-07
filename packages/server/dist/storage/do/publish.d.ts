import { NebulaRoomEvent } from '../../types/index.js';
export type PublishResult = {
    type: 'error';
    response: Response;
} | {
    type: 'deduplicated';
    response: Response;
} | {
    type: 'created';
    response: Response;
    event: NebulaRoomEvent;
};
/**
 * Input model for handling one HTTP publish request.
 * 处理单次 HTTP 发布请求所需输入。
 */
interface ProcessPublishRequestInput {
    /** Incoming HTTP request. 进入的 HTTP 请求。 */
    request: Request;
    /** Durable Object storage instance. Durable Object 存储实例。 */
    storage: DurableObjectStorage;
    /** Current room id bound to this DO. 当前 DO 绑定的房间 ID。 */
    roomId: string;
    /** Active protocol version string. 当前协议版本标识。 */
    protocolVersion: string;
    /** Max length for event name. 事件名最大长度。 */
    maxEventNameLength: number;
    /** Max body payload size in bytes. 载荷大小上限（字节）。 */
    maxPayloadBytes: number;
    /** Max number of historical events to retain. 历史消息保留上限。 */
    historyLimit: number;
    /** Storage chunk size for history persistence. 历史消息分块写入大小。 */
    historyChunkSize: number;
    /** Max size of idempotency cache records. 幂等缓存最大记录数。 */
    idempotencyCacheSize: number;
    /** TTL of idempotency records in seconds. 幂等缓存 TTL（秒）。 */
    idempotencyTTLSeconds: number;
}
/**
 * Process publish flow with validation, deduplication and event persistence.
 * 处理发布流程，包含参数校验、幂等去重与事件落库。
 *
 * @param input Request context and persistence limits. 请求上下文与存储限制配置。
 * @returns Publish execution result: validation error, deduplicated hit, or newly created event.
 * 返回发布处理结果：校验失败、命中幂等，或创建新事件。
 */
export declare const processPublishRequest: (input: ProcessPublishRequestInput) => Promise<PublishResult>;
export {};
//# sourceMappingURL=publish.d.ts.map