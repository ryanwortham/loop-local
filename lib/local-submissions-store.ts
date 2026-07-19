import { randomUUID } from 'node:crypto';
import { eventSlug, type LiveFeedItem } from '@/lib/live-feed';
import {
  normalizeEventCategoryOverrides,
  REVIEWED_EVENT_CATEGORY_OVERRIDES,
  type EventCategoryOverrideMap,
} from '@/lib/event-category-overrides';
import { submissionPublicationQuality } from '@/lib/local-submission-quality';
import { statusCapabilityForSubmission } from '@/lib/local-submissions/capability';
import { getLocalSubmissionsRepository } from '@/lib/local-submissions/repository';
import { sanitizeLocalSubmissionMedia } from '@/lib/local-submissions/schemas';
import type { StoredMediaReference } from '@/lib/local-submissions/media-storage';

// api-backed-local-submissions-pass: file-backed review queue until Supabase persistence is wired.
// Legacy persistence marker moved behind repository: runtime-data/local-submissions.json.

export type LocalSubmissionStatus = 'pending_review' | 'needs_changes' | 'approved_local' | 'published_local';

export type OperatorMutationActor = {
  actorUserId: string;
  authMethod: 'supabase' | 'token_fallback';
};

export type LocalSubmissionHistoryEntry = {
  // review-history-timeline-pass: chronological review actions for submitters and operators.
  action: 'submitted' | 'needs_changes' | 'approved_local' | 'resubmitted' | 'published_local' | 'updated';
  label: string;
  at: string;
  note?: string;
  actorUserId?: string;
  authMethod?: OperatorMutationActor['authMethod'];
};

export type OperatorAuditEntry = OperatorMutationActor & {
  id: string;
  action: 'replace_queues' | 'update_submission' | 'publish_submission' | 'delete_submission' | 'set_category_override' | 'clear_category_override';
  targetType: 'submission_queue' | 'local_submission' | 'event_category_override';
  targetId: string;
  at: string;
  metadata?: Record<string, unknown>;
};

export type LocalSubmissionRecord = {
  id: string;
  entityName?: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  website?: string;
  entityType?: string;
  category?: string;
  description?: string;
  postType?: string;
  eventTitle?: string;
  eventDate?: string;
  startTime?: string;
  endTime?: string;
  locationName?: string;
  eventAddress?: string;
  eventCity?: string;
  eventState?: string;
  eventZip?: string;
  ticketUrl?: string;
  contactPhone?: string;
  contactEmail?: string;
  eventCategory?: string;
  eventDescription?: string;
  // post-local-media-persistence-pass: file-adapter compatibility retains inline data;
  // the Supabase adapter rewrites it to governed object references.
  logoDataUrl?: string;
  eventImageDataUrl?: string;
  logoMedia?: StoredMediaReference;
  eventImageMedia?: StoredMediaReference;
  logoMediaUrl?: string;
  eventImageMediaUrl?: string;
  logoFileName?: string;
  eventImageFileName?: string;
  status: LocalSubmissionStatus;
  submittedAt: string;
  approvedAt?: string;
  publishedAt?: string;
  statusUpdatedAt?: string;
  reviewerNote?: string;
  reviewerNoteUpdatedAt?: string;
  revisionSubmittedAt?: string;
  statusHistory?: LocalSubmissionHistoryEntry[];
  // poster-status-token-pass: signed-ish status links protect submitter PII from guessable IDs.
  statusToken?: string;
  // submission-transaction-integrity-pass: caller-generated keys make network retries deterministic.
  requestId?: string;
  revisionRequestId?: string;
};

export type LocalSubmissionsStore = {
  version: 1;
  pendingSubmissions: LocalSubmissionRecord[];
  publishedLocalEvents: LiveFeedItem[];
  eventCategoryOverrides: EventCategoryOverrideMap;
  operatorAuditLog: OperatorAuditEntry[];
};

