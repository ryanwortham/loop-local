# Loop Local Production Persistence and Authentication Implementation Plan

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Move Loop Local from one-host/process state to durable Supabase persistence and authenticated operator identity using controlled, reversible subsystem cutovers while preserving guest submissions.

**Architecture:** Keep the existing repository boundary and add Supabase behind explicit environment-selected adapters. Apply additive schema/RLS changes first, prove unauthorized access is denied, then cut over authentication, submissions, media, saves, review state, audit logging, and rate limiting independently. Keep the file adapter and immutable backups as bounded rollback artifacts until final acceptance.

**Tech Stack:** Next.js 16, TypeScript, Supabase Postgres/Auth/Storage/RLS, pgTAP, Node test runner, Playwright.

---

## Global gates

- Never print or commit Supabase keys, tokens, connection strings, status capabilities, or row PII.
- Back up affected files and canonical data before each release.
- Follow RED–GREEN–REFACTOR for every behavior change.
- Production schema/service-secret changes require a reviewed migration, rollback procedure, and explicit approval immediately before execution.
- No production persistence cutover occurs in Release 2A.
- Each cutover must include parity/reconciliation output and a tested rollback switch.

### Task 1: Capture Release 2A recovery artifacts

**Objective:** Preserve local canonical data, migration sources, Git state, and the best available live-schema snapshot before edits.

**Files:**
- Backup: `/Users/promax/AI/system/backups/loop-local-phase2a-<timestamp>/`

**Steps:**
1. Copy `runtime-data/local-submissions.json` and `supabase/migrations/`.
2. Record Git HEAD and cleanliness.
3. Attempt linked migration/schema export without exposing credentials.
4. If linked export is unavailable, record the credential/tooling gate and do not apply production migrations.
5. Verify backup file counts and source checksum.

### Task 2: Add database-level RLS and self-elevation tests

**Objective:** Specify the security behavior before adding schema.

**Files:**
- Create: `supabase/tests/database/production_persistence_rls.test.sql`
- Modify: `package.json`

**RED:**
1. Add pgTAP assertions proving normal users cannot enumerate other submissions, elevate themselves, modify overrides, read rate-limit state, or alter audit logs.
2. Add positive assertions for own-record reads and operator-authorized review/audit actions.
3. Run `supabase test db` and verify failure because Release 2A schema/functions are absent.

**GREEN:** Implement Task 3, apply locally only, and rerun until all assertions pass.

### Task 3: Add the additive Release 2A schema and RLS migration

**Objective:** Create durable persistence/security primitives without changing application reads or writes.

**Files:**
- Create: `supabase/migrations/<timestamp>_production_persistence_auth_foundation.sql`
- Create: `supabase/rollback/<timestamp>_production_persistence_auth_foundation.rollback.sql`

**Schema:**
- `profiles.app_role` with user/operator values and self-elevation prevention.
- `local_submissions` with optional authenticated owner, hashed status capability, explicit status, JSON payload, publication mapping, timestamps, and indexes.
- `submission_review_events` with immutable chronological actions and authenticated actor identity where applicable.
- `event_category_overrides` with operator actor and timestamps.
- `operator_audit_logs` with immutable actor/action/target/timestamp records.
- `public_rate_limits` plus an atomic server-only consumption function.

**Security:**
- Enable RLS on every new table.
- Anonymous clients cannot enumerate submissions.
- Authenticated users can read only their own submissions/history.
- Operators are recognized only from server-side profile state.
- Audit rows reject update/delete.
- Rate-limit state is inaccessible to clients; only the server role can call the atomic function.
- Never store plaintext status capabilities or raw IP addresses.

**Verification:**
1. Apply migration to the local Supabase stack only.
2. Run pgTAP tests.
3. Run migration lint and `git diff --check`.
4. Independently review specification compliance and security quality.

### Task 4: Review and approve the production migration

**Objective:** Establish an explicit production mutation gate.

**Steps:**
1. Present exact schema objects, policies, grants, rollback limitations, and backup status.
2. Obtain a live schema dump/database credential through an approved secret-handling path if the linked CLI remains unavailable.
3. Obtain explicit approval immediately before `supabase db push` or equivalent.
4. Apply only the additive migration.
5. Probe only sanitized table/function/policy presence.
6. Confirm the app still uses the file adapter and stable preview remains healthy.

### Task 5: Add Supabase browser/server session infrastructure

**Objective:** Establish sign-in, sign-out, refresh, and server-verified user identity.

