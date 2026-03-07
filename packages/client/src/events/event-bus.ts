/**
 * Generic handler function type.
 * 通用事件处理器函数类型。
 */
export type EventHandler<TPayload> = (payload: TPayload) => void;

/**
 * Lightweight typed event bus.
 * 轻量级强类型事件总线。
 */
export class TypedEventBus<TEventMap extends object> {
  private listeners = new Map<keyof TEventMap, Set<(payload: unknown) => void>>();

  /**
   * Subscribe event handler and return unsubscribe function.
   * 订阅事件处理器，并返回取消订阅函数。
   */
  on<K extends keyof TEventMap>(name: K, handler: EventHandler<TEventMap[K]>): () => void {
    const set = this.listeners.get(name) || new Set<(payload: unknown) => void>();
    set.add(handler as (payload: unknown) => void);
    this.listeners.set(name, set);
    return () => this.off(name, handler);
  }

  /**
   * Remove a subscribed event handler.
   * 移除已订阅事件处理器。
   */
  off<K extends keyof TEventMap>(name: K, handler: EventHandler<TEventMap[K]>): void {
    const set = this.listeners.get(name);
    if (!set) return;
    set.delete(handler as (payload: unknown) => void);
  }

  /**
   * Emit an event to all subscribers.
   * 向所有订阅者派发事件。
   */
  emit<K extends keyof TEventMap>(name: K, payload: TEventMap[K]): void {
    const set = this.listeners.get(name);
    if (!set) return;
    for (const handler of set) {
      handler(payload as unknown);
    }
  }
}
