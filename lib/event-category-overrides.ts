import {
  eventCategoryFallbackImage,
  eventCategoryVisualKey,
  isEventCategory,
  normalizeEventCategory,
  type EventCategory,
} from './event-taxonomy.ts';
import type { LiveFeedItem } from './live-feed.ts';

export type EventCategoryOverride = {
  category: EventCategory;
  sourceCategory: string;
  eventTitle: string;
  reviewedAt: string;
};

export type EventCategoryOverrideMap = Record<string, EventCategoryOverride>;

// Explicitly reviewed seed records. These exact ID + title pairs correct known source taxonomy
// without inferring categories from event text at runtime or mutating the upstream records.
export const REVIEWED_EVENT_CATEGORY_OVERRIDES: EventCategoryOverrideMap = {
  '80196afa-107d-480e-9fe5-5974148bec3e': {
    category: 'Arts & Culture', sourceCategory: 'Community', eventTitle: 'Art Walk Evening', reviewedAt: '2026-07-19T00:00:00.000Z',
  },
  '99c70088-cb21-435b-be1d-511a0cb6c59d': {
    category: 'Food & Drink', sourceCategory: 'Community', eventTitle: 'Bourbon & BBQ Night', reviewedAt: '2026-07-19T00:00:00.000Z',
  },
  '39af9831-aa52-4fed-a615-cd821582f1c9': {
    category: 'City & Civic', sourceCategory: 'Community', eventTitle: 'Holiday Parade Planning', reviewedAt: '2026-07-19T00:00:00.000Z',
  },
  'b3a2aba7-cb62-4610-a973-e1bdf2952957': {
    category: 'Family', sourceCategory: 'Community', eventTitle: 'Library Story Hour', reviewedAt: '2026-07-19T00:00:00.000Z',
  },
  '6c88a197-141e-46a0-9aa8-5f1bfbd1d34b': {
    category: 'Sports', sourceCategory: 'Community', eventTitle: 'Pickleball Round Robin', reviewedAt: '2026-07-19T00:00:00.000Z',
  },
  '228ca849-9c87-4863-8976-727966a589bb': {
    category: 'Festivals', sourceCategory: 'Community', eventTitle: 'Fireworks Watch Party', reviewedAt: '2026-07-19T00:00:00.000Z',
  },
};

function cleanText(value: unknown, maxLength: number): string {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : '';
}

export function normalizeEventCategoryOverrides(value: unknown): EventCategoryOverrideMap {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const normalized: EventCategoryOverrideMap = {};
  for (const [rawId, rawOverride] of Object.entries(value)) {
    const id = cleanText(rawId, 160);
    if (!id || !rawOverride || typeof rawOverride !== 'object' || Array.isArray(rawOverride)) continue;
    const candidate = rawOverride as Partial<EventCategoryOverride>;
    const category = normalizeEventCategory({ category: cleanText(candidate.category, 80) });
    const sourceCategory = cleanText(candidate.sourceCategory, 80);
    const eventTitle = cleanText(candidate.eventTitle, 240);
    const reviewedAt = cleanText(candidate.reviewedAt, 80);
    if (!isEventCategory(category) || category === 'Local' || !sourceCategory || !eventTitle || !reviewedAt) continue;
    normalized[id] = { category, sourceCategory, eventTitle, reviewedAt };
  }
  return normalized;
}

export function applyEventCategoryOverrides(
  items: LiveFeedItem[],
  overrides: EventCategoryOverrideMap,
): LiveFeedItem[] {
  return items.map((item) => {
    const override = overrides[item.id];
    if (!override || override.eventTitle !== item.title) return item;
    const stableKey = [item.id, item.title, item.date].filter(Boolean).join('|');
    return {
      ...item,
      sourceCategory: item.sourceCategory || item.category || override.sourceCategory || 'Local',
      category: override.category,
      categoryOverrideApplied: true,
      visualKey: eventCategoryVisualKey(override.category),
      fallbackImageUrl: eventCategoryFallbackImage(override.category, stableKey),
    };
  });
}
