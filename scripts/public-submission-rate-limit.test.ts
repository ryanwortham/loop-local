import assert from 'node:assert/strict';
import test from 'node:test';
import {
  consumeRateLimit,
  hashRateLimitIdentity,
  publicRequestIdentity,
  publicSubmissionRateLimit,
  type RateLimitBucket,
} from '../lib/public-submission-rate-limit.ts';

test('public request identity prefers the trusted proxy address chain', () => {
  const forwarded = new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.2', 'x-real-ip': '198.51.100.4' });
  assert.equal(publicRequestIdentity(new Headers({ 'cf-connecting-ip': '192.0.2.7', 'x-real-ip': '198.51.100.4' })), '192.0.2.7');
  assert.equal(publicRequestIdentity(new Headers({ 'x-vercel-forwarded-for': '192.0.2.8', 'x-real-ip': '198.51.100.4' })), '192.0.2.8');
  assert.equal(publicRequestIdentity(forwarded), '198.51.100.4');
  assert.equal(publicRequestIdentity(new Headers({ 'x-forwarded-for': '203.0.113.9, 10.0.0.2' })), '203.0.113.9');
  assert.equal(publicRequestIdentity(new Headers()), 'unknown');
});

test('rate limiting is bounded by identity and action scope', () => {
  const buckets = new Map<string, RateLimitBucket>();
  const first = consumeRateLimit(buckets, 'create:203.0.113.9', 1_000, 2, 10_000);
  const second = consumeRateLimit(buckets, 'create:203.0.113.9', 2_000, 2, 10_000);
  const blocked = consumeRateLimit(buckets, 'create:203.0.113.9', 3_000, 2, 10_000);
  const separateScope = consumeRateLimit(buckets, 'resubmit:203.0.113.9', 3_000, 2, 10_000);

  assert.deepEqual([first.allowed, second.allowed, blocked.allowed], [true, true, false]);
  assert.equal(blocked.remaining, 0);
  assert.equal(blocked.retryAfterSeconds, 8);
  assert.equal(separateScope.allowed, true);
});

test('expired windows reset and stale buckets are pruned', () => {
  const buckets = new Map<string, RateLimitBucket>([
    ['stale', { count: 1, resetAt: 900 }],
  ]);
  const reset = consumeRateLimit(buckets, 'create:203.0.113.9', 1_000, 1, 500);
  assert.equal(reset.allowed, true);
  assert.equal(reset.remaining, 0);
  assert.equal(buckets.has('stale'), false);
});

test('durable identity hashes are deterministic and do not retain the address', () => {
  const first = hashRateLimitIdentity('203.0.113.9', 'server-only-pepper');
  assert.equal(first, hashRateLimitIdentity('203.0.113.9', 'server-only-pepper'));
  assert.match(first, /^[0-9a-f]{64}$/);
  assert.equal(first.includes('203.0.113.9'), false);
});

test('Supabase adapter consumes the durable atomic rate-limit RPC', async () => {
  let requestBody = '';
  const decision = await publicSubmissionRateLimit(
    new Headers({ 'x-real-ip': '203.0.113.9' }),
    'create',
    10_000,
    {
      env: {
        LOOP_LOCAL_SUBMISSIONS_ADAPTER: 'supabase',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'server-only-secret',
        LOOP_LOCAL_PUBLIC_SUBMISSION_RATE_LIMIT: '2',
        LOOP_LOCAL_PUBLIC_SUBMISSION_RATE_WINDOW_MS: '10000',
      },
      fetchImpl: async (_url, init) => {
        requestBody = String(init?.body);
        return new Response(JSON.stringify({ allowed: false, remaining: 0, resetAt: 18 }), { status: 200 });
      },
    },
  );
  const body = JSON.parse(requestBody);
  assert.equal(body.p_scope, 'create');
  assert.equal(body.p_limit, 2);
  assert.equal(body.p_window_seconds, 10);
  assert.match(body.p_identity_hash, /^[0-9a-f]{64}$/);
  assert.equal(requestBody.includes('203.0.113.9'), false);
  assert.deepEqual(decision, { allowed: false, limit: 2, remaining: 0, retryAfterSeconds: 8, resetAt: 18_000 });
});

test('unmet-demand signals use a stricter independent throttle', async () => {
  let requestBody = '';
  await publicSubmissionRateLimit(
    new Headers({ 'x-real-ip': '203.0.113.10' }),
    'unmet_demand',
    10_000,
    {
      env: {
        LOOP_LOCAL_SUBMISSIONS_ADAPTER: 'supabase',
        NEXT_PUBLIC_SUPABASE_URL: 'https://project.supabase.co',
        SUPABASE_SERVICE_ROLE_KEY: 'server-only-secret',
      },
      fetchImpl: async (_url, init) => {
        requestBody = String(init?.body);
        return Response.json({ allowed: true, remaining: 2, resetAt: 3610 });
      },
    },
  );
  const body = JSON.parse(requestBody);
  assert.equal(body.p_scope, 'unmet_demand');
  assert.equal(body.p_limit, 3);
  assert.equal(body.p_window_seconds, 3600);
});
