/* Service worker tự gỡ (#306) — sw.js khi build với VITE_DOCS_SW=off. Trình duyệt đã cài SW cũ tải bản này ở lần mở trang
 * kế tiếp: xoá cache của bản docs này, gỡ đăng ký, tải lại các tab đang mở để chúng đi thẳng ra mạng.
 * Xem wiki › Operations Handbook.
 */
self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const prefix = `yugen-docs:${new URL(self.registration.scope).pathname}:`;
      for (const key of await caches.keys()) if (key.startsWith(prefix)) await caches.delete(key);
      await self.registration.unregister();
      for (const client of await self.clients.matchAll({ type: "window" })) client.navigate(client.url);
    })(),
  );
});
