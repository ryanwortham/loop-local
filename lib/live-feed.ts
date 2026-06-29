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
  website?: string;
  price?: string;
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
