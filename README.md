# Nebula Realtime

Nebula Realtime 是一个基于 Cloudflare Workers + Durable Objects 的实时传输插件。  
插件专注 WebSocket/房间广播/历史消息，不内置业务鉴权。

## 能力

- 房间级 WebSocket 连接与广播
- HTTP 发布消息
- Presence 与历史消息读取
- 协议版本字段（默认 `v1`）
- 分段历史存储（降低每次写入 I/O）
- 连接级限流（每秒/每分钟）
- 心跳保活 + 超时剔除
- 结构化指标与 `/stats`

## 安装

```bash
npm install @chaeco/nebula-realtime
```

## Worker 集成

```ts
import { NebulaRealtime, NebulaDurableObject } from '@chaeco/nebula-realtime';

const nebula = new NebulaRealtime({
  name: 'my-realtime-app',
  routePrefix: '/realtime',
  protocolVersion: 'v1',
  historyLimit: 200,
  message: {
    maxEventNameLength: 64,
    maxPayloadBytes: 16 * 1024
  },
  heartbeat: {
    intervalMs: 15000,
    timeoutMs: 45000
  },
  rateLimit: {
    perConnectionPerSecond: 30,
    perConnectionPerMinute: 600
  },
  observability: {
    structuredLogs: true
  }
});

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // 宿主先做认证授权和 ACL，再交给插件
    // if (!(await hostAuthorize(request))) return new Response('Forbidden', { status: 403 });

    const url = new URL(request.url);
    if (url.pathname.startsWith('/realtime')) {
      // 可选：将业务用户 ID 透传给插件（用于事件 senderId / presence）
      const headers = new Headers(request.headers);
      headers.set('x-nebula-user-id', 'user-123');
      const proxied = new Request(request, { headers });
      return nebula.handleRequest(proxied, env);
    }
    return new Response('Host App Logic');
  }
};

export { NebulaDurableObject };
```

## 宿主鉴权模板

```ts
async function hostAuthorize(request: Request): Promise<boolean> {
  const token = request.headers.get('authorization');
  if (!token) return false;
  // 这里接你自己的 JWT / Session / ACL 系统
  return token.startsWith('Bearer ');
}
```

## wrangler.toml

```toml
[[durable_objects.bindings]]
name = "NEBULA_DO"
class_name = "NebulaDurableObject"

[[migrations]]
tag = "v1"
new_classes = ["NebulaDurableObject"]
```

## API

- `GET /realtime/health`
- `GET /realtime/rooms/:roomId/ws`
- `POST /realtime/rooms/:roomId/messages`
- `GET /realtime/rooms/:roomId/presence`
- `GET /realtime/rooms/:roomId/history?limit=50`
- `GET /realtime/rooms/:roomId/stats`

WebSocket 消息示例：

```json
{ "event": "chat.message", "payload": { "text": "hello" } }
```

## 事件模型

```json
{
  "id": "uuid",
  "type": "message",
  "event": "chat.message",
  "roomId": "lobby",
  "senderId": "u-1",
  "payload": { "text": "hello" },
  "timestamp": "2026-03-06 10:00:00",
  "protocolVersion": "v1"
}
```

系统事件：
- `user.join`
- `user.leave`
- `server.ping`
- `server.pong`

`user.leave` payload：
- `reason`: `close | error | timeout | rate_limit`
- `code`: WebSocket close code（无则 `null`）
- `detail`: 说明文本（无则 `null`）

## 指标与日志

`/stats` 返回：
- 活跃连接数
- 历史分段信息（`firstChunk/chunk/chunkLength/total`）
- 运行指标（接收、广播、拒绝、限流、离线原因统计）

开启 `structuredLogs` 后会输出 JSON 日志，便于接入外部观测系统。

## 鉴权边界

- 插件不实现认证、授权、业务 ACL。
- 宿主负责鉴权、防刷、审计。
- 插件只消费宿主透传的 `x-nebula-user-id`。

## 开发

```bash
npm test
npm run build
```

## License

MIT
