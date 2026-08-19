import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SavedShareActions } from '@/components/event-detail-client-actions';
import { eventDetailPath, eventExternalUrl, eventImageState, eventSlug, eventVisualKey, fallbackVisualLabel, type LiveFeedItem } from '@/lib/live-feed';
import { getEventBySlug, getLiveFeed } from '@/lib/live-feed-server';

type EventDetailPageProps = {
  params: Promise<{ slug: string }>;
};

// local-published-detail-pages-pass: locally published API-backed events are resolved on demand.
export const dynamic = 'force-dynamic';

function eventImage(item: LiveFeedItem): string {
  return item.image_url || item.fallbackImageUrl || '/looplocal-event-placeholder.jpg';
}

function dayBlock(item: LiveFeedItem) {
  const date = item.date ? new Date(item.date) : null;
  return {
    month: date ? date.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' }) : 'Soon',
    day: date ? String(date.getUTCDate()) : '•',
  };
}

function venueLine(item: LiveFeedItem): string {
  return item.business || item.location || 'Local venue';
}

function addressLine(item: LiveFeedItem): string {
  return [item.address, item.city, item.state, item.zip].filter(Boolean).join(', ');
}

function eventTimeLine(item: LiveFeedItem): string {
  return [item.date, item.time].filter(Boolean).join(' · ') || 'Date and time pending';
}

function priceLine(item: LiveFeedItem): string {
  if (item.price) return item.price;
  if (item.ticketUrl || item.ticket_url) return 'Tickets available';
  return 'Free or details pending';
}

function mapQuery(item: LiveFeedItem): string {
  return encodeURIComponent(addressLine(item) || venueLine(item) || item.city || item.title);
}

function calendarHref(item: LiveFeedItem): string {
  const escape = (value: string) => value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
  const formatUtc = (value: number) => new Date(value).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const start = Date.parse(item.startsAt || item.date || '');
  const end = Date.parse(item.endsAt || '');
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL || 'https://looplocal.com').replace(/\/$/, '');
  const cleanUrl = `${siteUrl}${eventDetailPath(item)}`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Loop Local//Plan It//EN', 'BEGIN:VEVENT', `UID:${escape(item.id)}@looplocal.com`, `DTSTAMP:${formatUtc(Date.now())}`];
  if (Number.isFinite(start)) {
    lines.push(`DTSTART:${formatUtc(start)}`);
    lines.push(`DTEND:${formatUtc(Number.isFinite(end) ? end : start + 2 * 60 * 60 * 1000)}`);
  }
  lines.push(`SUMMARY:${escape(item.title)}`, `DESCRIPTION:${escape(item.summary || '')}`, `LOCATION:${escape(addressLine(item) || venueLine(item))}`, `URL:${cleanUrl}`, 'END:VEVENT', 'END:VCALENDAR');
  return `data:text/calendar;charset=utf-8,${encodeURIComponent(lines.join('\r\n'))}`;
}

function eventEnd(item: LiveFeedItem): number {
  const end = Date.parse(item.endsAt || '');
  if (Number.isFinite(end)) return end;
  const start = Date.parse(item.startsAt || '');
  return Number.isFinite(start) ? start + 4 * 60 * 60 * 1000 : Number.POSITIVE_INFINITY;
}

export async function generateStaticParams() {
  const feed = await getLiveFeed(48);
  return feed.items.slice(0, 24).map((item) => ({ slug: eventSlug(item) }));
}

