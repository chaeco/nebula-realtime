import { ConnectionMeta, LeaveMeta } from './types.js';

interface AdminContext {
  roomId: string;
  protocolVersion: string;
  connections: Map<WebSocket, ConnectionMeta>;
  disconnect: (ws: WebSocket, leaveMeta: LeaveMeta) => Promise<void>;
  onDisbandLog: (data: { disconnected: number; reason: string; code: number }) => void;
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
export const handleAdminCountRequest = (request: Request, context: AdminContext): Response => {
  if (request.method !== 'GET') {
    return Response.json({ error: 'method_not_allowed', message: '请使用 GET' }, { status: 405 });
  }
  context.onAdminAudit({
    action: 'count',
    actor: resolveActor(request),
    operationId: request.headers.get('x-nebula-admin-operation-id'),
    remainingConnections: context.connections.size
  });
  const users = [...new Set([...context.connections.values()].map((item) => item.userId))];
  return Response.json({
    status: 'ok',
    roomId: context.roomId,
    protocolVersion: context.protocolVersion,
    connections: context.connections.size,
    users
  });
};

/**
 * Handle `/admin/remove-users` request.
 * 处理 `/admin/remove-users` 请求。
 */
export const handleAdminRemoveUsersRequest = async (request: Request, context: AdminContext): Promise<Response> => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed', message: '请使用 POST' }, { status: 405 });
  }
  const body = await safeParseJson(request);
  if (!body || typeof body !== 'object') {
    return Response.json({ error: 'invalid_json', message: 'body 必须是 JSON 对象' }, { status: 400 });
  }

  const userIds = resolveTargetUserIds(body);
  if (userIds.size === 0) {
    return Response.json({ error: 'invalid_target', message: '请提供非空 userIds 数组' }, { status: 400 });
  }

  const adminReason = typeof (body as { reason?: unknown }).reason === 'string'
    ? (body as { reason: string }).reason.trim()
    : 'removed by admin';
  const closeCode = Number.isFinite((body as { code?: unknown }).code)
    ? Number((body as { code: number }).code)
    : 4003;

  const removedUsers = new Set<string>();
  let removedConnections = 0;
  for (const [ws, meta] of context.connections.entries()) {
    if (!userIds.has(meta.userId)) {
      continue;
    }
    removedUsers.add(meta.userId);
    removedConnections += 1;
    try {
      ws.close(closeCode, adminReason);
    } catch {}
    await context.disconnect(ws, { reason: 'removed', code: closeCode, detail: adminReason });
  }

  context.onAdminAudit({
    action: 'remove-users',
    actor: resolveActor(request),
    operationId: request.headers.get('x-nebula-admin-operation-id'),
    targets: [...userIds],
    affectedConnections: removedConnections,
    remainingConnections: context.connections.size
  });

  return Response.json({
    status: 'ok',
    roomId: context.roomId,
    removedUsers: [...removedUsers],
    removedConnections,
    remainingConnections: context.connections.size
  });
};

/**
 * Handle `/admin/disband` request.
 * 处理 `/admin/disband` 请求。
 */
export const handleAdminDisbandRequest = async (request: Request, context: AdminContext): Promise<Response> => {
  if (request.method !== 'POST') {
    return Response.json({ error: 'method_not_allowed', message: '请使用 POST' }, { status: 405 });
  }
  const body = (await safeParseJson(request)) as { reason?: unknown; code?: unknown } | null;
  const reason = typeof body?.reason === 'string' && body.reason.trim() ? body.reason.trim() : 'room disbanded by admin';
  const closeCode = Number.isFinite(body?.code) ? Number(body?.code) : 4004;

  let disconnected = 0;
  for (const [ws] of [...context.connections.entries()]) {
    disconnected += 1;
    try {
      ws.close(closeCode, reason);
    } catch {}
    await context.disconnect(ws, { reason: 'disbanded', code: closeCode, detail: reason });
  }

  context.onDisbandLog({ disconnected, reason, code: closeCode });
  context.onAdminAudit({
    action: 'disband',
    actor: resolveActor(request),
    operationId: request.headers.get('x-nebula-admin-operation-id'),
    affectedConnections: disconnected,
    remainingConnections: context.connections.size
  });
  return Response.json({
    status: 'ok',
    roomId: context.roomId,
    disconnected,
    remainingConnections: context.connections.size
  });
};

const resolveActor = (request: Request): string => {
  return request.headers.get('x-nebula-user-id') || 'unknown-admin';
};

const resolveTargetUserIds = (body: object): Set<string> => {
  const userIds = new Set<string>();
  const many = (body as { userIds?: unknown }).userIds;
  if (Array.isArray(many)) {
    for (const item of many) {
      if (typeof item === 'string' && item.trim()) {
        userIds.add(item.trim());
      }
    }
  }
  return userIds;
};

const safeParseJson = async (request: Request): Promise<unknown | null> => {
  try {
    return await request.json();
  } catch {
    return null;
  }
};
