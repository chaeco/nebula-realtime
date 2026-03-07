#!/usr/bin/env node
/**
 * Validate required runtime env vars for production operations.
 * 校验生产运维脚本所需环境变量。
 */

const mode = process.env.OPS_MODE || 'smoke';

const commonRequired = ['TARGET_BASE_URL'];
const modeRequired = {
  smoke: [],
  load: [],
  admin: ['ADMIN_USER_ID']
};

const missing = [];
for (const key of commonRequired) {
  if (!process.env[key]) {
    missing.push(key);
  }
}

const requiredByMode = modeRequired[mode] || [];
for (const key of requiredByMode) {
  if (!process.env[key]) {
    missing.push(key);
  }
}

if (process.env.ENABLE_ADMIN === 'true' && !process.env.ADMIN_USER_ID) {
  missing.push('ADMIN_USER_ID');
}

if (missing.length > 0) {
  console.error('[ops:env] missing env vars:', [...new Set(missing)].join(', '));
  process.exit(1);
}

console.log('[ops:env] env validation passed for mode:', mode);
