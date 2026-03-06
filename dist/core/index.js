import { NebulaHandler } from '../handler/handler.js';
/**
 * Nebula realtime plugin facade / Nebula 实时插件外观层。
 *
 * @remarks
 * Host Worker should call {@link handleRequest} after completing auth checks.
 * 宿主 Worker 应先完成鉴权，再调用 {@link handleRequest}。
 */
export class NebulaRealtime {
    config;
    handler;
    /**
     * Creates a plugin instance with runtime configuration.
     * 使用运行时配置创建插件实例。
     *
     * @param config - Plugin runtime configuration / 插件运行时配置。
     */
    constructor(config) {
        this.config = config;
        this.handler = new NebulaHandler(this.config);
    }
    /**
     * Handles a request routed to Nebula endpoints.
     * 处理路由到 Nebula 的请求。
     *
     * @param request - Incoming request / 进入插件的请求。
     * @param env - Cloudflare Worker bindings / Cloudflare 绑定环境。
     * @returns Health response or forwarded DO response / 健康检查或转发后的 DO 响应。
     */
    async handleRequest(request, env) {
        return this.handler.handle(request, env);
    }
}
//# sourceMappingURL=index.js.map