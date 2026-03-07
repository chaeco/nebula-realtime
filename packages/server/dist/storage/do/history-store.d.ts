import { NebulaRoomEvent } from '../../types/index.js';
import { HistoryIndex } from './types.js';
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
export declare const appendHistoryEvent: (storage: DurableObjectStorage, event: NebulaRoomEvent, historyLimit: number, chunkSize: number) => Promise<void>;
/**
 * Loads latest events by scanning chunks from newest to oldest.
 * 从新到旧扫描分段并加载最近事件。
 *
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @param historyLimit - Max retained events / 历史保留上限。
 * @param limit - Caller requested limit / 调用方请求数量。
 * @returns Recent events in chronological order / 按时间正序返回最近事件。
 */
export declare const loadRecentHistoryEvents: (storage: DurableObjectStorage, historyLimit: number, limit: number) => Promise<NebulaRoomEvent[]>;
/**
 * Loads current history index, falling back to defaults when absent.
 * 读取当前历史索引，不存在时返回默认值。
 *
 * @param storage - Durable Object storage / Durable Object 存储实例。
 * @returns Current history index / 当前历史索引。
 */
export declare const loadHistoryIndex: (storage: DurableObjectStorage) => Promise<HistoryIndex>;
//# sourceMappingURL=history-store.d.ts.map