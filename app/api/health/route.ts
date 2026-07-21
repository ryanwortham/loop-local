import { NextResponse } from 'next/server';

import { getLiveFeed } from '@/lib/live-feed-server';
import { resolveLocalSubmissionsAdapter } from '@/lib/local-submissions/repository';
import { readLocalSubmissionsStore } from '@/lib/local-submissions-store';
import { buildOperationsHealthPayload } from '@/lib/operations-health';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [feed, store] = await Promise.all([
      getLiveFeed(160),
      readLocalSubmissionsStore(),
    ]);
    const payload = buildOperationsHealthPayload({
      feed,
      store,
      adapter: resolveLocalSubmissionsAdapter(),
    });

    return NextResponse.json(payload, {
      status: payload.status === 'down' ? 503 : 200,
      headers: {
        'cache-control': 'no-store',
        'x-loop-local-health': payload.status,
        'x-loop-local-feed-status': payload.feed.status,
      },
    });
  } catch (error) {
    return NextResponse.json({
      service: 'loop-local',
      status: 'down',
      checkedAt: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'health check failed',
    }, {
      status: 503,
      headers: {
        'cache-control': 'no-store',
        'x-loop-local-health': 'down',
      },
    });
  }
}
