// Service Worker para PWA - BarConnect
// Versão otimizada para uso em hotéis com conexão instável

const CACHE_NAME = 'barconnect-v1.0';
const STATIC_CACHE = 'barconnect-static-v1.0';
const DYNAMIC_CACHE = 'barconnect-dynamic-v1.0';

// Recursos críticos que devem funcionar offline
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/comandas',
  '/produtos',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/manifest.json',
  // Adicionar outros recursos críticos
];

// Recursos que podem ser cached dinamicamente
const DYNAMIC_CACHE_PATHS = [
  '/api/comandas',
  '/api/produtos', 
  '/api/transacoes',
  '/api/dashboard'
];

// Install Event - Cache recursos críticos
self.addEventListener('install', (event) => {
  console.log('🏨 BarConnect SW: Installing for hotel use...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('📦 Caching critical assets for offline use');
        return cache.addAll(STATIC_ASSETS);
      })
      .catch((error) => {
        console.error('❌ Failed to cache static assets:', error);
      })
  );
  
  // Force activate new service worker
  self.skipWaiting();
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 BarConnect SW: Activating...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  // Take control immediately
  self.clients.claim();
});

// Fetch Event - Cache Strategy for Hotel Environment
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Strategy for static assets (Cache First)
  if (STATIC_ASSETS.some(asset => url.pathname.includes(asset))) {
    event.respondWith(
      caches.match(request)
        .then((cachedResponse) => {
          if (cachedResponse) {
            console.log('📦 Serving from cache:', url.pathname);
            return cachedResponse;
          }
          
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put(request, responseClone));
              return response;
            });
        })
        .catch(() => {
          console.log('📱 Offline: Serving cached version');
          return caches.match('/offline.html') || 
                 new Response('App offline - cached data available');
        })
    );
    return;
  }
  
  // Strategy for API calls (Network First with fallback)
  if (url.pathname.startsWith('/api/') || DYNAMIC_CACHE_PATHS.some(path => url.pathname.includes(path))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          console.log('🏨 Network failed, checking cache for:', url.pathname);
          return caches.match(request)
            .then((cachedResponse) => {
              if (cachedResponse) {
                console.log('📱 Serving cached API response');
                return cachedResponse;
              }
              
              // Return offline indicator for API calls
              return new Response(
                JSON.stringify({ 
                  offline: true, 
                  message: 'Dados em cache - reconectando...',
                  timestamp: Date.now()
                }),
                { 
                  headers: { 'Content-Type': 'application/json' },
                  status: 200 
                }
              );
            });
        })
    );
    return;
  }
  
  // Default strategy (Network First)
  event.respondWith(
    fetch(request)
      .then((response) => {
        const responseClone = response.clone();
        caches.open(DYNAMIC_CACHE)
          .then((cache) => cache.put(request, responseClone));
        return response;
      })
      .catch(() => {
        return caches.match(request)
          .then((cachedResponse) => {
            return cachedResponse || caches.match('/offline.html');
          });
      })
  );
});

// Background Sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-comandas') {
    event.waitUntil(syncComandas());
  }
  
  if (event.tag === 'background-sync-transactions') {
    event.waitUntil(syncTransactions());
  }
});

// Push notifications for hotel staff
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'Nova notificação do BarConnect',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver Detalhes',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Fechar',
        icon: '/icons/close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('BarConnect - Hotel', options)
  );
});

// Helper functions for sync
async function syncComandas() {
  try {
    // Get pending comandas from IndexedDB
    // Sync with server when connection is restored
    console.log('🔄 Syncing comandas...');
  } catch (error) {
    console.error('❌ Failed to sync comandas:', error);
  }
}

async function syncTransactions() {
  try {
    // Get pending transactions from IndexedDB
    // Sync with server when connection is restored
    console.log('🔄 Syncing transactions...');
  } catch (error) {
    console.error('❌ Failed to sync transactions:', error);
  }
}

console.log('🏨 BarConnect Service Worker loaded - Ready for hotel operations!');