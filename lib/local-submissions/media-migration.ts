import type { RepositoryStoreShape } from './repository';
import {
  governedPendingObjectPath,
  governedPublicObjectPath,
  parseGovernedDataImage,
  type GovernedMediaBucket,
  type GovernedMediaKind,
} from './media-storage.ts';

export type MediaMigrationItem = {
  sourceRecordId: string;
  sourceField: 'logoDataUrl' | 'eventImageDataUrl' | 'image_url';
  bucket: GovernedMediaBucket;
  objectPath: string;
  mimeType: string;
  byteSize: number;
  sha256: string;
  kind: GovernedMediaKind;
};

export type MediaMigrationManifest = {
  version: 1;
  generatedAt: string;
  sourcePath: string;
  sourceFileSha256: string;
  items: MediaMigrationItem[];
};

export type MediaMigrationReconciliation = {
  matches: boolean;
  expectedObjects: number;
  missingReferences: string[];
  checksumMismatches: string[];
  embeddedMediaRemaining: string[];
};

type UnknownRecord = Record<string, unknown>;

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

export function buildMediaMigrationManifest(
  store: RepositoryStoreShape,
  metadata: { generatedAt: string; sourcePath: string; sourceFileSha256: string },
): MediaMigrationManifest {
  const items: MediaMigrationItem[] = [];
  for (const value of store.pendingSubmissions) {
    const submission = asRecord(value);
    const submissionId = submission?.id;
    if (!submission || typeof submissionId !== 'string') continue;
    for (const field of [
      { sourceField: 'logoDataUrl' as const, kind: 'logo' as const },
      { sourceField: 'eventImageDataUrl' as const, kind: 'eventImage' as const },
    ]) {
      const dataUrl = submission[field.sourceField];
      if (typeof dataUrl !== 'string') continue;
      const parsed = parseGovernedDataImage(dataUrl);
      items.push({
        sourceRecordId: submissionId,
        sourceField: field.sourceField,
        bucket: 'submission-media',
        objectPath: governedPendingObjectPath(submissionId, field.kind, parsed.mimeType),
        mimeType: parsed.mimeType,
        byteSize: parsed.byteSize,
        sha256: parsed.sha256,
        kind: field.kind,
      });
    }
  }
  for (const value of store.publishedLocalEvents) {
    const event = asRecord(value);
    if (!event || typeof event.id !== 'string' || typeof event.image_url !== 'string' || !event.image_url.startsWith('data:image/')) continue;
    const parsed = parseGovernedDataImage(event.image_url);
    items.push({
      sourceRecordId: event.id,
      sourceField: 'image_url',
      bucket: 'event-media',
      objectPath: governedPublicObjectPath(event.id, 'eventImage', parsed.mimeType),
      mimeType: parsed.mimeType,
      byteSize: parsed.byteSize,
      sha256: parsed.sha256,
      kind: 'eventImage',
    });
  }
  items.sort((left, right) => `${left.bucket}/${left.objectPath}`.localeCompare(`${right.bucket}/${right.objectPath}`));
  return { version: 1, ...metadata, items };
}

export function reconcileMediaMigration(
  manifest: MediaMigrationManifest,
  destination: RepositoryStoreShape,
  objectChecksums: Record<string, string>,
): MediaMigrationReconciliation {
  const pending = new Map(destination.pendingSubmissions
    .map(asRecord)
    .filter((value): value is UnknownRecord => Boolean(value && typeof value.id === 'string'))
    .map((value) => [value.id as string, value]));
  const published = new Map(destination.publishedLocalEvents
    .map(asRecord)
    .filter((value): value is UnknownRecord => Boolean(value && typeof value.id === 'string'))
    .map((value) => [value.id as string, value]));
  const missingReferences: string[] = [];
  const checksumMismatches: string[] = [];
  for (const item of manifest.items) {
    const key = `${item.bucket}/${item.objectPath}`;
    if (objectChecksums[key] !== item.sha256) checksumMismatches.push(key);
    if (item.bucket === 'submission-media') {
      const record = pending.get(item.sourceRecordId);
      const reference = asRecord(record?.[item.kind === 'logo' ? 'logoMedia' : 'eventImageMedia']);
      if (reference?.objectPath !== item.objectPath || reference?.sha256 !== item.sha256) missingReferences.push(key);
    } else {
      const event = published.get(item.sourceRecordId);
      if (typeof event?.image_url !== 'string' || !event.image_url.includes(`/event-media/${item.objectPath}`)) missingReferences.push(key);
    }
  }
  const embeddedMediaRemaining: string[] = [];
  for (const value of destination.pendingSubmissions) {
    const item = asRecord(value);
    if (typeof item?.logoDataUrl === 'string') embeddedMediaRemaining.push(`${item.id}:logoDataUrl`);
    if (typeof item?.eventImageDataUrl === 'string') embeddedMediaRemaining.push(`${item.id}:eventImageDataUrl`);
  }
  for (const value of destination.publishedLocalEvents) {
    const item = asRecord(value);
    if (typeof item?.image_url === 'string' && item.image_url.startsWith('data:image/')) embeddedMediaRemaining.push(`${item.id}:image_url`);
  }
  missingReferences.sort(); checksumMismatches.sort(); embeddedMediaRemaining.sort();
  return {
    matches: missingReferences.length === 0 && checksumMismatches.length === 0 && embeddedMediaRemaining.length === 0,
    expectedObjects: manifest.items.length,
    missingReferences,
    checksumMismatches,
    embeddedMediaRemaining,
  };
}
