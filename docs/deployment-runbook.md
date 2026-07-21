# Loop Local production deployment runbook

Loop Local's public production target is **Vercel-managed Next.js hosting**. The Mac/Tailscale process remains an internal preview path only; it is not the public launch deployment.

## Operational requirements covered

| Area | Repository artifact |
| --- | --- |
| CI | `.github/workflows/ci.yml` |
| Public deployment workflow | `.github/workflows/deploy-vercel.yml`, `vercel.json` |
| Health endpoint | `GET /api/health` |
| Uptime monitor | `.github/workflows/uptime-monitor.yml`, `scripts/check-health.mjs` |
| Structured alerting | `LOOP_LOCAL_ALERT_WEBHOOK_URL` JSON webhook payloads from the monitor |
| Reboot-persistent local preview | `system/launchd/com.looplocal.preview.plist.example` |

## Production environment variables

Configure these in Vercel Project Settings, not in source control.

### Public/browser-safe

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_APP_VERSION` — optional display/health version, e.g. `0.1.0`
- `NEXT_PUBLIC_SITE_URL` or `LOOP_LOCAL_PUBLIC_URL` — canonical public URL used by health/readiness checks

### Server-only

- `LOCAL_SUBMISSIONS_ADAPTER=supabase` for production
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_PROJECT_REF`
- `LOOP_LOCAL_DEPLOYMENT_TARGET=vercel`
- `LOOP_LOCAL_GIT_SHA` — set by GitHub Actions during deploy when available

### GitHub Actions secrets

Required for `.github/workflows/deploy-vercel.yml`:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

Optional uptime alert webhook:

- `LOOP_LOCAL_ALERT_WEBHOOK_URL` — receives JSON alerts from `scripts/check-health.mjs`

GitHub repository variable:

- `LOOP_LOCAL_HEALTH_URL=https://<production-host>/api/health`

## CI workflow

Every push to `main` and every pull request runs:

```bash
npm ci
npm run test:all
npm run build
```

The workflow forces file-backed submission storage for CI and uses placeholder public Supabase values only for build/test paths that need public env shape. Production secrets are not required for CI.

## Production deployment workflow

Production deploys run on pushes to `main` and can also be started manually from GitHub Actions.

The deploy job:

1. checks out the commit,
2. installs with `npm ci`,
3. runs `npm run test:all`,
4. runs `npm run build`,
5. deploys with Vercel CLI using GitHub secrets,
6. probes the deployed `GET /api/health` endpoint.

Do not treat a successful deploy as launch approval unless `/api/health` returns at least `degraded` and the feed-quality issues are explicitly accepted or resolved.

## Health endpoint contract

`GET /api/health` is no-store JSON and intentionally avoids secrets/PII.

Important fields:

- `service` — must be `loop-local`
- `status` — `ok`, `degraded`, or `down`
- `deployment.target` — expected `vercel` in production
- `deployment.publicUrlConfigured` — true once the canonical URL is configured
- `feed.status` — upstream feed availability
- `feed.quality.ready` and `feed.quality.issues` — launch-quality content gate
- `submissions.adapter` — expected `supabase` in production
- `submissions.pendingReviewCount` — count only, no submitter data

## Uptime monitor and alerting

GitHub Actions runs `.github/workflows/uptime-monitor.yml` every 15 minutes when `LOOP_LOCAL_HEALTH_URL` is configured as a repository variable.

Manual local probe:

```bash
LOOP_LOCAL_HEALTH_URL=https://<production-host>/api/health npm run monitor:health
```

Quiet cron-style probe:

```bash
LOOP_LOCAL_HEALTH_URL=https://<production-host>/api/health \
LOOP_LOCAL_ALERT_WEBHOOK_URL=https://<alert-webhook> \
npm run monitor:health -- --quiet --expect-public
```

Alert payload shape is structured JSON:

```json
{
  "text": "Loop Local health alert: down (503)",
  "service": "loop-local",
  "severity": "critical",
  "error": "http_503",
  "summary": {
    "status": "down",
    "feedStatus": "unavailable",
    "submissionsAdapter": "supabase"
  }
}
```

## Local Mac preview persistence

For internal/private preview only, install the LaunchAgent template after replacing placeholders:

```bash
cp system/launchd/com.looplocal.preview.plist.example ~/Library/LaunchAgents/com.looplocal.preview.plist
plutil -replace ProgramArguments.2 -string /Users/promax/AI/workspaces/loop-local/system/launchd/run-looplocal-preview.zsh ~/Library/LaunchAgents/com.looplocal.preview.plist
launchctl bootstrap gui/$(id -u) ~/Library/LaunchAgents/com.looplocal.preview.plist
launchctl enable gui/$(id -u)/com.looplocal.preview
launchctl kickstart -k gui/$(id -u)/com.looplocal.preview
```

The LaunchAgent is reboot/login persistent, but it is still a private preview process and not the public production host.

## Rollback

Vercel rollback is preferred:

1. Open the Vercel project deployments list.
2. Promote the last known-good deployment.
3. Re-run `scripts/check-health.mjs` against `/api/health`.
4. If rollback is due to data quality, keep the code rollback separate from Supabase data remediation.

## Launch-readiness gates

Before inviting public users:

- CI green on `main`.
- Production deploy workflow green.
- `/api/health` returns `ok` or an explicitly accepted `degraded` state.
- `submissions.adapter` is `supabase` in production.
- GitHub uptime monitor is configured with a public health URL.
- Alert webhook is configured and tested.
- Feed quality issues from `/api/health.feed.quality.issues` are resolved or documented as non-blocking.
