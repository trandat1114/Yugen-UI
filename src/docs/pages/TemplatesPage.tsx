import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
import {
  Checkmark16Regular,
  Code16Regular,
  Desktop20Regular,
  Dismiss20Regular,
  FullScreenMaximize16Regular,
  Open16Regular,
  Phone20Regular,
  Tablet20Regular,
} from "@fluentui/react-icons";
import {
  Badge,
  Button,
  Dialog,
  DialogClose,
  DialogSurface,
  DialogTitle,
  SimpleTooltip,
  Spinner,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/ui";
import { cn } from "@/lib/cn";
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
  pick: "Chọn template",
  command: "Tạo dự án bằng CLI (chép template, cài phụ thuộc, chạy dev server)",
  stackblitz: "Mở trên StackBlitz",
  source: "Mã nguồn",
  loading: "Đang tải preview…",
  previewLabel: (name: string) => `Xem trước template ${name}`,
  previewHint: "Preview chạy thật — bấm thử điều hướng, tìm kiếm, đổi theme ngay trong khung.",
  fullScreen: "Toàn màn hình",
  fullScreenLabel: (name: string) => `Xem ${name} toàn màn hình`,
  fullScreenOpen: "Đang mở toàn màn hình.",
  copyCommand: "Copy lệnh",
  close: "Đóng",
  viewport: "Khổ màn hình",
  viewports: { desktop: "Máy tính", tablet: "Máy tính bảng", phone: "Điện thoại" },
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
  pick: "Choose a template",
  command: "Create a project with the CLI (copy the template, install dependencies, start the dev server)",
  stackblitz: "Open in StackBlitz",
  source: "Source",
  loading: "Loading preview…",
  previewLabel: (name: string) => `Preview of the ${name} template`,
  previewHint: "The preview is live — try the navigation, search and theme switcher right inside the frame.",
  fullScreen: "Full screen",
  fullScreenLabel: (name: string) => `View ${name} full screen`,
  fullScreenOpen: "Open in full screen.",
  copyCommand: "Copy command",
  close: "Close",
  viewport: "Viewport",
  viewports: { desktop: "Desktop", tablet: "Tablet", phone: "Phone" },
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

type Copy = typeof VI;

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

/** Template đang xem toàn màn hình, theo `?preview=<dir>` để chia sẻ được và nút Back của trình duyệt đóng lại. */
function useFullScreenPreview() {
  const [dir, setDir] = useState<string | null>(null);
  // Nút đã mở preview: nhận lại focus khi đóng (Radix chỉ trả focus cho DialogTrigger, ở đây không có).
  const returnFocus = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const sync = () => {
      const value = new URLSearchParams(window.location.search).get("preview");
      setDir(TEMPLATES.some((t) => t.dir === value) ? value : null);
    };
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  /** `from`: nút đã bấm. Safari không focus nút khi bấm chuột, nên không lấy từ document.activeElement. */
  const open = useCallback((next: string, from: HTMLElement) => {
    const url = new URL(window.location.href);
    url.searchParams.set("preview", next);
    window.history.pushState({ templatePreview: true }, "", url);
    returnFocus.current = from;
    setDir(next);
  }, []);

  const close = useCallback(() => {
    // Mở từ trang này: quay lại mục lịch sử trước (popstate đặt dir = null). Mở thẳng từ link: bỏ ?preview tại chỗ.
    if ((window.history.state as { templatePreview?: boolean } | null)?.templatePreview) {
      window.history.back();
      return;
    }
    const url = new URL(window.location.href);
    url.searchParams.delete("preview");
    window.history.replaceState(window.history.state, "", url);
    setDir(null);
  }, []);

  return { dir, open, close, returnFocus };
}

function BrowserFrame({
  url,
  label,
  className,
  expandLabel,
  expandTooltip,
  onExpand,
  children,
}: {
  url: string;
  label: string;
  className: string;
  expandLabel: string;
  expandTooltip: string;
  onExpand: (button: HTMLButtonElement) => void;
  children: ReactNode;
}) {
  return (
    <section aria-label={label} className="overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 shadow-8">
      <div className="flex items-center gap-3 border-b border-stroke-2 bg-background-3 px-4 py-1">
        <span aria-hidden className="flex w-10 gap-1">
          <span className="size-2.5 rounded-circular bg-danger-background-3" />
          <span className="size-2.5 rounded-circular bg-warning-background-3" />
          <span className="size-2.5 rounded-circular bg-success-background-3" />
        </span>
        <span aria-hidden className="mx-auto min-w-0 truncate rounded-medium bg-background-1 px-3 py-0.5 font-mono text-caption1 text-foreground-3">
          {url}
        </span>
        <span className="flex w-10 justify-end">
          <SimpleTooltip content={expandTooltip}>
            <Button appearance="subtle" size="small" icon={<FullScreenMaximize16Regular />} aria-label={expandLabel} onClick={(e) => onExpand(e.currentTarget)} />
          </SimpleTooltip>
        </span>
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

function Actions({ t, c }: { t: TemplateInfo; c: Copy }) {
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

/** `withName`: tên template làm heading h3 (trong bộ chọn); template nổi bật đã có tên ở tiêu đề mục. */
function Header({ t, c, withName }: { t: TemplateInfo; c: Copy; withName?: boolean }) {
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

/**
 * Một template: mô tả, khung preview chạy thật, tính năng và lệnh CLI. `live`: mount preview (bộ chọn chỉ mount template
 * đang chọn). Khi template đang mở toàn màn hình, khung trên trang không chạy bản thứ hai.
 */
function TemplateDetails({
  t,
  c,
  withName,
  live = true,
  expanded,
  onExpand,
  frameClassName,
}: {
  t: TemplateInfo;
  c: Copy;
  withName?: boolean;
  live?: boolean;
  expanded: boolean;
  onExpand: (dir: string, button: HTMLButtonElement) => void;
  frameClassName: string;
}) {
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <Header t={t} c={c} withName={withName} />
        <Actions t={t} c={c} />
      </div>
      <div className="flex flex-col gap-2">
        <BrowserFrame
          url={`localhost:5173${t.previewPath ?? "/"}`}
          label={c.previewLabel(t.name)}
          className={frameClassName}
          expandLabel={c.fullScreenLabel(t.name)}
          expandTooltip={c.fullScreen}
          onExpand={(button) => onExpand(t.dir, button)}
        >
          <div className="h-full">
            {expanded ? (
              <p className="flex h-full items-center justify-center text-body1 text-foreground-3">{c.fullScreenOpen}</p>
            ) : (
              live && (
                <Suspense fallback={<Fallback label={c.loading} />}>
                  <Preview dir={t.dir} />
                </Suspense>
              )
            )}
          </div>
        </BrowserFrame>
        {t.featured && <p className="text-caption1 text-foreground-3">{c.previewHint}</p>}
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
  );
}

type Viewport = keyof Copy["viewports"];
const VIEWPORT_WIDTH: Record<Viewport, string> = { desktop: "100%", tablet: "768px", phone: "390px" };
const VIEWPORT_ICON: Record<Viewport, ReactNode> = { desktop: <Desktop20Regular />, tablet: <Tablet20Regular />, phone: <Phone20Regular /> };

/** Preview toàn màn hình: chọn khổ máy tính / máy tính bảng / điện thoại (từ 768px trở lên), cùng các thao tác như trên trang. */
function FullScreenPreview({
  t,
  c,
  onClose,
  returnFocus,
}: {
  t: TemplateInfo | undefined;
  c: Copy;
  onClose: () => void;
  returnFocus: RefObject<HTMLElement | null>;
}) {
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const closeButton = useRef<HTMLButtonElement>(null);
  return (
    <Dialog open={!!t} onOpenChange={(open) => !open && onClose()}>
      {t && (
        <DialogSurface
          aria-describedby={undefined}
          // Focus vào nút Đóng thay vì nút khổ màn hình đầu tiên (tooltip của nó bật lên ngay khi mở).
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            closeButton.current?.focus();
          }}
          onCloseAutoFocus={(e) => {
            if (!returnFocus.current?.isConnected) return;
            e.preventDefault();
            returnFocus.current.focus();
          }}
          className="inset-0 h-dvh max-h-none w-screen max-w-none translate-x-0 translate-y-0 gap-0 rounded-none border-0 p-0"
        >
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-stroke-2 px-4 py-2">
            <DialogTitle action={null} className="text-subtitle2">
              {t.name}
            </DialogTitle>
            <ToggleGroup
              type="single"
              value={viewport}
              onValueChange={(value) => value && setViewport(value as Viewport)}
              aria-label={c.viewport}
              className="max-md:hidden"
            >
              {(Object.keys(VIEWPORT_WIDTH) as Viewport[]).map((v) => (
                <SimpleTooltip key={v} content={c.viewports[v]}>
                  <ToggleGroupItem value={v} icon={VIEWPORT_ICON[v]} aria-label={c.viewports[v]} />
                </SimpleTooltip>
              ))}
            </ToggleGroup>
            <div className="ms-auto flex flex-wrap items-center gap-2">
              <CopyButton text={templateCommand(t.dir)} label={c.copyCommand} collapse />
              <Actions t={t} c={c} />
              <DialogClose asChild>
                <Button ref={closeButton} appearance="subtle" icon={<Dismiss20Regular />} aria-label={c.close} />
              </DialogClose>
            </div>
          </div>
          <div className="min-h-0 flex-1 bg-background-3 md:p-4">
            <div
              style={{ width: VIEWPORT_WIDTH[viewport] }}
              className={cn(
                "mx-auto h-full max-w-full overflow-y-auto bg-background-1",
                viewport !== "desktop" && "md:rounded-large md:border md:border-stroke-2 md:shadow-8",
              )}
            >
              <div className="h-full">
                <Suspense fallback={<Fallback label={c.loading} />}>
                  <Preview dir={t.dir} />
                </Suspense>
              </div>
            </div>
          </div>
        </DialogSurface>
      )}
    </Dialog>
  );
}

/** Template trong bộ chọn "Template khác": theo `#<dir>` khi mở trang hoặc bấm link cùng trang, mặc định template đầu tiên. */
function useSelectedTemplate(dirs: string[]) {
  const [selected, setSelected] = useState(dirs[0]);

  useEffect(() => {
    const sync = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      if (!dirs.includes(hash)) return;
      setSelected(hash);
      requestAnimationFrame(() => document.getElementById("more")?.scrollIntoView());
    };
    sync();
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, [dirs]);

  const select = useCallback((dir: string) => {
    setSelected(dir);
    const url = new URL(window.location.href);
    url.hash = dir;
    window.history.replaceState(window.history.state, "", url);
  }, []);

  return { selected, select };
}

const FEATURED = TEMPLATES.filter((t) => t.featured);
const REST = TEMPLATES.filter((t) => !t.featured);
const REST_DIRS = REST.map((t) => t.dir);

export function TemplatesPage() {
  const { locale } = useLocale();
  const c = locale === "en" ? EN : VI;
  const fullScreen = useFullScreenPreview();
  const { selected, select } = useSelectedTemplate(REST_DIRS);

  return (
    <div className="pb-8">
      <PageHeader eyebrow="Templates" title={c.title} lead={c.lead}>
        {c.intro}
      </PageHeader>

      {FEATURED.map((t) => (
        <DocSection key={t.dir} id={t.dir} title={t.name}>
          <TemplateDetails
            t={t}
            c={c}
            expanded={fullScreen.dir === t.dir}
            onExpand={fullScreen.open}
            frameClassName="h-190 max-h-[80vh]"
          />
        </DocSection>
      ))}

      <DocSection id="more" title={c.more}>
        <Tabs value={selected} onValueChange={select}>
          {/* Màn hẹp: thanh tab cuộn ngang thay vì xuống dòng. */}
          <div className="-mx-1 overflow-x-auto px-1">
            <TabsList aria-label={c.pick} className="w-max">
              {REST.map((t) => (
                <TabsTrigger key={t.dir} value={t.dir}>
                  {t.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {/* Mọi panel có trong HTML (mô tả, tính năng, lệnh — cho công cụ tìm kiếm); chỉ template đang chọn chạy preview. */}
          {REST.map((t) => (
            <TabsContent key={t.dir} value={t.dir} forceMount className="pt-5 data-[state=inactive]:hidden">
              <TemplateDetails
                t={t}
                c={c}
                withName
                live={t.dir === selected}
                expanded={fullScreen.dir === t.dir}
                onExpand={fullScreen.open}
                frameClassName="h-[70svh] max-h-[80vh] overflow-y-auto md:h-190"
              />
            </TabsContent>
          ))}
        </Tabs>
      </DocSection>

      <DocSection id="other" title={c.other}>
        <p className="max-w-3xl text-body2 text-foreground-2">{c.otherBody}</p>
      </DocSection>

      <FullScreenPreview
        t={TEMPLATES.find((t) => t.dir === fullScreen.dir)}
        c={c}
        onClose={fullScreen.close}
        returnFocus={fullScreen.returnFocus}
      />
    </div>
  );
}
