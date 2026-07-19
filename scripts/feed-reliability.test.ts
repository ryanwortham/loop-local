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
});

test('fetchFeedWithReliability retries a transient failure and reports a fresh normalized feed', async () => {
  let calls = 0;
  const fetchImpl: FeedFetch = async (input) => {
    calls += 1;
    assert.match(String(input), /\/rest\/v1\/events/);
    if (calls === 1) throw new TypeError('temporary network failure');
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

  assert.equal(calls, 2);
  assert.equal(feed.health.status, 'fresh');
  assert.equal(feed.health.attempts, 2);
  assert.equal(feed.count, 1);
  assert.equal(feed.items[0]?.summary, 'A neighborhood market.');
  assert.equal(feed.items[0]?.location, 'Market Hall');
  assert.equal(feed.items[0]?.source, 'live_supabase');
  assert.ok(cache.value, 'fresh feed should populate the stale fallback cache');
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
