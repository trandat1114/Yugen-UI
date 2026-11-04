import * as React from "react";
import {
  Accessibility16Regular,
  Code16Regular,
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  WeatherSunny16Regular,
  WeatherMoon16Regular,
  ChevronDown16Regular,
  Open16Regular,
} from "@fluentui/react-icons";
import { Popover, PopoverSurface, PopoverTrigger, YugenProvider, useYugen, type YugenTheme } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { AppBrand } from "@/hooks/useAppearance";
import { AppearancePicker, BRAND_LABEL, BrandDot } from "./layout/AppearancePicker";
import { CodeBlock, CopyButton } from "./CodeBlock";
import { docsPath } from "./router";
import { SITE } from "./site";
import { openInStackBlitz } from "./stackblitz";
import { useLocale } from "./i18n";

import type { Example, PropDoc } from "./types";
export type { Example, PropDoc };

/* ---------- Page header ---------- */
/** Tên component dài ("StreamingMarkdown"): ở khung hẹp xuống dòng giữa hai từ ghép thay vì tràn ngang (#266). */
function breakableTitle(title: string): React.ReactNode {
  const parts = title.split(/(?<=[a-z])(?=[A-Z])/);
  if (parts.length === 1) return title;
  return parts.map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </React.Fragment>
  ));
}

export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow?: string;
  title: string;
  lead: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-8 pb-5">
      {eyebrow && (
        <p className="mb-2 text-caption1 font-semibold tracking-[0.12em] text-foreground-3 uppercase">{eyebrow}</p>
      )}
      <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-[1.1] font-semibold tracking-[-0.02em] wrap-break-word text-foreground-1">
        {breakableTitle(title)}
      </h1>
      <p className="mt-4 max-w-3xl text-subtitle1 font-normal text-foreground-1">{lead}</p>
      {children && <div className="mt-4 max-w-3xl text-body2 text-foreground-2">{children}</div>}
    </header>
  );
}

/** `[chữ](/đường-dẫn#mục)` trong chữ thường → link tới trang docs cùng ngôn ngữ. */
function withLinks(text: string, key: number): React.ReactNode {
  const parts = text.split(/\[([^\]]+)\]\((\/[^)\s]*)\)/);
  if (parts.length === 1) return text;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < parts.length; i += 3) {
    if (parts[i]) out.push(parts[i]);
    if (i + 2 < parts.length)
      out.push(
        <a key={`${key}-${i}`} href={docsPath(parts[i + 2])} className="text-link underline hover:text-link-hover">
          {parts[i + 1]}
        </a>,
      );
  }
  return out;
}

/**
 * Chữ trong registry (mô tả, ví dụ, nên / không nên, props): đoạn giữa hai dấu `…` hiện thành code, `[chữ](/trang)` thành
 * link tới trang docs. Code dài liền một mạch được ngắt dòng thay vì tràn (bảng props cắt phần tràn, #259).
 */
