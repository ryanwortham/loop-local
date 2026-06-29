import type { Metadata } from 'next';
import { PostLocalWizard } from '@/components/post-local-wizard';

export const metadata: Metadata = {
  title: 'Post Local | Loop Local',
  description: 'List a business, post an event, or join Loop Local as a community organization.',
};

export default function PostLocalPage() {
  return <PostLocalWizard />;
}
