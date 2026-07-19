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

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  name text,
  slug text unique
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
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