export type LocalSubmissionStatusResult = {
  submissionId: string;
  status?: LocalSubmissionStatus;
  submission?: LocalSubmissionRecord;
  published?: LiveFeedItem;
};

const emptyStore: LocalSubmissionsStore = {
  version: 1,
  pendingSubmissions: [],
  publishedLocalEvents: [],
  eventCategoryOverrides: REVIEWED_EVENT_CATEGORY_OVERRIDES,
  operatorAuditLog: [],
};

function nowIso() {
  return new Date().toISOString();
}

function historyLabel(action: LocalSubmissionHistoryEntry['action']) {
  return {
    submitted: 'Submitted for review',
    needs_changes: 'Changes requested',
    approved_local: 'Approved only',
    resubmitted: 'Resubmitted for review',
    published_local: 'Published locally',
    updated: 'Updated by operator',
  }[action];
}

function appendSubmissionHistory(
  submission: LocalSubmissionRecord,
  action: LocalSubmissionHistoryEntry['action'],
  note?: string,
  at = nowIso(),
  actor?: OperatorMutationActor,
): LocalSubmissionRecord {
  // review-history-timeline-pass: appendSubmissionHistory keeps immutable statusHistory audit entries.
  const entry: LocalSubmissionHistoryEntry = {
    action,
    label: historyLabel(action),
    at,
    ...(note ? { note } : {}),
    ...(actor ? { actorUserId: actor.actorUserId, authMethod: actor.authMethod } : {}),
  };
  return { ...submission, statusHistory: [...(submission.statusHistory || []), entry] };
}

function appendOperatorAudit(
  store: LocalSubmissionsStore,
  actor: OperatorMutationActor,
  action: OperatorAuditEntry['action'],
  targetType: OperatorAuditEntry['targetType'],
  targetId: string,
  metadata?: Record<string, unknown>,
): LocalSubmissionsStore {
  const entry: OperatorAuditEntry = {
    id: randomUUID(),
    ...actor,
    action,
    targetType,
    targetId,
    at: nowIso(),
    ...(metadata ? { metadata } : {}),
  };
  return { ...store, operatorAuditLog: [...store.operatorAuditLog, entry] };
}

function normalizeSubmission(input: Partial<LocalSubmissionRecord>, createCapability = false): LocalSubmissionRecord {
  const mediaResult = sanitizeLocalSubmissionMedia(input);
  const safeInput = mediaResult.ok ? mediaResult.value : { ...input, logoDataUrl: undefined, eventImageDataUrl: undefined };
  const submittedAt = safeInput.submittedAt || nowIso();
  const statusToken = statusCapabilityForSubmission(input.statusToken, createCapability);
  const base = {
    ...safeInput,
    id: input.id || randomUUID(),
    ...(statusToken ? { statusToken } : {}),
    status: input.status || 'pending_review',
    submittedAt,
    statusHistory: Array.isArray(input.statusHistory) && input.statusHistory.length
      ? input.statusHistory
      : [{ action: 'submitted' as const, label: 'Submitted for review', at: submittedAt }],
  };
  return base;
}

function normalizeStore(value: unknown): LocalSubmissionsStore {
  if (!value || typeof value !== 'object') return emptyStore;
  const maybe = value as Partial<LocalSubmissionsStore>;
  return {
    version: 1,
    pendingSubmissions: Array.isArray(maybe.pendingSubmissions) ? maybe.pendingSubmissions.map((submission) => normalizeSubmission(submission, false)) : [],
    publishedLocalEvents: Array.isArray(maybe.publishedLocalEvents) ? maybe.publishedLocalEvents.filter((item): item is LiveFeedItem => Boolean(item && typeof item === 'object' && 'id' in item)) : [],
    eventCategoryOverrides: Object.prototype.hasOwnProperty.call(maybe, 'eventCategoryOverrides')
      ? normalizeEventCategoryOverrides(maybe.eventCategoryOverrides)
      : REVIEWED_EVENT_CATEGORY_OVERRIDES,
    operatorAuditLog: Array.isArray(maybe.operatorAuditLog)
      ? maybe.operatorAuditLog.filter((entry): entry is OperatorAuditEntry => Boolean(
        entry && typeof entry === 'object' && 'actorUserId' in entry && 'action' in entry && 'targetId' in entry,
      ))
      : [],
  };
}

