import 'server-only';

import {
  eventSlug,
  normalizeFeedItems,
  type LiveFeedItem,
  type LiveFeedResponse,
} from '@/lib/live-feed';
import { getSupabaseFeed } from '@/lib/supabase-feed';
import { readLocalSubmissionsStore } from '@/lib/local-submissions-store';

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

export async function loadPublishedLocalEvents(): Promise<LiveFeedItem[]> {
  const store = await readLocalSubmissionsStore();
  const allowSmokeRecords = Boolean(process.env.LOOP_LOCAL_SUBMISSIONS_STORE_PATH);
  return (store.publishedLocalEvents || []).filter((item) => allowSmokeRecords || !isSmokeTestLocalEvent(item)).map(normalizePublishedLocalItem);
}

function isSmokeTestLocalEvent(item: LiveFeedItem): boolean {
  // runtime-smoke-data-guard-pass: default preview must not merge API Smoke / Mobile smoke records into discovery.
  const text = [item.id, item.title, item.summary, item.business, item.location].filter(Boolean).join(' ').toLowerCase();
  return text.includes('api smoke') || text.includes('mobile smoke');
}

export async function getLiveFeed(limit = 24): Promise<LiveFeedResponse> {
  const [remoteFeed, publishedLocalEvents] = await Promise.all([
    getSupabaseFeed(limit),
    loadPublishedLocalEvents(),
  ]);
  const remoteItems = normalizeFeedItems(remoteFeed.items);
  const items = dedupeFeedItems([...publishedLocalEvents, ...remoteItems]).slice(0, limit);
  return {
    ...remoteFeed,
    source: publishedLocalEvents.length ? `local_api_backed+${remoteFeed.source}` : remoteFeed.source,
    count: remoteFeed.count + publishedLocalEvents.length,
    items,
  };
}

export async function getEventBySlug(slug: string): Promise<LiveFeedItem | null> {
  const feed = await getLiveFeed(160);
  return feed.items.find((item) => eventSlug(item) === slug || item.slug === slug || item.id === slug) || null;
}
