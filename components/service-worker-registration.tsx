'use client';

import { useEffect } from 'react';

export function ServiceWorkerRegistration() {
  // service-worker-registration-pass: register PWA shell after hydration without touching dynamic API cache behavior.
  useEffect(() => {
    if (!('serviceWorker' in navigator) || process.env.NODE_ENV !== 'production') return;
    navigator.serviceWorker.register('/sw.js').catch(() => undefined);
  }, []);
  return null;
}
