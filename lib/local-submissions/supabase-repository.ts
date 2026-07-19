import { createHash } from 'node:crypto';
import type {
  LocalSubmissionsRepository,
  RepositoryMutation,
  RepositoryStoreShape,
} from './repository';

type SupabaseRepositoryEnv = Record<string, string | undefined>;
export type SupabaseRepositoryConfig = { supabaseUrl: string; serviceRoleKey: string };
type SupabaseRepositoryOptions = { fetchImpl?: typeof fetch; maxMutationAttempts?: number };
type UnknownRecord = Record<string, unknown>;
type RepositorySnapshot = { revision: number; store: RepositoryStoreShape };
type ReplaceResult = { applied: boolean; revision: number };

export function resolveSupabaseRepositoryConfig(env: SupabaseRepositoryEnv = process.env): SupabaseRepositoryConfig {
  const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL?.trim() || env.SUPABASE_URL?.trim();
  const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!supabaseUrl) throw new Error('NEXT_PUBLIC_SUPABASE_URL is required for the Supabase submissions adapter');
  if (!serviceRoleKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for the Supabase submissions adapter');
  return { supabaseUrl: supabaseUrl.replace(/\/$/, ''), serviceRoleKey };
}

export function hashStatusCapability(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

export function submissionDataForStorage(value: UnknownRecord): UnknownRecord {
  const safe = { ...value };
  delete safe.statusToken;
  delete safe.statusHistory;
  return safe;
}

function isStore(value: unknown): value is RepositoryStoreShape {
  if (!value || typeof value !== 'object') return false;
  const record = value as UnknownRecord;
  return record.version === 1 && Array.isArray(record.pendingSubmissions) && Array.isArray(record.publishedLocalEvents);
}

export class SupabaseLocalSubmissionsRepository implements LocalSubmissionsRepository {
  readonly config: SupabaseRepositoryConfig;
  private readonly fetchImpl: typeof fetch;
  private readonly maxMutationAttempts: number;

  constructor(config = resolveSupabaseRepositoryConfig(), options: SupabaseRepositoryOptions = {}) {
    this.config = config;
    this.fetchImpl = options.fetchImpl || fetch;
    this.maxMutationAttempts = Math.max(1, options.maxMutationAttempts || 8);
  }

  private async request<T>(pathname: string, init: RequestInit = {}): Promise<T> {
    const response = await this.fetchImpl(`${this.config.supabaseUrl}${pathname}`, {
      ...init,
      cache: 'no-store',
      headers: {
        apikey: this.config.serviceRoleKey,
        Authorization: `Bearer ${this.config.serviceRoleKey}`,
        'Content-Type': 'application/json',
        ...(init.headers || {}),
      },
    });
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      throw new Error(`Supabase submissions repository request failed (${response.status}): ${detail}`);
    }
    return response.json() as Promise<T>;
  }

  private async readSnapshot(): Promise<RepositorySnapshot> {
    const snapshot = await this.request<RepositorySnapshot>('/rest/v1/rpc/read_local_submission_repository_state', {
      method: 'POST',
      body: '{}',
    });
    if (!Number.isSafeInteger(snapshot?.revision) || snapshot.revision < 0 || !isStore(snapshot.store)) {
      throw new Error('Supabase submissions repository returned an invalid snapshot');
    }
    return snapshot;
  }

  private async compareAndSwap(revision: number, store: RepositoryStoreShape): Promise<ReplaceResult> {
    const result = await this.request<ReplaceResult>('/rest/v1/rpc/replace_local_submission_repository_state', {
      method: 'POST',
      body: JSON.stringify({ expected_revision: revision, next_store: store }),
    });
    if (typeof result?.applied !== 'boolean' || !Number.isSafeInteger(result.revision)) {
      throw new Error('Supabase submissions repository returned an invalid mutation result');
    }
    return result;
  }

  async read(): Promise<RepositoryStoreShape> {
    return (await this.readSnapshot()).store;
  }

  async write(store: RepositoryStoreShape): Promise<RepositoryStoreShape> {
    return this.mutate(() => ({ store, result: store }));
  }

  async mutate<T>(mutation: (store: RepositoryStoreShape) => RepositoryMutation<T> | Promise<RepositoryMutation<T>>): Promise<T> {
    for (let attempt = 1; attempt <= this.maxMutationAttempts; attempt += 1) {
      const snapshot = await this.readSnapshot();
      const next = await mutation(snapshot.store);
      if (!isStore(next.store)) throw new Error('Repository mutation returned an invalid store');
      const written = await this.compareAndSwap(snapshot.revision, next.store);
      if (written.applied) return next.result;
    }
    throw new Error(`Supabase submissions repository mutation conflicted ${this.maxMutationAttempts} times`);
  }

  async authorizeStatusCapability(submissionId: string, token: string): Promise<boolean> {
    if (!submissionId || !token) return false;
    const query = new URLSearchParams({
      id: `eq.${submissionId}`,
      status_token_hash: `eq.${hashStatusCapability(token)}`,
      select: 'id',
      limit: '1',
    });
    const rows = await this.request<Array<{ id: string }>>(`/rest/v1/local_submissions?${query.toString()}`, { method: 'GET' });
    return rows.length === 1;
  }
}
