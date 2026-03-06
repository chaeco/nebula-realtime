import dayjs from 'dayjs';
/**
 * Formats time with a fixed server-side pattern.
 * 使用固定服务端格式格式化时间。
 *
 * @param date - Optional date input / 可选日期输入，默认当前时间。
 * @returns Formatted timestamp string (`YYYY-MM-DD HH:mm:ss`) / 格式化后的时间字符串。
 */
export const formatTime = (date) => {
    return dayjs(date).format('YYYY-MM-DD HH:mm:ss');
};
/**
 * Parses URL string into URL object.
 * 将 URL 字符串解析为 URL 对象。
 *
 * @param url - Absolute request URL string / 绝对 URL 字符串。
 * @returns Parsed URL object / 解析后的 URL 对象。
 */
export const parseRoute = (url) => {
    return new URL(url);
};
/**
 * Resolves user identity from request context.
 * 从请求上下文解析用户身份。
 *
 * @param request - Incoming request / 进入插件的请求。
 * @returns User id from header/query or `anonymous` / 从请求头、查询参数解析 userId，默认 `anonymous`。
 */
export const resolveUserId = (request) => {
    const byHeader = request.headers.get('x-nebula-user-id');
    if (byHeader) {
        return byHeader;
    }
    const url = parseRoute(request.url);
    return url.searchParams.get('userId') || 'anonymous';
};
/**
 * Validates event name and payload size constraints.
 * 校验事件名与 payload 体积约束。
 *
 * @param input - Message candidate / 待校验消息。
 * @param config - Validation constraints / 校验约束配置。
 * @returns `null` if valid; otherwise error message / 合法返回 `null`，否则返回错误信息。
 */
export const validateMessageInput = (input, config) => {
    const event = input.event || 'message.created';
    const maxEventNameLength = config?.maxEventNameLength ?? 64;
    const maxPayloadBytes = config?.maxPayloadBytes ?? 16 * 1024;
    if (typeof event !== 'string' || event.trim().length === 0) {
        return 'event 必须是非空字符串';
    }
    if (event.length > maxEventNameLength) {
        return `event 长度不能超过 ${maxEventNameLength}`;
    }
    try {
        const encoded = new TextEncoder().encode(JSON.stringify(input.payload ?? null));
        if (encoded.byteLength > maxPayloadBytes) {
            return `payload 体积不能超过 ${maxPayloadBytes} bytes`;
        }
    }
    catch {
        return 'payload 必须可 JSON 序列化';
    }
    return null;
};
//# sourceMappingURL=index.js.map