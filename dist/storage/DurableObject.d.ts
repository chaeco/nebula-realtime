import { Env } from '../types/index.js';
/**
 * NebulaDurableObject (存储与计算层)
 * @description 核心持久化与状态协调层。
 * 负责单一实体的数据一致性和并发处理。
 */
export declare class NebulaDurableObject implements DurableObject {
    private state;
    private env;
    private startTime;
    constructor(state: DurableObjectState, env: Env);
    /**
     * 被核心管理器/处理器调用
     */
    fetch(request: Request): Promise<Response>;
}
//# sourceMappingURL=DurableObject.d.ts.map