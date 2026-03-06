import { HISTORY_CHUNK_PREFIX, HISTORY_INDEX_KEY, defaultHistoryIndex } from './types.js';
/**
 * Appends an event to chunked history storage and prunes stale chunks.
 * 追加事件到分段历史并淘汰过旧分段。
 *
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @param event - Event to persist / 待持久化事件。
 * @param historyLimit - Max retained events / 历史保留上限。
 * @param chunkSize - Events per chunk / 每个分段容纳事件数。
 * @returns Promise resolved after persistence / 持久化与清理完成后返回。
 */
export const appendHistoryEvent = async (storage, event, historyLimit, chunkSize) => {
    let index = (await storage.get(HISTORY_INDEX_KEY)) || defaultHistoryIndex();
    if (index.length >= chunkSize) {
        index = {
            firstChunk: index.firstChunk,
            chunk: index.chunk + 1,
            length: 0,
            total: index.total
        };
    }
    const chunkKey = `${HISTORY_CHUNK_PREFIX}${index.chunk}`;
    const chunk = (await storage.get(chunkKey)) || [];
    chunk.push(event);
    index.length = chunk.length;
    index.total += 1;
    const maxChunks = Math.max(1, Math.ceil(historyLimit / chunkSize));
    while (index.chunk - index.firstChunk + 1 > maxChunks) {
        const staleKey = `${HISTORY_CHUNK_PREFIX}${index.firstChunk}`;
        const staleChunk = (await storage.get(staleKey)) || [];
        await storage.delete(staleKey);
        index.firstChunk += 1;
        index.total = Math.max(0, index.total - staleChunk.length);
    }
    await storage.put(chunkKey, chunk);
    await storage.put(HISTORY_INDEX_KEY, index);
};
/**
 * Loads latest events by scanning chunks from newest to oldest.
 * 从新到旧扫描分段并加载最近事件。
 *
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @param historyLimit - Max retained events / 历史保留上限。
 * @param limit - Caller requested limit / 调用方请求数量。
 * @returns Recent events in chronological order / 按时间正序返回最近事件。
 */
export const loadRecentHistoryEvents = async (storage, historyLimit, limit) => {
    const index = (await storage.get(HISTORY_INDEX_KEY)) || defaultHistoryIndex();
    if (index.total === 0) {
        return [];
    }
    const need = Math.min(limit, historyLimit, index.total);
    const collected = [];
    let cursor = index.chunk;
    while (cursor >= index.firstChunk && collected.length < need) {
        const chunk = (await storage.get(`${HISTORY_CHUNK_PREFIX}${cursor}`)) || [];
        if (chunk.length > 0) {
            const remaining = need - collected.length;
            collected.unshift(...chunk.slice(-remaining));
        }
        cursor -= 1;
    }
    return collected.slice(-need);
};
/**
 * Loads current history index, falling back to defaults when absent.
 * 读取当前历史索引，不存在时返回默认值。
 *
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @returns Current history index / 当前历史索引。
 */
export const loadHistoryIndex = async (storage) => {
    return (await storage.get(HISTORY_INDEX_KEY)) || defaultHistoryIndex();
};
//# sourceMappingURL=history-store.js.map