import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import {
  EVENT_CATEGORIES,
  eventCategoryFallbackImage,
  isEventCategory,
  normalizeEventCategory,
} from '../lib/event-taxonomy.ts';
import { normalizeFeedItems } from '../lib/live-feed.ts';

test('feed taxonomy stays source-authored instead of guessing from event copy', () => {
  const genericTitles = [
    'Bourbon & BBQ Night',
    'Art Walk Evening',
    'Library Story Hour',
    'Pickleball Round Robin',
    'Holiday Parade Planning',
  ];

  for (const title of genericTitles) {
    assert.equal(normalizeEventCategory({ category: 'Community', title }), 'Community', title);
  }
  assert.equal(normalizeEventCategory({ title: 'Jazz on the Patio' }), 'Local');
});

test('specific source categories remain authoritative while aliases are canonicalized', () => {
  assert.equal(normalizeEventCategory({ category: 'Nightlife', title: 'Jazz on the Patio' }), 'Nightlife');
  assert.equal(normalizeEventCategory({ category: 'Kids' }), 'Family');
  assert.equal(normalizeEventCategory({ category: 'City Notices' }), 'City & Civic');
  assert.equal(normalizeEventCategory({ category: 'Fundraiser' }), 'Fundraisers');
  assert.equal(isEventCategory('Made Up Category'), false);
  assert.equal(EVENT_CATEGORIES.every(isEventCategory), true);
});

test('normalized feed items receive source taxonomy and bundled visual metadata', () => {
  const [item] = normalizeFeedItems([{
    id: 'pickleball-1',
    title: 'Pickleball Round Robin',
    category: 'Community',
  }]);

  assert.equal(item.category, 'Community');
  assert.equal(item.visualKey, 'community');
  assert.equal(item.imageState, 'fallback');
  assert.match(item.fallbackImageUrl || '', /^\/event-art\/community(?:-[a-z]+)?\.svg$/);
});

test('generic categories rotate deterministically across non-semantic local artwork', async () => {
  const imagePaths = Array.from({ length: 16 }, (_, index) => eventCategoryFallbackImage('Community', `event-${index}`));
  assert.equal(new Set(imagePaths).size, 4);
  assert.equal(eventCategoryFallbackImage('Community', 'event-4'), eventCategoryFallbackImage('Community', 'event-4'));
  for (const imagePath of new Set(imagePaths)) {
    const svg = await readFile(path.join(process.cwd(), 'public', imagePath), 'utf8');
    assert.match(svg, /<svg[\s>]/);
  }
});

test('every canonical category resolves to a bundled fallback illustration', async () => {
  for (const category of EVENT_CATEGORIES) {
    const imagePath = eventCategoryFallbackImage(category);
    assert.match(imagePath, /^\/event-art\/[a-z-]+\.svg$/);
    const svg = await readFile(path.join(process.cwd(), 'public', imagePath), 'utf8');
    assert.match(svg, /<svg[\s>]/);
    assert.match(svg, /role="img"/);
  }
});
