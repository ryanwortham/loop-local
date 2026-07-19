export type FeedHealthStatus = 'fresh' | 'empty' | 'stale' | 'unavailable';

export type ReliableFeedItem = {
  id: string;
  title: string;
  slug?: string;
  city?: string;
  business?: string;
  businessSlug?: string;
  category?: string;
  status?: string;
  startsAt?: string | null;
  endsAt?: string | null;
  date?: string;
  time?: string;
  location?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  summary?: string;
  source?: string;
  ticketUrl?: string;
  venueUrl?: string;
  website?: string;
  price?: string;
  image_url?: string;
};

export type FeedHealth = {
  status: FeedHealthStatus;
  fetchedAt: string | null;
  ageSeconds: number | null;
  attempts: number;
  upstreamStatus?: number;
  message?: string;
};

export type ReliableFeedResponse = {
  project: string;
  source: string;
  count: number;
  items: ReliableFeedItem[];
  health: FeedHealth;
};

export type FeedCache = {
  value?: ReliableFeedResponse;
  storedAt?: number;
};

export type FeedConfig = {
  baseUrl: string;
  anonKey: string;
  timeoutMs: number;
  retries: number;
  staleMaxAgeMs: number;
};

export type FeedFetch = (input: string | URL | Request, init?: RequestInit) => Promise<Response>;

type FeedEnvironment = Record<string, string | undefined>;
type Sleep = (milliseconds: number) => Promise<void>;

type SupabaseEventRow = {
  id?: unknown;
  title?: unknown;
  slug?: unknown;
  city?: unknown;
  business_slug?: unknown;
  category?: unknown;
  status?: unknown;
  starts_at?: unknown;
  ends_at?: unknown;
  venue?: unknown;
  location_name?: unknown;
  address?: unknown;
  latitude?: unknown;
  longitude?: unknown;
  description?: unknown;
  website?: unknown;
  price?: unknown;
  price_text?: unknown;
  image_url?: unknown;
};

type SupabaseBusinessRow = {
  name?: unknown;
  slug?: unknown;
  website?: unknown;
};

class FeedRequestError extends Error {
  readonly retryable: boolean;
  readonly status?: number;

  constructor(message: string, retryable: boolean, status?: number) {
    super(message);
    this.name = 'FeedRequestError';
    this.retryable = retryable;
    this.status = status;
  }
}

function requiredValue(env: FeedEnvironment, key: string, label: string): string {
  const value = env[key]?.trim();
  if (!value) throw new Error(`Missing ${label}`);
  return value;
}

function boundedInteger(env: FeedEnvironment, key: string, fallback: number, min: number, max: number): number {
  const raw = env[key]?.trim();
  if (!raw) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed < min || parsed > max) {
    throw new Error(`${key} must be an integer between ${min} and ${max}`);
  }
  return parsed;
}

export function resolveFeedConfig(env: FeedEnvironment): FeedConfig {
  const rawBaseUrl = requiredValue(env, 'NEXT_PUBLIC_SUPABASE_URL', 'Supabase URL');
  const parsed = new URL(rawBaseUrl);
  const localHost = parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';
  if ((!localHost && parsed.protocol !== 'https:') || (!localHost && !parsed.hostname.endsWith('.supabase.co'))) {
    throw new Error('Supabase URL must use the stable *.supabase.co HTTPS endpoint');
  }

  return {
    baseUrl: parsed.origin,
    anonKey: requiredValue(env, 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'Supabase anon key'),
    timeoutMs: boundedInteger(env, 'LOOP_LOCAL_FEED_TIMEOUT_MS', 4500, 250, 15000),
    retries: boundedInteger(env, 'LOOP_LOCAL_FEED_RETRIES', 2, 0, 3),
    staleMaxAgeMs: boundedInteger(env, 'LOOP_LOCAL_FEED_STALE_MAX_AGE_MS', 21_600_000, 60_000, 86_400_000),
  };
}

function stringValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function numberValue(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function utcDateTimeParts(value: unknown): { date?: string; time?: string } {
  const startsAt = stringValue(value);
  if (!startsAt) return {};
  const parsed = new Date(startsAt);
  if (Number.isNaN(parsed.getTime())) return {};
  return {
    date: parsed.toISOString().slice(0, 10),
    time: `${parsed.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true, timeZone: 'UTC' })} UTC`,
  };
}

function normalizeRow(row: SupabaseEventRow): ReliableFeedItem | null {
  const id = stringValue(row.id);
  const title = stringValue(row.title);
  if (!id || !title) return null;
  const website = stringValue(row.website);
  const startsAt = stringValue(row.starts_at) || null;
  const displayDateTime = utcDateTimeParts(startsAt);
  return {
    id,
    title,
    slug: stringValue(row.slug),
    city: stringValue(row.city),
    businessSlug: stringValue(row.business_slug),
    category: stringValue(row.category) || 'Community',
    status: stringValue(row.status),
    startsAt,
    endsAt: stringValue(row.ends_at) || null,
    ...displayDateTime,
    location: stringValue(row.venue) || stringValue(row.location_name),
    address: stringValue(row.address),
    latitude: numberValue(row.latitude),
    longitude: numberValue(row.longitude),
    summary: stringValue(row.description),
    source: 'live_supabase',
    ticketUrl: website,
    website,
    price: stringValue(row.price) || stringValue(row.price_text),
    image_url: stringValue(row.image_url),
  };
}

function totalFromContentRange(value: string | null, fallback: number): number {
  if (!value) return fallback;
  const total = value.split('/').at(-1);
  if (!total || total === '*') return fallback;
  const parsed = Number(total);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

function buildEventsUrl(config: FeedConfig, limit: number, currentIso: string): URL {
  const url = new URL('/rest/v1/events', config.baseUrl);
  url.searchParams.set('select', [
    'id', 'title', 'slug', 'city', 'business_slug', 'category', 'status', 'starts_at', 'ends_at',
    'venue', 'location_name', 'address', 'latitude', 'longitude', 'description', 'website', 'price',
    'price_text', 'image_url',
  ].join(','));
  url.searchParams.set('status', 'eq.approved');
  url.searchParams.set('is_active', 'eq.true');
  url.searchParams.set('or', `(starts_at.gte.${currentIso},ends_at.gte.${currentIso})`);
  url.searchParams.set('order', 'starts_at.asc');
  url.searchParams.set('limit', String(Math.min(Math.max(Math.trunc(limit), 1), 160)));
  return url;
}

function buildBusinessesUrl(config: FeedConfig): URL {
  const url = new URL('/rest/v1/businesses', config.baseUrl);
  url.searchParams.set('select', 'name,slug,website');
  url.searchParams.set('limit', '500');
  return url;
}

async function enrichWithBusinessMetadata(
  config: FeedConfig,
  fetchImpl: FeedFetch,
  signal: AbortSignal,
  items: ReliableFeedItem[],
): Promise<ReliableFeedItem[]> {
  if (!items.some((item) => item.businessSlug)) return items;

  try {
    const response = await fetchImpl(buildBusinessesUrl(config), {
      headers: {
        accept: 'application/json',
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
      },
      cache: 'no-store',
      signal,
    });
    if (!response.ok) return items;
    const body: unknown = await response.json();
    if (!Array.isArray(body)) return items;
    const businesses = new Map<string, { name?: string; website?: string }>();
    for (const raw of body) {
      const row = raw as SupabaseBusinessRow;
      const slug = stringValue(row.slug);
      if (slug) businesses.set(slug, { name: stringValue(row.name), website: stringValue(row.website) });
    }
    return items.map((item) => {
      const business = item.businessSlug ? businesses.get(item.businessSlug) : undefined;
      if (!business) return item;
      return {
        ...item,
        business: business.name || item.business,
        venueUrl: item.venueUrl || business.website,
      };
    });
  } catch {
    return items;
  }
}

async function requestFeed(config: FeedConfig, fetchImpl: FeedFetch, limit: number, currentIso: string): Promise<{ items: ReliableFeedItem[]; count: number; status: number }> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);
  try {
    const response = await fetchImpl(buildEventsUrl(config, limit, currentIso), {
      headers: {
        accept: 'application/json',
        apikey: config.anonKey,
        authorization: `Bearer ${config.anonKey}`,
        prefer: 'count=exact',
      },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!response.ok) {
      const retryable = response.status === 408 || response.status === 429 || response.status >= 500;
      throw new FeedRequestError(`Upstream returned ${response.status}`, retryable, response.status);
    }
    const body: unknown = await response.json();
    if (!Array.isArray(body)) throw new FeedRequestError('Upstream returned an invalid feed payload', false, response.status);
    const normalizedItems = body.map((row) => normalizeRow(row as SupabaseEventRow)).filter((item): item is ReliableFeedItem => Boolean(item));
    const items = await enrichWithBusinessMetadata(config, fetchImpl, controller.signal, normalizedItems);
    return { items, count: totalFromContentRange(response.headers.get('content-range'), items.length), status: response.status };
  } catch (error) {
    if (error instanceof FeedRequestError) throw error;
    const isAbortError = typeof error === 'object' && error !== null && 'name' in error && error.name === 'AbortError';
    if (isAbortError) throw new FeedRequestError(`Feed request timed out after ${config.timeoutMs}ms`, true);
    const message = error instanceof Error ? error.message : 'Unknown network error';
    throw new FeedRequestError(`Feed request failed: ${message}`, true);
  } finally {
    clearTimeout(timeout);
  }
}

const defaultSleep: Sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));

