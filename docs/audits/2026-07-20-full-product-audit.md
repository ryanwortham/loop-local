# Loop Local Full Product Audit

**Audit timestamp:** 2026-07-20 04:04 UTC / 2026-07-19 23:04 CDT

**Canonical commit:** `128f6e6323b6879530627c65ad9de84c74c6022b`

**Canonical remote:** `github/main` (`git@github.com:ryanwortham/loop-local.git`)

**Audited runtime:** stable tailnet-private Next.js origin on the Mac, port `3001`

**Audit type:** read-only product, runtime, data, architecture, security, operations, test, and maintainability review

## Executive verdict

Loop Local has a strong technical prototype foundation: the Supabase-backed submission lifecycle, operator authorization, RLS, governed media storage, durable saved events, private submitter capabilities, feed reliability, PWA shell, mobile layout, and regression gates are real and working.

It is **not ready for a public launch or native wrapper yet**. The main constraint is no longer backend durability. It is product truthfulness and live content quality. The current private preview presents simulated discovery semantics (distance, proximity, popularity, featured status, and “Tonight”) over a six-event demo-quality feed. Several roadmap and README documents also describe an obsolete architecture and therefore cannot be treated as a reliable source of truth.

**Severity summary:**

- **P0 — Critical:** 0
- **P1 — High / launch-blocking:** 7
- **P2 — Medium / should fix:** 9
- **P3 — Low / polish:** 4

**Recommended immediate slice:** **Discovery Truthfulness + Live Data Quality Gate**. Do not expand into business dashboards, native wrappers, or monetization until this slice is complete.

## Provenance and audit method

Evidence was collected from:

- the clean canonical Git worktree and a `git archive` of the audited commit;
- the active Next.js runtime on `127.0.0.1:3001` and the Tailscale address;
- Playwright desktop and 390×844 mobile sessions;
- the public `/api/feed` response and HTTP response headers;
- route, component, migration, RLS, repository, and runbook inspection;
- full configured tests, production builds, API smoke, mobile smoke, local pgTAP/RLS tests, and the shared repository contract;
- dependency audit/outdated checks and a tracked-source secret-pattern scan.

No product code, production schema, production data, secrets, paid services, or OS configuration were changed during the audit.

## What is genuinely complete

### Product and persistence

- Live Supabase feed with bounded stale fallback and explicit health states.
- Deterministic St. Louis market date/time normalization.
- Event detail routes with share, save, directions, source, and calendar affordances.
- Multi-step Post Local submission flow with media limits and server validation.
- Durable Supabase-backed submission repository, review history, publication mapping, category overrides, and replay-safe mutation behavior.
- Supabase Auth account profile and operator-role path.
- Durable account saves with guest-save merge and ownership-scoped RLS.
- Governed media storage with storage policies and migration coverage.
- Private fragment-based submitter status capabilities and no-store/no-referrer status responses.
- Durable public submission rate limiting when the Supabase adapter is active.

### Engineering quality

- Clean canonical Git state and matching local/GitHub refs.
- Production build, TypeScript, ESLint, API smoke, and mobile smoke pass.
- Local database/RLS suite: 76/76.
- Shared file/Supabase repository behavior contract passes and cleans up its fixtures.
- `npm audit --omit=dev`: 0 known vulnerabilities across 411 production dependency records.
- No tracked secret patterns detected; no `.env` file appears in Git history. Only `.env.example` is tracked.
- Basic DOM accessibility checks found one `h1` per audited route, named buttons/links, no duplicate IDs, and labels for user-visible home/account inputs.

## Capability matrix

### Complete

- Feed reliability and time normalization
- Event detail resolution
- Post Local lifecycle
- Operator review and Supabase authorization
- Durable submission/media persistence
- Durable saved events
- Private status capabilities
- PWA manifest/icons/service-worker registration
- Mobile containment and core smoke flows

### Partial

- Discovery search and filters: functional, but important moment semantics are inaccurate.
- Map: visually polished preview only; not a geographic map.
- Calendar: list-style date view, not a real calendar experience.
- Account: sign-up/sign-in/profile works; recovery, email change, and deletion are absent.
- Analytics/geospatial: database structures exist, but the product does not use them.
- Offline/PWA: installable shell exists; offline behavior is only a plain `503`.
- Event source quality: fields exist, but production content is placeholder-grade.