**Files:**
- Create browser/server Supabase client modules and auth callback route.
- Add focused auth/session tests before implementation.
- Do not introduce a service-role secret until the production secret gate is approved.

**Verification:** Session survives navigation/reload; server rejects forged identity; signed-out behavior remains usable.

### Task 6: Add minimal account/profile experience

**Objective:** Provide accessible sign-in/sign-up/sign-out/profile controls without blocking guest discovery or Post Local.

**Tests:** Browser tests for account creation/sign-in UI, validation, sign-out, and guest continuity.

### Task 7: Replace normal operator-token access with authenticated role checks

**Objective:** Protect `/operator/reviews` and review APIs using server-verified operator identity.

**RED:** Tests prove a normal user and signed-out visitor receive 401/403 while an operator succeeds.

**Implementation:** Keep the shared token only behind `LOOP_LOCAL_ENABLE_LEGACY_OPERATOR_TOKEN=false` by default; log any emergency fallback use.

### Task 8: Record authenticated operator identity for every mutation

**Objective:** Ensure update, needs-changes, approve, publish, delete, replace, and category-override actions atomically create immutable audit rows.

**Tests:** One audit assertion per mutation plus update/delete denial for audit rows.

### Task 9: Implement repository contract tests

**Objective:** Define one behavior suite for file and Supabase adapters.

**Files:**
- Create adapter-neutral repository contract fixtures/tests.
- Cover empty reads, create, replay, update, review history, publish, delete, overrides, and concurrency/idempotency.

### Task 10: Implement `SupabaseLocalSubmissionsRepository`

**Objective:** Satisfy the existing repository interface without changing the default adapter.

**Implementation:** Add `LOOP_LOCAL_SUBMISSIONS_ADAPTER=file|supabase`, default `file`; fail closed on invalid config; use server-only credentials/session context.

### Task 11: Import and reconcile local submissions

**Objective:** Migrate stable IDs and history without deleting the source file.

**Steps:**
1. Create dry-run importer.
2. Hash capabilities; never log plaintext.
3. Import transactionally/idempotently.
4. Compare counts, IDs, status hashes, review actions, and publication mappings.
5. Produce sanitized reconciliation output.

### Task 12: Cut the stable preview to Supabase submissions

**Objective:** Switch only submission persistence after parity passes.

**Verification:** Create/read/review/publish across process restart; run two app instances against shared state; keep file backup read-only and verify rollback switch.

### Task 13: Add governed Storage buckets and upload constraints

**Objective:** Store pending media privately and approved event media publicly.

**Schema/config:** Private `submission-media`; public `event-media`; ownership/operator RLS; allowed JPEG/PNG/WebP types; byte limits; non-user-controlled object paths.

### Task 14: Integrate pending-media access and publication promotion

**Objective:** Let authorized submitters/operators access pending media and promote approved assets atomically with publication.

**Tests:** Unauthorized reads fail, operator reads succeed, invalid MIME/size fail, promotion preserves checksum.

### Task 15: Migrate embedded data URLs

**Objective:** Upload existing media, verify hashes/counts, update records, and only then remove embedded payloads.

**Rollback:** Retain immutable pre-migration JSON and media manifest until acceptance.

### Task 16: Connect authenticated saved events

**Objective:** Replace account saves with `saved_events` while preserving guest local saves.

**Tests:** Guest local save, authenticated shared save, RLS isolation, sign-in merge, duplicate idempotency, sign-out continuity.

### Task 17: Add durable atomic rate limiting

**Objective:** Replace the process-local map with the server-only atomic Postgres function.

**Tests:** Shared counts across two app instances, window reset, malformed request consumption, operator bypass, no client table/RPC access.

### Task 18: Complete durable review history and category overrides

**Objective:** Make Supabase the canonical source for review events and overrides and verify feed integration.

### Task 19: Remove legacy query capability support

**Objective:** Accept status capabilities only from URL fragments converted client-side to the private header.

**RED:** Add tests proving page/API query tokens are rejected and are never serialized into responses, logs, or referrers.

**Implementation:** Remove query parsing/redirect compatibility; retain fragment hydration and header transport.

### Task 20: Remove shared-token fallback and complete final cutover

**Objective:** Disable/remove emergency token access after authenticated operator acceptance.

**Verification:** Full unit/contracts, pgTAP RLS negatives, lint, typecheck, build, API smoke, mobile smoke, two-instance durability, process restart, stable HTTPS routes, reconciliation, clean Git tree, GitHub main equality, and final nine-item evidence audit.
