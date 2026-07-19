import { createHash } from 'node:crypto';
import type {
  LocalSubmissionsRepository,
  RepositoryMutation,
  RepositoryStoreShape,
} from './repository';
import {
  SupabaseSubmissionMediaStorage,
  type GovernedMediaKind,
  type StoredMediaReference,
} from './media-storage.ts';

type SupabaseRepositoryEnv = Record<string, string | undefined>;
export type SupabaseRepositoryConfig = { supabaseUrl: string; serviceRoleKey: string };
type SubmissionMediaStorage = Pick<SupabaseSubmissionMediaStorage, 'uploadPending' | 'promotePending' | 'removePending'>
  & Partial<Pick<SupabaseSubmissionMediaStorage, 'uploadPublic' | 'signPending' | 'removePublic'>>;
type SupabaseRepositoryOptions = {
  fetchImpl?: typeof fetch;
  maxMutationAttempts?: number;
  mediaStorage?: SubmissionMediaStorage;
};
type UnknownRecord = Record<string, unknown>;
type RepositorySnapshot = { revision: number; store: RepositoryStoreShape };
type ReplaceResult = { applied: boolean; revision: number };
type PreparedMediaMutation = {
  store: RepositoryStoreShape;
  removedPendingMedia: StoredMediaReference[];
  removedPublicMediaUrls: string[];
};

function asRecord(value: unknown): UnknownRecord | undefined {
  return value && typeof value === 'object' ? value as UnknownRecord : undefined;
}

function asPendingMedia(value: unknown): StoredMediaReference | undefined {
  const record = asRecord(value);
  if (!record || record.bucket !== 'submission-media' || typeof record.objectPath !== 'string'
    || typeof record.mimeType !== 'string' || typeof record.byteSize !== 'number'
    || typeof record.sha256 !== 'string' || (record.kind !== 'logo' && record.kind !== 'eventImage')) return undefined;
  return record as StoredMediaReference;
}

