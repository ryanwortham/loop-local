'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LiveFeedItem } from '@/lib/live-feed';
import type { LocalSubmissionRecord } from '@/lib/local-submissions-store';

type ReviewQueueState = {
  pendingSubmissions: LocalSubmissionRecord[];
  publishedLocalEvents: LiveFeedItem[];
};

function submitterStatusHref(submission: LocalSubmissionRecord) {
  const token = submission.statusToken ? `?statusToken=${encodeURIComponent(submission.statusToken)}` : '';
  return `/post-local/status/${encodeURIComponent(submission.id)}${token}`;
}

export function OperatorReviewPanel() {
  // operator-review-route-pass: /operator/reviews owns Review queue instead of consumer Profile.
  const [operatorToken, setOperatorToken] = useState('');
  const [queue, setQueue] = useState<ReviewQueueState>({ pendingSubmissions: [], publishedLocalEvents: [] });
  const [status, setStatus] = useState('Enter the operator token to load reviews.');
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});

  const operatorHeaders = useMemo(() => ({
    'content-type': 'application/json',
    'x-loop-local-operator-token': operatorToken,
  }), [operatorToken]);

  async function loadReviews() {
    const response = await fetch('/api/local-submissions', { cache: 'no-store', headers: operatorHeaders });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || 'Unable to load reviews');
      return;
    }
    setQueue({ pendingSubmissions: data.pendingSubmissions || [], publishedLocalEvents: data.publishedLocalEvents || [] });
    setStatus('Review queue loaded');
  }

  async function mutateReview(body: Record<string, unknown>, nextStatus: string) {
    const response = await fetch('/api/local-submissions', { method: 'PATCH', headers: operatorHeaders, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || 'Review mutation failed');
      return;
    }
    setQueue({ pendingSubmissions: data.pendingSubmissions || [], publishedLocalEvents: data.publishedLocalEvents || [] });
    setStatus(nextStatus);
  }

  async function removeReview(id: string) {
    const response = await fetch(`/api/local-submissions?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: operatorHeaders });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || 'Remove failed');
      return;
    }
    setQueue({ pendingSubmissions: data.pendingSubmissions || [], publishedLocalEvents: data.publishedLocalEvents || [] });
    setStatus('Removed from review queue');
  }

  async function copySubmitterLink(submission: LocalSubmissionRecord) {
    const href = submitterStatusHref(submission);
    try {
      await navigator.clipboard.writeText(new URL(href, window.location.origin).toString());
      setStatus('Submitter link copied');
    } catch {
      setStatus(`Copy unavailable — send ${href}`);
    }
  }

  return (
    <main className="post-local-shell complete-frontend-rebuild operator-review-route-pass">
      <header className="ll-nav post-app-topbar post-local-command-center">
        <Link className="ll-brand" href="/">Loop Local</Link>
        <nav aria-label="Operator navigation"><Link href="/">Discover</Link><Link href="/post-local">Post Local</Link></nav>
      </header>
      <section className="ll-card post-flow-card operator-review-card">
        <p className="ll-kicker">Operator reviews</p>
        <h1>Review queue</h1>
        <p>Protected local operator desk for pending Post Local submissions.</p>
        <label className="ll-field"><span>Operator token</span><input value={operatorToken} onChange={(event) => setOperatorToken(event.target.value)} placeholder="LOOP_LOCAL_OPERATOR_TOKEN" type="password" /></label>
        <div className="ll-submit-actions"><button type="button" onClick={loadReviews}>Load review queue</button><Link href="/post-local">Open Post Local</Link></div>
        <p role="status" className="operator-export-status">{status}</p>
      </section>
      <section className="pending-submissions-panel post-submission-review-panel-pass" aria-label="Pending local submissions">
        <header className="section-title-row"><div><h2>Review queue</h2><p>{queue.pendingSubmissions.length} pending · {queue.publishedLocalEvents.length} published locally</p></div></header>
        {queue.pendingSubmissions.length ? (
          <div className="pending-submission-grid">
            {queue.pendingSubmissions.map((submission) => {
              const note = reviewerNotes[submission.id] ?? submission.reviewerNote ?? '';
              return <article className="pending-submission-card" key={submission.id}>
                <span>{submission.status || 'pending_review'}</span>
                <strong>{submission.eventTitle || 'Untitled local submission'}</strong>
                <p>{[submission.eventCategory, submission.eventDate, submission.locationName || submission.eventCity].filter(Boolean).join(' · ') || 'Details pending'}</p>
                <small>{submission.entityName || 'Local contributor'}</small>
                <label className="reviewer-note-field"><span>Reviewer note</span><textarea value={note} onChange={(event) => setReviewerNotes((current) => ({ ...current, [submission.id]: event.target.value }))} placeholder="Required before requesting changes" rows={2} /></label>
                <div className="operator-submitter-link-pass pending-submitter-link-row"><Link href={submitterStatusHref(submission)}>Open status page</Link><button type="button" onClick={() => copySubmitterLink(submission)}>Copy submitter link</button></div>
                <div className="pending-submission-actions"><button className="needs-changes-local" type="button" onClick={() => mutateReview({ id: submission.id, status: 'needs_changes', reviewerNote: note }, 'Requested changes')}>Needs changes</button><button className="approve-only-local" type="button" onClick={() => mutateReview({ id: submission.id, status: 'approved_local' }, 'Approved only')}>Approve only</button><button className="publish-local" type="button" onClick={() => mutateReview({ id: submission.id, action: 'publish' }, 'Published locally')}>Publish locally</button><button className="remove-local" type="button" onClick={() => removeReview(submission.id)}>Remove</button></div>
              </article>;
            })}
          </div>
        ) : <p className="pending-submission-empty">No pending submissions loaded.</p>}
      </section>
    </main>
  );
}
