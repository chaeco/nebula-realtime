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
    /**
     * Host-provided admin authorization callback.
     * 宿主提供的管理操作鉴权回调（返回 `boolean`）。
     *
     * @remarks
     * Plugin does not implement business authorization. Host decides whether
     * `admin` operations are allowed, and only returns allow/deny.
     * 插件不实现业务鉴权；宿主决定 `admin` 操作是否允许，仅返回允许/拒绝布尔值。
     */
    authorizeAdmin?: NebulaAdminAuthorize;
}
/** Supported admin action names / 支持的管理操作类型。 */
export type NebulaAdminAction = 'remove-users' | 'disband' | 'count';
/** Host authorization callback type / 宿主鉴权回调类型。 */
export type NebulaAdminAuthorize = (input: {
    request: Request;
    roomId: string;
    action: NebulaAdminAction;
}) => boolean | Promise<boolean>;
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
    /** Idempotency cache size, default 500 / 幂等缓存大小，默认 500。 */
    idempotencyCacheSize?: number;
    /** Idempotency TTL seconds, default 300 / 幂等键有效期（秒），默认 300。 */
    idempotencyTTLSeconds?: number;
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
    /** Disconnect threshold on repeated violations, default 3 / 连续超限触发断开阈值，默认 3。 */
    disconnectThreshold?: number;
    /** Violation rolling window ms, default 60000 / 超限统计窗口毫秒，默认 60000。 */
    violationWindowMs?: number;
}
/** Observability and logging configuration / 可观测性与日志配置。 */
export interface NebulaObservabilityConfig {
    /** Whether to emit structured logs, default true / 是否输出结构化日志，默认 true。 */
    structuredLogs?: boolean;
}
//# sourceMappingURL=index.d.ts.map