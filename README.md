# Loop Local

Recovery and source-control workspace for the Loop Local app.

## Current Status

This repository has been prepared as a clean place to collect Loop Local source, Supabase migrations, and recovered artifacts.

The full frontend app source has not been recovered yet. The files currently included are the LoopLocal-specific Supabase/admin artifacts found in the local migrated Productivebot workspace.

Known Supabase project reference from recovered scripts:

```text
itraeknotcdtdzaeukan
```

## What Is Here

- `supabase/migrations/20260629152300_looplocal_profiles_moderation.sql`
  - Adds/reconciles `profiles` fields, admin checks, and event moderation policies.
- `recovered/`
  - Recovered browser/Supabase SQL helper scripts from the old workspace.
- `docs/access-and-recovery.md`
  - What is still needed for full source access.
- `docs/recovered-artifacts.md`
  - Inventory of the recovered files.

## What Is Still Needed

For true full app access, add one of the following:

1. Original GitHub repository source.
2. Original local source folder.
3. Source zip/export from the app owner.
4. Access to the machine/session running the current Cloudflare tunnel.

Supabase access alone is not enough to reconstruct the original frontend app.
