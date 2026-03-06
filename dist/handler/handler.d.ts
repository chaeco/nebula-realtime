import { NebulaConfig, Env } from '../types/index.js';
/**
 * Request router for Nebula public endpoints / Nebula 公共端点请求路由器。
 *
 * @remarks
 * This layer performs path parsing and request forwarding only.
 * It does not implement host business auth logic.
 * 本层只做路径解析与转发，不实现宿主业务鉴权。
 */
export declare class NebulaHandler {
    private config;
    /**
     * @param config - Plugin runtime configuration / 插件运行时配置。
     */
    constructor(config: NebulaConfig);
    /**
     * Routes request and forwards room requests to Durable Object.
     * 路由请求并将房间请求转发到 Durable Object。
     *
     * @param request - Incoming request from host Worker / 宿主 Worker 传入请求。
     * @param env - Cloudflare Worker bindings / Cloudflare 运行时绑定。
     * @returns Health response, forwarded response, or route error response / 健康响应、转发响应或路由错误响应。
     */
    handle(request: Request, env: Env): Promise<Response>;
}
//# sourceMappingURL=handler.d.ts.map