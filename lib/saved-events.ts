export const SAVED_EVENTS_STORAGE_KEY = 'looplocal:saved-events';
export const SAVED_EVENTS_CHANGED_EVENT = 'looplocal:saved-events-changed';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function persistedEventId(value: string): string | null {
  const candidate = value.startsWith('local-approved-') ? value.slice('local-approved-'.length) : value;
  return UUID_PATTERN.test(candidate) ? candidate.toLowerCase() : null;
}

function normalizeIds(values: unknown[]): string[] {
  const seen = new Set<string>();
  const normalized: string[] = [];
  for (const value of values) {
    if (typeof value !== 'string') continue;
    const id = persistedEventId(value);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    normalized.push(id);
  }
  return normalized;
}

export function parseGuestSavedEventIds(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? normalizeIds(parsed) : [];
  } catch {
    return [];
  }
}

export function savedEventsSyncIsCurrent(expectedUserId: string, currentUserId: string | null): boolean {
  return expectedUserId === currentUserId;
}

export function mergeSavedEventIds(guestIds: string[], accountIds: string[]): string[] {
  return normalizeIds([...accountIds, ...guestIds]);
}
