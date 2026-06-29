-- Local Platform / Loop Local Phase 6 live additive geospatial migration.
-- Purpose: safely upgrade the existing Local Loop App schema without dropping or overwriting data.
-- Applied via Supabase dashboard API only after Ryan approved live Supabase connection.

create extension if not exists postgis;

alter table public.events add column if not exists city text;
alter table public.events add column if not exists address text;
alter table public.events add column if not exists venue text;
alter table public.events add column if not exists latitude double precision;
alter table public.events add column if not exists longitude double precision;
alter table public.events add column if not exists price text not null default 'Free' check (price in ('Free', 'Paid'));
alter table public.events add column if not exists image_url text;
alter table public.events add column if not exists phone text;
alter table public.events add column if not exists website text;
alter table public.events add column if not exists business_slug text;
alter table public.events add column if not exists follower_count integer not null default 0;
alter table public.events add column if not exists upcoming_events_count integer not null default 0;
alter table public.events add column if not exists active_promotions_count integer not null default 0;
alter table public.events add column if not exists popularity integer not null default 0;
alter table public.events add column if not exists is_active boolean not null default true;

update public.events e
set
  city = coalesce(e.city, c.name),
  venue = coalesce(e.venue, e.location_name, e.title),
  address = coalesce(e.address, e.location_name, c.name),
  latitude = coalesce(e.latitude, case c.slug
    when 'granite-city' then 38.7014
    when 'collinsville' then 38.6703
    when 'edwardsville' then 38.8114
    else 38.7014
  end),
  longitude = coalesce(e.longitude, case c.slug
    when 'granite-city' then -90.1487
    when 'collinsville' then -89.9845
    when 'edwardsville' then -89.9532
    else -90.1487
  end),
  price = case when lower(coalesce(e.price_text, 'free')) like '%free%' then 'Free' else coalesce(e.price, 'Paid') end,
  business_slug = coalesce(e.business_slug, (select b.slug from public.businesses b where b.id = e.business_id limit 1)),
  is_active = coalesce(e.is_active, true)
from public.cities c
where e.city_id = c.id;

alter table public.events
  add column if not exists location geography(Point, 4326)
  generated always as (st_setsrid(st_makepoint(longitude, latitude), 4326)::geography) stored;

alter table public.events
  add column if not exists geohash text
  generated always as (st_geohash(st_setsrid(st_makepoint(longitude, latitude), 4326), 9)) stored;

create index if not exists idx_events_location_gist on public.events using gist (location);
create index if not exists idx_events_status_starts_at on public.events (status, is_active, starts_at);
create index if not exists idx_events_city_category on public.events (city, category_id);
create index if not exists idx_events_geohash on public.events (geohash);

create table if not exists public.saved_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, event_id)
);

create index if not exists idx_saved_events_user_created_at on public.saved_events (user_id, created_at desc);

create table if not exists public.event_analytics (
  id uuid primary key default gen_random_uuid(),
  event_id uuid references public.events(id) on delete cascade,
  business_id uuid,
  user_id uuid references auth.users(id) on delete set null,
  event_name text not null check (event_name in ('profile_view', 'event_view', 'save', 'follow', 'directions_click', 'phone_click', 'website_click', 'share')),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_event_analytics_event_name_created_at on public.event_analytics (event_name, created_at desc);
create index if not exists idx_event_analytics_event_id_created_at on public.event_analytics (event_id, created_at desc);

create or replace function public.get_nearby_events(
  user_lat double precision,
  user_lng double precision,
  radius_miles double precision default 50,
  search_query text default null,
  category_filter text default null,
  city_filter text default null,
  limit_count integer default 50
)
returns table (
  id uuid,
  title text,
  category text,
  starts_at timestamptz,
  ends_at timestamptz,
  venue text,
  business_id uuid,
  business_slug text,
  city text,
  address text,
  description text,
  latitude double precision,
  longitude double precision,
  geohash text,
  price text,
  image_url text,
  phone text,
  website text,
  follower_count integer,
  upcoming_events_count integer,
  active_promotions_count integer,
  popularity integer,
  distance_miles double precision
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    e.id,
    e.title,
    coalesce(cat.name, e.post_kind, 'Community') as category,
    e.starts_at,
    e.ends_at,
    coalesce(e.venue, e.location_name, e.title) as venue,
    e.business_id,
    e.business_slug,
    coalesce(e.city, c.name) as city,
    coalesce(e.address, e.location_name, c.name) as address,
    e.description,
    e.latitude,
    e.longitude,
    e.geohash,
    e.price,
    e.image_url,
    e.phone,
    e.website,
    e.follower_count,
    e.upcoming_events_count,
    e.active_promotions_count,
    e.popularity,
    st_distance(e.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography) / 1609.344 as distance_miles
  from public.events e
  left join public.cities c on c.id = e.city_id
  left join public.categories cat on cat.id = e.category_id
  where e.status = 'approved'
    and e.is_active = true
    and e.location is not null
    and e.starts_at >= now() - interval '6 hours'
    and st_dwithin(e.location, st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography, radius_miles * 1609.344)
    and (search_query is null or search_query = '' or (e.title || ' ' || coalesce(e.venue, e.location_name, '') || ' ' || coalesce(e.city, c.name, '') || ' ' || coalesce(cat.name, '')) ilike '%' || search_query || '%')
    and (category_filter is null or category_filter = '' or cat.name = category_filter)
    and (city_filter is null or city_filter = '' or coalesce(e.city, c.name) = city_filter)
  order by distance_miles asc, e.starts_at asc, e.popularity desc
  limit least(greatest(limit_count, 1), 100);
$$;

alter table public.events enable row level security;
alter table public.saved_events enable row level security;
alter table public.event_analytics enable row level security;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'phase6_public_events_read_approved_active') then
    create policy "phase6_public_events_read_approved_active"
      on public.events for select
      using (status = 'approved' and is_active = true);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_insert_authenticated_pending') then
    create policy "events_insert_authenticated_pending"
      on public.events for insert
      to authenticated
      with check (auth.uid() = created_by and status = 'pending');
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'events' and policyname = 'events_update_own_draft_or_pending') then
    create policy "events_update_own_draft_or_pending"
      on public.events for update
      to authenticated
      using (auth.uid() = created_by and status in ('draft', 'pending'))
      with check (auth.uid() = created_by and status in ('draft', 'pending'));
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_events' and policyname = 'public_saved_events_read_own') then
    create policy "public_saved_events_read_own"
      on public.saved_events for select
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_events' and policyname = 'public_saved_events_insert_own') then
    create policy "public_saved_events_insert_own"
      on public.saved_events for insert
      with check (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'saved_events' and policyname = 'public_saved_events_delete_own') then
    create policy "public_saved_events_delete_own"
      on public.saved_events for delete
      using (auth.uid() = user_id);
  end if;

  if not exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'event_analytics' and policyname = 'public_event_analytics_insert_authenticated_or_anon') then
    create policy "public_event_analytics_insert_authenticated_or_anon"
      on public.event_analytics for insert
      with check (user_id is null or auth.uid() = user_id);
  end if;
end $$;
