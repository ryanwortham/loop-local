// live-data-quality-pass: normalize live feed text/categories and attach category-aware image fallback metadata.

import { eventCategoryFallbackImage, eventCategoryVisualKey, normalizeEventCategory } from './event-taxonomy.ts';

export type LiveFeedItem = {
  // published-status-history-pass: published local events may carry their originating Post Local review timeline.
  id: string;
  title: string;
  slug?: string;
  city?: string;
  business?: string;
  businessSlug?: string;
  category?: string;
  sourceCategory?: string;
  categoryOverrideApplied?: boolean;
  status?: string;
  date?: string;
  time?: string;
  startsAt?: string | null;
  location?: string;
  address?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  summary?: string;
  type?: string;
  source?: string;
  ticketUrl?: string;
  ticket_url?: string;
  event_url?: string;
  venueUrl?: string;
  website?: string;
  price?: string;
  image_url?: string;
  fallbackImageUrl?: string;
  visualKey?: string;
  imageState?: 'photo' | 'fallback';
  fallbackLabel?: string;
  endsAt?: string | null;
  timezone?: string;
  artists?: string[];
  soldOut?: boolean;
  limitedAvailability?: boolean;
  rescheduled?: boolean;
  isPartnerEvent?: boolean;
  // published-status-history-pass marker: localSubmissionStatusHistory?: LocalSubmissionHistoryEntry[]
  localSubmissionStatusHistory?: Array<{ action: string; label?: string; at?: string; note?: string }>;
};

export type LiveFeedHealth = {
  status: 'fresh' | 'empty' | 'stale' | 'unavailable';
  fetchedAt: string | null;
  ageSeconds: number | null;
  attempts: number;
  upstreamStatus?: number;
  message?: string;
};

export type LiveFeedResponse = {
  project: string;
  source: 'live_supabase' | string;
  count: number;
  items: LiveFeedItem[];
  health: LiveFeedHealth;
};

export const emptyLiveFeed: LiveFeedResponse = {
  project: 'looplocal.com',
  source: 'live_supabase_unavailable',
  count: 0,
  items: [],
  health: {
    status: 'unavailable',
    fetchedAt: null,
    ageSeconds: null,
    attempts: 0,
    message: 'Live feed unavailable',
  },
};

function cleanTitle(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+-\s+$/, '')
    .replace(/^(ticketmaster|eventbrite)\s*[:\-]\s*/i, '')
    .trim();
}

export function eventVisualKey(item: LiveFeedItem): string {
  return eventCategoryVisualKey(normalizeEventCategory(item));
}

export function eventImageState(item: LiveFeedItem): 'photo' | 'fallback' {
  return item.image_url ? 'photo' : 'fallback';
}

export function fallbackVisualLabel(item: LiveFeedItem): string {
  const category = normalizeEventCategory(item);
  if (eventImageState(item) === 'photo') return '';
  if (category === 'Live Music') return 'Live music';
  if (category === 'Sports') return 'Game day';
  if (category === 'Family' || category === 'School Activities') return 'Family pick';
  if (category === 'Food & Drink' || category === 'Happy Hour') return 'Food & drink';
  if (category === 'Arts & Culture' || category === 'Festivals') return 'Arts & culture';
  if (category === 'Shopping' || category === 'Deals') return 'Shop local';
  if (category === 'Fundraisers') return 'Local cause';
  if (category === 'City & Civic') return 'Civic life';
  return 'Local pick';
}

function categoryPhotoFallback(item: LiveFeedItem): LiveFeedItem {
  return {
    ...item,
    fallbackImageUrl: eventCategoryFallbackImage(item.category, [item.id, item.title, item.date].filter(Boolean).join('|')),
    visualKey: eventVisualKey(item),
    imageState: eventImageState(item),
    fallbackLabel: fallbackVisualLabel(item),
  };
}

function normalizeFeedItem(item: LiveFeedItem): LiveFeedItem {
  const title = cleanTitle(item.title || '');
  return categoryPhotoFallback({
    ...item,
    title,
    category: normalizeEventCategory({ ...item, title }),
    city: item.city?.trim(),
    business: item.business?.trim(),
    location: item.location?.trim(),
    summary: item.summary?.trim(),
  });
}

export function normalizeFeedItems(items: LiveFeedItem[]): LiveFeedItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => item && item.id && item.title)
    .map(normalizeFeedItem)
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });
}

export function eventSlug(item: LiveFeedItem): string {
  if (item.slug) return item.slug;
  const base = [item.title, item.city, item.id]
    .filter(Boolean)
    .join(' ')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 96);
  return base || item.id;
}

export function eventDetailPath(item: LiveFeedItem): string {
  return `/events/${eventSlug(item)}`;
}

const PLACEHOLDER_EXTERNAL_DOMAINS = new Set(['example.com', 'example.org', 'example.net']);

export function safeExternalUrl(value?: string): string {
  // safe-external-url-pass: only navigable public URL protocols may leave Loop Local.
  if (!value) return '#';
  try {
    const parsed = new URL(value, 'https://looplocal.invalid');
    const { protocol } = parsed;
    const hostname = parsed.hostname.replace(/^www\./, '').toLowerCase();
    if (PLACEHOLDER_EXTERNAL_DOMAINS.has(hostname)) return '#';
    if (protocol === 'http:' || protocol === 'https:' || protocol === 'mailto:' || protocol === 'tel:') return value;
  } catch {
    return '#';
  }
  return '#';
}

export function eventExternalUrl(item: LiveFeedItem): string {
  return safeExternalUrl(item.ticketUrl || item.ticket_url || item.event_url || item.venueUrl || item.website);
}
