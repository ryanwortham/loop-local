import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorAccess } from '@/lib/operator-auth';
import { publicSubmissionRateLimit } from '@/lib/public-submission-rate-limit';
import { createDemandSignal, readDemandSignals } from '@/lib/unmet-demand-repository';
import { validateDemandSignal } from '@/lib/unmet-demand';

export const dynamic = 'force-dynamic';
const MAX_BODY_BYTES = 2048;

function error(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  const contentLength = Number(request.headers.get('content-length') || 0);
  if (contentLength > MAX_BODY_BYTES) return error('payload too large', 413);
  let limited;
  try {
    limited = await publicSubmissionRateLimit(request.headers, 'unmet_demand');
  } catch {
    return error('demand capture is temporarily unavailable', 503);
  }
  if (!limited.allowed) return error('too many demand signals; try again later', 429);
  let body: unknown;
  try {
    const raw = await request.text();
    if (raw.length > MAX_BODY_BYTES) return error('payload too large', 413);
    body = JSON.parse(raw);
  } catch {
    return error('invalid JSON body', 400);
  }
  const validated = validateDemandSignal(body);
  if (!validated.ok) return error(validated.error, 400);
  try {
    await createDemandSignal(validated.value);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return error('demand capture is temporarily unavailable', 503);
  }
}

export async function GET(request: NextRequest) {
  const { response } = await requireOperatorAccess(request);
  if (response) return response;
  try {
    return NextResponse.json({ ok: true, windowDays: 30, summary: await readDemandSignals() });
  } catch {
    return error('demand summary is temporarily unavailable', 503);
  }
}
