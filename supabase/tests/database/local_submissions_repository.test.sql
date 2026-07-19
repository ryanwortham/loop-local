begin;

create extension if not exists pgtap with schema extensions;
select plan(23);

select has_table('public', 'local_submission_repository_meta', 'repository revision metadata exists');
select has_function('public', 'read_local_submission_repository_state', array[]::text[], 'atomic repository reader exists');
select has_function('public', 'replace_local_submission_repository_state', array['bigint', 'jsonb'], 'compare-and-swap repository writer exists');

create or replace function pg_temp.try_sql(statement text)
returns boolean language plpgsql security invoker as $$
begin execute statement; return true; exception when others then return false; end;
$$;

insert into auth.users (
  id, aud, role, email, encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data, created_at, updated_at
) values ('66666666-6666-4666-8666-666666666666', 'authenticated', 'authenticated', 'repository-operator@example.test', '', now(), '{}'::jsonb, '{}'::jsonb, now(), now())
on conflict (id) do nothing;
insert into public.profiles (id, account_type, name, email, display_name, is_admin, app_role)
values ('66666666-6666-4666-8666-666666666666', 'Individual', 'Repository Operator', 'repository-operator@example.test', 'Repository Operator', true, 'operator')
on conflict (id) do update set is_admin = true, app_role = 'operator';
insert into public.events (id, title, status, starts_at, is_active)
values ('77777777-7777-4777-8777-777777777777', 'Override contract event', 'approved', now() + interval '1 day', true)
on conflict (id) do nothing;
update public.local_submission_repository_meta set revision = 0, updated_at = now() where singleton = true;

set local role authenticated;
select set_config('request.jwt.claim.sub', '11111111-1111-4111-8111-111111111111', true);
select is(pg_temp.try_sql('select public.read_local_submission_repository_state()'), false, 'normal users cannot read the server repository snapshot');
select is(pg_temp.try_sql($attempt$select public.replace_local_submission_repository_state(0, '{"version":1,"pendingSubmissions":[],"publishedLocalEvents":[]}'::jsonb)$attempt$), false, 'normal users cannot replace repository state');

reset role;
select set_config('request.jwt.claim.sub', '', true);
set local role service_role;

select is(
  (public.replace_local_submission_repository_state(
    0,
    '{
      "version": 1,
      "pendingSubmissions": [{
        "id": "55555555-5555-4555-8555-555555555555",
        "eventTitle": "Repository database contract",
        "status": "pending_review",
        "statusToken": "database-contract-secret-token",
        "submittedAt": "2026-07-19T12:00:00.000Z",
        "statusHistory": [{"action":"submitted","label":"Submitted for review","at":"2026-07-19T12:00:00.000Z"}]
      }],
      "publishedLocalEvents": [],
      "eventCategoryOverrides": {},
      "operatorAuditLog": []
    }'::jsonb
  )->>'applied')::boolean,
  true,
  'service role atomically writes the expected repository revision'
);

select is(length((select status_token_hash from public.local_submissions where id = '55555555-5555-4555-8555-555555555555')), 64, 'status capability is stored as a 64-character hash');
select is((select submission_data ? 'statusToken' from public.local_submissions where id = '55555555-5555-4555-8555-555555555555'), false, 'plaintext status capability is absent from submission JSON');
select is((select submission_data ? 'statusHistory' from public.local_submissions where id = '55555555-5555-4555-8555-555555555555'), false, 'review history is normalized outside submission JSON');
select is(jsonb_array_length(public.read_local_submission_repository_state()->'store'->'pendingSubmissions'), 1, 'atomic reader reconstructs the pending queue');
select is((public.read_local_submission_repository_state()->>'revision')::bigint, 1::bigint, 'atomic reader returns the current revision');

select is(
  (public.replace_local_submission_repository_state(
    1,
    $store${
      "version": 1,
      "pendingSubmissions": [],
      "publishedLocalEvents": [{
        "id": "local-approved-55555555-5555-4555-8555-555555555555",
        "title": "Repository published contract",
        "summary": "Published through the normalized repository",
        "category": "Community",
        "city": "Springfield",
        "location": "Repository Hall",
        "startsAt": "2026-07-20T18:00:00.000Z",
        "localSubmissionId": "55555555-5555-4555-8555-555555555555"
      }],
      "eventCategoryOverrides": {
        "77777777-7777-4777-8777-777777777777": {
          "category": "Music",
          "sourceCategory": "Community",
          "eventTitle": "Override contract event",
          "reviewedAt": "2026-07-19T13:00:00.000Z"
        }
      },
      "operatorAuditLog": [{
        "id": "88888888-8888-4888-8888-888888888888",
        "actorUserId": "66666666-6666-4666-8666-666666666666",
        "authMethod": "supabase",
        "action": "set_category_override",
        "targetType": "event_category_override",
        "targetId": "77777777-7777-4777-8777-777777777777",
        "at": "2026-07-19T13:00:00.000Z",
        "metadata": {"category":"Music"}
      }]
    }$store$::jsonb
  )->>'applied')::boolean,
  true,
  'published state, audit, and override are atomically applied'
);
select is((select published_event_id from public.local_submissions where id = '55555555-5555-4555-8555-555555555555'), '55555555-5555-4555-8555-555555555555'::uuid, 'publication mapping links submission to durable event');
select is((select title from public.events where id = '55555555-5555-4555-8555-555555555555'), 'Repository published contract', 'publication creates the durable event row');
select is((select status from public.events where id = '55555555-5555-4555-8555-555555555555'), 'approved', 'published event is visible to the approved feed query');
select is((select category from public.event_category_overrides where event_id = '77777777-7777-4777-8777-777777777777'), 'Music', 'category override is normalized');
select is((select reviewed_by from public.event_category_overrides where event_id = '77777777-7777-4777-8777-777777777777'), '66666666-6666-4666-8666-666666666666'::uuid, 'category override retains the authenticated actor');
select is((select actor_user_id from public.operator_audit_logs where request_id = '88888888-8888-4888-8888-888888888888'), '66666666-6666-4666-8666-666666666666'::uuid, 'operator audit actor is durable');
select is((select action from public.operator_audit_logs where request_id = '88888888-8888-4888-8888-888888888888'), 'set_category_override', 'operator audit action is durable');
select is(jsonb_array_length(public.read_local_submission_repository_state()->'store'->'publishedLocalEvents'), 1, 'atomic reader reconstructs the published queue');
select is(length((select status_token_hash from public.local_submissions where id = '55555555-5555-4555-8555-555555555555')), 64, 'publication preserves the submitter capability hash');

select is((public.replace_local_submission_repository_state(1, '{"version":1,"pendingSubmissions":[],"publishedLocalEvents":[]}'::jsonb)->>'applied')::boolean, false, 'stale compare-and-swap writes are rejected');
select is((select count(*)::integer from public.local_submissions where submission_data::text like '%database-contract-secret-token%'), 0, 'plaintext capability is never persisted in searchable JSON');

reset role;
select * from finish();
rollback;
