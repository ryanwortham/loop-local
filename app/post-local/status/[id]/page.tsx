import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { SubmissionStatusLiveCard } from '@/components/submission-status-live-card';

// submitter-status-page-pass: review status page for people who submitted through Post Local.
// submitter-status-live-refresh-pass: capability fragments hydrate through the no-store single-submission API.
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Submission status | Loop Local',
  referrer: 'no-referrer',
  robots: { index: false, follow: false },
};

type StatusPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ statusToken?: string }>;
};

export default async function PostLocalStatusPage({ params, searchParams }: StatusPageProps) {
  const { id } = await params;
  const { statusToken: legacyCapability } = await searchParams;
  if (/^[a-f0-9]{32}$/i.test(legacyCapability || '')) {
    redirect(`/post-local/status/${encodeURIComponent(id)}#statusToken=${encodeURIComponent(legacyCapability || '')}`);
  }

  return (
    <main className="post-local-shell complete-frontend-rebuild submitter-status-page-pass submitter-status-live-refresh-pass">
      <header className="ll-nav post-app-topbar post-local-command-center">
        <Link className="ll-brand" href="/">Loop Local</Link>
        <nav aria-label="Submission status navigation">
          <Link href="/post-local">Back to Post Local</Link>
          <Link href="/">Discover</Link>
        </nav>
      </header>

      <SubmissionStatusLiveCard initialStatus={{}} submissionId={id} />
      <p className="status-live-refresh-footnote">SubmissionStatusLiveCard auto-refreshes every few seconds using the single-submission status API.</p>
    </main>
  );
}
