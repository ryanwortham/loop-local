import assert from 'node:assert/strict';
import test from 'node:test';

import {
  fetchFeedWithReliability,
  resolveFeedConfig,
  type FeedCache,
  type FeedFetch,
} from '../lib/feed-reliability.ts';

const validEnv = {
  NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
  NEXT_PUBLIC_SUPABASE_ANON_KEY: 'public-anon-key',
  LOOP_LOCAL_FEED_TIME_ZONE: 'America/Chicago',
  LOOP_LOCAL_FEED_TIMEOUT_MS: '1000',
  LOOP_LOCAL_FEED_RETRIES: '1',
  LOOP_LOCAL_FEED_STALE_MAX_AGE_MS: '3600000',
};

const timeoutConfig = resolveFeedConfig(validEnv);

function response(body: unknown, status = 200, contentRange = '0-0/1'): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', 'content-range': contentRange },
  });
}

test('resolveFeedConfig validates the stable Supabase source and bounded reliability values', () => {
  const config = resolveFeedConfig(validEnv);
  assert.equal(config.baseUrl, 'https://project.supabase.co');
  assert.equal(config.timeZone, 'America/Chicago');
  assert.equal(config.timeoutMs, 1000);
  assert.equal(config.retries, 1);
  assert.throws(
    () => resolveFeedConfig({ ...validEnv, NEXT_PUBLIC_SUPABASE_URL: 'https://temporary.trycloudflare.com' }),
    /Supabase URL/i,
  );
  assert.throws(
    () => resolveFeedConfig({ ...validEnv, NEXT_PUBLIC_SUPABASE_ANON_KEY: '' }),
    /anon key/i,
  );
  assert.throws(
    () => resolveFeedConfig({ ...validEnv, LOOP_LOCAL_FEED_TIME_ZONE: 'Mars/Olympus' }),
    /time zone/i,
  );
});

test('fetchFeedWithReliability retries a transient failure and reports a fresh normalized feed', async () => {
  let eventCalls = 0;
  const fetchImpl: FeedFetch = async (input) => {
    if (String(input).includes('/rest/v1/businesses')) return response([]);
    eventCalls += 1;
    assert.match(String(input), /\/rest\/v1\/events/);
    if (eventCalls === 1) throw new TypeError('temporary network failure');
    return response([
      {
        id: 'event-1',
        title: 'Market Night',
        slug: 'market-night',
        description: 'A neighborhood market.',
        starts_at: '2026-07-20T23:00:00Z',
        ends_at: '2026-07-21T01:00:00Z',
        city: 'St. Louis',
        venue: 'Market Hall',
        address: '100 Main St',
        category: 'Community',
        status: 'approved',
        image_url: null,
        website: 'https://example.com/event',
        business_slug: 'market-hall',
      },
    ]);
  };
  const cache: FeedCache = {};
  const feed = await fetchFeedWithReliability({
    config: resolveFeedConfig(validEnv),
    fetchImpl,
    cache,
    now: () => Date.parse('2026-07-19T18:00:00Z'),
    sleep: async () => undefined,
    limit: 24,
  });

  assert.equal(eventCalls, 2);
  assert.equal(feed.health.status, 'fresh');
  assert.equal(feed.health.attempts, 2);
  assert.equal(feed.count, 1);
  assert.equal(feed.items[0]?.summary, 'A neighborhood market.');
  assert.equal(feed.items[0]?.location, 'Market Hall');
  assert.equal(feed.items[0]?.date, '2026-07-20');
  assert.equal(feed.items[0]?.time, '6:00 PM CDT');
  assert.equal(feed.items[0]?.timezone, 'America/Chicago');
  assert.equal(feed.items[0]?.source, 'live_supabase');
  assert.ok(cache.value, 'fresh feed should populate the stale fallback cache');
});

test('feed timestamps use the configured market timezone across local calendar boundaries', async () => {
  const startsAt = '2026-01-01T02:00:00Z';
  const feed = await fetchFeedWithReliability({
    config: resolveFeedConfig(validEnv),
    fetchImpl: async () => response([{
      id: 'new-years-eve',
      title: 'New Years Eve Local',
      starts_at: startsAt,
      city: 'St. Louis',
      category: 'Community',
      status: 'approved',
    }]),
    cache: {},
    now: () => Date.parse('2025-12-31T18:00:00Z'),
    sleep: async () => undefined,
  });

  assert.equal(feed.items[0]?.startsAt, startsAt);
  assert.equal(feed.items[0]?.date, '2025-12-31');
  assert.equal(feed.items[0]?.time, '8:00 PM CST');
  assert.equal(feed.items[0]?.timezone, 'America/Chicago');
});

