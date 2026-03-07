import { NebulaClientOptions } from '../types.js';
/**
 * Default runtime options for Nebula client behavior.
 * Nebula 客户端运行时默认配置。
 */
export declare const defaultClientOptions: {
    readonly reconnect: true;
    readonly reconnectBaseDelayMs: 1000;
    readonly reconnectMaxDelayMs: 10000;
    readonly reconnectJitterRatio: 0.2;
    readonly queueMessagesWhenDisconnected: true;
    readonly maxQueuedMessages: 200;
    readonly heartbeatTimeoutMs: 60000;
    readonly heartbeatCheckIntervalMs: 5000;
    readonly autoPong: true;
    readonly debug: false;
};
/**
 * Supported option keys that have defaults.
 * 具备默认值的配置键集合。
 */
export type DefaultOptionKey = keyof typeof defaultClientOptions;
/**
 * Resolve option with fallback from defaults.
 * 读取配置项，若缺失则回退到默认值。
 *
 * @param options User-provided options. 用户传入配置。
 * @param key Option key that supports default value. 具备默认值的配置键。
 * @returns Final resolved option value. 最终生效配置值。
 */
export declare const resolveDefaultOption: <K extends DefaultOptionKey>(options: NebulaClientOptions, key: K) => (typeof defaultClientOptions)[K];
//# sourceMappingURL=default-options.d.ts.map