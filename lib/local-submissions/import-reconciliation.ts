import { createHash } from 'node:crypto';
import type { RepositoryStoreShape } from './repository';
import { governedPendingObjectPath, parseGovernedDataImage } from './media-storage.ts';

type UnknownRecord = Record<string, unknown>;

export type RepositoryReconciliationReport = {
  matches: boolean;
  sourceHash: string;
  destinationHash: string;
  missingPendingIds: string[];
  extraPendingIds: string[];
  missingPublishedIds: string[];
  extraPublishedIds: string[];
  statusMismatches: string[];
  historyMismatches: string[];
  overrideMismatches: string[];
  auditMismatches: string[];
};

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : null;
}

function itemId(value: unknown): string {
  const item = asRecord(value);
  return typeof item?.id === 'string' ? item.id : '';
}

function canonicalValue(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(canonicalValue);
  const record = asRecord(value);
  if (!record) return value;
  return Object.fromEntries(
    Object.keys(record).sort().map((key) => [key, canonicalValue(record[key])]),
  );
}

function canonicalSubmission(value: unknown): UnknownRecord {
  const source = asRecord(value) || {};
  const safe = { ...source };
  delete safe.statusToken;
  delete safe.statusCapabilities;
  delete safe.statusUpdatedAt;
  delete safe.logoMediaUrl;
  delete safe.eventImageMediaUrl;
  const submissionId = safe.id;
  if (typeof submissionId === 'string') {
    for (const field of [
      { data: 'logoDataUrl', reference: 'logoMedia', kind: 'logo' as const },
      { data: 'eventImageDataUrl', reference: 'eventImageMedia', kind: 'eventImage' as const },
    ]) {
      const dataUrl = safe[field.data];
      if (typeof dataUrl !== 'string') continue;
      try {
        const parsed = parseGovernedDataImage(dataUrl);
        safe[field.reference] = {
          bucket: 'submission-media',
          objectPath: governedPendingObjectPath(submissionId, field.kind, parsed.mimeType),
          mimeType: parsed.mimeType,
          byteSize: parsed.byteSize,
          sha256: parsed.sha256,
          kind: field.kind,
        };
        delete safe[field.data];
      } catch {
        // Keep invalid legacy input visible so reconciliation cannot report a false match.
      }
    }
  }
  return canonicalValue(safe) as UnknownRecord;
}

function canonicalPublished(value: unknown): UnknownRecord {
  const safe = { ...(asRecord(value) || {}) };
  if (typeof safe.id !== 'string' || typeof safe.image_url !== 'string') return canonicalValue(safe) as UnknownRecord;
  if (safe.image_url.startsWith('data:image/')) {
    try {
      const parsed = parseGovernedDataImage(safe.image_url);
      safe.image_url = `governed:event-media/${safe.id}/event-image.${parsed.extension}`;
    } catch {
      // Invalid embedded media remains byte-for-byte visible to reconciliation.
    }
  } else {
    const marker = '/storage/v1/object/public/event-media/';
    const index = safe.image_url.indexOf(marker);
    if (index >= 0) safe.image_url = `governed:event-media/${decodeURIComponent(safe.image_url.slice(index + marker.length))}`;
  }
  return canonicalValue(safe) as UnknownRecord;
}

function canonicalAudit(value: unknown): UnknownRecord {
  const source = asRecord(value) || {};
  const metadata = asRecord(source.metadata);
  const safeMetadata = metadata ? { ...metadata } : undefined;
  if (safeMetadata) delete safeMetadata.repositorySource;
  return canonicalValue({ ...source, ...(safeMetadata ? { metadata: safeMetadata } : {}) }) as UnknownRecord;
}

function sortedItems(values: unknown[], transform: (value: unknown) => UnknownRecord): UnknownRecord[] {
  return values.map(transform).sort((left, right) => itemId(left).localeCompare(itemId(right)));
}

