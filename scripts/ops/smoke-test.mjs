#!/usr/bin/env node

/**
 * Smoke test against deployed realtime service.
 * 对已部署实时服务执行冒烟测试。
 */

const baseUrl = process.env.TARGET_BASE_URL;
const routePrefix = process.env.ROUTE_PREFIX || '/realtime';
const roomId = process.env.SMOKE_ROOM_ID || 'smoke-room';
const userId = process.env.SMOKE_USER_ID || 'smoke-bot';
const enableAdmin = process.env.ENABLE_ADMIN === 'true';
const adminUserId = process.env.ADMIN_USER_ID || 'admin-bot';
const adminBearer = process.env.ADMIN_BEARER || '';

if (!baseUrl) {
  console.error('[ops:smoke] TARGET_BASE_URL is required');
  process.exit(1);
}

const normalize = (s) => s.replace(/\/$/, '');
const root = normalize(baseUrl);
const prefix = routePrefix.startsWith('/') ? routePrefix : `/${routePrefix}`;
const basePath = `${root}${prefix}/rooms/${encodeURIComponent(roomId)}`;

const assertOk = async (res, hint) => {
  if (res.ok) return;
  const body = await res.text();
  throw new Error(`${hint} failed: ${res.status} ${body}`);
};

const adminHeaders = () => {
  const headers = {
    'content-type': 'application/json',
    'x-nebula-user-id': adminUserId,
    'x-nebula-admin-operation-id': `smoke-${Date.now()}`
  };
  if (adminBearer) {
    headers.authorization = `Bearer ${adminBearer}`;
  }
  return headers;
};

try {
  const health = await fetch(`${root}${prefix}/health`);
  await assertOk(health, 'health');

  const publish = await fetch(`${basePath}/messages`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-nebula-user-id': userId,
      'x-nebula-idempotency-key': `smoke-${Date.now()}`
    },
    body: JSON.stringify({
      event: 'smoke.message',
      payload: { text: 'smoke-test' }
    })
  });
  await assertOk(publish, 'publish');

  const history = await fetch(`${basePath}/history?limit=1`, {
    headers: { 'x-nebula-user-id': userId }
  });
  await assertOk(history, 'history');
  const historyBody = await history.json();
  if (!historyBody?.status || !Array.isArray(historyBody?.events)) {
    throw new Error('history payload invalid');
  }

  const presence = await fetch(`${basePath}/presence`, {
    headers: { 'x-nebula-user-id': userId }
  });
  await assertOk(presence, 'presence');

  const stats = await fetch(`${basePath}/stats`, {
    headers: { 'x-nebula-user-id': userId }
  });
  await assertOk(stats, 'stats');

  if (enableAdmin) {
    const count = await fetch(`${basePath}/admin/count`, {
      method: 'GET',
      headers: adminHeaders()
    });
    await assertOk(count, 'admin/count');

    const remove = await fetch(`${basePath}/admin/remove-users`, {
      method: 'POST',
      headers: adminHeaders(),
      body: JSON.stringify({ userIds: ['non-existing-smoke-user'], reason: 'smoke-check' })
    });
    await assertOk(remove, 'admin/remove-users');
  }

  console.log('[ops:smoke] passed', { baseUrl: root, routePrefix: prefix, roomId, enableAdmin });
} catch (error) {
  console.error('[ops:smoke] failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