### Placeholder or misleading

- Distance is hardcoded to `2.1 miles away` whenever coordinates exist.
- “Within 10 mi” is a static label and does not constrain results.
- Map pin positions are generated from list index percentages, not coordinates.
- “Closest highlight” is the first filtered event, not the closest event.
- “Popular Near You” is a slice of the feed, not popularity-ranked.
- “Featured This Week” is the first six results, not curated/featured.
- “Tonight” matches any `PM` event or text containing “tonight,” regardless of date.
- “Deals” is keyword inference, not a trusted deal/price signal.

### Absent

- Public `/events`, `/saved`, `/map`, `/businesses`, and `/businesses/[slug]` routes.
- Organization/member model and business/poster dashboard.
- User preferences or demand-intent matching.
- Real map provider integration and opt-in geolocation.
- Product analytics instrumentation and operator analytics UI.
- CI workflow, automatic deployment, health monitor, and reboot persistence.
- Privacy policy, terms, account deletion, password recovery, and support path.
- Native iOS/Android wrappers and store-readiness artifacts beyond planning docs.
- Monetization/Stripe integration, intentionally deferred.

## P1 findings — launch blockers

### P1-1. The active feed is demo-quality, not launch-quality

The audited live response was healthy and sourced from `live_supabase`, but contained only six upcoming events:

- 6/6 categories were `Community`;
- 0/6 had event imagery;
- 5/6 external event/source links resolved to `example.com`;
- 6/6 prices were `Free`;
- events covered only Collinsville, Edwardsville, and Granite City;
- no duplicate IDs or past start timestamps were present.

This makes the transport technically healthy while the product value is weak and, in the case of `example.com` ticket/source links, misleading.

**Required:** introduce a feed-quality contract and curation gate before calling data “live.” Reject placeholder domains, require trustworthy source URLs, track image/category/city coverage, and establish a minimum useful inventory.

### P1-2. Core discovery claims are simulated

`components/app-shell.tsx` currently hardcodes or derives key user promises without corresponding data:

- every geocoded event displays `2.1 miles away`;
- the map uses index-based CSS positions;
- “Closest,” “Within 10 mi,” “Popular,” and “Featured” are not backed by proximity, radius, analytics, or editorial status;
- the “Tonight” filter matches `PM` text instead of the market calendar date.

At audit time the market date was 2026-07-19. The “Tonight” heuristic matched all six events while zero events had a 2026-07-19 market date.

**Required:** either implement real semantics or rename/remove these claims. Truthful UI is more important than preserving the current visual labels.

### P1-3. Empty Saved Events renders unsaved recommendations as saved rows

With zero saved events, the Saved panel says “Save events to compare plans later” but renders three featured events inside the Saved list. Playwright reproduced this deterministically.

**Required:** render a genuine empty state with zero saved rows. Recommendations, if retained, must be in a separately labeled section and must not inherit saved styling or semantics.

### P1-4. Deployment is private and not operationally durable

The stable origin is a detached `screen` process on the Mac and is exposed only through the authorized tailnet. It survives SSH disconnects but not a reboot. The repository has no CI workflow, deployment workflow, health endpoint, external uptime monitor, or documented log rotation/alerting.

**Required before public launch:** CI, deterministic deployment, health/readiness checks, monitoring, recovery procedure, and approved reboot persistence. A macOS LaunchAgent/process manager is an OS-level change and requires explicit approval.

### P1-5. Account and submission compliance lifecycle is incomplete

The app collects account email/name and submission contact/media data, but provides no privacy policy, terms, password-reset flow, account deletion flow, data-deletion path, or support/contact route.

**Required before public account creation or app-store submission:** privacy/terms, recovery, account/data deletion, and support handling. Any paid developer-account or legal-service action requires user approval.

### P1-6. Public security-header baseline is incomplete

