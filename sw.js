// Service worker: giữ bản sao trang + thư viện trong máy.
// Mở app luôn dùng ngay bản trong máy (nhanh, chạy được cả khi mất Internet / GitHub sập),
// đồng thời tải bản mới ở nền cho lần mở sau.
const CACHE = 'spa-v27';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './apple-touch-icon.png',
  './logo.png',
  './js/i18n.js',
  './logo-mnd.png',
  './js/conn.js',
  './js/app.js',
  './lib/mqtt.min.js',
  './lib/forge.min.js',
  './lib/nostr.bundle.js',
  './lib/qrcode.js',
  './lib/jsQR.js',
];

self.addEventListener('install', e => {
  // cache:'reload' = lấy thẳng từ mạng, bỏ qua bộ nhớ đệm trình duyệt (GitHub cho giữ 10 phút) -> không lưu nhầm bản cũ
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' }))))
    .then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

// Tải từ mạng nhưng chỉ chờ tối đa `ms`: Wi-Fi còn mà mất Internet thì yêu cầu hay bị treo thay vì báo lỗi ngay
function fetchWithin(req, ms) {
  return new Promise(res => {
    const t = setTimeout(() => res(null), ms);
    // no-cache: luôn hỏi lại máy chủ GitHub (có bản mới thì lấy, không thì chỉ tốn vài byte)
    fetch(req.url, { cache: 'no-cache', credentials: 'same-origin' }).then(r => { clearTimeout(t); res(r); }, () => { clearTimeout(t); res(null); });
  });
}

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;   // MQTT, Nostr, STUN... không đi qua đây
  const isPage = e.request.mode === 'navigate';
  e.respondWith(caches.open(CACHE).then(async c => {
    // Mở trang (dù địa chỉ có thêm ?… hay thiếu dấu /) -> luôn dùng trang đã lưu
    const hit = await c.match(e.request, { ignoreSearch: true }) ||
                (isPage ? (await c.match('./', { ignoreSearch: true })) || (await c.match('./index.html')) : null);
    const fresh = fetchWithin(e.request, hit ? 15000 : 3000).then(r => {
      if (r && r.ok) c.put(isPage ? './' : e.request, r.clone());
      return r;
    });
    if (hit) { e.waitUntil(fresh); return hit; }
    return (await fresh) || new Response('Không có mạng và chưa có bản lưu. Hãy mở app một lần khi có Internet.',
      { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }));
});
