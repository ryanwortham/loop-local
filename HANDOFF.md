# Loop Local machine-transfer handoff

**Snapshot date:** 2026-09-07  
**Repository:** `https://github.com/ryanwortham/loop-local.git`  
**Default branch:** `main`  
**Local app port:** `3001`

This file is the starting point for a human or OpenClaw agent moving Loop Local to another machine. It records what is in Git, what must be re-authenticated, what is intentionally not stored in the repository, and the app state at the snapshot date.

## Current state at this snapshot

- The project is a Next.js application backed by Supabase for the live feed, submissions, moderation, media, category overrides, rate limits, auth profiles, and saved events.
- The intended public hosting target is Vercel. The local checkout is currently linked (in ignored `.vercel/project.json`) to the Vercel project named `loop-local`.
- Vercel CLI authentication is currently valid on the source machine for account `ryanwortham`. This login is machine-local and must be repeated on a replacement machine.
- GitHub CLI authentication is currently valid on the source machine for account `ryanwortham`. This login is machine-local and must be repeated on a replacement machine.
- Supabase project reference is `itraeknotcdtdzaeukan` (`Local Loop App`). The source machine's Supabase CLI authentication failed verification on 2026-09-07 and must be renewed before CLI-managed database work.
- No local server was listening on port `3001` when this snapshot was written. Historical documents describe a tailnet-only preview, but its current availability must be re-verified rather than assumed.
- The latest historical launch audit classifies the app as a strong private-preview release candidate, not a public-launch-ready product. Its recorded blockers include live-content quality, compliance/account lifecycle, and production monitoring/alerting. Re-run the health and launch checks before relying on those old findings.
- At snapshot time, local `main` was at `d855536` and the local remote-tracking ref reported it two commits behind `github/main`. The checkout also contained uncommitted user work in UI/config/smoke-test files. Preserve and reconcile that work; do not reset it.

## What transfers through Git

- Complete application source, lockfile, migrations, tests, CI/deploy workflows, launchd templates, documentation, and this handoff.
- `.env.example`, which is the variable-name contract but contains no credentials.
- Non-secret Supabase project metadata and the GitHub remote URL.

The following intentionally do **not** transfer through Git:

- `.env.local` and all real environment values;
- GitHub, Vercel, Supabase, database, or Tailscale login sessions;
- ignored `.vercel/` link metadata (recreated with `vercel link` or `vercel pull`);
- ignored Supabase `.temp/` link/session metadata (recreated with `supabase link`);
- `node_modules/`, `.next/`, runtime data, and logs;
- macOS LaunchAgent installation and Tailscale Serve state.

## New-machine setup

### 1. Clone and protect the working state

```bash
git clone https://github.com/ryanwortham/loop-local.git
cd loop-local
git status --short --branch
git log -1 --oneline --decorate
```

If the old machine has uncommitted work, commit it to a transfer branch or create a reviewed patch before moving. Copying only the GitHub repository will not include uncommitted files or `.env.local`.

### 2. Install the runtime

Use Node 24 LTS as declared in `.nvmrc`, then:

```bash
npm ci
cp .env.example .env.local
```

Fill `.env.local` using protected credential entry or the service dashboards. Do not paste credential values into an agent conversation or commit them.

### 3. Restore service access

| Service | Identity/project | Restore action | Safe proof |
| --- | --- | --- | --- |
| GitHub | `ryanwortham/loop-local` | Authenticate GitHub CLI/browser on the new machine, then confirm repository access. | `gh auth status` and `git fetch github --dry-run` |
| Vercel | project `loop-local` | Authenticate Vercel CLI, run `vercel link`, choose the existing project, and pull the intended environment. | `vercel whoami`, then inspect the linked project name without printing env values |
| Supabase | ref `itraeknotcdtdzaeukan` | Authenticate Supabase CLI, then link the existing project. Database password/service keys must come from protected storage or the Supabase dashboard. | `supabase projects list` and `supabase link --project-ref itraeknotcdtdzaeukan` |
| Tailscale | authorized tailnet | Sign in and recreate/verify Serve routing only if the private preview is still required. | `tailscale status` and a route probe |

Authentication commands may open browser or masked host-owned prompts. Never put tokens or passwords directly in command arguments, shell variables, URLs, docs, or chat.

### 4. Configure the application

Minimum local Supabase-backed preview variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_PROJECT_REF`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `LOCAL_SUBMISSIONS_ADAPTER=supabase`

For file-only tests or isolated fallback development, use `LOCAL_SUBMISSIONS_ADAPTER=file`; do not mistake that for the intended preview/production configuration.

Vercel production variables and GitHub Actions secrets are listed in `docs/deployment-runbook.md`. Retrieve values from protected service configuration; do not copy them into this repository.

### 5. Verify locally

```bash
npm run typecheck
npm run lint
npm run test:all
npm run build
npm run dev
```

Then probe:

```bash
curl -fsS http://127.0.0.1:3001/api/health
```

Expected invariants for a Supabase-backed preview:

- `service` is `loop-local`;
- feed transport is reachable or explicitly reports stale/unavailable;
- `submissions.adapter` is `supabase`;
- no secrets or submitter data appear in the response.

Additional higher-cost checks:

```bash
npm run test:api:local:full
npm run test:mobile:full
npm run test:db:rls
npm run test:repository:local-db
```

### 6. Verify deployment state before making it live

1. Read `docs/deployment-runbook.md` completely.
2. Confirm Vercel project linkage, production environment-variable names, the intended domain/audience, and GitHub Actions secrets.
3. Run the full test/build gates.
4. Deploy only with owner approval.
5. Independently probe the resulting public origin and `/api/health`; do not infer success from a green workflow alone.
6. Configure and test `LOOP_LOCAL_HEALTH_URL` plus the approved alert route.
7. Record the deployment URL, commit SHA, health result, and any accepted degraded gates by updating this file.

## Recovery and rollback

- Code rollback: promote the last known-good Vercel deployment, then probe `/api/health`.
- Database changes: use reviewed migrations in `supabase/migrations/` and the relevant rollback/runbook. Never improvise a production rollback.
- Private Mac preview: templates live under `system/launchd/`; installation is machine-specific and requires explicit approval.
- Historical recovery artifacts under `references/github-recovery/` explain the original reconstruction. They are background material, not the current setup guide.

## Handoff completion checklist

- [ ] All intended source changes are committed and pushed to a named transfer branch.
- [ ] `git status` is understood; no important untracked or ignored project data is stranded.
- [ ] The new machine can authenticate separately to GitHub, Vercel, Supabase, and (if needed) Tailscale.
- [ ] `.env.local` has been recreated through protected credential handling.
- [ ] Vercel and Supabase links point to the existing projects, not newly created duplicates.
- [ ] `npm ci`, tests, build, local health, and critical UI routes pass.
- [ ] Current deployment and monitoring state has been independently verified.
- [ ] This snapshot section is refreshed with the new commit, runtime, deployment, and blockers.

