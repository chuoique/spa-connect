// Service worker: giữ bản sao trang + thư viện trong máy.
// Mở app sẽ dùng ngay bản trong máy (nhanh, chạy được cả khi GitHub Pages sập),
// đồng thời tải bản mới ở nền cho lần mở sau.
const CACHE = 'spa-v4';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './apple-touch-icon.png',
  './lib/mqtt.min.js',
  './lib/forge.min.js',
  './lib/nostr.bundle.js',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // MQTT, STUN... không đi qua đây
  e.respondWith(caches.open(CACHE).then(async c => {
    const hit = await c.match(e.request, { ignoreSearch: true });
    const fresh = fetch(e.request).then(r => { if (r.ok) c.put(e.request, r.clone()); return r; }).catch(() => null);
    return hit || (await fresh) || new Response('Không có mạng và chưa có bản lưu', { status: 503 });
  }));
});
