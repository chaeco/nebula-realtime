/**
 * Lightweight typed event bus.
 * 轻量级强类型事件总线。
 */
export class TypedEventBus {
    listeners = new Map();
    /**
     * Subscribe event handler and return unsubscribe function.
     * 订阅事件处理器，并返回取消订阅函数。
     */
    on(name, handler) {
        const set = this.listeners.get(name) || new Set();
        set.add(handler);
        this.listeners.set(name, set);
        return () => this.off(name, handler);
    }
    /**
     * Remove a subscribed event handler.
     * 移除已订阅事件处理器。
     */
    off(name, handler) {
        const set = this.listeners.get(name);
        if (!set)
            return;
        set.delete(handler);
    }
    /**
     * Emit an event to all subscribers.
     * 向所有订阅者派发事件。
     */
    emit(name, payload) {
        const set = this.listeners.get(name);
        if (!set)
            return;
        for (const handler of set) {
            handler(payload);
        }
    }
}
//# sourceMappingURL=event-bus.js.map