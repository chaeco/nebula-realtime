import { formatTime } from '../utils/index.js';
/**
 * NebulaDurableObject (存储与计算层)
 * @description 核心持久化与状态协调层。
 * 负责单一实体的数据一致性和并发处理。
 */
export class NebulaDurableObject {
    state;
    env;
    startTime;
    constructor(state, env) {
        this.state = state;
        this.env = env;
        this.startTime = formatTime();
    }
    /**
     * 被核心管理器/处理器调用
     */
    async fetch(request) {
        // 逻辑委托给专门的计算层，这里执行简单的存储操作
        const value = (await this.state.storage.get('counter')) || 0;
        const newValue = value + 1;
        await this.state.storage.put('counter', newValue);
        return new Response(JSON.stringify({
            status: 'success',
            instance: this.startTime,
            counter: newValue
        }), {
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
//# sourceMappingURL=DurableObject.js.map