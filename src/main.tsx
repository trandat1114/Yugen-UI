import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { preloadRoute } from "./App";
import { readAppearance } from "./hooks/useAppearance";
import { hrefOf, legacyHashTarget, parseLocation, PREFIXED_LOCALE } from "./docs/router";
import "./index.css";

// Link chia sẻ kiểu cũ (#/components/button) → đường dẫn mới trước khi render.
const legacy = legacyHashTarget(window.location);
if (legacy) window.history.replaceState(null, "", legacy);

// Ngôn ngữ, theo thứ tự: ?lang= (link cũ, dùng một lần rồi bỏ khỏi URL), URL /vi/…, rồi lựa chọn đã lưu — trang tiếng Anh
// (không tiền tố) mở bản tiếng Việt nếu người dùng đã chọn tiếng Việt. URL /en/… của docs ≤ 0.13 đổi sang URL chuẩn (#277).
const params = new URLSearchParams(window.location.search);
const current = parseLocation(window.location.pathname);
const lang = !params.get("lang") && current.lang === PREFIXED_LOCALE ? PREFIXED_LOCALE : current.legacy ? "en" : readAppearance().lang;
if (lang !== current.lang || current.legacy || params.has("lang")) {
  params.delete("lang");
  const search = params.toString() ? `?${params}` : "";
  window.history.replaceState(null, "", hrefOf(current.route, lang) + search + window.location.hash);
}

// #root có sẵn HTML prerender (scripts/prerender.mjs). Không hydrate: demo phụ thuộc ngày giờ, theme và cài đặt đã lưu nên
// HTML dựng lúc build không khớp hoàn toàn. Nạp trước phần của route rồi render một lần — React thay HTML cũ khi commit.
const root = createRoot(document.getElementById("root")!);
void preloadRoute(current.route, lang).then(() =>
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
