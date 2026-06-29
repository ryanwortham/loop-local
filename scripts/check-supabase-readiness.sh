#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

echo "== Loop Local Supabase readiness =="
echo "workspace: $(pwd)"
echo

echo "-- cli --"
if command -v supabase >/dev/null 2>&1; then
  supabase --version
else
  echo "missing: supabase CLI"
fi

echo

echo "-- project --"
echo "project_ref: itraeknotcdtdzaeukan"
[ -f supabase/config.toml ] && echo "config: present" || echo "config: missing"
[ -f .env.local ] && echo ".env.local: present (values not printed)" || echo ".env.local: missing"
if [ -f supabase/.temp/project-ref ]; then
  printf 'cloud link project-ref: '
  cat supabase/.temp/project-ref
  printf '\n'
else
  echo "cloud link project-ref: missing"
fi

echo

echo "-- local status --"
supabase status 2>/dev/null || echo "local Supabase not running or not initialized"
