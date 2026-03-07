import { NebulaRoomClient } from './room-client.js';
/**
 * Unified Nebula client with single-room + multi-room capabilities.
 * 统一 Nebula 客户端：同时支持单房间与多房间能力。
 */
export class NebulaClient extends NebulaRoomClient {
    roomClients = new Map();
    /**
     * @param options Client runtime options. 客户端运行时配置。
     */
    constructor(options) {
        super(options);
    }
    /**
     * Join one room and connect websocket.
     * 加入单个房间并建立 WebSocket 连接。
     */
    joinRoom(roomId) {
        if (this.options.roomId === roomId) {
            const state = this.getState();
            if (state === 'idle' || state === 'closed') {
                this.connect();
            }
            return this;
        }
        const existing = this.roomClients.get(roomId);
        if (existing)
            return existing;
        const client = new NebulaClient({ ...this.options, roomId });
        client.connect();
        this.roomClients.set(roomId, client);
        return client;
    }
    /**
     * Leave one room and disconnect websocket.
     * 离开单个房间并断开 WebSocket 连接。
     */
    leaveRoom(roomId) {
        if (this.options.roomId === roomId) {
            this.disconnect();
            return true;
        }
        const client = this.roomClients.get(roomId);
        if (!client)
            return false;
        client.disconnect();
        this.roomClients.delete(roomId);
        return true;
    }
    /**
     * Get all currently joined room ids.
     * 获取当前已加入的全部房间 ID。
     */
    getJoinedRooms() {
        const joined = [...this.roomClients.keys()];
        if (this.options.roomId && this.getState() !== 'idle' && this.getState() !== 'closed') {
            joined.unshift(this.options.roomId);
        }
        return joined;
    }
    /**
     * Leave multiple rooms in batch.
     * 批量离开多个房间。
     */
    leaveRooms(roomIds) {
        const left = [];
        for (const roomId of roomIds) {
            if (this.leaveRoom(roomId)) {
                left.push(roomId);
            }
        }
        return left;
    }
    /**
     * Leave all joined rooms.
     * 离开当前已加入的所有房间。
     */
    leaveAllRooms() {
        return this.leaveRooms(this.getJoinedRooms());
    }
    /**
     * Get joined room client by id.
     * 根据房间 ID 获取已加入的客户端。
     */
    getRoomClient(roomId) {
        if (this.options.roomId === roomId)
            return this;
        return this.roomClients.get(roomId);
    }
    /**
     * Fetch room presence payload via HTTP API.
     * 通过 HTTP API 获取房间在线信息。
     */
    async getRoomPresence(roomId) {
        const joinedClient = this.getRoomClient(roomId);
        if (joinedClient) {
            return joinedClient.fetchPresence();
        }
        return new NebulaClient({ ...this.options, roomId }).fetchPresence();
    }
    /**
     * Get room online connection count.
     * 获取房间在线连接人数（连接数）。
     */
    async getRoomCount(roomId) {
        const presence = await this.getRoomPresence(roomId);
        return parseConnectionsFromPresence(presence);
    }
    /**
     * Batch query room online connection count.
     * 批量查询房间在线连接人数。
     */
    async getRoomCounts(roomIds) {
        const entries = await Promise.all(roomIds.map(async (roomId) => [roomId, await this.getRoomCount(roomId)]));
        return Object.fromEntries(entries);
    }
}
const parseConnectionsFromPresence = (presence) => {
    if (!presence || typeof presence !== 'object') {
        throw new Error('invalid presence response');
    }
    const raw = presence.connections;
    if (typeof raw !== 'number' || !Number.isFinite(raw) || raw < 0) {
        throw new Error('invalid presence.connections');
    }
    return raw;
};
//# sourceMappingURL=client.js.map