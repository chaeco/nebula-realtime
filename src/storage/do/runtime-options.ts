import { DurableRuntimeConfig } from './types.js';

/**
 * Resolves runtime options from request headers merged with current defaults.
 * 从请求头解析并合并运行参数（基于当前默认值）。
 *
 * @param request - Forwarded room request / 转发到房间的请求。
 * @param current - Current config snapshot / 当前配置快照。
 * @returns Resolved runtime config / 本次请求解析后的运行参数。
 */
export const resolveRuntimeConfig = (
  request: Request,
  current: DurableRuntimeConfig
): DurableRuntimeConfig => ({
  roomId: request.headers.get('x-nebula-room-id') || current.roomId,
  historyLimit: parseIntHeader(request, 'x-nebula-history-limit', current.historyLimit, 1, 1000),
  maxEventNameLength: parseIntHeader(
    request,
    'x-nebula-message-max-event-length',
    current.maxEventNameLength,
    8,
    256
  ),
  maxPayloadBytes: parseIntHeader(
    request,
    'x-nebula-message-max-payload-bytes',
    current.maxPayloadBytes,
    256,
    256 * 1024
  ),
  heartbeatIntervalMs: parseIntHeader(
    request,
    'x-nebula-heartbeat-interval-ms',
    current.heartbeatIntervalMs,
    1_000,
    120_000
  ),
  heartbeatTimeoutMs: parseIntHeader(
    request,
    'x-nebula-heartbeat-timeout-ms',
    current.heartbeatTimeoutMs,
    5_000,
    300_000
  ),
  protocolVersion: request.headers.get('x-nebula-protocol-version') || current.protocolVersion,
  rateLimitPerSecond: parseIntHeader(
    request,
    'x-nebula-rate-limit-second',
    current.rateLimitPerSecond,
    1,
    500
  ),
  rateLimitPerMinute: parseIntHeader(
    request,
    'x-nebula-rate-limit-minute',
    current.rateLimitPerMinute,
    10,
    5000
  ),
  structuredLogs: parseBooleanHeader(request, 'x-nebula-structured-logs', current.structuredLogs),
  historyChunkSize: current.historyChunkSize
});

/**
 * Builds server ping/pong envelope.
 * 构建服务端 ping/pong 系统包。
 *
 * @param roomId - Room id / 房间 ID。
 * @param protocolVersion - Protocol version marker / 协议版本标记。
 * @param timestamp - Event timestamp string / 时间戳字符串。
 * @param event - System event name / 系统事件名。
 * @returns Serializable envelope object / 可序列化系统包对象。
 */
export const buildSystemEnvelope = (
  roomId: string,
  protocolVersion: string,
  timestamp: string,
  event: 'server.ping' | 'server.pong'
): Record<string, string> => ({
  type: 'system',
  event,
  roomId,
  protocolVersion,
  timestamp
});

const parseIntHeader = (
  request: Request,
  name: string,
  fallback: number,
  min: number,
  max: number
): number => {
  // Clamp numeric runtime options to avoid pathological values.
  // 对数值参数进行范围钳制，避免异常输入影响稳定性。
  const raw = Number.parseInt(request.headers.get(name) || '', 10);
  if (!Number.isFinite(raw)) return fallback;
  return Math.max(min, Math.min(raw, max));
};

const parseBooleanHeader = (request: Request, name: string, fallback: boolean): boolean => {
  const raw = request.headers.get(name);
  if (raw === null) return fallback;
  return raw !== 'false' && raw !== '0';
};
