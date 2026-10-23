// Keeps the app opening even with no signal (network first, cache as backup) and shows phone notifications.
const C = "shell-v3";
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
self.addEventListener("push", (e) => {
  let d = {};
  try {
    d = e.data.json();
  } catch (x) {
    d = { title: "The Shell", body: e.data ? e.data.text() : "" };
  }
  e.waitUntil(
    self.registration.showNotification(d.title || "The Shell", {
      body: d.body || "",
      icon: "icon.svg",
      badge: "icon.svg",
      data: { url: d.url || "./" },
    }),
  );
});
self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  e.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((l) => {
        for (const c of l) {
          if ("focus" in c) return c.focus();
        }
        return clients.openWindow(
          (e.notification.data && e.notification.data.url) || "./",
        );
      }),
  );
});
