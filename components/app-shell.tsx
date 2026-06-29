'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { LiveFeedItem } from '@/lib/live-feed';

const moments = ['All', 'Tonight', 'Weekend', 'Deals'];
const tabs = ['Discover', 'Events', 'Map', 'Saved', 'Profile'];

function formatEventMeta(item: LiveFeedItem): string {
  return [item.city, item.date, item.time].filter(Boolean).join(' · ');
}

function shortSummary(item: LiveFeedItem): string {
  const text = item.summary || [item.business, item.location].filter(Boolean).join(' at ') || 'Local pick near you.';
  return text.length > 92 ? `${text.slice(0, 89)}…` : text;
}

function categoryClass(category?: string): string {
  const key = (category || 'local').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  return `event-chip chip-${key}`;
}

function primaryUrl(item: LiveFeedItem): string {
  if (item.ticketUrl) return item.ticketUrl;
  if (item.website) return item.website;
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
    return /deal|happy hour|special|market|shopping/i.test(`${item.category || ''} ${item.title} ${item.summary || ''}`);
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
    const aTime = Date.parse(a.startsAt || a.date || '') || Number.MAX_SAFE_INTEGER;
    const bTime = Date.parse(b.startsAt || b.date || '') || Number.MAX_SAFE_INTEGER;
    return aTime - bTime;
  });
}

type AppShellProps = {
  feedItems: LiveFeedItem[];
  totalCount: number;
  source: string;
};

export function AppShell({ feedItems, totalCount, source }: AppShellProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All categories');
  const [activeCity, setActiveCity] = useState('All cities');
  const [activeMoment, setActiveMoment] = useState('All');
  const [sortBy, setSortBy] = useState('soonest');

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
    const filtered = feedItems.filter((item) => {
      const matchesSearch = !query || itemSearchText(item).includes(query);
      const matchesCategory = activeCategory === 'All categories' || item.category === activeCategory;
      const matchesCity = activeCity === 'All cities' || item.city === activeCity;
      return matchesSearch && matchesCategory && matchesCity && matchesMoment(item, activeMoment);
    });
    return sortItems(filtered, sortBy);
  }, [activeCategory, activeCity, activeMoment, feedItems, searchQuery, sortBy]);

  const heroEvent = filteredItems[0] || feedItems[0];
  const visibleItems = filteredItems.slice(0, 18);
  const moreItems = filteredItems.slice(8, 12);
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
    <main className="app-shell">
      <nav className="top-nav" aria-label="Primary navigation">
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

      <section className="hero" id="discover">
        <div className="hero-copy">
          <p className="eyebrow">{source === 'live_supabase' ? 'Live local feed' : 'Local discovery'}</p>
          <h1>Find what’s worth doing now.</h1>
          <p>{hasLiveData ? `${totalCount} events and local picks from the current app data.` : 'Events, food, music, deals, and local spots in one clean feed.'}</p>
          <div className="actions">
            <a className="primary-action" href="#events">Explore nearby</a>
            <Link className="secondary-action" href="/post-local">Post local</Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="Featured live event">
          {heroEvent ? (
            <article className="mini-phone-card live-event-hero">
              <span>{heroEvent.category || 'Tonight'}</span>
              <strong>{heroEvent.title}</strong>
              <p>{formatEventMeta(heroEvent)}</p>
              <div>Save · Share · Directions</div>
            </article>
          ) : (
            <div className="mini-phone-card">
              <span>Tonight</span>
              <strong>Live music nearby</strong>
              <p>Starts 8:00 PM · 2.4 mi</p>
              <div>Save · Share · Directions</div>
            </div>
          )}
        </div>
      </section>

      <section className="filter-bar" aria-label="Event filters">
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
          </select>
        </label>
      </section>

      <section className="range-tabs" aria-label="Moment filters">
        {moments.map((moment) => (
          <button className={activeMoment === moment ? 'active filter-chip' : 'filter-chip'} key={moment} type="button" onClick={() => setActiveMoment(moment)}>{moment}</button>
        ))}
      </section>

      <section className="live-feed-section" id="events" aria-label="Live event feed">
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
        {visibleItems.length > 0 ? (
          <div className="event-rail">
            {visibleItems.map((item) => (
              <article className="event-card" key={item.id}>
                <div className={categoryClass(item.category)}>{item.category || item.type || 'Local'}</div>
                <h3>{item.title}</h3>
                <p>{shortSummary(item)}</p>
                <div className="event-meta">{formatEventMeta(item)}</div>
                <div className="event-actions">
                  <a href={primaryUrl(item)}>Open</a>
                  <button type="button">Save</button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-filter-state">
            <h3>No events match</h3>
            <p>Try a different city, category, or search.</p>
            <button type="button" onClick={clearFilters}>Clear filters</button>
          </div>
        )}
      </section>

      <section className="card-grid" aria-label="More local picks">
        {moreItems.map((card) => (
          <article className="feature-card" id={card.slug || card.id} key={card.id}>
            <div>
              <p className="eyebrow">{card.category || card.type || 'Local'}</p>
              <h2>{card.title}</h2>
              <p>{shortSummary(card)}</p>
            </div>
            <span className="card-arrow">↗</span>
          </article>
        ))}
      </section>

      <nav className="mobile-tabs" aria-label="App tabs">
        {tabs.map((tab) => (
          <a href={`#${tab.toLowerCase()}`} key={tab}>{tab}</a>
        ))}
      </nav>
    </main>
  );
}