export function withCode(text: string): React.ReactNode {
  const parts = text.split(/`([^`]+)`/);
  if (parts.length === 1) return withLinks(text, 0);
  return parts.map((part, i) =>
    i % 2 ? (
      <code key={i} dir="ltr" className="rounded-small bg-background-4 px-1 font-mono text-[0.9em] text-foreground-1 wrap-anywhere">
        {part}
      </code>
    ) : (
      <React.Fragment key={i}>{withLinks(part, i)}</React.Fragment>
    ),
  );
}

/* ---------- Section ---------- */
export function DocSection({
  id,
  title,
  description,
  children,
}: {
  id: string;
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section id={id} data-doc-section={title} className="scroll-mt-24 border-t border-stroke-2 pt-6 pb-8 first:border-t-0">
      <h2 className="font-display text-title2 font-semibold text-foreground-1">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-body2 text-foreground-2">{description}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/* ---------- Example frame (hero example with theme picker + code) ---------- */
type FrameTheme = YugenTheme;

const TOOL = "inline-flex h-7 shrink-0 items-center gap-1 whitespace-nowrap rounded-medium px-2 text-caption1 font-semibold";

export function ExampleFrame({
  example,
  defaultTheme,
  defaultBrand = "sakura",
  demoLang,
}: {
  example: Example;
  defaultTheme: FrameTheme;
  defaultBrand?: AppBrand;
  /** Ngôn ngữ nội dung demo khi khác phần chữ bao quanh (demo tiếng Anh giữa phần chữ chưa dịch); `example.lang` thắng. */
  demoLang?: string;
}) {
  const [look, setLook] = React.useState({ theme: defaultTheme, brand: defaultBrand });
  const [showCode, setShowCode] = React.useState(false);
  const { dir: pageDir } = useYugen();
  const { t } = useLocale();

  React.useEffect(() => setLook({ theme: defaultTheme, brand: defaultBrand }), [defaultTheme, defaultBrand]);

  const hc = look.theme === "high-contrast";
  const lookLabel = hc ? t("theme.highContrast") : `${BRAND_LABEL[look.brand]} · ${look.theme === "dark" ? t("appearance.dark") : t("appearance.light")}`;
  const codeLabel = showCode ? t("blocks.hideCode") : t("blocks.showCode");

  return (
    <div className="overflow-hidden rounded-2xlarge border border-stroke-2 bg-background-1 shadow-2">
      {/* Một hàng, không xuống dòng: dưới sm chỉ còn icon (tên vẫn có cho trình đọc màn hình). */}
      <div className="flex items-center gap-1 border-b border-stroke-2 px-2 py-1 sm:px-4">
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" aria-label={`${t("appearance.title")}: ${lookLabel}`} className={cn(TOOL, "text-foreground-1 hover:bg-subtle-hover")}>
              {!hc && <BrandDot brand={look.brand} />}
              {look.theme === "light" ? <WeatherSunny16Regular /> : hc ? <Accessibility16Regular /> : <WeatherMoon16Regular />}
              <span className="hidden sm:inline">{lookLabel}</span>
              <ChevronDown16Regular className="text-foreground-3" />
            </button>
          </PopoverTrigger>
          <PopoverSurface align="start" aria-label={t("appearance.title")}>
            <AppearancePicker value={look} onChange={(patch) => setLook((v) => ({ ...v, ...patch }))} />
          </PopoverSurface>
        </Popover>

        <div className="ms-auto flex items-center gap-1">
          <button
            type="button"
            onClick={() => setShowCode((v) => !v)}
            aria-expanded={showCode}
            aria-label={codeLabel}
            className={cn(TOOL, showCode ? "bg-brand-background-2 text-brand-foreground-1" : "text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1")}
          >
            <Code16Regular />
            <span className="hidden sm:inline">Code</span>
          </button>
          {SITE.links.npm && (
            <button
              type="button"
              aria-label="StackBlitz"
              onClick={() =>
                openInStackBlitz(example.code, { title: example.title, theme: look.theme, brand: look.brand, dir: pageDir, version: SITE.version, setup: example.setup })
              }
              className={cn(TOOL, "text-foreground-2 hover:bg-subtle-hover hover:text-foreground-1")}
            >
              <Open16Regular />
              <span className="hidden sm:inline">StackBlitz</span>
            </button>
          )}
          <CopyButton text={example.code} collapse />
        </div>
      </div>

      {/* data-hero-demo: e2e/visual.spec.ts chụp riêng vùng demo này cho mọi component (#166). */}
      <YugenProvider
        data-hero-demo=""
        theme={look.theme}
        brand={look.brand}
        dir={pageDir}
        lang={example.lang ?? demoLang}
        withTooltipProvider={false}
        className="flex min-h-48 flex-wrap content-center items-center justify-center gap-3 bg-background-1 p-4 transition-colors duration-normal sm:min-h-60 sm:p-6"
      >
        {example.render()}
      </YugenProvider>

      {showCode && <CodeBlock code={example.code} bare className="border-t border-stroke-2" />}
    </div>
  );
}

/* ---------- Example tile (variants grid, takeaway style) ---------- */
/**
 * Đang mở code: ô chiếm cả hàng của lưới để code không bị ép theo bề ngang một cột.
 * Demo nằm trong một stacking context riêng (`isolate`): z-index trong demo (header sticky của AppShell…) không phủ lên nút Copy.
 * `content-visibility: auto`: ô ngoài màn hình không tính style / layout / vẽ (#308). Mọi thứ nằm trong padding của ô nên
 * không bị cắt; chỗ giữ chỗ cao 11rem + padding = đúng min-h-56 của ô thường. Demo có phần tử `fixed` (vùng thông báo
 * của Sonner) thì không dùng: content-visibility biến ô thành khối chứa của `fixed`, vùng đó sẽ nằm trong ô.
 */
export function ExampleTile({ example, demoLang }: { example: Example; demoLang?: string }) {
  const [showCode, setShowCode] = React.useState(false);
  const toggleRef = React.useRef<HTMLButtonElement>(null);
  const { t } = useLocale();

  const toggleCode = () => {
    setShowCode((v) => !v);
    // Ô đổi chỗ khi giãn / thu (ô cột phải xuống hàng mới): giữ nút vừa bấm trong khung nhìn.
    requestAnimationFrame(() => toggleRef.current?.scrollIntoView({ block: "nearest" }));
  };

  return (
    <div className={cn("flex min-w-0 flex-col", (example.wide || showCode) && "md:col-span-2")}>
      <div className="group/tile relative flex min-h-56 rounded-3xlarge border border-stroke-2 bg-background-3 p-5 [contain-intrinsic-size:auto_none_auto_11rem] [content-visibility:auto] has-[.fixed]:[content-visibility:visible]">
        <div lang={example.lang ?? demoLang} className="isolate flex w-full min-w-0 flex-wrap content-center items-center justify-center gap-3">
          {example.render()}
        </div>
        <CopyButton
          text={example.code}
          className="absolute top-2 inset-e-2 bg-background-1 opacity-0 shadow-4 group-hover/tile:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-subtitle2 font-semibold text-foreground-1">{example.title}</h3>
          {example.description && <p className="mt-1 text-body1 text-foreground-2">{withCode(example.description)}</p>}
        </div>
        <button
          ref={toggleRef}
          type="button"
          onClick={toggleCode}
          aria-expanded={showCode}
          aria-label={showCode ? t("blocks.hideCode") : t("blocks.viewCode")}
          className={cn(
            "inline-flex h-7 shrink-0 items-center gap-1 rounded-medium px-2 text-caption1 font-semibold",
            showCode ? "bg-brand-background-2 text-brand-foreground-1" : "text-foreground-2 hover:bg-subtle-hover",
          )}
        >
          <Code16Regular />
          Code
        </button>
      </div>
      {showCode && <CodeBlock code={example.code} className="mt-2" />}
    </div>
  );
}

/** `lang`: cả lưới (chữ chưa dịch); `demoLang`: chỉ vùng demo (demo tiếng Anh giữa phần chữ chưa dịch). */
export function ExampleGrid({ examples, lang, demoLang }: { examples: Example[]; lang?: string; demoLang?: string }) {
  return (
    <div lang={lang} className="grid gap-x-5 gap-y-6 md:grid-cols-2">
      {examples.map((ex, i) => (
        <ExampleTile key={i} example={ex} demoLang={demoLang} />
      ))}
    </div>
  );
}

/* ---------- Do / Don't ---------- */
export function DoDont({ dos, donts, contentLang }: { dos: string[]; donts: string[]; contentLang?: string }) {
  const { t } = useLocale();
  const column = (kind: "do" | "dont", items: string[]) => (
    <div
      className={cn(
        "rounded-xlarge border border-stroke-2 bg-background-1 p-4",
        "border-t-4",
        kind === "do" ? "border-t-success-background-3" : "border-t-danger-background-3",
      )}
    >
      <div className="mb-3 flex items-center gap-2 text-subtitle2 font-semibold">
        {kind === "do" ? (
          <CheckmarkCircle20Filled className="text-success-foreground-1" />
        ) : (
          <DismissCircle20Filled className="text-danger-foreground-1" />
        )}
        {kind === "do" ? t("blocks.do") : t("blocks.dont")}
      </div>
      <ul lang={contentLang} className="flex flex-col gap-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-body1 text-foreground-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-circular bg-foreground-4" />
            <span>{withCode(item)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {column("do", dos)}
      {column("dont", donts)}
    </div>
  );
}

/* ---------- Props table ---------- */
/** Tên prop dài ("Header / Main.asChild", "fn(a, b)"): thêm chỗ xuống dòng trước dấu chấm và dấu mở ngoặc. */
function breakableName(name: string): React.ReactNode {
  return name.split(/(?=[.(])/).map((part, i) => (
    <React.Fragment key={i}>
      {i > 0 && <wbr />}
      {part}
    </React.Fragment>
  ));
}

/*
 * Prop (tên + kiểu) · Mặc định · Mô tả, độ rộng cột cố định nên mô tả luôn rộng nhất; tên và kiểu dài tự xuống dòng (#259).
 * Khung hẹp hơn 42rem: mỗi prop một khối (tên, kiểu, mặc định có nhãn, mô tả), không phải cuộn ngang.
 */
export function PropsTable({ props, contentLang }: { props: PropDoc[]; contentLang?: string }) {
  const { t } = useLocale();
  return (
    // Bảng dài, thường nằm dưới màn hình đầu: bỏ qua khi chưa tới gần (#308); ~4.5rem mỗi prop làm chỗ giữ chỗ.
    <div
      className="@container overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 [content-visibility:auto]"
      style={{ containIntrinsicSize: `auto none auto ${2.5 + props.length * 4.5}rem` }}
    >
      <table aria-label={t("blocks.propsTable")} className="w-full table-fixed border-collapse text-start text-body1 @max-2xl:block">
        <thead className="@max-2xl:sr-only">
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            <th className="w-[32%] px-4 py-2 text-start">Prop · {t("blocks.type")}</th>
            <th className="w-32 px-4 py-2 text-start">{t("blocks.default")}</th>
            <th className="px-4 py-2 text-start">{t("blocks.description")}</th>
          </tr>
        </thead>
        <tbody className="@max-2xl:block">
          {props.map((p) => (
            <tr key={p.name} className="border-b border-stroke-3 align-top last:border-b-0 @max-2xl:block @max-2xl:px-4 @max-2xl:py-3">
              <td className="px-4 py-3 font-mono text-[13px] wrap-anywhere @max-2xl:block @max-2xl:p-0">
                <span dir="ltr" className="font-semibold text-brand-foreground-1">
                  {breakableName(p.name)}
                </span>
                <span dir="ltr" className="mt-1 block text-foreground-2">
                  {p.type}
                </span>
              </td>
              <td className="px-4 py-3 font-mono text-[13px] text-foreground-3 wrap-anywhere @max-2xl:mt-1 @max-2xl:block @max-2xl:p-0">
                <span className="font-sans @2xl:hidden">{t("blocks.default")}: </span>
                {p.defaultValue ?? "—"}
              </td>
              <td lang={contentLang} className="px-4 py-3 text-foreground-2 @max-2xl:mt-2 @max-2xl:block @max-2xl:p-0">
                {withCode(p.description)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- On this page ---------- */
export function OnThisPage({ items }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = React.useState(items[0]?.id);
  const { t } = useLocale();

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );
    // Nội dung trang có thể nạp lười (Suspense) — mục chưa có trong DOM thì chờ tới khi xuất hiện.
    const missing = new Set(items.map((item) => item.id));
    const mutations = new MutationObserver(() => scan());
    const scan = () => {
      for (const id of missing) {
        const el = document.getElementById(id);
        if (!el) continue;
        observer.observe(el);
        missing.delete(id);
      }
      if (missing.size === 0) mutations.disconnect();
    };
    scan();
    if (missing.size > 0) mutations.observe(document.body, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      mutations.disconnect();
    };
  }, [items]);

  return (
    <nav aria-label={t("blocks.onThisPage")} className="sticky top-24 mt-5 hidden w-52 shrink-0 self-start xl:block">
      <p className="mb-3 text-body1 font-semibold text-foreground-1">{t("blocks.onThisPage")}</p>
      <ul className="flex flex-col border-s border-stroke-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
              className={cn(
                "-ms-px w-full border-s-2 py-1 ps-3 text-start text-body1 transition-colors duration-faster",
                active === item.id
                  ? "border-brand-stroke font-semibold text-foreground-1"
                  : "border-transparent text-foreground-3 hover:text-foreground-1",
              )}
            >
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
