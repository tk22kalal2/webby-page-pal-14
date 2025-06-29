

const CACHE_NAME = 'nextpulse-v1';
const urlsToCache = [
  '/index2.html',
  '/homepage/homepage-styles.css',
  '/homepage/homepage-script.js',
  '/styles.css',
  '/script.js',
  '/platforms.html',
  '/search.html',
  '/quiz/index.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