test('a successful zero-row response is empty, not an upstream outage', async () => {
  const feed = await fetchFeedWithReliability({
    config: resolveFeedConfig(validEnv),
    fetchImpl: async () => response([], 200, '*/0'),
    cache: {},
    now: () => Date.parse('2026-07-19T18:00:00Z'),
    sleep: async () => undefined,
  });

  assert.equal(feed.health.status, 'empty');
  assert.equal(feed.health.upstreamStatus, 200);
  assert.equal(feed.count, 0);
  assert.deepEqual(feed.items, []);
});

test('the Supabase request excludes events that have already ended', async () => {
  const currentTime = Date.parse('2026-07-19T12:00:00Z');
  let requestedUrl = '';
  const captureFetch: FeedFetch = async (input) => {
    requestedUrl = String(input);
    return response([], 200, '*/0');
  };

  await fetchFeedWithReliability({
    config: timeoutConfig,
    cache: {},
    fetchImpl: captureFetch,
    now: () => currentTime,
  });

  assert.equal(
    new URL(requestedUrl).searchParams.get('or'),
    '(starts_at.gte.2026-07-19T12:00:00.000Z,ends_at.gte.2026-07-19T12:00:00.000Z)',
  );
});

test('matching public business metadata enriches event display names and fallback links', async () => {
  const requestedPaths: string[] = [];
  const enrichmentFetch: FeedFetch = async (input) => {
    const url = new URL(String(input));
    requestedPaths.push(`${url.pathname}?${url.searchParams.toString()}`);
    if (url.pathname.endsWith('/events')) {
      return response([{
        id: 'event-2',
        title: 'Neighborhood Night',
        business_slug: 'Sample Cafe ',
        category: 'Community',
        status: 'approved',
        starts_at: '2026-07-20T18:00:00Z',
        venue: 'Sample Cafe',
        city: 'Charlotte',
      }], 200, '0-0/1');
    }
    return response([{
      slug: 'Sample Cafe ',
      name: 'Sample Café',
      website: 'https://sample.example/events',
    }]);
  };

  const feed = await fetchFeedWithReliability({
    config: timeoutConfig,
    cache: {},
    fetchImpl: enrichmentFetch,
    now: () => Date.parse('2026-07-19T12:00:00Z'),
  });

  assert.equal(feed.health.status, 'fresh');
  assert.equal(feed.items[0]?.business, 'Sample Café');
  assert.equal(feed.items[0]?.venueUrl, 'https://sample.example/events');
  assert.equal(requestedPaths.some((path) => path.startsWith('/rest/v1/businesses?')), true);
});

test('a request that exceeds the configured timeout is aborted and reported unavailable', async () => {
  const timedOutFetch: FeedFetch = (_input, init) => new Promise((_resolve, reject) => {
    init?.signal?.addEventListener('abort', () => reject(new DOMException('aborted', 'AbortError')), { once: true });
  });

  const feed = await fetchFeedWithReliability({
    config: { ...timeoutConfig, timeoutMs: 5, retries: 0 },
    cache: {},
    fetchImpl: timedOutFetch,
    now: () => 12_000,
  });

  assert.equal(feed.health.status, 'unavailable');
  assert.equal(feed.health.attempts, 1);
  assert.match(feed.health.message || '', /timed out/i);
});

test('an outage serves recent cached data as stale and reports unavailable without cache', async () => {
  const now = Date.parse('2026-07-19T18:00:00Z');
  const cache: FeedCache = {
    storedAt: now - 120_000,
    value: {
      project: 'looplocal.com',
      source: 'live_supabase',
      count: 1,
      items: [{ id: 'cached-1', title: 'Cached Event' }],
      health: { status: 'fresh', fetchedAt: '2026-07-19T17:58:00Z', ageSeconds: 0, attempts: 1, upstreamStatus: 200 },
    },
  };
  const failingFetch: FeedFetch = async () => response({ message: 'upstream down' }, 503);
  const stale = await fetchFeedWithReliability({
    config: resolveFeedConfig(validEnv),
    fetchImpl: failingFetch,
    cache,
    now: () => now,
    sleep: async () => undefined,
  });
  assert.equal(stale.health.status, 'stale');
  assert.equal(stale.health.ageSeconds, 120);
  assert.equal(stale.items[0]?.title, 'Cached Event');

  const unavailable = await fetchFeedWithReliability({
    config: resolveFeedConfig(validEnv),
    fetchImpl: failingFetch,
    cache: {},
    now: () => now,
    sleep: async () => undefined,
  });
  assert.equal(unavailable.health.status, 'unavailable');
  assert.equal(unavailable.count, 0);
  assert.match(unavailable.health.message || '', /503/);
});
