/**
 * Sewaka Service Worker
 * Cache-first strategy for static assets, network-first for API calls
 */

const CACHE_NAME = 'sewaka-v2';
const STATIC_CACHE = 'sewaka-static-v2';
const API_CACHE = 'sewaka-api-v2';

// Critical routes to cache
const CRITICAL_ROUTES = [
  '/',
  '/dashboard',
  '/tasks',
  '/budget',
  '/vendors',
  '/guests',
  '/documents',
  '/gallery',
  '/contracts',
  '/events',
  '/seserahan',
  '/encyclopedia',
  '/subscription',
  '/settings',
  '/workspaces',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CRITICAL_ROUTES);
    }).catch(() => {
      console.log('Sewaka SW: Install failed, continuing...');
    })
  );
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== STATIC_CACHE && cacheName !== API_CACHE)
          .map((cacheName) => caches.delete(cacheName))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!url.protocol.startsWith('http')) return;

  // Skip non-same-origin requests
  if (url.origin !== location.origin) return;

  // API calls - network-first
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets - cache-first
  if (
    request.destination === 'script' ||
    request.destination === 'style' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML pages - network-first with cache fallback
  event.respondWith(networkFirst(request));
});

// Cache-first strategy (for static assets)
async function cacheFirst(request) {
  // Cache API only supports GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Network-first strategy (for API and pages)
async function networkFirst(request) {
  // Cache API only supports GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(API_CACHE);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // Network failed - try cache
    const cached = await caches.match(request);
    if (cached) return cached;

    // For HTML pages, return offline page
    if (request.destination === 'document') {
      return caches.match('/offline');
    }

    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' });
  }
}

// Background sync - retry failed API calls
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-form-data') {
    event.waitUntil(syncFormData());
  }
});

async function syncFormData() {
  // Placeholder for background sync logic
  console.log('Sewaka SW: Syncing form data...');
}

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data?.json();
  const options = {
    body: data?.body || 'Notifikasi baru dari Sewaka',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data?.url || '/',
    actions: [
      { action: 'open', title: 'Buka' },
      { action: 'close', title: 'Tutup' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification('Sewaka', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data || '/')
  );
});