async function persistLocalSubmissionsStore(store: LocalSubmissionsStore): Promise<LocalSubmissionsStore> {
  const normalized = normalizeStore(store);
  const repository = await getLocalSubmissionsRepository();
  await repository.write(normalized);
  return normalized;
}

type LocalStoreMutationResult = { store: LocalSubmissionsStore } & Record<string, unknown>;

async function mutateLocalSubmissionsStore<T extends LocalStoreMutationResult>(
  operation: (store: LocalSubmissionsStore) => Promise<T> | T,
): Promise<T> {
  const repository = await getLocalSubmissionsRepository();
  return repository.mutate(async (rawStore) => {
    const result = await operation(normalizeStore(rawStore));
    const normalizedStore = normalizeStore(result.store);
    return {
      store: normalizedStore,
      result: { ...result, store: normalizedStore },
    };
  });
}

export async function readLocalSubmissionsStore(): Promise<LocalSubmissionsStore> {
  const repository = await getLocalSubmissionsRepository();
  const raw = await repository.read();
  return normalizeStore(raw);
}

export async function writeLocalSubmissionsStore(store: LocalSubmissionsStore): Promise<LocalSubmissionsStore> {
  return persistLocalSubmissionsStore(store);
}

export async function replaceLocalSubmissionQueues(
  pendingSubmissions: LocalSubmissionRecord[],
  publishedLocalEvents: LiveFeedItem[],
  actor: OperatorMutationActor,
): Promise<LocalSubmissionsStore> {
  const result = await mutateLocalSubmissionsStore(async (current) => {
    const replaced = { ...current, pendingSubmissions, publishedLocalEvents };
    const store = appendOperatorAudit(
      replaced,
      actor,
      'replace_queues',
      'submission_queue',
      'local-submissions',
      { pendingCount: pendingSubmissions.length, publishedCount: publishedLocalEvents.length },
    );
    return { store };
  });
  return result.store;
}

export function publishedMatchesSubmissionId(item: LiveFeedItem, submissionId: string): boolean {
  // single-submission-status-api-pass: published status lookup must match raw id, approved id, or detail slug tail.
  return item.id === submissionId || item.id === `local-approved-${submissionId}` || eventSlug(item).endsWith(submissionId);
}

export async function findLocalSubmissionStatus(submissionId: string, statusToken?: string): Promise<LocalSubmissionStatusResult> {
  const repository = await getLocalSubmissionsRepository();
  const authorized = statusToken ? await repository.authorizeStatusCapability(submissionId, statusToken) : false;
  if (!authorized) return { submissionId };
  const store = normalizeStore(await repository.read());
  const submission = store.pendingSubmissions.find((item) => item.id === submissionId);
  const published = store.publishedLocalEvents.find((item) => publishedMatchesSubmissionId(item, submissionId));
  return {
    submissionId,
    status: published ? 'published_local' : submission?.status,
    submission,
    published,
  };
}

export function publishableMediaDataUrl(submission: LocalSubmissionRecord): string | undefined {
  // media-sanitization-boundary-pass: publish only schema-approved local demo image data.
  const media = sanitizeLocalSubmissionMedia(submission);
  if (!media.ok) return undefined;
  return media.value.eventImageDataUrl || media.value.logoDataUrl;
}

