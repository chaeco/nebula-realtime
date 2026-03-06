/**
 * NebulaRealtimePlugin
 * @description 暴露给宿主项目的插件类。
 * 宿主项目应在 Worker 中实例化此插件并将其请求转发至此。
 */
export declare class NebulaRealtimePlugin {
    private config;
    private startTime;
    /**
     * 构造函数
     * @param config 插件配置
     */
    constructor(config: {
        name: string;
    });
    /**
     * 处理进入插件的请求
     * @param request 请求对象
     * @param env 环境变量（包含 DO 绑定）
     */
    handleRequest(request: Request, env: Env): Promise<Response>;
}
/**
 * NebulaDurableObject
 * @description 供宿主项目引用的 Durable Object 类。
 * 宿主项目必须在 wrangler.toml 中导出此枚举类。
 */
export declare class NebulaDurableObject implements DurableObject {
    private state;
    private env;
    constructor(state: DurableObjectState, env: Env);
    fetch(request: Request): Promise<Response>;
}
//# sourceMappingURL=plugin.d.ts.map