import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Loop Local handles account, saved-event, and local submission data.',
};

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="Privacy" title="Privacy Policy" updated="October 2, 2026">
      <section>
        <h2>What Loop Local collects</h2>
        <p>Loop Local collects the information needed to run local discovery, account access, saved events, and the Post Local submission workflow.</p>
        <ul>
          <li>Account information, such as email address, display name, authentication identifiers, and operator role status.</li>
          <li>Saved event identifiers when a signed-in user saves events to their account.</li>
          <li>Submitted business, event, contact, and media details when someone posts a local listing for review.</li>
          <li>Basic technical data, such as request timing, rate-limit signals, health checks, and security logs needed to protect the service.</li>
        </ul>
      </section>
      <section>
        <h2>How the information is used</h2>
        <p>We use this information to show local events, support sign-in, sync saved events, review submitted listings, publish approved local content, prevent abuse, troubleshoot issues, and keep the app reliable.</p>
      </section>
      <section>
        <h2>Sharing</h2>
        <p>Approved public listing details may appear in Loop Local discovery. Account credentials, private review notes, submitter status tokens, and non-public contact details are not intentionally published.</p>
      </section>
      <section>
        <h2>Data deletion</h2>
        <p>Users can request account or submission data deletion from the Delete Account page. Some public listing records, security records, review history, or backups may need to be retained when required for fraud prevention, operational integrity, or legal reasons.</p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Privacy and support requests can be started from the <a href="/support">Support</a> page.</p>
      </section>
    </LegalPage>
  );
}
