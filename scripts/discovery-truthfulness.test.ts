import assert from 'node:assert/strict';
import test from 'node:test';
import {
  closestHighlight,
  discoverySectionLabels,
  distanceLineForItem,
  eventMatchesMoment,
  feedQualityGate,
  mapPinStyleForItem,
  visibleDiscoveryItems,
  type ViewerLocation,
} from '../lib/discovery-truthfulness.ts';
import { eventExternalUrl, type LiveFeedItem } from '../lib/live-feed.ts';

const marketDate = '2026-07-21';
const viewerLocation: ViewerLocation = { latitude: 38.627, longitude: -90.1994 };

function item(overrides: Partial<LiveFeedItem>): LiveFeedItem {
  return {
    id: overrides.id || 'event-id',
    title: overrides.title || 'Local Event',
    city: overrides.city || 'St. Louis',
    date: overrides.date,
    time: overrides.time,
    startsAt: overrides.startsAt,
    latitude: overrides.latitude,
    longitude: overrides.longitude,
    category: overrides.category || 'Community',
    website: overrides.website,
    ticketUrl: overrides.ticketUrl,
    summary: overrides.summary,
    source: overrides.source || 'live_supabase',
  };
}

test('Tonight filter only matches evening events on the current market date', () => {
  assert.equal(eventMatchesMoment(item({ date: marketDate, time: '7:00 PM CDT' }), 'Tonight', { marketDate }), true);
  assert.equal(eventMatchesMoment(item({ date: '2026-07-22', time: '7:00 PM CDT' }), 'Tonight', { marketDate }), false);
  assert.equal(eventMatchesMoment(item({ date: marketDate, time: '11:30 AM CDT', title: 'Tonight Preview' }), 'Tonight', { marketDate }), false);
  assert.equal(eventMatchesMoment(item({ startsAt: '2026-07-22T00:30:00Z', time: '7:30 PM CDT' }), 'Tonight', { marketDate, timeZone: 'America/Chicago' }), true);
});

test('distance and closest labels are honest until a viewer location exists', () => {
  const nearby = item({ id: 'nearby', latitude: 38.6275, longitude: -90.2 });
  const farther = item({ id: 'farther', latitude: 38.66, longitude: -90.32 });
  assert.equal(distanceLineForItem(nearby), 'Distance available after location sharing');
  assert.match(distanceLineForItem(nearby, viewerLocation), /^0\.0[0-9]? mi away|0\.1 mi away$/);
  assert.equal(closestHighlight([farther, nearby], viewerLocation)?.id, 'nearby');
  assert.equal(closestHighlight([farther, nearby]), null);
});

test('radius filtering applies only when a viewer location exists', () => {
  const near = item({ id: 'near', latitude: 38.6275, longitude: -90.2 });
  const outside = item({ id: 'outside', latitude: 39.1, longitude: -90.9 });
  assert.deepEqual(visibleDiscoveryItems([near, outside], { radiusMiles: 10 }).map((event) => event.id), ['near', 'outside']);
  assert.deepEqual(visibleDiscoveryItems([near, outside], { viewerLocation, radiusMiles: 10 }).map((event) => event.id), ['near']);
});

test('map pins are derived from coordinates, not feed order', () => {
  const first = item({ id: 'first', latitude: 38.61, longitude: -90.31 });
  const second = item({ id: 'second', latitude: 38.72, longitude: -90.11 });
  const bounds = [first, second];
  assert.deepEqual(mapPinStyleForItem(first, bounds), mapPinStyleForItem(first, [...bounds].reverse()));
  assert.notDeepEqual(mapPinStyleForItem(first, bounds), mapPinStyleForItem(second, bounds));
  assert.equal(mapPinStyleForItem(item({ id: 'missing' }), bounds), null);
});

test('unranked and uncurated feed slices receive honest section labels', () => {
  assert.deepEqual(discoverySectionLabels({ hasCuration: false, hasPopularityScores: false }), {
    featured: 'Upcoming Events',
    popular: 'More Local Events',
    popularCountLabel: 'events shown',
  });
  assert.deepEqual(discoverySectionLabels({ hasCuration: true, hasPopularityScores: true }), {
    featured: 'Featured This Week',
    popular: 'Popular Near You',
    popularCountLabel: 'ranked picks',
  });
});

test('placeholder-domain action URLs are not exposed as event CTAs', () => {
  assert.equal(eventExternalUrl(item({ website: 'https://example.com/demo' })), '#');
  assert.equal(eventExternalUrl(item({ ticketUrl: 'https://tickets.local.test/event' })), 'https://tickets.local.test/event');
});

test('feed quality gate flags placeholder domains and demo-quality inventory', () => {
  const report = feedQualityGate([
    item({ id: 'one', city: 'St. Louis', category: 'Community', website: 'https://example.com/demo', date: '2026-07-22' }),
    item({ id: 'two', city: 'St. Louis', category: 'Community', website: 'https://example.org/demo', date: '2026-07-20' }),
  ], { marketDate });
  assert.equal(report.ready, false);
  assert.equal(report.metrics.inventorySize, 2);
  assert.equal(report.metrics.placeholderDomainActions, 2);
  assert.deepEqual(report.issues, [
    'inventory_size_below_launch_threshold',
    'category_diversity_below_launch_threshold',
    'city_diversity_below_launch_threshold',
    'media_coverage_below_launch_threshold',
    'placeholder_domain_actions_present',
    'expired_events_present',
  ]);
});
