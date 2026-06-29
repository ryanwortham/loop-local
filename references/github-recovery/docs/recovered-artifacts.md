# Recovered Artifacts

Recovered from:

```text
/Users/ryanwortham/.openclaw/workspace/inbox/imports/pizzabot-migration-2026-06-23--1934/raw/productivebot
```

Additional cache artifacts recovered from:

```text
/Users/ryanwortham/.openclaw/workspace/inbox/imports/pizzabot-migration-2026-06-23--1934/raw/.openclaw-productivebot-hxwf/cache
```

## Included Files

- `supabase/migrations/20260629152300_looplocal_profiles_moderation.sql`
- `supabase/migrations/20260629163000_local_platform_phase6_geospatial.sql`
- `recovered/local-platform-phase6-live-migration.sql`
- `recovered/local-platform-supabase-live.metadata.env`
- `recovered/inspect_events_columns.sql`
- `recovered/apply_looplocal_confirm_qa_ui.js`
- `recovered/apply_looplocal_inspect_columns_ui.js`
- `recovered/apply_looplocal_profiles_moderation_ui.js`
- `recovered/apply_looplocal_profiles_trigger_ui.js`
- `recovered/confirm_looplocal_qa.redacted.sql`
- `recovered/tunnel-snapshot-2026-06-29/`
- `recovered/compiled-src/`

## Not Included

The original `confirm_looplocal_qa.sql` contained a temporary QA password and was not committed as-is. A redacted placeholder version is included instead.

## Caution

The recovered JavaScript files are old browser automation helpers. They include absolute paths from the old Productivebot machine and should be treated as historical recovery artifacts, not current production scripts.

`recovered/local-platform-supabase-live.metadata.env` contains non-secret project metadata only. It does not include Supabase access tokens, database passwords, service role keys, anon keys, or connection strings.

The tunnel snapshot is recovered from a public Next.js/Turbopack dev build. It contains compiled client modules, chunks, route HTML, CSS, and public assets, not the pristine original repository.
