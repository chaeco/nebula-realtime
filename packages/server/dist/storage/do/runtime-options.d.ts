import { DurableRuntimeConfig } from './types.js';
/**
 * Resolves runtime options from request headers merged with current defaults.
 * 从请求头解析并合并运行参数（基于当前默认值）。
 *
 * @param request - Forwarded room request / 转发到房间的请求。
 * @param current - Current config snapshot / 当前配置快照。
 * @returns Resolved runtime config / 本次请求解析后的运行参数。
 */
export declare const resolveRuntimeConfig: (request: Request, current: DurableRuntimeConfig) => DurableRuntimeConfig;
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
export declare const buildSystemEnvelope: (roomId: string, protocolVersion: string, timestamp: string, event: "server.ping" | "server.pong") => Record<string, string>;
//# sourceMappingURL=runtime-options.d.ts.map