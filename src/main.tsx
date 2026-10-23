import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { preloadRoute } from "./App";
import { readAppearance } from "./hooks/useAppearance";
import { hrefOf, legacyHashTarget, parseLocation } from "./docs/router";
import "./index.css";

// Link chia sẻ kiểu cũ (#/components/button) → đường dẫn mới trước khi render.
const legacy = legacyHashTarget(window.location);
if (legacy) window.history.replaceState(null, "", legacy);

// Ngôn ngữ, theo thứ tự: ?lang= (link cũ, dùng một lần rồi bỏ khỏi URL), URL /en/…, rồi lựa chọn đã lưu — trang tiếng Việt
// mở bản tiếng Anh nếu người dùng đã chọn tiếng Anh.
const params = new URLSearchParams(window.location.search);
const current = parseLocation(window.location.pathname);
const lang = !params.get("lang") && current.lang === "en" ? "en" : readAppearance().lang;
if (lang !== current.lang || params.has("lang")) {
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
