begin;

create extension if not exists pgtap with schema extensions;
select plan(36);

select has_column('public', 'profiles', 'app_role', 'profiles has explicit app_role');
select has_table('public', 'local_submissions', 'local_submissions exists');
select has_table('public', 'submission_review_events', 'submission_review_events exists');
select has_table('public', 'event_category_overrides', 'event_category_overrides exists');
select has_table('public', 'operator_audit_logs', 'operator_audit_logs exists');
select has_table('public', 'public_rate_limits', 'public_rate_limits exists');
select has_table('public', 'saved_events', 'saved_events exists');
select has_function('public', 'is_loop_operator', array[]::text[], 'operator predicate exists');
select has_function('public', 'consume_public_rate_limit', array['text', 'text', 'integer', 'integer'], 'atomic rate-limit function exists');

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

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values
  ('11111111-1111-4111-8111-111111111111', 'authenticated', 'authenticated', 'owner-one@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('22222222-2222-4222-8222-222222222222', 'authenticated', 'authenticated', 'owner-two@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now()),
  ('33333333-3333-4333-8333-333333333333', 'authenticated', 'authenticated', 'operator@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;

insert into public.profiles (id, account_type, name, email, display_name, is_admin, app_role)
values
  ('11111111-1111-4111-8111-111111111111', 'Individual', 'Owner One', 'owner-one@example.test', 'Owner One', false, 'user'),
  ('22222222-2222-4222-8222-222222222222', 'Individual', 'Owner Two', 'owner-two@example.test', 'Owner Two', false, 'user'),
  ('33333333-3333-4333-8333-333333333333', 'Individual', 'Operator', 'operator@example.test', 'Operator', true, 'operator')
on conflict (id) do update set
  is_admin = excluded.is_admin,
  app_role = excluded.app_role;

-- Test bootstrap only: production operator assignment is an explicit privileged administration act.
alter table public.profiles disable trigger profiles_prevent_admin_self_elevation;
update public.profiles
set is_admin = true, app_role = 'operator'
where id = '33333333-3333-4333-8333-333333333333';
alter table public.profiles enable trigger profiles_prevent_admin_self_elevation;

insert into public.events (id, title, status, starts_at)
values
  ('44444444-4444-4444-8444-444444444444', 'RLS test event', 'approved', now() + interval '1 day'),
  ('55555555-5555-4555-8555-555555555555', 'Second RLS test event', 'approved', now() + interval '2 days')
on conflict (id) do nothing;

insert into public.saved_events (user_id, event_id)
values
  ('11111111-1111-4111-8111-111111111111', '44444444-4444-4444-8444-444444444444'),
  ('22222222-2222-4222-8222-222222222222', '44444444-4444-4444-8444-444444444444')
on conflict do nothing;

insert into public.local_submissions (
  id, owner_user_id, status_token_hash, status, submission_data
) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '11111111-1111-4111-8111-111111111111', repeat('a', 64), 'pending_review', '{"title":"Owner one"}'::jsonb),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', '22222222-2222-4222-8222-222222222222', repeat('b', 64), 'pending_review', '{"title":"Owner two"}'::jsonb)
on conflict (id) do nothing;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);

