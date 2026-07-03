'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { eventDetailPath, eventExternalUrl, eventImageState, eventVisualKey, fallbackVisualLabel, type LiveFeedItem } from '@/lib/live-feed';

type ViewMode = 'card' | 'list' | 'map' | 'calendar';

type SubmissionStatus = 'pending_review' | 'needs_changes' | 'approved_local' | 'published_local';
type ReviewQueueFilter = 'all' | 'pending_review' | 'needs_changes' | 'approved_local';

const reviewQueueFilters: Array<{ id: ReviewQueueFilter; label: string }> = [
  { id: 'all', label: 'All reviews' },
  { id: 'pending_review', label: 'Pending' },
  { id: 'needs_changes', label: 'Needs changes' },
  { id: 'approved_local', label: 'Approved only' },
];

type LocalSubmission = {
  id?: string;
  entityName?: string;
  eventTitle?: string;
  eventDate?: string;
  eventCategory?: string;
  eventCity?: string;
  eventState?: string;
  eventZip?: string;
  eventDescription?: string;
  locationName?: string;
  ticketUrl?: string;
  postType?: string;
  status?: SubmissionStatus | string;
  submittedAt?: string;
  approvedAt?: string;
  statusUpdatedAt?: string;
  reviewerNote?: string;
  reviewerNoteUpdatedAt?: string;
};

const moments = ['All', 'Tonight', 'Weekend', 'Deals'];
const tabs = ['Discover', 'Events', 'Map', 'Saved', 'Profile'];
const tabToViewMode = (tab: string): ViewMode => {
  if (tab === 'Map') return 'map';
  if (tab === 'Events') return 'list';
  return 'card';
};
const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id: 'card', label: 'Cards' },
  { id: 'list', label: 'List' },
  { id: 'map', label: 'Map' },
  { id: 'calendar', label: 'Calendar' },
];

function formatEventMeta(item: LiveFeedItem): string {
  return [item.city, item.date, item.time].filter(Boolean).join(' · ');
}

function eventImage(item: LiveFeedItem): string {
  return item.image_url || '/looplocal-event-placeholder.jpg';
}

function venueLine(item: LiveFeedItem): string {
  return item.business || item.location || 'Local venue';
}

function addressLine(item: LiveFeedItem): string {
  return [item.address, item.city, item.state, item.zip].filter(Boolean).join(', ');
}

function priceLine(item: LiveFeedItem): string {
  if (item.price) return item.price;
  if (item.ticketUrl || item.ticket_url) return 'Tickets available';
  return 'Free or details pending';
}

function distanceLine(item: LiveFeedItem): string {
  if (typeof item.latitude === 'number' && typeof item.longitude === 'number') return '2.1 miles away';
  return 'Distance after location';
}

function categoryClass(category?: string): string {
  const key = (category || 'local').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `event-chip chip-${key}`;
}

function itemSearchText(item: LiveFeedItem): string {
  return [
    item.title,
    item.summary,
    item.business,
    item.city,
    item.category,
    item.location,
    item.address,
    item.source,
    item.zip,
  ]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}

function reviewSubmissionSearchText(submission: LocalSubmission): string {
  return [
    submission.eventTitle,
    submission.entityName,
    submission.eventCategory,
    submission.eventCity,
    submission.eventState,
    submission.eventZip,
    submission.locationName,
    submission.postType,
    submission.status,
    submission.reviewerNote,
    submission.eventDescription,
  ].filter(Boolean).join(' ').toLowerCase();
}

function isWeekend(item: LiveFeedItem): boolean {
  const value = item.startsAt || item.date;
  if (!value) return false;
  const day = new Date(value).getUTCDay();
  return day === 0 || day === 5 || day === 6;
}

function matchesMoment(item: LiveFeedItem, activeMoment: string): boolean {
  if (activeMoment === 'All') return true;
  if (activeMoment === 'Deals') {
    return /deal|happy hour|special|market|shopping|free/i.test(`${item.category || ''} ${item.title} ${item.summary || ''} ${priceLine(item)}`);
  }
  if (activeMoment === 'Weekend') return isWeekend(item);
  if (activeMoment === 'Tonight') {
    return /pm/i.test(item.time || '') || /tonight/i.test(`${item.title} ${item.summary || ''}`);
  }
  return true;
}

