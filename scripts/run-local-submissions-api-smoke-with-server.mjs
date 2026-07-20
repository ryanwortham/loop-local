#!/usr/bin/env node
// local-submissions-api-full-runner-pass: build, start, run direct API smoke, and clean up.
// Contract markers: npm run build · npm run start -- -p · npm run test:api:local
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';
import { provisionLocalOperatorSession } from './local-operator-test-session.mjs';

const port = Number(process.env.LOOP_LOCAL_API_SMOKE_PORT || 3013);
const smokeStorePath = process.env.LOOP_LOCAL_SUBMISSIONS_STORE_PATH || `/tmp/loop-local-api-smoke-${process.pid}.json`;
const baseURL = `http://127.0.0.1:${port}`;
let server;
let operatorSession;

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

function applicationEnvironment() {
  if (!operatorSession) throw new Error('local operator session has not been provisioned');
  return {
    ...process.env,
    LOCAL_SUBMISSIONS_ADAPTER: 'file',
    LOCAL_SUBMISSIONS_FILE: smokeStorePath,
    LOOP_LOCAL_SUBMISSIONS_STORE_PATH: smokeStorePath,
    LOOP_LOCAL_OPERATOR_AUTH_SUPABASE_URL: operatorSession.supabaseUrl,
    LOOP_LOCAL_OPERATOR_AUTH_SUPABASE_ANON_KEY: operatorSession.anonKey,
  };
}

async function startServer() {
  console.log(`npm run start -- -p ${port}`);
  server = spawn('npm', ['run', 'start', '--', '-p', String(port)], { stdio: 'inherit', env: applicationEnvironment() });
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
    operatorSession = await provisionLocalOperatorSession();
    await run('npm', ['run', 'build'], { env: applicationEnvironment() });
    await startServer();
    await run('npm', ['run', 'test:api:local'], {
      env: {
        ...applicationEnvironment(),
        LOOP_LOCAL_API_SMOKE_URL: baseURL,
        LOOP_LOCAL_OPERATOR_ACCESS_TOKEN: operatorSession.accessToken,
        LOOP_LOCAL_OPERATOR_ACTOR_USER_ID: operatorSession.userId,
      },
    });
    console.log('loop_local_local_submissions_api_full_runner_ok');
  } finally {
    await killServer();
    if (operatorSession) await operatorSession.cleanup();
  }
}

main().catch(async (error) => {
  await killServer();
  console.error(error?.stack || error?.message || error);
  process.exit(1);
});
