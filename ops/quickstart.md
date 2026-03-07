# Ops Quickstart

## 1) Local Preflight

```bash
npm ci
npm run ops:preflight
```

## 2) Staging Smoke Test

```bash
export TARGET_BASE_URL="https://your-staging.example.com"
export ROUTE_PREFIX="/realtime"
export SMOKE_ROOM_ID="smoke-room"
export SMOKE_USER_ID="smoke-bot"

npm run ops:env
npm run ops:smoke
```

## 3) Admin Smoke Test (Optional)

```bash
export ENABLE_ADMIN="true"
export ADMIN_USER_ID="admin-1"
export ADMIN_BEARER="<token-if-needed>"

npm run ops:env
npm run ops:smoke
```

## 4) k6 Load Test

```bash
# publish load
k6 run ops/k6/http-publish.js \
  -e TARGET_BASE_URL="https://your-staging.example.com" \
  -e ROUTE_PREFIX="/realtime" \
  -e ROOM_ID="load-room" \
  -e VUS=20 -e DURATION=2m

# admin count polling
k6 run ops/k6/admin-count.js \
  -e TARGET_BASE_URL="https://your-staging.example.com" \
  -e ROUTE_PREFIX="/realtime" \
  -e ROOM_ID="load-room" \
  -e ADMIN_USER_ID="admin-1" \
  -e ADMIN_BEARER="<token-if-needed>"
```

## 5) CI Ops Gate

Use GitHub Actions workflow `Ops Gate` (`.github/workflows/ops-gate.yml`) with `workflow_dispatch`.