The audited HTTPS homepage response had appropriate private/no-cache behavior, but no repository-configured CSP, HSTS, `X-Content-Type-Options`, frame protection, permissions policy, or cross-origin opener policy. Private status routes correctly provide no-store, no-referrer, and noindex headers.

**Required:** define and test a deliberate security-header policy. Roll out CSP in report-only mode first to avoid breaking Supabase, media, or inline styles.

### P1-7. Project documentation is not a reliable source of truth

Examples:

- `README.md` says the operator queue is still file-backed although production uses Supabase.
- `LOOP_LOCAL_PRODUCT_ARCHITECTURE_PLAN.md` records 141 events, a retired Cloudflare URL/port, missing Auth/saves/event detail/admin work that now exists, and GitHub write auth as absent.
- `NATIVE_DISTRIBUTION.md` still says GitHub write access is unavailable.
- The 1,738-line product contract reads source files and locks many stale strings/comments rather than proving runtime outcomes.

**Required:** replace stale “current state” sections with one maintained capability matrix and move historical plans to an archive. Runtime behavior should be tested behaviorally, not preserved through comment/class markers.

## P2 findings — should fix

### P2-1. Build tracing warns that the whole project may be captured

Every production build passes but emits Next.js NFT/Turbopack warnings caused by dynamic filesystem paths in the retained file-repository fallback. This can inflate or destabilize deployment artifacts.

**Action:** statically scope or development-gate the file adapter and add a build-warning budget.

### P2-2. Source-marker tests create false confidence and resist cleanup

`scripts/test-product-reset-contract.py` contains 202 assertions and 197 direct source reads, with no subprocess/runtime execution. Production components also contain legacy marker comments/classes solely to satisfy these checks.

**Action:** migrate high-value contracts to React/Playwright behavior tests, then delete obsolete marker assertions and CSS pass classes.

### P2-3. UI/code concentration is high

Largest product surfaces include:

- `app/globals.css`: 2,977 lines;
- `components/post-local-wizard.tsx`: 629 lines;
- `components/app-shell.tsx`: 459 lines;
- `lib/local-submissions-store.ts`: 482 lines;
- `lib/feed-reliability.ts`: 401 lines.

**Action:** split discovery views, filters, map/calendar surfaces, wizard steps, and CSS layers by responsibility after truthfulness fixes are protected by behavior tests.

### P2-4. Target product routes and organization model remain absent

The current App Router exposes `/`, `/account`, `/events/[slug]`, `/post-local`, status, and operator review routes. Business directory/profile, dedicated saved/map/events routes, organization membership, poster dashboard, and account preferences are absent.

**Action:** add these only after real discovery/data semantics are established.

### P2-5. Geospatial and analytics database capabilities are unused

Migrations include `get_nearby_events` and `event_analytics`, but the application does not call or instrument them.

**Action:** use opt-in location + nearby RPC for distance/radius; define a privacy-minimal event taxonomy before collecting analytics.

### P2-6. Calendar export is minimal

The generated ICS data includes only version, summary, and description; it omits start/end timestamps, UID, timezone, and escaping needed for reliable calendar imports.

**Action:** generate standards-compliant ICS server-side or through a tested utility.

### P2-7. Dependency declarations use `latest`

The lockfile currently resolves cleanly and the production audit has zero known vulnerabilities, but `latest` declarations reduce reproducibility during updates. Installed core versions include Next 16.2.10, React 19.2.7, Supabase JS 2.110.7, and TypeScript 6.0.3.

**Action:** pin intentional version ranges and use a controlled dependency-update cadence. ESLint 10 and TypeScript 7 are available but should not be upgraded incidentally.

### P2-8. PWA/offline behavior is minimal

The app is installable, but the service worker only precaches icons and returns plain-text `503` for offline navigation.

**Action:** add an honest branded offline page and a documented cache/version strategy after dynamic/private route exclusions remain protected.

### P2-9. Product analytics and operational observability are absent

There is no application instrumentation, error aggregation, structured health endpoint, or launch KPI dashboard.

**Action:** add privacy-minimal observability before growth experiments; do not collect behavioral data until privacy documentation exists.

## P3 findings — polish

