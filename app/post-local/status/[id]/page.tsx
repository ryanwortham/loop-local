import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { eventDetailPath, eventSlug, type LiveFeedItem } from '@/lib/live-feed';
import { readLocalSubmissionsStore, type LocalSubmissionRecord } from '@/lib/local-submissions-store';

// submitter-status-page-pass: review status page for people who submitted through Post Local.
export const dynamic = 'force-dynamic';

type StatusPageProps = {
  params: Promise<{ id: string }>;
};

type StatusResult = {
  submission?: LocalSubmissionRecord;
  published?: LiveFeedItem;
};

const statusLabels: Record<string, string> = {
  pending_review: 'Pending review',
  needs_changes: 'Needs changes',
  approved_local: 'Approved only',
  published_local: 'Published locally',
};

function titleFor(submission?: LocalSubmissionRecord, published?: LiveFeedItem) {
  return submission?.eventTitle || published?.title || 'Post Local submission';
}

function statusFor(submission?: LocalSubmissionRecord, published?: LiveFeedItem) {
  if (published) return 'published_local';
  return submission?.status || 'pending_review';
}

function publishedMatchesId(item: LiveFeedItem, id: string) {
  return item.id === id || item.id === `local-approved-${id}` || eventSlug(item).endsWith(id);
}

async function findSubmissionStatus(id: string): Promise<StatusResult> {
  const store = await readLocalSubmissionsStore();
  const submission = store.pendingSubmissions.find((item) => item.id === id);
  const published = store.publishedLocalEvents.find((item) => publishedMatchesId(item, id));
  return { submission, published };
}

export async function generateMetadata({ params }: StatusPageProps): Promise<Metadata> {
  const { id } = await params;
  const { submission, published } = await findSubmissionStatus(id);
  if (!submission && !published) return { title: 'Submission not found | Loop Local' };
  return { title: `${titleFor(submission, published)} status | Loop Local` };
}

export default async function PostLocalStatusPage({ params }: StatusPageProps) {
  const { id } = await params;
  const { submission, published } = await findSubmissionStatus(id);
  if (!submission && !published) notFound();

  const status = statusFor(submission, published);
  const label = statusLabels[status] || status;
  const reviewerNote = submission?.reviewerNote;
  const submittedAt = submission?.submittedAt;
  const updatedAt = submission?.statusUpdatedAt || submission?.reviewerNoteUpdatedAt || submission?.publishedAt;

  return (
    <main className="post-local-shell complete-frontend-rebuild submitter-status-page-pass">
      <header className="ll-nav post-app-topbar post-local-command-center">
        <Link className="ll-brand" href="/">Loop Local</Link>
        <nav aria-label="Submission status navigation">
          <Link href="/post-local">Back to Post Local</Link>
          <Link href="/">Discover</Link>
        </nav>
      </header>

      <section className="ll-card post-flow-card post-wizard-stage-card">
        <p className="ll-kicker">Post Local status</p>
        <h1>{titleFor(submission, published)}</h1>
        <p>Submission ID: <code>{id}</code></p>
        <div className="ll-pending-pill">{label}</div>
        <dl className="event-detail-quick-facts" aria-label="Submission status facts">
          <span><b>Status</b>{label}</span>
          <span><b>Submitted</b>{submittedAt ? new Date(submittedAt).toLocaleString() : 'Submission already published'}</span>
          <span><b>Last update</b>{updatedAt ? new Date(updatedAt).toLocaleString() : 'Awaiting reviewer action'}</span>
        </dl>
        {status === 'pending_review' ? <p>Your post is in the review queue. We’ll keep it unpublished until an operator approves it.</p> : null}
        {status === 'needs_changes' ? <p>Needs changes before publication. Review the note below, then update your post with the requested details.</p> : null}
        {status === 'published_local' ? <p>Your post is published locally and can now be opened from discovery.</p> : null}
        {reviewerNote ? <blockquote><strong>Reviewer note</strong><br />{reviewerNote}</blockquote> : null}
        <div className="ll-submit-actions">
          <Link href="/post-local">Back to Post Local</Link>
          {published ? <Link className="primary-action" href={eventDetailPath(published)}>View published event</Link> : null}
        </div>
      </section>
    </main>
  );
}
