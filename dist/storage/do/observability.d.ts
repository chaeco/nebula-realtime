/**
 * Emits structured single-line JSON logs for observability pipelines.
 * 输出结构化单行 JSON 日志，便于观测系统采集。
 *
 * @param enabled - Whether logging is enabled / 是否启用日志。
 * @param level - Log level / 日志级别。
 * @param event - Event name / 事件名称。
 * @param roomId - Room id / 房间 ID。
 * @param protocolVersion - Protocol version marker / 协议版本标记。
 * @param timestamp - Log timestamp / 日志时间戳。
 * @param data - Additional fields / 附加字段。
 */
export declare const logStructured: (enabled: boolean, level: "info" | "warn" | "error", event: string, roomId: string, protocolVersion: string, timestamp: string, data: Record<string, unknown>) => void;
//# sourceMappingURL=observability.d.ts.map