/**
 * Calculate reconnect delay using exponential backoff + jitter.
 * 通过指数退避和抖动计算重连延迟。
 */
export const calcReconnectDelay = (attempt, baseDelayMs, maxDelayMs, jitterRatio) => {
    const rawDelay = Math.min(baseDelayMs * 2 ** attempt, maxDelayMs);
    const jitter = Math.floor(rawDelay * jitterRatio * Math.random());
    return rawDelay + jitter;
};
//# sourceMappingURL=policy.js.map