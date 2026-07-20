import { createHash, randomUUID, timingSafeEqual } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type {
  LocalSubmissionsRepository,
  RepositoryMutation,
  RepositoryStoreShape,
} from './repository';

type FileRepositoryOptions = { runtimePath?: string };
type UnknownRecord = Record<string, unknown>;

const mutationQueues = new Map<string, Promise<void>>();

const EMPTY_STORE: RepositoryStoreShape = {
  version: 1,
  pendingSubmissions: [],
  publishedLocalEvents: [],
  eventCategoryOverrides: {},
  operatorAuditLog: [],
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function capabilityHash(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex');
}

function normalizeStore(value: unknown): RepositoryStoreShape {
  const candidate = asRecord(value);
  if (!candidate) return { ...EMPTY_STORE };
  return {
    version: 1,
    pendingSubmissions: Array.isArray(candidate.pendingSubmissions) ? candidate.pendingSubmissions : [],
    publishedLocalEvents: Array.isArray(candidate.publishedLocalEvents) ? candidate.publishedLocalEvents : [],
    ...(Object.prototype.hasOwnProperty.call(candidate, 'eventCategoryOverrides')
      ? { eventCategoryOverrides: asRecord(candidate.eventCategoryOverrides) || {} }
      : {}),
    ...(Object.prototype.hasOwnProperty.call(candidate, 'operatorAuditLog')
      ? { operatorAuditLog: Array.isArray(candidate.operatorAuditLog) ? candidate.operatorAuditLog : [] }
      : {}),
    ...(asRecord(candidate.statusCapabilities) ? { statusCapabilities: candidate.statusCapabilities as Record<string, string> } : {}),
  };
}

function submissionId(value: unknown): string {
  const item = asRecord(value);
  return typeof item?.id === 'string' ? item.id : '';
}

function publishedSubmissionId(value: unknown): string {
  const item = asRecord(value);
  if (typeof item?.localSubmissionId === 'string') return item.localSubmissionId;
  if (typeof item?.id !== 'string') return '';
  return item.id.startsWith('local-approved-') ? item.id.slice('local-approved-'.length) : item.id;
}

function withCapabilityHashes(previous: RepositoryStoreShape, next: RepositoryStoreShape): RepositoryStoreShape {
  const hashes: Record<string, string> = { ...(previous.statusCapabilities || {}), ...(next.statusCapabilities || {}) };
  for (const value of [...previous.pendingSubmissions, ...next.pendingSubmissions]) {
    const item = asRecord(value);
    const id = typeof item?.id === 'string' ? item.id : '';
    const token = typeof item?.statusToken === 'string' ? item.statusToken : '';
    if (id && token) hashes[id] = capabilityHash(token);
  }
  const activeIds = new Set([
    ...next.pendingSubmissions.map(submissionId),
    ...next.publishedLocalEvents.map(publishedSubmissionId),
  ].filter(Boolean));
  for (const id of Object.keys(hashes)) {
    if (!activeIds.has(id)) delete hashes[id];
  }
  return { ...next, ...(Object.keys(hashes).length ? { statusCapabilities: hashes } : { statusCapabilities: undefined }) };
}

export class FileLocalSubmissionsRepository implements LocalSubmissionsRepository {
  // local-submissions-repository-boundary-pass: file adapter is isolated and replaceable by Supabase.
  private readonly runtimePath: string;

  constructor(options: FileRepositoryOptions = {}) {
    this.runtimePath = path.resolve(options.runtimePath
      || process.env.LOCAL_SUBMISSIONS_FILE
      || process.env.LOOP_LOCAL_SUBMISSIONS_STORE_PATH
      || path.join(process.cwd(), 'runtime-data', 'local-submissions.json'));
  }

  private async readUnlocked(): Promise<RepositoryStoreShape> {
    try {
      return normalizeStore(JSON.parse(await readFile(this.runtimePath, 'utf8')));
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        return { ...EMPTY_STORE };
      }
      throw error;
    }
  }

  private async writeUnlocked(store: RepositoryStoreShape): Promise<RepositoryStoreShape> {
    const current = await this.readUnlocked();
    const normalized = withCapabilityHashes(current, normalizeStore(store));
    await mkdir(path.dirname(this.runtimePath), { recursive: true });
    const tempPath = `${this.runtimePath}.${process.pid}.${randomUUID()}.tmp`;
    await writeFile(tempPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
    await rename(tempPath, this.runtimePath);
    return normalized;
  }

  private withLock<T>(operation: () => Promise<T>): Promise<T> {
    const previous = mutationQueues.get(this.runtimePath) || Promise.resolve();
    const running = previous.then(operation, operation);
    const settled = running.then(() => undefined, () => undefined);
    mutationQueues.set(this.runtimePath, settled);
    void settled.then(() => {
      if (mutationQueues.get(this.runtimePath) === settled) {
        mutationQueues.delete(this.runtimePath);
      }
    });
    return running;
  }

  async read(): Promise<RepositoryStoreShape> {
    await mutationQueues.get(this.runtimePath);
    return this.readUnlocked();
  }

  async write(store: RepositoryStoreShape): Promise<RepositoryStoreShape> {
    return this.withLock(() => this.writeUnlocked(store));
  }

  async mutate<T>(mutation: (store: RepositoryStoreShape) => RepositoryMutation<T> | Promise<RepositoryMutation<T>>): Promise<T> {
    return this.withLock(async () => {
      const current = await this.readUnlocked();
      const next = await mutation(current);
      await this.writeUnlocked(next.store);
      return next.result;
    });
  }

  async authorizeStatusCapability(submissionIdValue: string, token: string): Promise<boolean> {
    if (!submissionIdValue || !token) return false;
    const store = await this.read();
    const expected = store.statusCapabilities?.[submissionIdValue]
      || capabilityHash(String(asRecord(store.pendingSubmissions.find((item) => submissionId(item) === submissionIdValue))?.statusToken || ''));
    const actual = capabilityHash(token);
    if (!expected || expected.length !== actual.length) return false;
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  }
}
