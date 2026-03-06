import { NebulaHandler } from '../handler/handler.js';
/**
 * NebulaRealtimePlugin (应用/外观层)
 * @description 外观模式 (Facade Pattern)。
 * 提供给宿主项目的简单统一入口，隐藏复杂的内部层级。
 */
export class NebulaRealtimePlugin {
    config;
    handler;
    /**
     * 插件实例化
     * @param config 核心配置
     */
    constructor(config) {
        this.config = config;
        this.handler = new NebulaHandler(this.config);
    }
    /**
     * 被宿主项目 Worker 调用
     */
    async handleRequest(request, env) {
        return this.handler.handle(request, env);
    }
}
//# sourceMappingURL=plugin.js.map