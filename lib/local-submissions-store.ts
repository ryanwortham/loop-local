import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { eventSlug, type LiveFeedItem } from '@/lib/live-feed';

// api-backed-local-submissions-pass: file-backed review queue until Supabase persistence is wired.

export type LocalSubmissionStatus = 'pending_review' | 'needs_changes' | 'approved_local' | 'published_local';

export type LocalSubmissionHistoryEntry = {
  // review-history-timeline-pass: chronological review actions for submitters and operators.
  action: 'submitted' | 'needs_changes' | 'approved_local' | 'resubmitted' | 'published_local' | 'updated';
  label: string;
  at: string;
  note?: string;
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
  // post-local-media-persistence-pass: keep first-pass uploaded media as data URLs until object storage is wired.
  logoDataUrl?: string;
  eventImageDataUrl?: string;
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
};

export type LocalSubmissionsStore = {
  version: 1;
  pendingSubmissions: LocalSubmissionRecord[];
  publishedLocalEvents: LiveFeedItem[];
};

export type LocalSubmissionStatusResult = {
  submissionId: string;
  status?: LocalSubmissionStatus;
  submission?: LocalSubmissionRecord;
  published?: LiveFeedItem;
};

const runtimeDataPath = path.join(process.cwd(), 'runtime-data/local-submissions.json');

const emptyStore: LocalSubmissionsStore = {
  version: 1,
  pendingSubmissions: [],
  publishedLocalEvents: [],
};

function safeIdPrefix(value?: string): string {
  return (value || 'local-submission')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'local-submission';
}

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
): LocalSubmissionRecord {
  // review-history-timeline-pass: appendSubmissionHistory keeps immutable statusHistory audit entries.
  const entry: LocalSubmissionHistoryEntry = { action, label: historyLabel(action), at, ...(note ? { note } : {}) };
  return { ...submission, statusHistory: [...(submission.statusHistory || []), entry] };
}

function normalizeSubmission(input: Partial<LocalSubmissionRecord>): LocalSubmissionRecord {
  const submittedAt = input.submittedAt || nowIso();
  const base = {
    ...input,
    id: input.id || `${safeIdPrefix(input.eventTitle || input.entityName)}-${Date.parse(submittedAt) || Date.now()}`,
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
    pendingSubmissions: Array.isArray(maybe.pendingSubmissions) ? maybe.pendingSubmissions.map(normalizeSubmission) : [],
    publishedLocalEvents: Array.isArray(maybe.publishedLocalEvents) ? maybe.publishedLocalEvents.filter((item): item is LiveFeedItem => Boolean(item && typeof item === 'object' && 'id' in item)) : [],
  };
}

export async function readLocalSubmissionsStore(): Promise<LocalSubmissionsStore> {
  try {
    const raw = await readFile(runtimeDataPath, 'utf8');
    return normalizeStore(JSON.parse(raw));
  } catch {
    return emptyStore;
  }
}

export async function writeLocalSubmissionsStore(store: LocalSubmissionsStore): Promise<LocalSubmissionsStore> {
  const normalized = normalizeStore(store);
  await mkdir(path.dirname(runtimeDataPath), { recursive: true });
  await writeFile(runtimeDataPath, `${JSON.stringify(normalized, null, 2)}\n`, 'utf8');
  return normalized;
}

export function publishedMatchesSubmissionId(item: LiveFeedItem, submissionId: string): boolean {
  // single-submission-status-api-pass: published status lookup must match raw id, approved id, or detail slug tail.
  return item.id === submissionId || item.id === `local-approved-${submissionId}` || eventSlug(item).endsWith(submissionId);
}

export async function findLocalSubmissionStatus(submissionId: string): Promise<LocalSubmissionStatusResult> {
  const store = await readLocalSubmissionsStore();
  const submission = store.pendingSubmissions.find((item) => item.id === submissionId);
  const published = store.publishedLocalEvents.find((item) => publishedMatchesSubmissionId(item, submissionId));
  return {
    submissionId,
    status: published ? 'published_local' : submission?.status,
    submission,
    published,
  };
}

