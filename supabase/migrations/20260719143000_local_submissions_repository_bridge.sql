-- Release 2C: atomic, normalized repository bridge for the server-only Supabase adapter.

create table if not exists public.local_submission_repository_meta (
  singleton boolean primary key default true check (singleton),
  revision bigint not null default 0 check (revision >= 0),
  updated_at timestamptz not null default now()
);

insert into public.local_submission_repository_meta (singleton, revision)
values (true, 0)
on conflict (singleton) do nothing;

alter table public.local_submission_repository_meta enable row level security;
revoke all on table public.local_submission_repository_meta from public, anon, authenticated;
grant select, insert, update on table public.local_submission_repository_meta to service_role;
grant select, insert, update on table public.events to service_role;
grant select, insert, update on table public.local_submissions to service_role;
grant select, insert on table public.submission_review_events to service_role;
grant select, insert, update, delete on table public.event_category_overrides to service_role;
grant select, insert on table public.operator_audit_logs to service_role;

create unique index if not exists idx_submission_review_events_source_key
  on public.submission_review_events (submission_id, ((metadata ->> 'source_event_key')))
  where metadata ? 'source_event_key';

create or replace function public.enforce_operator_review_actor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() = 'service_role' or current_setting('role', true) = 'service_role' then
    if new.actor_user_id is not null and not exists (select 1 from auth.users where id = new.actor_user_id) then
      raise exception 'review actor does not exist' using errcode = '23503';
    end if;
    new.actor_type := case when new.actor_user_id is null then 'system' else 'operator' end;
    return new;
  end if;
  if not public.is_loop_operator() then
    raise exception 'operator role required' using errcode = '42501';
  end if;
  new.actor_type := 'operator';
  new.actor_user_id := auth.uid();
  return new;
end;
$$;

create or replace function public.enforce_category_override_actor()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if auth.role() = 'service_role' or current_setting('role', true) = 'service_role' then
    if new.reviewed_by is null or not exists (select 1 from auth.users where id = new.reviewed_by) then
      raise exception 'override actor does not exist' using errcode = '23503';
    end if;
    new.reviewed_at := coalesce(new.reviewed_at, now());
    return new;
  end if;
  if not public.is_loop_operator() then
    raise exception 'operator role required' using errcode = '42501';
  end if;
  new.reviewed_by := auth.uid();
  new.reviewed_at := coalesce(new.reviewed_at, now());
  return new;
end;
$$;

create or replace function public.read_local_submission_repository_state()
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_revision bigint;
  pending jsonb;
  published jsonb;
  overrides jsonb;
  audits jsonb;
begin
  select revision into current_revision
  from public.local_submission_repository_meta
  where singleton = true;

  select coalesce(jsonb_agg(
    ls.submission_data || jsonb_strip_nulls(jsonb_build_object(
      'id', ls.id::text,
      'status', ls.status,
      'submittedAt', to_char(ls.submitted_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'statusUpdatedAt', to_char(ls.updated_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
      'statusHistory', coalesce((
        select jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
          'action', review.action,
          'label', review.metadata ->> 'label',
          'note', review.note,
          'at', to_char(review.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
          'actorUserId', review.actor_user_id::text,
          'authMethod', review.metadata ->> 'authMethod'
        )) order by review.created_at, review.id)
        from public.submission_review_events review
        where review.submission_id = ls.id
      ), '[]'::jsonb)
    )) order by ls.submitted_at, ls.id), '[]'::jsonb)
  into pending
  from public.local_submissions ls
  where ls.status <> 'published_local'
    and coalesce((ls.submission_data ->> 'repositoryDeleted')::boolean, false) = false;

  select coalesce(jsonb_agg(ls.submission_data -> 'publishedItem' order by ls.updated_at, ls.id), '[]'::jsonb)
  into published
  from public.local_submissions ls
  where ls.status = 'published_local'
    and ls.submission_data ? 'publishedItem'
    and coalesce((ls.submission_data ->> 'repositoryDeleted')::boolean, false) = false;

  select coalesce(jsonb_object_agg(o.event_id::text, jsonb_strip_nulls(jsonb_build_object(
    'category', o.category,
    'sourceCategory', o.source_category,
    'eventTitle', e.title,
    'reviewedAt', to_char(o.reviewed_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"')
  ))), '{}'::jsonb)
  into overrides
  from public.event_category_overrides o
  left join public.events e on e.id = o.event_id;

  select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object(
    'id', coalesce(a.request_id::text, a.id::text),
    'actorUserId', a.actor_user_id::text,
    'action', a.action,
    'targetType', a.target_type,
    'targetId', a.target_id,
    'at', to_char(a.created_at at time zone 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'),
    'metadata', a.metadata
  )) order by a.created_at, a.id), '[]'::jsonb)
  into audits
  from public.operator_audit_logs a
  where coalesce(a.metadata ->> 'repositorySource', '') = 'loop-local-adapter';

  return jsonb_build_object(
    'revision', current_revision,
    'store', jsonb_build_object(
      'version', 1,
      'pendingSubmissions', pending,
      'publishedLocalEvents', published,
      'eventCategoryOverrides', overrides,
      'operatorAuditLog', audits
    )
  );
