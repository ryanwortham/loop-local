import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Support',
  description: 'Get help with Loop Local accounts, saved events, submissions, and operator review.',
};

export default function SupportPage() {
  return (
    <LegalPage eyebrow="Support" title="Loop Local Support" updated="October 2, 2026">
      <section>
        <h2>Account help</h2>
        <p>Use the account screen to sign in, create an account, send a password reset email, update your display name, or change your password.</p>
        <p><Link href="/account">Open account settings</Link></p>
      </section>
      <section>
        <h2>Submit or update a listing</h2>
        <p>Businesses and community organizers can submit events, local updates, and business profile details through Post Local. Approved submissions appear only after operator review.</p>
        <p><Link href="/post-local">Open Post Local</Link></p>
      </section>
      <section>
        <h2>Delete account or data</h2>
        <p>Use the deletion page to request account deletion, saved-event removal, or removal of submitted listing data.</p>
        <p><Link href="/delete-account">Request account or data deletion</Link></p>
      </section>
      <section>
        <h2>App review contact</h2>
        <p>For App Store review, support requests should be routed through this page or the support contact configured in App Store Connect.</p>
      </section>
    </LegalPage>
  );
}
