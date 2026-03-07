/**
 * Checks per-connection dual-window rate limits (second + minute).
 * 检查连接级双窗口限流（秒级 + 分钟级）。
 *
 * @param meta - Mutable per-connection counters / 可变连接计数状态。
 * @param perSecond - Max messages per second / 每秒最大消息数。
 * @param perMinute - Max messages per minute / 每分钟最大消息数。
 * @returns `null` when allowed; otherwise error message / 允许返回 `null`，否则返回错误信息。
 */
export const checkConnectionRateLimit = (meta, perSecond, perMinute) => {
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
/**
 * Registers a rate-limit violation and determines whether to disconnect.
 * 记录一次超限并判断是否应断开连接。
 *
 * @param meta - Mutable per-connection counters / 连接计数状态。
 * @param threshold - Disconnect threshold / 断开阈值。
 * @param windowMs - Rolling window size / 统计窗口（毫秒）。
 * @returns `true` if connection should be disconnected / 返回 `true` 表示应断开连接。
 */
export const registerRateLimitViolation = (meta, threshold, windowMs) => {
    const now = Date.now();
    if (now - meta.violationWindowStart > windowMs) {
        meta.violationWindowStart = now;
        meta.violationCount = 0;
    }
    meta.violationCount += 1;
    return meta.violationCount >= threshold;
};
//# sourceMappingURL=rate-limit.js.map