# @chaeco/nebula-realtime-client

Nebula Realtime 客户端 SDK，提供连接管理、断线重连、心跳超时检测、消息缓存、HTTP 能力以及多房间管理。

## 能力

- WebSocket 连接与事件订阅
- 指数退避 + 抖动重连
- 心跳超时检测
- 断线消息缓存与自动 flush
- HTTP 发布消息 / 查询 presence / history / stats
- 多房间管理（join/leave/list/count）

## 安装与引用

本仓库当前不发布 npm，推荐在 monorepo/workspace 内直接依赖：

```json
{
  "dependencies": {
    "@chaeco/nebula-realtime-client": "workspace:*"
  }
}
```

## 单房间用法

```ts
import { NebulaClient } from '@chaeco/nebula-realtime-client';

const client = new NebulaClient({
  httpBaseUrl: 'https://your-worker.example.com',
  roomId: 'lobby',
  userId: 'u-1001',
  reconnect: true
});

client.connect();
client.send('chat.message', { text: 'hello from sdk' });
await client.publish('chat.message', { text: 'from http publish' }, 'idemp-1');
```

## 多房间用法（同一个类）

```ts
import { NebulaClient } from '@chaeco/nebula-realtime-client';

const client = new NebulaClient({
  httpBaseUrl: 'https://your-worker.example.com',
  userId: 'u-1001'
});

client.joinRoom('room-a');
client.joinRoom('room-b');

const joined = client.getJoinedRooms();
const countA = await client.getRoomCount('room-a');
const counts = await client.getRoomCounts(['room-a', 'room-b']);

client.leaveRooms(['room-a', 'room-b']);
```

## 多房间 API

- `joinRoom(roomId)`
- `leaveRoom(roomId)`
- `getJoinedRooms()`
- `leaveRooms(roomIds)`
- `leaveAllRooms()`
- `getRoomClient(roomId)`
- `getRoomPresence(roomId)`
- `getRoomCount(roomId)`
- `getRoomCounts(roomIds)`

## 事件

- `open`: 连接建立
- `message`: 收到服务端事件
- `close`: 连接关闭
- `error`: 传输层错误
- `state`: 状态切换（`idle -> connecting -> open -> reconnecting -> closed`）
- `reconnect_scheduled`: 已计划重连（含 attempt/delay）
- `reconnect_giveup`: 达到最大重连次数后放弃
- `heartbeat_timeout`: 心跳超时

## 主要配置（NebulaClientOptions）

- 必填
  - `httpBaseUrl`
- 单房间模式必填
  - `roomId`
- 常用可选
  - `userId`
  - `wsBaseUrl`
  - `routePrefix`
  - `reconnect`
  - `reconnectBaseDelayMs`
  - `reconnectMaxDelayMs`
  - `reconnectJitterRatio`
  - `reconnectMaxAttempts`
  - `queueMessagesWhenDisconnected`
  - `maxQueuedMessages`
  - `heartbeatTimeoutMs`
  - `heartbeatCheckIntervalMs`
  - `autoPong`
  - `debug`

## 与宿主鉴权的关系

客户端 SDK 不负责业务认证逻辑。
如果宿主服务端要求认证，请在调用端自行附带认证凭据（例如 cookie / token），并由宿主服务端判定是否放行到 Nebula 插件。

## 内部模块结构（便于维护）

```text
src/
  client.ts               # 统一对外类（单房间 + 多房间）
  room-client.ts          # 单房间核心状态机实现
  types.ts                # 对外类型
  config/default-options.ts
  events/event-bus.ts
  transport/url.ts
  transport/http-api.ts
  transport/outbox.ts
  reconnect/policy.ts
  protocol/message-parser.ts
  index.ts                # 稳定导出入口
```

## 开发

```bash
# 在仓库根目录执行
npm run build
npm test
```
