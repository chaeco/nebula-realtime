# Production Checklist

## Go/No-Go Gates

1. Build and test must pass in CI on main branch.
2. E2E smoke tests must pass against staging Worker.
3. Load test baseline must meet SLO targets.
4. Admin actions (`remove-users`, `disband`) must be protected by host `authorizeAdmin` callback.
5. Observability dashboards and alerts must be active before rollout.
6. Runbook and rollback owner must be assigned.

## SLO Targets (Initial)

- API availability: >= 99.9%
- WebSocket connect success rate: >= 99.5%
- p95 publish latency: <= 200ms
- p99 publish latency: <= 500ms
- Unexpected disconnect rate: < 1% per hour

## Pre-Launch Verification

- [ ] `npm run build` success
- [ ] `npm test` success
- [ ] staging health endpoint `/realtime/health` success
- [ ] publish/history/presence/stats validated in staging
- [ ] admin count/remove-users/disband validated in staging
- [ ] alarm channel receives test alert
- [ ] log retention and access policy confirmed

## Rollout Plan

1. Stage verification on isolated room set.
2. Canary rollout to 5% traffic or selected tenants.
3. Observe 30 minutes: latency, error, disconnect, rate-limit metrics.
4. Expand to 25% then 100% with same checks.

## Rollback Triggers

- Error rate > 2% for 5 minutes
- p99 publish latency > 1s for 10 minutes
- Unexpected disconnect spikes > 3x baseline
- Admin route misuse or security incident

## Rollback Actions

1. Route traffic back to previous Worker version.
2. Disable admin operations at host gateway.
3. Preserve logs and operation IDs for incident review.
4. Announce incident state and ETA.
