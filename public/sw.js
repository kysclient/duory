// Service Worker for Duory PWA
// IMPORTANT: Change this version number on every deployment to force cache refresh
const VERSION = 'v2.0.0';
const CACHE_NAME = `duory-cache-${VERSION}`;
const IMAGE_CACHE = `duory-images-${VERSION}`;

const STATIC_ASSETS = [
  '/offline',
  '/logo_180.png',
  '/logo_512.png',
  '/heart.png',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing new service worker:', VERSION);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating new service worker:', VERSION);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== IMAGE_CACHE)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - Network First for Next.js build files, Cache First for images
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Skip chrome extensions and other protocols
  if (!url.protocol.startsWith('http')) return;

  // Skip API calls and Supabase auth
  if (url.pathname.startsWith('/api') || url.hostname.includes('supabase.co/auth')) {
    return;
  }

  // Network First for Next.js build files (CSS, JS chunks) - NEVER cache these
  if (url.pathname.includes('/_next/static/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Always return fresh build files, never cache
          return response;
        })
        .catch(() => {
          // If offline and navigation request, show offline page
          if (request.mode === 'navigate') {
            return caches.match('/offline');
          }
          return new Response('Network error', { status: 503 });
        })
    );
    return;
  }

  // Cache First for Supabase Storage images
  if (url.hostname.includes('supabase.co') && url.pathname.includes('/storage/')) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          
          return fetch(request).then((response) => {
            if (response && response.status === 200) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  // Network First for HTML pages
  if (request.mode === 'navigate' || url.pathname === '/') {
    event.respondWith(
      fetch(request)
        .then((response) => response)
        .catch(() => caches.match('/offline'))
    );
    return;
  }

  // Cache First for static assets (logo, heart.png, etc.)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(request);
    })
  );
});

