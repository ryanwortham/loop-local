# Loop Local

Loop Local is a local-discovery prototype for events, businesses, and community activity around St. Louis. The application combines a public Supabase event feed with an operator-reviewed **Post Local** workflow for locally submitted listings.

## Current product state

The current implementation is a technically strong private-preview build with real Supabase-backed persistence and explicit launch-quality gates:

- live `starts_at` values are normalized into deterministic visible St. Louis market date and time fields;
- homepage cards expose the event start through semantic `<time datetime="…">` markup;
- browser media limits and API payload boundaries share one limits module;
- navigations and private/dynamic routes are excluded from service-worker caches;
- submitter status capabilities use URL fragments and private, no-store responses;
- the consumer shell no longer carries an unreachable duplicate operator workflow;
- the dedicated Supabase Auth and role-gated operator experience remains at `/operator/reviews`;
- submissions, review history, governed media, category overrides, rate limits, and account saves use the Supabase repository in the preview/production configuration;
- discovery no longer presents simulated proximity, popularity, featured, map, or “Tonight” semantics as real;
- `/api/health` distinguishes transport health from launch-quality content readiness;
- CI, public-deployment, uptime-monitor, and rollback workflows exist, but public Vercel hosting is not configured yet;
- global CSP, HSTS, frame, MIME, opener, referrer, and permissions headers are covered by a runtime configuration contract;
- the complete baseline is covered by contracts, unit tests, API smoke tests, mobile browser smoke tests, and local pgTAP/RLS tests.

The current launch-readiness source of truth is [`docs/audits/2026-07-21-launch-readiness-audit.md`](docs/audits/2026-07-21-launch-readiness-audit.md). A green Vercel workflow does not imply that a deployment occurred when repository credentials are absent.

## Stable stakeholder preview

Tailnet-private HTTPS preview:

```text
https://promaxs-macbook-pro.taile79b82.ts.net/
```

Verified preview routes:

```text
/                 200 — Loop Local homepage
/post-local       200 — submission workflow
/sw.js            200 — current service worker
/api/feed         200 — JSON feed
```

The HTTPS hostname and Tailscale Serve proxy are stable, but access requires a device connected to the authorized tailnet. The production origin currently runs in a detached `screen` session on the Mac. It survives SSH disconnects but does **not** automatically restart after a Mac reboot; reboot persistence remains a deployment follow-up.

## Product flows

### Consumer discovery

- Card, list, map, and calendar views
- Search, location, category, moment, and sorting controls
- Event detail routes under `/events/[slug]`
- Saved-event state stored locally in the browser
- Live-feed health and stale/unavailable states

### Post Local

- Multi-step business/event submission at `/post-local`
- Shared browser upload maximum: `700 KB` per image
- Encoded image maximum: `1,000,000` characters
- Total API payload maximum: `2,500,000` bytes
- Private submitter status links using `#statusToken=…`
- Revision and resubmission support for requested changes

### Operator review

- Dedicated route: `/operator/reviews`
- Supabase Auth session with an operator-authorized profile
- Reviewer notes, approval, publication, and submitter handoff links
- Server-side publication-readiness checks remain authoritative

The private preview uses the Supabase submission repository. The file adapter remains only as a local/test fallback and is not the intended public-production store.

## Data and time behavior

The public feed uses Supabase project `itraeknotcdtdzaeukan` (`Local Loop App`). Valid live timestamps remain unchanged in `startsAt` and are normalized for the configured local market:

```text
date: YYYY-MM-DD
time: h:mm AM/PM CDT|CST
timezone: America/Chicago
```

`LOOP_LOCAL_FEED_TIME_ZONE` accepts a valid IANA time zone and defaults to `America/Chicago`. Formatting happens server-side, including daylight-saving changes and local calendar-day rollover, so browsers receive one deterministic St. Louis market time.

## Service-worker policy

`public/sw.js` uses cache `loop-local-static-v2` and precaches only stable icon assets.

- Navigations are network-first.
- API, auth, Post Local status, and operator routes bypass service-worker caching.
- Dynamic/private pages are not persisted in browser caches.
- Offline navigation without a network response returns a plain-text `503`; there is intentionally no offline application shell yet.

## Local development

Requirements: Node.js, npm, and the project environment file on the development machine. Never print or commit environment values.

```bash
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:3001
```

Production build and server:

```bash
npm run build
npm run start
```

## Verification

Run the configured deterministic gate:

```bash
npm run test:all
npm run build
npm run test:api:local:full
npm run test:mobile:full
npm run test:db:rls
npm run test:repository:local-db
git diff --check
```

The suite covers:

- scaffold and product contracts;
- live-feed reliability and configured market-time normalization;
- event taxonomy and operator-reviewed category overrides;
- submission quality, upload boundaries, and public rate limiting;
- local-submission API privacy and lifecycle behavior;
- global launch security headers and private-route no-store/no-referrer controls;
- mobile interaction behavior and direct homepage date/time rendering;
- Supabase RLS and shared file/Supabase repository behavior;
- ESLint and TypeScript;
- production compilation and representative runtime routes.

Smoke runners use isolated temporary submission stores and clean them up after execution. They must not write fixtures into the default preview feed.

## Important files

```text
app/page.tsx
app/api/feed/route.ts
app/api/local-submissions/route.ts
app/api/local-submissions/[id]/route.ts
components/app-shell.tsx
components/post-local-wizard.tsx
components/operator-review-panel.tsx
lib/feed-reliability.ts
lib/live-feed-server.ts
lib/local-submission-limits.ts
lib/local-submissions-store.ts
public/sw.js
scripts/feed-reliability.test.ts
scripts/mobile-interaction-smoke.mjs
```

## Safety and privacy rules

- Never commit or print `.env*`, tokens, API keys, database passwords, service-role keys, connection strings, or authorization headers.
- Do not expose submitter status capabilities in query parameters, logs, caches, or referrers.
- Do not run destructive remote database operations without explicit approval.
- Do not publish public submission responses containing unrelated operator-queue records.
- Keep dynamic/private routes out of service-worker caches.
- Preserve the dedicated operator workflow rather than duplicating it in the consumer shell.

## Known follow-ups

1. Configure and verify the approved Vercel project, GitHub deployment credentials, public health URL, and alert destination.
2. Raise the live feed above the launch thresholds (inventory, category diversity, media coverage, and trusted action domains) without guessing or fabricating production data.
3. Add privacy, terms, support, password recovery, and account/data-deletion flows before opening public account creation.
4. Resolve the retained file-adapter output-tracing warnings before treating managed-host artifacts as fully clean.
5. Add reboot persistence for the private Mac preview only if explicitly approved as an OS-level change.
6. Extend configured market-time display to per-venue timezones when Loop Local expands beyond one market.
