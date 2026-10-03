import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Delete Account',
  description: 'Request deletion of your Loop Local account, saved events, and submitted local listing data.',
};

export default function DeleteAccountPage() {
  return (
    <LegalPage eyebrow="Account deletion" title="Delete Account or Data" updated="October 2, 2026">
      <section>
        <h2>Signed-in account data</h2>
        <p>Sign in first so Loop Local can verify the account. Then contact support from the same email address used for the account and request deletion.</p>
        <p><Link href="/account">Sign in to your account</Link></p>
      </section>
      <section>
        <h2>What can be deleted</h2>
        <ul>
          <li>Account profile fields, including display name and email-linked profile records.</li>
          <li>Saved events attached to the account.</li>
          <li>Submitted listing drafts, pending submissions, and non-public submitter contact details when deletion is allowed.</li>
        </ul>
      </section>
      <section>
        <h2>Public listings and records</h2>
        <p>Approved public listing content may need separate review before removal, especially when it describes a public event or business. Security, audit, review, fraud-prevention, and backup records may be retained when required for operational or legal reasons.</p>
      </section>
      <section>
        <h2>Support request</h2>
        <p>Until the automated deletion endpoint is enabled, start the request from the <Link href="/support">Support</Link> page and include the account email plus any submission status link you want reviewed.</p>
      </section>
    </LegalPage>
  );
}
