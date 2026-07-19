-- MANUAL ROLLBACK ONLY. Do not run after application cutover or data import.
-- This removes Release 2A objects and all data stored in them.
-- It intentionally does not revoke pre-existing profile grants.

begin;

-- Remove policies before dependent operator predicates.
drop policy if exists local_submissions_select_own_or_operator on public.local_submissions;
drop policy if exists local_submissions_insert_own on public.local_submissions;
drop policy if exists local_submissions_update_own_revision on public.local_submissions;
drop policy if exists local_submissions_operator_all on public.local_submissions;
drop policy if exists submission_review_events_select_own_or_operator on public.submission_review_events;
drop policy if exists submission_review_events_operator_insert on public.submission_review_events;
drop policy if exists event_category_overrides_public_read on public.event_category_overrides;
drop policy if exists event_category_overrides_operator_insert on public.event_category_overrides;
drop policy if exists event_category_overrides_operator_update on public.event_category_overrides;
drop policy if exists event_category_overrides_operator_delete on public.event_category_overrides;
drop policy if exists operator_audit_logs_operator_read on public.operator_audit_logs;

drop function if exists public.consume_public_rate_limit(text, text, integer, integer);
drop function if exists public.write_operator_audit(text, text, text, jsonb, uuid);

drop table if exists public.public_rate_limits;
drop table if exists public.operator_audit_logs;
drop table if exists public.event_category_overrides;
drop table if exists public.submission_review_events;
drop table if exists public.local_submissions;

drop function if exists public.reject_operator_audit_mutation();
drop function if exists public.reject_review_history_mutation();
drop function if exists public.enforce_category_override_actor();
drop function if exists public.enforce_operator_review_actor();
drop function if exists public.set_loop_updated_at();
drop function if exists public.is_loop_operator();

drop trigger if exists profiles_prevent_admin_self_elevation on public.profiles;

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

create trigger profiles_prevent_admin_self_elevation
  before insert or update on public.profiles
  for each row execute function public.prevent_profile_admin_self_elevation();

alter table public.profiles drop constraint if exists profiles_app_role_check;
alter table public.profiles drop column if exists app_role;

notify pgrst, 'reload schema';
commit;
