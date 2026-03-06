export const HISTORY_INDEX_KEY = 'history:index';
export const HISTORY_CHUNK_PREFIX = 'history:chunk:';
export const DEFAULT_HISTORY_CHUNK_SIZE = 50;
/** Creates an empty history index / 创建空历史索引。 */
export const defaultHistoryIndex = () => ({
    firstChunk: 0,
    chunk: 0,
    length: 0,
    total: 0
});
/** Creates default metrics counters / 创建默认指标计数器。 */
export const defaultMetrics = () => ({
    receivedMessages: 0,
    broadcastMessages: 0,
    rejectedMessages: 0,
    rateLimitedMessages: 0,
    disconnectsByReason: {
        close: 0,
        error: 0,
        timeout: 0,
        rate_limit: 0
    }
});
/**
 * Creates a normalized room event object with protocol metadata.
 * 创建带协议元信息的标准化房间事件对象。
 *
 * @param protocolVersion - Protocol version marker / 协议版本标记。
 * @param roomId - Room identifier / 房间标识。
 * @param timestamp - Event timestamp string / 事件时间字符串。
 * @param type - Event type / 事件类型。
 * @param event - Event name / 事件名。
 * @param senderId - Sender id or `null` / 发送方 ID，系统事件为 `null`。
 * @param payload - Event payload / 事件 payload。
 * @returns Normalized room event object / 标准化事件对象。
 */
export const createRoomEvent = (protocolVersion, roomId, timestamp, type, event, senderId, payload) => ({
    id: crypto.randomUUID(),
    type,
    event,
    roomId,
    senderId,
    payload,
    timestamp,
    protocolVersion
});
//# sourceMappingURL=types.js.map