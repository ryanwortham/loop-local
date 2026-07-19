revoke select, insert, delete on table public.saved_events from authenticated;
notify pgrst, 'reload schema';
