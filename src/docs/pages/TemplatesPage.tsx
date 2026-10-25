import { Suspense, type ReactNode } from "react";
import { Checkmark16Regular, Code16Regular, Open16Regular } from "@fluentui/react-icons";
import { Badge, Button, Spinner } from "@/components/ui";
import { DocSection, PageHeader } from "../blocks";
import { CopyButton } from "../CodeBlock";
import { useLocale } from "../i18n";
import { TEMPLATES, templateCommand, templateSourceUrl, templateStackBlitzUrl, type TemplateInfo } from "../templates";
import { lazyPage } from "../lazyPage";
import { docsPath } from "../router";

const VI = {
  title: "Templates",
  lead: "Ứng dụng dựng sẵn bằng Yugen UI — một lệnh là có dự án chạy được, hoặc mở thẳng trên StackBlitz không cần cài gì.",
  intro: (
    <>
      Template dùng gói npm <code className="font-mono text-caption1">yugen-ui</code> nên nâng cấp chỉ cần{" "}
      <code className="font-mono text-caption1">npm update</code>; mã giao diện trong <code className="font-mono text-caption1">src/</code> là
      của bạn. Mỗi bản phát hành, template được sinh lại từ chính các block trên docs — preview dưới đây là mã bạn nhận được.
    </>
  ),
  featured: "Nổi bật",
  more: "Template khác",
  moreDesc: "Nhỏ gọn, một trang — hợp để thử nhanh hoặc ghép vào ứng dụng có sẵn.",
  command: "Tạo dự án bằng CLI (chép template, cài phụ thuộc, chạy dev server)",
  stackblitz: "Mở trên StackBlitz",
  source: "Mã nguồn",
  loading: "Đang tải preview…",
  previewLabel: (name: string) => `Xem trước template ${name}`,
  previewHint: "Preview chạy thật — bấm thử điều hướng, tìm kiếm, đổi theme ngay trong khung.",
  other: "Không cần cả ứng dụng?",
  otherBody: (
    <>
      Thêm Yugen UI vào dự án có sẵn theo{" "}
      <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/quick-start")}>
        Bắt đầu nhanh
      </a>
      , hoặc lấy từng cụm giao diện ở{" "}
      <a className="text-link underline hover:text-link-hover" href={docsPath("/blocks")}>
        Blocks
      </a>
      .
    </>
  ),
};

const EN: typeof VI = {
  title: "Templates",
  lead: "Ready-made apps built with Yugen UI — one command gives you a running project, or open one on StackBlitz with nothing to install.",
  intro: (
    <>
      Templates use the <code className="font-mono text-caption1">yugen-ui</code> npm package, so upgrading is just{" "}
      <code className="font-mono text-caption1">npm update</code>; the UI code in <code className="font-mono text-caption1">src/</code> is yours.
      Every release regenerates the templates from the very blocks on these docs — the previews below are the code you get.
    </>
  ),
  featured: "Featured",
  more: "More templates",
  moreDesc: "Small, single-page — good for a quick try or for merging into an existing app.",
  command: "Create a project with the CLI (copy the template, install dependencies, start the dev server)",
  stackblitz: "Open in StackBlitz",
  source: "Source",
  loading: "Loading preview…",
  previewLabel: (name: string) => `Preview of the ${name} template`,
  previewHint: "The preview is live — try the navigation, search and theme switcher right inside the frame.",
  other: "Don't need a whole app?",
  otherBody: (
    <>
      Add Yugen UI to an existing project with{" "}
      <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/quick-start")}>
        Quick start
      </a>
      , or grab individual pieces from{" "}
      <a className="text-link underline hover:text-link-hover" href={docsPath("/blocks")}>
        Blocks
      </a>
      .
    </>
  ),
};

// Preview (AppShell + block) nạp lười: trang hiện lệnh cài ngay, preview tới sau.
export const Preview = lazyPage(() =>
  import("./TemplatePreviews").then(
    (m) =>
      function TemplatePreview({ dir }: { dir: string }) {
        const Component = m.PREVIEWS[dir];
        return Component ? <Component /> : null;
      },
  ),
);

function BrowserFrame({ url, label, className, children }: { url: string; label: string; className: string; children: ReactNode }) {
  return (
    <section aria-label={label} className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 shadow-8">
      <div aria-hidden className="flex items-center gap-3 border-b border-stroke-2 bg-background-3 px-4 py-2">
        <span className="flex gap-1">
          <span className="size-2.5 rounded-circular bg-danger-background-3" />
          <span className="size-2.5 rounded-circular bg-warning-background-3" />
          <span className="size-2.5 rounded-circular bg-success-background-3" />
        </span>
        <span className="mx-auto min-w-0 truncate rounded-medium bg-background-1 px-3 py-0.5 font-mono text-caption1 text-foreground-3">
          {url}
        </span>
        <span className="w-10" />
      </div>
      <div className={className}>{children}</div>
    </section>
  );
}

