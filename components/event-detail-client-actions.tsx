'use client';

import { useState } from 'react';
import { useSavedEvents } from '@/lib/use-saved-events';

type SavedShareActionsProps = {
  eventId: string;
  title: string;
  summary: string;
  url: string;
  calendarHref: string;
};

export function SavedShareActions({ eventId, title, summary, url, calendarHref }: SavedShareActionsProps) {
  const { isSavedEvent, toggleSavedEvent: persistSavedEvent, saveStatus } = useSavedEvents();
  const [shareStatus, setShareStatus] = useState('');

  const isSaved = isSavedEvent(eventId);

  function toggleSavedEvent() {
    void persistSavedEvent(eventId);
  }

  async function handleShareEvent() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: summary, url });
        setShareStatus('Shared event');
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus('Copied event link');
    } catch {
      setShareStatus('Share canceled');
    }
  }

  return (
    <>
      <div className="event-detail-sticky-cta-bar saved-share-interaction-pass" aria-label="Event actions">
        <button className={isSaved ? 'is-saved' : ''} type="button" onClick={toggleSavedEvent}>{isSaved ? 'Saved' : 'Save event'}</button>
        <button type="button" onClick={handleShareEvent}>Share event</button>
        <a href={calendarHref}>Add to calendar</a>
      </div>
      {shareStatus ? <p className="share-status" role="status">{shareStatus}</p> : null}
      {saveStatus ? <p className="share-status" role="status">{saveStatus}</p> : null}
    </>
  );
}
