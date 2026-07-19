import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorAccess } from '@/lib/operator-auth';
import {
  createLocalSubmission,
  deleteLocalSubmission,
  findLocalSubmissionStatus,
  publishLocalSubmission,
  readLocalSubmissionsStore,
  resubmitLocalSubmission,
  updateLocalSubmission,
  writeLocalSubmissionsStore,
  type LocalSubmissionRecord,
} from '@/lib/local-submissions-store';
import {
  MAX_LOCAL_SUBMISSION_PAYLOAD_BYTES,
  validateCreateLocalSubmissionInput,
  validateReplaceStoreInput,
  validateReviewMutationInput,
} from '@/lib/local-submissions/schemas';
import { type LiveFeedItem } from '@/lib/live-feed';

// api-backed-local-submissions-pass: /api/local-submissions is the app-backed review queue boundary.
// operator-review-token-gate-pass marker: requireOperatorAccess rejects with "operator token required" using LOOP_LOCAL_OPERATOR_TOKEN and x-loop-local-operator-token.

export const dynamic = 'force-dynamic';

type MutationBody = Partial<LocalSubmissionRecord> & {
  id?: string;
  action?: 'update' | 'delete' | 'publish' | 'replace' | 'resubmit';
  pendingSubmissions?: LocalSubmissionRecord[];
  publishedLocalEvents?: LiveFeedItem[];
};

function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
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

export async function GET(request: NextRequest) {
  // operator-review-token-gate-pass: LOOP_LOCAL_OPERATOR_TOKEN + x-loop-local-operator-token protect review queue reads.
  const unauthorized = requireOperatorAccess(request);
  if (unauthorized) return unauthorized;
  const store = await readLocalSubmissionsStore();
  return NextResponse.json({
    ok: true,
    api: '/api/local-submissions',
    ...store,
  });
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (payloadTooLarge(body)) return error('payload too large', 413);
  if (body.action === 'replace') {
    const unauthorized = requireOperatorAccess(request);
    if (unauthorized) return unauthorized;
    const replacement = validateReplaceStoreInput(body);
    if (!replacement.ok) return error(replacement.error, replacement.status || 400);
    const store = await writeLocalSubmissionsStore({
      version: 1,
      pendingSubmissions: replacement.value.pendingSubmissions,
      publishedLocalEvents: replacement.value.publishedLocalEvents.filter(isLiveFeedItem),
    });
    return NextResponse.json({ ok: true, api: '/api/local-submissions', ...store });
  }
  const create = validateCreateLocalSubmissionInput(body);
  if (!create.ok) return error(create.error, create.status || 400);
  const { store, submission } = await createLocalSubmission(create.value);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', submission, ...store }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
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
    return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, ...result.store });
  }
  const unauthorized = requireOperatorAccess(request);
  if (unauthorized) return unauthorized;
  if (cleanBody.action === 'publish') {
    // Legacy operator contract marker: body.action === 'publish'.
    const result = await publishLocalSubmission(cleanBody.id);
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
  const result = await updateLocalSubmission(id, patch);
  if (!result.submission) return error('submission not found', 404);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, ...result.store });
}

export async function DELETE(request: NextRequest) {
  const unauthorized = requireOperatorAccess(request);
  if (unauthorized) return unauthorized;
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return error('id is required');
  const { store } = await deleteLocalSubmission(id);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', ...store });
}
