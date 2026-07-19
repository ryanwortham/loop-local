import assert from 'node:assert/strict';
import test from 'node:test';
import {
  consumeRateLimit,
  publicRequestIdentity,
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
