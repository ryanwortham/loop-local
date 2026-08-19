'use client';

import { useEffect, useState } from 'react';
import { useSavedEvents } from '@/lib/use-saved-events';

type SavedShareActionsProps = {
  eventId: string;
  title: string;
  summary: string;
  url: string;
  calendarHref: string;
  eventEndsAt: string;
  lifecycleStatus?: 'confirmed' | 'cancelled' | 'corrected';
  lastVerifiedAt?: string;
};

export function SavedShareActions({ eventId, title, summary, url, calendarHref, eventEndsAt, lifecycleStatus, lastVerifiedAt }: SavedShareActionsProps) {
  const { isSavedEvent, toggleSavedEvent: persistSavedEvent, saveStatus } = useSavedEvents();
  const [shareStatus, setShareStatus] = useState('');
  const [feedbackStatus, setFeedbackStatus] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setFeedbackOpen(new Date(eventEndsAt).getTime() <= new Date().getTime()), 0);
    return () => window.clearTimeout(timer);
  }, [eventEndsAt]);

  const isSaved = isSavedEvent(eventId);

  function toggleSavedEvent() {
    void persistSavedEvent(eventId);
  }

  function trackIntent(action: 'calendar_add' | 'share' | 'copy_link') {
    void fetch('/api/event-actions', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventKey: eventId, action }) });
  }

  async function handleShareEvent() {
    const cleanUrl = new URL(url, window.location.origin).toString();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: summary, url: cleanUrl });
        trackIntent('share');
        setShareStatus('Shared event');
        return;
      }
      await navigator.clipboard.writeText(cleanUrl);
      trackIntent('copy_link');
      setShareStatus('Copied event link');
    } catch {
      setShareStatus('Share canceled');
    }
  }

  async function sendAccuracy(action: 'accurate' | 'inaccurate') {
    setFeedbackStatus('Sending…');
    try {
      const response = await fetch('/api/event-lifecycle', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ eventKey: eventId, action }) });
      const data = await response.json();
      setFeedbackStatus(response.ok ? 'Thanks — your report helps keep Loop Local accurate.' : data.error || 'Unable to send feedback.');
    } catch { setFeedbackStatus('Unable to send feedback.'); }
  }

  return (
    <>
      <div className="event-detail-sticky-cta-bar saved-share-interaction-pass" aria-label="Event actions">
        <button className={isSaved ? 'is-saved' : ''} type="button" onClick={toggleSavedEvent}>{isSaved ? 'Saved' : 'Save event'}</button>
        <button type="button" onClick={handleShareEvent}>Share event</button>
        <a download={`${title.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').toLowerCase() || 'event'}.ics`} href={calendarHref} onClick={() => trackIntent('calendar_add')}>Add to calendar</a>
      </div>
      {lifecycleStatus ? <p className={`event-lifecycle-status lifecycle-${lifecycleStatus}`}>{lifecycleStatus === 'cancelled' ? 'Cancelled — check the source before making plans.' : lifecycleStatus === 'confirmed' ? 'Confirmed by an operator.' : 'Listing corrected by an operator.'}{lastVerifiedAt ? ` Last verified ${new Date(lastVerifiedAt).toLocaleDateString()}.` : ''}</p> : null}
      {feedbackOpen ? <section className="event-accuracy-prompt" aria-label="Event accuracy feedback"><strong>Was this listing accurate?</strong><div><button type="button" onClick={() => sendAccuracy('accurate')}>Yes</button><button type="button" onClick={() => sendAccuracy('inaccurate')}>Report an issue</button></div>{feedbackStatus ? <p role="status">{feedbackStatus}</p> : null}</section> : null}
      {shareStatus ? <p className="share-status" role="status">{shareStatus}</p> : null}
      {saveStatus ? <p className="share-status" role="status">{saveStatus}</p> : null}
    </>
  );
}
