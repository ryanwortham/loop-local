'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { SessionNav } from '@/components/session-nav';
import { currentMarketDate, discoverySectionLabels, distanceLineForItem, eventMatchesMoment, mapPinStyleForItem, visibleDiscoveryItems, type ViewerLocation } from '@/lib/discovery-truthfulness';
import { eventDetailPath, eventExternalUrl, eventImageState, eventVisualKey, fallbackVisualLabel, normalizeFeedItems, type LiveFeedHealth, type LiveFeedItem } from '@/lib/live-feed';
import { useSavedEvents } from '@/lib/use-saved-events';
import { DEMAND_AREAS, DEMAND_CATEGORIES, type DemandArea, type DemandCategory, type DemandDateWindow } from '@/lib/unmet-demand';

type ViewMode = 'card' | 'list' | 'map' | 'calendar';

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
const demandDateWindows: Array<{ id: DemandDateWindow; label: string }> = [
  { id: 'any_time', label: 'Any date' },
  { id: 'tonight', label: 'Tonight' },
  { id: 'this_weekend', label: 'This weekend' },
  { id: 'next_7_days', label: 'Next 7 days' },
  { id: 'later', label: 'Later' },
];

function demandAreaForLocation(value: string): DemandArea {
  const location = value.toLowerCase();
  if (/belleville|edwardsville|collinsville|alton|fairview heights|illinois/.test(location)) return 'Metro East';
  if (/st\.? charles|wentzville|o['’]?fallon,? mo/.test(location)) return 'St. Charles County';
  if (/maplewood|clayton|brentwood|richmond heights|university city/.test(location)) return 'Mid County';
  if (/chesterfield|ballwin|wildwood|ellisville|kirkwood/.test(location)) return 'West County';
  if (/florissant|ferguson|hazelwood|north county/.test(location)) return 'North County';
  if (/affton|mehlville|lemay|south county/.test(location)) return 'South County';
  return location.includes('illinois') ? 'Nearby Illinois' : location.includes('st. louis') || location.includes('saint louis') ? 'St. Louis City' : 'Nearby Missouri';
}

function demandWindowForMoment(moment: string): DemandDateWindow {
  if (moment === 'Tonight') return 'tonight';
  if (moment === 'Weekend') return 'this_weekend';
  return 'any_time';
}

function formatEventMeta(item: LiveFeedItem): string {
  return [item.city, item.date, item.time].filter(Boolean).join(' · ');
}

function eventImage(item: LiveFeedItem): string {
  return item.image_url || item.fallbackImageUrl || '/looplocal-event-placeholder.jpg';
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

function distanceLine(item: LiveFeedItem, viewerLocation?: ViewerLocation | null): string {
  return distanceLineForItem(item, viewerLocation);
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

function matchesMoment(item: LiveFeedItem, activeMoment: string, marketDate: string): boolean {
  return eventMatchesMoment(item, activeMoment, { marketDate, timeZone: 'America/Chicago' });
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

function EventCard({ item, compact = false, isSaved = false, onSave }: { item: LiveFeedItem; compact?: boolean; isSaved?: boolean; onSave?: (item: LiveFeedItem) => void }) {
  const hasEventImage = Boolean(item.image_url);
  const date = dayBlock(item);
  const isLocalApproved = item.source === 'local_approved';

  return (
    <article className={compact ? 'explore-card explore-card-compact' : 'explore-card'}>
      <div className={hasEventImage ? 'explore-card-image' : 'explore-card-image local-photo-fallback quiet-placeholder-image'} data-image-state={eventImageState(item)} data-visual-key={eventVisualKey(item)} style={{ backgroundImage: `url(${eventImage(item)})` }}>
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
          <time dateTime={item.startsAt || item.date || undefined}>{item.time || priceLine(item)}</time>
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
      <div className={item.image_url ? 'popular-thumb' : 'popular-thumb local-photo-fallback quiet-popular-placeholder'} data-image-state={eventImageState(item)} data-visual-key={eventVisualKey(item)} style={{ backgroundImage: `url(${eventImage(item)})` }}>{!item.image_url ? <span>{fallbackVisualLabel(item)}</span> : null}</div>
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
  health: LiveFeedHealth;
};

export function AppShell({ feedItems, totalCount, source, health }: AppShellProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('St. Louis, MO');
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [activeCity, setActiveCity] = useState('All cities');
  const [activeMoment, setActiveMoment] = useState('All');
  const [sortBy, setSortBy] = useState('soonest');
  const [viewMode, setViewMode] = useState<ViewMode>('card');
  const [activeAppTab, setActiveAppTab] = useState('Discover'); // mobile-shell-active-tab-pass: app tab state is independent from viewMode.
  const { isSavedEvent, toggleSavedEvent, saveStatus } = useSavedEvents();
  const [showSavedPanel, setShowSavedPanel] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [demandCategory, setDemandCategory] = useState<DemandCategory>('Any category');
  const [demandArea, setDemandArea] = useState<DemandArea>('St. Louis City');
  const [demandDateWindow, setDemandDateWindow] = useState<DemandDateWindow>('any_time');
  const [demandStatus, setDemandStatus] = useState('');
  const [demandSubmitting, setDemandSubmitting] = useState(false);
  const [demandSent, setDemandSent] = useState(false);
  const viewerLocation: ViewerLocation | null = null;
  const marketDate = currentMarketDate('America/Chicago');


  const combinedFeedItems = useMemo(() => normalizeFeedItems(feedItems), [feedItems]);

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
      return matchesSearch && matchesLocation && matchesCategory && matchesCity && matchesMoment(item, activeMoment, marketDate);
    });
    return sortItems(filtered, sortBy);
  }, [activeCategory, activeCity, activeMoment, combinedFeedItems, locationQuery, marketDate, searchQuery, sortBy]);

  const radiusFilteredItems = useMemo(
    () => visibleDiscoveryItems(filteredItems, { viewerLocation, radiusMiles: 10 }),
    [filteredItems, viewerLocation],
  );
  const discoveryLabels = discoverySectionLabels({ hasCuration: false, hasPopularityScores: false });

  const heroEvent = radiusFilteredItems[0] || combinedFeedItems[0];
  const featuredItems = radiusFilteredItems.slice(0, 6);
  const popularItems = radiusFilteredItems.slice(6, 14);
  const visibleItems = radiusFilteredItems.slice(0, viewMode === 'list' ? 24 : 18);
  const calendarItems = radiusFilteredItems.slice(0, 12);
  const hasLiveData = combinedFeedItems.length > 0;
  const feedHealthMessage = health.status === 'unavailable'
    ? 'Live feed is temporarily unavailable. Local submissions remain available.'
    : health.status === 'empty'
      ? 'No upcoming events are published yet. Check back soon or post a local event.'
      : health.status === 'stale'
        ? `Showing recently cached events${health.ageSeconds !== null ? ` from ${Math.max(1, Math.round(health.ageSeconds / 60))} minutes ago` : ''}.`
        : 'Live feed connected and current.';
  const hasActiveFilters = Boolean(searchQuery) || activeCategory !== 'All categories' || activeCity !== 'All cities' || activeMoment !== 'All' || sortBy !== 'soonest';
  const hasDemandIntent = Boolean(searchQuery.trim()) || activeCategory !== 'All categories' || activeCity !== 'All cities' || activeMoment !== 'All' || locationQuery !== 'St. Louis, MO';
  const showDemandCapture = hasLiveData && hasDemandIntent && health.status !== 'unavailable' && radiusFilteredItems.length <= 2;
  const heroDate = heroEvent ? dayBlock(heroEvent) : { month: 'Soon', day: '•' };
  const savedItems = combinedFeedItems.filter((item) => isSavedEvent(item.id));

  function resetDemandSubmission() {
    setDemandSent(false);
    setDemandStatus('');
  }

  function updateSearchQuery(value: string) {
    setSearchQuery(value);
    resetDemandSubmission();
  }

  function updateCategory(value: string) {
    setActiveCategory(value);
    setDemandCategory(DEMAND_CATEGORIES.includes(value as DemandCategory) ? value as DemandCategory : 'Any category');
    resetDemandSubmission();
  }

  function updateCity(value: string) {
    setActiveCity(value);
    setDemandArea(demandAreaForLocation(value === 'All cities' ? locationQuery : value));
    resetDemandSubmission();
  }

  function updateMoment(value: string) {
    setActiveMoment(value);
    setDemandDateWindow(demandWindowForMoment(value));
    resetDemandSubmission();
  }

  function isSavedItem(item: LiveFeedItem): boolean {
    return isSavedEvent(item.id);
  }

  function toggleSavedItem(item: LiveFeedItem) {
    void toggleSavedEvent(item.id);
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

  async function submitDemandSignal() {
    setDemandSubmitting(true);
    setDemandStatus('');
    try {
      const response = await fetch('/api/unmet-demand', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          category: demandCategory,
          area: demandArea,
          dateWindow: demandDateWindow,
          resultCount: radiusFilteredItems.length,
          context: radiusFilteredItems.length === 0 ? 'empty' : 'weak',
        }),
      });
      const data = await response.json();
      setDemandSent(response.ok);
      setDemandStatus(response.ok ? 'Thanks — this helps us find better local listings.' : data.error || 'Unable to send right now.');
    } catch {
      setDemandSent(false);
      setDemandStatus('Unable to send right now.');
    } finally {
      setDemandSubmitting(false);
    }
  }

  function clearFilters() {
    setSearchQuery('');
    setActiveCategory('All categories');
    setActiveCity('All cities');
    setActiveMoment('All');
    setSortBy('soonest');
    setDemandCategory('Any category');
    setDemandArea(demandAreaForLocation(locationQuery));
    setDemandDateWindow('any_time');
    resetDemandSubmission();
  }

  function toggleMobileMenu() {
    setShowMobileMenu((current) => !current);
  }

  function handleTabSelect(tab: string) {
    setShowMobileMenu(false);
    setActiveAppTab(tab);
    if (tab === 'Saved') {
      setShowSavedPanel(true); setActiveAppTab('Saved');
      document.querySelector('.saved-events-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    if (['Profile'].includes(tab)) {
      window.location.assign('/account');
      return;
    }
    setShowSavedPanel(false);
    setViewMode(tabToViewMode(tab));
    document.getElementById(tab === 'Map' ? 'map' : 'events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="complete-frontend-rebuild app-reference-shell ux-polish-pass navigation-interaction-polish saved-share-interaction-pass mobile-webview-layout-containment-pass mobile-first-homepage-polish-pass mobile-tap-reliability-pass mobile-interaction-qa-pass mobile-shell-active-tab-pass" id="discover">
      <aside className="local-hero-panel" aria-label="Loop Local overview">
        <Link className="hero-logo-lockup" href="/">
          <span className="brand-mark brand-mark-image"><span className="brand-logo-image" aria-label="Loop Local" /></span>
          <strong>loop <em>local</em></strong>
        </Link>
        <p className="eyebrow">{health.status === 'fresh' ? 'Live local · support local' : 'Local discovery'}</p>
        <h1>Discover what’s happening near you.</h1>
        <p className="hero-subcopy">{hasLiveData ? `${totalCount} live local picks, refreshed from the current feed.` : 'Find live music, events, food, deals, markets, and neighborhood experiences around you.'}</p>
        <p className={`feed-health-status feed-health-${health.status}`} data-feed-source={source} role={health.status === 'unavailable' ? 'alert' : 'status'}>{feedHealthMessage}</p>
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
          {/* Legacy saved marker: onClick={() => setShowSavedPanel(true)} now also sets activeAppTab. */}
          <div className="phone-topbar-actions">
            <SessionNav className="phone-session-nav" />
            <button className="mobile-qa-target" type="button" aria-label="Open Saved Events" onClick={() => { setShowSavedPanel(true); setActiveAppTab('Saved'); }}>♡</button>
          </div>
        </nav>
        {showMobileMenu ? (
          <section className="mobile-menu-panel mobile-qa-home-menu" aria-label="Mobile menu">
            <button className="mobile-qa-target" type="button" onClick={() => { setShowMobileMenu(false); document.getElementById('events')?.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}>Explore nearby</button>
            <Link className="mobile-qa-target" href="/post-local" onClick={() => setShowMobileMenu(false)}>Open Post Local</Link>
            <Link className="mobile-qa-target" href="/account" onClick={() => setShowMobileMenu(false)}>Account</Link>
            <Link className="mobile-qa-target" href="/operator/reviews" onClick={() => setShowMobileMenu(false)}>Operator reviews</Link>
            <button className="mobile-qa-target" type="button" onClick={() => { setShowSavedPanel(true); setActiveAppTab('Saved'); setShowMobileMenu(false); }}>Saved events</button>
          </section>
        ) : null}

        <section className="search-stack" aria-label="Search and filters">
          <label className="search-field">
            <span>⌕</span>
            <input type="search" value={searchQuery} onChange={(event) => updateSearchQuery(event.target.value)} placeholder="Search events, artists, venues…" />
          </label>
          <div className="category-chip-row" aria-label="Category shortcuts">
            {['All categories', ...categories.filter((category) => category !== 'All categories').slice(0, 5)].map((category) => (
              <button className={activeCategory === category ? 'category-chip active' : 'category-chip'} key={category} type="button" onClick={() => updateCategory(category)}>
                {category === 'All categories' ? 'All' : category}
              </button>
            ))}
          </div>
          <div className="utility-filter-grid" aria-label="Advanced filters">
            <label><span>City</span><select value={activeCity} onChange={(event) => updateCity(event.target.value)}>{cities.map((city) => <option key={city}>{city}</option>)}</select></label>
            <label><span>Sort</span><select value={sortBy} onChange={(event) => setSortBy(event.target.value)}><option value="soonest">Soonest</option><option value="title">A–Z</option><option value="city">City</option><option value="price">Price</option></select></label>
          </div>
        </section>

        <section className="moment-row" aria-label="Moment filters">
          {moments.map((moment) => <button className={activeMoment === moment ? 'active' : ''} key={moment} type="button" onClick={() => updateMoment(moment)}>{moment}</button>)}
        </section>

        <section className="feed-section featured-this-week" id="events" aria-label="Featured events">
          <header className="section-title-row"><h2>{discoveryLabels.featured}</h2><a href="#events">View all</a></header>
          <div className="featured-rail polished-card-density">
            {featuredItems.map((item) => <EventCard compact isSaved={isSavedItem(item)} item={item} key={item.id} onSave={toggleSavedItem} />)}
          </div>
        </section>

        <section className="feed-section popular-near-you" aria-label="Popular nearby">
          <header className="section-title-row">
            <div><h2>{discoveryLabels.popular}</h2><p>{radiusFilteredItems.length} of {totalCount} {discoveryLabels.popularCountLabel}</p></div>
            {hasActiveFilters ? <button type="button" onClick={clearFilters}>Clear</button> : <a href="#events">View all</a>}
          </header>
          <div className="popular-list polished-list-density">
            {(popularItems.length ? popularItems : featuredItems).slice(0, 6).map((item) => <PopularRow isSaved={isSavedItem(item)} item={item} key={item.id} onSave={toggleSavedItem} />)}
          </div>
        </section>

        <section className="view-mode-dock polished-view-dock" aria-label="Event view mode">
          {viewModes.map((mode) => <button className={viewMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setViewMode(mode.id)} type="button">{mode.label}</button>)}
        </section>

        {visibleItems.length > 0 && viewMode === 'card' ? <div className="event-rail card-view polished-card-density">{visibleItems.map((item) => <EventCard isSaved={isSavedItem(item)} item={item} key={item.id} onSave={toggleSavedItem} />)}</div> : null}
        {visibleItems.length > 0 && viewMode === 'list' ? <div className="list-view">{visibleItems.map((item) => <PopularRow isSaved={isSavedItem(item)} item={item} key={item.id} onSave={toggleSavedItem} />)}</div> : null}
        {viewMode === 'map' ? (
          <section className="map-experience-upgrade map-discovery-shell" id="map" aria-label="Map discovery view">
            <div className="map-control-bar">
              <span className="map-radius-chip">Share location to enable 10 mi radius</span>
              <span className="map-neighborhood-chip">Near {activeCity === 'All cities' ? locationQuery : activeCity}</span>
              <button type="button" onClick={() => setSortBy('city')}>Group by area</button>
            </div>
            <div className="map-canvas-premium" aria-label="Premium local map preview">
              <span className="map-route-line" />
              {visibleItems.slice(0, 10).map((item, index) => {
                const pinStyle = mapPinStyleForItem(item, visibleItems);
                if (!pinStyle) return null;
                return (
                  <Link
                    className="map-pin-cluster"
                    href={eventDetailPath(item)}
                    key={item.id}
                    style={pinStyle}
                    aria-label={`Open event ${item.title}`}
                  >
                    <b>{index + 1}</b>
                    <span>{item.category || 'Local'}</span>
                  </Link>
                );
              })}
              <p className="map-empty-state">Map pins use event coordinates when available. Share your location to enable distance, radius, and closest-event sorting.</p>
            </div>
            <aside className="map-side-results" aria-label="Map results list">
              {visibleItems.slice(0, 6).map((item, index) => (
                <article key={item.id}>
                  <b>{index + 1}</b>
                  <div><strong>{item.title}</strong><span>{venueLine(item)} · {distanceLine(item, viewerLocation)}</span></div>
                  <Link href={eventDetailPath(item)}>Open event</Link>
                </article>
              ))}
            </aside>
          </section>
        ) : null}
        {visibleItems.length > 0 && viewMode === 'calendar' ? <div className="calendar-view" id="calendar">{calendarItems.map((item) => <article className="calendar-card" key={item.id}><span>{item.date || 'Date pending'}</span><strong>{item.title}</strong><p>{item.time || 'Time pending'} · {venueLine(item)}</p></article>)}</div> : null}
        {visibleItems.length === 0 ? <div className="empty-filter-state"><h3>No events match</h3><p>Try a different city, category, or search.</p><button type="button" onClick={clearFilters}>Clear filters</button></div> : null}
        {showDemandCapture ? (
          <section className="unmet-demand-capture-pass unmet-demand-card" aria-label="Tell us what you hoped to find">
            <div><span className="mini-tag">Help shape the feed</span><h3>Tell us what you hoped to find</h3><p>Share only a broad category, area, and date. We do not collect your precise location.</p></div>
            <div className="unmet-demand-fields">
              <label><span>Category</span><select value={demandCategory} onChange={(event) => { setDemandCategory(event.target.value as DemandCategory); setDemandSent(false); setDemandStatus(''); }}>{DEMAND_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label>
              <label><span>Area</span><select value={demandArea} onChange={(event) => { setDemandArea(event.target.value as DemandArea); setDemandSent(false); setDemandStatus(''); }}>{DEMAND_AREAS.map((area) => <option key={area}>{area}</option>)}</select></label>
              <label><span>When</span><select value={demandDateWindow} onChange={(event) => { setDemandDateWindow(event.target.value as DemandDateWindow); setDemandSent(false); setDemandStatus(''); }}>{demandDateWindows.map((window) => <option value={window.id} key={window.id}>{window.label}</option>)}</select></label>
            </div>
            <button type="button" disabled={demandSubmitting || demandSent} onClick={submitDemandSignal}>{demandSubmitting ? 'Sending…' : demandSent ? 'Sent' : demandStatus ? 'Try again' : 'Send request'}</button>
            {demandStatus ? <p className="unmet-demand-status" role="status">{demandStatus}</p> : null}
          </section>
        ) : null}
        {showSavedPanel ? (
          <section className="saved-events-panel" aria-label="Saved events">
            <header className="section-title-row"><div><h2>Saved events</h2><p>{savedItems.length ? `${savedItems.length} saved` : 'Save events to compare plans later.'}</p></div><button type="button" onClick={() => setShowSavedPanel(false)}>Close</button></header>
              {savedItems.length ? (
                <div className="popular-list polished-list-density">
                  {savedItems.map((item) => <PopularRow isSaved={isSavedItem(item)} item={item} key={item.id} onSave={toggleSavedItem} />)}
                </div>
              ) : (
                <div className="empty-filter-state saved-empty-state"><h3>No saved events yet</h3><p>Tap the heart on an event to save it here. We won’t show unsaved picks as saved.</p></div>
              )}
          </section>
        ) : null}
        {shareStatus ? <p className="share-status" role="status">{shareStatus}</p> : null}
        {saveStatus ? <p className="share-status" role="status">{saveStatus}</p> : null}

        <nav className="mobile-app-tabbar polished-bottom-nav" aria-label="App tabs">
          {/* Legacy navigation marker: aria-pressed={viewMode === tabToViewMode(tab)}; setViewMode(tabToViewMode(tab)) remains in handleTabSelect. */}
          {tabs.map((tab, index) => (
            <button
              aria-pressed={activeAppTab === tab}
              className={activeAppTab === tab ? 'active' : ''}
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
            <div><button className={isSavedItem(heroEvent) ? 'is-saved' : ''} type="button" aria-label={isSavedItem(heroEvent) ? 'Unsave featured event' : 'Save featured event'} onClick={() => toggleSavedItem(heroEvent)}>{isSavedItem(heroEvent) ? '♥' : '♡'}</button><button type="button" aria-label="Share" onClick={() => handleShareEvent(heroEvent)}>⇧</button></div>
          </div>
          <div className="detail-body">
            <span className="floating-date detail-date"><strong>{heroDate.month}</strong><b>{heroDate.day}</b></span>
            <p className="eyebrow">{heroEvent.category || 'Live local'}</p>
            <h2>{heroEvent.title}</h2>
            <div className="detail-meta-grid">
              <span>▣ {formatEventMeta(heroEvent) || 'Date pending'}</span>
              <span>◷ {heroEvent.time || 'Time pending'}</span>
              <span>⌖ {venueLine(heroEvent)}</span>
              <span>➤ {distanceLine(heroEvent, viewerLocation)}</span>
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
