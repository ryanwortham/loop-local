import type { DemandSignalInput, DemandSummary, StoredDemandSignal } from './unmet-demand.ts';

type DemandSummaryRow = {
  category: string;
  area: string;
  date_window: StoredDemandSignal['dateWindow'];
  request_count: number;
  empty_count: number;
  average_result_count: number;
  latest_at: string;
};

function demandSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('unmet-demand storage is unavailable');
  return { url, key };
}

function headers(key: string) {
  return { apikey: key, Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' };
}

export async function createDemandSignal(signal: DemandSignalInput, fetchImpl: typeof fetch = fetch): Promise<void> {
  const { url, key } = demandSupabaseConfig();
  const response = await fetchImpl(`${url}/rest/v1/unmet_demand_signals`, {
    method: 'POST',
    cache: 'no-store',
    headers: { ...headers(key), Prefer: 'return=minimal' },
    body: JSON.stringify({
      category: signal.category,
      area: signal.area,
      date_window: signal.dateWindow,
      result_count: signal.resultCount,
      context: signal.context,
    }),
  });
  if (!response.ok) throw new Error(`unmet-demand storage failed (${response.status})`);
}

export async function readDemandSignals(fetchImpl: typeof fetch = fetch): Promise<DemandSummary[]> {
  const { url, key } = demandSupabaseConfig();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const response = await fetchImpl(`${url}/rest/v1/rpc/read_unmet_demand_summary`, {
    method: 'POST',
    cache: 'no-store',
    headers: headers(key),
    body: JSON.stringify({ p_since: since }),
  });
  if (!response.ok) throw new Error(`unmet-demand read failed (${response.status})`);
  const rows = await response.json() as DemandSummaryRow[];
  return rows.map((row) => ({
    category: row.category as DemandSummary['category'],
    area: row.area as DemandSummary['area'],
    dateWindow: row.date_window,
    count: Number(row.request_count),
    emptyCount: Number(row.empty_count),
    averageResultCount: Number(row.average_result_count),
    latestAt: row.latest_at,
  }));
}
