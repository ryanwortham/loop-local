'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LiveFeedItem } from '@/lib/live-feed';

type ViewMode = 'card' | 'list' | 'map' | 'calendar';

const moments = ['All', 'Tonight', 'Weekend', 'Deals'];
const tabs = ['Discover', 'Events', 'Map', 'Saved', 'Profile'];
const viewModes: Array<{ id: ViewMode; label: string }> = [
  { id: 'card', label: 'Card view' },
  { id: 'list', label: 'List view' },
  { id: 'map', label: 'Map view' },
  { id: 'calendar', label: 'Calendar view' },
];

function formatEventMeta(item: LiveFeedItem): string {
  return [item.city, item.date, item.time].filter(Boolean).join(' · ');
}

function eventImage(item: LiveFeedItem): string {
  return item.image_url || `https://source.unsplash.com/900x650/?${encodeURIComponent(`${item.category || 'community'} event ${item.city || 'city'}`)}`;
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
  if (typeof item.latitude === 'number' && typeof item.longitude === 'number') return 'Distance ready';
  return 'Distance after location';
}

function shortSummary(item: LiveFeedItem): string {
  const text = item.summary || [item.business, item.location].filter(Boolean).join(' at ') || 'Local pick near you.';
  return text.length > 96 ? `${text.slice(0, 93)}…` : text;
}

function categoryClass(category?: string): string {
  const key = (category || 'local').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `event-chip chip-${key}`;
}