export async function fetchFeedWithReliability({
  config,
  limit = 24,
  fetchImpl = fetch,
  cache,
  now = Date.now,
  sleep = defaultSleep,
}: {
  config: FeedConfig;
  limit?: number;
  fetchImpl?: FeedFetch;
  cache: FeedCache;
  now?: () => number;
  sleep?: Sleep;
}): Promise<ReliableFeedResponse> {
  let attempts = 0;
  let lastError: FeedRequestError | undefined;

  while (attempts <= config.retries) {
    attempts += 1;
    try {
      const result = await requestFeed(config, fetchImpl, limit, new Date(now()).toISOString());
      const fetchedAt = new Date(now()).toISOString();
      const feed: ReliableFeedResponse = {
        project: 'looplocal.com',
        source: 'live_supabase',
        count: result.count,
        items: result.items,
        health: {
          status: result.items.length ? 'fresh' : 'empty',
          fetchedAt,
          ageSeconds: 0,
          attempts,
          upstreamStatus: result.status,
        },
      };
      cache.value = feed;
      cache.storedAt = now();
      return feed;
    } catch (error) {
      lastError = error instanceof FeedRequestError ? error : new FeedRequestError('Unknown feed failure', false);
      if (!lastError.retryable || attempts > config.retries) break;
      await sleep(150 * attempts);
    }
  }

  const currentTime = now();
  const cacheAgeMs = cache.storedAt === undefined ? Number.POSITIVE_INFINITY : Math.max(0, currentTime - cache.storedAt);
  if (cache.value && cacheAgeMs <= config.staleMaxAgeMs) {
    return {
      ...cache.value,
      source: `${cache.value.source}_stale`,
      health: {
        status: 'stale',
        fetchedAt: cache.value.health.fetchedAt,
        ageSeconds: Math.floor(cacheAgeMs / 1000),
        attempts,
        upstreamStatus: lastError?.status,
        message: lastError?.message || 'Live feed unavailable; serving recent cached data',
      },
    };
  }

  return {
    project: 'looplocal.com',
    source: 'live_supabase_unavailable',
    count: 0,
    items: [],
    health: {
      status: 'unavailable',
      fetchedAt: null,
      ageSeconds: null,
      attempts,
      upstreamStatus: lastError?.status,
      message: lastError?.message || 'Live feed unavailable',
    },
  };
}
