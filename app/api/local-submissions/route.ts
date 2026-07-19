import { NextRequest, NextResponse } from 'next/server';
import { operatorAccessError, requireOperatorAccess, resolveOperatorAccess, type OperatorAccess } from '@/lib/operator-auth';
import {
  createLocalSubmission,
  deleteLocalSubmission,
  findLocalSubmissionStatus,
  publishLocalSubmission,
  readLocalSubmissionsStore,
  replaceLocalSubmissionQueues,
  resubmitLocalSubmission,
  setEventCategoryOverride,
  updateLocalSubmission,
  type LocalSubmissionRecord,
  type OperatorMutationActor,
} from '@/lib/local-submissions-store';
import {
  MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES,
  validateCreateLocalSubmissionInput,
  validateReplaceStoreInput,
  validateReviewMutationInput,
} from '@/lib/local-submissions/schemas';
import { type LiveFeedItem } from '@/lib/live-feed';
import { getLiveFeed } from '@/lib/live-feed-server';
import { publicSubmissionRateLimit, type PublicSubmissionScope } from '@/lib/public-submission-rate-limit';

// api-backed-local-submissions-pass: /api/local-submissions is the app-backed review queue boundary.
// operator-supabase-auth-pass: verified Supabase sessions and profiles.app_role protect review access; shared-token fallback is opt-in only.

export const dynamic = 'force-dynamic';

type MutationBody = Partial<LocalSubmissionRecord> & {
  id?: string;
  action?: 'update' | 'delete' | 'publish' | 'replace' | 'resubmit' | 'set_category_override';
  pendingSubmissions?: LocalSubmissionRecord[];
  publishedLocalEvents?: LiveFeedItem[];
};

function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

function mutationActor(access: OperatorAccess): OperatorMutationActor {
  if (!access.authorized || !access.actorUserId || !access.authMethod) {
    throw new Error('authorized operator actor is required');
  }
  return { actorUserId: access.actorUserId, authMethod: access.authMethod };
}

function publicSubmissionResponse(submission: LocalSubmissionRecord | null, status = 200) {
  return NextResponse.json({ ok: true, api: '/api/local-submissions', submission }, { status });
}

async function submissionRateLimit(request: NextRequest, scope: PublicSubmissionScope) {
  const decision = await publicSubmissionRateLimit(request.headers, scope);
  if (decision.allowed) return null;
  return NextResponse.json(
    { ok: false, error: 'too many submission attempts; try again shortly' },
    {
      status: 429,
      headers: {
        'Retry-After': String(decision.retryAfterSeconds),
        'X-RateLimit-Limit': String(decision.limit),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': String(Math.ceil(decision.resetAt / 1000)),
      },
    },
  );
}

function isLiveFeedItem(item: unknown): item is LiveFeedItem {
  return Boolean(item && typeof item === 'object' && 'id' in item && 'title' in item);
}

async function readBody(request: NextRequest): Promise<MutationBody> {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES) return { __payloadTooLarge: true } as MutationBody;
  try {
    const raw = await request.text();
    if (raw.length > MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES) return { __payloadTooLarge: true } as MutationBody;
    return raw ? (JSON.parse(raw) as MutationBody) : {};
  } catch {
    return {};
  }
}

function payloadTooLarge(body: MutationBody) {
  return Boolean((body as MutationBody & { __payloadTooLarge?: boolean }).__payloadTooLarge);
}

function taxonomyReviewItems(items: LiveFeedItem[]): LiveFeedItem[] {
  return items.filter((item) => {
    const sourceCategory = item.sourceCategory || item.category || 'Local';
    return item.categoryOverrideApplied || sourceCategory === 'Community' || sourceCategory === 'Local';
  });
}

export async function GET(request: NextRequest) {
  // operator-supabase-auth-pass: a verified Supabase operator role protects review queue reads.
  const { response } = await requireOperatorAccess(request);
  if (response) return response;
  const [store, feed] = await Promise.all([readLocalSubmissionsStore(), getLiveFeed(160)]);
  return NextResponse.json({
    ok: true,
    api: '/api/local-submissions',
    ...store,
    taxonomyReviewItems: taxonomyReviewItems(feed.items),
    taxonomyFeedHealth: feed.health,
  });
}