export function canonicalRepositoryState(value: RepositoryStoreShape): RepositoryStoreShape {
  return {
    version: 1,
    pendingSubmissions: sortedItems(Array.isArray(value.pendingSubmissions) ? value.pendingSubmissions : [], canonicalSubmission),
    publishedLocalEvents: sortedItems(Array.isArray(value.publishedLocalEvents) ? value.publishedLocalEvents : [], canonicalPublished),
    eventCategoryOverrides: canonicalValue(asRecord(value.eventCategoryOverrides) || {}) as UnknownRecord,
    operatorAuditLog: sortedItems(Array.isArray(value.operatorAuditLog) ? value.operatorAuditLog : [], canonicalAudit),
  };
}

function stableJson(value: unknown): string {
  return JSON.stringify(canonicalValue(value));
}

export function repositoryStateHash(value: RepositoryStoreShape): string {
  return createHash('sha256').update(stableJson(canonicalRepositoryState(value)), 'utf8').digest('hex');
}

function byId(values: unknown[]): Map<string, UnknownRecord> {
  const entries: Array<[string, UnknownRecord]> = values
    .map((value): [string, UnknownRecord] => [itemId(value), asRecord(value) || {}])
    .filter(([id]) => Boolean(id));
  return new Map(entries);
}

function missingKeys(source: Map<string, UnknownRecord>, destination: Map<string, UnknownRecord>): string[] {
  return [...source.keys()].filter((id) => !destination.has(id)).sort();
}

export function reconcileRepositoryStates(
  sourceValue: RepositoryStoreShape,
  destinationValue: RepositoryStoreShape,
): RepositoryReconciliationReport {
  const source = canonicalRepositoryState(sourceValue);
  const destination = canonicalRepositoryState(destinationValue);
  const sourcePending = byId(source.pendingSubmissions);
  const destinationPending = byId(destination.pendingSubmissions);
  const sourcePublished = byId(source.publishedLocalEvents);
  const destinationPublished = byId(destination.publishedLocalEvents);
  const commonPending = [...sourcePending.keys()].filter((id) => destinationPending.has(id));
  const statusMismatches = commonPending.filter((id) => sourcePending.get(id)?.status !== destinationPending.get(id)?.status).sort();
  const historyMismatches = commonPending.filter((id) => stableJson(sourcePending.get(id)?.statusHistory || []) !== stableJson(destinationPending.get(id)?.statusHistory || [])).sort();

  const sourceOverrides = asRecord(source.eventCategoryOverrides) || {};
  const destinationOverrides = asRecord(destination.eventCategoryOverrides) || {};
  const overrideMismatches = [...new Set([...Object.keys(sourceOverrides), ...Object.keys(destinationOverrides)])]
    .filter((id) => stableJson(sourceOverrides[id]) !== stableJson(destinationOverrides[id]))
    .sort();
  const sourceAudits = byId(source.operatorAuditLog || []);
  const destinationAudits = byId(destination.operatorAuditLog || []);
  const auditMismatches = [...new Set([...sourceAudits.keys(), ...destinationAudits.keys()])]
    .filter((id) => stableJson(sourceAudits.get(id)) !== stableJson(destinationAudits.get(id)))
    .sort();

  const report: RepositoryReconciliationReport = {
    matches: false,
    sourceHash: repositoryStateHash(source),
    destinationHash: repositoryStateHash(destination),
    missingPendingIds: missingKeys(sourcePending, destinationPending),
    extraPendingIds: missingKeys(destinationPending, sourcePending),
    missingPublishedIds: missingKeys(sourcePublished, destinationPublished),
    extraPublishedIds: missingKeys(destinationPublished, sourcePublished),
    statusMismatches,
    historyMismatches,
    overrideMismatches,
    auditMismatches,
  };
  report.matches = report.sourceHash === report.destinationHash
    && Object.entries(report)
      .filter(([key]) => key.endsWith('Ids') || key.endsWith('Mismatches'))
      .every(([, values]) => Array.isArray(values) && values.length === 0);
  return report;
}
