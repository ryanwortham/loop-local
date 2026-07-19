import { NextRequest, NextResponse } from 'next/server';
import { findLocalSubmissionStatus } from '@/lib/local-submissions-store';

// single-submission-status-api-pass: direct public status boundary for one Post Local submission.
// poster-status-token-pass: findLocalSubmissionStatus(submissionId, statusToken) protects pending PII and returns "status token required" without a token.

export const dynamic = 'force-dynamic';

const statusResponseHeaders = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Referrer-Policy': 'no-referrer',
  'X-Robots-Tag': 'noindex, noarchive, nosnippet',
};

type SubmissionStatusRouteProps = {
  params: Promise<{ id: string }>;
};

function statusJson(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: statusResponseHeaders });
}

function error(message: string, status = 400) {
  return statusJson({ ok: false, error: message }, status);
}

function statusCapability(request: NextRequest): string | undefined {
  const headerToken = request.headers.get('x-loop-local-status-token')?.trim();
  // Legacy query links remain readable while generated links migrate to URL fragments.
  const legacyQueryToken = request.nextUrl.searchParams.get('statusToken')?.trim();
  const token = headerToken || legacyQueryToken || '';
  return /^[a-f0-9]{32}$/i.test(token) ? token : undefined;
}

export async function GET(request: NextRequest, { params }: SubmissionStatusRouteProps) {
  const { id } = await params;
  const submissionId = decodeURIComponent(id || '').trim();
  const statusToken = statusCapability(request);
  if (!submissionId) return error('submissionId is required');

  const result = await findLocalSubmissionStatus(submissionId, statusToken);
  if (!result.submission && !result.published) return error(statusToken ? 'submission not found' : 'status token required', statusToken ? 404 : 401);

  return statusJson({
    ok: true,
    api: `/api/local-submissions/${encodeURIComponent(submissionId)}`,
    submissionId: result.submissionId,
    status: result.status,
    submission: result.submission || null,
    published: result.published || null,
  });
}
