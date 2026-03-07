# @chaeco/nebula-realtime

Cloudflare Workers + Durable Objects 实时服务端插件。

## 版本策略

当前处于创建阶段（creation phase），默认允许可破坏变更，不提供向后兼容承诺。

## 能力范围

- 房间级 WebSocket 连接与广播
- HTTP 发布消息
- Presence / History / Stats 查询
- 心跳与超时剔除
- 连接级限流（秒级/分钟级 + 连续违规断开）
- HTTP 发布幂等（idempotency key）
- `user.leave` 离开原因细分

## 非能力范围（由宿主实现）

- 用户认证（Authentication）
- 授权与 ACL（Authorization / ACL）
- 业务级防刷/风控/审计

插件只接收宿主透传的用户身份（例如 `x-nebula-user-id`）。

## 安装与引用

本仓库当前不发布 npm，推荐在 monorepo/workspace 内直接依赖：

```json
{
  "dependencies": {
    "@chaeco/nebula-realtime": "workspace:*"
  }
}
```

## Worker 集成示例

```ts
import { NebulaRealtime, NebulaDurableObject } from '@chaeco/nebula-realtime';

const nebula = new NebulaRealtime({
  name: 'my-app',
  routePrefix: '/realtime',
  allowAnonymous: true,
  protocolVersion: 'v1',
  historyLimit: 200,
  authorizeAdmin: async ({ request, roomId, action }) => {
    // 宿主鉴权逻辑：只返回 true/false
    const token = request.headers.get('authorization');
    return Boolean(token && token.startsWith('Bearer ') && roomId && action);
  }
});

async function hostAuthorize(request: Request): Promise<boolean> {
  const token = request.headers.get('authorization');
  return Boolean(token && token.startsWith('Bearer '));
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/realtime')) {
      return new Response('Host app route');
    }

    // 宿主先认证/授权，不通过直接拒绝
    if (!(await hostAuthorize(request))) {
      return new Response('Forbidden', { status: 403 });
    }

    // 宿主透传业务用户身份给插件
    const headers = new Headers(request.headers);
    headers.set('x-nebula-user-id', 'u-1001');

    return nebula.handleRequest(new Request(request, { headers }), env);
  }
};

export { NebulaDurableObject };
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

## HTTP / WS API

前缀默认 `/realtime`（可通过 `routePrefix` 修改）。

- `GET /realtime/health`
- `GET /realtime/rooms/:roomId/ws`
- `POST /realtime/rooms/:roomId/messages`
- `GET /realtime/rooms/:roomId/presence`
- `GET /realtime/rooms/:roomId/history?limit=50`
- `GET /realtime/rooms/:roomId/stats`
- `GET /realtime/rooms/:roomId/admin/count`
- `POST /realtime/rooms/:roomId/admin/remove-users`
- `POST /realtime/rooms/:roomId/admin/disband`

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

`user.leave` 的 `payload`：
- `reason`: `close | error | timeout | rate_limit | removed | disbanded`
- `code`: WebSocket close code（若无为 `null`）
- `detail`: 附加说明（若无为 `null`）

## Admin 管理接口

这些接口只做能力，不做业务鉴权。是否允许调用由宿主 `authorizeAdmin` 回调决定。
建议宿主为管理操作附带：
- `x-nebula-user-id`（操作人）
- `x-nebula-admin-operation-id`（幂等/审计追踪 ID）

### `GET /rooms/:roomId/admin/count`

返回当前房间在线连接数和用户列表。

### `POST /rooms/:roomId/admin/remove-users`

按用户数组移出连接：

```json
{ "userIds": ["u-1"], "reason": "manual remove", "code": 4003 }
```

批量目标示例：

```json
{ "userIds": ["u-1", "u-2"] }
```

### `POST /rooms/:roomId/admin/disband`

解散房间并断开所有连接：

```json
{ "reason": "maintenance", "code": 4004 }
```

## 幂等发布

支持两种方式传入幂等键：
- Header: `x-nebula-idempotency-key`
- Body: `idempotencyKey`

同一房间 + 同一 key + TTL 窗口内会返回已有事件，并标记 `deduplicated: true`。

## 匿名与用户身份

- `allowAnonymous = true`：未传用户身份也可连接，插件会回退为匿名身份。
- `allowAnonymous = false`：必须有 `x-nebula-user-id` 或 `?userId=`，否则返回 `401`。

## 开发

```bash
# 在仓库根目录执行
npm run build
npm test
```
