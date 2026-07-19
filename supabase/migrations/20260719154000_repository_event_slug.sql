-- Release 2C production-parity fix: durable events require a deterministic non-null slug.

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
  event_city_id uuid;
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
    select city_record.id into event_city_id
    from public.cities city_record
    where lower(city_record.name) = lower(coalesce(item ->> 'city', ''))
    order by city_record.name
    limit 1;
    if event_city_id is null then
      raise exception 'published local event city is not recognized: %', coalesce(item ->> 'city', '<missing>')
        using errcode = '22023';
    end if;

    insert into public.events (
      id, title, slug, description, category, status, starts_at, ends_at,
      city_id, city, address, venue, image_url, website, is_active
    ) values (
      submission_uuid,
      coalesce(nullif(item ->> 'title', ''), 'Locally approved event'),
      'local-' || submission_uuid::text,
      item ->> 'summary',
      coalesce(nullif(item ->> 'category', ''), 'Community'),
      'approved',
      event_start,
      coalesce((item ->> 'endsAt')::timestamptz, event_start + interval '2 hours'),
      event_city_id,
      item ->> 'city',
      item ->> 'address',
      coalesce(item ->> 'location', item ->> 'business'),
      item ->> 'image_url',
      item ->> 'website',
      true
    )
    on conflict (id) do update set
      title = excluded.title,
      slug = excluded.slug,
      description = excluded.description,
      category = excluded.category,
      status = 'approved',
      starts_at = excluded.starts_at,
      ends_at = excluded.ends_at,
      city_id = excluded.city_id,
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
