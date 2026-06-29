import Link from 'next/link';

const moments = ['Now', 'Tonight', 'Weekend', 'Deals'];
const tabs = ['Discover', 'Events', 'Map', 'Saved', 'Profile'];

const rails = [
  {
    title: 'Happening now',
    body: 'Music, markets, food, and family picks near you.',
    meta: 'Live',
  },
  {
    title: 'Tonight',
    body: 'Quick plans after work, sorted by start time.',
    meta: 'Soon',
  },
  {
    title: 'Local deals',
    body: 'Happy hours, specials, and limited offers.',
    meta: 'Save',
  },
  {
    title: 'Post local',
    body: 'Share an event, deal, or community update.',
    meta: 'Post',
  },
];

export function AppShell() {
  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <Link className="brand-lockup" href="/">
          <span className="brand-mark">LL</span>
          <div>
            <strong>Loop Local</strong>
            <small>nearby, right now</small>
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
          <p className="eyebrow">Local discovery</p>
          <h1>Find what’s worth doing now.</h1>
          <p>Events, food, music, deals, and local spots in one clean feed.</p>
          <div className="actions">
            <a className="primary-action" href="#events">Explore nearby</a>
            <Link className="secondary-action" href="/post-local">Post local</Link>
          </div>
        </div>
        <div className="hero-panel" aria-label="Quick picks">
          <div className="mini-phone-card">
            <span>Tonight</span>
            <strong>Live music nearby</strong>
            <p>Starts 8:00 PM · 2.4 mi</p>
            <div>Save · Share · Directions</div>
          </div>
        </div>
      </section>

      <section className="range-tabs" aria-label="Moment filters">
        {moments.map((moment, index) => (
          <button className={index === 0 ? 'active' : ''} key={moment} type="button">{moment}</button>
        ))}
      </section>

      <section className="card-grid" id="events" aria-label="Discovery rails">
        {rails.map((card) => (
          <article className="feature-card" id={card.title.toLowerCase().replaceAll(' ', '-')} key={card.title}>
            <div>
              <p className="eyebrow">{card.meta}</p>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
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
