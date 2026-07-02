'use client';

import { useEffect, useState } from 'react';

type SavedShareActionsProps = {
  eventId: string;
  title: string;
  summary: string;
  url: string;
  calendarHref: string;
};

export function SavedShareActions({ eventId, title, summary, url, calendarHref }: SavedShareActionsProps) {
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(localStorage.getItem('looplocal:saved-events') || '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    localStorage.setItem('looplocal:saved-events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  const isSaved = savedEventIds.includes(eventId);

  function toggleSavedEvent() {
    setSavedEventIds((current) => current.includes(eventId) ? current.filter((id) => id !== eventId) : [eventId, ...current]);
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
    </>
  );
}
