import {
  NebulaClientEventMap,
  NebulaClientOptions,
  NebulaClientState,
  NebulaQueuedMessage,
  NebulaServerEvent
} from './types.js';
import { EventHandler, TypedEventBus } from './events/event-bus.js';
import { defaultClientOptions, resolveDefaultOption, type DefaultOptionKey } from './config/default-options.js';
import { publishEvent, fetchJsonOrThrow } from './transport/http-api.js';
import { parseMessageData } from './protocol/message-parser.js';
import { enqueueMessage, flushQueuedMessages } from './transport/outbox.js';
import { calcReconnectDelay } from './reconnect/policy.js';
import { buildHttpUrl, buildWsUrl } from './transport/url.js';

type EventMap<TEvent extends NebulaServerEvent> = NebulaClientEventMap<TEvent>;

/**
 * Room-scoped Nebula client implementation.
 * 单房间 Nebula 客户端实现。
 */
export class NebulaRoomClient<TEvent extends NebulaServerEvent = NebulaServerEvent> {
  private ws: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectAttempts = 0;
  private queuedMessages: NebulaQueuedMessage[] = [];
  private bus = new TypedEventBus<EventMap<TEvent>>();
  private state: NebulaClientState = 'idle';
  private lastServerActivityAt = 0;
  private explicitClose = false;

  /**
   * @param options Client runtime options. 客户端运行时配置。
   */
  constructor(protected readonly options: NebulaClientOptions) {}

  /** Connect to websocket. 连接 WebSocket。 */
  connect(): void {
    this.clearReconnectTimer();
    this.explicitClose = false;
    this.transitionTo(this.state === 'open' ? 'open' : this.reconnectAttempts > 0 ? 'reconnecting' : 'connecting');

    this.ws = new WebSocket(buildWsUrl(this.roomScopedOptions()));
    this.ws.onopen = () => this.onOpen();
    this.ws.onmessage = (ev) => this.onMessage(ev);
    this.ws.onerror = (err) => this.emit('error', err);
    this.ws.onclose = (ev) => this.onClose(ev);
  }

  /** Disconnect websocket. 断开 WebSocket。 */
  disconnect(): void {
    this.explicitClose = true;
    this.clearReconnectTimer();
    this.stopHeartbeatWatchdog();
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.transitionTo('closed');
  }

  /** Get state. 获取状态。 */
  getState(): NebulaClientState {
    return this.state;
  }

