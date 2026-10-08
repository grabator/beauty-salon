/* Offline keš: stranica se otvara i bez interneta sa zadnjim podacima. */
var CACHE = 'glaze-v6';
var CORE = ['./', 'index.html', 'css/style.css', 'css/components.css', 'css/sections.css', 'js/salon.js', 'js/i18n-bs.js', 'js/i18n-en.js', 'js/i18n-de.js', 'js/hand.js', 'js/app.js', 'js/tryon.js', 'js/booking.js', 'js/extras.js', 'js/outfit.js',
  'assets/fonts/instrument-serif.woff2', 'assets/fonts/instrument-serif-italic.woff2', 'assets/fonts/manrope.woff2', 'assets/icons/favicon.svg', 'assets/icons/icon-192.png', 'manifest.webmanifest'];
self.addEventListener('install', function (e) { e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(CORE); }).then(function () { return self.skipWaiting(); })); });
self.addEventListener('activate', function (e) { e.waitUntil(caches.keys().then(function (k) { return Promise.all(k.filter(function (x) { return x !== CACHE; }).map(function (x) { return caches.delete(x); })); }).then(function () { return self.clients.claim(); })); });
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;
  var html = r.mode === 'navigate' || /\.(html|js|css)$/.test(new URL(r.url).pathname);
  if (html) { // prvo mreža (svježi podaci), pa keš
    e.respondWith(fetch(r, { cache: 'no-cache' }).then(function (res) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); return res; }).catch(function () { return caches.match(r, { ignoreSearch: true }).then(function (m) { return m || caches.match('index.html'); }); }));
  } else { // slike i fontovi: prvo keš
    e.respondWith(caches.match(r).then(function (m) { return m || fetch(r).then(function (res) { var cp = res.clone(); caches.open(CACHE).then(function (c) { c.put(r, cp); }); return res; }); }));
  }
});
