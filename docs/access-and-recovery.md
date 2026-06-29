# Access And Recovery

## Goal

Recover the full Loop Local application source and keep future work in this repository.

## Current Known Backend

Recovered scripts reference this Supabase project:

```text
itraeknotcdtdzaeukan
```

The Supabase CLI connects to the Supabase backend, not to the frontend app. The frontend app will have its own source repository or source folder, plus environment variables pointing to Supabase.

## Full Access Still Requires

One of these is required before this can become the actual full app repository:

1. Original GitHub/repo URL or GitHub collaborator access.
2. Original source folder path if it exists on another machine.
3. Access to the machine/session running the Cloudflare tunnel.
4. A zip/export of the current app source.

## What Was Recovered From The Tunnel

The public Cloudflare tunnel was reachable on 2026-06-29:

```text
https://replaced-gaming-selected-spectacular.trycloudflare.com
```

It served a Next.js/Turbopack dev build for Loop Local. The reachable public assets were downloaded into:

```text
recovered/tunnel-snapshot-2026-06-29/
```

Compiled app modules were split into:

```text
recovered/compiled-src/
```

This is valuable recovery material, but it is not pristine original source. Treat it as a reconstruction aid until the real repo/source export is found.

## Recommended Recovery Order

1. Get GitHub/repo access if possible.
2. If repo access is not available, get a full source zip/export.
3. If the app only exists on a running machine, inspect the Cloudflare tunnel process and working directory.
4. Use Supabase CLI only for database/schema/auth work.

## Supabase CLI Baseline

From this repo:

```bash
supabase login
supabase link --project-ref itraeknotcdtdzaeukan
supabase db pull
```

Do not commit Supabase service role keys, personal access tokens, database passwords, or production `.env` files.
