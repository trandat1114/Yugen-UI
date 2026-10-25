import * as React from "react";
import { YugenProvider, type YugenBrand, type YugenTheme } from "yugen-ui";
import { AppShell, type Appearance } from "./AppShell";
import { PAGE_BY_ID, isPageId, preloadPages, type PageId } from "./pages";

/** Cùng khoá với script chống nháy trong index.html. */
const STORAGE_KEY = "yugen-saas-appearance";

const pageFromHash = (): PageId => {
  const id = window.location.hash.replace(/^#\/?/, "");
  return isPageId(id) ? id : "overview";
};

function initialAppearance(): Appearance {
  // Script trong index.html đã đặt data-theme / data-brand trước khi React chạy — đọc lại cho khớp.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as YugenTheme | null) ?? "light",
    brand: (root.getAttribute("data-brand") as YugenBrand | null) ?? "sakura",
  };
}

export default function App() {
  const [page, setPage] = React.useState(pageFromHash);
  const [appearance, setAppearance] = React.useState(initialAppearance);

  // Trang đang mở nạp trước; các trang còn lại nạp khi trình duyệt rảnh.
  React.useEffect(() => {
    const id = window.requestIdleCallback?.(preloadPages) ?? window.setTimeout(preloadPages, 1500);
    return () => (window.cancelIdleCallback ? window.cancelIdleCallback(id) : window.clearTimeout(id));
  }, []);

  React.useEffect(() => {
    const onHashChange = () => setPage(pageFromHash());
    window.addEventListener("hashchange", onHashChange);
    return () => window.removeEventListener("hashchange", onHashChange);
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
    const { title, description } = PAGE_BY_ID[page];
    document.title = `${title} · Sakura Studio`;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [page]);

  const navigate = (next: PageId) => {
    if (window.location.hash !== `#/${next}`) window.location.hash = `/${next}`;
    setPage(next);
  };

  return (
    <YugenProvider applyToDocument withToaster theme={appearance.theme} brand={appearance.brand}>
      <AppShell
        page={page}
        onNavigate={navigate}
        appearance={appearance}
        onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
      />
    </YugenProvider>
  );
}
