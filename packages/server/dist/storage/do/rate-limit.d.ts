import { ConnectionMeta } from './types.js';
/**
 * Checks per-connection dual-window rate limits (second + minute).
 * 检查连接级双窗口限流（秒级 + 分钟级）。
 *
 * @param meta - Mutable per-connection counters / 可变连接计数状态。
 * @param perSecond - Max messages per second / 每秒最大消息数。
 * @param perMinute - Max messages per minute / 每分钟最大消息数。
 * @returns `null` when allowed; otherwise error message / 允许返回 `null`，否则返回错误信息。
 */
export declare const checkConnectionRateLimit: (meta: ConnectionMeta, perSecond: number, perMinute: number) => string | null;
/**
 * Registers a rate-limit violation and determines whether to disconnect.
 * 记录一次超限并判断是否应断开连接。
 *
 * @param meta - Mutable per-connection counters / 连接计数状态。
 * @param threshold - Disconnect threshold / 断开阈值。
 * @param windowMs - Rolling window size / 统计窗口（毫秒）。
 * @returns `true` if connection should be disconnected / 返回 `true` 表示应断开连接。
 */
export declare const registerRateLimitViolation: (meta: ConnectionMeta, threshold: number, windowMs: number) => boolean;
//# sourceMappingURL=rate-limit.d.ts.map