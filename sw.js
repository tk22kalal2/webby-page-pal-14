const CACHE_NAME = 'nextpulse-pwa-v4';
const DOMAIN = 'web.afrahtafreeh.site';
const PROTOCOL = 'https:';

// Define URLs to cache with proper domain handling
const urlsToCache = [
  '/',
  '/index.html',
  '/app.html',
  '/app.webmanifest',
  '/icon-192.png',
  '/icon-512.png',
  '/styles.css',
  '/src/home/home.css'
];

// Install service worker and cache assets
self.addEventListener('install', event => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache.map(url => {
          // For custom domain, ensure proper URL construction
          if (url.startsWith('/')) {
            return `${PROTOCOL}//${DOMAIN}${url}`;
          }
          return url;
        }));
      })
      .catch(error => {
        console.error('Cache addAll failed:', error);
      })
  );
});

// Serve cached content when offline
self.addEventListener('fetch', event => {
  // Only handle requests from our domain
  const url = new URL(event.request.url);
  if (url.hostname !== DOMAIN && url.hostname !== 'localhost') {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match('/app.html').then(response => {
        if (response) {
          return response;
        }
        // Fallback to network request with proper URL
        return fetch(`${PROTOCOL}//${DOMAIN}/app.html`).catch(() => {
          // If network fails, try to serve index.html
          return caches.match('/index.html');
        });
      })
    );
    return;
  }
  
  // For all other requests, use cache-first strategy
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached response if found
        if (response) {
          return response;
        }
        
        // Otherwise fetch from network
        return fetch(event.request).catch(() => {
          // If network fails and it's a CSS file, try to serve from cache with different path
          if (event.request.url.includes('.css')) {
            return caches.match(event.request.url.split('/').pop());
          }
          throw new Error('Network request failed and no cache available');
        });
      })
  );
});

// Update the service worker
self.addEventListener('activate', event => {
  console.log('Service Worker activating...');
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Handle messages from the main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
