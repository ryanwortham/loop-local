export const referenceFeedBaseUrl = 'https://replaced-gaming-selected-spectacular.trycloudflare.com';

export type LiveFeedItem = {
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
  endsAt?: string | null;
  timezone?: string;
  artists?: string[];
  soldOut?: boolean;
  limitedAvailability?: boolean;
  rescheduled?: boolean;
  isPartnerEvent?: boolean;
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

function cleanItems(items: LiveFeedItem[]): LiveFeedItem[] {
  const seen = new Set<string>();
  return items
    .filter((item) => item && item.id && item.title)
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
