import { loadHistoryIndex, loadRecentHistoryEvents } from './history-store.js';
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
export const buildPresenceResponse = (request, roomId, protocolVersion, startTime, users, connections) => Response.json({
    status: 'ok',
    roomId,
    protocolVersion,
    connections,
    users,
    startedAt: startTime,
    requester: request.headers.get('x-nebula-user-id') || 'anonymous'
});
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
export const buildHistoryResponse = async (request, url, roomId, protocolVersion, historyLimit, storage) => {
    if (request.method !== 'GET') {
        return Response.json({ error: 'method_not_allowed', message: '请使用 GET' }, { status: 405 });
    }
    const requested = Number.parseInt(url.searchParams.get('limit') || '', 10);
    const limit = Number.isFinite(requested) ? Math.max(1, Math.min(requested, historyLimit)) : historyLimit;
    const events = await loadRecentHistoryEvents(storage, historyLimit, limit);
    return Response.json({ status: 'ok', roomId, protocolVersion, count: events.length, events });
};
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
export const buildStatsResponse = async (roomId, protocolVersion, startTime, activeConnections, historyChunkSize, metrics, storage) => {
    const index = await loadHistoryIndex(storage);
    const persisted = (await storage.get('stats:metrics')) || metrics;
    return Response.json({
        status: 'ok',
        roomId,
        protocolVersion,
        runtime: { startedAt: startTime, activeConnections },
        history: {
            total: index.total,
            firstChunk: index.firstChunk,
            chunk: index.chunk,
            chunkLength: index.length,
            chunkSize: historyChunkSize
        },
        metrics: persisted
    });
};
//# sourceMappingURL=queries.js.map