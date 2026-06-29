import { AppShell } from '@/components/app-shell';
import { getLiveFeed } from '@/lib/live-feed';

export default async function Page() {
  const feed = await getLiveFeed(24);

  return <AppShell feedItems={feed.items} totalCount={feed.count} source={feed.source} />;
}
