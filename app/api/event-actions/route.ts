import { NextRequest, NextResponse } from 'next/server';
import { publicSubmissionRateLimit } from '@/lib/public-submission-rate-limit';
import { recordEventIntent } from '@/lib/event-engagement-repository';
import { validateEventKey, validateIntentAction } from '@/lib/event-engagement';
import { getLiveFeed } from '@/lib/live-feed-server';

export const dynamic = 'force-dynamic';

function error(message: string, status: number) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return error('invalid JSON body', 400); }
  const eventKey = validateEventKey(body.eventKey);
  const action = validateIntentAction(body.action);
  if (!eventKey || !action || Object.keys(body).some((key) => !['eventKey', 'action'].includes(key))) return error('invalid event action', 400);
  try {
    const limited = await publicSubmissionRateLimit(request.headers, 'event_intent');
    if (!limited.allowed) return error('too many event actions; try again later', 429);
    const feed = await getLiveFeed(160, { includeCancelled: true });
    if (!feed.items.some((item) => item.id === eventKey)) return error('event not found', 404);
    await recordEventIntent(eventKey, action);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return error('event action tracking is temporarily unavailable', 503);
  }
}
