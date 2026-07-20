#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

eval "$(supabase status -o env)"

DB_CONTAINER="supabase_db_loop-local"
ACTOR_ID="2c000000-0000-4000-8000-0000000000aa"
CONTRACT_IDS=(
  "2c000000-0000-4000-8000-000000000001"
  "2c000000-0000-4000-8000-000000000003"
  "2c000000-0000-4000-8000-000000000010"
  "2c000000-0000-4000-8000-000000000011"
  "2c000000-0000-4000-8000-000000000012"
  "2c000000-0000-4000-8000-000000000013"
  "2c000000-0000-4000-8000-000000000014"
  "2c000000-0000-4000-8000-000000000015"
  "2c000000-0000-4000-8000-000000000016"
  "2c000000-0000-4000-8000-000000000017"
  "2c000000-0000-4000-8000-000000000018"
  "2c000000-0000-4000-8000-000000000019"
  "2c000000-0000-4000-8000-00000000001a"
  "2c000000-0000-4000-8000-00000000001b"
)
IDS_SQL="$(printf "'%s'," "${CONTRACT_IDS[@]}")"
IDS_SQL="${IDS_SQL%,}"

cleanup_contract_rows() {
  docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -q -c "
    set session_replication_role = replica;
    delete from public.event_category_overrides
      where event_id in (${IDS_SQL})
         or reviewed_by = '${ACTOR_ID}'::uuid;
    delete from public.operator_audit_logs
      where request_id = '2c000000-0000-4000-8000-000000000002'::uuid
         or actor_user_id = '${ACTOR_ID}'::uuid;
    delete from public.submission_review_events where submission_id in (${IDS_SQL});
    delete from public.local_submissions where id in (${IDS_SQL});
    delete from public.events where id in (${IDS_SQL});
    delete from public.profiles where id = '${ACTOR_ID}'::uuid;
    delete from auth.identities where user_id = '${ACTOR_ID}'::uuid;
    delete from auth.users where id = '${ACTOR_ID}'::uuid;
    set session_replication_role = origin;
  " >/dev/null
}

cleanup_contract_rows
trap cleanup_contract_rows EXIT

docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -q -c "
  insert into auth.users (
    id, aud, role, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at
  ) values (
    '${ACTOR_ID}'::uuid,
    'authenticated',
    'authenticated',
    'repository-contract-actor@example.invalid',
    '',
    now(),
    '{}'::jsonb,
    '{}'::jsonb,
    now(),
    now()
  );
" >/dev/null

NEXT_PUBLIC_SUPABASE_URL="$API_URL" \
SUPABASE_SERVICE_ROLE_KEY="$SERVICE_ROLE_KEY" \
LOOP_LOCAL_REPOSITORY_CONTRACT_ACTOR_ID="$ACTOR_ID" \
node scripts/supabase-repository-local-contract.mjs

cleanup_contract_rows
trap - EXIT

residue_count="$(docker exec "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres -Atq -c "
  select
    (select count(*) from public.local_submissions where id in (${IDS_SQL}))
    + (select count(*) from public.events where id in (${IDS_SQL}))
    + (select count(*) from public.operator_audit_logs where request_id = '2c000000-0000-4000-8000-000000000002'::uuid)
    + (select count(*) from auth.users where id = '${ACTOR_ID}'::uuid);
")"
if [[ "$residue_count" != "0" ]]; then
  echo "repository contract cleanup left ${residue_count} rows" >&2
  exit 1
fi

echo "loop_local_supabase_repository_contract_cleanup_ok"
