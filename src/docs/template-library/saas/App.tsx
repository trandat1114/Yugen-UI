import * as React from "react";
import { YugenProvider, type YugenBrand, type YugenTheme } from "@/components/ui";
import { AppShell, type Appearance } from "./AppShell";
import content from "./content";
import { preloadPages, type PageId } from "./pages";
import { pageFromLegacyHash, pageFromPath, pathOf } from "./routes";

/** Cùng khoá với script chống nháy trong index.html. */
const STORAGE_KEY = "yugen-saas-appearance";

/** Trang lúc mở app. Link kiểu cũ `#/billing` và đường dẫn lạ được thay bằng đường dẫn đúng (không thêm mục lịch sử). */
function initialPage(): PageId {
  const page = pageFromLegacyHash(window.location.hash) ?? pageFromPath(window.location.pathname) ?? "overview";
  if (window.location.pathname !== pathOf(page) || window.location.hash) window.history.replaceState(null, "", pathOf(page));
  return page;
}

function initialAppearance(): Appearance {
  // Script trong index.html đã đặt data-theme / data-brand trước khi React chạy — đọc lại cho khớp.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as YugenTheme | null) ?? "light",
    brand: (root.getAttribute("data-brand") as YugenBrand | null) ?? "sakura",
  };
}

export default function App() {
  const [page, setPage] = React.useState(initialPage);
  const [appearance, setAppearance] = React.useState(initialAppearance);

  // Trang đang mở nạp trước; các trang còn lại nạp khi trình duyệt rảnh.
  React.useEffect(() => {
    const id = window.requestIdleCallback?.(preloadPages) ?? window.setTimeout(preloadPages, 1500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);

  // Back / Forward của trình duyệt.
  React.useEffect(() => {
    const onPopState = () => setPage(pageFromPath(window.location.pathname) ?? "overview");
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage bị chặn */
    }
  }, [appearance]);

  // Tiêu đề tab và mô tả theo trang — lịch sử trình duyệt, bookmark và bản xem trước khi chia sẻ đều đúng trang.
  React.useEffect(() => {
    const { title, description } = content.pages[page];
    document.title = `${title} · ${content.appName}`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [page]);

  const navigate = (next: PageId) => {
    if (window.location.pathname !== pathOf(next)) window.history.pushState(null, "", pathOf(next));
    setPage(next);
  };

  return (
    <YugenProvider
      applyToDocument
      withToaster
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.messages}
      locale={content.locale}
    >
      <AppShell
        page={page}
        onNavigate={navigate}
        appearance={appearance}
        onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
      />
    </YugenProvider>
  );
}
