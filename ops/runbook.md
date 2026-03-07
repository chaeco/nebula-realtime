# Realtime Runbook

## Common Incidents

1. High publish error rate
2. WS large-scale disconnect
3. Admin API misuse (`remove-users` / `disband`)
4. Elevated rate-limit rejections

## Triage Steps

1. Check `/realtime/health`.
2. Inspect recent structured logs for `admin.operation`, `room.disband`, `user.leave`.
3. Compare disconnect reason counters and latency dashboards.
4. Verify host auth system and `authorizeAdmin` decisions.

## Immediate Mitigations

- Disable admin routes in host gateway (temporary block).
- Increase host-side auth strictness for admin operations.
- Shift traffic to previous known-good deployment.
- Isolate affected tenants/rooms if incident is scoped.

## Admin Security Procedure

- Every admin call should include:
  - `x-nebula-user-id`
  - `x-nebula-admin-operation-id`
- Record operator identity, reason, target user list, and timestamp.
- Post-incident: replay audit from logs by operation ID.

## Recovery Validation

- Error rate returns below baseline.
- New connections and publish paths recover.
- No abnormal increase in `removed`/`disbanded` events.
- Alerts return to green for 30 minutes.