- Desktop presents a mobile bottom tab bar alongside desktop navigation, increasing visual density.
- “Open” card actions are vague; use “View event” or make the entire card the accessible target.
- Mobile menu duplicates bottom-nav destinations; simplify after route structure stabilizes.
- Placeholder gradients dominate the experience because the live feed has no imagery; address data first, then visual polish.

## Verification results

All configured gates passed on the audited commit:

- app scaffold and product source contracts;
- feed, taxonomy, quality, category override, rate-limit, operator-auth, repository, media, saves, and reconciliation tests;
- ESLint and TypeScript;
- production build and route generation;
- authenticated API smoke;
- mobile Playwright smoke;
- local pgTAP/RLS tests: 76/76;
- shared local Supabase repository contract and cleanup assertion;
- `git diff --check`.

Nonfatal build warnings remain as described in P2-1.

Runtime dogfood confirmed:

- desktop and mobile home load with no document-level horizontal overflow;
- feed reports fresh `live_supabase` health;
- event detail, Post Local, account, saved panel, and map view render;
- mobile menu and five bottom tabs are operable;
- the Saved empty-state defect and simulated map semantics reproduce in the stable runtime.

## Recommended execution plan

### Slice A — Discovery Truthfulness + Live Data Gate (next)

**Goal:** ensure every visible discovery claim is real or explicitly labeled as a preview.

1. Add failing behavior tests for:
   - zero saved rows in the empty Saved state;
   - market-date-correct “Tonight” filtering;
   - no hardcoded distance/closest/radius/popularity/featured claims;
   - placeholder-domain rejection in public event actions.
2. Fix the Saved empty state and “Tonight” calculation.
3. Remove or rename simulated map/proximity/popularity labels.
4. Add a feed-quality report/contract covering inventory, category diversity, media coverage, source-domain validity, city coverage, duplicate IDs, and future/past timestamps.
5. Update README/current-state docs and replace obsolete source markers with behavior tests.

**No production schema change is required.** Cleaning or replacing production event data requires explicit approval before mutation.

### Slice B — Real nearby discovery + curated content

1. Establish a trustworthy minimum event inventory and business metadata source.
2. Curate category/media/source corrections; do not guess taxonomy in presentation code.
3. Add opt-in browser location and call `get_nearby_events`.
4. Calculate and sort by real distance; provide a city-only fallback when location is denied.
5. Use real map coordinates or keep the view clearly labeled as a non-geographic preview.
6. Define editorial/analytics criteria before showing “Featured” or “Popular.”

Production data/schema work in this slice requires approval and a rollback plan.

### Slice C — Operational and trust readiness

1. Add GitHub Actions for deterministic test/build/RLS gates.
2. Add a `/api/health` readiness contract without exposing secrets.
3. Add structured logging, error aggregation, uptime monitoring, and recovery documentation.
4. Add tested security headers, beginning with CSP report-only.
5. Add privacy, terms, support, password recovery, and account/data deletion.
6. With approval, install and test reboot persistence for the Mac preview or move the public origin to managed hosting.

### Slice D — Product expansion

After Slices A–C:

1. Dedicated `/events`, `/saved`, and real `/map` routes with URL-backed state.
2. Business directory and `/businesses/[slug]` profiles.
3. Organization/member model and poster dashboard.
4. User preferences/demand matching.
5. Privacy-minimal analytics and operator insights.

### Slice E — Native and monetization

Only after the web product has trustworthy data, real nearby semantics, legal/account lifecycle, observability, and stable deployment:

- choose a Capacitor/hosted-web strategy;
- prepare store privacy and distribution assets;
- add monetization schema/checkout behind explicit paid-action approval.

## Immediate acceptance criteria

Slice A is complete only when:

- an empty Saved list renders zero saved-event rows;
- “Tonight” selects events on the configured market calendar date, with tests covering UTC rollover and DST;
- no user-facing distance/radius/closest/popular/featured claim is fabricated;
- no public event action links to placeholder domains such as `example.com`;
- feed quality is measured and fails closed against an agreed threshold;
- current-state documentation matches runtime/repository evidence;
- full test/build/API/mobile/RLS/repository gates remain green;
- the canonical main branch, stable preview, and production reconciliation are verified after release.