export async function POST(request: NextRequest) {
  const access = await resolveOperatorAccess(request);
  if (!access.authorized) {
    const limited = await submissionRateLimit(request, 'create');
    if (limited) return limited;
  }
  const body = await readBody(request);
  if (payloadTooLarge(body)) return error('payload too large', 413);
  if (body.action === 'replace') {
    if (!access.authorized) return operatorAccessError(access);
    const replacement = validateReplaceStoreInput(body);
    if (!replacement.ok) return error(replacement.error, replacement.status || 400);
    const store = await replaceLocalSubmissionQueues(
      replacement.value.pendingSubmissions,
      replacement.value.publishedLocalEvents.filter(isLiveFeedItem),
      mutationActor(access),
    );
    return NextResponse.json({ ok: true, api: '/api/local-submissions', ...store });
  }
  const create = validateCreateLocalSubmissionInput(body);
  if (!create.ok) return error(create.error, create.status || 400);
  const { submission, replayed } = await createLocalSubmission(create.value);
  return publicSubmissionResponse(submission, replayed ? 200 : 201);
}

export async function PATCH(request: NextRequest) {
  const access = await resolveOperatorAccess(request);
  if (!access.authorized) {
    const limited = await submissionRateLimit(request, 'resubmit');
    if (limited) return limited;
  }
  const body = await readBody(request);
  if (payloadTooLarge(body)) return error('payload too large', 413);
  const mutation = validateReviewMutationInput(body);
  if (!mutation.ok) return error(mutation.error, mutation.status || 400);
  const cleanBody = mutation.value;
  if (cleanBody.action === 'resubmit') {
    // Legacy resubmit contract marker: body.action === 'resubmit'.
    // submitter-revision-flow-pass: submitter revisions use statusToken instead of operatorToken.
    const token = typeof cleanBody.statusToken === 'string' ? cleanBody.statusToken : '';
    const status = await findLocalSubmissionStatus(cleanBody.id, token);
    if (!status.submission) return error(token ? 'submission not found' : 'status token required', token ? 404 : 401);
    const { id, action: _action, statusToken: _statusToken, ...patch } = cleanBody;
    void _action;
    void _statusToken;
    const result = await resubmitLocalSubmission(id, patch);
    if (!result.submission) return error('submission not found', 404);
    return publicSubmissionResponse(result.submission);
  }
  if (!access.authorized) return operatorAccessError(access);
  const actor = mutationActor(access);
  if (cleanBody.action === 'set_category_override') {
    const feed = await getLiveFeed(160);
    const event = feed.items.find((item) => item.id === cleanBody.id);
    if (!event) return error('event not found', 404);
    const result = await setEventCategoryOverride(event, cleanBody.eventCategory, actor);
    if ('error' in result && result.error) return error(result.error);
    const updatedFeed = await getLiveFeed(160);
    return NextResponse.json({
      ok: true,
      api: '/api/local-submissions',
      override: result.override,
      ...result.store,
      taxonomyReviewItems: taxonomyReviewItems(updatedFeed.items),
      taxonomyFeedHealth: updatedFeed.health,
    });
  }
  if (cleanBody.action === 'publish') {
    // Legacy operator contract marker: body.action === 'publish'.
    const result = await publishLocalSubmission(cleanBody.id, actor);
    if ('error' in result && result.error) return error(result.error);
    if (!result.submission) return error('submission not found', 404);
    return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, published: result.published, ...result.store });
  }
  if (cleanBody.status === 'needs_changes') {
    // needs-changes-note-gate-pass: reviewer feedback must be actionable before submitters see Changes requested.
    const store = await readLocalSubmissionsStore();
    const existing = store.pendingSubmissions.find((item) => item.id === cleanBody.id);
    const note = (cleanBody.reviewerNote || existing?.reviewerNote || '').trim();
    if (!note) return error('reviewerNote is required to request changes');
    cleanBody.reviewerNote = note;
  }
  const { id, ...patch } = cleanBody;
  const result = await updateLocalSubmission(id, patch, actor);
  if (!result.submission) return error('submission not found', 404);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, ...result.store });
}

export async function DELETE(request: NextRequest) {
  const { access, response } = await requireOperatorAccess(request);
  if (response) return response;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return error('id is required');
  const { store } = await deleteLocalSubmission(id, mutationActor(access));
  return NextResponse.json({ ok: true, api: '/api/local-submissions', ...store });
}
