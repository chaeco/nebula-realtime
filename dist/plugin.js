import dayjs from 'dayjs';
/**
 * NebulaRealtimePlugin
 * @description 暴露给宿主项目的插件类。
 * 宿主项目应在 Worker 中实例化此插件并将其请求转发至此。
 */
export class NebulaRealtimePlugin {
    config;
    startTime;
    /**
     * 构造函数
     * @param config 插件配置
     */
    constructor(config) {
        this.config = config;
        this.startTime = dayjs().format('YYYY-MM-DD HH:mm:ss');
    }
    /**
     * 处理进入插件的请求
     * @param request 请求对象
     * @param env 环境变量（包含 DO 绑定）
     */
    async handleRequest(request, env) {
        const url = new URL(request.url);
        // 示例：将逻辑转发给 Durable Object
        if (url.pathname.startsWith('/realtime')) {
            const id = env.NEBULA_DO.idFromName(this.config.name);
            const obj = env.NEBULA_DO.get(id);
            return obj.fetch(request);
        }
        return new Response(`[${this.startTime}] Nebula Realtime Plugin "${this.config.name}" is active.`);
    }
}
/**
 * NebulaDurableObject
 * @description 供宿主项目引用的 Durable Object 类。
 * 宿主项目必须在 wrangler.toml 中导出此枚举类。
 */
export class NebulaDurableObject {
    state;
    env;
    constructor(state, env) {
        this.state = state;
        this.env = env;
    }
    async fetch(request) {
        const value = (await this.state.storage.get('counter')) || 0;
        const newValue = value + 1;
        await this.state.storage.put('counter', newValue);
        return new Response(`Durable Object Storage Counter: ${newValue}`);
    }
}
//# sourceMappingURL=plugin.js.map