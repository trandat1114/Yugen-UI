import * as React from "react";
import { Button, ErrorBoundary, StatusPage, Toaster, YugenProvider, statusPageCopy, statusPageMessagesEn, type YugenBrand, type YugenTheme } from "yugen-ui";
import { AppShell, type Appearance } from "./AppShell";
import content from "./content";
import { preloadPages, type PageId } from "./pages";
import { pageFromLegacyHash, pageFromPath, pathOf } from "./routes";

/** Cùng khoá với script chống nháy trong index.html. */
const STORAGE_KEY = "yugen-saas-appearance";

/** Trang lúc mở app; `undefined` = đường dẫn lạ (trang 404). Link kiểu cũ `#/billing` được thay bằng đường dẫn đúng. */
function initialPage(): PageId | undefined {
  const legacy = pageFromLegacyHash(window.location.hash);
  if (legacy) {
    window.history.replaceState(null, "", pathOf(legacy));
    return legacy;
  }
  return pageFromPath(window.location.pathname);
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
    const onPopState = () => setPage(pageFromPath(window.location.pathname));
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
    const { title, description } = page
      ? content.pages[page]
      : statusPageCopy(404, { ...statusPageMessagesEn, ...content.messages?.statusPage });
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
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.messages}
      locale={content.locale}
    >
      <Toaster />
      {/* Lỗi render → trang 500 có nút Thử lại; lỗi nạp file sau khi deploy → "Đã có phiên bản mới" + Tải lại. */}
      <ErrorBoundary resetKeys={[page]} statusPageProps={{ fullscreen: true }}>
        {page ? (
          <AppShell
            page={page}
            onNavigate={navigate}
            appearance={appearance}
            onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
          />
        ) : (
          <StatusPage
            status={404}
            fullscreen
            primaryAction={
              <Button appearance="primary" onClick={() => navigate("overview")}>
                {content.notFound.home}
              </Button>
            }
          />
        )}
      </ErrorBoundary>
    </YugenProvider>
  );
}
