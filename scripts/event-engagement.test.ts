import assert from 'node:assert/strict';
import test from 'node:test';
import { cleanCorrectionNote, validateEventKey, validateIntentAction, validateLifecycleAction } from '../lib/event-engagement.ts';
import { readEventIntentSummary, readLifecycleQueue, recordEventIntent, recordLifecycleAction } from '../lib/event-engagement-repository.ts';

test('event engagement accepts only bounded action vocabularies and keys', () => {
  assert.equal(validateEventKey('local-approved:abc_123'), 'local-approved:abc_123');
  assert.equal(validateEventKey('../secret'), '');
  assert.equal(validateIntentAction('calendar_add'), 'calendar_add');
  assert.equal(validateIntentAction('event_view'), null);
  assert.equal(validateLifecycleAction('inaccurate', 'attendee'), 'inaccurate');
  assert.equal(validateLifecycleAction('cancelled', 'attendee'), null);
  assert.equal(validateLifecycleAction('cancelled', 'operator'), 'cancelled');
  assert.equal(cleanCorrectionNote(`  corrected   time ${'x'.repeat(600)}`).length, 500);
});

test('engagement repository stores no identity and maps aggregate RPCs', async () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.example.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret';
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    const url = String(input); requests.push({ url, init });
    if (url.endsWith('/rpc/read_event_intent_summary')) return Response.json([{ event_key: 'event-1', calendar_adds: 2, shares: 1, copy_links: 3, latest_at: '2026-08-18T12:00:00Z' }]);
    if (url.endsWith('/rpc/read_event_lifecycle_queue')) return Response.json([{ id: '1', event_key: 'event-1', event_title: 'Event', action: 'inaccurate', reporter_type: 'attendee', note: '', created_at: '2026-08-18T12:00:00Z' }]);
    return new Response(null, { status: 201 });
  };
  try {
    await recordEventIntent('event-1', 'calendar_add', fetchImpl as typeof fetch);
    await recordLifecycleAction({ eventKey: 'event-1', eventTitle: 'Event', action: 'confirmed', reporterType: 'operator' }, fetchImpl as typeof fetch);
    assert.deepEqual(JSON.parse(String(requests[0].init?.body)), { event_key: 'event-1', action: 'calendar_add' });
    assert.equal(String(requests[0].init?.body).includes('server-secret'), false);
    assert.deepEqual(await readEventIntentSummary(fetchImpl as typeof fetch), [{ eventKey: 'event-1', calendarAdds: 2, shares: 1, copyLinks: 3, latestAt: '2026-08-18T12:00:00Z' }]);
    assert.equal((await readLifecycleQueue(fetchImpl as typeof fetch))[0]?.reporterType, 'attendee');
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL; else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY; else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});
