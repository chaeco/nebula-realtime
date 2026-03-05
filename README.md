# Nebula Realtime

**Nebula Realtime** is an edge-native realtime infrastructure built on top of Cloudflare Workers and Durable Objects.

It provides the foundation for building realtime features such as **chat, danmaku (live comments), notifications, and presence systems** with extremely low latency and global scalability.

Nebula is designed as a **realtime engine** rather than a framework, allowing applications to build their own messaging and interaction layers on top of it.

---

## Vision

Nebula aims to provide a **simple, scalable realtime backend architecture** for modern edge platforms.

Instead of running traditional realtime stacks like:

```
Node.js
Redis
WebSocket servers
Message queues
```

Nebula leverages the edge-native capabilities of Cloudflare:

```
Workers + Durable Objects
```

This architecture enables realtime applications with minimal infrastructure management.

---

## Core Capabilities

Nebula provides primitives for building realtime systems:

* WebSocket connection management
* Realtime room system
* Message broadcasting
* User presence tracking
* Event streaming
* Low-latency edge messaging

---

## Architecture

```
Client
   │
   ▼
Cloudflare CDN
   │
   ▼
Workers API
   │
   ▼
Durable Objects
   │
   ├── D1 (message persistence)
   ├── KV (presence & caching)
   └── R2 (attachments)
```

### Components

| Component       | Purpose                                    |
| --------------- | ------------------------------------------ |
| Workers         | Request routing, authentication, API layer |
| Durable Objects | Realtime rooms and WebSocket handling      |
| D1              | Persistent message storage                 |
| KV              | Presence data and caching                  |
| R2              | File storage for media and attachments     |

---

## Realtime Model

Nebula follows an **Actor-style architecture**.

Each realtime entity is mapped to a Durable Object instance.

Example:

```
chat:room_1     → Durable Object
chat:room_2     → Durable Object
video:1001      → Danmaku Object
user:42         → User connection object
```

Each object is responsible for:

* Managing WebSocket connections
* Broadcasting events
* Maintaining local state

---

## Example Use Cases

Nebula can power many realtime applications:

* Messaging platforms
* Live streaming chat
* Danmaku systems
* Collaboration tools
* Online gaming rooms
* Notification systems
* Social communities

---

## Repository Structure

```
nebula-realtime

src/
  core/
    NebulaServer.ts
    ConnectionManager.ts

  rooms/
    ChatRoom.ts
    DanmakuRoom.ts

  services/
    ChatService.ts
    NotificationService.ts
    PresenceService.ts

  storage/
    MessageStore.ts

  sdk/
    client.ts
```

---

## Design Principles

Nebula follows several design goals:

### Edge-native

The system is designed specifically for edge execution environments.

### Stateless API layer

Workers act as routing and gateway nodes.

### Stateful realtime layer

Durable Objects provide strongly consistent stateful rooms.

### Minimal infrastructure

No Redis clusters, message brokers, or websocket servers.

---

## Scalability

Nebula scales naturally with the edge network.

Each realtime room becomes an independent Durable Object instance, allowing the system to support a large number of concurrent rooms and users.

---

## Development Status

Nebula is currently in early development and is intended to serve as the realtime backbone for projects built on Cloudflare Workers.

---

## License

MIT
