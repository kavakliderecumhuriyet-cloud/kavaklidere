/* Kavaklıdere – servis çalışanı: hızlı açılış ve çevrimdışı görüntüleme
   HTML ve veri: önce internet, olmazsa önbellek (duyurular hep güncel kalır)
   Tasarım dosyaları: önbellekten anında, arka planda yenilenir */
const SURUM = "kvk-v5";
const TEMEL = ["/", "/index.html", "/assets/site.css", "/assets/app.js", "/data/veri.js",
  "/manifest.webmanifest", "/kurulum.html", "/assets/icon-192.png", "/assets/muhtar.jpg", "/assets/muhtar-kare.jpg", "/offline.html"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(SURUM).then(c => c.addAll(TEMEL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== SURUM).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== "GET" || u.origin !== location.origin) return; // dış servisler (hava, video, sayaç) dokunulmaz
  const agFirst = r.mode === "navigate" || u.pathname.startsWith("/data/") || u.pathname.endsWith(".html");
  if (agFirst) {
    e.respondWith(fetch(r).then(res => { const k = res.clone(); caches.open(SURUM).then(c => c.put(r, k)); return res; })
      .catch(() => caches.match(r).then(m => m || (r.mode === "navigate" ? caches.match("/") .then(x => x || caches.match("/offline.html")) : Response.error()))));
  } else {
    e.respondWith(caches.match(r).then(m => {
      const net = fetch(r).then(res => { if (res.ok) { const k = res.clone(); caches.open(SURUM).then(c => c.put(r, k)); } return res; }).catch(() => m);
      return m || net;
    }));
  }
});
