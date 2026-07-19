'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import type { LiveFeedItem } from '@/lib/live-feed';
import { submissionPublicationQuality } from '@/lib/local-submission-quality';
import { SUBMISSION_EVENT_CATEGORIES } from '@/lib/event-taxonomy';
import type { LocalSubmissionRecord } from '@/lib/local-submissions-store';

type ReviewQueueState = {
  pendingSubmissions: LocalSubmissionRecord[];
  publishedLocalEvents: LiveFeedItem[];
  taxonomyReviewItems: LiveFeedItem[];
};

function submitterStatusHref(submission: LocalSubmissionRecord) {
  const token = submission.statusToken ? `?statusToken=${encodeURIComponent(submission.statusToken)}` : '';
  return `/post-local/status/${encodeURIComponent(submission.id)}${token}`;
}

export function OperatorReviewPanel() {
  // operator-review-route-pass: /operator/reviews owns Review queue instead of consumer Profile.
  const [operatorToken, setOperatorToken] = useState('');
  const [queue, setQueue] = useState<ReviewQueueState>({ pendingSubmissions: [], publishedLocalEvents: [], taxonomyReviewItems: [] });
  const [status, setStatus] = useState('Enter the operator token to load reviews.');
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});

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
    setQueue({ pendingSubmissions: data.pendingSubmissions || [], publishedLocalEvents: data.publishedLocalEvents || [], taxonomyReviewItems: data.taxonomyReviewItems || [] });
    setStatus('Review queue loaded');
  }

  async function mutateReview(body: Record<string, unknown>, nextStatus: string) {
    const response = await fetch('/api/local-submissions', { method: 'PATCH', headers: operatorHeaders, body: JSON.stringify(body) });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || 'Review mutation failed');
      return false;
    }
    setQueue((current) => ({ pendingSubmissions: data.pendingSubmissions || [], publishedLocalEvents: data.publishedLocalEvents || [], taxonomyReviewItems: data.taxonomyReviewItems || current.taxonomyReviewItems }));
    setStatus(nextStatus);
    return true;
  }

  async function removeReview(id: string) {
    const response = await fetch(`/api/local-submissions?id=${encodeURIComponent(id)}`, { method: 'DELETE', headers: operatorHeaders });
    const data = await response.json();
    if (!response.ok) {
      setStatus(data.error || 'Remove failed');
      return;
    }
    setQueue((current) => ({ pendingSubmissions: data.pendingSubmissions || [], publishedLocalEvents: data.publishedLocalEvents || [], taxonomyReviewItems: data.taxonomyReviewItems || current.taxonomyReviewItems }));
    setStatus('Removed from review queue');
  }

  async function updateEventCategory(item: LiveFeedItem, restoreSource = false) {
    const eventCategory = categoryDrafts[item.id] || item.category || 'Community';
    const updated = await mutateReview(
      { id: item.id, action: 'set_category_override', ...(restoreSource ? {} : { eventCategory }) },
      restoreSource ? 'Source category restored' : `Category updated to ${eventCategory}`,
    );
    if (updated) setCategoryDrafts((current) => {
      const next = { ...current };
      delete next[item.id];
      return next;
    });
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
              const quality = submissionPublicationQuality(submission);
              return <article className="pending-submission-card" key={submission.id}>
                <span>{submission.status || 'pending_review'}</span>
                <strong>{submission.eventTitle || 'Untitled local submission'}</strong>
                <p>{[submission.eventCategory, submission.eventDate, submission.locationName || submission.eventCity].filter(Boolean).join(' · ') || 'Details pending'}</p>
                <small>{submission.entityName || 'Local contributor'}</small>
                <div className="operator-quality-summary">
                  <div className="operator-quality-preview"><Image alt={`${quality.mediaLabel} preview`} src={quality.previewImageUrl} fill sizes="88px" unoptimized /></div>
                  <div><strong>{quality.mediaLabel}</strong><p>{quality.canPublish ? 'Required event details complete' : `Missing ${quality.missingFields.join(', ')}`}</p></div>
                </div>
                <label className="reviewer-note-field"><span>Reviewer note</span><textarea value={note} onChange={(event) => setReviewerNotes((current) => ({ ...current, [submission.id]: event.target.value }))} placeholder="Required before requesting changes" rows={2} /></label>
                <div className="operator-submitter-link-pass pending-submitter-link-row"><Link href={submitterStatusHref(submission)}>Open status page</Link><button type="button" onClick={() => copySubmitterLink(submission)}>Copy submitter link</button></div>
                <div className="pending-submission-actions"><button className="needs-changes-local" type="button" onClick={() => mutateReview({ id: submission.id, status: 'needs_changes', reviewerNote: note }, 'Requested changes')}>Needs changes</button><button className="approve-only-local" type="button" onClick={() => mutateReview({ id: submission.id, status: 'approved_local' }, 'Approved only')}>Approve only</button><button className="publish-local" type="button" disabled={!quality.canPublish} title={quality.canPublish ? quality.mediaLabel : `Missing ${quality.missingFields.join(', ')}`} onClick={() => mutateReview({ id: submission.id, action: 'publish' }, 'Published locally')}>{!quality.canPublish ? 'Complete required fields' : quality.mediaMode === 'bundled' ? 'Publish with fallback art' : 'Publish locally'}</button><button className="remove-local" type="button" onClick={() => removeReview(submission.id)}>Remove</button></div>
              </article>;
            })}
          </div>
        ) : <p className="pending-submission-empty">No pending submissions loaded.</p>}
      </section>
      <section className="pending-submissions-panel taxonomy-review-panel" aria-label="Event taxonomy review">
        <header className="section-title-row"><div><h2>Taxonomy review</h2><p>{queue.taxonomyReviewItems.length} generic or explicitly corrected events</p></div></header>
        <p className="taxonomy-review-intro">Review exact events before changing their display category. Loop Local never infers these corrections from titles or descriptions.</p>
        {queue.taxonomyReviewItems.length ? (
          <div className="taxonomy-review-grid">
            {queue.taxonomyReviewItems.map((item) => {
              const sourceCategory = item.sourceCategory || item.category || 'Local';
              const selectedCategory = categoryDrafts[item.id] || item.category || 'Community';
              const preview = item.image_url || item.fallbackImageUrl || '/looplocal-event-placeholder.jpg';
              return <article className="taxonomy-review-card" key={item.id}>
                <div className="taxonomy-review-preview"><Image alt="" src={preview} fill sizes="96px" unoptimized /></div>
                <div className="taxonomy-review-content">
                  <div className="taxonomy-review-heading"><strong>{item.title}</strong>{item.categoryOverrideApplied ? <span>Reviewed correction</span> : <span>Needs review</span>}</div>
                  <p>Source: {sourceCategory} · Display: {item.category || 'Local'}</p>
                  <label><span>Reviewed category</span><select aria-label={`Reviewed category for ${item.title}`} value={selectedCategory} onChange={(event) => setCategoryDrafts((current) => ({ ...current, [item.id]: event.target.value }))}>{SUBMISSION_EVENT_CATEGORIES.map((category) => <option value={category} key={category}>{category}</option>)}</select></label>
                  <div className="taxonomy-review-actions"><button type="button" onClick={() => updateEventCategory(item)}>Save category</button>{item.categoryOverrideApplied ? <button className="taxonomy-restore-source" type="button" onClick={() => updateEventCategory(item, true)}>Restore source</button> : null}</div>
                </div>
              </article>;
            })}
          </div>
        ) : <p className="pending-submission-empty">No taxonomy reviews loaded.</p>}
      </section>
    </main>
  );
}
