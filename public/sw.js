// Service worker: ilk ziyaretten sonra site internetsiz çalışır.
// Sürüm numarası her yayında derleme betiğiyle güncellenir (__SURUM__).
const SURUM = '__SURUM__';
const ONBELLEK = 'esoterica-' + SURUM;
const KOK = '/esoterica/';

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(ONBELLEK).then((c) => c.addAll([KOK, KOK + 'index.html', KOK + 'manifest.webmanifest', KOK + 'favicon.svg'])).then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== ONBELLEK).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

// Aynı kökten gelen her şey: önce önbellek, yoksa ağ ve önbelleğe al.
// Hiçbir zaman başka bir kökene istek atılmaz.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin !== self.location.origin || e.request.method !== 'GET') return;
  e.respondWith(
    caches.match(e.request).then((hit) => {
      if (hit) return hit;
      return fetch(e.request).then((res) => {
        if (res.ok) caches.open(ONBELLEK).then((c) => c.put(e.request, res.clone()));
        return res;
      }).catch(() => (e.request.mode === 'navigate' ? caches.match(KOK + 'index.html') : undefined));
    }),
  );
});

// Gizlilik için ön yükleme: sayfa "onyukle" mesajı gönderince tüm modüller arka planda alınır.
self.addEventListener('message', (e) => {
  if (e.data?.tip !== 'onyukle' || !Array.isArray(e.data.dosyalar)) return;
  caches.open(ONBELLEK).then((c) => c.addAll(e.data.dosyalar.filter((d) => d.startsWith(KOK)))).catch(() => {});
});
