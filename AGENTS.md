# Loop Local agent handoff

This repository is the canonical working copy of Loop Local. An agent opening it on a new machine should begin with this file, then read `HANDOFF.md`, `README.md`, and `docs/deployment-runbook.md` before changing code or infrastructure.

## First actions

1. Run `git status --short --branch` and preserve any existing work. Never discard or overwrite uncommitted changes.
2. Read `HANDOFF.md` for the dated state snapshot, access model, setup sequence, verification commands, and remaining launch blockers.
3. Copy `.env.example` to `.env.local` only when needed. Populate it through the machine's protected credential store or the service dashboards; never put secrets in chat, shell history, logs, commits, or documentation.
4. Install the Node version from `.nvmrc`, run `npm ci`, then run the proportional verification commands listed in `HANDOFF.md`.
5. Treat `docs/audits/2026-07-21-launch-readiness-audit.md` as historical evidence, not current runtime truth. Refresh `HANDOFF.md` after material deployment, data, access, or launch-readiness changes.

## Safety and authority boundaries

- Do not expose `.env.local`, Supabase service-role keys, database passwords, access tokens, Vercel tokens, GitHub tokens, or submitter data.
- Do not mutate production Supabase schema/data, deploy publicly, alter domains/billing, rotate credentials, or change access policies without explicit owner approval.
- Use the Supabase anon key only in browser-safe variables. `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Keep the file repository adapter for tests/local fallback only; preview and production are intended to use `LOCAL_SUBMISSIONS_ADAPTER=supabase`.
- A green Vercel workflow is not proof of a deployment. Independently verify the public URL and `/api/health`.
- Never fabricate event inventory, popularity, distance, imagery, or source URLs to satisfy readiness gates.

## Sources of truth

- Current handoff status: `HANDOFF.md`
- Product/runtime overview: `README.md`
- Deployment, monitoring, rollback: `docs/deployment-runbook.md`
- Supabase cutover and rollback: `docs/runbooks/local-submissions-supabase-cutover.md`
- Database schema: `supabase/migrations/`
- Application configuration contract: `.env.example`
- Automated behavior: `package.json` and `.github/workflows/`

