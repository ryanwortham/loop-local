# Loop Local

Loop Local is a local-discovery prototype for events, businesses, and community activity around St. Louis. The application combines a public Supabase event feed with an operator-reviewed **Post Local** workflow for locally submitted listings.

## Current product state

Phase 1, **Immediate product correctness**, is implemented in the application:

- live `starts_at` values are normalized into deterministic visible UTC date and time fields;
- homepage cards expose the event start through semantic `<time datetime="…">` markup;
- browser media limits and API payload boundaries share one limits module;
- navigations and private/dynamic routes are excluded from service-worker caches;
- submitter status capabilities use URL fragments and private, no-store responses;
- the consumer shell no longer carries an unreachable duplicate operator workflow;
- the dedicated token-gated operator experience remains at `/operator/reviews`;
- the complete baseline is covered by contracts, unit tests, API smoke tests, and mobile browser smoke tests.

The canonical privacy and correctness baseline is commit `0bda3e36705b4068a8bc91c40f573f6f1829197c`. Subsequent closeout work adds the homepage rendering regression and this current-state documentation.

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
- Operator token supplied through the expected request header
- Reviewer notes, approval, publication, and submitter handoff links
- Server-side publication-readiness checks remain authoritative

The local submission repository is file-backed for the prototype. Supabase-backed persistence is not yet implemented for the operator queue.

## Data and time behavior

The public feed uses Supabase project `itraeknotcdtdzaeukan` (`Local Loop App`). Valid live timestamps are retained as `startsAt` and normalized to:

```text
date: YYYY-MM-DD
time: h:mm AM/PM UTC
```

UTC is intentional for deterministic server/browser rendering. Venue-local timezone presentation is a future enhancement.

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
git diff --check
```

The suite covers:

- scaffold and product contracts;
- live-feed reliability and UTC normalization;
- event taxonomy and operator-reviewed category overrides;
- submission quality, upload boundaries, and public rate limiting;
- local-submission API privacy and lifecycle behavior;
- mobile interaction behavior and direct homepage date/time rendering;
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

1. Add reboot persistence for the production origin with a tested macOS LaunchAgent or process manager.
2. Add venue-local timezone display while preserving deterministic timestamp storage.
3. Move the file-backed operator queue to durable Supabase persistence.
4. Continue event media and source-data quality improvements without guessing taxonomy in presentation code.
