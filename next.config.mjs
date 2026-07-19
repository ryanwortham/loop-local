/** @type {import('next').NextConfig} */
const privateStatusHeaders = [
  { key: 'Cache-Control', value: 'private, no-store, max-age=0, must-revalidate' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  { key: 'X-Robots-Tag', value: 'noindex, noarchive, nosnippet' },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      { source: '/post-local/status/:path*', headers: privateStatusHeaders },
      { source: '/api/local-submissions/:path*', headers: privateStatusHeaders },
    ];
  },
};

export default nextConfig;
