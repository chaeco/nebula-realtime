import { ConnectionMeta, LeaveMeta } from './types.js';
interface AdminContext {
    roomId: string;
    protocolVersion: string;
    connections: Map<WebSocket, ConnectionMeta>;
    disconnect: (ws: WebSocket, leaveMeta: LeaveMeta) => Promise<void>;
    onDisbandLog: (data: {
        disconnected: number;
        reason: string;
        code: number;
    }) => void;
    onAdminAudit: (data: {
        action: 'count' | 'remove-users' | 'disband';
        actor: string;
        operationId: string | null;
        targets?: string[];
        affectedConnections?: number;
        remainingConnections: number;
    }) => void;
}
/**
 * Handle `/admin/count` request.
 * 处理 `/admin/count` 请求。
 */
export declare const handleAdminCountRequest: (request: Request, context: AdminContext) => Response;
/**
 * Handle `/admin/remove-users` request.
 * 处理 `/admin/remove-users` 请求。
 */
export declare const handleAdminRemoveUsersRequest: (request: Request, context: AdminContext) => Promise<Response>;
/**
 * Handle `/admin/disband` request.
 * 处理 `/admin/disband` 请求。
 */
export declare const handleAdminDisbandRequest: (request: Request, context: AdminContext) => Promise<Response>;
export {};
//# sourceMappingURL=admin-actions.d.ts.map