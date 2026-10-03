import Link from 'next/link';
import type { ReactNode } from 'react';

type LegalPageProps = {
  eyebrow: string;
  title: string;
  updated: string;
  children: ReactNode;
};

export function LegalPage({ eyebrow, title, updated, children }: LegalPageProps) {
  return (
    <main className="legal-page-shell">
      <header className="legal-topbar">
        <Link className="phone-logo" href="/">
          <span className="brand-mark mini"><span className="brand-logo-image" aria-label="Loop Local" /></span>
          loop local
        </Link>
        <Link href="/">Back to discovery</Link>
      </header>
      <article className="legal-card">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p className="legal-updated">Last updated: {updated}</p>
        <div className="legal-content">{children}</div>
      </article>
    </main>
  );
}
