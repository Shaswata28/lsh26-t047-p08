// School GPA Engine — Service Worker
// Caches the application shell and static assets for offline functionality.

const CACHE_NAME = 'gpa-engine-v1';

// Core app shell assets to pre-cache on install
const APP_SHELL_ASSETS = [
  '/',
  '/anomalies',
  '/manifest.json',
];

// ─── Install ──────────────────────────────────────────────────────────────────
// Pre-cache the app shell so the app is immediately usable offline.
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching app shell');
      return cache.addAll(APP_SHELL_ASSETS);
    })
  );
  // Take control immediately without waiting for old SW to be released
  self.skipWaiting();
});

// ─── Activate ─────────────────────────────────────────────────────────────────
// Clean up stale caches from previous service worker versions.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  // Claim all open clients so the new SW takes effect right away
  self.clients.claim();
});

// ─── Fetch ────────────────────────────────────────────────────────────────────
// Strategy: Cache-First for static assets, Network-First for navigation.
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and cross-origin requests
  if (request.method !== 'GET' || url.origin !== self.location.origin) {
    return;
  }

  // Navigation requests: Network-First with cache fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Clone and store a fresh copy in cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        })
        .catch(() => {
          // Network failed — serve from cache if available
          return caches.match(request).then((cached) => cached || caches.match('/'));
        })
    );
    return;
  }

  // Static assets (_next/static, fonts, images): Cache-First
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/_next/image/') ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|woff2?|ico)$/)
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone));
          return response;
        });
      })
    );
    return;
  }
});
