import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NebulaClient } from '../src/index.js';

class FakeWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static CONNECTING = 0;
  static instances: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  sent: string[] = [];
  onopen: (() => void) | null = null;
  onmessage: ((ev: { data: string }) => void) | null = null;
  onclose: ((ev: { code: number; reason: string }) => void) | null = null;
  onerror: ((err: unknown) => void) | null = null;

  constructor(public url: string) {
    FakeWebSocket.instances.push(this);
  }

  send(data: string): void {
    this.sent.push(data);
  }

  close(code = 1000, reason = ''): void {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({ code, reason });
  }

  triggerOpen(): void {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.();
  }

  triggerMessage(data: unknown): void {
    this.onmessage?.({ data: JSON.stringify(data) });
  }
}

describe('NebulaClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    FakeWebSocket.instances = [];
    vi.stubGlobal('WebSocket', FakeWebSocket as unknown as typeof WebSocket);
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) })) as unknown as typeof fetch);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('断线时会入队，连接后自动 flush', () => {
    const client = new NebulaClient({
      httpBaseUrl: 'https://example.com',
      roomId: 'r1'
    });

    client.connect();
    client.send('chat.message', { t: 1 });
    const ws = FakeWebSocket.instances[0];
    expect(ws.sent.length).toBe(0);

    ws.triggerOpen();
    expect(ws.sent.length).toBe(1);
    expect(JSON.parse(ws.sent[0]).event).toBe('chat.message');
  });

  it('关闭后会按策略重连', () => {
    const client = new NebulaClient({
      httpBaseUrl: 'https://example.com',
      roomId: 'r1',
      reconnect: true,
      reconnectBaseDelayMs: 100,
      reconnectMaxDelayMs: 100
    });

    client.connect();
    const ws = FakeWebSocket.instances[0];
    ws.triggerOpen();
    ws.close(1006, 'abnormal');

    expect(FakeWebSocket.instances.length).toBe(1);
    vi.advanceTimersByTime(1000);
    expect(FakeWebSocket.instances.length).toBeGreaterThan(1);
  });
});
