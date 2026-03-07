import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NebulaClient } from '../src/index.js';

class FakeWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CONNECTING = 0;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  onopen: (() => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(): void {}

  close(code = 1000, reason = ''): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code, reason });
  }
}

describe('NebulaClient multi-room', () => {
  beforeEach(() => {
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);
    vi.stubGlobal(
      'fetch',
      vi.fn(async (input: RequestInfo | URL) => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
        if (url.includes('/rooms/room-a/presence')) {
          return { ok: true, json: async () => ({ status: 'ok', connections: 2 }) };
        }
        if (url.includes('/rooms/room-b/presence')) {
          return { ok: true, json: async () => ({ status: 'ok', connections: 5 }) };
        }
        return { ok: true, json: async () => ({ status: 'ok', connections: 0 }) };
      }) as unknown as typeof fetch
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('可获取已加入房间并批量离开', () => {
    const client = new NebulaClient({
      httpBaseUrl: 'https://example.com',
      userId: 'u-1'
    });

    client.joinRoom('room-a');
    client.joinRoom('room-b');

    expect(client.getJoinedRooms().sort()).toEqual(['room-a', 'room-b']);

    const left = client.leaveRooms(['room-a', 'room-c']);
    expect(left).toEqual(['room-a']);
    expect(client.getJoinedRooms()).toEqual(['room-b']);
  });

  it('可获取单房间与多房间人数', async () => {
    const client = new NebulaClient({
      httpBaseUrl: 'https://example.com',
      userId: 'u-1'
    });

    const countA = await client.getRoomCount('room-a');
    expect(countA).toBe(2);

    const counts = await client.getRoomCounts(['room-a', 'room-b']);
    expect(counts).toEqual({ 'room-a': 2, 'room-b': 5 });
  });
});
