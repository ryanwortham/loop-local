import assert from 'node:assert/strict';
import test from 'node:test';
import { aggregateDemandSignals, validateDemandSignal } from '../lib/unmet-demand.ts';
import { createDemandSignal, readDemandSignals } from '../lib/unmet-demand-repository.ts';

test('demand signals accept only coarse discovery fields', () => {
  assert.deepEqual(validateDemandSignal({
    category: 'Family',
    area: 'St. Louis City',
    dateWindow: 'this_weekend',
    resultCount: 0,
    context: 'empty',
  }), {
    ok: true,
    value: {
      category: 'Family',
      area: 'St. Louis City',
      dateWindow: 'this_weekend',
      resultCount: 0,
      context: 'empty',
    },
  });
});

test('demand signals reject precise coordinates, free-form notes, and invalid values', () => {
  assert.equal(validateDemandSignal({
    category: 'Family', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 0, context: 'empty', latitude: 38.627,
  }).ok, false);
  assert.equal(validateDemandSignal({
    category: 'Family', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 0, context: 'empty', note: 'call me',
  }).ok, false);
  assert.equal(validateDemandSignal({ category: '', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 0, context: 'empty' }).ok, false);
  assert.equal(validateDemandSignal({ category: 'Family', area: '123 Main Street', dateWindow: 'tonight', resultCount: 0, context: 'empty' }).ok, false);
  assert.equal(validateDemandSignal({ category: 'Call me at 555-0100', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 0, context: 'empty' }).ok, false);
  assert.equal(validateDemandSignal({ category: 'Family', area: 'St. Louis City', dateWindow: 'tomorrow', resultCount: 0, context: 'empty' }).ok, false);
  assert.equal(validateDemandSignal({ category: 'Family', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 999, context: 'empty' }).ok, false);
  assert.equal(validateDemandSignal({ category: 'Family', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 2, context: 'empty' }).ok, false);
  assert.equal(validateDemandSignal({ category: 'Family', area: 'St. Louis City', dateWindow: 'tonight', resultCount: 0, context: 'weak' }).ok, false);
});

test('operator aggregation groups matching demand without retaining identities', () => {
  const summary = aggregateDemandSignals([
    { category: 'Family', area: 'St. Louis City', dateWindow: 'this_weekend', resultCount: 0, context: 'empty', createdAt: '2026-08-18T10:00:00Z' },
    { category: 'Family', area: 'St. Louis City', dateWindow: 'this_weekend', resultCount: 2, context: 'weak', createdAt: '2026-08-18T11:00:00Z' },
    { category: 'Live Music', area: 'Mid County', dateWindow: 'tonight', resultCount: 1, context: 'weak', createdAt: '2026-08-18T12:00:00Z' },
  ]);
  assert.deepEqual(summary, [
    { category: 'Family', area: 'St. Louis City', dateWindow: 'this_weekend', count: 2, emptyCount: 1, averageResultCount: 1, latestAt: '2026-08-18T11:00:00Z' },
    { category: 'Live Music', area: 'Mid County', dateWindow: 'tonight', count: 1, emptyCount: 0, averageResultCount: 1, latestAt: '2026-08-18T12:00:00Z' },
  ]);
});

test('repository writes only the validated coarse fields and aggregates reads', async () => {
  const previousUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const previousKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://db.example.test';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'server-secret';
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    requests.push({ url: String(input), init });
    if (String(input).includes('/rpc/read_unmet_demand_summary')) return Response.json([
      { category: 'Family', area: 'St. Louis City', date_window: 'this_weekend', request_count: 1, empty_count: 1, average_result_count: 0, latest_at: '2026-08-18T11:00:00Z' },
    ]);
    return new Response(null, { status: 201 });
  };
  try {
    await createDemandSignal({ category: 'Family', area: 'St. Louis City', dateWindow: 'this_weekend', resultCount: 0, context: 'empty' }, fetchImpl as typeof fetch);
    assert.deepEqual(JSON.parse(String(requests[0]?.init?.body)), {
      category: 'Family', area: 'St. Louis City', date_window: 'this_weekend', result_count: 0, context: 'empty',
    });
    assert.equal(String(requests[0]?.init?.body).includes('server-secret'), false);
    assert.deepEqual(await readDemandSignals(fetchImpl as typeof fetch), [
      { category: 'Family', area: 'St. Louis City', dateWindow: 'this_weekend', count: 1, emptyCount: 1, averageResultCount: 0, latestAt: '2026-08-18T11:00:00Z' },
    ]);
    assert.match(requests[1]?.url || '', /\/rpc\/read_unmet_demand_summary$/);
    assert.equal(JSON.parse(String(requests[1]?.init?.body)).p_since.length > 0, true);
  } finally {
    if (previousUrl === undefined) delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    else process.env.NEXT_PUBLIC_SUPABASE_URL = previousUrl;
    if (previousKey === undefined) delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    else process.env.SUPABASE_SERVICE_ROLE_KEY = previousKey;
  }
});
