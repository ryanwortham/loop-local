import type { EventIntentAction, EventIntentSummary, EventLifecycleAction, EventLifecycleRecord, EventLifecycleState, EventReporterType } from './event-engagement.ts';

function config() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('event engagement storage is unavailable');
  return { url, key };
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

async function postRpc<T>(name: string, body: Record<string, unknown>, fetchImpl: typeof fetch = fetch): Promise<T> {
  const { url, key } = config();
  const response = await fetchImpl(`${url}/rest/v1/rpc/${name}`, { method: 'POST', cache: 'no-store', headers: headers(key), body: JSON.stringify(body) });
  if (!response.ok) throw new Error(`${name} failed (${response.status})`);
  return response.json() as Promise<T>;
}

export async function recordEventIntent(eventKey: string, action: EventIntentAction, fetchImpl: typeof fetch = fetch): Promise<void> {
  const { url, key } = config();
  const response = await fetchImpl(`${url}/rest/v1/event_intent_signals`, {
    method: 'POST', cache: 'no-store', headers: { ...headers(key), Prefer: 'return=minimal' },
    body: JSON.stringify({ event_key: eventKey, action }),
  });
  if (!response.ok) throw new Error(`event intent write failed (${response.status})`);
}

export async function readEventIntentSummary(fetchImpl: typeof fetch = fetch): Promise<EventIntentSummary[]> {
  const rows = await postRpc<Array<{ event_key: string; calendar_adds: number; shares: number; copy_links: number; latest_at: string }>>('read_event_intent_summary', {}, fetchImpl);
  return rows.map((row) => ({ eventKey: row.event_key, calendarAdds: Number(row.calendar_adds), shares: Number(row.shares), copyLinks: Number(row.copy_links), latestAt: row.latest_at }));
}

export async function recordLifecycleAction(input: { eventKey: string; eventTitle: string; action: EventLifecycleAction; reporterType: EventReporterType; note?: string }, fetchImpl: typeof fetch = fetch): Promise<void> {
  const { url, key } = config();
  const response = await fetchImpl(`${url}/rest/v1/event_lifecycle_records`, {
    method: 'POST', cache: 'no-store', headers: { ...headers(key), Prefer: 'return=minimal' },
    body: JSON.stringify({ event_key: input.eventKey, event_title: input.eventTitle, action: input.action, reporter_type: input.reporterType, note: input.note || '' }),
  });
  if (!response.ok) throw new Error(`event lifecycle write failed (${response.status})`);
}

export async function readLifecycleQueue(fetchImpl: typeof fetch = fetch): Promise<EventLifecycleRecord[]> {
  const rows = await postRpc<Array<{ id: string; event_key: string; event_title: string; action: EventLifecycleAction; reporter_type: EventReporterType; note: string; created_at: string }>>('read_event_lifecycle_queue', {}, fetchImpl);
  return rows.map((row) => ({ id: row.id, eventKey: row.event_key, eventTitle: row.event_title, action: row.action, reporterType: row.reporter_type, note: row.note, createdAt: row.created_at }));
}

export async function readLifecycleStates(fetchImpl: typeof fetch = fetch): Promise<EventLifecycleState[]> {
  const rows = await postRpc<Array<{ event_key: string; action: EventLifecycleAction; last_verified_at: string }>>('read_event_lifecycle_states', {}, fetchImpl);
  return rows.map((row) => ({ eventKey: row.event_key, action: row.action, lastVerifiedAt: row.last_verified_at }));
}
