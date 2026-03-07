import { buildHttpUrl } from './url.js';
/**
 * Publish one event through HTTP API.
 * 通过 HTTP API 发布单条事件。
 */
export const publishEvent = async (options, event, payload, idempotencyKey) => {
    const headers = { 'content-type': 'application/json' };
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
export const fetchJsonOrThrow = async (url) => {
    const res = await fetch(url);
    if (!res.ok) {
        throw new Error(`request failed: ${res.status}`);
    }
    return res.json();
};
//# sourceMappingURL=http-api.js.map