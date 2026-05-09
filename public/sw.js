const CACHE_NAME = 'viaje-ia-v6';
const STATIC_CACHE = CACHE_NAME + '-static';
const PAGE_CACHE = CACHE_NAME + '-pages';
const ASSET_CACHE = CACHE_NAME + '-assets';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/favicon.ico',
  '/favicon.jpg',
  '/icon-192.png',
  '/icon-512.png',
  '/offline.html',
  '/logo.png',
];

// Install: precache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== STATIC_CACHE && k !== PAGE_CACHE && k !== ASSET_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Helper: network with offline fallback
async function networkFirst(req, fallbackUrl) {
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(PAGE_CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    const cached = await caches.match(req);
    if (cached) return cached;
    return caches.match(fallbackUrl);
  }
}

// Helper: stale-while-revalidate
async function staleWhileRevalidate(req) {
  const cache = await caches.open(ASSET_CACHE);
  const cached = await cache.match(req);
  const fetchPromise = fetch(req).then((res) => {
    if (res.ok) cache.put(req, res.clone());
    return res;
  }).catch(() => null);
  return cached || fetchPromise;
}

// Helper: cache-first for static assets
async function cacheFirst(req) {
  const cached = await caches.match(req);
  if (cached) return cached;
  try {
    const res = await fetch(req);
    if (res.ok) {
      const cache = await caches.open(ASSET_CACHE);
      cache.put(req, res.clone());
    }
    return res;
  } catch {
    return caches.match('/offline.html');
  }
}

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const { pathname } = url;

  // Never cache API, admin, or auth requests
  if (
    pathname.startsWith('/api/') ||
    pathname.startsWith('/admin') ||
    event.request.headers.get('authorization')
  ) {
    event.respondWith(fetch(event.request).catch(() => new Response(null, { status: 503 })));
    return;
  }

  // Navigation requests: network-first with offline fallback
  if (event.request.mode === 'navigate') {
    event.respondWith(networkFirst(event.request, '/offline.html'));
    return;
  }

  // Static assets (images, fonts, etc.): cache-first
  if (
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|woff2?|ttf|eot)$/)
  ) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // Next.js chunks and JS/CSS: stale-while-revalidate
  if (
    pathname.startsWith('/_next/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css')
  ) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Other requests: stale-while-revalidate
  event.respondWith(staleWhileRevalidate(event.request));
});

// Push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;
  try {
    const data = typeof event.data.json === 'function' ? event.data.json() : JSON.parse(event.data.text());
    const options = {
      body: data.body || '',
      icon: data.icon || '/icon-192.png',
      badge: data.badge || '/icon-192.png',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
      requireInteraction: data.urgent === true,
      tag: data.tag || 'default',
      renotify: data.renotify || false,
    };
    event.waitUntil(self.registration.showNotification(data.title || 'ViajeIA', options));
  } catch {}
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if (client.url === url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});

// Message handler for skipWaiting (update prompt)
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
