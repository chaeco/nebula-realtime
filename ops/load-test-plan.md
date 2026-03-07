# Load Test Plan

## Goals

- Validate connection scalability and broadcast stability.
- Measure publish latency under sustained and burst traffic.
- Verify admin actions behavior under load.

## Scenarios

1. Baseline steady load:
- 1k concurrent connections, 10 msg/s publish.

2. Burst load:
- 1k -> 5k connections within 2 minutes.
- 100 msg/s burst for 60 seconds.

3. Long soak:
- 12 hours with 2k connections.
- Heartbeat and reconnect stability validation.

4. Admin path under pressure:
- `admin/count` every 5 seconds.
- periodic `admin/remove-users` and `admin/disband` on test rooms.

## Metrics to Capture

- HTTP p50/p95/p99 latency by endpoint
- WS connect success rate
- publish throughput and error rate
- disconnect reason distribution (`timeout`, `rate_limit`, `removed`, `disbanded`, etc.)
- CPU/memory usage from Worker/DO runtime dashboards

## Pass Criteria

- No sustained error rate above 1%
- No memory leak trend across soak window
- p95 publish latency <= 200ms
- reconnect loop does not amplify failures

## Tooling Suggestion

- Use k6 or Artillery for HTTP + WS mixed load.
- Generate operation IDs for admin calls (`x-nebula-admin-operation-id`) for traceability.
- Export results to time-series dashboard for comparison over builds.

## Built-in k6 Scripts

- `ops/k6/http-publish.js`
- `ops/k6/admin-count.js`
