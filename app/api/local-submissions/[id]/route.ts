import { NextRequest, NextResponse } from 'next/server';
import { findLocalSubmissionStatus } from '@/lib/local-submissions-store';

// single-submission-status-api-pass: direct public status boundary for one Post Local submission.

export const dynamic = 'force-dynamic';

type SubmissionStatusRouteProps = {
  params: Promise<{ id: string }>;
};

function error(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function GET(_request: NextRequest, { params }: SubmissionStatusRouteProps) {
  const { id } = await params;
  const submissionId = decodeURIComponent(id || '').trim();
  if (!submissionId) return error('submissionId is required');

  const result = await findLocalSubmissionStatus(submissionId);
  if (!result.submission && !result.published) return error('submission not found', 404);

  return NextResponse.json({
    ok: true,
    api: `/api/local-submissions/${encodeURIComponent(submissionId)}`,
    submissionId: result.submissionId,
    status: result.status,
    submission: result.submission || null,
    published: result.published || null,
  });
}
