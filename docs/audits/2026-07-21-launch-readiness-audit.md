# Loop Local Launch-Readiness Audit

**Audit date:** 2026-07-21

**Audit base commit:** `193e613` on `main` / `github/main`

**Canonical repository:** `/Users/promax/AI/workspaces/loop-local`

**Audited runtime:** tailnet-private HTTPS preview backed by Next.js on Mac port `3001`

**Scope:** product truthfulness, live data, Supabase persistence and RLS, auth/privacy, security, responsive behavior, PWA, tests/build, Git/GitHub, deployment, monitoring, rollback, and documentation

## Executive verdict

Loop Local is a strong, tested **private-preview release candidate**, but it is **not ready to announce as a public production launch**.

The engineering foundation is real: Supabase-backed submissions and saves, operator authorization, governed media, durable rate limiting, health/readiness reporting, CI, a managed-hosting workflow, rollback documentation, mobile/API smoke coverage, and 76 pgTAP/RLS assertions all pass. The previous audit's simulated discovery claims and misleading Saved empty state have been corrected and protected by tests.

The remaining launch constraints are explicit rather than hidden:

- no public Vercel project or deployment credentials are configured;
- no public health URL or alert destination is configured;
- the live feed is below its own launch-quality thresholds;
- privacy, terms, support, password recovery, and account/data-deletion flows are absent;
- the retained file-adapter fallback produces four Next output-tracing warnings during builds.

**Current severity summary**

- **P0 / critical:** 0
- **P1 / launch-blocking:** 4
- **P2 / should fix:** 6
- **P3 / polish:** 3

Public launch should remain gated. The private preview may continue for stakeholder testing.

## Evidence collected

- Clean audited base: local `main` matched `github/main` at `193e613` before the hardening worktree changes.
- Tailnet routes `/`, `/post-local`, `/account`, `/operator/reviews`, `/api/feed`, and `/api/health` returned HTTP `200` after the preview was restored.
- After the hardening build was restarted, all audited public/API routes returned CSP, HSTS, MIME, frame, opener, referrer, and permissions headers; private status/submission routes also retained their stricter no-store/no-referrer/noindex controls.
- The preview had been down at audit start: Tailscale returned `502` and port `3001` had no listener. It was safely restored in a detached `screen` session and re-probed.
- `GET /api/health` reported `service=loop-local`, submission adapter `supabase`, zero pending reviews, and a fresh `live_supabase` feed.
- GitHub CI run `29847595635` completed successfully for `193e613`.
- GitHub deploy run `29847596058` completed successfully but skipped credential-dependent deployment; no Vercel secrets, repository variables, or `.vercel/project.json` link existed.
- Scheduled uptime run `29854410589` was skipped because no public health URL is configured.
- Full local quality gates, production builds, authenticated API smoke, mobile Playwright smoke, pgTAP/RLS, repository integration, dependency audit, and `git diff --check` were executed during the audit/hardening pass.
- Browser-tool visual QA could not be repeated because the audit container has no Chrome installation. Existing Playwright mobile coverage passed, and the previous 2026-07-20 audit contains desktop/mobile visual evidence. This limitation is not represented as completed new browser coverage.
- No production data, Supabase schema, secrets, billing, Vercel account, or OS persistence configuration was changed.

## What is genuinely complete

### Product and data architecture

- Live Supabase feed with bounded stale fallback and explicit fresh/stale/unavailable states.
- Deterministic configured-market date/time normalization.
- Truthful discovery labels: simulated distance/radius/closest/popular/featured/map claims are removed or explicitly described as previews.
- Market-date-correct “Tonight” filtering and a genuine zero-row Saved empty state.
- Placeholder-domain public actions fail closed in discovery rendering.
- Feed-quality gate for inventory, category/city diversity, media coverage, placeholder actions, duplicate IDs, and expired events.
- Event details, sharing, calendar action, save state, and source/directions affordances.
- Multi-step Post Local submission, revision, review, approval, and publication workflow.

### Persistence, auth, and privacy controls

- Supabase-backed submissions, review history, publication mapping, category overrides, operator audit records, durable public rate limiting, and governed media storage.
- Supabase Auth account profile and operator-role authorization path.
- Durable account saves with ownership-scoped RLS and guest-save merge behavior.
- Fragment-based submitter status capabilities; query tokens are stripped.
- Private submission/status responses retain `private, no-store`, `no-referrer`, and `noindex` controls.
- Service worker excludes API, auth, operator, and dynamic/private submission routes.
- Service-role credentials are server-only by design and are not present in tracked source.

### Engineering and operations foundation

- CI runs install, the deterministic suite, and production build on `main` and pull requests.
- `/api/health` exposes non-sensitive transport, content-quality, deployment, and repository readiness.
- Vercel deployment and post-deploy health-probe workflow exists.
- Scheduled uptime monitor and optional structured alert webhook exist.
- Deployment runbook covers environment names, health contract, monitoring, private-preview persistence, rollback, and launch gates.
- Global CSP, HSTS, MIME, frame, opener, referrer, and permissions-policy headers now have a dedicated test contract.
- Private-route header behavior remains separately asserted.

## P1 findings — public launch blockers

### P1-1. There is no verified public production deployment

