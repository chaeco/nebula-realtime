import { formatTime, parseRoute, validateMessageInput } from '../utils/index.js';
import { appendHistoryEvent } from './do/history-store.js';
import { logStructured } from './do/observability.js';
import { parseAndValidatePublishBody, parseIncomingWsPayload } from './do/parsers.js';
import { buildHistoryResponse, buildPresenceResponse, buildStatsResponse } from './do/queries.js';
import { checkConnectionRateLimit } from './do/rate-limit.js';
import { buildSystemEnvelope, resolveRuntimeConfig } from './do/runtime-options.js';
import { DEFAULT_HISTORY_CHUNK_SIZE, createRoomEvent, defaultMetrics } from './do/types.js';
export class NebulaDurableObject {
    state;
    startTime = formatTime();
    connections = new Map();
    roomId = 'unknown-room';
    historyLimit = 100;
    maxEventNameLength = 64;
    maxPayloadBytes = 16 * 1024;
    heartbeatIntervalMs = 15_000;
    heartbeatTimeoutMs = 45_000;
    protocolVersion = 'v1';
    rateLimitPerSecond = 30;
    rateLimitPerMinute = 600;
    structuredLogs = true;
    historyChunkSize = DEFAULT_HISTORY_CHUNK_SIZE;
    metrics = defaultMetrics();
    constructor(state) {
        this.state = state;
        void this.loadMetrics();
    }
    async fetch(request) {
        const url = parseRoute(request.url);
        this.applyRuntimeOptions(resolveRuntimeConfig(request, {
            roomId: this.roomId,
            historyLimit: this.historyLimit,
            maxEventNameLength: this.maxEventNameLength,
            maxPayloadBytes: this.maxPayloadBytes,
            heartbeatIntervalMs: this.heartbeatIntervalMs,
            heartbeatTimeoutMs: this.heartbeatTimeoutMs,
            protocolVersion: this.protocolVersion,
            rateLimitPerSecond: this.rateLimitPerSecond,
            rateLimitPerMinute: this.rateLimitPerMinute,
            structuredLogs: this.structuredLogs,
            historyChunkSize: this.historyChunkSize
        }));
        switch (url.pathname) {
            case '/ws':
                return this.handleWebSocketUpgrade(request);
            case '/messages':
                return this.handleHttpPublish(request);
            case '/presence':
                return buildPresenceResponse(request, this.roomId, this.protocolVersion, this.startTime, [...new Set([...this.connections.values()].map((item) => item.userId))], this.connections.size);
            case '/history':
                return buildHistoryResponse(request, url, this.roomId, this.protocolVersion, this.historyLimit, this.state.storage);
            case '/stats':
                return buildStatsResponse(this.roomId, this.protocolVersion, this.startTime, this.connections.size, this.historyChunkSize, this.metrics, this.state.storage);
            default:
                return Response.json({ error: 'invalid_room_action', message: '支持动作: /ws, /messages, /presence, /history, /stats' }, { status: 404 });
        }
    }
    async alarm() {
        const now = Date.now();
        for (const [ws, meta] of this.connections.entries()) {
            if (now - meta.lastSeenAt > this.heartbeatTimeoutMs) {
                try {
                    ws.close(1001, 'heartbeat timeout');
                }
                catch { }
                await this.handleDisconnect(ws, { reason: 'timeout', code: 1001, detail: 'heartbeat timeout' });
                continue;
            }
            try {
                ws.send(JSON.stringify(buildSystemEnvelope(this.roomId, this.protocolVersion, formatTime(), 'server.ping')));
            }
            catch {
                await this.handleDisconnect(ws, { reason: 'error', detail: 'ping send failed' });
            }
        }
        await this.scheduleNextAlarm();
    }
    async webSocketMessage(ws, message) {
        const meta = this.connections.get(ws);
        if (!meta)
            return;
        meta.lastSeenAt = Date.now();
        this.metrics.receivedMessages += 1;
        const input = parseIncomingWsPayload(message);
        if (input.event === 'client.ping') {
            ws.send(JSON.stringify(buildSystemEnvelope(this.roomId, this.protocolVersion, formatTime(), 'server.pong')));
            return;
        }
        if (input.event === 'client.pong')
            return;
        const rateError = checkConnectionRateLimit(meta, this.rateLimitPerSecond, this.rateLimitPerMinute);
        if (rateError) {
            this.metrics.rateLimitedMessages += 1;
            this.metrics.rejectedMessages += 1;
            ws.send(JSON.stringify({ type: 'error', event: 'message.rate_limited', message: rateError }));
            await this.handleDisconnect(ws, { reason: 'rate_limit', code: 1008, detail: rateError });
            return;
        }
        const invalid = validateMessageInput({ event: input.event, payload: input.payload }, { maxEventNameLength: this.maxEventNameLength, maxPayloadBytes: this.maxPayloadBytes });
        if (invalid) {
            this.metrics.rejectedMessages += 1;
            ws.send(JSON.stringify({ type: 'error', event: 'message.invalid', message: invalid }));
            return;
        }
        const event = createRoomEvent(this.protocolVersion, this.roomId, formatTime(), 'message', input.event || 'message.created', meta.userId, input.payload);
        await appendHistoryEvent(this.state.storage, event, this.historyLimit, this.historyChunkSize);
        this.broadcastEvent(event);
        await this.persistMetrics();
    }
    async webSocketClose(ws, code, reasonText) {
        await this.handleDisconnect(ws, { reason: 'close', code, detail: reasonText });
    }
    async webSocketError(ws, error) {
        await this.handleDisconnect(ws, {
            reason: 'error',
            detail: error instanceof Error ? error.message : undefined
        });
    }
    async handleWebSocketUpgrade(request) {
        if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
            return Response.json({ error: 'websocket_required', message: '该接口仅支持 WebSocket 连接' }, { status: 426 });
        }
        const pair = new WebSocketPair();
        const [client, server] = Object.values(pair);
        const userId = request.headers.get('x-nebula-user-id') || crypto.randomUUID();
        const now = Date.now();
        this.state.acceptWebSocket(server);
        this.connections.set(server, {
            userId,
            lastSeenAt: now,
            windowSecond: Math.floor(now / 1000),
            secondCount: 0,
            windowMinute: Math.floor(now / 60_000),
            minuteCount: 0,
            sendFailures: 0
        });
        const joined = createRoomEvent(this.protocolVersion, this.roomId, formatTime(), 'system', 'user.join', userId, {
            userId,
            roomId: this.roomId,
            connectedAt: formatTime()
        });
        await appendHistoryEvent(this.state.storage, joined, this.historyLimit, this.historyChunkSize);
        this.broadcastEvent(joined);
        await this.scheduleNextAlarm();
        this.log('info', 'user.join', { userId });
        return new Response(null, { status: 101, webSocket: client });
    }
    async handleHttpPublish(request) {
        if (request.method !== 'POST')
            return Response.json({ error: 'method_not_allowed', message: '请使用 POST' }, { status: 405 });
        const parsed = await parseAndValidatePublishBody(request, this.maxEventNameLength, this.maxPayloadBytes);
        if (!parsed.ok) {
            this.metrics.rejectedMessages += 1;
            await this.persistMetrics();
            return parsed.response;
        }
        const body = parsed.body;
        const event = createRoomEvent(this.protocolVersion, this.roomId, formatTime(), 'message', body.event || 'message.created', body.senderId || request.headers.get('x-nebula-user-id') || 'http', body.payload ?? null);
        await appendHistoryEvent(this.state.storage, event, this.historyLimit, this.historyChunkSize);
        this.broadcastEvent(event);
        await this.persistMetrics();
        return Response.json({ status: 'ok', roomId: this.roomId, event });
    }
    applyRuntimeOptions(config) {
        this.roomId = config.roomId;
        this.historyLimit = config.historyLimit;
        this.maxEventNameLength = config.maxEventNameLength;
        this.maxPayloadBytes = config.maxPayloadBytes;
        this.heartbeatIntervalMs = config.heartbeatIntervalMs;
        this.heartbeatTimeoutMs = config.heartbeatTimeoutMs;
        this.protocolVersion = config.protocolVersion;
        this.rateLimitPerSecond = config.rateLimitPerSecond;
        this.rateLimitPerMinute = config.rateLimitPerMinute;
        this.structuredLogs = config.structuredLogs;
        this.historyChunkSize = config.historyChunkSize;
    }
    broadcastEvent(event) {
        const encoded = JSON.stringify(event);
        this.metrics.broadcastMessages += 1;
        for (const [ws, meta] of this.connections.entries()) {
            try {
                ws.send(encoded);
                meta.sendFailures = 0;
            }
            catch {
                meta.sendFailures += 1;
                if (meta.sendFailures >= 3) {
                    void this.handleDisconnect(ws, { reason: 'error', detail: 'broadcast repeatedly failed' });
                }
            }
        }
    }
    async handleDisconnect(ws, leaveMeta) {
        const meta = this.connections.get(ws);
        this.connections.delete(ws);
        if (!meta)
            return;
        this.metrics.disconnectsByReason[leaveMeta.reason] += 1;
        const leaveEvent = createRoomEvent(this.protocolVersion, this.roomId, formatTime(), 'system', 'user.leave', meta.userId, {
            userId: meta.userId,
            roomId: this.roomId,
            reason: leaveMeta.reason,
            code: leaveMeta.code ?? null,
            detail: leaveMeta.detail ?? null,
            disconnectedAt: formatTime()
        });
        await appendHistoryEvent(this.state.storage, leaveEvent, this.historyLimit, this.historyChunkSize);
        this.broadcastEvent(leaveEvent);
        await this.persistMetrics();
        this.log('info', 'user.leave', { userId: meta.userId, reason: leaveMeta.reason, code: leaveMeta.code ?? null });
    }
    async scheduleNextAlarm() {
        if (this.connections.size > 0)
            await this.state.storage.setAlarm(Date.now() + this.heartbeatIntervalMs);
    }
    async loadMetrics() {
        const persisted = await this.state.storage.get('stats:metrics');
        if (persisted)
            this.metrics = persisted;
    }
    async persistMetrics() {
        await this.state.storage.put('stats:metrics', this.metrics);
    }
    log(level, event, data) {
        logStructured(this.structuredLogs, level, event, this.roomId, this.protocolVersion, formatTime(), data);
    }
}
//# sourceMappingURL=durable-object.js.map