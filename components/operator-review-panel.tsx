'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { SessionNav } from '@/components/session-nav';
import type { LiveFeedItem } from '@/lib/live-feed';
import { supabase } from '@/lib/supabase/client';
import { submissionPublicationQuality } from '@/lib/local-submission-quality';
import { SUBMISSION_EVENT_CATEGORIES } from '@/lib/event-taxonomy';
import type { LocalSubmissionRecord } from '@/lib/local-submissions-store';
import type { DemandSummary } from '@/lib/unmet-demand';
import type { EventIntentSummary, EventLifecycleRecord } from '@/lib/event-engagement';

type ReviewQueueState = {
  pendingSubmissions: LocalSubmissionRecord[];
  publishedLocalEvents: LiveFeedItem[];
  taxonomyReviewItems: LiveFeedItem[];
};

function submitterStatusHref(submission: LocalSubmissionRecord) {
  const token = submission.statusToken ? `#statusToken=${encodeURIComponent(submission.statusToken)}` : '';
  return `/post-local/status/${encodeURIComponent(submission.id)}${token}`;
}

export function OperatorReviewPanel() {
  // operator-review-route-pass: /operator/reviews owns Review queue instead of consumer Profile.
  const [accessToken, setAccessToken] = useState('');
  const [isOperator, setIsOperator] = useState(false);
  const [queue, setQueue] = useState<ReviewQueueState>({ pendingSubmissions: [], publishedLocalEvents: [], taxonomyReviewItems: [] });
  const [status, setStatus] = useState('Checking your Supabase operator session…');
  const [reviewerNotes, setReviewerNotes] = useState<Record<string, string>>({});
  const [categoryDrafts, setCategoryDrafts] = useState<Record<string, string>>({});
  const [demandSummary, setDemandSummary] = useState<DemandSummary[]>([]);
  const [reconfirmationQueue, setReconfirmationQueue] = useState<LiveFeedItem[]>([]);
  const [correctionQueue, setCorrectionQueue] = useState<EventLifecycleRecord[]>([]);
  const [intentSummary, setIntentSummary] = useState<EventIntentSummary[]>([]);
  const [lifecycleNotes, setLifecycleNotes] = useState<Record<string, string>>({});

  const operatorHeaders: Record<string, string> = {
    'content-type': 'application/json',
    ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
  };

  useEffect(() => {
    async function refreshSession(token = '') {
      setAccessToken(token);
      const response = await fetch('/api/auth/operator-session', {
        cache: 'no-store',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await response.json();
      setIsOperator(Boolean(data.operator));
      if (data.operator) setStatus(`Verified operator${data.email ? ` · ${data.email}` : ''}. Load the review queue when ready.`);
      else if (data.authenticated) setStatus('This account is signed in but does not have the operator role.');
      else setStatus('Sign in with an operator account to continue.');
    }
    void supabase.auth.getSession().then(({ data }) => refreshSession(data.session?.access_token || ''));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      window.setTimeout(() => void refreshSession(session?.access_token || ''), 0);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function loadReviews() {
    const [reviewsResponse, demandResponse, lifecycleResponse] = await Promise.all([
      fetch('/api/local-submissions', { cache: 'no-store', headers: operatorHeaders }),
      fetch('/api/unmet-demand', { cache: 'no-store', headers: operatorHeaders }),
      fetch('/api/event-lifecycle', { cache: 'no-store', headers: operatorHeaders }),
    ]);
    const [reviewsData, demandData, lifecycleData] = await Promise.all([reviewsResponse.json(), demandResponse.json(), lifecycleResponse.json()]);
    if (!reviewsResponse.ok) {
      setStatus(reviewsData.error || 'Unable to load reviews');
      return;
    }
    setQueue({ pendingSubmissions: reviewsData.pendingSubmissions || [], publishedLocalEvents: reviewsData.publishedLocalEvents || [], taxonomyReviewItems: reviewsData.taxonomyReviewItems || [] });
    setDemandSummary(demandResponse.ok ? demandData.summary || [] : []);
    setReconfirmationQueue(lifecycleResponse.ok ? lifecycleData.reconfirmationQueue || [] : []);
    setCorrectionQueue(lifecycleResponse.ok ? lifecycleData.correctionQueue || [] : []);
    setIntentSummary(lifecycleResponse.ok ? lifecycleData.intentSummary || [] : []);
    setStatus(demandResponse.ok && lifecycleResponse.ok ? 'Review, demand, and event lifecycle queues loaded' : 'Review queue loaded; some supporting signals are unavailable');
  }

  async function updateLifecycle(eventKey: string, action: 'confirmed' | 'cancelled' | 'corrected') {
    const response = await fetch('/api/event-lifecycle', { method: 'PATCH', headers: operatorHeaders, body: JSON.stringify({ eventKey, action, note: lifecycleNotes[eventKey] || '' }) });
    const data = await response.json();
    if (!response.ok) { setStatus(data.error || 'Lifecycle update failed'); return; }
    setStatus(action === 'confirmed' ? 'Event reconfirmed' : action === 'cancelled' ? 'Event marked cancelled' : 'Correction recorded');
    await loadReviews();
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
        <nav aria-label="Operator navigation"><Link href="/">Discover</Link><Link href="/post-local">Post Local</Link><Link href="/account">Account</Link></nav>
        <SessionNav className="post-local-session-nav" />
      </header>
      <section className="ll-card post-flow-card operator-review-card">
        <p className="ll-kicker">Operator reviews</p>
        <h1>Review queue</h1>
        <p>Protected operator desk. Supabase verifies both the signed-in user and the assigned operator role.</p>
        {!isOperator ? <p><Link href="/account">Sign in or review your account</Link></p> : null}
        <div className="ll-submit-actions"><button type="button" disabled={!isOperator} onClick={loadReviews}>Load review queue</button><Link href="/post-local">Open Post Local</Link></div>
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
      <section className="pending-submissions-panel event-lifecycle-queue" aria-label="Event verification lifecycle">
        <header className="section-title-row"><div><h2>Event verification</h2><p>{reconfirmationQueue.length} due soon · {correctionQueue.length} attendee issue{correctionQueue.length === 1 ? '' : 's'}</p></div></header>
        <p className="taxonomy-review-intro">Reconfirm events in the 48 hours before they start. Attendee accuracy reports enter the same correction queue after an event ends.</p>
        <div className="event-lifecycle-grid">
          {reconfirmationQueue.map((item) => <article className="pending-submission-card" key={item.id}><span>Reconfirmation due</span><strong>{item.title}</strong><p>{[item.date, item.time, item.city].filter(Boolean).join(' · ')}</p><label className="reviewer-note-field"><span>Correction note</span><textarea value={lifecycleNotes[item.id] || ''} onChange={(event) => setLifecycleNotes((current) => ({ ...current, [item.id]: event.target.value }))} rows={2} /></label><div className="pending-submission-actions"><button type="button" onClick={() => updateLifecycle(item.id, 'confirmed')}>Still happening</button><button type="button" onClick={() => updateLifecycle(item.id, 'cancelled')}>Cancelled</button><button type="button" onClick={() => updateLifecycle(item.id, 'corrected')}>Record correction</button></div></article>)}
          {correctionQueue.map((record) => <article className="pending-submission-card lifecycle-correction-card" key={record.id}><span>Attendee issue</span><strong>{record.eventTitle}</strong><p>Reported {new Date(record.createdAt).toLocaleString()}</p><label className="reviewer-note-field"><span>Resolution note</span><textarea value={lifecycleNotes[record.eventKey] || ''} onChange={(event) => setLifecycleNotes((current) => ({ ...current, [record.eventKey]: event.target.value }))} rows={2} /></label><div className="pending-submission-actions"><button type="button" onClick={() => updateLifecycle(record.eventKey, 'confirmed')}>Listing was accurate</button><button type="button" onClick={() => updateLifecycle(record.eventKey, 'cancelled')}>Cancelled</button><button type="button" onClick={() => updateLifecycle(record.eventKey, 'corrected')}>Resolve with correction</button></div></article>)}
        </div>
        {!reconfirmationQueue.length && !correctionQueue.length ? <p className="pending-submission-empty">No event verifications need attention.</p> : null}
        {intentSummary.length ? <div className="unmet-demand-summary-grid event-intent-summary"><h3>Strong intent signals</h3>{intentSummary.slice(0, 12).map((item) => <article key={item.eventKey}><strong>{item.eventKey}</strong><p>{item.calendarAdds} calendar · {item.shares + item.copyLinks} shared/copied</p><span>Stronger than a page view</span></article>)}</div> : null}
      </section>
      <section className="pending-submissions-panel unmet-demand-summary-panel" aria-label="Demand signals">
        <header className="section-title-row"><div><h2>Demand signals</h2><p>{demandSummary.reduce((total, item) => total + item.count, 0)} requests from the last 30 days</p></div></header>
        <p className="taxonomy-review-intro">Aggregated category, broad area, and date requests. No account identity or precise location is stored.</p>
        {demandSummary.length ? (
          <div className="unmet-demand-summary-grid">
            {demandSummary.map((item) => <article key={`${item.category}-${item.area}-${item.dateWindow}`}><strong>{item.category}</strong><p>{item.area} · {item.dateWindow.replaceAll('_', ' ')}</p><span>{item.count} request{item.count === 1 ? '' : 's'} · {item.emptyCount} empty-result</span></article>)}
          </div>
        ) : <p className="pending-submission-empty">No demand signals loaded.</p>}
      </section>
    </main>
  );
}
