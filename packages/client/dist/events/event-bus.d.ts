/**
 * Generic handler function type.
 * 通用事件处理器函数类型。
 */
export type EventHandler<TPayload> = (payload: TPayload) => void;
/**
 * Lightweight typed event bus.
 * 轻量级强类型事件总线。
 */
export declare class TypedEventBus<TEventMap extends object> {
    private listeners;
    /**
     * Subscribe event handler and return unsubscribe function.
     * 订阅事件处理器，并返回取消订阅函数。
     */
    on<K extends keyof TEventMap>(name: K, handler: EventHandler<TEventMap[K]>): () => void;
    /**
     * Remove a subscribed event handler.
     * 移除已订阅事件处理器。
     */
    off<K extends keyof TEventMap>(name: K, handler: EventHandler<TEventMap[K]>): void;
    /**
     * Emit an event to all subscribers.
     * 向所有订阅者派发事件。
     */
    emit<K extends keyof TEventMap>(name: K, payload: TEventMap[K]): void;
}
//# sourceMappingURL=event-bus.d.ts.map