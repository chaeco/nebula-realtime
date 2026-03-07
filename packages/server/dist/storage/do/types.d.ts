import { NebulaRoomEvent } from '../../types/index.js';
/** Per-connection runtime state used by heartbeat and rate-limit windows / 单连接运行态（心跳与限流窗口）。 */
export interface ConnectionMeta {
    userId: string;
    lastSeenAt: number;
    windowSecond: number;
    secondCount: number;
    windowMinute: number;
    minuteCount: number;
    sendFailures: number;
    violationWindowStart: number;
    violationCount: number;
}
export interface IncomingMessage {
    event?: string;
    payload?: unknown;
}
/** Disconnect reason used in `user.leave` payload / `user.leave` 事件中的离线原因。 */
export type LeaveReason = 'close' | 'error' | 'timeout' | 'rate_limit' | 'removed' | 'disbanded';
export interface LeaveMeta {
    reason: LeaveReason;
    code?: number;
    detail?: string;
}
/** Chunked history index (`firstChunk..chunk` as active window) / 分段历史索引（`firstChunk..chunk` 为有效窗口）。 */
export interface HistoryIndex {
    firstChunk: number;
    chunk: number;
    length: number;
    total: number;
}
export interface RuntimeMetrics {
    receivedMessages: number;
    broadcastMessages: number;
    rejectedMessages: number;
    rateLimitedMessages: number;
    disconnectsByReason: Record<LeaveReason, number>;
}
/** Runtime options snapshot overridable by headers / 可由请求头覆盖的运行参数快照。 */
export interface DurableRuntimeConfig {
    roomId: string;
    historyLimit: number;
    maxEventNameLength: number;
    maxPayloadBytes: number;
    heartbeatIntervalMs: number;
    heartbeatTimeoutMs: number;
    protocolVersion: string;
    rateLimitPerSecond: number;
    rateLimitPerMinute: number;
    rateLimitDisconnectThreshold: number;
    rateLimitViolationWindowMs: number;
    idempotencyCacheSize: number;
    idempotencyTTLSeconds: number;
    structuredLogs: boolean;
    historyChunkSize: number;
}
export declare const HISTORY_INDEX_KEY = "history:index";
export declare const HISTORY_CHUNK_PREFIX = "history:chunk:";
export declare const DEFAULT_HISTORY_CHUNK_SIZE = 50;
/** Creates an empty history index / 创建空历史索引。 */
export declare const defaultHistoryIndex: () => HistoryIndex;
/** Creates default metrics counters / 创建默认指标计数器。 */
export declare const defaultMetrics: () => RuntimeMetrics;
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
export declare const createRoomEvent: (protocolVersion: string, roomId: string, timestamp: string, type: "message" | "system", event: string, senderId: string | null, payload: unknown) => NebulaRoomEvent;
//# sourceMappingURL=types.d.ts.map