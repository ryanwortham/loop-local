-- Test-only prerequisites matching the live Local Loop tables that predate this repository's
-- additive migration history. This file is never pushed to production.

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique
);

create table if not exists public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique
);

insert into public.cities (id, name, slug)
values ('0a803864-18f2-436e-9c9f-a2e755a776a9', 'Granite City', 'granite-city')
on conflict (id) do update set name = excluded.name, slug = excluded.slug;

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text,
  status text not null default 'draft',
  starts_at timestamptz not null,
  ends_at timestamptz,
  location_name text,
  price_text text,
  business_id uuid,
  city_id uuid,
  category_id uuid,
  post_kind text,
  description text,
  created_by uuid references auth.users(id) on delete set null
);

alter table public.events add column if not exists slug text;

-- The live schema requires city_id. Local security fixtures predate that constraint and
-- insert unrelated synthetic events directly, so keep the prerequisite permissive and
-- assert repository city resolution explicitly in local_submissions_repository.test.sql.
alter table public.events alter column city_id drop not null;
