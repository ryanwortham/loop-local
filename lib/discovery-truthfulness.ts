import type { LiveFeedItem } from './live-feed.ts';

export type ViewerLocation = {
  latitude: number;
  longitude: number;
};

export type MomentOptions = {
  marketDate: string;
  timeZone?: string;
};

export type DiscoveryFilterOptions = {
  viewerLocation?: ViewerLocation | null;
  radiusMiles?: number | null;
};

type SectionLabelOptions = {
  hasCuration: boolean;
  hasPopularityScores: boolean;
};

export type FeedQualityReport = {
  ready: boolean;
  metrics: {
    inventorySize: number;
    categoryDiversity: number;
    cityDiversity: number;
    mediaCoverage: number;
    placeholderDomainActions: number;
    duplicateIds: number;
    upcomingEvents: number;
    expiredEvents: number;
  };
  issues: string[];
};

const DEFAULT_MARKET_TIME_ZONE = 'America/Chicago';
const LAUNCH_MINIMUM_INVENTORY = 12;
const LAUNCH_MINIMUM_CATEGORIES = 3;
const LAUNCH_MINIMUM_CITIES = 2;
const LAUNCH_MINIMUM_MEDIA_COVERAGE = 0.5;
const PLACEHOLDER_DOMAINS = new Set(['example.com', 'example.org', 'example.net']);

function finiteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function hasCoordinates(item: LiveFeedItem): item is LiveFeedItem & Required<Pick<LiveFeedItem, 'latitude' | 'longitude'>> {
  return finiteNumber(item.latitude) && finiteNumber(item.longitude);
}

function toRadians(value: number): number {
  return (value * Math.PI) / 180;
}

export function milesBetween(a: ViewerLocation, b: ViewerLocation): number {
  const earthRadiusMiles = 3958.7613;
  const deltaLatitude = toRadians(b.latitude - a.latitude);
  const deltaLongitude = toRadians(b.longitude - a.longitude);
  const startLatitude = toRadians(a.latitude);
  const endLatitude = toRadians(b.latitude);
  const haversine = Math.sin(deltaLatitude / 2) ** 2
    + Math.cos(startLatitude) * Math.cos(endLatitude) * Math.sin(deltaLongitude / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(haversine));
}

export function distanceLineForItem(item: LiveFeedItem, viewerLocation?: ViewerLocation | null): string {
  if (!viewerLocation || !hasCoordinates(item)) return 'Distance available after location sharing';
  const miles = milesBetween(viewerLocation, { latitude: item.latitude, longitude: item.longitude });
  return `${miles < 0.05 ? '<0.1' : miles.toFixed(1)} mi away`;
}

export function itemDistanceMiles(item: LiveFeedItem, viewerLocation?: ViewerLocation | null): number | null {
  if (!viewerLocation || !hasCoordinates(item)) return null;
  return milesBetween(viewerLocation, { latitude: item.latitude, longitude: item.longitude });
}

function marketDateFromValue(value: string, timeZone = DEFAULT_MARKET_TIME_ZONE): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(parsed);
}

export function currentMarketDate(timeZone = DEFAULT_MARKET_TIME_ZONE): string {
  return marketDateFromValue(new Date().toISOString(), timeZone) || new Date().toISOString().slice(0, 10);
}

function itemMarketDate(item: LiveFeedItem, timeZone = DEFAULT_MARKET_TIME_ZONE): string | null {
  if (item.startsAt) return marketDateFromValue(item.startsAt, timeZone);
  if (item.date && /^\d{4}-\d{2}-\d{2}$/.test(item.date)) return item.date;
  if (item.date) return marketDateFromValue(item.date, timeZone);
  return null;
}

function isEveningTimeLabel(value?: string): boolean {
  if (!value) return false;
  const match = value.match(/(?:^|\D)(\d{1,2})(?::\d{2})?\s*(am|pm)\b/i);
  if (!match) return false;
  const hour = Number(match[1]);
  const period = match[2].toLowerCase();
  if (period === 'pm') return hour === 12 || hour >= 5;
  return false;
}

function isWeekend(item: LiveFeedItem, timeZone = DEFAULT_MARKET_TIME_ZONE): boolean {
  const date = itemMarketDate(item, timeZone);
  if (!date) return false;
  const day = new Date(`${date}T00:00:00Z`).getUTCDay();
  return day === 0 || day === 5 || day === 6;
}

export function eventMatchesMoment(item: LiveFeedItem, activeMoment: string, options?: Partial<MomentOptions>): boolean {
  if (activeMoment === 'All') return true;
  const timeZone = options?.timeZone || DEFAULT_MARKET_TIME_ZONE;
  if (activeMoment === 'Deals') {
    return /deal|happy hour|special|market|shopping|free/i.test(`${item.category || ''} ${item.title} ${item.summary || ''} ${item.price || ''}`);
  }
  if (activeMoment === 'Weekend') return isWeekend(item, timeZone);
  if (activeMoment === 'Tonight') {
    const marketDate = options?.marketDate || currentMarketDate(timeZone);
    return itemMarketDate(item, timeZone) === marketDate && isEveningTimeLabel(item.time);
  }
  return true;
}

