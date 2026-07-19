begin;

create extension if not exists pgtap with schema extensions;
select plan(15);

create or replace function pg_temp.try_sql(statement text)
returns boolean
language plpgsql
security invoker
as $$
begin
  execute statement;
  return true;
exception when others then
  return false;
end;
$$;

select ok(exists(select 1 from storage.buckets where id = 'submission-media'), 'private submission-media bucket exists');
select ok(exists(select 1 from storage.buckets where id = 'event-media'), 'public event-media bucket exists');
select is((select public from storage.buckets where id = 'submission-media'), false, 'submission media is private');
select is((select public from storage.buckets where id = 'event-media'), true, 'approved event media is public');
select is((select file_size_limit from storage.buckets where id = 'submission-media'), 700000::bigint, 'submission media enforces the 700 KB limit');
select is((select file_size_limit from storage.buckets where id = 'event-media'), 700000::bigint, 'event media enforces the 700 KB limit');
select is((select allowed_mime_types from storage.buckets where id = 'submission-media'), array['image/jpeg','image/png','image/webp']::text[], 'submission media accepts only governed raster formats');
select is((select allowed_mime_types from storage.buckets where id = 'event-media'), array['image/jpeg','image/png','image/webp']::text[], 'event media accepts only governed raster formats');

insert into auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
values
  ('61111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'media-owner@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('62222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'media-other@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('63333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'media-operator@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, account_type, name, email, display_name, is_admin, app_role)
values
  ('61111111-1111-4111-8111-111111111111', 'Individual', 'Media Owner', 'media-owner@example.test', 'Media Owner', false, 'user'),
  ('62222222-2222-4222-8222-222222222222', 'Individual', 'Media Other', 'media-other@example.test', 'Media Other', false, 'user'),
  ('63333333-3333-4333-8333-333333333333', 'Individual', 'Media Operator', 'media-operator@example.test', 'Media Operator', false, 'user')
on conflict (id) do update set is_admin = excluded.is_admin, app_role = excluded.app_role;

alter table public.profiles disable trigger profiles_prevent_admin_self_elevation;
update public.profiles set is_admin = true, app_role = 'operator' where id = '63333333-3333-4333-8333-333333333333';
alter table public.profiles enable trigger profiles_prevent_admin_self_elevation;

insert into public.local_submissions (id, owner_user_id, status_token_hash, status, submission_data)
values ('6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '61111111-1111-4111-8111-111111111111', repeat('6', 64), 'pending_review', '{}'::jsonb)
on conflict (id) do nothing;

insert into storage.objects (bucket_id, name, owner_id, metadata)
values
  ('submission-media', '6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event.webp', '61111111-1111-4111-8111-111111111111', '{"mimetype":"image/webp","size":128}'::jsonb),
  ('event-media', 'local-approved-6aaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa/event.webp', null, '{"mimetype":"image/webp","size":128}'::jsonb)
on conflict (bucket_id, name) do nothing;

set local role anon;
select is((select count(*)::integer from storage.objects where bucket_id = 'submission-media'), 0, 'anonymous clients cannot read pending submission media');
select is((select count(*)::integer from storage.objects where bucket_id = 'event-media'), 1, 'anonymous clients can read approved event media');

reset role;
set local role authenticated;
select set_config('request.jwt.claim.sub', '62222222-2222-4222-8222-222222222222', true);
select is((select count(*)::integer from storage.objects where bucket_id = 'submission-media'), 0, 'another authenticated user cannot read pending media');

select set_config('request.jwt.claim.sub', '61111111-1111-4111-8111-111111111111', true);
select is((select count(*)::integer from storage.objects where bucket_id = 'submission-media'), 1, 'the authenticated submission owner can read pending media');
select is(pg_temp.try_sql($attempt$insert into storage.objects (bucket_id, name) values ('submission-media', 'client-controlled/path.webp')$attempt$), false, 'owners cannot choose or upload direct object paths');

select set_config('request.jwt.claim.sub', '63333333-3333-4333-8333-333333333333', true);
select is((select count(*)::integer from storage.objects where bucket_id = 'submission-media'), 1, 'operators can read pending media');
select is(pg_temp.try_sql($attempt$delete from storage.objects where bucket_id = 'submission-media'$attempt$), false, 'operators cannot mutate media outside trusted server workflows');

select * from finish();
rollback;
