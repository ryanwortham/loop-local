// local-submissions-repository-boundary-pass: all local submission persistence flows through this boundary.

export type RepositoryStoreShape = {
  version: 1;
  pendingSubmissions: unknown[];
  publishedLocalEvents: unknown[];
  eventCategoryOverrides?: Record<string, unknown>;
};

export interface LocalSubmissionsRepository {
  read(): Promise<unknown>;
  write(store: RepositoryStoreShape): Promise<unknown>;
}

let repositoryPromise: Promise<LocalSubmissionsRepository> | null = null;

export async function getLocalSubmissionsRepository(): Promise<LocalSubmissionsRepository> {
  // getLocalSubmissionsRepository keeps the domain store free of filesystem details before Supabase migration.
  if (!repositoryPromise) {
    repositoryPromise = import('./file-repository').then(({ FileLocalSubmissionsRepository }) => new FileLocalSubmissionsRepository());
  }
  return repositoryPromise;
}
