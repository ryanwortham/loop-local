import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Local Loop',
  description: 'Local Loop community app cockpit backed by Supabase.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
