'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { eventDetailPath, eventExternalUrl, eventImageState, eventVisualKey, fallbackVisualLabel, type LiveFeedItem } from '@/lib/live-feed';

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

function EventCard({ item, compact = false }: { item: LiveFeedItem; compact?: boolean }) {
  const hasEventImage = Boolean(item.image_url);
  const date = dayBlock(item);

  return (
    <article className={compact ? 'explore-card explore-card-compact' : 'explore-card'}>
      <div className={hasEventImage ? 'explore-card-image' : 'explore-card-image local-photo-fallback quiet-placeholder-image'} data-image-state={eventImageState(item)} data-visual-key={eventVisualKey(item)} style={hasEventImage ? { backgroundImage: `url(${eventImage(item)})` } : undefined}>
        {!hasEventImage ? <span className="fallback-visual-label">{fallbackVisualLabel(item)}</span> : null}
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
        <button type="button" aria-label={`Save ${item.title}`}>♡</button>
      </div>
    </article>
  );
}

function PopularRow({ item }: { item: LiveFeedItem }) {
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
      <Link href={eventDetailPath(item)} aria-label={`Open ${item.title}`}>♡</Link>
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

  const categories = useMemo(
    () => ['All categories', ...Array.from(new Set(feedItems.map((item) => item.category).filter(Boolean) as string[])).sort()],
    [feedItems],
  );

  const cities = useMemo(
    () => ['All cities', ...Array.from(new Set(feedItems.map((item) => item.city).filter(Boolean) as string[])).sort()],
    [feedItems],
  );

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const location = locationQuery.trim().toLowerCase();
    const filtered = feedItems.filter((item) => {
      const matchesSearch = !query || itemSearchText(item).includes(query);
      const matchesLocation = !location || location === 'st. louis, mo' || itemSearchText(item).includes(location);
      const matchesCategory = activeCategory === 'All categories' || item.category === activeCategory;
      const matchesCity = activeCity === 'All cities' || item.city === activeCity;
      return matchesSearch && matchesLocation && matchesCategory && matchesCity && matchesMoment(item, activeMoment);
    });
    return sortItems(filtered, sortBy);
  }, [activeCategory, activeCity, activeMoment, feedItems, locationQuery, searchQuery, sortBy]);

  const heroEvent = filteredItems[0] || feedItems[0];
  const featuredItems = filteredItems.slice(0, 6);
  const popularItems = filteredItems.slice(6, 14);
  const visibleItems = filteredItems.slice(0, viewMode === 'list' ? 24 : 18);
  const calendarItems = filteredItems.slice(0, 12);
  const hasLiveData = feedItems.length > 0;
  const hasActiveFilters = Boolean(searchQuery) || activeCategory !== 'All categories' || activeCity !== 'All cities' || activeMoment !== 'All' || sortBy !== 'soonest';
  const heroDate = heroEvent ? dayBlock(heroEvent) : { month: 'Soon', day: '•' };

  function clearFilters() {
    setSearchQuery('');
    setActiveCategory('All categories');
    setActiveCity('All cities');
    setActiveMoment('All');
    setSortBy('soonest');
  }

  function handleTabSelect(tab: string) {
    setViewMode(tabToViewMode(tab));
    if (tab === 'Saved' || tab === 'Profile') return;
    document.getElementById(tab === 'Map' ? 'map' : 'events')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  return (
    <main className="complete-frontend-rebuild app-reference-shell ux-polish-pass navigation-interaction-polish" id="discover">
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
          <button type="button" aria-label="Menu">☰</button>
          <Link className="phone-logo" href="/"><span className="brand-mark mini"><span className="brand-logo-image" aria-label="Loop Local" /></span> loop local</Link>
          <button type="button" aria-label="Notifications">♡</button>
        </nav>

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
            {featuredItems.map((item) => <EventCard compact item={item} key={item.id} />)}
          </div>
        </section>

        <section className="feed-section popular-near-you" aria-label="Popular nearby">
          <header className="section-title-row">
            <div><h2>Popular Near You</h2><p>{filteredItems.length} of {totalCount} picks</p></div>
            {hasActiveFilters ? <button type="button" onClick={clearFilters}>Clear</button> : <a href="#events">View all</a>}
          </header>
          <div className="popular-list polished-list-density">
            {(popularItems.length ? popularItems : featuredItems).slice(0, 6).map((item) => <PopularRow item={item} key={item.id} />)}
          </div>
        </section>

        <section className="view-mode-dock polished-view-dock" aria-label="Event view mode">
          {viewModes.map((mode) => <button className={viewMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setViewMode(mode.id)} type="button">{mode.label}</button>)}
        </section>

        {visibleItems.length > 0 && viewMode === 'card' ? <div className="event-rail card-view polished-card-density">{visibleItems.map((item) => <EventCard item={item} key={item.id} />)}</div> : null}
        {visibleItems.length > 0 && viewMode === 'list' ? <div className="list-view">{visibleItems.map((item) => <PopularRow item={item} key={item.id} />)}</div> : null}
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
            <div><button type="button" aria-label="Save">♡</button><button type="button" aria-label="Share">⇧</button></div>
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
