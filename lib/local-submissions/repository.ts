// local-submissions-repository-boundary-pass: all local submission persistence flows through this boundary.

export type RepositoryStoreShape = {
  version: 1;
  pendingSubmissions: unknown[];
  publishedLocalEvents: unknown[];
  eventCategoryOverrides?: Record<string, unknown>;
  operatorAuditLog?: unknown[];
  statusCapabilities?: Record<string, string>;
};

export type RepositoryMutation<T> = {
  store: RepositoryStoreShape;
  result: T;
};

export interface LocalSubmissionsRepository {
  read(): Promise<RepositoryStoreShape>;
  write(store: RepositoryStoreShape): Promise<RepositoryStoreShape>;
  mutate<T>(mutation: (store: RepositoryStoreShape) => RepositoryMutation<T> | Promise<RepositoryMutation<T>>): Promise<T>;
  authorizeStatusCapability(submissionId: string, token: string): Promise<boolean>;
}

export type LocalSubmissionsAdapter = 'file' | 'supabase';
type AdapterEnv = Record<string, string | undefined>;

export function resolveLocalSubmissionsAdapter(env: AdapterEnv = process.env): LocalSubmissionsAdapter {
  const configuredValue = env.LOCAL_SUBMISSIONS_ADAPTER?.trim().toLowerCase();
  const legacyValue = env.LOOP_LOCAL_SUBMISSIONS_ADAPTER?.trim().toLowerCase();
  if (configuredValue && legacyValue && configuredValue !== legacyValue) {
    throw new Error('conflicting local submissions adapter configuration');
  }
  const configured = configuredValue || legacyValue || 'file';
  if (configured === 'file' || configured === 'supabase') return configured;
  throw new Error('LOCAL_SUBMISSIONS_ADAPTER must be file or supabase');
}

let repositoryPromise: Promise<LocalSubmissionsRepository> | null = null;
let repositoryAdapter: LocalSubmissionsAdapter | null = null;

export async function getLocalSubmissionsRepository(): Promise<LocalSubmissionsRepository> {
  const adapter = resolveLocalSubmissionsAdapter();
  if (!repositoryPromise || repositoryAdapter !== adapter) {
    repositoryAdapter = adapter;
    repositoryPromise = adapter === 'file'
      ? import('./file-repository').then(({ FileLocalSubmissionsRepository }) => new FileLocalSubmissionsRepository())
      : import('./supabase-repository').then(({ SupabaseLocalSubmissionsRepository }) => new SupabaseLocalSubmissionsRepository());
  }
  return repositoryPromise;
}

export function resetLocalSubmissionsRepositoryForTests() {
  repositoryPromise = null;
  repositoryAdapter = null;
}