The current HTTPS endpoint is tailnet-only. GitHub has no `VERCEL_TOKEN`, `VERCEL_ORG_ID`, or `VERCEL_PROJECT_ID`, and the repository is not linked to a Vercel project. The deploy workflow's green result means “safely skipped,” not “published.”

**Required:** with explicit approval, create/link the intended Vercel project, configure the three GitHub secrets and production environment, deploy, independently probe the public origin, and verify `deployment.target=vercel`.

### P1-2. Live content fails the repository's launch-quality contract

The audited fresh Supabase feed contained:

- 5 upcoming events;
- 1 category;
- 3 cities;
- 0% event-image coverage;
- 4 placeholder-domain actions;
- 0 duplicate IDs and 0 expired events.

The endpoint correctly reports `feed.quality.ready=false` with inventory, category diversity, media coverage, and placeholder-action issues.

**Required:** curate or import trustworthy event content with valid source/action URLs and media. Production mutation needs approval and a rollback/export plan; the application must not fabricate missing values.

### P1-3. Account and submission compliance lifecycle is incomplete

The product collects account email/name and submission contact/media data but does not expose privacy policy, terms, support/contact, password recovery, account deletion, or submission/data-deletion handling.

**Required before public account creation:** approved operator/business identity, support and privacy contact, policy effective date and retention/deletion decisions, recovery flow, and authenticated account/data deletion. Legal copy must be reviewed by the owner or qualified counsel; generated drafts are not legal advice.

### P1-4. Public monitoring and alert delivery are not active

The monitor implementation exists, but `LOOP_LOCAL_HEALTH_URL` and the optional alert webhook are absent because no public origin exists. Scheduled runs are therefore skipped.

**Required:** after public deployment, configure the production health URL, choose an approved alert destination, execute a controlled alert test, and record recovery ownership.

## P2 findings — should fix

### P2-1. Managed-host builds emit four output-tracing warnings

The development/test file repository performs dynamic filesystem access. Next's NFT/Turbopack tracer warns that it may capture more of the project than intended for feed, health, and submission routes.

**Action:** statically scope the fallback, isolate it behind a development-only import boundary, or move adapter selection so managed production bundles never import the file implementation. Add a build-warning budget.

### P2-2. Private Mac preview is not reboot-persistent

The detached `screen` process survives SSH disconnects, not Mac reboot/login transitions. A LaunchAgent template exists but is not installed.

**Action:** install/test it only with explicit OS-level approval. This is not a substitute for managed public hosting.

### P2-3. Source-marker contract tests remain over-concentrated

The large Python product contract still reads source text extensively. It can preserve obsolete comments/classes while giving less confidence than user-visible browser assertions.

**Action:** continue moving critical behavior to Playwright/React/runtime tests, then retire marker-only assertions.

### P2-4. Dependency declarations use `latest`

The lockfile currently passes with zero known production vulnerabilities, but broad declarations make future installs less intentional.

**Action:** pin reviewed semver ranges and adopt controlled dependency updates.

### P2-5. PWA offline experience is minimal

The service worker correctly protects dynamic/private data but offers only a plain `503` for offline navigation.

**Action:** add an honest branded offline page without caching account, operator, API, or submitter-status content.

### P2-6. Error aggregation and product observability remain limited

Health and uptime contracts exist, but there is no approved error-aggregation service or privacy-governed product analytics path.

**Action:** define data-minimal observability after privacy policy and consent/retention decisions. Any paid provider requires approval.

## P3 findings — polish

- Desktop still carries some mobile-oriented navigation density.
- Map and calendar are intentionally limited previews rather than full geographic/calendar products.
- Discovery will remain visually sparse until real event media is curated; do not mask the data gap with synthetic claims.

## Verification status

Passing gates in this audit/hardening pass:

- `npm run test:all`
- `npm run build`
- `npm run test:api:local:full`
- `npm run test:mobile:full`
- `npm run test:db:rls` — 76/76
- `npm run test:repository:local-db`
- `npm audit --omit=dev --audit-level=high` — 0 vulnerabilities
- `git diff --check`
- dedicated security-header contract — 2/2

Nonfatal: four output-tracing warnings remain, tracked as P2-1.

## Shortest safe path to public production

1. Merge the verified launch-hardening change and keep the private preview available.
2. Obtain explicit approval for Vercel project/account setup, repository credentials, production environment configuration, and any potential billing.
3. Obtain owner decisions for legal identity, privacy/support contact, policy effective date, retention/deletion rules, and recovery/deletion behavior.
4. Implement and test privacy/terms/support/recovery/deletion before enabling public account creation.
5. Export/back up relevant Supabase production tables, then curate launch-quality events with trusted sources and media under an approved rollback plan.
6. Link/deploy Vercel, verify public headers/routes/health independently, and configure uptime plus alert delivery.
7. Run a final go/no-go audit against the public origin. Announce only when `/api/health` is `ok`, or when every remaining degraded issue has a named owner and explicit acceptance.

## Approval boundary

The following were deliberately **not** executed by this pass:

- Vercel account/project creation or token configuration;
- paid service, billing, or domain purchase;
- GitHub/Vercel/Supabase secret entry;
- production Supabase data or schema mutation;
- macOS LaunchAgent installation;
- publication of unreviewed legal policy text.
