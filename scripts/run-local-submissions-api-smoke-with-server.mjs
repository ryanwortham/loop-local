#!/usr/bin/env node
// local-submissions-api-full-runner-pass: build, start, run direct API smoke, and clean up.
// Contract markers: npm run build · npm run start -- -p · npm run test:api:local
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = Number(process.env.LOOP_LOCAL_API_SMOKE_PORT || 3013);
const operatorToken = process.env.LOOP_LOCAL_OPERATOR_TOKEN || 'loop-local-smoke-operator-token';
const fallbackActorUserId = process.env.LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID || 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const smokeStorePath = process.env.LOOP_LOCAL_SUBMISSIONS_STORE_PATH || `/tmp/loop-local-api-smoke-${process.pid}.json`;
const baseURL = `http://127.0.0.1:${port}`;
let server;

function run(command, args, options = {}) {
  console.log(`${command} ${args.join(' ')}`);
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: 'inherit', shell: false, ...options });
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`${command} ${args.join(' ')} failed with ${signal || `code ${code}`}`));
    });
  });
}

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${baseURL}/`, { headers: { accept: 'text/html' } });
      if (response.ok) return;
    } catch {
      // retry
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${baseURL}`);
}

async function startServer() {
  console.log(`npm run start -- -p ${port}`);
  server = spawn('npm', ['run', 'start', '--', '-p', String(port)], { stdio: 'inherit', env: { ...process.env, LOOP_LOCAL_OPERATOR_TOKEN: operatorToken, LOOP_LOCAL_OPERATOR_TOKEN_FALLBACK_ENABLED: 'true', LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID: fallbackActorUserId, LOOP_LOCAL_SUBMISSIONS_STORE_PATH: smokeStorePath } });
  server.on('exit', (code, signal) => {
    if (!server.killed && code !== 0) console.error(`API smoke server exited with ${signal || code}`);
  });
  await waitForServer();
}

async function killServer() {
  if (!server || server.killed) return;
  server.kill('SIGTERM');
  await delay(750);
}

async function main() {
  try {
    await run('npm', ['run', 'build']);
    await startServer();
    await run('npm', ['run', 'test:api:local'], {
      env: { ...process.env, LOOP_LOCAL_API_SMOKE_URL: baseURL, LOOP_LOCAL_OPERATOR_TOKEN: operatorToken, LOOP_LOCAL_OPERATOR_TOKEN_FALLBACK_ENABLED: 'true', LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID: fallbackActorUserId, LOOP_LOCAL_SUBMISSIONS_STORE_PATH: smokeStorePath },
    });
    console.log('loop_local_local_submissions_api_full_runner_ok');
  } finally {
    await killServer();
  }
}

main().catch(async (error) => {
  await killServer();
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
