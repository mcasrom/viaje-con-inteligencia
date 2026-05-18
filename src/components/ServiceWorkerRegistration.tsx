'use client';

import { useEffect } from 'react';

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;

    (async () => {
      // Unregister any old SW at /sw.js (cached by Cloudflare with old v6 code)
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        if (reg.scope === new URL('/', location.href).href) {
          await reg.unregister();
          console.log('Old SW unregistered:', reg.scope);
        }
      }

      // Register new SW with cache-busting param to bypass Cloudflare cache
      try {
        const registration = await navigator.serviceWorker.register('/sw.js?v=7');
        console.log('SW registered:', registration.scope);
      } catch (error) {
        console.log('SW registration failed:', error);
      }
    })();
  }, []);

  return null;
}