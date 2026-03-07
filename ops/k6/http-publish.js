import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 HTTP publish load test.
 * k6 HTTP 发布压测脚本。
 */

export const options = {
  vus: Number(__ENV.VUS || 20),
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200', 'p(99)<500']
  }
};

const baseUrl = (__ENV.TARGET_BASE_URL || '').replace(/\/$/, '');
const routePrefix = (__ENV.ROUTE_PREFIX || '/realtime').startsWith('/')
  ? __ENV.ROUTE_PREFIX || '/realtime'
  : `/${__ENV.ROUTE_PREFIX}`;
const roomId = __ENV.ROOM_ID || 'load-room';

if (!baseUrl) {
  throw new Error('TARGET_BASE_URL is required');
}

export default function () {
  const url = `${baseUrl}${routePrefix}/rooms/${encodeURIComponent(roomId)}/messages`;
  const id = `${__VU}-${__ITER}-${Date.now()}`;

  const res = http.post(
    url,
    JSON.stringify({
      event: 'load.message',
      payload: { id, text: 'k6-load' }
    }),
    {
      headers: {
        'content-type': 'application/json',
        'x-nebula-user-id': `load-user-${__VU}`,
        'x-nebula-idempotency-key': `load-key-${id}`
      }
    }
  );

  check(res, {
    'status is 200': (r) => r.status === 200
  });

  sleep(0.2);
}
