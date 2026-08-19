-- Strong-intent event actions and a privacy-bounded verification/correction lifecycle.
create table if not exists public.event_intent_signals (
  id uuid primary key default gen_random_uuid(),
  event_key text not null check (event_key ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{0,159}$'),
  action text not null check (action in ('calendar_add', 'share', 'copy_link')),
  created_at timestamptz not null default now()
);

create index if not exists idx_event_intent_signals_event_action_created
  on public.event_intent_signals (event_key, action, created_at desc);

create table if not exists public.event_lifecycle_records (
  id uuid primary key default gen_random_uuid(),
  event_key text not null check (event_key ~ '^[A-Za-z0-9][A-Za-z0-9:_-]{0,159}$'),
  event_title text not null check (char_length(event_title) between 1 and 200),
  action text not null check (action in ('confirmed', 'cancelled', 'corrected', 'accurate', 'inaccurate')),
  reporter_type text not null check (reporter_type in ('operator', 'attendee')),
  note text not null default '' check (char_length(note) <= 500),
  created_at timestamptz not null default now(),
  constraint lifecycle_actor_action_check check (
    (reporter_type = 'operator' and action in ('confirmed', 'cancelled', 'corrected'))
    or (reporter_type = 'attendee' and action in ('accurate', 'inaccurate'))
  )
);

create index if not exists idx_event_lifecycle_records_event_created
  on public.event_lifecycle_records (event_key, created_at desc);
create index if not exists idx_event_lifecycle_records_queue
  on public.event_lifecycle_records (action, created_at desc);

alter table public.event_intent_signals enable row level security;
alter table public.event_lifecycle_records enable row level security;
revoke all on table public.event_intent_signals, public.event_lifecycle_records from anon, authenticated;
grant select, insert on table public.event_intent_signals, public.event_lifecycle_records to service_role;

create or replace function public.read_event_intent_summary()
returns table (event_key text, calendar_adds bigint, shares bigint, copy_links bigint, latest_at timestamptz)
language sql stable security definer set search_path = public, pg_temp
as $$
  select signals.event_key,
    count(*) filter (where action = 'calendar_add'),
    count(*) filter (where action = 'share'),
    count(*) filter (where action = 'copy_link'),
    max(created_at)
  from public.event_intent_signals signals
  group by signals.event_key
  order by (count(*) filter (where action = 'calendar_add')) desc,
    (count(*) filter (where action in ('share', 'copy_link'))) desc;
$$;

create or replace function public.read_event_lifecycle_states()
returns table (event_key text, action text, last_verified_at timestamptz)
language sql stable security definer set search_path = public, pg_temp
as $$
  select distinct on (records.event_key) records.event_key, records.action, records.created_at
  from public.event_lifecycle_records records
  where records.reporter_type = 'operator'
  order by records.event_key, records.created_at desc, records.id desc;
$$;

create or replace function public.read_event_lifecycle_queue()
returns table (id uuid, event_key text, event_title text, action text, reporter_type text, note text, created_at timestamptz)
language sql stable security definer set search_path = public, pg_temp
as $$
  select records.id, records.event_key, records.event_title, records.action, records.reporter_type, records.note, records.created_at
  from public.event_lifecycle_records records
  where records.reporter_type = 'attendee'
    and records.action = 'inaccurate'
    and not exists (
      select 1 from public.event_lifecycle_records resolution
      where resolution.event_key = records.event_key
        and resolution.reporter_type = 'operator'
        and resolution.created_at > records.created_at
    )
  order by records.created_at desc;
$$;

revoke all on function public.read_event_intent_summary(), public.read_event_lifecycle_states(), public.read_event_lifecycle_queue() from public, anon, authenticated;
grant execute on function public.read_event_intent_summary(), public.read_event_lifecycle_states(), public.read_event_lifecycle_queue() to service_role;

comment on table public.event_intent_signals is 'Anonymous strong-intent counts only; no account, IP, or free-form metadata.';
comment on table public.event_lifecycle_records is 'Operator verification and bounded attendee accuracy reports feeding one correction queue.';
