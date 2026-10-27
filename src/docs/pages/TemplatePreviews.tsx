import { useEffect, useMemo, useState, type ComponentType } from "react";
import { Settings20Regular } from "@fluentui/react-icons";
import { Badge, Button, Card, CardHeader, useYugen, YugenProvider } from "@/components/ui";
import AiChatApp from "../template-library/ai-chat/App";
import DocsApp from "../template-library/docs/App";
import docsEn from "../template-library/docs/content/en";
import docsVi from "../template-library/docs/content/vi";
import GlassApp from "../template-library/glass/App";
import nextEn from "../template-library/next-starter/content/en";
import nextVi from "../template-library/next-starter/content/vi";
import glassEn from "../template-library/glass/content/en";
import glassVi from "../template-library/glass/content/vi";
import { createMockBackend } from "../template-library/ai-chat/api";
import aiChatEn from "../template-library/ai-chat/content/en";
import aiChatVi from "../template-library/ai-chat/content/vi";
import { BlogLayout } from "../template-library/blog/BlogLayout";
import { MemoryRouter } from "../template-library/blog/router";
import blogEn from "../template-library/blog/content/en";
import blogVi from "../template-library/blog/content/vi";
import { Dashboard } from "../template-library/dashboard/Dashboard";
import type { Appearance as DashboardAppearance } from "../template-library/dashboard/context";
import dashboardEn from "../template-library/dashboard/content/en";
import dashboardVi from "../template-library/dashboard/content/vi";
import { MemoryRouter as DashboardRouter } from "../template-library/dashboard/router";
import { AppShell, type Appearance } from "../template-library/saas/AppShell";
import saasEn from "../template-library/saas/content/en";
import saasVi from "../template-library/saas/content/vi";
import { Welcome } from "../template-library/starter/Welcome";
import welcomeSource from "../template-library/starter/Welcome.tsx?raw";
import starterEn from "../template-library/starter/content/en";
import starterVi from "../template-library/starter/content/vi";
import { useLocale } from "../i18n";
import type { PageId } from "../template-library/saas/pages";

const JP_FONT_ID = "yugen-starter-jp-font";

/** Trang chào của templates/vite-starter. Font Mincho nạp giống index.html của template: chỉ các ký tự Nhật có trong trang. */
function StarterPreview() {
  const docs = useYugen();
  // Preview theo ngôn ngữ docs; app tạo bằng CLI dùng tiếng Anh, hoặc tiếng Việt với --lang vi.
  const { locale } = useLocale();
  const starter = locale === "vi" ? starterVi : starterEn;
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
    <YugenProvider theme={appearance.theme} brand={appearance.brand} messages={starter.messages} className="h-full">
      <Welcome embedded content={starter} appearance={appearance} onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))} />
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
      messages={content.messages}
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
      messages={content.messages}
      locale={content.locale}
      className="h-full"
    >
      <MemoryRouter key={content.lang}>
        <BlogLayout embedded content={content} theme={theme} onThemeChange={setTheme} />
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

  return (
    <YugenProvider
      theme={appearance.theme}
      brand={appearance.brand}
      messages={content.messages}
      locale={content.lang === "en" ? "en-US" : "vi-VN"}
      lang={content.lang}
      className="relative h-full min-h-110"
    >
      <div className="absolute inset-0">
        <DashboardRouter>
          <Dashboard embedded content={content} appearance={appearance} onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))} />
        </DashboardRouter>
      </div>
    </YugenProvider>
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

/** templates/vite-glass in embedded mode: router in memory, nothing saved, text in the docs language. */
function GlassPreview() {
  const docs = useYugen();
  const { locale } = useLocale();
  return (
    <div className="h-110">
      <GlassApp
        key={locale}
        embedded
        content={locale === "vi" ? glassVi : glassEn}
        defaultAppearance={{ theme: docs.theme, brand: docs.brand, material: "glass", overMedia: "clear" }}
      />
    </div>
  );
}

/**
 * templates/next-starter can't run inside this Vite page: a static copy of its home page (same text and components,
 * header included) in the docs language and theme.
 */
function NextStarterPreview() {
  const docs = useYugen();
  const { locale } = useLocale();
  const t = locale === "vi" ? nextVi : nextEn;
  return (
    <YugenProvider theme={docs.theme} brand={docs.brand} messages={t.messages} locale={t.locale} className="min-h-full bg-background-2">
      <div className="border-b border-stroke-2 bg-background-1">
        <div className="flex h-14 items-center gap-4 px-4">
          <span className="flex items-center gap-2 font-display text-subtitle2 font-semibold">
            <span aria-hidden className="flex size-8 items-center justify-center rounded-medium bg-brand-background text-foreground-on-brand">
              Y
            </span>
            {t.appName}
          </span>
          <span className="ms-auto flex gap-1 text-body1">
            <span className="rounded-medium px-3 py-1.5 font-semibold">{t.nav.home}</span>
            <span className="rounded-medium px-3 py-1.5 text-foreground-2">{t.nav.settings}</span>
          </span>
        </div>
      </div>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-col items-start gap-3">
          <h3 className="font-display text-title2 font-semibold">{t.home.title}</h3>
          <p className="max-w-2xl text-body1 text-foreground-2">{t.home.lead}</p>
          <div className="flex flex-wrap gap-2">
            <Button appearance="primary" icon={<Settings20Regular />}>
              {t.home.settings}
            </Button>
            <Button>{t.home.docs}</Button>
          </div>
        </div>
        <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-4">
          <Badge appearance="tint" color="brand">
            {t.home.serverTitle}
          </Badge>
          <p className="mt-2 text-body1 text-foreground-2">{t.home.renderedAt("09:41")}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {t.home.features.map((feature) => (
            <Card key={feature.title}>
              <CardHeader header={<h4 className="text-subtitle2 font-semibold">{feature.title}</h4>} description={feature.body} />
            </Card>
          ))}
        </div>
      </div>
    </YugenProvider>
  );
}

/** templates/vite-docs in embedded mode: router in memory, nothing saved, text and pages in the docs language. */
function DocsPreview() {
  const host = useYugen();
  const { locale } = useLocale();
  return (
    <div className="h-110">
      <DocsApp key={locale} embedded content={locale === "vi" ? docsVi : docsEn} defaultTheme={host.theme} />
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
  "vite-glass": GlassPreview,
  "next-starter": NextStarterPreview,
  "vite-docs": DocsPreview,
};
