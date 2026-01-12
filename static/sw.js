// IICA Service Worker - Cache First Strategy for Assets
const CACHE_NAME = 'iica-cache-v1';
const urlsToCache = [
    '/',
    '/static/manifest.json',
    'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                // Cache hit - return response
                if (response) {
                    return response;
                }
                return fetch(event.request);
            })
    );
});
