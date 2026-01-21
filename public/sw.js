/**
 * SERVICE WORKER - PWA Support
 * Implementación de Progressive Web App con cache estratégico
 */

const CACHE_NAME = 'iica-plataforma-v1';
const RUNTIME_CACHE = 'iica-runtime-v1';

// Recursos para cachear en instalación
const PRECACHE_URLS = [
    '/',
    '/offline',
    '/manifest.json',
    '/favicon.ico',
];

// Estrategias de cache
const CACHE_STRATEGIES = {
    CACHE_FIRST: 'cache-first',
    NETWORK_FIRST: 'network-first',
    STALE_WHILE_REVALIDATE: 'stale-while-revalidate',
    NETWORK_ONLY: 'network-only',
    CACHE_ONLY: 'cache-only',
};

// ============================================================================
// INSTALACIÓN
// ============================================================================

self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');

    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[SW] Precaching recursos');
                return cache.addAll(PRECACHE_URLS);
            })
            .then(() => self.skipWaiting())
    );
});

// ============================================================================
// ACTIVACIÓN
// ============================================================================

self.addEventListener('activate', (event) => {
    console.log('[SW] Activando Service Worker...');

    event.waitUntil(
        caches.keys()
            .then(cacheNames => {
                return Promise.all(
                    cacheNames
                        .filter(name => name !== CACHE_NAME && name !== RUNTIME_CACHE)
                        .map(name => {
                            console.log('[SW] Eliminando cache antiguo:', name);
                            return caches.delete(name);
                        })
                );
            })
            .then(() => self.clients.claim())
    );
});

// ============================================================================
// FETCH - Estrategias de Cache
// ============================================================================

self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Solo cachear requests del mismo origen
    if (url.origin !== self.location.origin) {
        return;
    }

    // Determinar estrategia según el tipo de recurso
    if (request.method !== 'GET') {
        // No cachear requests que no sean GET
        return;
    }

    // Estrategia según tipo de archivo
    if (url.pathname.match(/\.(js|css|woff2?)$/)) {
        // Assets estáticos: Cache First
        event.respondWith(cacheFirst(request));
    } else if (url.pathname.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) {
        // Imágenes: Stale While Revalidate
        event.respondWith(staleWhileRevalidate(request));
    } else if (url.pathname.startsWith('/api/')) {
        // API: Network First
        event.respondWith(networkFirst(request));
    } else {
        // HTML y otros: Network First con fallback
        event.respondWith(networkFirstWithFallback(request));
    }
});

// ============================================================================
// ESTRATEGIAS DE CACHE
// ============================================================================

/**
 * Cache First: Intenta cache primero, luego network
 */
async function cacheFirst(request) {
    const cached = await caches.match(request);
    if (cached) {
        return cached;
    }

    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        console.error('[SW] Cache First falló:', error);
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First: Intenta network primero, luego cache
 */
async function networkFirst(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Stale While Revalidate: Retorna cache y actualiza en background
 */
async function staleWhileRevalidate(request) {
    const cached = await caches.match(request);

    const fetchPromise = fetch(request).then(response => {
        if (response.ok) {
            const cache = caches.open(RUNTIME_CACHE);
            cache.then(c => c.put(request, response.clone()));
        }
        return response;
    });

    return cached || fetchPromise;
}

/**
 * Network First con Fallback a página offline
 */
async function networkFirstWithFallback(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(RUNTIME_CACHE);
            cache.put(request, response.clone());
        }
        return response;
    } catch (error) {
        const cached = await caches.match(request);
        if (cached) {
            return cached;
        }

        // Fallback a página offline
        const offlinePage = await caches.match('/offline');
        if (offlinePage) {
            return offlinePage;
        }

        return new Response('Offline', { status: 503 });
    }
}

// ============================================================================
// PUSH NOTIFICATIONS
// ============================================================================

self.addEventListener('push', (event) => {
    console.log('[SW] Push recibido');

    const data = event.data ? event.data.json() : {};
    const title = data.title || 'IICA Chile';
    const options = {
        body: data.body || 'Nueva convocatoria disponible',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [200, 100, 200],
        data: data.url || '/',
        actions: [
            {
                action: 'open',
                title: 'Ver Detalles',
            },
            {
                action: 'close',
                title: 'Cerrar',
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// ============================================================================
// NOTIFICATION CLICK
// ============================================================================

self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification click:', event.action);

    event.notification.close();

    if (event.action === 'open' || !event.action) {
        const url = event.notification.data || '/';

        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then(clientList => {
                    // Buscar ventana existente
                    for (const client of clientList) {
                        if (client.url === url && 'focus' in client) {
                            return client.focus();
                        }
                    }

                    // Abrir nueva ventana
                    if (clients.openWindow) {
                        return clients.openWindow(url);
                    }
                })
        );
    }
});

// ============================================================================
// BACKGROUND SYNC
// ============================================================================

self.addEventListener('sync', (event) => {
    console.log('[SW] Background sync:', event.tag);

    if (event.tag === 'sync-favorites') {
        event.waitUntil(syncFavorites());
    }
});

async function syncFavorites() {
    try {
        // Aquí iría la lógica de sincronización
        console.log('[SW] Sincronizando favoritos...');
        return Promise.resolve();
    } catch (error) {
        console.error('[SW] Error sincronizando:', error);
        return Promise.reject(error);
    }
}

// ============================================================================
// MESSAGE HANDLER
// ============================================================================

self.addEventListener('message', (event) => {
    console.log('[SW] Mensaje recibido:', event.data);

    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then(cacheNames => {
                return Promise.all(
                    cacheNames.map(name => caches.delete(name))
                );
            })
        );
    }
});
