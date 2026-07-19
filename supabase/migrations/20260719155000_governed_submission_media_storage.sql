-- Release 2D: governed media buckets and client access boundaries.
-- Object creation, mutation, promotion, and deletion are server-only so callers cannot choose paths.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('submission-media', 'submission-media', false, 700000, array['image/jpeg', 'image/png', 'image/webp']::text[]),
  ('event-media', 'event-media', true, 700000, array['image/jpeg', 'image/png', 'image/webp']::text[])
on conflict (id) do update set
  name = excluded.name,
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Pending media paths begin with the canonical submission UUID. Authenticated owners may
-- read only media attached to their own submission; operators may inspect every pending asset.
drop policy if exists "submission media owner or operator read" on storage.objects;
create policy "submission media owner or operator read"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'submission-media'
  and (
    public.is_loop_operator()
    or exists (
      select 1
      from public.local_submissions submission
      where submission.id::text = (storage.foldername(storage.objects.name))[1]
        and submission.owner_user_id = auth.uid()
    )
  )
);

-- Approved assets are intentionally public and are referenced by durable event rows.
drop policy if exists "approved event media public read" on storage.objects;
create policy "approved event media public read"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'event-media');

-- Restrictive policies ensure another permissive Storage policy cannot accidentally grant
-- client writes to governed buckets. service_role bypasses RLS for trusted server workflows.
drop policy if exists "governed media deny client insert" on storage.objects;
create policy "governed media deny client insert"
on storage.objects
as restrictive
for insert
to anon, authenticated
with check (bucket_id not in ('submission-media', 'event-media'));

drop policy if exists "governed media deny client update" on storage.objects;
create policy "governed media deny client update"
on storage.objects
as restrictive
for update
to anon, authenticated
using (bucket_id not in ('submission-media', 'event-media'))
with check (bucket_id not in ('submission-media', 'event-media'));

drop policy if exists "governed media deny client delete" on storage.objects;
create policy "governed media deny client delete"
on storage.objects
as restrictive
for delete
to anon, authenticated
using (bucket_id not in ('submission-media', 'event-media'));
