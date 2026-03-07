import { NebulaQueuedMessage } from '../types.js';
/**
 * Push message into bounded queue.
 * 将消息压入有界队列。
 *
 * @param queue Mutable queue array. 可变消息队列。
 * @param message Message to enqueue. 待入队消息。
 * @param maxSize Maximum queue size. 队列最大容量。
 */
export declare const enqueueMessage: (queue: NebulaQueuedMessage[], message: NebulaQueuedMessage, maxSize: number) => void;
/**
 * Flush queued messages into open websocket.
 * 将队列中的消息批量发送到已打开的 WebSocket。
 *
 * @param ws WebSocket instance. WebSocket 实例。
 * @param queue Mutable queue array. 可变消息队列。
 */
export declare const flushQueuedMessages: (ws: WebSocket, queue: NebulaQueuedMessage[]) => void;
//# sourceMappingURL=outbox.d.ts.map