function Command({ dir, label }: { dir: string; label: string }) {
  const command = templateCommand(dir);
  return (
    <div className="flex flex-col gap-1">
      <span className="text-caption1 font-semibold text-foreground-2">{label}</span>
      <div className="flex items-center gap-2 rounded-large border border-stroke-2 bg-background-3 py-1 ps-3 pe-1">
        <code className="min-w-0 flex-1 py-1 font-mono text-caption1 break-all whitespace-pre-line text-foreground-1">{command}</code>
        <CopyButton text={command} />
      </div>
    </div>
  );
}

function Actions({ t, c }: { t: TemplateInfo; c: typeof VI }) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild appearance="primary" icon={<Open16Regular />}>
        <a href={templateStackBlitzUrl(t.dir)} target="_blank" rel="noreferrer">
          {c.stackblitz}
        </a>
      </Button>
      <Button asChild icon={<Code16Regular />}>
        <a href={templateSourceUrl(t.dir)} target="_blank" rel="noreferrer">
          {c.source}
        </a>
      </Button>
    </div>
  );
}

/** `withName`: tên template làm heading h3 (thẻ nhỏ); template nổi bật đã có tên ở tiêu đề mục. */
function Header({ t, c, withName }: { t: TemplateInfo; c: typeof VI; withName?: boolean }) {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {withName && <h3 className="font-display text-title3 font-semibold">{t.name}</h3>}
        {t.featured && (
          <Badge appearance="tint" color="brand">
            {c.featured}
          </Badge>
        )}
        <code className="font-mono text-caption1 text-foreground-3">templates/{t.dir}</code>
      </div>
      <p className="max-w-3xl text-body1 text-foreground-2">{t[locale].description}</p>
      <div className="flex flex-wrap gap-1">
        {t.tags.map((tag) => {
          const label = typeof tag === "string" ? tag : tag[locale];
          return (
            <Badge key={label} appearance="outline" color="subtle">
              {label}
            </Badge>
          );
        })}
      </div>
    </div>
  );
}

function Fallback({ label }: { label: string }) {
  return (
    <div className="flex h-full min-h-60 items-center justify-center">
      <Spinner label={label} />
    </div>
  );
}

export function TemplatesPage() {
  const { locale } = useLocale();
  const c = locale === "en" ? EN : VI;
  const featured = TEMPLATES.filter((t) => t.featured);
  const rest = TEMPLATES.filter((t) => !t.featured);

  return (
    <div className="pb-8">
      <PageHeader eyebrow="Templates" title={c.title} lead={c.lead}>
        {c.intro}
      </PageHeader>

      {featured.map((t) => (
        <DocSection key={t.dir} id={t.dir} title={t.name}>
          <div className="flex flex-col gap-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <Header t={t} c={c} />
              <Actions t={t} c={c} />
            </div>
            <div className="flex flex-col gap-2">
              <BrowserFrame url={`localhost:5173${t.previewPath ?? "/"}`} label={c.previewLabel(t.name)} className="h-190 max-h-[80vh]">
                <div className="h-full">
                  <Suspense fallback={<Fallback label={c.loading} />}>
                    <Preview dir={t.dir} />
                  </Suspense>
                </div>
              </BrowserFrame>
              <p className="text-caption1 text-foreground-3">{c.previewHint}</p>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <ul className="flex flex-col gap-2">
                {t[locale].features.map((f) => (
                  <li key={f} className="flex gap-2 text-body1 text-foreground-2">
                    <Checkmark16Regular className="mt-0.5 shrink-0 text-brand-foreground-1" />
                    {f}
                  </li>
                ))}
              </ul>
              <Command dir={t.dir} label={c.command} />
            </div>
          </div>
        </DocSection>
      ))}

      <DocSection id="more" title={c.more} description={c.moreDesc}>
        <div className="grid gap-5 xl:grid-cols-2">
          {rest.map((t) => (
            <article key={t.dir} className="flex min-w-0 flex-col gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-5">
              <Header t={t} c={c} withName />
              <BrowserFrame url="localhost:5173/" label={c.previewLabel(t.name)} className="h-110 overflow-y-auto">
                <Suspense fallback={<Fallback label={c.loading} />}>
                  <Preview dir={t.dir} />
                </Suspense>
              </BrowserFrame>
              <Command dir={t.dir} label={c.command} />
              <Actions t={t} c={c} />
            </article>
          ))}
        </div>
      </DocSection>

      <DocSection id="other" title={c.other}>
        <p className="max-w-3xl text-body2 text-foreground-2">{c.otherBody}</p>
      </DocSection>
    </div>
  );
}
