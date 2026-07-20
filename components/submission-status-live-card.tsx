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

function normalizeStatusCapability(value?: string | null): string {
  return value?.match(/[a-f0-9]{32}/i)?.[0] || '';
}

function statusCapabilityStorageKey(submissionId: string) {
  return `looplocal:status-token:${submissionId}`;
}

function storedStatusCapability(submissionId: string): string {
  try {
    return sessionStorage.getItem(statusCapabilityStorageKey(submissionId)) || '';
  } catch {
    return '';
  }
}

function historyLabelFor(action?: string) {
  return {
    submitted: 'Submitted for review',
    needs_changes: 'Changes requested',
    approved_local: 'Approved only',
    resubmitted: 'Resubmitted for review',
    published_local: 'Published locally',
    updated: 'Updated by operator',
  }[action || ''] || 'Updated';
}

export function SubmissionStatusLiveCard({ submissionId, initialStatus }: SubmissionStatusLiveCardProps) {
  const [statusData, setStatusData] = useState<StatusApiPayload>(initialStatus);
  const [capabilityToken, setCapabilityToken] = useState('');
  const [capabilityReady, setCapabilityReady] = useState(false);
  const [lastChecked, setLastChecked] = useState<string>('Just now');
  const [refreshError, setRefreshError] = useState<string>('');

  const status = statusFor(statusData);
  const label = statusLabels[status] || status;
  const submission = statusData.submission || null;
  const published = statusData.published || null;
  const reviewerNote = submission?.reviewerNote;
  const statusHistory = submission?.statusHistory || published?.localSubmissionStatusHistory || [];
  // published-status-history-pass: published?.localSubmissionStatusHistory keeps Review timeline after publish.
  const submittedAt = submission?.submittedAt;
  const updatedAt = submission?.statusUpdatedAt || submission?.reviewerNoteUpdatedAt || submission?.publishedAt;

  const publishedHref = useMemo(() => published ? eventDetailPath(published) : '', [published]);

  useEffect(() => {
    const hashToken = normalizeStatusCapability(new URLSearchParams(window.location.hash.slice(1)).get('statusToken'));
    const nextToken = hashToken || normalizeStatusCapability(storedStatusCapability(submissionId));
    if (nextToken) {
      try {
        sessionStorage.setItem(statusCapabilityStorageKey(submissionId), nextToken);
      } catch {
        // The in-memory capability still works when session storage is unavailable.
      }
    }
    window.history.replaceState(null, '', window.location.pathname);
    const readyTimer = window.setTimeout(() => {
      setCapabilityToken(nextToken);
      setCapabilityReady(true);
    }, 0);
    return () => window.clearTimeout(readyTimer);
  }, [submissionId]);

  const refreshSubmissionStatus = useCallback(async function refreshSubmissionStatus() {
    try {
      // submitter-status-live-refresh-pass legacy marker: `/api/local-submissions/${encodeURIComponent(submissionId)}`.
      const url = `/api/local-submissions/${encodeURIComponent(submissionId)}`;
      const response = await fetch(url, {
        cache: 'no-store',
        headers: capabilityToken ? { 'x-loop-local-status-token': capabilityToken } : undefined,
      });
      const data = await response.json();
      if (!response.ok || !data.ok) throw new Error(data.error || 'Status refresh failed');
      setStatusData(data);
      setRefreshError('');
      setLastChecked(new Date().toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' }));
    } catch (error) {
      setRefreshError(error instanceof Error ? error.message : 'Status refresh failed');
    }
  }, [submissionId, capabilityToken]);

  useEffect(() => {
    if (!capabilityReady) return;
    const initialRefresh = window.setTimeout(() => void refreshSubmissionStatus(), 0);
    const interval = setInterval(() => {
      if (document.visibilityState === 'visible') void refreshSubmissionStatus();
    }, 5000);
    return () => {
      window.clearTimeout(initialRefresh);
      clearInterval(interval);
    };
  }, [capabilityReady, refreshSubmissionStatus]);

  if (!submission && !published) {
    return (
      <section className="ll-card post-flow-card post-wizard-stage-card submitter-status-live-refresh-pass" aria-live="polite">
        <p className="ll-kicker">Post Local status</p>
        <h1>Submission status</h1>
        <p>Submission ID: <code>{submissionId}</code></p>
        {refreshError ? <p role="alert" className="form-alert">{refreshError}</p> : <p>Loading secure submission status…</p>}
        <div className="ll-submit-actions"><Link href="/post-local">Back to Post Local</Link></div>
      </section>
    );
  }

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
      <section className="review-history-timeline-pass review-history-timeline" aria-label="Review timeline">
        <h2>Review timeline</h2>
        <ol>
          {(statusHistory.length ? statusHistory : [{ action: 'submitted', label: 'Submitted for review', at: submittedAt || updatedAt || '', note: undefined }]).map((entry, index) => (
            <li key={`${entry.action}-${entry.at || index}`}>
              <strong>{entry.label || historyLabelFor(entry.action)}</strong>
              <span>{entry.at ? dateLine(entry.at) : 'Time pending'}</span>
              {entry.note ? <small>{entry.note}</small> : null}
            </li>
          ))}
        </ol>
      </section>
      <div className="ll-submit-actions">
        <Link href="/post-local">Back to Post Local</Link>
        {status === 'needs_changes' ? <Link className="primary-action submitter-revision-flow-pass" href={`/post-local?revisionId=${encodeURIComponent(submissionId)}${capabilityToken ? `#statusToken=${encodeURIComponent(capabilityToken)}` : ''}`}>Revise submission</Link> : null}
        {published && publishedHref ? <Link className="primary-action" href={publishedHref}>View published event</Link> : null}
      </div>
    </section>
  );
}
