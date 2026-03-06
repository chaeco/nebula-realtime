/** Plugin runtime configuration / 插件运行时配置。 */
export interface NebulaConfig {
    /** Plugin name / 插件名称，用于区分不同应用实例。 */
    name: string;
    /** Optional route prefix, default `/realtime` / 可选路由前缀，默认 `/realtime`。 */
    routePrefix?: string;
    /** Allow anonymous user connection, default `true` / 是否允许匿名用户连接，默认 `true`。 */
    allowAnonymous?: boolean;
    /** Max retained history events per room, default 100 / 单房间历史消息保留数量，默认 100。 */
    historyLimit?: number;
    /** Protocol version, default `v1` / 协议版本号，默认 `v1`。 */
    protocolVersion?: string;
    /** Message validation config / 消息校验配置。 */
    message?: NebulaMessageConfig;
    /** Heartbeat config / 心跳与超时配置。 */
    heartbeat?: NebulaHeartbeatConfig;
    /** Rate limit config / 限流配置。 */
    rateLimit?: NebulaRateLimitConfig;
    /** Observability config / 可观测性配置。 */
    observability?: NebulaObservabilityConfig;
}
/** Cloudflare Worker environment bindings / Cloudflare Worker 环境绑定。 */
export interface Env {
    /** Nebula Durable Object namespace / Nebula Durable Object 命名空间。 */
    NEBULA_DO: DurableObjectNamespace;
}
/** Common Nebula response alias / Nebula 通用响应别名。 */
export type NebulaResponse = Response;
/** Realtime room event schema / 实时房间事件结构。 */
export interface NebulaRoomEvent {
    id: string;
    type: 'message' | 'system';
    event: string;
    roomId: string;
    senderId: string | null;
    payload: unknown;
    timestamp: string;
    protocolVersion: string;
}
/** Message validation configuration / 消息校验配置。 */
export interface NebulaMessageConfig {
    /** Max event name length, default 64 / 事件名最大长度，默认 64。 */
    maxEventNameLength?: number;
    /** Max payload bytes after serialization, default 16KB / payload 序列化后最大字节数，默认 16KB。 */
    maxPayloadBytes?: number;
}
/** Heartbeat and timeout configuration / 心跳与超时配置。 */
export interface NebulaHeartbeatConfig {
    /** Ping interval ms, default 15s / 心跳发送间隔，默认 15 秒。 */
    intervalMs?: number;
    /** Timeout threshold ms, default 45s / 连接超时阈值，默认 45 秒。 */
    timeoutMs?: number;
}
/** Connection-level rate limit configuration / 连接级限流配置。 */
export interface NebulaRateLimitConfig {
    /** Max messages per connection per second, default 30 / 每连接每秒最大消息数，默认 30。 */
    perConnectionPerSecond?: number;
    /** Max messages per connection per minute, default 600 / 每连接每分钟最大消息数，默认 600。 */
    perConnectionPerMinute?: number;
}
/** Observability and logging configuration / 可观测性与日志配置。 */
export interface NebulaObservabilityConfig {
    /** Whether to emit structured logs, default true / 是否输出结构化日志，默认 true。 */
    structuredLogs?: boolean;
}
//# sourceMappingURL=index.d.ts.map