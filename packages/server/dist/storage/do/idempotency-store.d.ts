import { NebulaRoomEvent } from '../../types/index.js';
/**
 * Fetch cached event by idempotency key.
 * 根据幂等键查询缓存事件。
 *
 * @param storage Durable Object storage instance. Durable Object 存储实例。
 * @param key Idempotency key to query. 需要查询的幂等键。
 * @param ttlSeconds Time-to-live window in seconds. 记录有效期（秒）。
 * @param maxSize Maximum retained record count. 最大保留记录数。
 * @returns Matched event if key exists and not expired, otherwise `null`.
 * 若命中且未过期返回事件，否则返回 `null`。
 */
export declare const getIdempotentEvent: (storage: DurableObjectStorage, key: string, ttlSeconds: number, maxSize: number) => Promise<NebulaRoomEvent | null>;
/**
 * Store idempotency key to event mapping.
 * 存储幂等键与事件映射。
 *
 * @param storage Durable Object storage instance. Durable Object 存储实例。
 * @param key Idempotency key to store. 需要写入的幂等键。
 * @param event Event value associated with key. 幂等键关联事件。
 * @param ttlSeconds Time-to-live window in seconds. 记录有效期（秒）。
 * @param maxSize Maximum retained record count. 最大保留记录数。
 * @returns Resolves when write is committed to storage. 写入完成后返回。
 */
export declare const storeIdempotentEvent: (storage: DurableObjectStorage, key: string, event: NebulaRoomEvent, ttlSeconds: number, maxSize: number) => Promise<void>;
//# sourceMappingURL=idempotency-store.d.ts.map