function submissionMedia(record: UnknownRecord): StoredMediaReference[] {
  return [asPendingMedia(record.eventImageMedia), asPendingMedia(record.logoMedia)]
    .filter((item): item is StoredMediaReference => Boolean(item));
}

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
  private readonly mediaStorage: SubmissionMediaStorage;

  constructor(config = resolveSupabaseRepositoryConfig(), options: SupabaseRepositoryOptions = {}) {
    this.config = config;
    this.fetchImpl = options.fetchImpl || fetch;
    this.maxMutationAttempts = Math.max(1, options.maxMutationAttempts || 8);
    this.mediaStorage = options.mediaStorage || new SupabaseSubmissionMediaStorage(config, { fetchImpl: this.fetchImpl });
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

  private async prepareMediaMutation(
    previousStore: RepositoryStoreShape,
    nextStore: RepositoryStoreShape,
  ): Promise<PreparedMediaMutation> {
    const pendingSubmissions: UnknownRecord[] = [];
    for (const value of nextStore.pendingSubmissions) {
      const submission = asRecord(value);
      if (!submission) throw new Error('pending submission must be an object');
      const prepared = { ...submission };
      delete prepared.logoMediaUrl;
      delete prepared.eventImageMediaUrl;
      const mediaFields: Array<{ dataField: string; referenceField: string; kind: GovernedMediaKind }> = [
        { dataField: 'logoDataUrl', referenceField: 'logoMedia', kind: 'logo' },
        { dataField: 'eventImageDataUrl', referenceField: 'eventImageMedia', kind: 'eventImage' },
      ];
      for (const field of mediaFields) {
        if (typeof prepared[field.dataField] !== 'string') continue;
        if (typeof prepared.id !== 'string') throw new Error('pending media requires a canonical submission id');
        prepared[field.referenceField] = await this.mediaStorage.uploadPending(
          prepared.id,
          field.kind,
          prepared[field.dataField] as string,
        );
        delete prepared[field.dataField];
      }
      pendingSubmissions.push(prepared);
    }

    const previousPending = new Map<string, UnknownRecord>();
    for (const value of previousStore.pendingSubmissions) {
      const submission = asRecord(value);
      if (submission && typeof submission.id === 'string') previousPending.set(submission.id, submission);
    }
    const previousPublishedIds = new Set(previousStore.publishedLocalEvents
      .map(asRecord)
      .map((item) => item?.id)
      .filter((id): id is string => typeof id === 'string'));
    const publishedLocalEvents: unknown[] = [];
    for (const value of nextStore.publishedLocalEvents) {
      const event = asRecord(value);
      if (!event || typeof event.id !== 'string' || previousPublishedIds.has(event.id)) {
        publishedLocalEvents.push(value);
        continue;
      }
      const importedDataUrl = typeof event.image_url === 'string' && event.image_url.startsWith('data:image/')
        ? event.image_url
        : undefined;
      if (importedDataUrl) {
        if (!this.mediaStorage.uploadPublic) throw new Error('published embedded media import is not configured');
        const imported = await this.mediaStorage.uploadPublic(event.id, 'eventImage', importedDataUrl);
        publishedLocalEvents.push({
          ...event,
          image_url: imported.publicUrl,
        });
        continue;
      }
      const submissionId = event.id.startsWith('local-approved-') ? event.id.slice('local-approved-'.length) : '';
      const submission = previousPending.get(submissionId);
      const media = submission ? submissionMedia(submission)[0] : undefined;
      if (!media) {
        publishedLocalEvents.push(event);
        continue;
      }
      const promoted = await this.mediaStorage.promotePending(media, event.id);
      publishedLocalEvents.push({
        ...event,
        image_url: promoted.publicUrl,
        imageState: 'photo',
        visualKey: 'local-submission-media',
      });
    }

    const nextPendingIds = new Set(pendingSubmissions
      .map((item) => item.id)
      .filter((id): id is string => typeof id === 'string'));
    const removedPendingMedia = [...previousPending.entries()]
      .filter(([id]) => !nextPendingIds.has(id))
      .flatMap(([, submission]) => submissionMedia(submission));
    const nextPublishedIds = new Set(publishedLocalEvents
      .map(asRecord)
      .map((item) => item?.id)
      .filter((id): id is string => typeof id === 'string'));
    const removedPublicMediaUrls = previousStore.publishedLocalEvents
      .map(asRecord)
      .filter((item) => item && typeof item.id === 'string' && !nextPublishedIds.has(item.id))
      .map((item) => item?.image_url)
      .filter((url): url is string => typeof url === 'string' && url.includes('/storage/v1/object/public/event-media/'));
    return {
      store: { ...nextStore, pendingSubmissions, publishedLocalEvents },
      removedPendingMedia,
      removedPublicMediaUrls,
    };
  }

  private async hydratePendingMedia(store: RepositoryStoreShape): Promise<RepositoryStoreShape> {
    if (!this.mediaStorage.signPending) return store;
    const pendingSubmissions: unknown[] = [];
    for (const value of store.pendingSubmissions) {
      const submission = asRecord(value);
      if (!submission) {
        pendingSubmissions.push(value);
        continue;
      }
      const hydrated = { ...submission };
      const eventImage = asPendingMedia(submission.eventImageMedia);
      const logo = asPendingMedia(submission.logoMedia);
      if (eventImage) hydrated.eventImageMediaUrl = await this.mediaStorage.signPending(eventImage);
      if (logo) hydrated.logoMediaUrl = await this.mediaStorage.signPending(logo);
      pendingSubmissions.push(hydrated);
    }
    return { ...store, pendingSubmissions };
  }

  async read(): Promise<RepositoryStoreShape> {
    return this.hydratePendingMedia((await this.readSnapshot()).store);
  }

  async write(store: RepositoryStoreShape): Promise<RepositoryStoreShape> {
    return this.mutate(() => ({ store, result: store }));
  }

  async mutate<T>(mutation: (store: RepositoryStoreShape) => RepositoryMutation<T> | Promise<RepositoryMutation<T>>): Promise<T> {
    for (let attempt = 1; attempt <= this.maxMutationAttempts; attempt += 1) {
      const snapshot = await this.readSnapshot();
      const next = await mutation(snapshot.store);
      if (!isStore(next.store)) throw new Error('Repository mutation returned an invalid store');
      const prepared = await this.prepareMediaMutation(snapshot.store, next.store);
      const written = await this.compareAndSwap(snapshot.revision, prepared.store);
      if (written.applied) {
        if (prepared.removedPendingMedia.length) {
          try {
            await this.mediaStorage.removePending(prepared.removedPendingMedia);
          } catch (error) {
            console.error('Committed repository mutation left pending media for reconciliation', error);
          }
        }
        if (prepared.removedPublicMediaUrls.length && this.mediaStorage.removePublic) {
          try {
            await this.mediaStorage.removePublic(prepared.removedPublicMediaUrls);
          } catch (error) {
            console.error('Committed repository mutation left public media for reconciliation', error);
          }
        }
        return next.result;
      }
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