export function visibleDiscoveryItems(items: LiveFeedItem[], options: DiscoveryFilterOptions = {}): LiveFeedItem[] {
  if (!options.viewerLocation || !options.radiusMiles) return [...items];
  return items.filter((item) => {
    const miles = itemDistanceMiles(item, options.viewerLocation || null);
    return miles === null || miles <= Number(options.radiusMiles);
  });
}

export function closestHighlight(items: LiveFeedItem[], viewerLocation?: ViewerLocation | null): LiveFeedItem | null {
  if (!viewerLocation) return null;
  const closest = items
    .map((item) => ({ item, miles: itemDistanceMiles(item, viewerLocation) }))
    .filter((entry): entry is { item: LiveFeedItem; miles: number } => entry.miles !== null)
    .sort((a, b) => a.miles - b.miles || a.item.title.localeCompare(b.item.title))[0];
  return closest ? closest.item : null;
}

export function mapPinStyleForItem(item: LiveFeedItem, visibleItems: LiveFeedItem[]): { left: string; top: string } | null {
  if (!hasCoordinates(item)) return null;
  const coordinateItems = visibleItems.filter(hasCoordinates);
  if (!coordinateItems.length) return null;
  const latitudes = coordinateItems.map((entry) => entry.latitude);
  const longitudes = coordinateItems.map((entry) => entry.longitude);
  const minLatitude = Math.min(...latitudes);
  const maxLatitude = Math.max(...latitudes);
  const minLongitude = Math.min(...longitudes);
  const maxLongitude = Math.max(...longitudes);
  const latitudeSpan = maxLatitude - minLatitude || 0.01;
  const longitudeSpan = maxLongitude - minLongitude || 0.01;
  const left = 10 + ((item.longitude - minLongitude) / longitudeSpan) * 80;
  const top = 10 + ((maxLatitude - item.latitude) / latitudeSpan) * 80;
  return {
    left: `${Math.max(5, Math.min(95, left)).toFixed(1)}%`,
    top: `${Math.max(5, Math.min(95, top)).toFixed(1)}%`,
  };
}

export function discoverySectionLabels(options: SectionLabelOptions): { featured: string; popular: string; popularCountLabel: string } {
  return {
    featured: options.hasCuration ? 'Featured This Week' : 'Upcoming Events',
    popular: options.hasPopularityScores ? 'Popular Near You' : 'More Local Events',
    popularCountLabel: options.hasPopularityScores ? 'ranked picks' : 'events shown',
  };
}

function actionUrl(item: LiveFeedItem): string | undefined {
  return item.ticketUrl || item.ticket_url || item.event_url || item.venueUrl || item.website;
}

function isPlaceholderDomain(value?: string): boolean {
  if (!value) return false;
  try {
    return PLACEHOLDER_DOMAINS.has(new URL(value).hostname.replace(/^www\./, '').toLowerCase());
  } catch {
    return false;
  }
}

export function feedQualityGate(items: LiveFeedItem[], options: { marketDate: string } = { marketDate: currentMarketDate() }): FeedQualityReport {
  const ids = new Set<string>();
  let duplicateIds = 0;
  for (const item of items) {
    if (ids.has(item.id)) duplicateIds += 1;
    ids.add(item.id);
  }
  const metrics = {
    inventorySize: items.length,
    categoryDiversity: new Set(items.map((item) => item.category).filter(Boolean)).size,
    cityDiversity: new Set(items.map((item) => item.city).filter(Boolean)).size,
    mediaCoverage: items.length ? items.filter((item) => Boolean(item.image_url)).length / items.length : 0,
    placeholderDomainActions: items.filter((item) => isPlaceholderDomain(actionUrl(item))).length,
    duplicateIds,
    upcomingEvents: items.filter((item) => (itemMarketDate(item) || '') >= options.marketDate).length,
    expiredEvents: items.filter((item) => Boolean(itemMarketDate(item)) && (itemMarketDate(item) || '') < options.marketDate).length,
  };
  const issues: string[] = [];
  if (metrics.inventorySize < LAUNCH_MINIMUM_INVENTORY) issues.push('inventory_size_below_launch_threshold');
  if (metrics.categoryDiversity < LAUNCH_MINIMUM_CATEGORIES) issues.push('category_diversity_below_launch_threshold');
  if (metrics.cityDiversity < LAUNCH_MINIMUM_CITIES) issues.push('city_diversity_below_launch_threshold');
  if (metrics.mediaCoverage < LAUNCH_MINIMUM_MEDIA_COVERAGE) issues.push('media_coverage_below_launch_threshold');
  if (metrics.placeholderDomainActions > 0) issues.push('placeholder_domain_actions_present');
  if (metrics.duplicateIds > 0) issues.push('duplicate_ids_present');
  if (metrics.expiredEvents > 0) issues.push('expired_events_present');
  return { ready: issues.length === 0, metrics, issues };
}
