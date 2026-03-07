import { NebulaClientOptions } from '../types.js';
type NebulaRoomScopedOptions = NebulaClientOptions & {
    roomId: string;
};
/**
 * Publish one event through HTTP API.
 * 通过 HTTP API 发布单条事件。
 */
export declare const publishEvent: (options: NebulaRoomScopedOptions, event: string, payload: unknown, idempotencyKey?: string) => Promise<unknown>;
/**
 * Fetch JSON and throw when response is not OK.
 * 拉取 JSON，非成功响应时抛出异常。
 */
export declare const fetchJsonOrThrow: (url: string) => Promise<unknown>;
export {};
//# sourceMappingURL=http-api.d.ts.map