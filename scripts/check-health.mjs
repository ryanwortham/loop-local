#!/usr/bin/env node

const args = new Set(process.argv.slice(2));
const valueAfter = (flag) => {
  const index = process.argv.indexOf(flag);
  return index >= 0 ? process.argv[index + 1] : undefined;
};

const url = valueAfter('--url') || process.env.LOOP_LOCAL_HEALTH_URL;
const quiet = args.has('--quiet');
const expectPublic = args.has('--expect-public') || process.env.LOOP_LOCAL_MONITOR_EXPECT_PUBLIC === '1';
const webhookUrl = process.env.LOOP_LOCAL_ALERT_WEBHOOK_URL;
const timeoutMs = Number(process.env.LOOP_LOCAL_MONITOR_TIMEOUT_MS || 10000);

function redactUrl(value) {
  if (!value) return value;
  try {
    const parsed = new URL(value);
    parsed.username = '';
    parsed.password = '';
    parsed.search = '';
    parsed.hash = '';
    return parsed.toString();
  } catch {
    return '[invalid-url]';
  }
}

function summarize(payload, httpStatus) {
  return {
    service: payload?.service || 'loop-local',
    status: payload?.status || 'unknown',
    httpStatus,
    checkedAt: payload?.checkedAt || new Date().toISOString(),
    environment: payload?.environment,
    deploymentTarget: payload?.deployment?.target,
    publicUrlConfigured: payload?.deployment?.publicUrlConfigured,
    feedStatus: payload?.feed?.status,
    feedCount: payload?.feed?.count,
    feedQualityReady: payload?.feed?.quality?.ready,
    feedQualityIssues: payload?.feed?.quality?.issues || [],
    submissionsAdapter: payload?.submissions?.adapter,
    pendingReviewCount: payload?.submissions?.pendingReviewCount,
  };
}

async function sendAlert(summary, errorMessage) {
  if (!webhookUrl) return;
  const body = {
    text: `Loop Local health alert: ${summary.status || 'unknown'} (${summary.httpStatus || 'no-http'})`,
    service: 'loop-local',
    severity: summary.status === 'down' ? 'critical' : 'warning',
    error: errorMessage,
    summary,
  };
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (error) {
    console.error(`alert_delivery_failed=${error instanceof Error ? error.message : 'unknown'}`);
  } finally {
    clearTimeout(timeout);
  }
}

async function main() {
  if (!url) {
    console.error('LOOP_LOCAL_HEALTH_URL or --url is required');
    process.exit(2);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  let summary = { service: 'loop-local', status: 'down', checkedAt: new Date().toISOString(), target: redactUrl(url) };

  try {
    const response = await fetch(url, { signal: controller.signal, headers: { accept: 'application/json' } });
    const payload = await response.json().catch(() => ({}));
    summary = summarize(payload, response.status);

    const failures = [];
    if (!response.ok) failures.push(`http_${response.status}`);
    if (payload?.service !== 'loop-local') failures.push('wrong_service_identity');
    if (!['ok', 'degraded'].includes(payload?.status)) failures.push(`bad_status_${payload?.status || 'missing'}`);
    if (expectPublic && payload?.deployment?.publicUrlConfigured !== true) failures.push('public_url_not_configured');

    if (failures.length) {
      const message = failures.join(',');
      await sendAlert(summary, message);
      console.error(JSON.stringify({ ok: false, target: redactUrl(url), failures, summary }, null, 2));
      process.exit(1);
    }

    if (!quiet) console.log(JSON.stringify({ ok: true, target: redactUrl(url), summary }, null, 2));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'health probe failed';
    await sendAlert(summary, message);
    console.error(JSON.stringify({ ok: false, target: redactUrl(url), error: message, summary }, null, 2));
    process.exit(1);
  } finally {
    clearTimeout(timeout);
  }
}

main();
