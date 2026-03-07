import { describe, expect, it, vi } from 'vitest';
import { NebulaDurableObject } from '../src/storage/durable-object.js';

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

const createConnectionMeta = (userId: string) => ({
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

describe('NebulaDurableObject admin APIs', () => {
  it('admin/count 返回房间连接人数与用户列表', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const ws1 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
    const ws2 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
    const ws3 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;

    (instance as any).roomId = 'room-1';
    (instance as any).connections.set(ws1, createConnectionMeta('u-1'));
    (instance as any).connections.set(ws2, createConnectionMeta('u-2'));
    (instance as any).connections.set(ws3, createConnectionMeta('u-2'));

    const response = await instance.fetch(new Request('https://example.com/admin/count', {
      headers: { 'x-nebula-room-id': 'room-1' }
    }));
    const body = (await response.json()) as { status: string; connections: number; users: string[] };
    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.connections).toBe(3);
    expect(body.users.sort()).toEqual(['u-1', 'u-2']);
  });

  it('admin/remove-users 会按 userIds 数组移出连接并记录 removed', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const ws1 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
    const ws2 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;

    (instance as any).roomId = 'room-1';
    (instance as any).connections.set(ws1, createConnectionMeta('u-remove'));
    (instance as any).connections.set(ws2, createConnectionMeta('u-keep'));

    const remove = await instance.fetch(new Request('https://example.com/admin/remove-users', {
      method: 'POST',
      headers: { 'x-nebula-room-id': 'room-1', 'content-type': 'application/json' },
      body: JSON.stringify({ userIds: ['u-remove'], reason: 'manual remove' })
    }));
    const removeBody = (await remove.json()) as { removedConnections: number; remainingConnections: number };
    expect(remove.status).toBe(200);
    expect(removeBody.removedConnections).toBe(1);
    expect(removeBody.remainingConnections).toBe(1);
    expect((ws1 as any).close).toHaveBeenCalled();

    const history = await instance.fetch(
      new Request('https://example.com/history?limit=10', {
        headers: { 'x-nebula-room-id': 'room-1' }
      })
    );
    const events = ((await history.json()) as { events: Array<{ event: string; payload: Record<string, unknown> }> }).events;
    const removed = events.find((event) => event.event === 'user.leave');
    expect(removed?.payload.reason).toBe('removed');
  });

  it('admin/remove-users 未提供 userIds 数组时返回 400', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    (instance as any).roomId = 'room-1';

    const response = await instance.fetch(new Request('https://example.com/admin/remove-users', {
      method: 'POST',
      headers: { 'x-nebula-room-id': 'room-1', 'content-type': 'application/json' },
      body: JSON.stringify({})
    }));
    expect(response.status).toBe(400);
    const body = (await response.json()) as { error: string };
    expect(body.error).toBe('invalid_target');
  });

  it('admin/disband 会断开所有连接并记录 disbanded', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const ws1 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;
    const ws2 = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;

    (instance as any).roomId = 'room-1';
    (instance as any).connections.set(ws1, createConnectionMeta('u-1'));
    (instance as any).connections.set(ws2, createConnectionMeta('u-2'));

    const disband = await instance.fetch(new Request('https://example.com/admin/disband', {
      method: 'POST',
      headers: { 'x-nebula-room-id': 'room-1', 'content-type': 'application/json' },
      body: JSON.stringify({ reason: 'room closed' })
    }));
    const disbandBody = (await disband.json()) as { disconnected: number; remainingConnections: number };
    expect(disband.status).toBe(200);
    expect(disbandBody.disconnected).toBe(2);
    expect(disbandBody.remainingConnections).toBe(0);
    expect((ws1 as any).close).toHaveBeenCalled();
    expect((ws2 as any).close).toHaveBeenCalled();

    const history = await instance.fetch(
      new Request('https://example.com/history?limit=20', {
        headers: { 'x-nebula-room-id': 'room-1' }
      })
    );
    const events = ((await history.json()) as { events: Array<{ event: string; payload: Record<string, unknown> }> }).events;
    const leaveReasons = events.filter((event) => event.event === 'user.leave').map((event) => event.payload.reason);
    expect(leaveReasons).toContain('disbanded');
  });
});
