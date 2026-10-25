import { useCallback, useEffect, useState, type ComponentType } from "react";
import { messagesEn, useYugen, YugenProvider } from "@/components/ui";
import { BlogLayout } from "../template-library/blog/BlogLayout";
import { MemoryRouter } from "../template-library/blog/router";
import { Dashboard } from "../template-library/dashboard/Dashboard";
import type { Appearance as DashboardAppearance } from "../template-library/dashboard/context";
import dashboardEn from "../template-library/dashboard/content/en";
import dashboardVi from "../template-library/dashboard/content/vi";
import { MemoryRouter as DashboardRouter } from "../template-library/dashboard/router";
import { AppShell, type Appearance } from "../template-library/saas/AppShell";
import { Welcome } from "../template-library/starter/Welcome";
import welcomeSource from "../template-library/starter/Welcome.tsx?raw";
import starterEn from "../template-library/starter/content/en";
import starterVi from "../template-library/starter/content/vi";
import { useLocale } from "../i18n";
import type { PageId } from "../template-library/saas/pages";
import AiAssistantBlock from "../block-library/12-ai-assistant";

const JP_FONT_ID = "yugen-starter-jp-font";

/** Trang chào của templates/vite-starter. Font Mincho nạp giống index.html của template: chỉ các ký tự Nhật có trong trang. */
function StarterPreview() {
  const docs = useYugen();
  // Preview theo ngôn ngữ docs; app tạo bằng CLI dùng tiếng Anh, hoặc tiếng Việt với --lang vi.
  const { locale } = useLocale();
  const [appearance, setAppearance] = useState<Appearance>({ theme: docs.theme, brand: docs.brand });

  useEffect(() => {
    if (document.getElementById(JP_FONT_ID)) return;
    const chars = [...new Set(welcomeSource.match(/[\u3040-\u30ff\u3400-\u9fff]/g) ?? [])].join("");
    const link = Object.assign(document.createElement("link"), {
      id: JP_FONT_ID,
      rel: "stylesheet",
      href: `https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;700&display=swap&text=${encodeURIComponent(chars)}`,
    });
    document.head.appendChild(link);
  }, []);

  return (
    <YugenProvider theme={appearance.theme} brand={appearance.brand} className="h-full">
      <Welcome embedded content={locale === "vi" ? starterVi : starterEn} appearance={appearance} onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))} />
    </YugenProvider>
  );
}

/** Chính AppShell của templates/vite-saas, chạy trong provider lồng — đổi theme trong preview không ảnh hưởng trang docs. */
function SaasPreview() {
  const docs = useYugen();
  const [page, setPage] = useState<PageId>("overview");
  const [appearance, setAppearance] = useState<Appearance>({ theme: docs.theme, brand: docs.brand });

  return (
    <YugenProvider theme={appearance.theme} brand={appearance.brand} className="h-full">
      <AppShell
        embedded
        page={page}
        onNavigate={setPage}
        appearance={appearance}
        onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
      />
    </YugenProvider>
  );
}

/** Blog của templates/vite-blog với router trong bộ nhớ — bấm bài, thẻ, mục lục không đổi URL của docs. */
function BlogPreview() {
  const docs = useYugen();
  const [theme, setTheme] = useState(docs.theme);
  return (
    <YugenProvider theme={theme} brand="sakura" className="h-full">
      <MemoryRouter>
        <BlogLayout embedded theme={theme} onThemeChange={setTheme} />
      </MemoryRouter>
    </YugenProvider>
  );
}

/**
 * App của templates/vite-dashboard với router trong bộ nhớ, chữ theo ngôn ngữ docs. Cao bằng khung preview (h-full) hoặc
 * tối thiểu h-110 khi khung không đặt chiều cao cho nội dung.
 */
function DashboardPreview() {
  const docs = useYugen();
  const { locale } = useLocale();
  const content = locale === "vi" ? dashboardVi : dashboardEn;
  const [appearance, setAppearance] = useState<DashboardAppearance>({ theme: docs.theme, brand: docs.brand });
  const onAppearanceChange = useCallback((patch: Partial<DashboardAppearance>) => setAppearance((a) => ({ ...a, ...patch })), []);

  return (
    <YugenProvider
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.lang === "en" ? messagesEn : undefined}
      locale={content.lang === "en" ? "en-US" : "vi-VN"}
      lang={content.lang}
      className="relative h-full min-h-110"
    >
      <div className="absolute inset-0">
        <DashboardRouter>
          <Dashboard embedded content={content} appearance={appearance} onAppearanceChange={onAppearanceChange} />
        </DashboardRouter>
      </div>
    </YugenProvider>
  );
}

function AiChatPreview() {
  return (
    <div className="flex justify-center bg-shell p-5">
      <AiAssistantBlock />
    </div>
  );
}

/** Theo `dir` trong src/docs/templates.ts. */
export const PREVIEWS: Record<string, ComponentType> = {
  "vite-starter": StarterPreview,
  "vite-saas": SaasPreview,
  "vite-blog": BlogPreview,
  "vite-dashboard": DashboardPreview,
  "vite-ai-chat": AiChatPreview,
};
