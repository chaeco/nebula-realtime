import { TypedEventBus } from './events/event-bus.js';
import { resolveDefaultOption } from './config/default-options.js';
import { publishEvent, fetchJsonOrThrow } from './transport/http-api.js';
import { parseMessageData } from './protocol/message-parser.js';
import { enqueueMessage, flushQueuedMessages } from './transport/outbox.js';
import { calcReconnectDelay } from './reconnect/policy.js';
import { buildHttpUrl, buildWsUrl } from './transport/url.js';
/**
 * Room-scoped Nebula client implementation.
 * 单房间 Nebula 客户端实现。
 */
export class NebulaRoomClient {
    options;
    ws = null;
    reconnectTimer = null;
    heartbeatTimer = null;
    reconnectAttempts = 0;
    queuedMessages = [];
    bus = new TypedEventBus();
    state = 'idle';
    lastServerActivityAt = 0;
    explicitClose = false;
    /**
     * @param options Client runtime options. 客户端运行时配置。
     */
    constructor(options) {
        this.options = options;
    }
    /** Connect to websocket. 连接 WebSocket。 */
    connect() {
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
    disconnect() {
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
    getState() {
        return this.state;
    }
    /** Send websocket message. 发送 WebSocket 消息。 */
    send(event, payload) {
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
    publish(event, payload, idempotencyKey) {
        return publishEvent(this.roomScopedOptions(), event, payload, idempotencyKey);
    }
    /** Fetch presence. 获取在线状态。 */
    fetchPresence() {
        return fetchJsonOrThrow(buildHttpUrl(this.roomScopedOptions(), 'presence'));
    }
    /** Fetch history. 获取历史消息。 */
    fetchHistory(limit = 50) {
        return fetchJsonOrThrow(`${buildHttpUrl(this.roomScopedOptions(), 'history')}?limit=${limit}`);
    }
    /** Fetch stats. 获取统计信息。 */
    fetchStats() {
        return fetchJsonOrThrow(buildHttpUrl(this.roomScopedOptions(), 'stats'));
    }
    /** Subscribe event. 订阅事件。 */
    on(name, handler) {
        return this.bus.on(name, handler);
    }
    /** Unsubscribe event. 取消事件订阅。 */
    off(name, handler) {
        this.bus.off(name, handler);
    }
    /** Ensure room id exists. 确保存在 roomId。 */
    requireRoomId() {
        if (!this.options.roomId) {
            throw new Error('roomId is required for room-scoped operations');
        }
        return this.options.roomId;
    }
    /** Resolve room-scoped options. 解析房间级配置。 */
    roomScopedOptions() {
        return { ...this.options, roomId: this.requireRoomId() };
    }
    onOpen() {
        this.lastServerActivityAt = Date.now();
        this.reconnectAttempts = 0;
        this.transitionTo('open');
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            flushQueuedMessages(this.ws, this.queuedMessages);
        }
        this.startHeartbeatWatchdog();
        this.emit('open', { roomId: this.requireRoomId() });
    }
    onMessage(ev) {
        this.lastServerActivityAt = Date.now();
        const event = parseMessageData(ev.data);
        this.emit('message', event);
        if (this.withDefault('autoPong') && event?.event === 'server.ping') {
            this.send('client.pong', null);
        }
    }
    onClose(ev) {
        this.stopHeartbeatWatchdog();
        this.ws = null;
        this.emit('close', { roomId: this.requireRoomId(), code: ev.code, reason: ev.reason || undefined });
        if (this.explicitClose || !this.withDefault('reconnect')) {
            this.transitionTo('closed');
            return;
        }
        this.scheduleReconnect();
    }
    scheduleReconnect() {
        const maxAttempts = this.options.reconnectMaxAttempts;
        if (typeof maxAttempts === 'number' && this.reconnectAttempts >= maxAttempts) {
            this.transitionTo('closed');
            this.emit('reconnect_giveup', { attempt: this.reconnectAttempts });
            return;
        }
        const delayMs = calcReconnectDelay(this.reconnectAttempts, this.withDefault('reconnectBaseDelayMs'), this.withDefault('reconnectMaxDelayMs'), this.withDefault('reconnectJitterRatio'));
        this.reconnectAttempts += 1;
        this.transitionTo('reconnecting');
        this.emit('reconnect_scheduled', { attempt: this.reconnectAttempts, delayMs });
        this.reconnectTimer = setTimeout(() => this.connect(), delayMs);
    }
    startHeartbeatWatchdog() {
        this.stopHeartbeatWatchdog();
        this.heartbeatTimer = setInterval(() => {
            if (!this.ws || this.ws.readyState !== WebSocket.OPEN)
                return;
            const timeoutMs = this.withDefault('heartbeatTimeoutMs');
            if (Date.now() - this.lastServerActivityAt > timeoutMs) {
                this.emit('heartbeat_timeout', { timeoutMs });
                this.ws.close(1001, 'heartbeat timeout');
            }
        }, this.withDefault('heartbeatCheckIntervalMs'));
    }
    stopHeartbeatWatchdog() {
        if (!this.heartbeatTimer)
            return;
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = null;
    }
    withDefault(key) {
        return resolveDefaultOption(this.options, key);
    }
    transitionTo(next) {
        if (this.state === next)
            return;
        const prev = this.state;
        this.state = next;
        this.emit('state', { prev, next });
    }
    clearReconnectTimer() {
        if (!this.reconnectTimer)
            return;
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
    }
    emit(name, payload) {
        if (this.withDefault('debug')) {
            console.debug('[NebulaClient]', name, payload);
        }
        this.bus.emit(name, payload);
    }
}
//# sourceMappingURL=room-client.js.map