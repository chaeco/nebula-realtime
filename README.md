# Nebula Realtime Monorepo

Nebula Realtime 是一个面向 Cloudflare Workers + Durable Objects 的实时通信方案，仓库采用 monorepo：
- `@chaeco/nebula-realtime`：服务端插件（路由、DO 转发、房间实时能力）
- `@chaeco/nebula-realtime-client`：客户端 SDK（WebSocket 连接、重连、心跳、HTTP 发布）

## 文档导航

- 服务端插件文档：[packages/server/README.md](./packages/server/README.md)
- 客户端 SDK 文档：[packages/client/README.md](./packages/client/README.md)

## 设计边界

- 插件只负责实时传输能力（房间、广播、history、presence、stats）。
- 插件支持 admin 管理动作（count/remove-users/disband），是否放行由宿主回调返回 `boolean` 决定。
- 认证/授权/ACL 由宿主程序负责，插件仅消费宿主透传的用户身份（如 `x-nebula-user-id`）。

## 仓库结构

```text
packages/
  server/   # @chaeco/nebula-realtime
  client/   # @chaeco/nebula-realtime-client
```

## 本地开发

```bash
npm install
npm run build
npm test
```

## 包发布说明

当前仓库以本地工作区开发为主（你已明确不发布 npm）。
如需在宿主项目中使用，可通过 workspace、git 子模块或私有制品库接入。

## 版本策略

当前处于创建阶段（creation phase），默认按“可破坏变更”推进，不保证向后兼容。

## 生产运维文档

- 运维快速开始：[ops/quickstart.md](./ops/quickstart.md)
- 上线清单：[ops/production-checklist.md](./ops/production-checklist.md)
- 压测方案：[ops/load-test-plan.md](./ops/load-test-plan.md)
- 告警规则：[ops/alerts.md](./ops/alerts.md)
- 故障手册：[ops/runbook.md](./ops/runbook.md)

## License

MIT
