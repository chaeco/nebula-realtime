export declare class NebulaDurableObject implements DurableObject {
    private state;
    private startTime;
    private connections;
    private roomId;
    private historyLimit;
    private maxEventNameLength;
    private maxPayloadBytes;
    private heartbeatIntervalMs;
    private heartbeatTimeoutMs;
    private protocolVersion;
    private rateLimitPerSecond;
    private rateLimitPerMinute;
    private rateLimitDisconnectThreshold;
    private rateLimitViolationWindowMs;
    private idempotencyCacheSize;
    private idempotencyTTLSeconds;
    private structuredLogs;
    private historyChunkSize;
    private metrics;
    constructor(state: DurableObjectState);
    fetch(request: Request): Promise<Response>;
    alarm(): Promise<void>;
    webSocketMessage(ws: WebSocket, message: string | ArrayBuffer): Promise<void>;
    webSocketClose(ws: WebSocket, code?: number, reasonText?: string): Promise<void>;
    webSocketError(ws: WebSocket, error?: unknown): Promise<void>;
    private handleWebSocketUpgrade;
    private handleHttpPublish;
    private applyRuntimeOptions;
    private broadcastEvent;
    private handleDisconnect;
    private scheduleNextAlarm;
    private loadMetrics;
    private persistMetrics;
    private log;
}
//# sourceMappingURL=durable-object.d.ts.map