  /** Send websocket message. 发送 WebSocket 消息。 */
  send(event: string, payload: unknown): void {
    const message = { event, payload };
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
      return;
    }
    if (!this.withDefault('queueMessagesWhenDisconnected')) {
      throw new Error('WebSocket is not open');
    }
    enqueueMessage(this.queuedMessages, message, this.withDefault('maxQueuedMessages'));
  }

  /** Publish via HTTP API. 通过 HTTP API 发布。 */
  publish(event: string, payload: unknown, idempotencyKey?: string): Promise<unknown> {
    return publishEvent(this.roomScopedOptions(), event, payload, idempotencyKey);
  }

  /** Fetch presence. 获取在线状态。 */
  fetchPresence(): Promise<unknown> {
    return fetchJsonOrThrow(buildHttpUrl(this.roomScopedOptions(), 'presence'));
  }

  /** Fetch history. 获取历史消息。 */
  fetchHistory(limit = 50): Promise<unknown> {
    return fetchJsonOrThrow(`${buildHttpUrl(this.roomScopedOptions(), 'history')}?limit=${limit}`);
  }

  /** Fetch stats. 获取统计信息。 */
  fetchStats(): Promise<unknown> {
    return fetchJsonOrThrow(buildHttpUrl(this.roomScopedOptions(), 'stats'));
  }

  /** Subscribe event. 订阅事件。 */
  on<K extends keyof EventMap<TEvent>>(name: K, handler: EventHandler<EventMap<TEvent>[K]>): () => void {
    return this.bus.on(name, handler);
  }

  /** Unsubscribe event. 取消事件订阅。 */
  off<K extends keyof EventMap<TEvent>>(name: K, handler: EventHandler<EventMap<TEvent>[K]>): void {
    this.bus.off(name, handler);
  }

  /** Ensure room id exists. 确保存在 roomId。 */
  protected requireRoomId(): string {
    if (!this.options.roomId) {
      throw new Error('roomId is required for room-scoped operations');
    }
    return this.options.roomId;
  }

  /** Resolve room-scoped options. 解析房间级配置。 */
  protected roomScopedOptions(): NebulaClientOptions & { roomId: string } {
    return { ...this.options, roomId: this.requireRoomId() };
  }

  private onOpen(): void {
    this.lastServerActivityAt = Date.now();
    this.reconnectAttempts = 0;
    this.transitionTo('open');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      flushQueuedMessages(this.ws, this.queuedMessages);
    }
    this.startHeartbeatWatchdog();
    this.emit('open', { roomId: this.requireRoomId() });
  }

  private onMessage(ev: MessageEvent): void {
    this.lastServerActivityAt = Date.now();
    const event = parseMessageData(ev.data) as TEvent;
    this.emit('message', event);
    if (this.withDefault('autoPong') && event?.event === 'server.ping') {
      this.send('client.pong', null);
    }
  }

  private onClose(ev: CloseEvent): void {
    this.stopHeartbeatWatchdog();
    this.ws = null;
    this.emit('close', { roomId: this.requireRoomId(), code: ev.code, reason: ev.reason || undefined });
    if (this.explicitClose || !this.withDefault('reconnect')) {
      this.transitionTo('closed');
      return;
    }
    this.scheduleReconnect();
  }

  private scheduleReconnect(): void {
    const maxAttempts = this.options.reconnectMaxAttempts;
    if (typeof maxAttempts === 'number' && this.reconnectAttempts >= maxAttempts) {
      this.transitionTo('closed');
      this.emit('reconnect_giveup', { attempt: this.reconnectAttempts });
      return;
    }

    const delayMs = calcReconnectDelay(
      this.reconnectAttempts,
      this.withDefault('reconnectBaseDelayMs'),
      this.withDefault('reconnectMaxDelayMs'),
      this.withDefault('reconnectJitterRatio')
    );
    this.reconnectAttempts += 1;
    this.transitionTo('reconnecting');
    this.emit('reconnect_scheduled', { attempt: this.reconnectAttempts, delayMs });
    this.reconnectTimer = setTimeout(() => this.connect(), delayMs);
  }

  private startHeartbeatWatchdog(): void {
    this.stopHeartbeatWatchdog();
    this.heartbeatTimer = setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;
      const timeoutMs = this.withDefault('heartbeatTimeoutMs');
      if (Date.now() - this.lastServerActivityAt > timeoutMs) {
        this.emit('heartbeat_timeout', { timeoutMs });
        this.ws.close(1001, 'heartbeat timeout');
      }
    }, this.withDefault('heartbeatCheckIntervalMs'));
  }

  private stopHeartbeatWatchdog(): void {
    if (!this.heartbeatTimer) return;
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private withDefault<K extends DefaultOptionKey>(key: K): (typeof defaultClientOptions)[K] {
    return resolveDefaultOption(this.options, key);
  }

  private transitionTo(next: NebulaClientState): void {
    if (this.state === next) return;
    const prev = this.state;
    this.state = next;
    this.emit('state', { prev, next });
  }

  private clearReconnectTimer(): void {
    if (!this.reconnectTimer) return;
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
  }

  private emit<K extends keyof EventMap<TEvent>>(name: K, payload: EventMap<TEvent>[K]): void {
    if (this.withDefault('debug')) {
      console.debug('[NebulaClient]', name, payload);
    }
    this.bus.emit(name, payload);
  }
}
