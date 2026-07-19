#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
DB_CONTAINER="supabase_db_loop-local"

command -v docker >/dev/null || { echo "Docker is required for database RLS tests." >&2; exit 1; }
command -v supabase >/dev/null || { echo "Supabase CLI is required for database RLS tests." >&2; exit 1; }
docker inspect "$DB_CONTAINER" >/dev/null 2>&1 || {
  echo "Local Supabase is not running. Start it with: supabase start" >&2
  exit 1
}

apply_sql() {
  local path="$1"
  printf 'Applying local test prerequisite: %s\n' "$(basename "$path")"
  docker exec -i "$DB_CONTAINER" psql -v ON_ERROR_STOP=1 -U postgres -d postgres < "$path" >/dev/null
}

apply_sql "$ROOT/supabase/test-support/live_schema_prerequisites.sql"
apply_sql "$ROOT/supabase/migrations/20260629152300_looplocal_profiles_moderation.sql"
apply_sql "$ROOT/supabase/migrations/20260629163000_local_platform_phase6_geospatial.sql"
apply_sql "$ROOT/supabase/migrations/20260719121000_production_persistence_auth_foundation.sql"
apply_sql "$ROOT/supabase/migrations/20260719143000_local_submissions_repository_bridge.sql"
apply_sql "$ROOT/supabase/migrations/20260719153000_repository_event_city_mapping.sql"
apply_sql "$ROOT/supabase/migrations/20260719154000_repository_event_slug.sql"
apply_sql "$ROOT/supabase/migrations/20260719155000_governed_submission_media_storage.sql"

cd "$ROOT"
supabase test db