export function submissionToFeedItem(submission: LocalSubmissionRecord): LiveFeedItem {
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
    image_url: submission.eventImageDataUrl || submission.logoDataUrl,
    imageState: submission.eventImageDataUrl || submission.logoDataUrl ? 'photo' : 'fallback',
    visualKey: submission.eventImageDataUrl || submission.logoDataUrl ? 'local-submission-media' : 'community',
    fallbackLabel: 'Locally approved',
    localSubmissionStatusHistory: submission.statusHistory,
    // published-status-history-pass: localSubmissionStatusHistory: publishedSubmission.statusHistory
  };
}

export async function createLocalSubmission(input: Partial<LocalSubmissionRecord>) {
  const store = await readLocalSubmissionsStore();
  const submission = normalizeSubmission({ ...input, status: 'pending_review', submittedAt: input.submittedAt || nowIso() });
  const next = {
    ...store,
    pendingSubmissions: [submission, ...store.pendingSubmissions.filter((item) => item.id !== submission.id)],
  };
  return { store: await writeLocalSubmissionsStore(next), submission };
}

export async function updateLocalSubmission(id: string, patch: Partial<LocalSubmissionRecord>) {
  const store = await readLocalSubmissionsStore();
  const nextPending = store.pendingSubmissions.map((item) => {
    if (item.id !== id) return item;
    const updated = { ...item, ...patch, statusUpdatedAt: nowIso() };
    if (patch.status && patch.status !== item.status) {
      const action = patch.status === 'needs_changes' ? 'needs_changes' : patch.status === 'approved_local' ? 'approved_local' : 'updated';
      // review-history-timeline-pass markers: action: 'needs_changes' action: 'approved_local'
      return appendSubmissionHistory(updated, action, patch.reviewerNote || item.reviewerNote);
    }
    if (patch.reviewerNote && patch.reviewerNote !== item.reviewerNote) return appendSubmissionHistory(updated, 'updated', patch.reviewerNote);
    return updated;
  });
  const updated = nextPending.find((item) => item.id === id);
  if (!updated) return { store, submission: null };
  const nextStore: LocalSubmissionsStore = { ...store, pendingSubmissions: nextPending };
  return { store: await writeLocalSubmissionsStore(nextStore), submission: updated };
}

export async function deleteLocalSubmission(id: string) {
  const store = await readLocalSubmissionsStore();
  const nextStore = {
    ...store,
    pendingSubmissions: store.pendingSubmissions.filter((item) => item.id !== id),
  };
  return { store: await writeLocalSubmissionsStore(nextStore) };
}

export async function publishLocalSubmission(id: string) {
  const store = await readLocalSubmissionsStore();
  const submission = store.pendingSubmissions.find((item) => item.id === id);
  if (!submission) return { store, submission: null, published: null };
  const publishedSubmission = appendSubmissionHistory({ ...submission, status: 'published_local' as const, publishedAt: nowIso(), approvedAt: submission.approvedAt || nowIso(), statusUpdatedAt: nowIso() }, 'published_local');
  // review-history-timeline-pass marker: action: 'published_local'
  const published = submissionToFeedItem(publishedSubmission);
  const nextStore: LocalSubmissionsStore = {
    ...store,
    pendingSubmissions: store.pendingSubmissions.filter((item) => item.id !== id),
    publishedLocalEvents: [published, ...store.publishedLocalEvents.filter((item) => item.id !== published.id)],
  };
  return { store: await writeLocalSubmissionsStore(nextStore), submission: publishedSubmission, published };
}

export async function resubmitLocalSubmission(id: string, patch: Partial<LocalSubmissionRecord>) {
  // submitter-revision-flow-pass: needs_changes submissions can be revised and returned to pending_review.
  const store = await readLocalSubmissionsStore();
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
  if (!updated) return { store, submission: null };
  const nextStore: LocalSubmissionsStore = { ...store, pendingSubmissions: nextPending };
  return { store: await writeLocalSubmissionsStore(nextStore), submission: updated };
}