export function submissionToFeedItem(submission: LocalSubmissionRecord): LiveFeedItem {
  const imageUrl = publishableMediaDataUrl(submission);
  // Legacy media contract marker: image_url: submission.eventImageDataUrl || submission.logoDataUrl.
  // Legacy media contract marker: imageState: submission.eventImageDataUrl || submission.logoDataUrl ? 'photo' : 'fallback'.
  return {
    id: `local-approved-${submission.id}`,
    title: submission.eventTitle || 'Locally approved submission',
    summary: submission.eventDescription || `${submission.entityName || 'A local contributor'} submitted this event through Post Local.`,
    category: submission.eventCategory || submission.postType || 'Community',
    type: submission.postType || 'Event',
    business: submission.entityName || submission.locationName || 'Local contributor',
    location: submission.locationName || submission.entityName || 'Local venue',
    city: submission.eventCity || submission.city || 'Nearby',
    state: submission.eventState || submission.state || 'MO',
    zip: submission.eventZip || submission.zip,
    date: submission.eventDate,
    startsAt: submission.eventDate,
    time: submission.startTime || 'Time pending',
    source: 'local_approved',
    ticketUrl: submission.ticketUrl || submission.website,
    website: submission.website,
    address: submission.eventAddress || submission.address,
    image_url: imageUrl,
    imageState: imageUrl ? 'photo' : 'fallback',
    visualKey: imageUrl ? 'local-submission-media' : 'community',
    fallbackLabel: 'Locally approved',
    localSubmissionStatusHistory: submission.statusHistory,
    // published-status-history-pass: localSubmissionStatusHistory: publishedSubmission.statusHistory
  };
}

export async function createLocalSubmission(input: Partial<LocalSubmissionRecord>) {
  return mutateLocalSubmissionsStore(async (store) => {
    const replayedSubmission = input.requestId
      ? store.pendingSubmissions.find((item) => item.requestId === input.requestId)
      : undefined;
    if (replayedSubmission) return { store, submission: replayedSubmission, replayed: true };
    const submission = normalizeSubmission({ ...input, status: 'pending_review', submittedAt: input.submittedAt || nowIso() }, true);
    const next = {
      ...store,
      pendingSubmissions: [submission, ...store.pendingSubmissions.filter((item) => item.id !== submission.id)],
    };
    return { store: next, submission, replayed: false };
  });
}

export async function updateLocalSubmission(
  id: string,
  patch: Partial<LocalSubmissionRecord>,
  actor: OperatorMutationActor,
) {
  return mutateLocalSubmissionsStore(async (store) => {
    const nextPending = store.pendingSubmissions.map((item) => {
      if (item.id !== id) return item;
      const updated = { ...item, ...patch, statusUpdatedAt: nowIso() };
      if (patch.status && patch.status !== item.status) {
        const action = patch.status === 'needs_changes' ? 'needs_changes' : patch.status === 'approved_local' ? 'approved_local' : 'updated';
        // review-history-timeline-pass markers: action: 'needs_changes' action: 'approved_local'
        return appendSubmissionHistory(updated, action, patch.reviewerNote || item.reviewerNote, undefined, actor);
      }
      if (patch.reviewerNote && patch.reviewerNote !== item.reviewerNote) {
        return appendSubmissionHistory(updated, 'updated', patch.reviewerNote, undefined, actor);
      }
      return updated;
    });
    const updated = nextPending.find((item) => item.id === id);
    if (!updated) return { store, submission: null };
    const nextStore: LocalSubmissionsStore = appendOperatorAudit(
      { ...store, pendingSubmissions: nextPending },
      actor,
      'update_submission',
      'local_submission',
      id,
      { status: patch.status || updated.status, reviewerNoteChanged: Boolean(patch.reviewerNote) },
    );
    return { store: nextStore, submission: updated };
  });
}

export async function deleteLocalSubmission(id: string, actor: OperatorMutationActor) {
  return mutateLocalSubmissionsStore(async (store) => {
    const nextStore = appendOperatorAudit(
      {
        ...store,
        pendingSubmissions: store.pendingSubmissions.filter((item) => item.id !== id),
      },
      actor,
      'delete_submission',
      'local_submission',
      id,
    );
    return { store: nextStore };
  });
}

