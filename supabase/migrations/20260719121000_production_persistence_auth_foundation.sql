-- Loop Local Phase 2A: additive production persistence and authorization foundation.
-- This migration creates schema and policies only. Application persistence remains file-backed
-- until the separately approved repository cutover.

alter table public.profiles
  add column if not exists app_role text not null default 'user';

update public.profiles
set app_role = case when is_admin then 'operator' else 'user' end
where app_role not in ('user', 'operator')
   or (is_admin and app_role <> 'operator');

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conrelid = 'public.profiles'::regclass
      and conname = 'profiles_app_role_check'
  ) then
    alter table public.profiles
      add constraint profiles_app_role_check check (app_role in ('user', 'operator'));
  end if;
end $$;

create or replace function public.is_loop_operator()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and (app_role = 'operator' or is_admin = true)
  );
$$;

revoke all on function public.is_loop_operator() from public;
grant execute on function public.is_loop_operator() to authenticated, service_role;

create or replace function public.prevent_profile_admin_self_elevation()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.is_loop_operator() then
    if new.app_role = 'operator' or new.is_admin = true then
      new.app_role := 'operator';
      new.is_admin := true;
    else
      new.app_role := 'user';
      new.is_admin := false;
    end if;
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.app_role := 'user';
    new.is_admin := false;
  else
    new.app_role := old.app_role;
    new.is_admin := old.is_admin;
  end if;
  return new;
end;
$$;

create table if not exists public.local_submissions (
  id uuid primary key,
  owner_user_id uuid references auth.users(id) on delete set null,
  status_token_hash text unique,
  status text not null default 'pending_review'
    check (status in ('pending_review', 'needs_changes', 'approved_local', 'published_local')),
  submission_data jsonb not null default '{}'::jsonb,
  published_event_id uuid references public.events(id) on delete set null,
  submitted_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint local_submissions_status_token_hash_check
    check (status_token_hash is null or status_token_hash ~ '^[0-9a-f]{64}$')
);

create index if not exists idx_local_submissions_owner_created_at
  on public.local_submissions (owner_user_id, created_at desc);
create index if not exists idx_local_submissions_status_submitted_at
  on public.local_submissions (status, submitted_at asc);
create index if not exists idx_local_submissions_published_event_id
  on public.local_submissions (published_event_id)
  where published_event_id is not null;

create table if not exists public.submission_review_events (
  id bigint generated always as identity primary key,
  submission_id uuid not null references public.local_submissions(id) on delete cascade,
  action text not null check (action ~ '^[a-z][a-z0-9_]{1,63}$'),
  from_status text,
  to_status text,
  note text,
  actor_type text not null default 'operator'
    check (actor_type in ('submitter', 'operator', 'system')),
  actor_user_id uuid references auth.users(id) on delete set null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint submission_review_events_operator_actor_check
    check (actor_type <> 'operator' or actor_user_id is not null)
);

create index if not exists idx_submission_review_events_submission_created_at
  on public.submission_review_events (submission_id, created_at asc, id asc);
create index if not exists idx_submission_review_events_actor_created_at
  on public.submission_review_events (actor_user_id, created_at desc)
  where actor_user_id is not null;

