import { NebulaMessageConfig } from '../types/index.js';
/**
 * Formats time with a fixed server-side pattern.
 * 使用固定服务端格式格式化时间。
 *
 * @param date - Optional date input / 可选日期输入，默认当前时间。
 * @returns Formatted timestamp string (`YYYY-MM-DD HH:mm:ss`) / 格式化后的时间字符串。
 */
export declare const formatTime: (date?: Date) => string;
/**
 * Parses URL string into URL object.
 * 将 URL 字符串解析为 URL 对象。
 *
 * @param url - Absolute request URL string / 绝对 URL 字符串。
 * @returns Parsed URL object / 解析后的 URL 对象。
 */
export declare const parseRoute: (url: string) => URL;
/**
 * Resolves user identity from request context.
 * 从请求上下文解析用户身份。
 *
 * @param request - Incoming request / 进入插件的请求。
 * @returns User id from header/query, or `null` when absent / 从请求头、查询参数解析 userId，缺失时返回 `null`。
 */
export declare const resolveUserId: (request: Request) => string | null;
/**
 * Validates event name and payload size constraints.
 * 校验事件名与 payload 体积约束。
 *
 * @param input - Message candidate / 待校验消息。
 * @param config - Validation constraints / 校验约束配置。
 * @returns `null` if valid; otherwise error message / 合法返回 `null`，否则返回错误信息。
 */
export declare const validateMessageInput: (input: {
    event?: string;
    payload?: unknown;
}, config?: NebulaMessageConfig) => string | null;
//# sourceMappingURL=index.d.ts.map