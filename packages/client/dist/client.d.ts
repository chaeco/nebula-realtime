import { NebulaRoomClient } from './room-client.js';
import { NebulaClientOptions, NebulaServerEvent } from './types.js';
/**
 * Unified Nebula client with single-room + multi-room capabilities.
 * 统一 Nebula 客户端：同时支持单房间与多房间能力。
 */
export declare class NebulaClient<TEvent extends NebulaServerEvent = NebulaServerEvent> extends NebulaRoomClient<TEvent> {
    private roomClients;
    /**
     * @param options Client runtime options. 客户端运行时配置。
     */
    constructor(options: NebulaClientOptions);
    /**
     * Join one room and connect websocket.
     * 加入单个房间并建立 WebSocket 连接。
     */
    joinRoom(roomId: string): NebulaClient<TEvent>;
    /**
     * Leave one room and disconnect websocket.
     * 离开单个房间并断开 WebSocket 连接。
     */
    leaveRoom(roomId: string): boolean;
    /**
     * Get all currently joined room ids.
     * 获取当前已加入的全部房间 ID。
     */
    getJoinedRooms(): string[];
    /**
     * Leave multiple rooms in batch.
     * 批量离开多个房间。
     */
    leaveRooms(roomIds: string[]): string[];
    /**
     * Leave all joined rooms.
     * 离开当前已加入的所有房间。
     */
    leaveAllRooms(): string[];
    /**
     * Get joined room client by id.
     * 根据房间 ID 获取已加入的客户端。
     */
    getRoomClient(roomId: string): NebulaClient<TEvent> | undefined;
    /**
     * Fetch room presence payload via HTTP API.
     * 通过 HTTP API 获取房间在线信息。
     */
    getRoomPresence(roomId: string): Promise<unknown>;
    /**
     * Get room online connection count.
     * 获取房间在线连接人数（连接数）。
     */
    getRoomCount(roomId: string): Promise<number>;
    /**
     * Batch query room online connection count.
     * 批量查询房间在线连接人数。
     */
    getRoomCounts(roomIds: string[]): Promise<Record<string, number>>;
}
//# sourceMappingURL=client.d.ts.map