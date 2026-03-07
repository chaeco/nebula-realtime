/**
 * Push message into bounded queue.
 * 将消息压入有界队列。
 *
 * @param queue Mutable queue array. 可变消息队列。
 * @param message Message to enqueue. 待入队消息。
 * @param maxSize Maximum queue size. 队列最大容量。
 */
export const enqueueMessage = (queue, message, maxSize) => {
    if (queue.length >= maxSize) {
        queue.shift();
    }
    queue.push(message);
};
/**
 * Flush queued messages into open websocket.
 * 将队列中的消息批量发送到已打开的 WebSocket。
 *
 * @param ws WebSocket instance. WebSocket 实例。
 * @param queue Mutable queue array. 可变消息队列。
 */
export const flushQueuedMessages = (ws, queue) => {
    while (queue.length > 0) {
        const next = queue.shift();
        if (!next) {
            break;
        }
        ws.send(JSON.stringify(next));
    }
};
//# sourceMappingURL=outbox.js.map