import { NextResponse } from 'next/server';
import { emptyLiveFeed, referenceFeedBaseUrl, type LiveFeedResponse } from '@/lib/live-feed';

export const revalidate = 60;

export async function GET() {
  try {
    const response = await fetch(new URL('/api/feed', referenceFeedBaseUrl), {
      next: { revalidate: 60 },
      headers: { accept: 'application/json' },
    });

    if (!response.ok) {
      return NextResponse.json({ ...emptyLiveFeed, upstreamStatus: response.status }, { status: 502 });
    }

    const data = (await response.json()) as LiveFeedResponse;

    return NextResponse.json({
      project: data.project || 'looplocal.com',
      source: data.source || 'live_supabase',
      count: Number(data.count || data.items?.length || 0),
      items: Array.isArray(data.items) ? data.items : [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        ...emptyLiveFeed,
        error: error instanceof Error ? error.message : 'Unable to load live feed',
      },
      { status: 502 },
    );
  }
}
