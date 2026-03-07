/**
 * Parse websocket message data if it is JSON string.
 * 若数据是 JSON 字符串则尝试解析。
 */
export const parseMessageData = (data: unknown): unknown => {
  if (typeof data !== 'string') {
    return data;
  }
  try {
    return JSON.parse(data);
  } catch {
    return data;
  }
};
