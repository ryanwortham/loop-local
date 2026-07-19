export const EVENT_CATEGORIES = [
  'Food & Drink',
  'Live Music',
  'Arts & Culture',
  'Family',
  'School Activities',
  'Sports',
  'Community',
  'Festivals',
  'Fundraisers',
  'Shopping',
  'Nightlife',
  'Jobs',
  'City & Civic',
  'Deals',
  'Happy Hour',
  'Local',
] as const;

export type EventCategory = (typeof EVENT_CATEGORIES)[number];
export const SUBMISSION_EVENT_CATEGORIES = EVENT_CATEGORIES.filter((category) => category !== 'Local');

export type EventCategoryInput = {
  category?: string;
  type?: string;
  title?: string;
  summary?: string;
  business?: string;
  location?: string;
};

const canonicalByKey = new Map(EVENT_CATEGORIES.map((category) => [category.toLowerCase(), category] as const));
const categoryAliases = new Map<string, EventCategory>([
  ['kids', 'Family'],
  ['children', 'Family'],
  ['school', 'School Activities'],
  ['music', 'Live Music'],
  ['concert', 'Live Music'],
  ['art', 'Arts & Culture'],
  ['arts', 'Arts & Culture'],
  ['culture', 'Arts & Culture'],
  ['fundraiser', 'Fundraisers'],
  ['charity', 'Fundraisers'],
  ['market', 'Shopping'],
  ['city notices', 'City & Civic'],
  ['civic', 'City & Civic'],
  ['community announcement', 'Community'],
]);

export function isEventCategory(value: string): value is EventCategory {
  return canonicalByKey.has(value.trim().toLowerCase());
}

function canonicalCategory(value?: string): string {
  const raw = (value || '').replace(/\s+/g, ' ').trim();
  if (!raw) return '';
  const key = raw.toLowerCase();
  return categoryAliases.get(key) || canonicalByKey.get(key) || raw;
}

export function normalizeEventCategory(input: EventCategoryInput): string {
  return canonicalCategory(input.category || input.type) || 'Local';
}

export type EventVisualKey = 'food-drink' | 'live-music' | 'arts-culture' | 'family' | 'sports' | 'market' | 'community' | 'local';

export function eventCategoryVisualKey(category?: string): EventVisualKey {
  const normalized = canonicalCategory(category);
  if (normalized === 'Food & Drink' || normalized === 'Happy Hour') return 'food-drink';
  if (normalized === 'Live Music' || normalized === 'Nightlife') return 'live-music';
  if (normalized === 'Arts & Culture' || normalized === 'Festivals') return 'arts-culture';
  if (normalized === 'Family' || normalized === 'School Activities') return 'family';
  if (normalized === 'Sports') return 'sports';
  if (normalized === 'Shopping' || normalized === 'Deals') return 'market';
  if (normalized === 'Community' || normalized === 'Fundraisers' || normalized === 'City & Civic' || normalized === 'Jobs') return 'community';
  return 'local';
}

const genericVisualVariants = ['community', 'community-calendar', 'community-map', 'community-neighborhood'] as const;

function stableVariantIndex(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % genericVisualVariants.length;
}

export function eventCategoryFallbackImage(category?: string, stableKey?: string): string {
  const visualKey = eventCategoryVisualKey(category);
  if ((visualKey === 'community' || visualKey === 'local') && stableKey) {
    return `/event-art/${genericVisualVariants[stableVariantIndex(stableKey)]}.svg`;
  }
  return `/event-art/${visualKey}.svg`;
}
