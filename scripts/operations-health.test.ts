import assert from 'node:assert/strict';
import { test } from 'node:test';

import { buildOperationsHealthPayload } from '../lib/operations-health.ts';
import type { LiveFeedResponse } from '../lib/live-feed.ts';
import type { LocalSubmissionsStore } from '../lib/local-submissions-store.ts';

const store: LocalSubmissionsStore = {
  version: 1,
  pendingSubmissions: [{ id: 'pending-1', status: 'pending_review', submittedAt: '2026-07-21T12:00:00Z' }],
  publishedLocalEvents: [],
  eventCategoryOverrides: {},
  operatorAuditLog: [],
};

function feed(overrides: Partial<LiveFeedResponse> = {}): LiveFeedResponse {
  return {
    project: 'looplocal.com',
    source: 'live_supabase',
    count: 1,
    items: [{
      id: 'event-1',
      title: 'Launch Ready Farmers Market',
      date: '2026-07-22',
      time: '7:00 PM',
      category: 'Community',
      city: 'St. Louis',
      location: 'Tower Grove Park',
      image_url: 'https://images.example.test/farmers-market.jpg',
      website: 'https://towergrove.example.test/events/farmers-market',
    }],
    health: { status: 'fresh', fetchedAt: '2026-07-21T12:00:00Z', ageSeconds: 20, attempts: 1, upstreamStatus: 200 },
    ...overrides,
  };
}

test('operations health payload exposes deployment, feed, and submissions status without secrets', () => {
  const payload = buildOperationsHealthPayload({
    feed: feed(),
    store,
    adapter: 'supabase',
    now: new Date('2026-07-21T12:00:00Z'),
    env: {
      NODE_ENV: 'production',
      VERCEL: '1',
      VERCEL_ENV: 'production',
      VERCEL_GIT_COMMIT_SHA: 'abc123',
      NEXT_PUBLIC_APP_VERSION: '0.1.0',
      LOOP_LOCAL_PUBLIC_URL: 'https://looplocal.example.test',
      LOOP_LOCAL_MONITOR_WEBHOOK_URL: 'https://hooks.example.test/redacted',
      SUPABASE_SERVICE_ROLE_KEY: 'must-not-appear',
    },
  });

  assert.equal(payload.service, 'loop-local');
  assert.equal(payload.status, 'degraded');
  assert.equal(payload.environment, 'production');
  assert.equal(payload.deployment.target, 'vercel');
  assert.equal(payload.deployment.publicUrlConfigured, true);
  assert.equal(payload.deployment.monitorConfigured, true);
  assert.equal(payload.feed.status, 'fresh');
  assert.equal(payload.submissions.adapter, 'supabase');
  assert.equal(payload.submissions.pendingReviewCount, 1);
  assert.equal(JSON.stringify(payload).includes('must-not-appear'), false);
});

test('operations health is down when feed is unavailable', () => {
  const payload = buildOperationsHealthPayload({
    feed: feed({ count: 0, items: [], health: { status: 'unavailable', fetchedAt: null, ageSeconds: null, message: 'timeout', attempts: 1 } }),
    store: { ...store, pendingSubmissions: [] },
    adapter: 'file',
    env: {},
    now: new Date('2026-07-21T12:00:00Z'),
  });

  assert.equal(payload.status, 'down');
  assert.equal(payload.feed.status, 'unavailable');
  assert.equal(payload.deployment.target, 'local');
  assert.equal(payload.deployment.publicUrlConfigured, false);
});