create table if not exists public.event_category_overrides (
  event_id uuid primary key references public.events(id) on delete cascade,
  category text not null check (char_length(btrim(category)) between 1 and 80),
  source_category text not null check (char_length(btrim(source_category)) between 1 and 80),
  reviewed_by uuid not null references auth.users(id) on delete restrict,
  reviewed_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_event_category_overrides_reviewed_by_at
  on public.event_category_overrides (reviewed_by, reviewed_at desc);

create table if not exists public.operator_audit_logs (
  id bigint generated always as identity primary key,
  actor_user_id uuid not null references auth.users(id) on delete restrict,
  action text not null check (action ~ '^[a-z][a-z0-9_.]{1,95}$'),
  target_type text not null check (action <> '' and char_length(target_type) between 1 and 64),
  target_id text not null check (char_length(target_id) between 1 and 160),
  metadata jsonb not null default '{}'::jsonb,
  request_id uuid,
  created_at timestamptz not null default now()
);

create index if not exists idx_operator_audit_logs_actor_created_at
  on public.operator_audit_logs (actor_user_id, created_at desc);
create index if not exists idx_operator_audit_logs_target_created_at
  on public.operator_audit_logs (target_type, target_id, created_at desc);
create unique index if not exists idx_operator_audit_logs_request_id
  on public.operator_audit_logs (request_id)
  where request_id is not null;

create table if not exists public.public_rate_limits (
  scope text not null check (scope ~ '^[a-z][a-z0-9_-]{1,63}$'),
  identity_hash text not null check (identity_hash ~ '^[0-9a-f]{64}$'),
  request_count integer not null check (request_count >= 0),
  window_started_at timestamptz not null,
  window_ends_at timestamptz not null,
  updated_at timestamptz not null default now(),
  primary key (scope, identity_hash),
  constraint public_rate_limits_window_check check (window_ends_at > window_started_at)
);

create index if not exists idx_public_rate_limits_window_ends_at
  on public.public_rate_limits (window_ends_at);

create or replace function public.set_loop_updated_at()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists local_submissions_set_updated_at on public.local_submissions;
create trigger local_submissions_set_updated_at
  before update on public.local_submissions
  for each row execute function public.set_loop_updated_at();

drop trigger if exists event_category_overrides_set_updated_at on public.event_category_overrides;
create trigger event_category_overrides_set_updated_at
  before update on public.event_category_overrides
  for each row execute function public.set_loop_updated_at();

create or replace function public.enforce_operator_review_actor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_loop_operator() then
    raise exception 'operator role required' using errcode = '42501';
  end if;
  new.actor_type := 'operator';
  new.actor_user_id := auth.uid();
  return new;
end;
$$;

drop trigger if exists submission_review_events_enforce_actor on public.submission_review_events;
create trigger submission_review_events_enforce_actor
  before insert on public.submission_review_events
  for each row execute function public.enforce_operator_review_actor();

create or replace function public.enforce_category_override_actor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.is_loop_operator() then
    raise exception 'operator role required' using errcode = '42501';
  end if;
  new.reviewed_by := auth.uid();
  new.reviewed_at := coalesce(new.reviewed_at, now());
  return new;
end;
$$;

drop trigger if exists event_category_overrides_enforce_actor on public.event_category_overrides;
create trigger event_category_overrides_enforce_actor
  before insert or update on public.event_category_overrides
  for each row execute function public.enforce_category_override_actor();

create or replace function public.reject_review_history_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'submission review history is immutable' using errcode = '42501';
end;
$$;

drop trigger if exists submission_review_events_immutable on public.submission_review_events;
create trigger submission_review_events_immutable
  before update or delete on public.submission_review_events
  for each row execute function public.reject_review_history_mutation();

create or replace function public.reject_operator_audit_mutation()
returns trigger
language plpgsql
set search_path = public, pg_temp
as $$
begin
  raise exception 'operator audit logs are immutable' using errcode = '42501';
end;
$$;

drop trigger if exists operator_audit_logs_immutable on public.operator_audit_logs;
create trigger operator_audit_logs_immutable
  before update or delete on public.operator_audit_logs
  for each row execute function public.reject_operator_audit_mutation();

create or replace function public.write_operator_audit(
  p_action text,
  p_target_type text,
  p_target_id text,
  p_metadata jsonb default '{}'::jsonb,
  p_request_id uuid default null
)
returns bigint
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  audit_id bigint;
begin
  if auth.uid() is null or not public.is_loop_operator() then
    raise exception 'operator role required' using errcode = '42501';
  end if;
  insert into public.operator_audit_logs (
    actor_user_id, action, target_type, target_id, metadata, request_id
  ) values (
    auth.uid(), p_action, p_target_type, p_target_id, coalesce(p_metadata, '{}'::jsonb), p_request_id
  )
  returning id into audit_id;
  return audit_id;
end;
$$;

create or replace function public.consume_public_rate_limit(
  p_scope text,
  p_identity_hash text,
  p_limit integer,
  p_window_seconds integer
)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  bucket public.public_rate_limits%rowtype;
  now_at timestamptz := clock_timestamp();
begin
  if p_scope !~ '^[a-z][a-z0-9_-]{1,63}$'
     or p_identity_hash !~ '^[0-9a-f]{64}$'
     or p_limit < 1 or p_limit > 10000
     or p_window_seconds < 1 or p_window_seconds > 86400 then
    raise exception 'invalid rate-limit input' using errcode = '22023';
  end if;

  insert into public.public_rate_limits (
    scope, identity_hash, request_count, window_started_at, window_ends_at, updated_at
  ) values (
    p_scope, p_identity_hash, 1, now_at,
    now_at + make_interval(secs => p_window_seconds), now_at
  )
  on conflict (scope, identity_hash) do update
  set request_count = case
        when public.public_rate_limits.window_ends_at <= now_at then 1
        else public.public_rate_limits.request_count + 1
      end,
      window_started_at = case
        when public.public_rate_limits.window_ends_at <= now_at then now_at
        else public.public_rate_limits.window_started_at
      end,
      window_ends_at = case
        when public.public_rate_limits.window_ends_at <= now_at
          then now_at + make_interval(secs => p_window_seconds)
        else public.public_rate_limits.window_ends_at
      end,
      updated_at = now_at
  returning * into bucket;

  return jsonb_build_object(
    'allowed', bucket.request_count <= p_limit,
    'remaining', greatest(0, p_limit - bucket.request_count),
    'resetAt', extract(epoch from bucket.window_ends_at)::bigint
  );
end;
$$;

alter table public.local_submissions enable row level security;
alter table public.submission_review_events enable row level security;
alter table public.event_category_overrides enable row level security;
alter table public.operator_audit_logs enable row level security;
alter table public.public_rate_limits enable row level security;

drop policy if exists local_submissions_select_own_or_operator on public.local_submissions;
create policy local_submissions_select_own_or_operator
  on public.local_submissions for select to authenticated
  using (owner_user_id = auth.uid() or public.is_loop_operator());

drop policy if exists local_submissions_insert_own on public.local_submissions;
create policy local_submissions_insert_own
  on public.local_submissions for insert to authenticated
  with check (owner_user_id = auth.uid() and status = 'pending_review');

drop policy if exists local_submissions_update_own_revision on public.local_submissions;
create policy local_submissions_update_own_revision
  on public.local_submissions for update to authenticated
  using (owner_user_id = auth.uid() and status in ('pending_review', 'needs_changes'))
  with check (owner_user_id = auth.uid() and status in ('pending_review', 'needs_changes'));

drop policy if exists local_submissions_operator_all on public.local_submissions;
create policy local_submissions_operator_all
  on public.local_submissions for all to authenticated
  using (public.is_loop_operator())
  with check (public.is_loop_operator());

drop policy if exists submission_review_events_select_own_or_operator on public.submission_review_events;
create policy submission_review_events_select_own_or_operator
  on public.submission_review_events for select to authenticated
  using (
    public.is_loop_operator()
    or exists (
      select 1 from public.local_submissions s
      where s.id = submission_id and s.owner_user_id = auth.uid()
    )
  );

drop policy if exists submission_review_events_operator_insert on public.submission_review_events;
create policy submission_review_events_operator_insert
  on public.submission_review_events for insert to authenticated
  with check (public.is_loop_operator());

drop policy if exists event_category_overrides_public_read on public.event_category_overrides;
create policy event_category_overrides_public_read
  on public.event_category_overrides for select to anon, authenticated
  using (true);

drop policy if exists event_category_overrides_operator_insert on public.event_category_overrides;
create policy event_category_overrides_operator_insert
  on public.event_category_overrides for insert to authenticated
  with check (public.is_loop_operator());

drop policy if exists event_category_overrides_operator_update on public.event_category_overrides;
create policy event_category_overrides_operator_update
  on public.event_category_overrides for update to authenticated
  using (public.is_loop_operator())
  with check (public.is_loop_operator());

drop policy if exists event_category_overrides_operator_delete on public.event_category_overrides;
create policy event_category_overrides_operator_delete
  on public.event_category_overrides for delete to authenticated
  using (public.is_loop_operator());

drop policy if exists operator_audit_logs_operator_read on public.operator_audit_logs;
create policy operator_audit_logs_operator_read
  on public.operator_audit_logs for select to authenticated
  using (public.is_loop_operator());

revoke all on public.local_submissions from anon;
revoke all on public.submission_review_events from anon;
revoke all on public.operator_audit_logs from anon, authenticated;
revoke all on public.public_rate_limits from anon, authenticated;
revoke insert, update, delete on public.event_category_overrides from anon;

grant select, insert, update on public.profiles to authenticated;
grant all on public.profiles to service_role;
grant select, insert, update on public.local_submissions to authenticated;
grant select, insert on public.submission_review_events to authenticated;
grant select on public.event_category_overrides to anon, authenticated;
grant insert, update, delete on public.event_category_overrides to authenticated;
grant select on public.operator_audit_logs to authenticated;

grant all on public.local_submissions to service_role;
grant all on public.submission_review_events to service_role;
grant all on public.event_category_overrides to service_role;
grant select, insert on public.operator_audit_logs to service_role;
grant all on public.public_rate_limits to service_role;
grant usage, select on all sequences in schema public to service_role;
grant usage, select on sequence public.submission_review_events_id_seq to authenticated;

revoke all on function public.write_operator_audit(text, text, text, jsonb, uuid) from public, anon;
grant execute on function public.write_operator_audit(text, text, text, jsonb, uuid) to authenticated;

revoke all on function public.consume_public_rate_limit(text, text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_public_rate_limit(text, text, integer, integer) to service_role;

notify pgrst, 'reload schema';
