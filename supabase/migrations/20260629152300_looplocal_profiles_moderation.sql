-- Live profile persistence and admin moderation support.
-- Additive and safe for existing Local Loop App data.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  account_type text not null default 'Individual',
  name text not null,
  email text not null,
  display_name text not null,
  organization_name text,
  phone text,
  website text,
  address text,
  logo_url text,
  description text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

alter table public.profiles add column if not exists account_type text not null default 'Individual';
alter table public.profiles add column if not exists name text not null default '';
alter table public.profiles add column if not exists email text not null default '';
alter table public.profiles add column if not exists display_name text not null default '';
alter table public.profiles add column if not exists organization_name text;
alter table public.profiles add column if not exists phone text;
alter table public.profiles add column if not exists website text;
alter table public.profiles add column if not exists address text;
alter table public.profiles add column if not exists logo_url text;
alter table public.profiles add column if not exists description text;
alter table public.profiles add column if not exists is_admin boolean not null default false;
alter table public.profiles add column if not exists created_at timestamptz not null default now();
alter table public.profiles add column if not exists updated_at timestamptz not null default now();

alter table public.events add column if not exists category text not null default 'Community';
alter table public.events add column if not exists moderated_at timestamptz;
alter table public.events add column if not exists rejection_reason text;
notify pgrst, 'reload schema';

create or replace function public.is_loop_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and is_admin = true
  );
$$;

create or replace function public.prevent_profile_admin_self_elevation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.is_loop_admin() then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.is_admin := false;
  elsif tg_op = 'UPDATE' then
    new.is_admin := old.is_admin;
  end if;

  return new;
end;
$$;

drop trigger if exists profiles_prevent_admin_self_elevation on public.profiles;
create trigger profiles_prevent_admin_self_elevation
  before insert or update on public.profiles
  for each row execute function public.prevent_profile_admin_self_elevation();

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_select_own_or_admin'
  ) then
    create policy "profiles_select_own_or_admin"
      on public.profiles for select
      to authenticated
      using (id = auth.uid() or public.is_loop_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_upsert_own'
  ) then
    create policy "profiles_upsert_own"
      on public.profiles for insert
      to authenticated
      with check (id = auth.uid());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'profiles' and policyname = 'profiles_update_own'
  ) then
    create policy "profiles_update_own"
      on public.profiles for update
      to authenticated
      using (id = auth.uid() or public.is_loop_admin())
      with check (id = auth.uid() or public.is_loop_admin());
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'events' and policyname = 'events_admin_read_pending'
  ) then
    create policy "events_admin_read_pending"
      on public.events for select
      to authenticated
      using (public.is_loop_admin() and status in ('pending', 'rejected', 'draft'));
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public' and tablename = 'events' and policyname = 'events_admin_moderate_pending'
  ) then
    create policy "events_admin_moderate_pending"
      on public.events for update
      to authenticated
      using (public.is_loop_admin() and status in ('pending', 'rejected', 'draft', 'approved'))
      with check (public.is_loop_admin());
  end if;
end $$;
