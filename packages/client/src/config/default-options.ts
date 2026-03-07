import { NebulaClientOptions } from '../types.js';

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
} as const;

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
export const resolveDefaultOption = <K extends DefaultOptionKey>(
  options: NebulaClientOptions,
  key: K
): (typeof defaultClientOptions)[K] => {
  return (options[key] as (typeof defaultClientOptions)[K] | undefined) ?? defaultClientOptions[key];
};
