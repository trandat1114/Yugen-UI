import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App, { preloadRoute } from "./App";
import { readAppearance } from "./hooks/useAppearance";
import { legacyHashTarget, parsePath } from "./docs/router";
import "./index.css";

// Link chia sẻ kiểu cũ (#/components/button) → đường dẫn mới trước khi render.
const legacy = legacyHashTarget(window.location);
if (legacy) window.history.replaceState(null, "", legacy);

// #root có sẵn HTML prerender (scripts/prerender.mjs). Không hydrate: demo phụ thuộc ngày giờ, theme và cài đặt đã lưu nên
// HTML dựng lúc build không khớp hoàn toàn. Nạp trước phần của route rồi render một lần — React thay HTML cũ khi commit.
const root = createRoot(document.getElementById("root")!);
void preloadRoute(parsePath(window.location.pathname), readAppearance().lang).then(() =>
  root.render(
    <StrictMode>
      <App />
    </StrictMode>,
  ),
);
