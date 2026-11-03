/* Service worker của docs (#306). Plugin docsServiceWorker (vite.perf.ts) thêm VERSION và ASSETS (file trong assets/ của
 * bản build) vào đầu file rồi ghi ra <base>/sw.js; main.tsx đăng ký ở bản build, không đăng ký khi chạy E2E.
 *
 * - assets/* (tên có hash, không bao giờ đổi): lấy từ cache, chưa có thì tải rồi cất. GitHub Pages trả max-age=600 nên
 *   không có SW thì cứ 10 phút trình duyệt lại hỏi lại mọi chunk.
 * - Trang (navigate): mạng trước, cất bản mới nhất; mất mạng thì trả bản đã cất của đúng URL đó.
 * - Còn lại (versions.json, ảnh, r/*.json, mọi URL khác origin như dữ liệu người đóng góp): không đụng tới.
 * - Phạm vi: thư mục của bản docs này. Bản docs khác nằm trong thư mục con (next/, vX.Y/) có SW riêng hoặc không có:
 *   bỏ qua, để SW này không trả HTML / chunk của bản khác.
 * - Bản mới kích hoạt: xoá cache trang của bản cũ (HTML cũ trỏ tới chunk cũ) và chunk không còn trong bản build.
 * Tắt khẩn cấp: build với VITE_DOCS_SW=off → sw.js là bản tự gỡ (kill.js). Xem wiki › Operations Handbook.
 */
/* global VERSION, ASSETS */
const SCOPE = new URL(self.registration.scope).pathname;
const PREFIX = `yugen-docs:${SCOPE}:`;
const PAGES = `${PREFIX}pages:${VERSION}`;
const CHUNKS = `${PREFIX}assets`;
const NESTED = /^(next|v\d+\.\d+)(\/|$)/;

self.addEventListener("install", () => self.skipWaiting());

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      await self.registration.navigationPreload?.enable();
      for (const key of await caches.keys()) {
        if (key.startsWith(PREFIX) && key !== PAGES && key !== CHUNKS) await caches.delete(key);
      }
      const keep = new Set(ASSETS.map((file) => new URL(SCOPE + file, self.location.origin).href));
      const chunks = await caches.open(CHUNKS);
      for (const request of await chunks.keys()) if (!keep.has(request.url)) await chunks.delete(request);
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(SCOPE)) return;
  const rest = url.pathname.slice(SCOPE.length);
  if (NESTED.test(rest)) return;
  if (request.mode === "navigate") event.respondWith(page(event, url));
  else if (rest.startsWith("assets/")) event.respondWith(asset(event));
});

async function asset(event) {
  const cache = await caches.open(CHUNKS);
  const hit = await cache.match(event.request);
  if (hit) return hit;
  const response = await fetch(event.request);
  if (response.status === 200) event.waitUntil(cache.put(event.request, response.clone()));
  return response;
}

async function page(event, url) {
  const cache = await caches.open(PAGES);
  // Khoá cache bỏ ?query (theme, brand, dir): cùng một trang.
  const key = url.origin + url.pathname;
  try {
    const response = (await event.preloadResponse) ?? (await fetch(event.request));
    if (response.status === 200 && response.type === "basic") event.waitUntil(cache.put(key, response.clone()));
    return response;
  } catch (error) {
    const cached = await cache.match(key);
    if (cached) return cached;
    throw error;
  }
}