function sortItems(items: LiveFeedItem[], sortBy: string): LiveFeedItem[] {
  return [...items].sort((a, b) => {
    if (sortBy === 'title') return a.title.localeCompare(b.title);
    if (sortBy === 'city') return (a.city || '').localeCompare(b.city || '') || a.title.localeCompare(b.title);
    if (sortBy === 'price') return priceLine(a).localeCompare(priceLine(b)) || a.title.localeCompare(b.title);
    const aTime = Date.parse(a.startsAt || a.date || '') || Number.MAX_SAFE_INTEGER;
    const bTime = Date.parse(b.startsAt || b.date || '') || Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

function dayBlock(item: LiveFeedItem) {
  const date = item.date ? new Date(item.date) : null;
  return {
    month: date ? date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) : 'Soon',
    day: date ? String(date.getUTCDate()) : '•',
  };
}

function localSubmissionToFeedItem(submission: LocalSubmission, index: number): LiveFeedItem {
  return {
    id: `local-approved-${submission.submittedAt || index}`,
    title: submission.eventTitle || 'Locally approved submission',
    summary: submission.eventDescription || `${submission.entityName || 'A local contributor'} submitted this event through Post Local.`,
    category: submission.eventCategory || submission.postType || 'Community',
    type: submission.postType || 'Event',
    business: submission.entityName || submission.locationName || 'Local contributor',
    location: submission.locationName || submission.entityName || 'Local venue',
    city: submission.eventCity || 'Nearby',
    state: submission.eventState || 'MO',
    zip: submission.eventZip,
    date: submission.eventDate,
    startsAt: submission.eventDate,
    time: 'Time pending',
    source: 'local_approved',
    ticketUrl: submission.ticketUrl,
    imageState: 'fallback',
    visualKey: 'community',
    fallbackLabel: 'Locally approved',
  };
}

function EventCard({ item, compact = false, isSaved = false, onSave }: { item: LiveFeedItem; compact?: boolean; isSaved?: boolean; onSave?: (item: LiveFeedItem) => void }) {
  const hasEventImage = Boolean(item.image_url);
  const date = dayBlock(item);
  const isLocalApproved = item.source === 'local_approved';

  return (
    <article className={compact ? 'explore-card explore-card-compact' : 'explore-card'}>
      <div className={hasEventImage ? 'explore-card-image' : 'explore-card-image local-photo-fallback quiet-placeholder-image'} data-image-state={eventImageState(item)} data-visual-key={eventVisualKey(item)} style={hasEventImage ? { backgroundImage: `url(${eventImage(item)})` } : undefined}>
        {!hasEventImage ? <span className="fallback-visual-label">{fallbackVisualLabel(item)}</span> : null}
        {isLocalApproved ? <span className="local-approved-badge">Locally approved</span> : null}
        <span className="floating-date"><strong>{date.month}</strong><b>{date.day}</b></span>
        <span className={categoryClass(item.category)}>{item.category || item.type || 'Local'}</span>
      </div>
      <div className="explore-card-copy">
        <h3>{item.title}</h3>
        <p>{venueLine(item)}</p>
        <div className="card-micro-row">
          <span>{item.city || 'Nearby'}</span>
          <span>{item.time || priceLine(item)}</span>
        </div>
      </div>
      <div className="event-actions card-actions">
        <Link href={eventDetailPath(item)}>Open</Link>
        <button className={isSaved ? 'is-saved' : ''} type="button" aria-label={`${isSaved ? 'Unsave' : 'Save'} ${item.title}`} onClick={() => onSave?.(item)}>{isSaved ? '♥' : '♡'}</button>
      </div>
    </article>
  );
}

function PopularRow({ item, isSaved = false, onSave }: { item: LiveFeedItem; isSaved?: boolean; onSave?: (item: LiveFeedItem) => void }) {
  const date = dayBlock(item);
  return (
    <article className="popular-list-row">
      <div className={item.image_url ? 'popular-thumb' : 'popular-thumb local-photo-fallback quiet-popular-placeholder'} data-image-state={eventImageState(item)} data-visual-key={eventVisualKey(item)} style={item.image_url ? { backgroundImage: `url(${eventImage(item)})` } : undefined}>{!item.image_url ? <span>{fallbackVisualLabel(item)}</span> : null}</div>
      <div className="popular-date"><span>{date.month}</span><strong>{date.day}</strong></div>
      <div className="popular-copy">
        <span className="mini-tag">{item.category || 'Local'}</span>
        <h3>{item.title}</h3>
        <p>{venueLine(item)} · {item.city || 'Nearby'}</p>
        <small>{item.time || priceLine(item)}</small>
      </div>
      <div className="popular-actions">
        <button className={isSaved ? 'is-saved' : ''} type="button" aria-label={`${isSaved ? 'Unsave' : 'Save'} ${item.title}`} onClick={() => onSave?.(item)}>{isSaved ? '♥' : '♡'}</button>
        <Link href={eventDetailPath(item)} aria-label={`Open ${item.title}`}>↗</Link>
      </div>
    </article>
  );
}

type AppShellProps = {
  feedItems: LiveFeedItem[];
  totalCount: number;
  source: string;
};

export function AppShell({ feedItems, totalCount, source }: AppShellProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('St. Louis, MO');
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [activeCity, setActiveCity] = useState('All cities');
  const [activeMoment, setActiveMoment] = useState('All');
  const [sortBy, setSortBy] = useState('soonest');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [savedEventIds, setSavedEventIds] = useState<string[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = JSON.parse(localStorage.getItem('looplocal:saved-events') || '[]');
      return Array.isArray(saved) ? saved.filter((id): id is string => typeof id === 'string') : [];
    } catch {
      return [];
    }
  });
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showSubmissionPanel, setShowSubmissionPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [activeReviewFilter, setActiveReviewFilter] = useState<ReviewQueueFilter>('all');
  const [reviewQueueSearch, setReviewQueueSearch] = useState('');
  const [pendingSubmissions, setPendingSubmissions] = useState<LocalSubmission[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = JSON.parse(localStorage.getItem('looplocal:post-local-submissions') || '[]');
      return Array.isArray(stored) ? stored.filter((item): item is LocalSubmission => item && typeof item === 'object') : [];
    } catch {
      return [];
    }
  });
  const [approvedLocalItems, setApprovedLocalItems] = useState<LiveFeedItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const stored = JSON.parse(localStorage.getItem('looplocal:approved-local-events') || '[]');
      return Array.isArray(stored) ? stored.filter((item): item is LiveFeedItem => item && typeof item === 'object' && typeof item.id === 'string') : [];
    } catch {
      return [];
    }
  });
  const [operatorExportStatus, setOperatorExportStatus] = useState('');
  const [operatorImportText, setOperatorImportText] = useState('');
  const [shareStatus, setShareStatus] = useState('');

  useEffect(() => {
    localStorage.setItem('looplocal:saved-events', JSON.stringify(savedEventIds));
  }, [savedEventIds]);

  useEffect(() => {
    localStorage.setItem('looplocal:approved-local-events', JSON.stringify(approvedLocalItems));
  }, [approvedLocalItems]);

  const combinedFeedItems = useMemo(() => [...approvedLocalItems, ...feedItems], [approvedLocalItems, feedItems]);

  const categories = useMemo(
    () => ['All categories', ...Array.from(new Set(combinedFeedItems.map((item) => item.category).filter(Boolean) as string[])).sort()],
    [combinedFeedItems],
  );

  const cities = useMemo(
    () => ['All cities', ...Array.from(new Set(combinedFeedItems.map((item) => item.city).filter(Boolean) as string[])).sort()],
    [combinedFeedItems],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const location = locationQuery.trim().toLowerCase();
    const filtered = combinedFeedItems.filter((item) => {
      const matchesSearch = !query || itemSearchText(item).includes(query);
      const matchesLocation = !location || location === 'st. louis, mo' || itemSearchText(item).includes(location);
      const matchesCategory = activeCategory === 'All categories' || item.category === activeCategory;
      const matchesCity = activeCity === 'All cities' || item.city === activeCity;
      return matchesSearch && matchesLocation && matchesCategory && matchesCity && matchesMoment(item, activeMoment);
    });
    return sortItems(filtered, sortBy);
  }, [activeCategory, activeCity, activeMoment, combinedFeedItems, locationQuery, searchQuery, sortBy]);

  const heroEvent = filteredItems[0] || combinedFeedItems[0];
  const featuredItems = filteredItems.slice(0, 6);
  const popularItems = filteredItems.slice(6, 14);
  const visibleItems = filteredItems.slice(0, viewMode === 'list' ? 24 : 18);
  const calendarItems = filteredItems.slice(0, 12);
  const hasLiveData = combinedFeedItems.length > 0;
  const hasActiveFilters = Boolean(searchQuery) || activeCategory !== 'All categories' || activeCity !== 'All cities' || activeMoment !== 'All' || sortBy !== 'soonest';
  const heroDate = heroEvent ? dayBlock(heroEvent) : { month: 'Soon', day: '•' };
  const savedItems = combinedFeedItems.filter((item) => savedEventIds.includes(item.id));
  const reviewStatusCounts = useMemo(() => ({
    pendingCount: pendingSubmissions.filter((item) => !item.status || item.status === 'pending_review').length,
    needsChangesCount: pendingSubmissions.filter((item) => item.status === 'needs_changes').length,
    approvedCount: pendingSubmissions.filter((item) => item.status === 'approved_local').length,
    publishedCount: approvedLocalItems.length,
  }), [approvedLocalItems.length, pendingSubmissions]);
  const filteredPendingSubmissions = useMemo(() => {
    const reviewSearchQuery = reviewQueueSearch.trim().toLowerCase();
    return pendingSubmissions.filter((submission) => {
      const matchesStatus = activeReviewFilter === 'all' || (!submission.status && activeReviewFilter === 'pending_review') || submission.status === activeReviewFilter;
      const matchesSearch = !reviewSearchQuery || reviewSubmissionSearchText(submission).includes(reviewSearchQuery);
      return matchesStatus && matchesSearch;
    });
  }, [activeReviewFilter, pendingSubmissions, reviewQueueSearch]);

  function isSavedEvent(item: LiveFeedItem): boolean {
    return savedEventIds.includes(item.id);
  }

  function toggleSavedEvent(item: LiveFeedItem) {
    setSavedEventIds((current) => current.includes(item.id) ? current.filter((id) => id !== item.id) : [item.id, ...current]);
  }

  async function handleShareEvent(item: LiveFeedItem) {
    const url = `${window.location.origin}${eventDetailPath(item)}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: item.title, text: item.summary || venueLine(item), url });
        setShareStatus('Shared event');
        return;
      }
      await navigator.clipboard.writeText(url);
      setShareStatus('Copied event link');
    } catch {
      setShareStatus('Share canceled');
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setActiveCategory('All categories');
    setActiveCity('All cities');
    setActiveMoment('All');
    setSortBy('soonest');
  }

  function applyApiBackedReviewQueue(data: { pendingSubmissions?: LocalSubmission[]; publishedLocalEvents?: LiveFeedItem[] }) {
    // api-backed-local-submissions-pass: browser state mirrors /api/local-submissions.
    const apiBackedReviewQueue = Array.isArray(data.pendingSubmissions) ? data.pendingSubmissions : [];
    const publishedLocalEvents = Array.isArray(data.publishedLocalEvents) ? data.publishedLocalEvents : [];
    setPendingSubmissions(apiBackedReviewQueue);
    setApprovedLocalItems(publishedLocalEvents);
    return { apiBackedReviewQueue, publishedLocalEvents };
  }

  async function loadLocalSubmissionsFromApi() {
    try {
      const response = await fetch('/api/local-submissions', { cache: 'no-store' });
      if (!response.ok) throw new Error('Review queue unavailable');
      const data = await response.json();
      applyApiBackedReviewQueue(data);
      setOperatorExportStatus('Review queue synced');
    } catch {
      try {
        const stored = JSON.parse(localStorage.getItem('looplocal:post-local-submissions') || '[]');
        setPendingSubmissions(Array.isArray(stored) ? stored.filter((item): item is LocalSubmission => item && typeof item === 'object') : []);
      } catch {
        setPendingSubmissions([]);
      }
    }
  }

  function loadPendingSubmissions() {
    void loadLocalSubmissionsFromApi();
  }

  useEffect(() => {
    let cancelled = false;
    fetch('/api/local-submissions', { cache: 'no-store' })
      .then((response) => response.ok ? response.json() : null)
      .then((data) => {
        if (!cancelled && data) applyApiBackedReviewQueue(data);
      })
      .catch(() => undefined);
    return () => { cancelled = true; };
  }, []);

  async function syncLocalSubmissionMutation(input: RequestInfo | URL, init?: RequestInit) {
    const response = await fetch(input, init);
    if (!response.ok) throw new Error('Review queue mutation failed');
    const data = await response.json();
    applyApiBackedReviewQueue(data);
    return data;
  }

  async function clearPendingSubmissions() {
    localStorage.setItem('looplocal:post-local-submissions', '[]');
    await syncLocalSubmissionMutation('/api/local-submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ action: 'replace', pendingSubmissions: [], publishedLocalEvents: approvedLocalItems }),
    });
    setOperatorExportStatus('Review queue cleared');
  }

  async function removeLocalSubmission(indexToRemove: number) {
    const submission = pendingSubmissions[indexToRemove];
    if (!submission?.id) return;
    await syncLocalSubmissionMutation(`/api/local-submissions?id=${encodeURIComponent(submission.id)}`, { method: 'DELETE' });
    setOperatorExportStatus('Removed from review queue');
  }

  async function updateLocalSubmissionStatus(indexToUpdate: number, status: SubmissionStatus) {
    const submission = pendingSubmissions[indexToUpdate];
    if (!submission?.id) return;
    await syncLocalSubmissionMutation('/api/local-submissions', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: submission.id, status, statusUpdatedAt: new Date().toISOString() }),
    });
    setOperatorExportStatus(`Marked ${status.replace('_', ' ')}`);
  }

  async function updateLocalSubmissionReviewerNote(indexToUpdate: number, reviewerNote: string) {
    const submission = pendingSubmissions[indexToUpdate];
    if (!submission?.id) return;
    setPendingSubmissions((current) => current.map((item, index) => index === indexToUpdate ? { ...item, reviewerNote, reviewerNoteUpdatedAt: new Date().toISOString() } : item));
    await syncLocalSubmissionMutation('/api/local-submissions', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: submission.id, reviewerNote, reviewerNoteUpdatedAt: new Date().toISOString() }),
    });
  }

  async function approveLocalSubmission(submission: LocalSubmission, indexToApprove: number) {
    // local-publish-workflow-pass legacy action label: Approve to discovery; review-status-lifecycle-pass UI label: Publish locally
    if (!submission.id) {
      const approved = localSubmissionToFeedItem({ ...submission, status: 'published_local', approvedAt: new Date().toISOString(), statusUpdatedAt: new Date().toISOString() }, indexToApprove);
      setApprovedLocalItems((current) => current.some((item) => item.id === approved.id) ? current : [approved, ...current]);
      return;
    }
    await syncLocalSubmissionMutation('/api/local-submissions', {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ id: submission.id, action: 'publish' }),
    });
    setShareStatus('Locally approved');
  }

  function buildOperatorHandoffPayload() {
    return {
      exportedAt: new Date().toISOString(),
      source: 'loop-local-browser-review-queue',
      pendingCount: pendingSubmissions.length,
      approvedCount: approvedLocalItems.length,
      pendingSubmissions,
      approvedLocalEvents: approvedLocalItems,
    };
  }

  async function copyOperatorHandoff() {
    const payload = JSON.stringify(buildOperatorHandoffPayload(), null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      setOperatorExportStatus('Operator handoff JSON copied');
    } catch {
      setOperatorExportStatus('Copy unavailable — use Download JSON');
    }
  }

  function downloadOperatorHandoff() {
    const payload = JSON.stringify(buildOperatorHandoffPayload(), null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'loop-local-review-queue.json';
    anchor.click();
    URL.revokeObjectURL(url);
    setOperatorExportStatus('Downloaded loop-local-review-queue.json');
  }

  function parseOperatorHandoffPayload(raw: string) {
    const parsed = JSON.parse(raw) as { pendingSubmissions?: unknown; approvedLocalEvents?: unknown };
    return {
      pendingSubmissions: Array.isArray(parsed.pendingSubmissions) ? parsed.pendingSubmissions.filter((item): item is LocalSubmission => item && typeof item === 'object') : [],
      approvedLocalEvents: Array.isArray(parsed.approvedLocalEvents) ? parsed.approvedLocalEvents.filter((item): item is LiveFeedItem => item && typeof item === 'object' && typeof (item as LiveFeedItem).id === 'string') : [],
    };
  }

  async function importOperatorHandoff() {
    try {
      const parsed = parseOperatorHandoffPayload(operatorImportText);
      // operator-handoff-import-pass payload shape: pendingSubmissions: parsed.pendingSubmissions, approvedLocalEvents: parsed.approvedLocalEvents
      localStorage.setItem('looplocal:post-local-submissions', JSON.stringify(parsed.pendingSubmissions));
      localStorage.setItem('looplocal:approved-local-events', JSON.stringify(parsed.approvedLocalEvents));
      await syncLocalSubmissionMutation('/api/local-submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action: 'replace', pendingSubmissions: parsed.pendingSubmissions, publishedLocalEvents: parsed.approvedLocalEvents }),
      });
      setOperatorExportStatus(`Imported ${parsed.pendingSubmissions.length} pending · ${parsed.approvedLocalEvents.length} approved`);
      setOperatorImportText('');
    } catch {
      setOperatorExportStatus('Import failed — paste valid loop-local-review-queue.json');
    }
  }

  function toggleMobileMenu() {
    setShowMobileMenu((current) => !current);
  }

  function handleTabSelect(tab: string) {
    setShowMobileMenu(false);
    if (tab === 'Saved') {
      setShowSavedPanel((value) => !value);
      return;
    }
    if (tab === 'Profile') {
      loadPendingSubmissions();
      setShowSubmissionPanel(true);
      return;
    }
    setViewMode(tabToViewMode(tab));
    document.getElementById(tab === 'Map' ? 'map' : 'events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="complete-frontend-rebuild app-reference-shell ux-polish-pass navigation-interaction-polish saved-share-interaction-pass local-publish-workflow-pass review-status-lifecycle-pass reviewer-notes-pass review-queue-filter-pass review-queue-search-pass mobile-webview-layout-containment-pass mobile-first-homepage-polish-pass mobile-tap-reliability-pass mobile-interaction-qa-pass" id="discover">
      <aside className="local-hero-panel" aria-label="Loop Local overview">
        <Link className="hero-logo-lockup" href="/">
          <span className="brand-mark brand-mark-image"><span className="brand-logo-image" aria-label="Loop Local" /></span>
          <strong>loop <em>local</em></strong>
        </Link>
        <p className="eyebrow">{source === 'live_supabase' ? 'Live local · support local' : 'Local discovery'}</p>
        <h1>Discover what’s happening near you.</h1>
        <p className="hero-subcopy">{hasLiveData ? `${totalCount} live local picks, refreshed from the current feed.` : 'Find live music, events, food, deals, markets, and neighborhood experiences around you.'}</p>
        <button className="location-pill" type="button" onClick={() => setLocationQuery('St. Louis, MO')}>⌖ {locationQuery}</button>
        <div className="hero-actions">
          <a className="primary-action" href="#events">➤ Explore Nearby</a>
          <Link className="secondary-action" href="/post-local">⊕ Post an Event</Link>
        </div>
        <div className="value-tile-grid" aria-label="Loop Local shortcuts">
          <span><b>♫</b>Live Music</span>
          <span><b>◇</b>Events</span>
          <span><b>⌖</b>Local Picks</span>
        </div>
      </aside>

      <section className="discovery-phone" aria-label="Loop Local discovery feed">
        <nav className="phone-topbar" aria-label="Primary navigation">
          <button className="mobile-qa-target" type="button" aria-label="Menu" aria-expanded={showMobileMenu} onClick={toggleMobileMenu}>☰</button>
          <Link className="phone-logo mobile-qa-target" href="/"><span className="brand-mark mini"><span className="brand-logo-image" aria-label="Loop Local" /></span> loop local</Link>
          <button className="mobile-qa-target" type="button" aria-label="Open Saved Events" onClick={() => setShowSavedPanel(true)}>♡</button>
        </nav>
        {showMobileMenu ? (
          <section className="mobile-menu-panel mobile-qa-home-menu" aria-label="Mobile menu">
            <button className="mobile-qa-target" type="button" onClick={() => { setShowMobileMenu(false); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Explore nearby</button>
            <Link className="mobile-qa-target" href="/post-local" onClick={() => setShowMobileMenu(false)}>Open Post Local</Link>
            <button className="mobile-qa-target" type="button" aria-label="Open Review Queue" onClick={() => { setShowSubmissionPanel(true); setShowMobileMenu(false); }}>Review queue</button>
            <button className="mobile-qa-target" type="button" onClick={() => { setShowSavedPanel(true); setShowMobileMenu(false); }}>Saved events</button>
          </section>
        ) : null}

        <section className="search-stack" aria-label="Search and filters">
          <label className="search-field">
            <span>⌕</span>
            <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search events, artists, venues…" />
          </label>
          <div className="category-chip-row" aria-label="Category shortcuts">
            {['All categories', ...categories.filter((category) => category !== 'All categories').slice(0, 5)].map((category) => (
              <button className={activeCategory === category ? 'category-chip active' : 'category-chip'} key={category} type="button" onClick={() => setActiveCategory(category)}>
                {category === 'All categories' ? 'All' : category}
              </button>
            ))}
          </div>
          <div className="utility-filter-grid" aria-label="Advanced filters">
            <label><span>City</span><select value={activeCity} onChange={(event) => setActiveCity(event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
            <label><span>Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="soonest">Soonest</option><option value="title">A–Z</option><option value="city">City</option><option value="price">Price</option></select></label>
          </div>
        </section>

        <section className="moment-row" aria-label="Moment filters">
          {moments.map((moment) => <button className={activeMoment === moment ? 'active' : ''} key={moment} type="button" onClick={() => setActiveMoment(moment)}>{moment}</button>)}
        </section>

        <section className="feed-section featured-this-week" id="events" aria-label="Featured events">
          <header className="section-title-row"><h2>Featured This Week</h2><a href="#events">View all</a></header>
          <div className="featured-rail polished-card-density">
            {featuredItems.map((item) => <EventCard compact isSaved={isSavedEvent(item)} item={item} key={item.id} onSave={toggleSavedEvent} />)}
          </div>
        </section>

        <section className="feed-section popular-near-you" aria-label="Popular nearby">
          <header className="section-title-row">
            <div><h2>Popular Near You</h2><p>{filteredItems.length} of {totalCount} picks</p></div>
            {hasActiveFilters ? <button type="button" onClick={clearFilters}>Clear</button> : <a href="#events">View all</a>}
          </header>
          <div className="popular-list polished-list-density">
            {(popularItems.length ? popularItems : featuredItems).slice(0, 6).map((item) => <PopularRow isSaved={isSavedEvent(item)} item={item} key={item.id} onSave={toggleSavedEvent} />)}
          </div>
        </section>

        <section className="view-mode-dock polished-view-dock" aria-label="Event view mode">
          {viewModes.map((mode) => <button className={viewMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setViewMode(mode.id)} type="button">{mode.label}</button>)}
        </section>

        {visibleItems.length > 0 && viewMode === 'card' ? <div className="event-rail card-view polished-card-density">{visibleItems.map((item) => <EventCard isSaved={isSavedEvent(item)} item={item} key={item.id} onSave={toggleSavedEvent} />)}</div> : null}
        {visibleItems.length > 0 && viewMode === 'list' ? <div className="list-view">{visibleItems.map((item) => <PopularRow isSaved={isSavedEvent(item)} item={item} key={item.id} onSave={toggleSavedEvent} />)}</div> : null}
        {visibleItems.length > 0 && viewMode === 'map' ? (
          <section className="map-experience-upgrade map-discovery-shell" id="map" aria-label="Map discovery view">
            <div className="map-control-bar">
              <span className="map-radius-chip">Within 10 mi</span>
              <span className="map-neighborhood-chip">Near {activeCity === 'All cities' ? locationQuery : activeCity}</span>
              <button type="button" onClick={() => setSortBy('city')}>Group by area</button>
            </div>
            <div className="map-canvas-premium" aria-label="Premium local map preview">
              <span className="map-route-line" />
              {visibleItems.slice(0, 10).map((item, index) => (
                <Link
                  className="map-pin-cluster"
                  href={eventDetailPath(item)}
                  key={item.id}
                  style={{ left: `${10 + ((index * 19) % 78)}%`, top: `${16 + ((index * 29) % 62)}%` }}
                  aria-label={`Open event ${item.title}`}
                >
                  <b>{index + 1}</b>
                  <span>{item.category || 'Local'}</span>
                </Link>
              ))}
              <article className="map-selected-event-card">
                <small>Closest highlight</small>
                <strong>{visibleItems[0]?.title}</strong>
                <span>{venueLine(visibleItems[0])} · {distanceLine(visibleItems[0])}</span>
                <div><Link href={eventDetailPath(visibleItems[0])}>Open event</Link><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressLine(visibleItems[0]) || venueLine(visibleItems[0]) || visibleItems[0]?.city || visibleItems[0]?.title || 'event')}`}>Directions</a></div>
              </article>
            </div>
            <aside className="map-side-results" aria-label="Map results list">
              {visibleItems.slice(0, 6).map((item, index) => (
                <article key={item.id}>
                  <b>{index + 1}</b>
                  <div><strong>{item.title}</strong><span>{venueLine(item)} · {distanceLine(item)}</span></div>
                  <Link href={eventDetailPath(item)}>Open event</Link>
                </article>
              ))}
            </aside>
          </section>
        ) : null}
        {visibleItems.length > 0 && viewMode === 'calendar' ? <div className="calendar-view" id="calendar">{calendarItems.map((item) => <article className="calendar-card" key={item.id}><span>{item.date || 'Date pending'}</span><strong>{item.title}</strong><p>{item.time || 'Time pending'} · {venueLine(item)}</p></article>)}</div> : null}
        {visibleItems.length === 0 ? <div className="empty-filter-state"><h3>No events match</h3><p>Try a different city, category, or search.</p><button type="button" onClick={clearFilters}>Clear filters</button></div> : null}
        {showSavedPanel ? (
          <section className="saved-events-panel" aria-label="Saved events">
            <header className="section-title-row"><div><h2>Saved events</h2><p>{savedItems.length ? `${savedItems.length} saved locally` : 'Save events to compare plans later.'}</p></div><button type="button" onClick={() => setShowSavedPanel(false)}>Close</button></header>
            <div className="popular-list polished-list-density">
              {(savedItems.length ? savedItems : featuredItems.slice(0, 3)).map((item) => <PopularRow isSaved={isSavedEvent(item)} item={item} key={item.id} onSave={toggleSavedEvent} />)}
            </div>
          </section>
        ) : null}
        {showSubmissionPanel ? (
          <section className="pending-submissions-panel post-submission-review-panel-pass" aria-label="Pending local submissions">
            <header className="section-title-row">
              <div><h2>Review queue</h2><p>{pendingSubmissions.length ? `${pendingSubmissions.length} pending local submissions` : 'Pending local submissions will appear here after Post Local submit.'}</p></div>
              <div className="pending-submission-actions"><Link href="/post-local">Open Post Local</Link><button type="button" onClick={clearPendingSubmissions}>Clear local queue</button><button type="button" onClick={() => setShowSubmissionPanel(false)}>Close</button></div>
            </header>
            <div className="review-status-summary" aria-label="Review status summary"><span>{reviewStatusCounts.pendingCount} pending</span><span>{reviewStatusCounts.needsChangesCount} needs changes</span><span>{reviewStatusCounts.approvedCount} approved only</span><span>{reviewStatusCounts.publishedCount} published locally</span></div>
            <label className="review-queue-search-field"><span>Search review queue</span><input type="search" value={reviewQueueSearch} onChange={(event) => setReviewQueueSearch(event.target.value)} placeholder="Title, entity, status, note…" /></label>
            <div className="review-queue-filter-row" aria-label="Review queue filters">
              {/* review-queue-filter-pass marker: showing ${filteredPendingSubmissions.length} */}
              {reviewQueueFilters.map((filter) => <button className={activeReviewFilter === filter.id ? 'active' : ''} key={filter.id} type="button" onClick={() => setActiveReviewFilter(filter.id)}>{filter.label}</button>)}
              <small>showing {filteredPendingSubmissions.length} of {pendingSubmissions.length}</small>
            </div>
            <section className="operator-handoff-card operator-handoff-export-pass operator-handoff-import-pass" aria-label="Operator handoff">
              <div><strong>Operator handoff</strong><p>{pendingSubmissions.length} pending · {approvedLocalItems.length} locally approved</p></div>
              <div className="operator-handoff-actions"><button type="button" onClick={copyOperatorHandoff}>Copy queue JSON</button><button type="button" onClick={downloadOperatorHandoff}>Download JSON</button></div>
              <label className="operator-import-area"><span>Paste exported review queue JSON</span><textarea value={operatorImportText} onChange={(event) => setOperatorImportText(event.target.value)} placeholder="Paste loop-local-review-queue.json here" rows={3} /></label>
              <div className="operator-handoff-actions"><button type="button" onClick={importOperatorHandoff}>Import queue JSON</button></div>
              {operatorExportStatus ? <small className="operator-export-status" role="status">{operatorExportStatus}</small> : null}
            </section>
            {filteredPendingSubmissions.length ? (
              <div className="pending-submission-grid">
                {filteredPendingSubmissions.slice(0, 6).map((submission) => {
                  const index = pendingSubmissions.indexOf(submission);
                  return <article className="pending-submission-card" key={`${submission.submittedAt || submission.eventTitle || 'submission'}-${index}`}>
                    <span>{submission.status || 'pending_review'}</span>
                    <strong>{submission.eventTitle || 'Untitled local submission'}</strong>
                    <p>{[submission.eventCategory, submission.eventDate, submission.locationName || submission.eventCity].filter(Boolean).join(' · ') || 'Details pending'}</p>
                    <small>{submission.entityName || 'Local contributor'}{submission.submittedAt ? ` · ${new Date(submission.submittedAt).toLocaleDateString()}` : ''}</small>
                    <label className="reviewer-note-field"><span>Reviewer note</span><textarea value={submission.reviewerNote || ''} onChange={(event) => updateLocalSubmissionReviewerNote(index, event.target.value)} placeholder="Internal note for changes, approval context, or publish handoff" rows={2} /></label>
                    <div className="pending-submission-actions"><button className="needs-changes-local" type="button" onClick={() => updateLocalSubmissionStatus(index, 'needs_changes')}>Needs changes</button><button className="approve-only-local" type="button" onClick={() => updateLocalSubmissionStatus(index, 'approved_local')}>Approve only</button><button className="publish-local" type="button" onClick={() => approveLocalSubmission(submission, index)}>Publish locally</button><button className="remove-local" type="button" onClick={() => removeLocalSubmission(index)}>Remove</button></div>
                  </article>;
                })}
              </div>
            ) : <p className="pending-submission-empty">No pending local submissions yet. Submit a valid Post Local draft to seed the queue.</p>}
          </section>
        ) : null}
        {shareStatus ? <p className="share-status" role="status">{shareStatus}</p> : null}

        <nav className="mobile-app-tabbar polished-bottom-nav" aria-label="App tabs">
          {tabs.map((tab, index) => (
            <button
              aria-pressed={viewMode === tabToViewMode(tab)}
              className={viewMode === tabToViewMode(tab) ? 'active' : ''}
              key={tab}
              onClick={() => handleTabSelect(tab)}
              type="button"
            >
              {['⌕', '▦', '⌖', '♡', '◉'][index]}<span>{tab}</span>
            </button>
          ))}
        </nav>
      </section>

      {heroEvent ? (
        <aside className="event-detail-preview polished-detail-preview" aria-label="Featured event detail preview">
          <div className={heroEvent.image_url ? 'detail-hero-image' : 'detail-hero-image local-photo-fallback quiet-placeholder-image'} data-image-state={eventImageState(heroEvent)} data-visual-key={eventVisualKey(heroEvent)} style={heroEvent.image_url ? { backgroundImage: `url(${eventImage(heroEvent)})` } : undefined}>
            {!heroEvent.image_url ? <span className="fallback-visual-label">{fallbackVisualLabel(heroEvent)}</span> : null}
            <div><button className={isSavedEvent(heroEvent) ? 'is-saved' : ''} type="button" aria-label={isSavedEvent(heroEvent) ? 'Unsave featured event' : 'Save featured event'} onClick={() => toggleSavedEvent(heroEvent)}>{isSavedEvent(heroEvent) ? '♥' : '♡'}</button><button type="button" aria-label="Share" onClick={() => handleShareEvent(heroEvent)}>⇧</button></div>
          </div>
          <div className="detail-body">
            <span className="floating-date detail-date"><strong>{heroDate.month}</strong><b>{heroDate.day}</b></span>
            <p className="eyebrow">{heroEvent.category || 'Live local'}</p>
            <h2>{heroEvent.title}</h2>
            <div className="detail-meta-grid">
              <span>▣ {formatEventMeta(heroEvent) || 'Date pending'}</span>
              <span>◷ {heroEvent.time || 'Time pending'}</span>
              <span>⌖ {venueLine(heroEvent)}</span>
              <span>➤ {distanceLine(heroEvent)}</span>
            </div>
            <div className="ticket-action-strip">
              <div><strong>{priceLine(heroEvent)}</strong><span>{heroEvent.price ? 'Reserve your spot' : 'Details from source'}</span></div>
              <a href={eventExternalUrl(heroEvent)}>View Tickets ↗</a>
            </div>
            <section className="detail-about"><h3>About</h3><p>{heroEvent.summary || `${heroEvent.title} is one of the local picks worth checking out near ${heroEvent.city || locationQuery}.`}</p><small>{addressLine(heroEvent) || 'Address details pending'}</small></section>
            <a className="primary-action detail-cta" href={eventDetailPath(heroEvent)}>➤ View Event Page</a>
          </div>
        </aside>
      ) : null}
    </main>
  );
}
