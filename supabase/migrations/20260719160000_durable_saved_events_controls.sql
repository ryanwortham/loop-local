-- Release 2E: expose the existing private saved-events table to authenticated owners.
-- RLS policies remain the authorization boundary; anonymous clients retain no table privileges.

grant select, insert, delete on table public.saved_events to authenticated;
revoke all on table public.saved_events from anon;

notify pgrst, 'reload schema';