select is((select count(*)::integer from public.local_submissions), 1, 'a user sees only their own submission');
select is((select id from public.local_submissions limit 1), 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'::uuid, 'a user cannot enumerate another submission');
select is((select count(*)::integer from public.saved_events), 1, 'a user sees only their own saved events');
select is((select user_id from public.saved_events limit 1), auth.uid(), 'saved-event ownership is scoped to auth.uid');
select is(
  pg_temp.try_sql($attempt$insert into public.saved_events (user_id, event_id)
    values ('22222222-2222-4222-8222-222222222222', '55555555-5555-4555-8555-555555555555')$attempt$),
  false,
  'a user cannot save an event for another account'
);

update public.profiles
set app_role = 'operator', is_admin = true
where id = '11111111-1111-4111-8111-111111111111';
select is((select app_role from public.profiles where id = auth.uid()), 'user', 'a user cannot self-elevate app_role');
select is((select is_admin from public.profiles where id = auth.uid()), false, 'a user cannot self-elevate is_admin');

select is(
  pg_temp.try_sql($attempt$insert into public.event_category_overrides
    (event_id, category, source_category, reviewed_by)
    values ('44444444-4444-4444-8444-444444444444', 'Music', 'Community', auth.uid())$attempt$),
  false,
  'a normal user cannot create a category override'
);
select is(
  pg_temp.try_sql($attempt$insert into public.operator_audit_logs
    (actor_user_id, action, target_type, target_id)
    values (auth.uid(), 'forged', 'submission', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa')$attempt$),
  false,
  'a normal user cannot insert operator audit rows'
);
select is(
  pg_temp.try_sql($attempt$select count(*) from public.public_rate_limits$attempt$),
  false,
  'a normal user cannot read durable rate-limit state'
);
select is(
  pg_temp.try_sql($attempt$select public.consume_public_rate_limit('create', repeat('c', 64), 2, 60)$attempt$),
  false,
  'a normal user cannot call the server-only rate limiter'
);
select is(
  pg_temp.try_sql($attempt$insert into public.submission_review_events
    (submission_id, action, actor_user_id)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'approved_local', auth.uid())$attempt$),
  false,
  'a normal user cannot create operator review events'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role authenticated;
select set_config('request.jwt.claim.sub', '33333333-3333-4333-8333-333333333333', true);

select is((select count(*)::integer from public.local_submissions where coalesce((submission_data ->> 'repositoryDeleted')::boolean, false) = false), 2, 'an operator can read the review queue');
select is((select count(*)::integer from public.saved_events), 0, 'operator role does not bypass private saved-event ownership');
select ok(
  pg_temp.try_sql($attempt$insert into public.event_category_overrides
    (event_id, category, source_category, reviewed_by)
    values ('44444444-4444-4444-8444-444444444444', 'Music', 'Community', auth.uid())
    on conflict (event_id) do update set category = excluded.category$attempt$),
  'an operator can create a category override'
);
select is(
  (select reviewed_by from public.event_category_overrides where event_id = '44444444-4444-4444-8444-444444444444'),
  auth.uid(),
  'the database records the authenticated override actor'
);
select ok(
  pg_temp.try_sql($attempt$insert into public.submission_review_events
    (submission_id, action, actor_user_id)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'approved_local', auth.uid())$attempt$),
  'an operator can append a review event'
);
select is(
  (select actor_user_id from public.submission_review_events order by created_at desc limit 1),
  auth.uid(),
  'the database records the authenticated review actor'
);
select isnt(
  public.write_operator_audit('review.approved', 'submission', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', '{}'::jsonb, null),
  null,
  'an operator can append an audit row through the trusted function'
);
select is(
  (select actor_user_id from public.operator_audit_logs order by created_at desc limit 1),
  auth.uid(),
  'the audit function records auth.uid rather than a client actor'
);
select is(
  pg_temp.try_sql($attempt$update public.operator_audit_logs set action = 'tampered'$attempt$),
  false,
  'audit rows are immutable even to operators'
);
select is(
  pg_temp.try_sql($attempt$delete from public.operator_audit_logs$attempt$),
  false,
  'audit rows cannot be deleted by operators'
);

reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role service_role;

select is(
  pg_temp.try_sql($attempt$update public.submission_review_events set note = 'tampered'$attempt$),
  false,
  'review history is immutable even to the server role'
);
select is(
  pg_temp.try_sql($attempt$delete from public.submission_review_events$attempt$),
  false,
  'review history cannot be deleted by the server role'
);
select is((public.consume_public_rate_limit('create', repeat('d', 64), 2, 60)->>'allowed')::boolean, true, 'server rate limiter permits the first request');
select is((public.consume_public_rate_limit('create', repeat('d', 64), 2, 60)->>'remaining')::integer, 0, 'server rate limiter atomically reaches zero remaining');
select is((public.consume_public_rate_limit('create', repeat('d', 64), 2, 60)->>'allowed')::boolean, false, 'server rate limiter rejects requests above the shared limit');

reset role;
select * from finish();
rollback;
