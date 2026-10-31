/**
 * Service Worker: سامانه آفلاین لیب‌دوز (LibDose PWA True Offline Engine - LibVet)
 * نسخه ۳.۲۶.۰ - کش کامل لوکال و آفلاین واقعی با پشتیبانی کامل از ignoreSearch و Stale-While-Revalidate
 */
const CACHE_NAME = 'libdose-cache-v3.26.0-commercial-ready-engine';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './assets/vendor/tailwind.min.js',
  './assets/vendor/lucide.min.js',
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
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[PWA ServiceWorker v3.25] Pre-caching core offline assets...');
      // کش کردن تک‌تک منابع با مدیریت خطا تا در صورت قطعی اینترنت نصب هرگز متوقف نشود
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) => {
          return cache.add(url).catch((err) => {
            console.warn('[PWA ServiceWorker] Pre-cache non-critical item failed:', url, err);
          });
        })
      );
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
  // فقط درخواست‌های GET با پروتکل http/https مدیریت شوند
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith('http')) return;

  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cachedResponse) => {
      // دریافت موازی از شبکه در پس‌زمینه جهت به‌روز نگه‌داشتن کش (Stale-While-Revalidate)
      const networkFetch = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // خطای شبکه در حالت آفلاین
        return null;
      });

      // ۱. اگر فایل در کش موجود است، فوراً و با سرعت صفر میلی‌ثانیه تحویل داده می‌شود (حالت آفلاین و لود برق‌آسا)
      if (cachedResponse) {
        return cachedResponse;
      }

      // ۲. در غیر این صورت منتظر پاسخ شبکه می‌مانیم
      return networkFetch.then((resp) => {
        if (resp) return resp;
        // اگر باز هم نشد و درخواست بارگذاری صفحه بود، صفحه اصلی آفلاین تحویل شود
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html', { ignoreSearch: true }) || caches.match('./', { ignoreSearch: true });
        }
        return new Response('Offline content unavailable', { status: 503, statusText: 'Offline' });
      });
    })
  );
});
