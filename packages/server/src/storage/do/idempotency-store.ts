import { NebulaRoomEvent } from '../../types/index.js';

/**
 * In-storage idempotency record.
 * 存储层幂等记录结构。
 */
interface IdempotencyRecord {
  /** Idempotency key provided by caller. 调用方传入的幂等键。 */
  key: string;
  /** Record creation timestamp (epoch ms). 记录创建时间戳（毫秒）。 */
  createdAt: number;
  /** Cached room event for this key. 对应缓存事件。 */
  event: NebulaRoomEvent;
}

const IDEMPOTENCY_KEY = 'idempotency:records';

/**
 * Remove expired records and enforce size cap.
 * 清理过期记录并裁剪到指定容量上限。
 *
 * @param records Existing records loaded from storage. 从存储读取的现有记录。
 * @param now Current timestamp in epoch milliseconds. 当前时间戳（毫秒）。
 * @param ttlSeconds Time-to-live window in seconds. 记录有效期（秒）。
 * @param maxSize Maximum retained record count. 最大保留记录数。
 * @returns Fresh records ordered by original insertion. 过滤后的有效记录（保持原顺序）。
 */
const prune = (
  records: IdempotencyRecord[],
  now: number,
  ttlSeconds: number,
  maxSize: number
): IdempotencyRecord[] => {
  const fresh = records.filter((item) => now - item.createdAt <= ttlSeconds * 1000);
  if (fresh.length <= maxSize) {
    return fresh;
  }
  return fresh.slice(fresh.length - maxSize);
};

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
export const getIdempotentEvent = async (
  storage: DurableObjectStorage,
  key: string,
  ttlSeconds: number,
  maxSize: number
): Promise<NebulaRoomEvent | null> => {
  const now = Date.now();
  const current = ((await storage.get<IdempotencyRecord[]>(IDEMPOTENCY_KEY)) || []);
  const cleaned = prune(current, now, ttlSeconds, maxSize);
  if (cleaned.length !== current.length) {
    await storage.put(IDEMPOTENCY_KEY, cleaned);
  }
  const found = cleaned.find((item) => item.key === key);
  return found?.event || null;
};

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
export const storeIdempotentEvent = async (
  storage: DurableObjectStorage,
  key: string,
  event: NebulaRoomEvent,
  ttlSeconds: number,
  maxSize: number
): Promise<void> => {
  const now = Date.now();
  const current = ((await storage.get<IdempotencyRecord[]>(IDEMPOTENCY_KEY)) || []);
  const cleaned = prune(current, now, ttlSeconds, maxSize).filter((item) => item.key !== key);
  cleaned.push({ key, createdAt: now, event });
  const clipped = cleaned.length > maxSize ? cleaned.slice(cleaned.length - maxSize) : cleaned;
  await storage.put(IDEMPOTENCY_KEY, clipped);
};
