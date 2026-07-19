import { isEventCategory, normalizeEventCategory } from '@/lib/event-taxonomy';
import { safeExternalUrl } from '@/lib/live-feed';
import type { LocalSubmissionRecord, LocalSubmissionStatus, LocalSubmissionsStore } from '@/lib/local-submissions-store';

export const MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES = 2_500_000;
const MAX_TEXT_FIELD_LENGTH = 2_000;
const MAX_SHORT_FIELD_LENGTH = 240;
const MAX_DATA_IMAGE_LENGTH = 1_000_000;

// local-submission-runtime-schema-pass: lightweight runtime validation at API boundary without adding deps.
export const allowedLocalSubmissionStatuses: LocalSubmissionStatus[] = ['pending_review', 'needs_changes', 'approved_local', 'published_local'];
export const allowedDataImageMimeTypes = ['image/png', 'image/jpeg', 'image/webp'] as const;

type ValidationResult<T> = { ok: true; value: T } | { ok: false; error: string; status?: number };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === 'object' && !Array.isArray(value));
}

function cleanString(value: unknown, max = MAX_SHORT_FIELD_LENGTH): string | undefined {
  if (typeof value !== 'string') return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}

export function safeOptionalUrl(value: unknown): string | undefined {
  if (typeof value !== 'string' || !value.trim()) return undefined;
  const cleaned = value.trim().slice(0, 1_000);
  const safe = safeExternalUrl(cleaned);
  return safe === '#' ? undefined : safe;
}

function dataImageMime(value: string): string | null {
  const match = value.match(/^data:([^;,]+);base64,/i);
  return match?.[1]?.toLowerCase() || null;
}

export function sanitizeLocalSubmissionMedia(input: Partial<LocalSubmissionRecord>): ValidationResult<Partial<LocalSubmissionRecord>> {
  // media-sanitization-boundary-pass: reject SVG/unknown data images and cap inline demo media until object storage lands.
  const next: Partial<LocalSubmissionRecord> = { ...input };
  for (const key of ['logoDataUrl', 'eventImageDataUrl'] as const) {
    const value = next[key];
    if (!value) continue;
    if (typeof value !== 'string') return { ok: false, error: `${key} must be a data image string` };
    const mime = dataImageMime(value);
    if (!mime || !allowedDataImageMimeTypes.includes(mime as (typeof allowedDataImageMimeTypes)[number])) {
      return { ok: false, error: 'unsupported image type' };
    }
    if (value.length > MAX_DATA_IMAGE_LENGTH) return { ok: false, error: `${key} is too large` };
  }
  return { ok: true, value: next };
}

function cleanSubmissionRecord(input: Record<string, unknown>): ValidationResult<Partial<LocalSubmissionRecord>> {
  const output: Partial<LocalSubmissionRecord> = {};
  const shortFields: (keyof LocalSubmissionRecord)[] = [
    'id', 'entityName', 'contactName', 'email', 'phone', 'address', 'city', 'state', 'zip', 'entityType', 'category', 'postType',
    'eventTitle', 'eventDate', 'startTime', 'endTime', 'locationName', 'eventAddress', 'eventCity', 'eventState', 'eventZip',
    'contactPhone', 'contactEmail', 'eventCategory', 'logoFileName', 'eventImageFileName', 'statusToken',
  ];
  for (const field of shortFields) {
    const value = cleanString(input[field]);
    if (value) (output as Record<string, unknown>)[field] = value;
  }
  for (const field of ['requestId', 'revisionRequestId'] as const) {
    if (input[field] === undefined || input[field] === '') continue;
    if (typeof input[field] !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(input[field])) {
      return { ok: false, error: `invalid ${field}` };
    }
    output[field] = input[field];
  }
  if (output.eventCategory) {
    const eventCategory = normalizeEventCategory({ category: output.eventCategory });
    if (!isEventCategory(eventCategory) || eventCategory === 'Local') return { ok: false, error: 'invalid event category' };
    output.eventCategory = eventCategory;
  }
  for (const field of ['description', 'eventDescription', 'reviewerNote'] as const) {
    const value = cleanString(input[field], MAX_TEXT_FIELD_LENGTH);
    if (value) output[field] = value;
  }
  output.website = safeOptionalUrl(input.website);
  output.ticketUrl = safeOptionalUrl(input.ticketUrl);
  for (const field of ['logoDataUrl', 'eventImageDataUrl'] as const) {
    if (typeof input[field] === 'string') output[field] = input[field];
  }
  if (typeof input.submittedAt === 'string') output.submittedAt = input.submittedAt;
  if (typeof input.approvedAt === 'string') output.approvedAt = input.approvedAt;
  if (typeof input.publishedAt === 'string') output.publishedAt = input.publishedAt;
  if (typeof input.statusUpdatedAt === 'string') output.statusUpdatedAt = input.statusUpdatedAt;
  if (typeof input.revisionSubmittedAt === 'string') output.revisionSubmittedAt = input.revisionSubmittedAt;
  if (typeof input.status === 'string') {
    if (!allowedLocalSubmissionStatuses.includes(input.status as LocalSubmissionStatus)) return { ok: false, error: 'invalid submission status' };
    output.status = input.status as LocalSubmissionStatus;
  }
  const media = sanitizeLocalSubmissionMedia(output);
  if (!media.ok) return media;
  return { ok: true, value: media.value };
}

export function validateCreateLocalSubmissionInput(input: unknown): ValidationResult<Partial<LocalSubmissionRecord>> {
  if (!isRecord(input)) return { ok: false, error: 'request body must be an object' };
  const cleaned = cleanSubmissionRecord(input);
  if (!cleaned.ok) return cleaned;
  if (!cleaned.value.eventTitle && !cleaned.value.entityName) return { ok: false, error: 'eventTitle or entityName is required' };
  if (cleaned.value.eventTitle && !cleaned.value.eventCategory) return { ok: false, error: 'event category is required' };
  if (cleaned.value.eventTitle && !cleaned.value.eventDate) return { ok: false, error: 'event date is required' };
  return cleaned;
}

export function validateReviewMutationInput(input: unknown): ValidationResult<Partial<LocalSubmissionRecord> & { id: string; action?: string }> {
  if (!isRecord(input)) return { ok: false, error: 'request body must be an object' };
  const action = cleanString(input.action);
  const cleaned = cleanSubmissionRecord(input);
  if (!cleaned.ok) return cleaned;
  const id = cleanString(input.id);
  if (!id) return { ok: false, error: 'id is required' };
  return { ok: true, value: { ...cleaned.value, id, ...(action ? { action } : {}) } };
}

export function validateReplaceStoreInput(input: unknown): ValidationResult<Pick<LocalSubmissionsStore, 'pendingSubmissions' | 'publishedLocalEvents'>> {
  if (!isRecord(input)) return { ok: false, error: 'request body must be an object' };
  const pending: LocalSubmissionRecord[] = [];
  if (Array.isArray(input.pendingSubmissions)) {
    for (const item of input.pendingSubmissions.slice(0, 200)) {
      if (!isRecord(item)) continue;
      const cleaned = cleanSubmissionRecord(item);
      if (!cleaned.ok) return cleaned;
      pending.push(cleaned.value as LocalSubmissionRecord);
    }
  }
  const publishedLocalEvents = Array.isArray(input.publishedLocalEvents) ? input.publishedLocalEvents.filter(isRecord).slice(0, 300) : [];
  return { ok: true, value: { pendingSubmissions: pending, publishedLocalEvents: publishedLocalEvents as LocalSubmissionsStore['publishedLocalEvents'] } };
}
