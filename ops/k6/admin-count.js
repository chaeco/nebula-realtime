import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * k6 admin count polling test.
 * k6 管理接口 count 轮询压测脚本。
 */

export const options = {
  vus: Number(__ENV.VUS || 5),
  duration: __ENV.DURATION || '2m',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<200']
  }
};

const baseUrl = (__ENV.TARGET_BASE_URL || '').replace(/\/$/, '');
const routePrefix = (__ENV.ROUTE_PREFIX || '/realtime').startsWith('/')
  ? __ENV.ROUTE_PREFIX || '/realtime'
  : `/${__ENV.ROUTE_PREFIX}`;
const roomId = __ENV.ROOM_ID || 'load-room';
const adminUserId = __ENV.ADMIN_USER_ID || 'load-admin';
const adminBearer = __ENV.ADMIN_BEARER || '';

if (!baseUrl) {
  throw new Error('TARGET_BASE_URL is required');
}

export default function () {
  const url = `${baseUrl}${routePrefix}/rooms/${encodeURIComponent(roomId)}/admin/count`;
  const headers = {
    'x-nebula-user-id': adminUserId,
    'x-nebula-admin-operation-id': `k6-${__VU}-${__ITER}`
  };

  if (adminBearer) {
    headers.authorization = `Bearer ${adminBearer}`;
  }

  const res = http.get(url, { headers });
  check(res, {
    'status is 200': (r) => r.status === 200
  });
  sleep(1);
}
