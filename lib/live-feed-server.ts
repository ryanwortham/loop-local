import 'server-only';

import {
  eventSlug,
  getLiveFeed as getRemoteLiveFeed,
  type LiveFeedItem,
  type LiveFeedResponse,
} from '@/lib/live-feed';
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
  return (store.publishedLocalEvents || []).map(normalizePublishedLocalItem);
}

export async function getLiveFeed(limit = 24): Promise<LiveFeedResponse> {
  const [remoteFeed, publishedLocalEvents] = await Promise.all([
    getRemoteLiveFeed(limit),
    loadPublishedLocalEvents(),
  ]);
  const items = dedupeFeedItems([...publishedLocalEvents, ...remoteFeed.items]).slice(0, limit);
  return {
    ...remoteFeed,
    source: publishedLocalEvents.length ? 'local_api_backed+live_supabase' : remoteFeed.source,
    count: remoteFeed.count + publishedLocalEvents.length,
    items,
  };
}

export async function getEventBySlug(slug: string): Promise<LiveFeedItem | null> {
  const feed = await getLiveFeed(160);
  return feed.items.find((item) => eventSlug(item) === slug || item.slug === slug || item.id === slug) || null;
}
