/**
 * Lifecycle states for Nebula client connection.
 * Nebula 客户端连接生命周期状态。
 */
export type NebulaClientState =
  | 'idle'
  | 'connecting'
  | 'open'
  | 'reconnecting'
  | 'closed';

/**
 * Generic server-side event payload shape.
 * 服务端事件通用负载结构。
 */
export interface NebulaServerEvent {
  /** Globally unique event id. 全局唯一事件 ID。 */
  id?: string;
  /** Event category. 事件类别。 */
  type?: string;
  /** Business event name. 业务事件名。 */
  event?: string;
  /** Event room id. 事件所属房间 ID。 */
  roomId?: string;
  /** Sender id, nullable for system/anonymous events. 发送者 ID，系统/匿名事件可为空。 */
  senderId?: string | null;
  /** Event custom payload. 事件自定义数据。 */
  payload?: unknown;
  /** Event creation timestamp in ISO format. ISO 时间戳。 */
  timestamp?: string;
  /** Protocol version used by the server. 服务端协议版本。 */
  protocolVersion?: string;
}

/**
 * Construction options for `NebulaClient`.
 * `NebulaClient` 初始化配置项。
 */
export interface NebulaClientOptions {
  /** Required HTTP base URL, e.g. `https://api.example.com`. 必填 HTTP 基础地址。 */
  httpBaseUrl: string;
  /** Optional explicit WS base URL, defaults from `httpBaseUrl`. 可选 WS 地址，不传则由 HTTP 地址推导。 */
  wsBaseUrl?: string;
  /** Route prefix before room path, defaults to `realtime`. API 路由前缀，默认 `realtime`。 */
  routePrefix?: string;
  /** Target room id for single-room mode. 多房间模式可不传，单房间模式必填。 */
  roomId?: string;
  /** Optional user id used by WS query + HTTP headers/body. 可选用户 ID，会用于 WS 查询参数和 HTTP 头/体。 */
  userId?: string;
  /** Enable automatic reconnection after unexpected close. 是否开启异常断线自动重连。 */
  reconnect?: boolean;
  /** Initial reconnect delay in milliseconds. 重连基础延迟（毫秒）。 */
  reconnectBaseDelayMs?: number;
  /** Upper bound for exponential reconnect delay. 重连退避最大延迟。 */
  reconnectMaxDelayMs?: number;
  /** Random jitter ratio applied to reconnect delay. 重连抖动比例。 */
  reconnectJitterRatio?: number;
  /** Maximum reconnect attempts before give-up (undefined = infinite). 最大重连次数，未设置表示无限。 */
  reconnectMaxAttempts?: number;
  /** Queue outbound messages while socket is disconnected. 断线期间是否缓存待发消息。 */
  queueMessagesWhenDisconnected?: boolean;
  /** Maximum buffered outbound messages. 缓存消息上限。 */
  maxQueuedMessages?: number;
  /** Heartbeat timeout threshold in milliseconds. 心跳超时阈值（毫秒）。 */
  heartbeatTimeoutMs?: number;
  /** Interval for heartbeat timeout checks in milliseconds. 心跳检测轮询间隔（毫秒）。 */
  heartbeatCheckIntervalMs?: number;
  /** Auto reply `client.pong` when receiving `server.ping`. 收到 `server.ping` 时是否自动回 `client.pong`。 */
  autoPong?: boolean;
  /** Enable debug logs via `console.debug`. 是否输出调试日志。 */
  debug?: boolean;
}

/**
 * Typed client event contract exposed by `NebulaClient`.
 * `NebulaClient` 对外事件映射定义。
 */
export interface NebulaClientEventMap<TEvent extends NebulaServerEvent> {
  /** Connection opened. 连接建立。 */
  open: { roomId: string };
  /** Raw message from server. 服务端消息。 */
  message: TEvent;
  /** Connection closed. 连接关闭。 */
  close: { roomId: string; code?: number; reason?: string };
  /** Transport/runtime error. 传输或运行时错误。 */
  error: Error | Event | unknown;
  /** Client state transition. 客户端状态切换。 */
  state: { prev: NebulaClientState; next: NebulaClientState };
  /** Reconnect scheduled with calculated backoff. 已计划重连（包含退避延迟）。 */
  reconnect_scheduled: { attempt: number; delayMs: number };
  /** Reconnect exhausted and stopped. 重连耗尽并放弃。 */
  reconnect_giveup: { attempt: number };
  /** Heartbeat timeout detected. 检测到心跳超时。 */
  heartbeat_timeout: { timeoutMs: number };
}

/**
 * Buffered outbound message shape.
 * 待发送缓存消息结构。
 */
export interface NebulaQueuedMessage {
  /** Event name to send. 发送事件名。 */
  event: string;
  /** Arbitrary JSON-serializable payload. 任意可序列化业务负载。 */
  payload: unknown;
}
