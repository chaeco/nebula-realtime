import { NebulaClientEventMap, NebulaClientOptions, NebulaClientState, NebulaServerEvent } from './types.js';
import { EventHandler } from './events/event-bus.js';
type EventMap<TEvent extends NebulaServerEvent> = NebulaClientEventMap<TEvent>;
/**
 * Room-scoped Nebula client implementation.
 * 单房间 Nebula 客户端实现。
 */
export declare class NebulaRoomClient<TEvent extends NebulaServerEvent = NebulaServerEvent> {
    protected readonly options: NebulaClientOptions;
    private ws;
    private reconnectTimer;
    private heartbeatTimer;
    private reconnectAttempts;
    private queuedMessages;
    private bus;
    private state;
    private lastServerActivityAt;
    private explicitClose;
    /**
     * @param options Client runtime options. 客户端运行时配置。
     */
    constructor(options: NebulaClientOptions);
    /** Connect to websocket. 连接 WebSocket。 */
    connect(): void;
    /** Disconnect websocket. 断开 WebSocket。 */
    disconnect(): void;
    /** Get state. 获取状态。 */
    getState(): NebulaClientState;
    /** Send websocket message. 发送 WebSocket 消息。 */
    send(event: string, payload: unknown): void;
    /** Publish via HTTP API. 通过 HTTP API 发布。 */
    publish(event: string, payload: unknown, idempotencyKey?: string): Promise<unknown>;
    /** Fetch presence. 获取在线状态。 */
    fetchPresence(): Promise<unknown>;
    /** Fetch history. 获取历史消息。 */
    fetchHistory(limit?: number): Promise<unknown>;
    /** Fetch stats. 获取统计信息。 */
    fetchStats(): Promise<unknown>;
    /** Subscribe event. 订阅事件。 */
    on<K extends keyof EventMap<TEvent>>(name: K, handler: EventHandler<EventMap<TEvent>[K]>): () => void;
    /** Unsubscribe event. 取消事件订阅。 */
    off<K extends keyof EventMap<TEvent>>(name: K, handler: EventHandler<EventMap<TEvent>[K]>): void;
    /** Ensure room id exists. 确保存在 roomId。 */
    protected requireRoomId(): string;
    /** Resolve room-scoped options. 解析房间级配置。 */
    protected roomScopedOptions(): NebulaClientOptions & {
        roomId: string;
    };
    private onOpen;
    private onMessage;
    private onClose;
    private scheduleReconnect;
    private startHeartbeatWatchdog;
    private stopHeartbeatWatchdog;
    private withDefault;
    private transitionTo;
    private clearReconnectTimer;
    private emit;
}
export {};
//# sourceMappingURL=room-client.d.ts.map