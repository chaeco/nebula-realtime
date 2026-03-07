#!/usr/bin/env node
import { spawn } from 'node:child_process';

/**
 * Run local preflight gates before production rollout.
 * 生产发布前执行本地预检门禁。
 */

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit', shell: false });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} ${args.join(' ')} failed with code ${code}`));
      }
    });
  });

try {
  console.log('[ops:preflight] build start');
  await run('npm', ['run', 'build']);

  console.log('[ops:preflight] test start');
  await run('npm', ['test']);

  console.log('[ops:preflight] all checks passed');
} catch (error) {
  console.error('[ops:preflight] failed:', error instanceof Error ? error.message : String(error));
  process.exit(1);
}
