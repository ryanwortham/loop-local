import { StatusCard } from '@/components/status-card';
import { projectRef } from '@/lib/env';

const ranges = ['Today', 'Last 3 days', 'Last 7 days', 'This month'];
const nav = ['Dashboard', 'Places', 'Loops', 'Events', 'Profile', 'Admin'];

const launchCards = [
  {
    title: 'Places',
    body: 'Local businesses, services, venues, and community anchors ready for discovery.',
    metric: '0 records',
  },
  {
    title: 'Loops',
    body: 'Neighborhood groups, interest circles, recommendations, and repeatable community flows.',
    metric: '0 loops',
  },
  {
    title: 'Events',
    body: 'A calendar surface for what is happening nearby, with time-window filters ready.',
    metric: '0 events',
  },
  {
    title: 'Admin',
    body: 'Operator controls for schema readiness, Supabase health, content review, and guardrails.',
    metric: 'ready',
  },
];

export function AppShell() {
  return (
    <main className="app-shell">
      <nav className="top-nav" aria-label="Primary navigation">
        <div className="brand-lockup">
          <span className="brand-mark">LL</span>
          <div>
            <strong>Local Loop</strong>
            <small>community operating layer</small>
          </div>
        </div>
        <div className="nav-links">
          {nav.map((item) => (
            <a href={`#${item.toLowerCase()}`} key={item}>{item}</a>
          ))}
        </div>
      </nav>

      <section className="hero" id="dashboard">
        <div className="hero-copy">
          <p className="eyebrow">Supabase connected · project {projectRef}</p>
          <h1>Build the local network where places, people, loops, and events meet.</h1>
          <p>
            A polished starter cockpit for the Local Loop App. The cloud project is linked, the local stack is running, and this shell is ready for real schema-backed features.
          </p>
          <div className="actions">
            <a className="primary-action" href="http://127.0.0.1:54323">Open local Supabase Studio</a>
            <a className="secondary-action" href="https://supabase.com/dashboard/project/itraeknotcdtdzaeukan">Open cloud project</a>
          </div>
        </div>
        <div className="hero-panel" aria-label="Readiness panel">
          <StatusCard label="Supabase" value="Linked" detail="Local Loop App · West US" tone="green" />
          <StatusCard label="Local API" value=":54321" detail="REST and GraphQL running" tone="blue" />
          <StatusCard label="Studio" value=":54323" detail="Local database console" tone="neutral" />
        </div>
      </section>

      <section className="range-tabs" aria-label="Time range filters">
        {ranges.map((range, index) => (
          <button className={index === 0 ? 'active' : ''} key={range} type="button">{range}</button>
        ))}
      </section>

      <section className="card-grid" aria-label="Initial app sections">
        {launchCards.map((card) => (
          <article className="feature-card" id={card.title.toLowerCase()} key={card.title}>
            <div>
              <p className="eyebrow">{card.metric}</p>
              <h2>{card.title}</h2>
              <p>{card.body}</p>
            </div>
            <span className="card-arrow">↗</span>
          </article>
        ))}
      </section>

      <section className="operator-strip">
        <div>
          <p className="eyebrow">Next schema move</p>
          <h2>Start with read models before write workflows.</h2>
          <p>
            The remote schema pull found no migrations to generate, so the safest next step is to design the first tables for places, loops, events, and memberships locally before pushing anything remote.
          </p>
        </div>
        <code>supabase db pull --linked → No schema changes found</code>
      </section>
    </main>
  );
}
