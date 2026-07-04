export const referenceFeedBaseUrl = 'https://replaced-gaming-selected-spectacular.trycloudflare.com';

// live-data-quality-pass: normalize live feed text/categories and attach category-aware image fallback metadata.

export type LiveFeedItem = {
  // published-status-history-pass: published local events may carry their originating Post Local review timeline.
  id: string;
  title: string;
  slug?: string;
  city?: string;
  business?: string;
  businessSlug?: string;
  category?: string;
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

export type LiveFeedResponse = {
  project: string;
  source: 'live_supabase' | string;
  count: number;
  items: LiveFeedItem[];
};

export const emptyLiveFeed: LiveFeedResponse = {
  project: 'looplocal.com',
  source: 'live_supabase',
  count: 0,
  items: [],
};

function cleanTitle(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\s+-\s+$/, '')
    .replace(/^(ticketmaster|eventbrite)\s*[:\-]\s*/i, '')
    .trim();
}

function normalizeCategory(value?: string): string {
  const raw = (value || '').trim();
  if (!raw) return 'Local';
  if (/music|concert|band|artist/i.test(raw)) return 'Live Music';
  if (/sport|game|team/i.test(raw)) return 'Sports';
  if (/family|kid/i.test(raw)) return 'Family';
  if (/fundraiser|charity|benefit/i.test(raw)) return 'Fundraisers';
  return raw;
}

export function eventVisualKey(item: LiveFeedItem): string {
  const category = normalizeCategory(item.category || item.type).toLowerCase();
  if (/music|concert|artist/.test(category)) return 'live-music';
  if (/sport|game/.test(category)) return 'sports';
  if (/family|kid/.test(category)) return 'family';
  if (/food|drink|happy/.test(category)) return 'food-drink';
  if (/fundraiser|community/.test(category)) return 'community';
  return 'local';
}

export function eventImageState(item: LiveFeedItem): 'photo' | 'fallback' {
  return item.image_url ? 'photo' : 'fallback';
}

export function fallbackVisualLabel(item: LiveFeedItem): string {
  const category = normalizeCategory(item.category || item.type);
  if (eventImageState(item) === 'photo') return '';
  if (category === 'Live Music') return 'Live music';
  if (category === 'Sports') return 'Game day';
  if (category === 'Family') return 'Family pick';
  if (category === 'Fundraisers') return 'Local cause';
  return 'Local pick';
}

function categoryPhotoFallback(item: LiveFeedItem): LiveFeedItem {
  return {
    ...item,
    visualKey: eventVisualKey(item),
    imageState: eventImageState(item),
    fallbackLabel: fallbackVisualLabel(item),
  };
}

function normalizeFeedItem(item: LiveFeedItem): LiveFeedItem {
  return categoryPhotoFallback({
    ...item,
    title: cleanTitle(item.title || ''),
    category: normalizeCategory(item.category || item.type),
    city: item.city?.trim(),
    business: item.business?.trim(),
    location: item.location?.trim(),
    summary: item.summary?.trim(),
  });
}

function cleanItems(items: LiveFeedItem[]): LiveFeedItem[] {
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

export function eventExternalUrl(item: LiveFeedItem): string {
  return item.ticketUrl || item.ticket_url || item.event_url || item.venueUrl || item.website || '#';
}

export async function getEventBySlug(slug: string): Promise<LiveFeedItem | null> {
  const feed = await getLiveFeed(120);
  return feed.items.find((item) => eventSlug(item) === slug || item.slug === slug || item.id === slug) || null;
}

export async function getLiveFeed(limit = 24): Promise<LiveFeedResponse> {
  const url = new URL('/api/feed', referenceFeedBaseUrl);

  try {
    const response = await fetch(url, {
      // Keep the workbench close to the actual app without hammering the tunnel.
      next: { revalidate: 60 },
      headers: { accept: 'application/json' },
    });

    if (!response.ok) return emptyLiveFeed;

    const data = (await response.json()) as LiveFeedResponse;
    const items = cleanItems(Array.isArray(data.items) ? data.items : []).slice(0, limit);

    return {
      project: data.project || 'looplocal.com',
      source: data.source || 'live_supabase',
      count: Number(data.count || items.length),
      items,
    };
  } catch {
    return emptyLiveFeed;
  }
}
