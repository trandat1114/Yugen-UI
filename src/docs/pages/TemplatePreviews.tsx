import { useEffect, useMemo, useState, type ComponentType } from "react";
import { messagesEn, useYugen, YugenProvider } from "@/components/ui";
import AiChatApp from "../template-library/ai-chat/App";
import { createMockBackend } from "../template-library/ai-chat/api";
import aiChatEn from "../template-library/ai-chat/content/en";
import aiChatVi from "../template-library/ai-chat/content/vi";
import { BlogLayout } from "../template-library/blog/BlogLayout";
import { MemoryRouter } from "../template-library/blog/router";
import blogEn from "../template-library/blog/content/en";
import blogVi from "../template-library/blog/content/vi";
import { AppShell, type Appearance } from "../template-library/saas/AppShell";
import saasEn from "../template-library/saas/content/en";
import saasVi from "../template-library/saas/content/vi";
import { Welcome } from "../template-library/starter/Welcome";
import welcomeSource from "../template-library/starter/Welcome.tsx?raw";
import starterEn from "../template-library/starter/content/en";
import starterVi from "../template-library/starter/content/vi";
import { useLocale } from "../i18n";
import type { PageId } from "../template-library/saas/pages";
import StatsBlock from "../block-library/02-stats";
import TransactionsBlock from "../block-library/06-transactions";
import AnalyticsBlock from "../block-library/11-analytics";

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

/**
 * Chính AppShell của templates/vite-saas, chạy trong provider lồng — đổi theme trong preview không ảnh hưởng trang docs.
 * Chữ theo ngôn ngữ docs (app tạo bằng CLI: tiếng Anh, tiếng Việt với --lang vi); đổi ngôn ngữ thì dựng lại (thông báo mẫu, state).
 */
function SaasPreview() {
  const docs = useYugen();
  const { locale } = useLocale();
  const content = locale === "vi" ? saasVi : saasEn;
  const [page, setPage] = useState<PageId>("overview");
  const [appearance, setAppearance] = useState<Appearance>({ theme: docs.theme, brand: docs.brand });

  return (
    <YugenProvider
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.lang === "en" ? messagesEn : undefined}
      locale={content.locale}
      className="h-full"
    >
      <AppShell
        key={content.lang}
        embedded
        content={content}
        page={page}
        onNavigate={setPage}
        appearance={appearance}
        onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))}
      />
    </YugenProvider>
  );
}

/** Blog của templates/vite-blog với router trong bộ nhớ — bấm bài, thẻ, mục lục không đổi URL của docs. Chữ và bài theo ngôn ngữ docs. */
function BlogPreview() {
  const docs = useYugen();
  const { locale } = useLocale();
  const content = locale === "vi" ? blogVi : blogEn;
  const [theme, setTheme] = useState(docs.theme);
  return (
    <YugenProvider
      theme={theme}
      brand="sakura"
      messages={content.lang === "en" ? messagesEn : undefined}
      locale={content.locale}
      className="h-full"
    >
      <MemoryRouter key={content.lang}>
        <BlogLayout embedded content={content} theme={theme} onThemeChange={setTheme} />
      </MemoryRouter>
    </YugenProvider>
  );
}

function DashboardPreview() {
  return (
    <div className="flex flex-col gap-5 bg-shell p-5">
      <StatsBlock />
      <AnalyticsBlock />
      <TransactionsBlock />
    </div>
  );
}

/**
 * templates/vite-ai-chat in embedded mode: router and conversations in memory (nothing saved), text and mock replies in
 * the docs language. Fixed height: the frame of a non-featured template scrolls instead of giving its content a height.
 */
function AiChatPreview() {
  const docs = useYugen();
  const { locale } = useLocale();
  const content = locale === "vi" ? aiChatVi : aiChatEn;
  const send = useMemo(() => createMockBackend(content.mock), [content]);
  return (
    <div className="h-110">
      <AiChatApp key={locale} embedded content={content} send={send} defaultAppearance={{ theme: docs.theme, brand: docs.brand }} />
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