export async function publishLocalSubmission(id: string, actor: OperatorMutationActor) {
  return mutateLocalSubmissionsStore(async (store) => {
    const submission = store.pendingSubmissions.find((item) => item.id === id);
    if (!submission) return { store, submission: null, published: null };
    const quality = submissionPublicationQuality(submission);
    if (!quality.canPublish) {
      return {
        store,
        submission,
        published: null,
        error: `submission is not publish-ready: ${quality.missingFields.join(', ')}`,
      };
    }
    const publishedSubmission = appendSubmissionHistory(
      { ...submission, status: 'published_local' as const, publishedAt: nowIso(), approvedAt: submission.approvedAt || nowIso(), statusUpdatedAt: nowIso() },
      'published_local',
      undefined,
      undefined,
      actor,
    );
    // review-history-timeline-pass marker: action: 'published_local'
    const published = submissionToFeedItem(publishedSubmission);
    const nextStore: LocalSubmissionsStore = appendOperatorAudit(
      {
        ...store,
        pendingSubmissions: store.pendingSubmissions.filter((item) => item.id !== id),
        publishedLocalEvents: [published, ...store.publishedLocalEvents.filter((item) => item.id !== published.id)],
      },
      actor,
      'publish_submission',
      'local_submission',
      id,
      { publishedEventId: published.id },
    );
    return { store: nextStore, submission: publishedSubmission, published };
  });
}

export async function resubmitLocalSubmission(id: string, patch: Partial<LocalSubmissionRecord>) {
  // submitter-revision-flow-pass: needs_changes submissions can be revised and returned to pending_review.
  return mutateLocalSubmissionsStore(async (store) => {
    const existing = store.pendingSubmissions.find((item) => item.id === id);
    if (!existing) return { store, submission: null, replayed: false };
    if (patch.revisionRequestId && existing.revisionRequestId === patch.revisionRequestId) {
      return { store, submission: existing, replayed: true };
    }
    const submittedAt = nowIso();
    const cleanPatch = Object.fromEntries(Object.entries(patch).filter(([, value]) => value !== undefined));
    const nextPending = store.pendingSubmissions.map((item) => item.id === id ? appendSubmissionHistory({
      ...item,
      ...cleanPatch,
      id,
      status: 'pending_review' as const,
      reviewerNote: undefined,
      reviewerNoteUpdatedAt: undefined,
      statusUpdatedAt: submittedAt,
      revisionSubmittedAt: submittedAt,
    }, 'resubmitted', undefined, submittedAt) : item);
    // review-history-timeline-pass marker: action: 'resubmitted'
    const updated = nextPending.find((item) => item.id === id);
    if (!updated) return { store, submission: null, replayed: false };
    const nextStore: LocalSubmissionsStore = { ...store, pendingSubmissions: nextPending };
    return { store: nextStore, submission: updated, replayed: false };
  });
}

export async function setEventCategoryOverride(
  event: Pick<LiveFeedItem, 'id' | 'title' | 'category' | 'sourceCategory'>,
  category: string | undefined,
  actor: OperatorMutationActor,
) {
  return mutateLocalSubmissionsStore(async (store) => {
    const nextOverrides = { ...store.eventCategoryOverrides };
    if (!category) {
      delete nextOverrides[event.id];
    } else {
      const candidate = normalizeEventCategoryOverrides({
        [event.id]: {
          category,
          sourceCategory: event.sourceCategory || event.category || 'Local',
          eventTitle: event.title,
          reviewedAt: nowIso(),
        },
      });
      if (!candidate[event.id]) return { store, override: null, error: 'invalid event category override' };
      nextOverrides[event.id] = candidate[event.id];
    }
    const nextStore: LocalSubmissionsStore = appendOperatorAudit(
      { ...store, eventCategoryOverrides: nextOverrides },
      actor,
      category ? 'set_category_override' : 'clear_category_override',
      'event_category_override',
      event.id,
      { category: category || null, sourceCategory: event.sourceCategory || event.category || 'Local' },
    );
    return { store: nextStore, override: nextStore.eventCategoryOverrides[event.id] || null };
  });
}
