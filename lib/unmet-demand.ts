import { EVENT_CATEGORIES } from './event-taxonomy.ts';

export const DEMAND_CATEGORIES = ['Any category', ...EVENT_CATEGORIES] as const;
export const DEMAND_AREAS = [
  'St. Louis City',
  'North County',
  'South County',
  'West County',
  'Mid County',
  'St. Charles County',
  'Metro East',
  'Nearby Missouri',
  'Nearby Illinois',
] as const;
export const DEMAND_DATE_WINDOWS = ['any_time', 'tonight', 'this_weekend', 'next_7_days', 'later'] as const;
export const DEMAND_CONTEXTS = ['empty', 'weak'] as const;
export const ALLOWED_DEMAND_FIELDS = ['category', 'area', 'dateWindow', 'resultCount', 'context'] as const;

export type DemandDateWindow = typeof DEMAND_DATE_WINDOWS[number];
export type DemandContext = typeof DEMAND_CONTEXTS[number];
export type DemandCategory = typeof DEMAND_CATEGORIES[number];
export type DemandArea = typeof DEMAND_AREAS[number];

export type DemandSignalInput = {
  category: DemandCategory;
  area: DemandArea;
  dateWindow: DemandDateWindow;
  resultCount: number;
  context: DemandContext;
};

export type StoredDemandSignal = DemandSignalInput & { createdAt: string };

export type DemandSummary = {
  category: DemandCategory;
  area: DemandArea;
  dateWindow: DemandDateWindow;
  count: number;
  emptyCount: number;
  averageResultCount: number;
  latestAt: string;
};

type ValidationResult = { ok: true; value: DemandSignalInput } | { ok: false; error: string };

export function validateDemandSignal(input: unknown): ValidationResult {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, error: 'invalid demand signal' };
  const body = input as Record<string, unknown>;
  const unknownFields = Object.keys(body).filter((key) => !(ALLOWED_DEMAND_FIELDS as readonly string[]).includes(key));
  if (unknownFields.length) return { ok: false, error: 'unsupported demand signal fields' };

  const category = body.category;
  const area = body.area;
  const dateWindow = body.dateWindow;
  const context = body.context;
  const resultCount = body.resultCount;
  if (!(DEMAND_CATEGORIES as readonly unknown[]).includes(category)) return { ok: false, error: 'invalid demand category' };
  if (!(DEMAND_AREAS as readonly unknown[]).includes(area)) return { ok: false, error: 'invalid demand area' };
  if (!(DEMAND_DATE_WINDOWS as readonly unknown[]).includes(dateWindow)) return { ok: false, error: 'invalid date window' };
  if (!(DEMAND_CONTEXTS as readonly unknown[]).includes(context)) return { ok: false, error: 'invalid demand context' };
  if (!Number.isInteger(resultCount) || (resultCount as number) < 0 || (resultCount as number) > 2) {
    return { ok: false, error: 'invalid result count' };
  }
  if ((context === 'empty' && resultCount !== 0) || (context === 'weak' && ((resultCount as number) < 1 || (resultCount as number) > 2))) {
    return { ok: false, error: 'demand context does not match result count' };
  }
  return { ok: true, value: { category: category as DemandCategory, area: area as DemandArea, dateWindow: dateWindow as DemandDateWindow, resultCount: resultCount as number, context: context as DemandContext } };
}

export function aggregateDemandSignals(signals: StoredDemandSignal[]): DemandSummary[] {
  const groups = new Map<string, DemandSummary & { totalResults: number }>();
  for (const signal of signals) {
    const key = `${signal.category}\u0000${signal.area}\u0000${signal.dateWindow}`;
    const current = groups.get(key) || {
      category: signal.category,
      area: signal.area,
      dateWindow: signal.dateWindow,
      count: 0,
      emptyCount: 0,
      averageResultCount: 0,
      latestAt: signal.createdAt,
      totalResults: 0,
    };
    current.count += 1;
    current.emptyCount += signal.context === 'empty' ? 1 : 0;
    current.totalResults += signal.resultCount;
    if (signal.createdAt > current.latestAt) current.latestAt = signal.createdAt;
    groups.set(key, current);
  }
  return [...groups.values()]
    .map(({ totalResults, ...group }) => ({ ...group, averageResultCount: Number((totalResults / group.count).toFixed(1)) }))
    .sort((a, b) => b.count - a.count || b.latestAt.localeCompare(a.latestAt));
}
