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
//# sourceMappingURL=rate-limit.d.ts.map