import { IncomingMessage } from './types.js';
/**
 * Parses websocket message payload.
 * 解析 WebSocket 消息 payload。
 *
 * @param message - WebSocket message content / WebSocket 消息内容。
 * @returns Parsed event/payload tuple / 解析后的 event+payload，非 JSON 文本将作为原始 payload 返回。
 */
export declare const parseIncomingWsPayload: (message: string | ArrayBuffer) => IncomingMessage;
/**
 * Parses and validates HTTP publish body.
 * 解析并校验 HTTP 发布消息体。
 *
 * @param request - Incoming publish request / 发布请求。
 * @param maxEventNameLength - Event name max length / 事件名最大长度。
 * @param maxPayloadBytes - Payload max serialized bytes / payload 序列化后最大字节数。
 * @returns Result with body or error response / 成功返回解析结果，失败返回错误响应。
 */
export declare const parseAndValidatePublishBody: (request: Request, maxEventNameLength: number, maxPayloadBytes: number) => Promise<{
    ok: true;
    body: {
        event?: string;
        payload?: unknown;
        senderId?: string;
    };
} | {
    ok: false;
    response: Response;
}>;
//# sourceMappingURL=parsers.d.ts.map