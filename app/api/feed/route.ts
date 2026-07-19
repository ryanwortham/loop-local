import { NextResponse } from 'next/server';

import { getLiveFeed } from '@/lib/live-feed-server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const feed = await getLiveFeed(160);
  const status = feed.health.status;

  return NextResponse.json(feed, {
    status: status === 'unavailable' ? 503 : 200,
    headers: {
      'cache-control': status === 'unavailable' ? 'no-store' : 'public, max-age=60, stale-while-revalidate=300',
      'x-loop-local-feed-status': status,
      'x-loop-local-feed-fetched-at': feed.health.fetchedAt || 'unavailable',
    },
  });
}
