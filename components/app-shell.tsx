import Link from 'next/link';
import type { LiveFeedItem } from '@/lib/live-feed';

const moments = ['Now', 'Tonight', 'Weekend', 'Deals'];
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

type AppShellProps = {
  feedItems: LiveFeedItem[];
  totalCount: number;
  source: string;
};

export function AppShell({ feedItems, totalCount, source }: AppShellProps) {
  const heroEvent = feedItems[0];
  const tonightItems = feedItems.slice(0, 8);
  const moreItems = feedItems.slice(8, 20);
  const hasLiveData = feedItems.length > 0;

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

      <section className="range-tabs" aria-label="Moment filters">
        {moments.map((moment, index) => (
          <button className={index === 0 ? 'active' : ''} key={moment} type="button">{moment}</button>
        ))}
      </section>

      <section className="live-feed-section" id="events" aria-label="Live event feed">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">From the current app</p>
            <h2>Happening nearby</h2>
          </div>
          <span>{totalCount} picks</span>
        </div>
        <div className="event-rail">
          {tonightItems.map((item) => (
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
      </section>

      <section className="card-grid" aria-label="More local picks">
        {moreItems.slice(0, 4).map((card) => (
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
