/* relaycat service worker — Web Push receiver.
 *
 * Kept deliberately tiny: it only exists to receive pushes and route clicks.
 * The server encrypts a JSON payload ({ title, body, url, tag }) which arrives
 * in the `push` event; we render it as an OS notification. Clicking it focuses
 * an existing relaycat tab (navigating it to `url`) or opens a new one.
 */

self.addEventListener("install", () => {
  // Activate this worker immediately rather than waiting for old tabs to close.
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("push", (event) => {
  let data = {};
  try {
    data = event.data ? event.data.json() : {};
  } catch {
    data = { title: "relaycat", body: event.data ? event.data.text() : "" };
  }

  const title = data.title || "relaycat";
  const options = {
    body: data.body || "",
    icon: "/icons/logo.png",
    badge: "/icons/logo.png",
    // Same tag => the new notification replaces the previous one of that kind.
    tag: data.tag || undefined,
    data: { url: data.url || "/" },
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const target = (event.notification.data && event.notification.data.url) || "/";

  event.waitUntil(
    self.clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          // Reuse any open relaycat tab; steer it to the target route.
          if ("focus" in client) {
            client.navigate(target).catch(() => {});
            return client.focus();
          }
        }
        if (self.clients.openWindow) return self.clients.openWindow(target);
      }),
  );
});
