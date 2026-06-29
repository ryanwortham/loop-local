import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Loop Local',
    short_name: 'Loop Local',
    description: 'Find what is worth doing near you right now.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait-primary',
    background_color: '#f5f5f7',
    theme_color: '#0071e3',
    categories: ['lifestyle', 'travel', 'social', 'productivity'],
    icons: [
      {
        src: '/looplocal-icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/looplocal-icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/looplocal-logo-app.png',
        sizes: '1254x1254',
        type: 'image/png',
        purpose: 'any',
      },
    ],
    shortcuts: [
      {
        name: 'Post Local',
        short_name: 'Post',
        description: 'Submit an event, deal, or local update.',
        url: '/post-local',
        icons: [{ src: '/looplocal-icon-192.png', sizes: '192x192' }],
      },
      {
        name: 'Events Nearby',
        short_name: 'Events',
        description: 'See what is happening nearby.',
        url: '/#events',
        icons: [{ src: '/looplocal-icon-192.png', sizes: '192x192' }],
      },
    ],
  };
}
