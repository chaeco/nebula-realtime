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

describe('NebulaDurableObject HTTP APIs', () => {
  it('支持 HTTP 发布消息和历史查询', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const headers = new Headers({ 'x-nebula-room-id': 'room-1', 'x-nebula-history-limit': '50' });

    const publish = await instance.fetch(
      new Request('https://example.com/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'chat.message',
          senderId: 'u-1',
          payload: { text: 'hello' }
        })
      })
    );
    expect(publish.status).toBe(200);

    const history = await instance.fetch(
      new Request('https://example.com/history?limit=10', {
        method: 'GET',
        headers
      })
    );
    const body = (await history.json()) as {
      status: string;
      count: number;
      events: Array<{ event: string; protocolVersion: string }>;
    };
    expect(body.status).toBe('ok');
    expect(body.count).toBe(1);
    expect(body.events[0].event).toBe('chat.message');
    expect(body.events[0].protocolVersion).toBe('v1');
  });

  it('拒绝超出 schema 限制的消息', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const headers = new Headers({
      'x-nebula-room-id': 'room-1',
      'x-nebula-history-limit': '50',
      'x-nebula-message-max-payload-bytes': '256'
    });

    const response = await instance.fetch(
      new Request('https://example.com/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({
          event: 'chat.message',
          payload: { text: 'x'.repeat(600) }
        })
      })
    );
    expect(response.status).toBe(400);
  });

  it('离开事件包含 close 细分信息', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const fakeWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;

    (instance as any).roomId = 'room-1';
    (instance as any).connections.set(fakeWs, {
      userId: 'u-1',
      lastSeenAt: Date.now()
    });

    await instance.webSocketClose(fakeWs, 1000, 'client close');
    const history = await instance.fetch(
      new Request('https://example.com/history?limit=10', {
        headers: { 'x-nebula-room-id': 'room-1' }
      })
    );
    const events = ((await history.json()) as { events: Array<{ event: string; payload: Record<string, unknown> }> }).events;

    expect(events.length).toBe(1);
    expect(events[0].event).toBe('user.leave');
    expect(events[0].payload.reason).toBe('close');
    expect(events[0].payload.code).toBe(1000);
    expect(events[0].payload.detail).toBe('client close');
  });

  it('离开事件包含 timeout 细分信息', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const fakeWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;

    (instance as any).roomId = 'room-1';
    (instance as any).heartbeatTimeoutMs = 1;
    (instance as any).connections.set(fakeWs, {
      userId: 'u-timeout',
      lastSeenAt: Date.now() - 10_000
    });

    await instance.alarm();
    const history = await instance.fetch(
      new Request('https://example.com/history?limit=10', {
        headers: { 'x-nebula-room-id': 'room-1' }
      })
    );
    const events = ((await history.json()) as { events: Array<{ event: string; payload: Record<string, unknown> }> }).events;

    expect(events.length).toBe(1);
    expect(events[0].event).toBe('user.leave');
    expect(events[0].payload.reason).toBe('timeout');
    expect(events[0].payload.code).toBe(1001);
    expect(events[0].payload.detail).toBe('heartbeat timeout');
    expect((fakeWs as any).close).toHaveBeenCalledWith(1001, 'heartbeat timeout');
  });

  it('stats 接口返回指标', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const headers = new Headers({ 'x-nebula-room-id': 'room-1', 'x-nebula-history-limit': '50' });

    await instance.fetch(
      new Request('https://example.com/messages', {
        method: 'POST',
        headers,
        body: JSON.stringify({ event: 'chat.message', payload: { text: 'hello' } })
      })
    );

    const stats = await instance.fetch(new Request('https://example.com/stats', { headers }));
    const body = (await stats.json()) as { status: string; metrics: { broadcastMessages: number } };
    expect(body.status).toBe('ok');
    expect(body.metrics.broadcastMessages).toBeGreaterThan(0);
  });

  it('超限消息会触发 rate_limit 离开事件', async () => {
    const { state } = createState();
    const instance = new NebulaDurableObject(state as unknown as DurableObjectState);
    const fakeWs = { send: vi.fn(), close: vi.fn() } as unknown as WebSocket;

    (instance as any).roomId = 'room-1';
    (instance as any).rateLimitPerSecond = 1;
    (instance as any).connections.set(fakeWs, {
      userId: 'u-limit',
      lastSeenAt: Date.now(),
      windowSecond: Math.floor(Date.now() / 1000),
      secondCount: 0,
      windowMinute: Math.floor(Date.now() / 60_000),
      minuteCount: 0,
      sendFailures: 0
    });

    await instance.webSocketMessage(fakeWs, JSON.stringify({ event: 'chat.message', payload: { n: 1 } }));
    await instance.webSocketMessage(fakeWs, JSON.stringify({ event: 'chat.message', payload: { n: 2 } }));

    const history = await instance.fetch(
      new Request('https://example.com/history?limit=10', {
        headers: { 'x-nebula-room-id': 'room-1' }
      })
    );
    const events = ((await history.json()) as { events: Array<{ event: string; payload: Record<string, unknown> }> }).events;
    const leaveEvent = events.find((event) => event.event === 'user.leave');
    expect(leaveEvent).toBeTruthy();
    expect(leaveEvent?.payload.reason).toBe('rate_limit');
  });
});
