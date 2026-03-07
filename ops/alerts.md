# Alert Rules (Initial)

## Error Alerts

1. API 5xx rate > 2% (5 min)
2. Admin endpoint 4xx spike > 20/min (possible abuse or auth issue)
3. Publish failure count > baseline x3

## Latency Alerts

1. `/messages` p99 latency > 1s (10 min)
2. `/presence` p99 latency > 500ms (10 min)

## Connection Alerts

1. Unexpected disconnect count > baseline x3
2. `timeout` reason proportion > 20%
3. reconnect give-up events > threshold per minute

## Security Alerts

1. `admin.disband` triggered outside maintenance window
2. Same operator issues abnormal `remove-users` bursts
3. Missing operation ID on admin calls

## Operational Notes

- Alerts should include room/app identifiers when available.
- Link each alert to runbook actions in `ops/runbook.md`.
