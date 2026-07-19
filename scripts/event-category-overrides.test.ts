import assert from 'node:assert/strict';
import test from 'node:test';
import {
  applyEventCategoryOverrides,
  normalizeEventCategoryOverrides,
  REVIEWED_EVENT_CATEGORY_OVERRIDES,
  type EventCategoryOverrideMap,
} from '../lib/event-category-overrides.ts';
import type { LiveFeedItem } from '../lib/live-feed.ts';

function item(overrides: Partial<LiveFeedItem> = {}): LiveFeedItem {
  return {
    id: 'event-1',
    title: 'Pickleball Round Robin',
    category: 'Community',
    date: '2026-07-25',
    image_url: '',
    ...overrides,
  };
}

test('only an explicit ID-and-title review can override source taxonomy', () => {
  const overrides: EventCategoryOverrideMap = {
    'event-1': {
      category: 'Sports',
      sourceCategory: 'Community',
      eventTitle: 'Pickleball Round Robin',
      reviewedAt: '2026-07-19T00:00:00.000Z',
    },
  };
  const [corrected] = applyEventCategoryOverrides([item()], overrides);
  assert.equal(corrected.category, 'Sports');
  assert.equal(corrected.sourceCategory, 'Community');
  assert.equal(corrected.categoryOverrideApplied, true);
  assert.equal(corrected.visualKey, 'sports');
  assert.equal(corrected.fallbackImageUrl, '/event-art/sports.svg');

  const [titleMismatch] = applyEventCategoryOverrides([item({ title: 'Different event' })], overrides);
  assert.equal(titleMismatch.category, 'Community');
  assert.equal(titleMismatch.categoryOverrideApplied, undefined);

  const [sourceChanged] = applyEventCategoryOverrides([item({ category: 'City & Civic' })], overrides);
  assert.equal(sourceChanged.sourceCategory, 'City & Civic');
  assert.equal(sourceChanged.category, 'Sports');
});

test('normalization rejects unsupported and malformed persisted overrides', () => {
  const normalized = normalizeEventCategoryOverrides({
    valid: { category: 'Kids', sourceCategory: 'Community', eventTitle: 'Story Hour', reviewedAt: '2026-07-19T00:00:00.000Z' },
    invalid: { category: 'Made Up Category', sourceCategory: 'Community', eventTitle: 'Bad' },
    malformed: 'Sports',
  });
  assert.deepEqual(Object.keys(normalized), ['valid']);
  assert.equal(normalized.valid.category, 'Family');
});

test('reviewed seed corrections are exact and never infer from generic copy', () => {
  assert.equal(REVIEWED_EVENT_CATEGORY_OVERRIDES['6c88a197-141e-46a0-9aa8-5f1bfbd1d34b'].category, 'Sports');
  assert.equal(REVIEWED_EVENT_CATEGORY_OVERRIDES['80196afa-107d-480e-9fe5-5974148bec3e'].category, 'Arts & Culture');
  assert.equal(Object.keys(REVIEWED_EVENT_CATEGORY_OVERRIDES).length, 6);

  const [untouched] = applyEventCategoryOverrides([
    item({ id: 'unreviewed', title: 'Sports-sounding words in an unreviewed title' }),
  ], REVIEWED_EVENT_CATEGORY_OVERRIDES);
  assert.equal(untouched.category, 'Community');
  assert.equal(untouched.categoryOverrideApplied, undefined);
});
