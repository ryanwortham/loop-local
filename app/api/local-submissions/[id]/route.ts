import { NextRequest, NextResponse } from 'next/server';
import { findLocalSubmissionStatus } from '@/lib/local-submissions-store';

// single-submission-status-api-pass: direct public status boundary for one Post Local submission.
// poster-status-token-pass: findLocalSubmissionStatus(submissionId, statusToken) protects pending PII and returns "status token required" without a token.

export const dynamic = 'force-dynamic';

type SubmissionStatusRouteProps = {
  params: Promise<{ id: string }>;
};

function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(request: NextRequest, { params }: SubmissionStatusRouteProps) {
  const { id } = await params;
  const submissionId = decodeURIComponent(id || '').trim();
  const statusToken = request.nextUrl.searchParams.get('statusToken') || undefined;
  if (!submissionId) return error('submissionId is required');

  const result = await findLocalSubmissionStatus(submissionId, statusToken);
  if (!result.submission && !result.published) return error(statusToken ? 'submission not found' : 'status token required', statusToken ? 404 : 401);

  return NextResponse.json({
    ok: true,
    api: `/api/local-submissions/${encodeURIComponent(submissionId)}`,
    submissionId: result.submissionId,
    status: result.status,
    submission: result.submission || null,
    published: result.published || null,
  });
}
