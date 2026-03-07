/**
 * Build websocket URL for room connection.
 * 构建房间连接使用的 WebSocket URL。
 *
 * @param options Client options. 客户端配置。
 * @returns Fully qualified websocket URL. 完整 WebSocket 地址。
 */
export const buildWsUrl = (options) => {
    const wsBase = options.wsBaseUrl || sanitizeHttpBase(options.httpBaseUrl).replace(/^http/, 'ws');
    const prefix = options.routePrefix || 'realtime';
    const url = new URL(`${wsBase.replace(/\/$/, '')}/${prefix}/rooms/${encodeURIComponent(options.roomId)}/ws`);
    if (options.userId) {
        url.searchParams.set('userId', options.userId);
    }
    return url.toString();
};
/**
 * Build HTTP API URL for given room action.
 * 构建指定房间动作的 HTTP API URL。
 *
 * @param options Client options. 客户端配置。
 * @param action API action name. API 动作名。
 * @returns Fully qualified HTTP URL. 完整 HTTP 地址。
 */
export const buildHttpUrl = (options, action) => {
    const prefix = options.routePrefix || 'realtime';
    return `${sanitizeHttpBase(options.httpBaseUrl)}/${prefix}/rooms/${encodeURIComponent(options.roomId)}/${action}`;
};
/**
 * Remove trailing slash from HTTP base URL.
 * 移除 HTTP 基础地址末尾斜杠。
 */
const sanitizeHttpBase = (httpBaseUrl) => {
    return httpBaseUrl.replace(/\/$/, '');
};
//# sourceMappingURL=url.js.map