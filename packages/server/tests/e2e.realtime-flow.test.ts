import { describe, expect, it, vi } from 'vitest';
import { NebulaDurableObject, NebulaRealtime } from '../src/index.js';

const createState = () => {
  const kv = new Map<string, unknown>();
  const state = {
    storage: {
      get: vi.fn(async (key: string) => kv.get(key)),
      put: vi.fn(async (key: string, value: unknown) => {
        kv.set(key, value);
      }),
      delete: vi.fn(async (key: string) => {
        kv.delete(key);
      }),
      setAlarm: vi.fn(async () => undefined)
    },
    acceptWebSocket: vi.fn()
  };
  return { kv, state };
};

const createEnv = () => {
  const instances = new Map<string, NebulaDurableObject>();
  const idFromName = vi.fn((name: string) => name);
  const get = vi.fn((id: string) => {
    let instance = instances.get(id);
    if (!instance) {
      const { state } = createState();
      instance = new NebulaDurableObject(state as unknown as DurableObjectState);
      instances.set(id, instance);
    }
    return {
      fetch: (request: Request) => instance!.fetch(request)
    };
  });
  return {
    env: {
      NEBULA_DO: {
        idFromName,
        get
      }
    } as never,
    instances,
    idFromName,
    get
  };
};

const seedConnection = (instance: NebulaDurableObject, userId: string): WebSocket => {
  const ws = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
  (instance as any).connections.set(ws, {
    userId,
    lastSeenAt: Date.now(),
    windowSecond: 0,
    secondCount: 0,
    windowMinute: 0,
    minuteCount: 0,
    sendFailures: 0,
    violationWindowStart: Date.now(),
    violationCount: 0
  });
  return ws;
};

describe('NebulaRealtime e2e flow', () => {
  it('支持消息发布与查询完整链路', async () => {
    const { env } = createEnv();
    const nebula = new NebulaRealtime({ name: 'E2E' });

    const publish = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/messages', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-nebula-user-id': 'u-1'
        },
        body: JSON.stringify({ event: 'chat.message', payload: { text: 'hello' } })
      }),
      env
    );
    expect(publish.status).toBe(200);

    const history = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/history?limit=10', {
        headers: { 'x-nebula-user-id': 'u-1' }
      }),
      env
    );
    const historyBody = (await history.json()) as { count: number; events: Array<{ event: string }> };
    expect(historyBody.count).toBe(1);
    expect(historyBody.events[0].event).toBe('chat.message');

    const presence = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/presence', {
        headers: { 'x-nebula-user-id': 'u-1' }
      }),
      env
    );
    expect(presence.status).toBe(200);

    const stats = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/stats', {
        headers: { 'x-nebula-user-id': 'u-1' }
      }),
      env
    );
    const statsBody = (await stats.json()) as { status: string };
    expect(statsBody.status).toBe('ok');
  });

  it('支持 admin remove-users/disband 并走宿主授权回调', async () => {
    const { env, instances } = createEnv();
    const authorizeAdmin = vi.fn(async () => true);
    const nebula = new NebulaRealtime({
      name: 'E2E',
      authorizeAdmin
    });

    const roomKey = 'E2E:lobby';
    const stub = (env as any).NEBULA_DO.get(roomKey);
    await stub.fetch(new Request('https://example.com/presence', { headers: { 'x-nebula-room-id': 'lobby' } }));
    const instance = instances.get(roomKey)!;

    const targetWs = seedConnection(instance, 'u-remove');
    seedConnection(instance, 'u-keep');

    const remove = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/admin/remove-users', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-nebula-user-id': 'admin-1',
          'x-nebula-admin-operation-id': 'op-1'
        },
        body: JSON.stringify({ userIds: ['u-remove'] })
      }),
      env
    );
    const removeBody = (await remove.json()) as { removedConnections: number; remainingConnections: number };
    expect(remove.status).toBe(200);
    expect(removeBody.removedConnections).toBe(1);
    expect(removeBody.remainingConnections).toBe(1);
    expect((targetWs as any).close).toHaveBeenCalled();

    const disband = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/admin/disband', {
        method: 'POST',
        headers: {
          'content-type': 'application/json',
          'x-nebula-user-id': 'admin-1'
        },
        body: JSON.stringify({ reason: 'maintenance' })
      }),
      env
    );
    const disbandBody = (await disband.json()) as { disconnected: number; remainingConnections: number };
    expect(disband.status).toBe(200);
    expect(disbandBody.remainingConnections).toBe(0);
    expect(disbandBody.disconnected).toBe(1);

    expect(authorizeAdmin).toHaveBeenCalledTimes(2);
  });
});
