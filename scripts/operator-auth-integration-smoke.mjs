#!/usr/bin/env node
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = process.env.LOOP_LOCAL_AUTH_SMOKE_PORT || '3015';
const baseURL = `http://127.0.0.1:${port}`;
const emergencyKey = 'must-stay-disabled-in-this-smoke';
let server;

async function waitForServer() {
  const deadline = Date.now() + 30000;
  while (Date.now() < deadline) {
    try {
      if ((await fetch(`${baseURL}/account`, { cache: 'no-store' })).ok) return;
    } catch {}
    await delay(250);
  }
  throw new Error('auth smoke server did not become ready');
}

async function stopServer() {
  if (!server || server.killed) return;
  server.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => server.once('exit', resolve)),
    delay(3000).then(() => server.kill('SIGKILL')),
  ]);
}

try {
  const serverEnv = { ...process.env, LOOP_LOCAL_OPERATOR_TOKEN: emergencyKey };
  delete serverEnv.LOOP_LOCAL_OPERATOR_TOKEN_FALLBACK_ENABLED;
  delete serverEnv.LOOP_LOCAL_OPERATOR_FALLBACK_ACTOR_USER_ID;
  server = spawn('npm', ['run', 'start', '--', '-p', port], { env: serverEnv, stdio: 'inherit' });
  await waitForServer();

  let response = await fetch(`${baseURL}/api/auth/operator-session`, { cache: 'no-store' });
  assert.equal(response.status, 200);
  let data = await response.json();
  assert.equal(data.authenticated, false);
  assert.equal(data.operator, false);
  assert.equal(data.fallbackEnabled, false);

  response = await fetch(`${baseURL}/api/local-submissions`, {
    headers: { 'x-loop-local-operator-token': emergencyKey },
  });
  assert.equal(response.status, 401, 'shared key must be rejected when fallback enablement is absent');
  data = await response.json();
  assert.equal(data.error, 'operator authentication required');

  response = await fetch(`${baseURL}/api/local-submissions`, {
    headers: { Authorization: 'Bearer invalid-auth-smoke-token' },
  });
  assert.equal(response.status, 401, 'invalid Supabase bearer token must be rejected');

  response = await fetch(`${baseURL}/account`, { cache: 'no-store' });
  assert.equal(response.status, 200);
  assert((await response.text()).includes('Your Loop Local account'));

  console.log('loop_local_operator_auth_integration_smoke_ok');
} finally {
  await stopServer();
}
