import 'server-only';

import {
  eventSlug,
  normalizeFeedItems,
  type LiveFeedItem,
  type LiveFeedResponse,
} from '@/lib/live-feed';
import { getSupabaseFeed } from '@/lib/supabase-feed';
import { readLocalSubmissionsStore } from '@/lib/local-submissions-store';
import { applyEventCategoryOverrides } from '@/lib/event-category-overrides';
import { currentMarketDate, itemMarketDate } from '@/lib/discovery-truthfulness';

// local-published-detail-pages-pass: keep fs-backed local event resolution out of the client bundle.

function normalizePublishedLocalItem(item: LiveFeedItem): LiveFeedItem {
  return {
    ...item,
    source: item.source || 'local_api_backed',
    category: item.category || item.type || 'Community',
    city: item.city || 'Nearby',
    imageState: item.imageState || 'fallback',
    visualKey: item.visualKey || 'community',
    fallbackLabel: item.fallbackLabel || 'Locally approved',
  };
}

function dedupeFeedItems(items: LiveFeedItem[]): LiveFeedItem[] {
  const seen = new Set<string>();
  return items.filter((item) => {
    const key = item.id || eventSlug(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizePublishedLocalEvents(items: LiveFeedItem[]): LiveFeedItem[] {
  const allowSmokeRecords = Boolean(process.env.LOOP_LOCAL_SUBMISSIONS_STORE_PATH);
  return items.filter((item) => allowSmokeRecords || !isSmokeTestLocalEvent(item)).map(normalizePublishedLocalItem);
}

function splitPastEvents(items: LiveFeedItem[], marketDate = currentMarketDate('America/Chicago')) {
  const currentItems: LiveFeedItem[] = [];
  const pastItems: LiveFeedItem[] = [];
  for (const item of items) {
    const date = itemMarketDate(item, 'America/Chicago');
    if (date && date < marketDate) pastItems.push({ ...item, status: item.status || 'past' });
    else currentItems.push(item);
  }
  return { currentItems, pastItems };
}

export async function loadPublishedLocalEvents(): Promise<LiveFeedItem[]> {
  const store = await readLocalSubmissionsStore();
  return normalizePublishedLocalEvents(store.publishedLocalEvents || []);
}

function isSmokeTestLocalEvent(item: LiveFeedItem): boolean {
  // runtime-smoke-data-guard-pass: default preview must not merge API Smoke / Mobile smoke records into discovery.
  const text = [item.id, item.title, item.summary, item.business, item.location].filter(Boolean).join(' ').toLowerCase();
  return text.includes('api smoke') || text.includes('mobile smoke');
}

export async function getLiveFeed(limit = 24): Promise<LiveFeedResponse> {
  const [remoteFeed, store] = await Promise.all([
    getSupabaseFeed(limit),
    readLocalSubmissionsStore(),
  ]);
  const publishedLocalEvents = normalizePublishedLocalEvents(store.publishedLocalEvents || []);
  const remoteItems = normalizeFeedItems(remoteFeed.items);
  const sourceItems = dedupeFeedItems([...publishedLocalEvents, ...remoteItems]);
  const categorizedItems = applyEventCategoryOverrides(sourceItems, store.eventCategoryOverrides);
  const { currentItems, pastItems } = splitPastEvents(categorizedItems);
  const items = currentItems.slice(0, limit);
  return {
    ...remoteFeed,
    source: publishedLocalEvents.length ? `local_api_backed+${remoteFeed.source}` : remoteFeed.source,
    count: items.length,
    items,
    pastItems: pastItems.slice(0, 160),
    pastCount: pastItems.length,
  };
}

export async function getEventBySlug(slug: string): Promise<LiveFeedItem | null> {
  const feed = await getLiveFeed(160);
  const items = [...feed.items, ...(feed.pastItems || [])];
  return items.find((item) => eventSlug(item) === slug || item.slug === slug || item.id === slug) || null;
}
