import { describe, expect, it, vi } from 'vitest';
import { NebulaRealtime } from '../src/index.js';

describe('NebulaRealtime', () => {
  it('返回 health 信息', async () => {
    const getSpy = vi.fn();
    const nebula = new NebulaRealtime({ name: 'TestInstance' });
    const env = {
      NEBULA_DO: {
        idFromName: vi.fn(),
        get: getSpy
      }
    };

    const response = await nebula.handleRequest(new Request('https://example.com/realtime/health'), env as never);
    const body = (await response.json()) as { status: string; plugin: string; protocolVersion: string };

    expect(response.status).toBe(200);
    expect(body.status).toBe('ok');
    expect(body.plugin).toBe('TestInstance');
    expect(body.protocolVersion).toBe('v1');
    expect(getSpy).not.toHaveBeenCalled();
  });

  it('按 roomId 转发到 Durable Object', async () => {
    const fetchSpy = vi.fn(async () => Response.json({ status: 'ok' }));
    const idFromNameSpy = vi.fn(() => 'do-id');
    const getSpy = vi.fn(() => ({ fetch: fetchSpy }));
    const nebula = new NebulaRealtime({ name: 'TestInstance', historyLimit: 20 });
    const env = {
      NEBULA_DO: {
        idFromName: idFromNameSpy,
        get: getSpy
      }
    };

    const response = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/presence'),
      env as never
    );

    expect(response.status).toBe(200);
    expect(idFromNameSpy).toHaveBeenCalledWith('TestInstance:lobby');
    expect(getSpy).toHaveBeenCalledWith('do-id');

    const forwarded = fetchSpy.mock.calls[0][0] as Request;
    expect(new URL(forwarded.url).pathname).toBe('/presence');
    expect(forwarded.headers.get('x-nebula-room-id')).toBe('lobby');
    expect(forwarded.headers.get('x-nebula-history-limit')).toBe('20');
  });

  it('透传 userId 到 Durable Object', async () => {
    const fetchSpy = vi.fn(async () => Response.json({ status: 'ok' }));
    const nebula = new NebulaRealtime({ name: 'HostAuthInstance' });
    const env = {
      NEBULA_DO: {
        idFromName: vi.fn(() => 'do-id'),
        get: vi.fn(() => ({ fetch: fetchSpy }))
      }
    };

    const allowed = await nebula.handleRequest(
      new Request('https://example.com/realtime/rooms/lobby/presence', {
        headers: { 'x-nebula-user-id': 'admin-1' }
      }),
      env as never
    );
    expect(allowed.status).toBe(200);

    const forwarded = fetchSpy.mock.calls[0][0] as Request;
    expect(forwarded.headers.get('x-nebula-user-id')).toBe('admin-1');
  });
});
