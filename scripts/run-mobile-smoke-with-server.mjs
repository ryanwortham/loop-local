#!/usr/bin/env node
// mobile-smoke-full-runner-pass: build, start, run mobile smoke, and clean up.
import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const port = process.env.LOOP_LOCAL_SMOKE_PORT || '3012';
const baseURL = process.env.LOOP_LOCAL_SMOKE_URL || `http://127.0.0.1:${port}`;
const startupTimeoutMs = Number(process.env.LOOP_LOCAL_SMOKE_STARTUP_TIMEOUT_MS || 30000);
let serverProcess = null;

function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: options.capture ? ['ignore', 'pipe', 'pipe'] : 'inherit',
      env: { ...process.env, ...(options.env || {}) },
      shell: false,
    });
    let stdout = '';
    let stderr = '';
    if (options.capture) {
      child.stdout?.on('data', (chunk) => { stdout += chunk.toString(); process.stdout.write(chunk); });
      child.stderr?.on('data', (chunk) => { stderr += chunk.toString(); process.stderr.write(chunk); });
    }
    child.on('error', reject);
    child.on('exit', (code, signal) => {
      if (code === 0) return resolve({ stdout, stderr });
      reject(new Error(`${command} ${args.join(' ')} failed with code ${code ?? signal}`));
    });
  });
}

async function waitForServer(url) {
  const started = Date.now();
  while (Date.now() - started < startupTimeoutMs) {
    try {
      const response = await fetch(url, { cache: 'no-store' });
      if (response.ok) return;
    } catch {
      // Server is still booting.
    }
    await delay(500);
  }
  throw new Error(`Timed out waiting for ${url}`);
}

async function killServer() {
  if (!serverProcess || serverProcess.killed) return;
  serverProcess.kill('SIGTERM');
  await Promise.race([
    new Promise((resolve) => serverProcess.once('exit', resolve)),
    delay(5000).then(() => {
      if (!serverProcess.killed) serverProcess.kill('SIGKILL');
    }),
  ]);
}

async function main() {
  console.log('npm run build');
  await runCommand('npm', ['run', 'build']);

  console.log(`npm run start -- -p ${port}`);
  serverProcess = spawn('npm', ['run', 'start', '--', '-p', port], {
    stdio: 'inherit',
    env: process.env,
    shell: false,
  });
  serverProcess.on('error', (error) => {
    throw error;
  });

  try {
    await waitForServer(baseURL);
    console.log('npm run test:mobile:smoke');
    await runCommand('npm', ['run', 'test:mobile:smoke'], {
      env: { LOOP_LOCAL_SMOKE_URL: baseURL },
    });
    console.log('loop_local_mobile_smoke_full_runner_ok');
  } finally {
    await killServer();
  }
}

process.on('SIGINT', async () => {
  await killServer();
  process.exit(130);
});
process.on('SIGTERM', async () => {
  await killServer();
  process.exit(143);
});

main().catch(async (error) => {
  console.error(error?.stack || error?.message || error);
  await killServer();
  process.exit(1);
});
