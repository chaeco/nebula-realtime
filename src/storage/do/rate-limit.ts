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
export const checkConnectionRateLimit = (
  meta: ConnectionMeta,
  perSecond: number,
  perMinute: number
): string | null => {
  const now = Date.now();
  const sec = Math.floor(now / 1000);
  if (meta.windowSecond !== sec) {
    meta.windowSecond = sec;
    meta.secondCount = 0;
  }
  meta.secondCount += 1;
  if (meta.secondCount > perSecond) {
    return `rate exceeded: >${perSecond}/s`;
  }

  const minute = Math.floor(now / 60_000);
  if (meta.windowMinute !== minute) {
    meta.windowMinute = minute;
    meta.minuteCount = 0;
  }
  meta.minuteCount += 1;
  if (meta.minuteCount > perMinute) {
    return `rate exceeded: >${perMinute}/min`;
  }
  return null;
};
