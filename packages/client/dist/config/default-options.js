/**
 * Default runtime options for Nebula client behavior.
 * Nebula 客户端运行时默认配置。
 */
export const defaultClientOptions = {
    reconnect: true,
    reconnectBaseDelayMs: 1000,
    reconnectMaxDelayMs: 10000,
    reconnectJitterRatio: 0.2,
    queueMessagesWhenDisconnected: true,
    maxQueuedMessages: 200,
    heartbeatTimeoutMs: 60000,
    heartbeatCheckIntervalMs: 5000,
    autoPong: true,
    debug: false
};
/**
 * Resolve option with fallback from defaults.
 * 读取配置项，若缺失则回退到默认值。
 *
 * @param options User-provided options. 用户传入配置。
 * @param key Option key that supports default value. 具备默认值的配置键。
 * @returns Final resolved option value. 最终生效配置值。
 */
export const resolveDefaultOption = (options, key) => {
    return options[key] ?? defaultClientOptions[key];
};
//# sourceMappingURL=default-options.js.map