import { NebulaConfig, Env } from '../types/index.js';
/**
 * NebulaRealtimePlugin (应用/外观层)
 * @description 外观模式 (Facade Pattern)。
 * 提供给宿主项目的简单统一入口，隐藏复杂的内部层级。
 */
export declare class NebulaRealtimePlugin {
    private config;
    private handler;
    /**
     * 插件实例化
     * @param config 核心配置
     */
    constructor(config: NebulaConfig);
    /**
     * 被宿主项目 Worker 调用
     */
    handleRequest(request: Request, env: Env): Promise<Response>;
}
//# sourceMappingURL=plugin.d.ts.map