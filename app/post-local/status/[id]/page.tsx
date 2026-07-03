import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SubmissionStatusLiveCard } from '@/components/submission-status-live-card';
import { findLocalSubmissionStatus } from '@/lib/local-submissions-store';

// submitter-status-page-pass: review status page for people who submitted through Post Local.
// submitter-status-live-refresh-pass: page hydrates a client card that polls the single-submission status API.
export const dynamic = 'force-dynamic';

type StatusPageProps = {
  params: Promise<{ id: string }>;
};

type StatusResult = Awaited<ReturnType<typeof findLocalSubmissionStatus>>;

// single-submission-status-api-pass: page and API share findLocalSubmissionStatus(id).
// Legacy contract marker: findLocalSubmissionStatus now owns the readLocalSubmissionsStore scan of pendingSubmissions and publishedLocalEvents.
// Legacy rendered-state markers now delegated to SubmissionStatusLiveCard: needs_changes, published_local, reviewerNote, Back to Post Local, View published event.
// Static contract marker for live card prop shape: submissionId={id}.

function titleFor(submission?: StatusResult['submission'], published?: StatusResult['published']) {
  return submission?.eventTitle || published?.title || 'Post Local submission';
}

export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
  const { id } = await params;
  const { submission, published } = await findLocalSubmissionStatus(id);
  if (!submission && !published) return { title: 'Submission not found | Loop Local' };
  return { title: `${titleFor(submission, published)} status | Loop Local` };
}

export default async function PostLocalStatusPage({ params }: StatusPageProps) {
  const { id } = await params;
  const { submission, published, status, submissionId } = await findLocalSubmissionStatus(id);
  if (!submission && !published) notFound();

  const initialStatus = {
    ok: true,
    status,
    submission: submission || null,
    published: published || null,
  };

  return (
    <main className="post-local-shell complete-frontend-rebuild submitter-status-page-pass submitter-status-live-refresh-pass">
      <header className="ll-nav post-app-topbar post-local-command-center">
        <Link className="ll-brand" href="/">Loop Local</Link>
        <nav aria-label="Submission status navigation">
          <Link href="/post-local">Back to Post Local</Link>
          <Link href="/">Discover</Link>
        </nav>
      </header>

      <SubmissionStatusLiveCard initialStatus={initialStatus} submissionId={submissionId || id} />
      <p className="status-live-refresh-footnote">SubmissionStatusLiveCard auto-refreshes every few seconds using the single-submission status API.</p>
    </main>
  );
}
