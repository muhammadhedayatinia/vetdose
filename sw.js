/**
 * Service Worker: سامانه آفلاین لیب‌دوز (LibDose PWA Offline Engine - LibVet)
 * نسخه ۳.۱۷.۰ - هدر عریض بدون کادر و نشان شفاف با ابعاد بزرگ و باوقار
 */
const CACHE_NAME = 'libdose-cache-v3.19.0-real-master-pwa-app-icon';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './fonts/YekanBakh-Regular.woff2',
  './fonts/YekanBakh-SemiBold.woff2',
  './fonts/YekanBakh-Bold.woff2',
  './fonts/YekanBakh-ExtraBold.woff2',
  './data/drugs.js',
  './data/plumbs_interaction_matrix.js',
  './data/pharmacology_depth.js',
  './data/specialty_protocols.js',
  './data/clinical_vault.js',
  './manifest.json',
  './favicon.svg',
  './favicon.png',
  './assets/logos/libdose_1a_app_icon.jpg',
  './assets/logos/libdose_brand_header.jpg',
  './assets/logos/libdose_brand_header.png',
  './assets/logos/libdose_pwa_icon_512.png',
  './assets/logos/libdose_pwa_icon_192.png',
  './assets/logos/libdose_apple_touch_icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[PWA ServiceWorker] Caching offline assets v2.6...');
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[PWA ServiceWorker] Purging old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // استراتژی Network-First: اول دریافت آخرین تغییرات و در صورت آفلاین بودن رجوع به کش
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
      }
      return networkResponse;
    }).catch(() => {
      // حالت آفلاین
      return caches.match(event.request);
    })
  );
});