function primaryUrl(item: LiveFeedItem): string {
  if (item.ticketUrl) return item.ticketUrl;
  if (item.ticket_url) return item.ticket_url;
  if (item.event_url) return item.event_url;
  if (item.slug) return `/events/${item.slug}`;
  return '#events';
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

function EventCard({ item }: { item: LiveFeedItem }) {
  return (
    <article className="event-card premium-light">
      <div className="event-image" style={{ backgroundImage: `url(${eventImage(item)})` }}>
        <span className={categoryClass(item.category)}>{item.category || item.type || 'Local'}</span>
        <span className="event-price-pill">{priceLine(item)}</span>
      </div>
      <div className="event-card-body">
        <div className="event-date-block">
          <strong>{item.date ? new Date(item.date).toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) : 'Soon'}</strong>
          <span>{item.date ? new Date(item.date).getUTCDate() : '•'}</span>
        </div>
        <div className="event-main-copy">
          <h3>{item.title}</h3>
          <p>{shortSummary(item)}</p>
          <div className="event-meta-grid">
            <span>{formatEventMeta(item)}</span>
            <span>{venueLine(item)}</span>
            <span>{addressLine(item) || 'Address pending'}</span>
            <span>Distance · {distanceLine(item)}</span>
          </div>
        </div>
      </div>
      <div className="event-actions">
        <a href={primaryUrl(item)}>Open</a>
        <button type="button">Save</button>
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
  const visibleItems = filteredItems.slice(0, viewMode === 'list' ? 24 : 18);
  const calendarItems = filteredItems.slice(0, 12);
  const hasLiveData = feedItems.length > 0;
  const hasActiveFilters = Boolean(searchQuery) || activeCategory !== 'All categories' || activeCity !== 'All cities' || activeMoment !== 'All' || sortBy !== 'soonest';

  function clearFilters() {
    setSearchQuery('');
    setActiveCategory('All categories');
    setActiveCity('All cities');
    setActiveMoment('All');
    setSortBy('soonest');
  }

  return (
    <main className="app-shell app-canvas">
      <nav className="top-nav premium-light" aria-label="Primary navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">LL</span>
          <div>
            <strong>Loop Local</strong>
            <small>{hasLiveData ? `${totalCount} local picks` : 'nearby, right now'}</small>
          </div>
        </Link>
        <div className="nav-links">
          {tabs.map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>{item}</a>
          ))}
        </div>
      </nav>

      <section className="hero premium-light" id="discover">
        <div className="hero-copy">
          <p className="eyebrow">{source === 'live_supabase' ? 'Live local feed' : 'Local discovery'}</p>
          <h1>Find what’s worth doing now.</h1>
          <p>{hasLiveData ? `${totalCount} events and local picks near ${locationQuery}.` : 'Events, food, music, deals, and local spots in one clean feed.'}</p>
          <div className="location-bar premium-light" aria-label="Location controls">
            <label>
              <span>Location</span>
              <input value={locationQuery} onChange={(event) => setLocationQuery(event.target.value)} placeholder="City or ZIP" />
            </label>
            <button type="button" onClick={() => setLocationQuery('St. Louis, MO')}>Use my location</button>
          </div>
          <div className="actions">
            <a className="primary-action" href="#events">Explore nearby</a>
            <Link className="secondary-action" href="/post-local">Post local</Link>
          </div>
        </div>
        <div className="hero-panel premium-light" aria-label="Featured live event">
          {heroEvent ? <EventCard item={heroEvent} /> : null}
        </div>
      </section>

      <section className="filter-bar premium-light" aria-label="Event filters">
        <label className="filter-input">
          <span>Search events</span>
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="music, food, markets…"
          />
        </label>
        <label className="filter-select">
          <span>Category</span>
          <select value={activeCategory} onChange={(event) => setActiveCategory(event.target.value)}>
            {categories.map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="filter-select">
          <span>City</span>
          <select value={activeCity} onChange={(event) => setActiveCity(event.target.value)}>
            {cities.map((city) => <option key={city}>{city}</option>)}
          </select>
        </label>
        <label className="filter-select">
          <span>Sort</span>
          <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            <option value="soonest">Soonest</option>
            <option value="title">A–Z</option>
            <option value="city">City</option>
            <option value="price">Price</option>
          </select>
        </label>
      </section>

      <section className="range-tabs premium-light" aria-label="Moment filters">
        {moments.map((moment) => (
          <button className={activeMoment === moment ? 'active filter-chip' : 'filter-chip'} key={moment} type="button" onClick={() => setActiveMoment(moment)}>{moment}</button>
        ))}
      </section>

      <section className="live-feed-section premium-light" id="events" aria-label="Live event feed">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">From the current app</p>
            <h2>Happening nearby</h2>
          </div>
          <div className="results-summary">
            <span>{filteredItems.length} of {totalCount} picks</span>
            {hasActiveFilters ? <button type="button" onClick={clearFilters}>Clear filters</button> : null}
          </div>
        </div>

        <div className="view-switcher" aria-label="Event view mode">
          {viewModes.map((mode) => (
            <button className={viewMode === mode.id ? 'active' : ''} key={mode.id} onClick={() => setViewMode(mode.id)} type="button">
              {mode.label}
            </button>
          ))}
        </div>

        {visibleItems.length > 0 && viewMode === 'card' ? (
          <div className="event-rail card-view">
            {visibleItems.map((item) => <EventCard item={item} key={item.id} />)}
          </div>
        ) : null}

        {visibleItems.length > 0 && viewMode === 'list' ? (
          <div className="list-view">
            {visibleItems.map((item) => (
              <article className="list-row premium-light" key={item.id}>
                <div className="list-date"><strong>{item.date?.slice(5, 7) || '•'}</strong><span>{item.date?.slice(8, 10) || 'Soon'}</span></div>
                <div>
                  <h3>{item.title}</h3>
                  <p>{venueLine(item)} · {formatEventMeta(item)} · {priceLine(item)}</p>
                  <small>{addressLine(item) || distanceLine(item)}</small>
                </div>
                <a href={primaryUrl(item)}>Open</a>
              </article>
            ))}
          </div>
        ) : null}

        {visibleItems.length > 0 && viewMode === 'map' ? (
          <div className="map-view premium-light">
            <div className="map-art" aria-label="Map preview">
              {visibleItems.slice(0, 10).map((item, index) => (
                <span key={item.id} style={{ left: `${12 + ((index * 17) % 76)}%`, top: `${18 + ((index * 23) % 62)}%` }}>{index + 1}</span>
              ))}
            </div>
            <div className="map-list">
              {visibleItems.slice(0, 6).map((item) => (
                <article key={item.id}>
                  <strong>{item.title}</strong>
                  <span>{venueLine(item)} · {distanceLine(item)}</span>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {visibleItems.length > 0 && viewMode === 'calendar' ? (
          <div className="calendar-view">
            {calendarItems.map((item) => (
              <article className="calendar-card premium-light" key={item.id}>
                <span>{item.date || 'Date pending'}</span>
                <strong>{item.title}</strong>
                <p>{item.time || 'Time pending'} · {venueLine(item)}</p>
              </article>
            ))}
          </div>
        ) : null}

        {visibleItems.length === 0 ? (
          <div className="empty-filter-state">
            <h3>No events match</h3>
            <p>Try a different city, category, or search.</p>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        ) : null}
      </section>

      <nav className="mobile-tabs premium-light" aria-label="App tabs">
        {tabs.map((tab) => (
          <a href={`#${tab.toLowerCase()}`} key={tab}>{tab}</a>
        ))}
      </nav>
    </main>
  );
}
