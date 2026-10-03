import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal-page';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms for using Loop Local discovery, saved events, and Post Local submissions.',
};

export default function TermsPage() {
  return (
    <LegalPage eyebrow="Terms" title="Terms of Use" updated="October 2, 2026">
      <section>
        <h2>Use of Loop Local</h2>
        <p>Loop Local helps people discover local events, business activity, and community updates. You agree to use the service lawfully and not interfere with the app, the review workflow, or other users.</p>
      </section>
      <section>
        <h2>Submitted listings</h2>
        <p>Submitted events, business listings, images, links, and contact details may be reviewed before publication. Submission does not guarantee approval, publication, ranking, or continued display.</p>
        <p>You are responsible for the accuracy of the information you submit and for having the right to provide any images, logos, or text included in the submission.</p>
      </section>
      <section>
        <h2>Local information</h2>
        <p>Loop Local may link to third-party event pages, venues, maps, ticket providers, and business websites. Details can change, so users should confirm time, pricing, availability, and safety information with the event host or venue before attending.</p>
      </section>
      <section>
        <h2>Accounts</h2>
        <p>You are responsible for keeping your sign-in credentials secure. Operator tools are limited to authorized accounts and may be removed if misused.</p>
      </section>
      <section>
        <h2>Support</h2>
        <p>Questions about these terms can be started from the <a href="/support">Support</a> page.</p>
      </section>
    </LegalPage>
  );
}
