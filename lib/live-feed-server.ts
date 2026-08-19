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
import { readLifecycleStates } from '@/lib/event-engagement-repository';

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

export async function loadPublishedLocalEvents(): Promise<LiveFeedItem[]> {
  const store = await readLocalSubmissionsStore();
  return normalizePublishedLocalEvents(store.publishedLocalEvents || []);
}

function isSmokeTestLocalEvent(item: LiveFeedItem): boolean {
  // runtime-smoke-data-guard-pass: default preview must not merge API Smoke / Mobile smoke records into discovery.
  const text = [item.id, item.title, item.summary, item.business, item.location].filter(Boolean).join(' ').toLowerCase();
  return text.includes('api smoke') || text.includes('mobile smoke');
}

export async function getLiveFeed(limit = 24, options: { includeCancelled?: boolean } = {}): Promise<LiveFeedResponse> {
  const [remoteFeed, store] = await Promise.all([
    getSupabaseFeed(limit),
    readLocalSubmissionsStore(),
  ]);
  const publishedLocalEvents = normalizePublishedLocalEvents(store.publishedLocalEvents || []);
  const remoteItems = normalizeFeedItems(remoteFeed.items);
  const sourceItems = dedupeFeedItems([...publishedLocalEvents, ...remoteItems]).slice(0, limit);
  let lifecycleStates: Awaited<ReturnType<typeof readLifecycleStates>> = [];
  try { lifecycleStates = await readLifecycleStates(); } catch { /* Lifecycle migration may not be deployed yet. */ }
  const lifecycleByEvent = new Map(lifecycleStates.map((state) => [state.eventKey, state]));
  const items = applyEventCategoryOverrides(sourceItems, store.eventCategoryOverrides)
    .map((item) => {
      const lifecycle = lifecycleByEvent.get(item.id);
      return lifecycle ? { ...item, lifecycleStatus: lifecycle.action as LiveFeedItem['lifecycleStatus'], lastVerifiedAt: lifecycle.lastVerifiedAt } : item;
    })
    .filter((item) => options.includeCancelled || item.lifecycleStatus !== 'cancelled');
  return {
    ...remoteFeed,
    source: publishedLocalEvents.length ? `local_api_backed+${remoteFeed.source}` : remoteFeed.source,
    count: remoteFeed.count + publishedLocalEvents.length,
    items,
  };
}

export async function getEventBySlug(slug: string): Promise<LiveFeedItem | null> {
  const feed = await getLiveFeed(160, { includeCancelled: true });
  return feed.items.find((item) => eventSlug(item) === slug || item.slug === slug || item.id === slug) || null;
}
