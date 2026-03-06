import { RuntimeMetrics } from './types.js';
/**
 * Builds presence query response.
 * 组装 presence 查询响应。
 *
 * @param request - Incoming request / 当前请求。
 * @param roomId - Room id / 房间 ID。
 * @param protocolVersion - Protocol version marker / 协议版本标记。
 * @param startTime - Room start time / 房间实例启动时间。
 * @param users - Distinct users / 去重后的在线用户列表。
 * @param connections - Active connections / 活跃连接数。
 * @returns Presence response / presence 响应。
 */
export declare const buildPresenceResponse: (request: Request, roomId: string, protocolVersion: string, startTime: string, users: string[], connections: number) => Response;
/**
 * Builds history query response and applies limit constraints.
 * 组装 history 响应并应用 limit 约束。
 *
 * @param request - Incoming request / 当前请求。
 * @param url - Parsed request URL / 解析后的 URL。
 * @param roomId - Room id / 房间 ID。
 * @param protocolVersion - Protocol version marker / 协议版本标记。
 * @param historyLimit - Maximum retained events / 历史保留上限。
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @returns History response / history 响应。
 */
export declare const buildHistoryResponse: (request: Request, url: URL, roomId: string, protocolVersion: string, historyLimit: number, storage: DurableObjectStorage) => Promise<Response>;
/**
 * Builds stats response from runtime state and persisted counters.
 * 根据运行态与持久化计数组装 stats 响应。
 *
 * @param roomId - Room id / 房间 ID。
 * @param protocolVersion - Protocol version marker / 协议版本标记。
 * @param startTime - Room start time / 房间实例启动时间。
 * @param activeConnections - Active connection count / 当前活跃连接数。
 * @param historyChunkSize - Events per chunk / 每个历史分段事件数。
 * @param metrics - In-memory metrics / 内存中的指标快照。
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @returns Stats response / stats 响应。
 */
export declare const buildStatsResponse: (roomId: string, protocolVersion: string, startTime: string, activeConnections: number, historyChunkSize: number, metrics: RuntimeMetrics, storage: DurableObjectStorage) => Promise<Response>;
//# sourceMappingURL=queries.d.ts.map