export async function generateMetadata({ params }: EventDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) return { title: 'Event not found | Loop Local' };

  return {
    title: `${event.title} | Loop Local`,
    description: event.summary || `${event.title} at ${venueLine(event)}. Discover what is happening near you on Loop Local.`,
    openGraph: {
      title: event.title,
      description: event.summary || eventTimeLine(event),
      images: [{ url: eventImage(event), alt: event.title }],
    },
  };
}

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);
  if (!event) notFound();

  const feed = await getLiveFeed(36);
  const date = dayBlock(event);
  const related = feed.items
    .filter((item) => eventSlug(item) !== eventSlug(event))
    .filter((item) => !event.category || item.category === event.category || item.city === event.city)
    .slice(0, 3);
  const sourceUrl = eventExternalUrl(event);
  const hasSourceUrl = sourceUrl !== '#';
  const isCancelled = event.lifecycleStatus === 'cancelled';

  return (
    <main className="event-detail-route-real-page event-detail-page-shell event-detail-polish-pass event-detail-premium-shell complete-frontend-rebuild ux-polish-pass">
      <nav className="event-detail-topbar" aria-label="Event detail navigation">
        <Link className="hero-logo-lockup" href="/">
          <span className="brand-mark brand-mark-image"><span className="brand-logo-image" aria-label="Loop Local" /></span>
          <strong>loop <em>local</em></strong>
        </Link>
        <Link className="secondary-action" href="/#events">← Back to Discover</Link>
      </nav>

      <section className="event-detail-hero-panel event-detail-media-safe">
        <div className={event.image_url ? 'event-detail-page-image' : 'event-detail-page-image local-photo-fallback quiet-placeholder-image'} data-image-state={eventImageState(event)} data-visual-key={eventVisualKey(event)} style={{ backgroundImage: `url(${eventImage(event)})` }}>
          {!event.image_url ? <span className="fallback-visual-label">{fallbackVisualLabel(event)}</span> : null}
          <span className="floating-date event-detail-page-date"><strong>{date.month}</strong><b>{date.day}</b></span>
        </div>
        <div className="event-detail-page-copy event-detail-content-card">
          <div className="event-detail-hero-kicker-row">
            <p className="eyebrow">{event.category || 'Live local'}</p>
            <span>{event.city || 'Nearby'}</span>
          </div>
          <h1>{event.title}</h1>
          <p>{event.summary || `${event.title} is a local pick worth checking out near ${event.city || 'you'}.`}</p>
          <div className="event-detail-quick-facts" aria-label="Quick event facts">
            <span><b>When</b>{eventTimeLine(event)}</span>
            <span><b>Where</b>{venueLine(event)}</span>
            <span><b>Price</b>{priceLine(event)}</span>
          </div>
          <div className="event-detail-action-row event-detail-action-cluster">
            {hasSourceUrl && !isCancelled ? <a className="primary-action" href={sourceUrl}>Reserve / tickets ↗</a> : null}
            <a className="secondary-action" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery(event)}`}>Get directions</a>
            {hasSourceUrl ? <a className="secondary-action" href={sourceUrl}>View source</a> : null}
          </div>
          <SavedShareActions
            calendarHref={calendarHref(event)}
            eventId={event.id}
            eventEndsAt={Number.isFinite(eventEnd(event)) ? new Date(eventEnd(event)).toISOString() : '9999-12-31T23:59:59.000Z'}
            lastVerifiedAt={event.lastVerifiedAt}
            lifecycleStatus={event.lifecycleStatus}
            summary={event.summary || eventTimeLine(event)}
            title={event.title}
            url={eventDetailPath(event)}
          />
        </div>
      </section>

      <section className="event-detail-content-grid">
        <article className="event-detail-info-card">
          <h2>Plan your visit</h2>
          <dl>
            <div><dt>When</dt><dd>{eventTimeLine(event)}</dd></div>
            <div><dt>Where</dt><dd>{venueLine(event)}</dd></div>
            <div><dt>Address</dt><dd>{addressLine(event) || 'Address details pending'}</dd></div>
            <div><dt>Price</dt><dd>{priceLine(event)}</dd></div>
            <div><dt>City</dt><dd>{event.city || 'Nearby'}</dd></div>
          </dl>
        </article>

        <article className="event-detail-map-card">
          <h2>Map preview</h2>
          <div className="event-detail-map-art" aria-label="Map preview"><span>⌖</span></div>
          <p>{addressLine(event) || venueLine(event)}</p>
          <a href={`https://www.google.com/maps/search/?api=1&query=${mapQuery(event)}`}>Open in Maps ↗</a>
        </article>
      </section>

      {related.length ? (
        <section className="event-detail-related-card event-detail-related-polished">
          <header className="section-title-row"><h2>More like this</h2><Link href="/#events">Explore all</Link></header>
          <div className="event-detail-related-grid">
            {related.map((item) => (
              <Link className="popular-list-row" href={eventDetailPath(item)} key={item.id}>
                <div className={item.image_url ? 'popular-thumb' : 'popular-thumb local-photo-fallback quiet-popular-placeholder'} data-image-state={eventImageState(item)} data-visual-key={eventVisualKey(item)} style={{ backgroundImage: `url(${eventImage(item)})` }}>{!item.image_url ? <span>{fallbackVisualLabel(item)}</span> : null}</div>
                <div className="popular-copy">
                  <span className="mini-tag">{item.category || 'Local'}</span>
                  <h3>{item.title}</h3>
                  <p>{venueLine(item)} · {item.city || 'Nearby'}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
