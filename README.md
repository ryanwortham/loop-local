# Loop Local

Recovery and source-control workspace for the Loop Local app.

## Current Status

This repository has been prepared as a clean place to collect Loop Local source, Supabase migrations, and recovered artifacts.

The original pristine frontend repository has not been found yet. A public Cloudflare tunnel was reachable on 2026-06-29 and exposed a Next.js/Turbopack dev build, so a recoverable frontend snapshot has been added under `recovered/`.

Known Supabase project reference from recovered scripts:

```text
itraeknotcdtdzaeukan
```

## What Is Here

- `supabase/migrations/20260629152300_looplocal_profiles_moderation.sql`
  - Adds/reconciles `profiles` fields, admin checks, and event moderation policies.
- `recovered/`
  - Recovered browser/Supabase SQL helper scripts from the old workspace.
  - Public tunnel HTML/chunk snapshot.
  - Compiled source modules split from exposed Next.js/Turbopack dev chunks.
- `docs/access-and-recovery.md`
  - What is still needed for full source access.
- `docs/recovered-artifacts.md`
  - Inventory of the recovered files.

## What Is Still Needed

For true original-source access, add one of the following:

1. Original GitHub repository source.
2. Original local source folder.
3. Source zip/export from the app owner.
4. Access to the machine/session running the current Cloudflare tunnel.

Supabase access alone is not enough to reconstruct the original frontend app.

## Tunnel Recovery

Recovered from:

```text
https://replaced-gaming-selected-spectacular.trycloudflare.com
```

Included recovery folders:

- `recovered/tunnel-snapshot-2026-06-29/`
  - Downloaded HTML route snapshots, public assets, CSS, and JavaScript chunks.
- `recovered/compiled-src/`
  - Per-module compiled source output split from the public dev chunks.

These recovered files are useful for rebuilding and auditing, but they are not a substitute for the original source repo because comments, exact TypeScript formatting, project config, package scripts, and server-only code may be incomplete.
