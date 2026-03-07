import { NebulaClientOptions } from '../types.js';
import { buildHttpUrl } from './url.js';

type NebulaRoomScopedOptions = NebulaClientOptions & { roomId: string };

/**
 * Publish one event through HTTP API.
 * 通过 HTTP API 发布单条事件。
 */
export const publishEvent = async (
  options: NebulaRoomScopedOptions,
  event: string,
  payload: unknown,
  idempotencyKey?: string
): Promise<unknown> => {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (options.userId) {
    headers['x-nebula-user-id'] = options.userId;
  }
  if (idempotencyKey) {
    headers['x-nebula-idempotency-key'] = idempotencyKey;
  }

  const res = await fetch(buildHttpUrl(options, 'messages'), {
    method: 'POST',
    headers,
    body: JSON.stringify({ event, payload, senderId: options.userId, idempotencyKey })
  });
  if (!res.ok) {
    throw new Error(`publish failed: ${res.status}`);
  }
  return res.json();
};

/**
 * Fetch JSON and throw when response is not OK.
 * 拉取 JSON，非成功响应时抛出异常。
 */
export const fetchJsonOrThrow = async (url: string): Promise<unknown> => {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`request failed: ${res.status}`);
  }
  return res.json();
};
