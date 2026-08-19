-- Privacy-bounded unmet-demand capture. This migration is not applied automatically.
create table if not exists public.unmet_demand_signals (
  id uuid primary key default gen_random_uuid(),
  category text not null check (category in ('Any category', 'Food & Drink', 'Live Music', 'Arts & Culture', 'Family', 'School Activities', 'Sports', 'Community', 'Festivals', 'Fundraisers', 'Shopping', 'Nightlife', 'Jobs', 'City & Civic', 'Deals', 'Happy Hour', 'Local')),
  area text not null check (area in ('St. Louis City', 'North County', 'South County', 'West County', 'Mid County', 'St. Charles County', 'Metro East', 'Nearby Missouri', 'Nearby Illinois')),
  date_window text not null check (date_window in ('any_time', 'tonight', 'this_weekend', 'next_7_days', 'later')),
  result_count integer not null check (result_count between 0 and 2),
  context text not null check (context in ('empty', 'weak')),
  constraint unmet_demand_context_result_check check (
    (context = 'empty' and result_count = 0)
    or (context = 'weak' and result_count between 1 and 2)
  ),
  created_at timestamptz not null default now()
);

create index if not exists idx_unmet_demand_signals_created_at
  on public.unmet_demand_signals (created_at desc);
create index if not exists idx_unmet_demand_signals_grouping
  on public.unmet_demand_signals (category, area, date_window, created_at desc);

alter table public.unmet_demand_signals enable row level security;
revoke all on table public.unmet_demand_signals from anon, authenticated;
grant select, insert on table public.unmet_demand_signals to service_role;

create or replace function public.read_unmet_demand_summary(p_since timestamptz)
returns table (
  category text,
  area text,
  date_window text,
  request_count bigint,
  empty_count bigint,
  average_result_count numeric,
  latest_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select
    signals.category,
    signals.area,
    signals.date_window,
    count(*) as request_count,
    count(*) filter (where signals.context = 'empty') as empty_count,
    round(avg(signals.result_count)::numeric, 1) as average_result_count,
    max(signals.created_at) as latest_at
  from public.unmet_demand_signals signals
  where signals.created_at >= p_since
  group by signals.category, signals.area, signals.date_window
  order by request_count desc, latest_at desc;
$$;

revoke all on function public.read_unmet_demand_summary(timestamptz) from public, anon, authenticated;
grant execute on function public.read_unmet_demand_summary(timestamptz) to service_role;

comment on table public.unmet_demand_signals is
  'Coarse discovery demand only: category, broad area, date window, and result count. No identity or coordinates.';
