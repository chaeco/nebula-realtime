import { parseRoute, resolveUserId } from '../utils/index.js';
/**
 * Request router for Nebula public endpoints / Nebula 公共端点请求路由器。
 *
 * @remarks
 * This layer performs path parsing and request forwarding only.
 * It does not implement host business auth logic.
 * 本层只做路径解析与转发，不实现宿主业务鉴权。
 */
export class NebulaHandler {
    config;
    /**
     * @param config - Plugin runtime configuration / 插件运行时配置。
     */
    constructor(config) {
        this.config = config;
    }
    /**
     * Routes request and forwards room requests to Durable Object.
     * 路由请求并将房间请求转发到 Durable Object。
     *
     * @param request - Incoming request from host Worker / 宿主 Worker 传入请求。
     * @param env - Cloudflare Worker bindings / Cloudflare 运行时绑定。
     * @returns Health response, forwarded response, or route error response / 健康响应、转发响应或路由错误响应。
     */
    async handle(request, env) {
        const url = parseRoute(request.url);
        const prefix = this.config.routePrefix || '/realtime';
        const normalizedPrefix = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
        if (!url.pathname.startsWith(normalizedPrefix)) {
            return new Response(`[${this.config.name}] 插件活跃中，路径不匹配`, { status: 404 });
        }
        const relativePath = url.pathname.slice(normalizedPrefix.length) || '/';
        if (relativePath === '/' || relativePath === '/health') {
            return Response.json({
                status: 'ok',
                plugin: this.config.name,
                protocolVersion: this.config.protocolVersion || 'v1',
                routePrefix: normalizedPrefix,
                endpoints: [
                    `${normalizedPrefix}/rooms/:roomId/ws`,
                    `${normalizedPrefix}/rooms/:roomId/messages`,
                    `${normalizedPrefix}/rooms/:roomId/presence`,
                    `${normalizedPrefix}/rooms/:roomId/history`,
                    `${normalizedPrefix}/rooms/:roomId/stats`
                ]
            });
        }
        const match = relativePath.match(/^\/rooms\/([^/]+)(?:\/(ws|messages|presence|history|stats))?\/?$/);
        if (!match) {
            return Response.json({
                error: 'invalid_route',
                message: '使用 /rooms/:roomId/(ws|messages|presence|history|stats)'
            }, { status: 404 });
        }
        const roomId = decodeURIComponent(match[1]);
        const action = match[2] || 'presence';
        const resolvedUserId = resolveUserId(request);
        const allowAnonymous = this.config.allowAnonymous ?? true;
        if (!allowAnonymous && !resolvedUserId) {
            return Response.json({ error: 'unauthorized', message: 'userId required when allowAnonymous=false' }, { status: 401 });
        }
        const durableObjectId = env.NEBULA_DO.idFromName(`${this.config.name}:${roomId}`);
        const doStub = env.NEBULA_DO.get(durableObjectId);
        const forwardUrl = new URL(request.url);
        forwardUrl.pathname = `/${action}`;
        const headers = new Headers(request.headers);
        headers.set('x-nebula-room-id', roomId);
        headers.set('x-nebula-app-name', this.config.name);
        headers.set('x-nebula-history-limit', `${this.config.historyLimit ?? 100}`);
        headers.set('x-nebula-user-id', resolvedUserId || 'anonymous');
        headers.set('x-nebula-protocol-version', this.config.protocolVersion || 'v1');
        headers.set('x-nebula-message-max-event-length', `${this.config.message?.maxEventNameLength ?? 64}`);
        headers.set('x-nebula-message-max-payload-bytes', `${this.config.message?.maxPayloadBytes ?? 16 * 1024}`);
        headers.set('x-nebula-heartbeat-interval-ms', `${this.config.heartbeat?.intervalMs ?? 15000}`);
        headers.set('x-nebula-heartbeat-timeout-ms', `${this.config.heartbeat?.timeoutMs ?? 45000}`);
        headers.set('x-nebula-rate-limit-second', `${this.config.rateLimit?.perConnectionPerSecond ?? 30}`);
        headers.set('x-nebula-rate-limit-minute', `${this.config.rateLimit?.perConnectionPerMinute ?? 600}`);
        headers.set('x-nebula-structured-logs', `${this.config.observability?.structuredLogs ?? true}`);
        const proxiedRequest = new Request(forwardUrl.toString(), {
            method: request.method,
            headers,
            body: request.body
        });
        return doStub.fetch(proxiedRequest);
    }
}
//# sourceMappingURL=handler.js.map