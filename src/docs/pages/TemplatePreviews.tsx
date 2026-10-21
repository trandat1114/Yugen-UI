import { useEffect, useState, type ComponentType } from "react";
import { useYugen, YugenProvider } from "@/components/ui";
import { BlogLayout } from "../template-library/blog/BlogLayout";
import { MemoryRouter } from "../template-library/blog/router";
import { AppShell, type Appearance } from "../template-library/saas/AppShell";
import { Welcome } from "../template-library/starter/Welcome";
import welcomeSource from "../template-library/starter/Welcome.tsx?raw";
import type { PageId } from "../template-library/saas/pages";
import StatsBlock from "../block-library/02-stats";
import TransactionsBlock from "../block-library/06-transactions";
import AnalyticsBlock from "../block-library/11-analytics";
import AiAssistantBlock from "../block-library/12-ai-assistant";

const JP_FONT_ID = "yugen-starter-jp-font";

/** Trang chào của templates/vite-starter. Font Mincho nạp giống index.html của template: chỉ các ký tự Nhật có trong trang. */
function StarterPreview() {
  const docs = useYugen();
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
      <Welcome embedded appearance={appearance} onAppearanceChange={(patch) => setAppearance((a) => ({ ...a, ...patch }))} />
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

function DashboardPreview() {
  return (
    <div className="flex flex-col gap-XL bg-shell p-XL">
      <StatsBlock />
      <AnalyticsBlock />
      <TransactionsBlock />
    </div>
  );
}

function AiChatPreview() {
  return (
    <div className="flex justify-center bg-shell p-XL">
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
