import { NebulaClientOptions } from '../types.js';
/** Room-scoped options requiring roomId. 房间级配置（roomId 必填）。 */
type NebulaRoomScopedOptions = NebulaClientOptions & {
    roomId: string;
};
/**
 * HTTP endpoints supported by client SDK.
 * 客户端 SDK 支持的 HTTP 接口动作。
 */
export type NebulaHttpAction = 'messages' | 'presence' | 'history' | 'stats';
/**
 * Build websocket URL for room connection.
 * 构建房间连接使用的 WebSocket URL。
 *
 * @param options Client options. 客户端配置。
 * @returns Fully qualified websocket URL. 完整 WebSocket 地址。
 */
export declare const buildWsUrl: (options: NebulaRoomScopedOptions) => string;
/**
 * Build HTTP API URL for given room action.
 * 构建指定房间动作的 HTTP API URL。
 *
 * @param options Client options. 客户端配置。
 * @param action API action name. API 动作名。
 * @returns Fully qualified HTTP URL. 完整 HTTP 地址。
 */
export declare const buildHttpUrl: (options: NebulaRoomScopedOptions, action: NebulaHttpAction) => string;
export {};
//# sourceMappingURL=url.d.ts.map