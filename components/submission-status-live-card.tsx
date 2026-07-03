'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { eventDetailPath, type LiveFeedItem } from '@/lib/live-feed';
import { type LocalSubmissionRecord } from '@/lib/local-submissions-store';

// submitter-status-live-refresh-pass: status page auto-refreshes from /api/local-submissions/[id].

type StatusApiPayload = {
  ok?: boolean;
  status?: string;
  submission?: LocalSubmissionRecord | null;
  published?: LiveFeedItem | null;
  error?: string;
};

type SubmissionStatusLiveCardProps = {
  submissionId: string;
  initialStatus: StatusApiPayload;
};

const statusLabels: Record<string, string> = {
  pending_review: 'Pending review',
  needs_changes: 'Needs changes',
  approved_local: 'Approved only',
  published_local: 'Published locally',
};

function titleFor(submission?: LocalSubmissionRecord | null, published?: LiveFeedItem | null) {
  return submission?.eventTitle || published?.title || 'Post Local submission';
}

function statusFor(payload: StatusApiPayload) {
  if (payload.published) return 'published_local';
  return payload.status || payload.submission?.status || 'pending_review';
}

function dateLine(value?: string) {
  return value ? new Date(value).toLocaleString() : '';
}

export function SubmissionStatusLiveCard({ submissionId, initialStatus }: SubmissionStatusLiveCardProps) {
  const [statusData, setStatusData] = useState<StatusApiPayload>(initialStatus);
  const [lastChecked, setLastChecked] = useState<string>('Just now');
  const [refreshError, setRefreshError] = useState<string>('');

  const status = statusFor(statusData);
  const label = statusLabels[status] || status;
  const submission = statusData.submission || null;
  const published = statusData.published || null;
  const reviewerNote = submission?.reviewerNote;
  const submittedAt = submission?.submittedAt;
  const updatedAt = submission?.statusUpdatedAt || submission?.reviewerNoteUpdatedAt || submission?.publishedAt;

  const publishedHref = useMemo(() => published ? eventDetailPath(published) : '', [published]);

  const refreshSubmissionStatus = useCallback(async function refreshSubmissionStatus() {
    try {
      const response = await fetch(`/api/local-submissions/${encodeURIComponent(submissionId)}`, { cache: 'no-store' });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Status refresh failed');
      setStatusData(data);
      setRefreshError('');
      setLastChecked(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Status refresh failed');
    }
  }, [submissionId]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void refreshSubmissionStatus();
    }, 5000);
    return () => clearInterval(interval);
  }, [refreshSubmissionStatus, submissionId]);

  return (
    <section className="ll-card post-flow-card post-wizard-stage-card submitter-status-live-refresh-pass" aria-live="polite">
      <p className="ll-kicker">Post Local status</p>
      <h1>{titleFor(submission, published)}</h1>
      <p>Submission ID: <code>{submissionId}</code></p>
      <div className="ll-pending-pill">{label}</div>
      <p className="status-live-refresh-meta">This page auto-refreshes every few seconds. Last checked: {lastChecked}</p>
      {refreshError ? <p role="alert" className="form-alert">{refreshError}</p> : null}
      <dl className="event-detail-quick-facts" aria-label="Submission status facts">
        <span><b>Status</b>{label}</span>
        <span><b>Submitted</b>{submittedAt ? dateLine(submittedAt) : 'Submission already published'}</span>
        <span><b>Last update</b>{updatedAt ? dateLine(updatedAt) : 'Awaiting reviewer action'}</span>
      </dl>
      {status === 'pending_review' ? <p>Your post is in the review queue. We’ll keep it unpublished until an operator approves it.</p> : null}
      {status === 'needs_changes' ? <p>Needs changes before publication. Review the note below, then update your post with the requested details.</p> : null}
      {status === 'published_local' ? <p>Your post is published locally and can now be opened from discovery.</p> : null}
      {reviewerNote ? <blockquote><strong>Reviewer note</strong><br />{reviewerNote}</blockquote> : null}
      <div className="ll-submit-actions">
        <Link href="/post-local">Back to Post Local</Link>
        {status === 'needs_changes' ? <Link className="primary-action submitter-revision-flow-pass" href={`/post-local?revisionId=${encodeURIComponent(submissionId)}`}>Revise submission</Link> : null}
        {published && publishedHref ? <Link className="primary-action" href={publishedHref}>View published event</Link> : null}
      </div>
    </section>
  );
}
