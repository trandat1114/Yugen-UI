import * as React from "react";
import { Code16Regular, Eye16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { PageHeader } from "../blocks";
import { CodeBlock, CopyButton } from "../CodeBlock";
import { useLocale } from "../i18n";

export interface BlockMeta {
  title: string;
  description: string;
  /** Thứ tự hiển thị (nhỏ trước). */
  order: number;
}

type BlockModule = { default: React.ComponentType; meta: BlockMeta };

// Tên và mô tả tiếng Anh theo file. Nội dung block (mã nguồn để copy) giữ tiếng Việt như template.
export const META_EN: Record<string, Pick<BlockMeta, "title" | "description">> = {
  "01-login": { title: "Sign in", description: "Sign-in form with email, password and SSO" },
  "02-stats": { title: "Stats", description: "KPI cards with trends and a mini bar chart" },
  "03-payout": { title: "Payout threshold", description: "Set a minimum amount with a Slider and a note" },
  "04-team": { title: "Team members", description: "Invite members and set roles with a Menu" },
  "05-preferences": { title: "Preferences", description: "Account settings with Select, Switch and Toast" },
  "06-transactions": { title: "Recent transactions", description: "A List with icons, descriptions and amounts" },
  "07-savings": { title: "Savings goal", description: "Track progress with a ProgressBar" },
  "08-booking": { title: "Book an appointment", description: "Calendar with a ToggleGroup for time slots" },
  "09-feedback": { title: "Send feedback", description: "Form with RadioGroup, Textarea and validation" },
  "10-empty-inbox": { title: "Empty inbox", description: "Filter tabs with an Empty state that has an action" },
  "11-analytics": { title: "Analytics", description: "KPIs, trends, rankings and shares, with one time filter for every card" },
  "12-ai-assistant": { title: "AI assistant", description: "MessageScroller, ChatComposer and Trace showing each step the agent takes" },
  "13-newsletter": { title: "Newsletter sign-up", description: "Labeled email Field with a hint, a Switch and a confirmation toast" },
  "14-quantity": { title: "Quantity picker", description: "Labeled ButtonGroup to add / remove, with min / max limits and aria-live" },
  "15-welcome-dialog": { title: "Welcome dialog", description: "Dialog that keeps focus inside, closes with Esc and returns focus to its trigger" },
  "16-project-progress": { title: "Project progress", description: "A Slider drives a ProgressBar that turns success when complete" },
  "17-online-team": { title: "Who's online", description: "Persona with presence and an AvatarGroup that compacts large groups" },
};

const fileOf = (path: string) => path.replace(/^.*\/(.+)\.tsx$/, "$1");

// Component thật + mã nguồn thô của CHÍNH file đó → code copy luôn khớp với preview.
const modules = import.meta.glob<BlockModule>("../block-library/*.tsx", { eager: true });
const sources = import.meta.glob<string>("../block-library/*.tsx", { eager: true, query: "?raw", import: "default" });

const BLOCKS = Object.entries(modules)
  .map(([path, mod]) => ({ path, meta: mod.meta, Component: mod.default, source: sources[path] ?? "" }))
  .filter((b) => b.meta)
  .sort((a, b) => a.meta.order - b.meta.order);

function BlockCard({ path, meta, Component, source }: (typeof BLOCKS)[number]) {
  const [mode, setMode] = React.useState<"preview" | "code">("preview");
  const { locale } = useLocale();
  const en = locale === "en" ? META_EN[fileOf(path)] : undefined;
  const { title, description } = en ?? meta;

  return (
    <article className="mb-5 flex break-inside-avoid flex-col overflow-hidden rounded-3xlarge border border-stroke-2 bg-background-1 shadow-2">
      <header className="flex items-center justify-between gap-3 border-b border-stroke-2 px-4 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-subtitle2 font-semibold">{title}</h2>
          <p className="truncate text-caption1 text-foreground-3">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="inline-flex rounded-medium bg-background-3 p-0.5" role="tablist" aria-label={locale === "en" ? "View" : "Chế độ xem"}>
            {(["preview", "code"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                aria-label={m === "preview" ? "Preview" : "Code"}
                title={m === "preview" ? "Preview" : "Code"}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-small transition-colors duration-faster",
                  mode === m ? "bg-background-1 text-foreground-1 shadow-2" : "text-foreground-3 hover:text-foreground-1",
                )}
              >
                {m === "preview" ? <Eye16Regular /> : <Code16Regular />}
              </button>
            ))}
          </div>
          <CopyButton text={source} />
        </div>
      </header>
      {mode === "preview" ? (
        <div lang={locale === "en" ? "vi" : undefined} className="flex justify-center bg-background-3 p-5">
          <div className="w-full">
            <Component />
          </div>
        </div>
      ) : (
        <CodeBlock code={source} bare className="max-h-140 overflow-auto" />
      )}
    </article>
  );
}

export function BlocksPage() {
  const { locale } = useLocale();
  const en = locale === "en";
  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Blocks"
        title="Blocks"
        lead={
          en
            ? "Ready-made UI sections built from Yugen UI components: sign-in, settings, stats, lists. Copy a whole block into your project, then change the content."
            : "Các cụm giao diện ghép sẵn từ component của Yugen UI — đăng nhập, cài đặt, thống kê, danh sách… Copy nguyên khối vào dự án rồi chỉnh nội dung."
        }
      >
        {en ? (
          <>
            Each block is one file in <code className="font-mono text-caption1">src/docs/block-library/</code>. The Code tab shows that
            file&apos;s source; the sample content is in Vietnamese.
          </>
        ) : (
          <>
            Mỗi block là một file trong <code className="font-mono text-caption1">src/docs/block-library/</code>. Tab “Code” hiển thị đúng
            mã nguồn của file đó.
          </>
        )}
      </PageHeader>
      <div className="columns-1 gap-5 lg:columns-2 2xl:columns-3">
        {BLOCKS.map((b) => (
          <BlockCard key={b.path} {...b} />
        ))}
      </div>
    </div>
  );
}
