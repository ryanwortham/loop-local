import type { Metadata } from 'next';
import { OperatorReviewPanel } from '@/components/operator-review-panel';

export const metadata: Metadata = {
  title: 'Operator reviews | Loop Local',
  description: 'Protected local operator review queue for Post Local submissions.',
};

export default function OperatorReviewsPage() {
  // operator-review-route-pass: OperatorReviewPanel lives at /operator/reviews and verifies a Supabase operator session.
  return <OperatorReviewPanel />;
}
