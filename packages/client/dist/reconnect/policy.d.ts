/**
 * Calculate reconnect delay using exponential backoff + jitter.
 * 通过指数退避和抖动计算重连延迟。
 */
export declare const calcReconnectDelay: (attempt: number, baseDelayMs: number, maxDelayMs: number, jitterRatio: number) => number;
//# sourceMappingURL=policy.d.ts.map