end;
$$;

create or replace function public.replace_local_submission_repository_state(
  expected_revision bigint,
  next_store jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_revision bigint;
  item jsonb;
  history_item jsonb;
  audit_item jsonb;
  submission_uuid uuid;
  actor_uuid uuid;
  desired_ids uuid[] := array[]::uuid[];
  token_hash text;
  event_key text;
  override_key text;
  override_item jsonb;
  reviewed_actor uuid;
  event_start timestamptz;
begin
  if jsonb_typeof(next_store) <> 'object'
    or coalesce((next_store ->> 'version')::integer, 0) <> 1
    or jsonb_typeof(coalesce(next_store -> 'pendingSubmissions', '[]'::jsonb)) <> 'array'
    or jsonb_typeof(coalesce(next_store -> 'publishedLocalEvents', '[]'::jsonb)) <> 'array' then
    raise exception 'invalid repository store payload' using errcode = '22023';
  end if;

  select revision into current_revision
  from public.local_submission_repository_meta
  where singleton = true
  for update;

  if expected_revision is distinct from current_revision then
    return jsonb_build_object('applied', false, 'revision', current_revision);
  end if;

  for item in select value from jsonb_array_elements(coalesce(next_store -> 'pendingSubmissions', '[]'::jsonb)) loop
    submission_uuid := (item ->> 'id')::uuid;
    desired_ids := array_append(desired_ids, submission_uuid);
    token_hash := case when nullif(item ->> 'statusToken', '') is not null
      then encode(extensions.digest(item ->> 'statusToken', 'sha256'), 'hex')
      else null end;

    insert into public.local_submissions (
      id, owner_user_id, status_token_hash, status, submission_data, submitted_at, updated_at
    ) values (
      submission_uuid,
      case when nullif(item ->> 'ownerUserId', '') is not null then (item ->> 'ownerUserId')::uuid else null end,
      token_hash,
      coalesce(nullif(item ->> 'status', ''), 'pending_review'),
      (item - 'statusToken' - 'statusHistory' - 'repositoryDeleted'),
      coalesce((item ->> 'submittedAt')::timestamptz, now()),
      coalesce((item ->> 'statusUpdatedAt')::timestamptz, now())
    )
    on conflict (id) do update set
      owner_user_id = coalesce(excluded.owner_user_id, public.local_submissions.owner_user_id),
      status_token_hash = coalesce(excluded.status_token_hash, public.local_submissions.status_token_hash),
      status = excluded.status,
      submission_data = excluded.submission_data,
      submitted_at = excluded.submitted_at,
      updated_at = excluded.updated_at;

    for history_item in select value from jsonb_array_elements(coalesce(item -> 'statusHistory', '[]'::jsonb)) loop
      event_key := encode(extensions.digest(submission_uuid::text || ':' || history_item::text, 'sha256'), 'hex');
      actor_uuid := case when nullif(history_item ->> 'actorUserId', '') is not null then (history_item ->> 'actorUserId')::uuid else null end;
      insert into public.submission_review_events (submission_id, action, actor_user_id, note, metadata, created_at)
      values (
        submission_uuid,
        coalesce(nullif(history_item ->> 'action', ''), 'updated'),
        actor_uuid,
        nullif(history_item ->> 'note', ''),
        jsonb_strip_nulls(jsonb_build_object(
          'source_event_key', event_key,
          'label', history_item ->> 'label',
          'authMethod', history_item ->> 'authMethod'
        )),
        coalesce((history_item ->> 'at')::timestamptz, now())
      )
      on conflict (submission_id, ((metadata ->> 'source_event_key'))) where metadata ? 'source_event_key' do nothing;
    end loop;
  end loop;

  for item in select value from jsonb_array_elements(coalesce(next_store -> 'publishedLocalEvents', '[]'::jsonb)) loop
    submission_uuid := case
      when nullif(item ->> 'localSubmissionId', '') is not null then (item ->> 'localSubmissionId')::uuid
      when (item ->> 'id') like 'local-approved-%' then substring(item ->> 'id' from length('local-approved-') + 1)::uuid
      else (item ->> 'id')::uuid
    end;
    desired_ids := array_append(desired_ids, submission_uuid);
    event_start := coalesce((item ->> 'startsAt')::timestamptz, (item ->> 'date')::timestamptz, now());

    insert into public.events (
      id, title, description, category, status, starts_at, ends_at,
      city, address, venue, image_url, website, is_active
    ) values (
      submission_uuid,
      coalesce(nullif(item ->> 'title', ''), 'Locally approved event'),
      item ->> 'summary',
      coalesce(nullif(item ->> 'category', ''), 'Community'),
      'approved',
      event_start,
      coalesce((item ->> 'endsAt')::timestamptz, event_start + interval '2 hours'),
      item ->> 'city',
      item ->> 'address',
      coalesce(item ->> 'location', item ->> 'business'),
      item ->> 'image_url',
      item ->> 'website',
      true
    )
    on conflict (id) do update set
      title = excluded.title,
      description = excluded.description,
      category = excluded.category,
      status = 'approved',
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      city = excluded.city,
      address = excluded.address,
      venue = excluded.venue,
      image_url = excluded.image_url,
      website = excluded.website,
      is_active = true;

    insert into public.local_submissions (id, status, submission_data, published_event_id, submitted_at, updated_at)
    values (
      submission_uuid,
      'published_local',
      jsonb_build_object('publishedItem', item),
      submission_uuid,
      event_start,
      now()
    )
    on conflict (id) do update set
      status = 'published_local',
      submission_data = jsonb_build_object('publishedItem', item),
      published_event_id = submission_uuid,
      updated_at = now();
  end loop;

  update public.events e
  set is_active = false
  where e.id in (
    select ls.published_event_id
    from public.local_submissions ls
    where ls.published_event_id is not null and not (ls.id = any(desired_ids))
  );

  update public.local_submissions
  set submission_data = submission_data || '{"repositoryDeleted":true}'::jsonb,
      updated_at = now()
  where not (id = any(desired_ids))
    and coalesce((submission_data ->> 'repositoryDeleted')::boolean, false) = false;

  for audit_item in select value from jsonb_array_elements(coalesce(next_store -> 'operatorAuditLog', '[]'::jsonb)) loop
    actor_uuid := (audit_item ->> 'actorUserId')::uuid;
    if exists (select 1 from auth.users where id = actor_uuid) then
      insert into public.operator_audit_logs (
        actor_user_id, action, target_type, target_id, metadata, request_id, created_at
      ) values (
        actor_uuid,
        audit_item ->> 'action',
        audit_item ->> 'targetType',
        audit_item ->> 'targetId',
        coalesce(audit_item -> 'metadata', '{}'::jsonb) || jsonb_build_object('repositorySource', 'loop-local-adapter'),
        case when nullif(audit_item ->> 'id', '') is not null then (audit_item ->> 'id')::uuid else null end,
        coalesce((audit_item ->> 'at')::timestamptz, now())
      )
      on conflict (request_id) where request_id is not null do nothing;
    end if;
  end loop;

  for override_key, override_item in
    select key, value from jsonb_each(coalesce(next_store -> 'eventCategoryOverrides', '{}'::jsonb))
  loop
    reviewed_actor := null;
    select (candidate ->> 'actorUserId')::uuid
    into reviewed_actor
    from jsonb_array_elements(coalesce(next_store -> 'operatorAuditLog', '[]'::jsonb)) candidate
    where candidate ->> 'targetId' = override_key
      and candidate ->> 'action' = 'set_category_override'
    order by coalesce((candidate ->> 'at')::timestamptz, now()) desc
    limit 1;

    if reviewed_actor is null then
      select reviewed_by into reviewed_actor
      from public.event_category_overrides
      where event_id = override_key::uuid;
    end if;

    if reviewed_actor is not null
      and exists (select 1 from auth.users where id = reviewed_actor)
      and exists (select 1 from public.events where id = override_key::uuid) then
      insert into public.event_category_overrides (
        event_id, category, source_category, reviewed_by, reviewed_at
      ) values (
        override_key::uuid,
        override_item ->> 'category',
        coalesce(nullif(override_item ->> 'sourceCategory', ''), 'Local'),
        reviewed_actor,
        coalesce((override_item ->> 'reviewedAt')::timestamptz, now())
      )
      on conflict (event_id) do update set
        category = excluded.category,
        source_category = excluded.source_category,
        reviewed_by = excluded.reviewed_by,
        reviewed_at = excluded.reviewed_at;
    end if;
  end loop;

  delete from public.event_category_overrides existing_override
  where not (coalesce(next_store -> 'eventCategoryOverrides', '{}'::jsonb) ? existing_override.event_id::text);

  update public.local_submission_repository_meta
  set revision = revision + 1, updated_at = now()
  where singleton = true
  returning revision into current_revision;

  return jsonb_build_object('applied', true, 'revision', current_revision);
end;
$$;

revoke all on function public.read_local_submission_repository_state() from public, anon, authenticated;
revoke all on function public.replace_local_submission_repository_state(bigint, jsonb) from public, anon, authenticated;
grant execute on function public.read_local_submission_repository_state() to service_role;
grant execute on function public.replace_local_submission_repository_state(bigint, jsonb) to service_role;

comment on table public.local_submission_repository_meta is
  'Singleton CAS revision used by the server-only normalized submissions repository.';
comment on function public.read_local_submission_repository_state() is
  'Atomically reconstructs adapter-neutral queue state for the service role.';
comment on function public.replace_local_submission_repository_state(bigint, jsonb) is
  'Compare-and-swap writer that normalizes queue state and strips plaintext status capabilities.';
