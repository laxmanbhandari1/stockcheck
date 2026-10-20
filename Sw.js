// Keeps the app opening even with no signal (network first, cache as backup).
const C = "shell-v2";
self.addEventListener("install", (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches
      .open(C)
      .then((c) =>
        c
          .addAll(["./", "index.html", "manifest.json", "icon.svg"])
          .catch(() => {}),
      ),
  );
});
self.addEventListener("activate", (e) => e.waitUntil(clients.claim()));
self.addEventListener("fetch", (e) => {
  const r = e.request,
    u = new URL(r.url);
  if (r.method !== "GET" || u.hostname.endsWith("supabase.co")) return;
  e.respondWith(
    fetch(r)
      .then((x) => {
        const k = x.clone();
        caches.open(C).then((c) => c.put(r, k));
        return x;
      })
      .catch(() => caches.match(r)),
  );
});
