// Service worker XEILOS : reçoit les notifications push (envoyées par la
// fonction send-push d'Axone, abonnements app = "xeilos") et ouvre la bonne page.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));

// Les rappels de scalping viennent d'Axone avec une adresse du journal Axone :
// dans XEILOS, on les ouvre sur la page Notifications.
function adresseXeilos(url) {
  if (typeof url !== "string" || !url.startsWith("/")) return "/dashboard";
  if (url.startsWith("/research/")) return "/dashboard/notifications";
  return url;
}

self.addEventListener("push", (event) => {
  let data = {};
  try { data = event.data ? event.data.json() : {}; } catch { data = { body: event.data ? event.data.text() : "" }; }
  const title = data.title || "Xeilos";
  event.waitUntil(
    self.registration.showNotification(title, {
      body: data.body || "",
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      tag: data.tag || undefined,
      renotify: !!data.tag,
      data: { url: adresseXeilos(data.url) },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || "/dashboard";
  event.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenetres) => {
      for (const f of fenetres) {
        if ("focus" in f) { f.navigate(url); return f.focus(); }
      }
      return self.clients.openWindow(url);
    }),
  );
});
