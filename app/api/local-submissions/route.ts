import { NextRequest, NextResponse } from 'next/server';
import {
  createLocalSubmission,
  deleteLocalSubmission,
  publishLocalSubmission,
  readLocalSubmissionsStore,
  resubmitLocalSubmission,
  updateLocalSubmission,
  writeLocalSubmissionsStore,
  type LocalSubmissionRecord,
} from '@/lib/local-submissions-store';
import { type LiveFeedItem } from '@/lib/live-feed';

// api-backed-local-submissions-pass: /api/local-submissions is the app-backed review queue boundary.

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
  try {
    return (await request.json()) as MutationBody;
  } catch {
    return {};
  }
}

export async function GET() {
  const store = await readLocalSubmissionsStore();
  return NextResponse.json({
    ok: true,
    api: '/api/local-submissions',
    ...store,
  });
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (body.action === 'replace') {
    const store = await writeLocalSubmissionsStore({
      version: 1,
      pendingSubmissions: Array.isArray(body.pendingSubmissions) ? body.pendingSubmissions : [],
      publishedLocalEvents: Array.isArray(body.publishedLocalEvents) ? body.publishedLocalEvents.filter(isLiveFeedItem) : [],
    });
    return NextResponse.json({ ok: true, api: '/api/local-submissions', ...store });
  }
  if (!body.eventTitle && !body.entityName) return error('eventTitle or entityName is required');
  const { store, submission } = await createLocalSubmission(body);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', submission, ...store }, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await readBody(request);
  if (!body.id) return error('id is required');
  if (body.action === 'publish') {
    const result = await publishLocalSubmission(body.id);
    if (!result.submission) return error('submission not found', 404);
    return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, published: result.published, ...result.store });
  }
  if (body.action === 'resubmit') {
    // submitter-revision-flow-pass: submitter revisions preserve the same id and return to pending review.
    const { id, action: _action, ...patch } = body;
    void _action;
    const result = await resubmitLocalSubmission(id, patch);
    if (!result.submission) return error('submission not found', 404);
    return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, ...result.store });
  }
  const { id, ...patch } = body;
  const result = await updateLocalSubmission(id, patch);
  if (!result.submission) return error('submission not found', 404);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', submission: result.submission, ...result.store });
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');
  if (!id) return error('id is required');
  const { store } = await deleteLocalSubmission(id);
  return NextResponse.json({ ok: true, api: '/api/local-submissions', ...store });
}
