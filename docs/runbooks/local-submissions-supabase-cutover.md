# Local submissions Supabase cutover runbook

## Safety invariants

- The file adapter remains the default until an explicitly approved preview cutover.
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to browser code, logs, command output, or committed files.
- Import is additive/soft-delete based. Do not delete normalized audit or review-history rows during rollback.
- Preserve `runtime-data/local-submissions.json` unchanged and create a verified mode-`0400` backup before applying.
- Stop if dry-run reports database-incompatible IDs or if reconciliation is not exact.

## Prerequisites

1. `20260719121000_production_persistence_auth_foundation.sql` is applied.
2. `20260719143000_local_submissions_repository_bridge.sql` has passed local pgTAP/RLS tests and is approved/applied.
3. Stable preview is healthy on `LOCAL_SUBMISSIONS_ADAPTER=file`.
4. The server-only service credential is available through an approved secret channel.

## Dry run

From the repository root, with the server-only credential injected into the current process environment:

```bash
npm run repository:import -- \
  --source runtime-data/local-submissions.json
```

Review:

- source and destination counts;
- missing/extra submission and publication IDs;
- status/history/override/audit mismatches;
- source and destination SHA-256 state hashes.

The report never contains plaintext status capabilities.

## Apply and reconcile

Choose a new backup path outside the repository:

```bash
npm run repository:import:apply -- \
  --source runtime-data/local-submissions.json \
  --backup /Users/promax/AI/system/backups/loop-local-phase2c-YYYYMMDD-HHMMSS/local-submissions.pre-cutover.json
```

Success requires:

- verified source backup with mode `0400`;
- exact queue/publication/status/history/override/audit reconciliation;
- successful capability-hash authorization checks;
- a second identical import reports `alreadyReconciled: true` and `applied: false`.

## Preview cutover

Only after the import succeeds:

1. Set the preview server environment to `LOCAL_SUBMISSIONS_ADAPTER=supabase`.
2. Keep `SUPABASE_SERVICE_ROLE_KEY` server-only.
3. Restart the stable preview.
4. Verify create, idempotent replay, needs-changes, resubmit, approval, publish, delete, override, capability status lookup, audit identity, and the public feed.
5. Start a second preview process against the same database and verify concurrent writes preserve both records.
6. Restart both processes and verify data remains available.

## Rollback

Rollback is a configuration switch, not a database deletion:

1. Set `LOCAL_SUBMISSIONS_ADAPTER=file`.
2. Restart the stable preview.
3. Verify the unchanged original file or its verified mode-`0400` backup is readable.
4. Keep Supabase repository rows, review history, audit logs, and publication mappings intact for diagnosis/reconciliation.
5. Do not remove the migration or delete durable rows as part of emergency rollback.

After the incident, reconcile changes made while either adapter was active before attempting another cutover.
