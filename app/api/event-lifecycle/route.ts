import { NextRequest, NextResponse } from 'next/server';
import { requireOperatorAccess } from '@/lib/operator-auth';
import { publicSubmissionRateLimit } from '@/lib/public-submission-rate-limit';
import { cleanCorrectionNote, validateEventKey, validateLifecycleAction } from '@/lib/event-engagement';
import { readEventIntentSummary, readLifecycleQueue, readLifecycleStates, recordLifecycleAction } from '@/lib/event-engagement-repository';
import { getLiveFeed } from '@/lib/live-feed-server';
import type { LiveFeedItem } from '@/lib/live-feed';

export const dynamic = 'force-dynamic';

function error(message: string, status: number) { return NextResponse.json({ ok: false, error: message }, { status }); }
function eventEnd(item: LiveFeedItem): number {
  const explicit = Date.parse(item.endsAt || '');
  if (Number.isFinite(explicit)) return explicit;
  const start = Date.parse(item.startsAt || '');
  return Number.isFinite(start) ? start + 4 * 60 * 60 * 1000 : Number.POSITIVE_INFINITY;
}

async function canonicalEvent(eventKey: string) {
  const feed = await getLiveFeed(160, { includeCancelled: true });
  return feed.items.find((item) => item.id === eventKey) || null;
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return error('invalid JSON body', 400); }
  const eventKey = validateEventKey(body.eventKey);
  const action = validateLifecycleAction(body.action, 'attendee');
  if (!eventKey || !action || Object.keys(body).some((key) => !['eventKey', 'action'].includes(key))) return error('invalid event feedback', 400);
  try {
    const limited = await publicSubmissionRateLimit(request.headers, 'event_feedback');
    if (!limited.allowed) return error('too many feedback reports; try again later', 429);
    const event = await canonicalEvent(eventKey);
    if (!event) return error('event not found', 404);
    if (Date.now() < eventEnd(event)) return error('event feedback opens after the event', 409);
    await recordLifecycleAction({ eventKey, eventTitle: event.title, action, reporterType: 'attendee' });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch {
    return error('event feedback is temporarily unavailable', 503);
  }
}

export async function PATCH(request: NextRequest) {
  const { response } = await requireOperatorAccess(request);
  if (response) return response;
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return error('invalid JSON body', 400); }
  const eventKey = validateEventKey(body.eventKey);
  const action = validateLifecycleAction(body.action, 'operator');
  const note = cleanCorrectionNote(body.note);
  if (!eventKey || !action || Object.keys(body).some((key) => !['eventKey', 'action', 'note'].includes(key))) return error('invalid lifecycle update', 400);
  if (action === 'corrected' && !note) return error('a correction note is required', 400);
  try {
    const event = await canonicalEvent(eventKey);
    if (!event) return error('event not found', 404);
    await recordLifecycleAction({ eventKey, eventTitle: event.title, action, reporterType: 'operator', note });
    return NextResponse.json({ ok: true });
  } catch { return error('lifecycle update is temporarily unavailable', 503); }
}

export async function GET(request: NextRequest) {
  const { response } = await requireOperatorAccess(request);
  if (response) return response;
  try {
    const [feed, states, correctionQueue, intentSummary] = await Promise.all([getLiveFeed(160, { includeCancelled: true }), readLifecycleStates(), readLifecycleQueue(), readEventIntentSummary()]);
    const stateByEvent = new Map(states.map((state) => [state.eventKey, state]));
    const now = Date.now();
    const reconfirmationQueue = feed.items.filter((item) => {
      const starts = Date.parse(item.startsAt || '');
      if (!Number.isFinite(starts) || starts < now || starts > now + 48 * 60 * 60 * 1000) return false;
      const state = stateByEvent.get(item.id);
      if (state?.action === 'cancelled') return false;
      return !state || Date.parse(state.lastVerifiedAt) < now - 72 * 60 * 60 * 1000;
    });
    return NextResponse.json({ ok: true, reconfirmationQueue, correctionQueue, intentSummary, states });
  } catch { return error('event lifecycle queue is temporarily unavailable', 503); }
}
