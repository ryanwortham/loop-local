import 'server-only';

import {
  fetchFeedWithReliability,
  resolveFeedConfig,
  type FeedCache,
} from '@/lib/feed-reliability';
import { emptyLiveFeed, type LiveFeedResponse } from '@/lib/live-feed';

// stable-supabase-feed-pass: one process-local cache supports bounded stale fallback during transient outages.
const feedCache: FeedCache = {};

export async function getSupabaseFeed(limit = 24): Promise<LiveFeedResponse> {
  try {
    const config = resolveFeedConfig(process.env);
    return await fetchFeedWithReliability({ config, limit, cache: feedCache });
  } catch (error) {
    return {
      ...emptyLiveFeed,
      health: {
        ...emptyLiveFeed.health,
        message: error instanceof Error ? `Feed configuration error: ${error.message}` : 'Feed configuration error',
      },
    };
  }
}
