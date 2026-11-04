import * as React from "react";
import { Button, ErrorBoundary, StatusPage, YugenProvider, type YugenBrand, type YugenTheme } from "yugen-ui";
import content from "./content";
import { Welcome, type Appearance } from "./Welcome";

/** Cùng khoá với script chống nháy trong index.html. */
const STORAGE_KEY = "yugen-starter-appearance";

/** Trang chào nằm ở gốc app (theo `base` của Vite). Host trả index.html cho mọi đường dẫn → đường dẫn khác hiện trang 404. */
const BASE = import.meta.env.BASE_URL;
const isHome = (path: string) => path === BASE || path === `${BASE}index.html` || `${path}/` === BASE;

function initialAppearance(): Appearance {
  // Script trong index.html đã đặt data-theme / data-brand trước khi React chạy — đọc lại cho khớp.
  const root = document.documentElement;
  return {
    theme: (root.getAttribute("data-theme") as YugenTheme | null) ?? "light",
    brand: (root.getAttribute("data-brand") as YugenBrand | null) ?? "sakura",
  };
}

export default function App() {
  const [appearance, setAppearance] = React.useState(initialAppearance);
  const [notFound] = React.useState(() => !isHome(window.location.pathname));

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage bị chặn */
    }
  }, [appearance]);

  return (
    <YugenProvider applyToDocument withToaster theme={appearance.theme} brand={appearance.brand} messages={content.messages}>
      {/* Lỗi render → trang "Đã có lỗi" có nút Thử lại; lỗi nạp file sau khi deploy → "Đã có phiên bản mới" + Tải lại. */}
      <ErrorBoundary statusPageProps={{ fullscreen: true }}>
        {notFound ? (
          <StatusPage
            status={404}
            fullscreen
            primaryAction={
              <Button appearance="primary" asChild>
                <a href={BASE}>{content.notFound.home}</a>
              </Button>
            }
          />
        ) : (
          // Bắt đầu ứng dụng của bạn ở đây — thay <Welcome /> bằng component của bạn.
          <Welcome appearance={appearance} onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))} />
        )}
      </ErrorBoundary>
    </YugenProvider>
  );
}
