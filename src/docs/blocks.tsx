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
import { SITE } from "./site";
import { openInStackBlitz } from "./stackblitz";
import { useLocale } from "./i18n";

import type { Example, PropDoc } from "./types";
export type { Example, PropDoc };

/* ---------- Page header ---------- */
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
    <header className="pt-XXXL pb-XL">
      {eyebrow && (
        <p className="mb-S text-caption1 font-semibold tracking-[0.12em] text-foreground-3 uppercase">{eyebrow}</p>
      )}
      <h1 className="font-display text-[clamp(40px,6vw,64px)] leading-[1.1] font-semibold tracking-[-0.02em] text-foreground-1">
        {title}
      </h1>
      <p className="mt-L max-w-3xl text-subtitle1 font-normal text-foreground-1">{lead}</p>
      {children && <div className="mt-L max-w-3xl text-body2 text-foreground-2">{children}</div>}
    </header>
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
    <section id={id} data-doc-section={title} className="scroll-mt-24 border-t border-stroke-2 pt-XXL pb-XXXL first:border-t-0">
      <h2 className="font-display text-title2 font-semibold text-foreground-1">{title}</h2>
      {description && <p className="mt-S max-w-3xl text-body2 text-foreground-2">{description}</p>}
      <div className="mt-XL">{children}</div>
    </section>
  );
}

/* ---------- Example frame (hero example with theme picker + code) ---------- */
type FrameTheme = YugenTheme;

const TOOL = "inline-flex h-7 shrink-0 items-center gap-XS whitespace-nowrap rounded-medium px-S text-caption1 font-semibold";

export function ExampleFrame({
  example,
  defaultTheme,
  defaultBrand = "sakura",
}: {
  example: Example;
  defaultTheme: FrameTheme;
  defaultBrand?: AppBrand;
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
      <div className="flex items-center gap-XS border-b border-stroke-2 px-S py-XS sm:px-L">
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

        <div className="ms-auto flex items-center gap-XS">
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

      <YugenProvider
        theme={look.theme}
        brand={look.brand}
        dir={pageDir}
        withTooltipProvider={false}
        className="flex min-h-48 flex-wrap content-center items-center justify-center gap-M bg-background-1 p-L transition-colors duration-normal sm:min-h-60 sm:p-XXL"
      >
        {example.render()}
      </YugenProvider>

      {showCode && <CodeBlock code={example.code} bare className="border-t border-stroke-2" />}
    </div>
  );
}

/* ---------- Example tile (variants grid, takeaway style) ---------- */
export function ExampleTile({ example }: { example: Example }) {
  const [showCode, setShowCode] = React.useState(false);
  const { t } = useLocale();

  return (
    <div className="flex min-w-0 flex-col">
      <div className="group/tile relative flex min-h-56 flex-wrap content-center items-center justify-center gap-M rounded-3xlarge border border-stroke-2 bg-background-3 p-XL">
        {example.render()}
        <CopyButton
          text={example.code}
          className="absolute top-S inset-e-S bg-background-1 opacity-0 shadow-4 group-hover/tile:opacity-100 focus-visible:opacity-100 pointer-coarse:opacity-100"
        />
      </div>
      <div className="mt-M flex items-start justify-between gap-M">
        <div>
          <h3 className="text-subtitle2 font-semibold text-foreground-1">{example.title}</h3>
          {example.description && <p className="mt-XS text-body1 text-foreground-2">{example.description}</p>}
        </div>
        <button
          type="button"
          onClick={() => setShowCode((v) => !v)}
          aria-expanded={showCode}
          aria-label={showCode ? t("blocks.hideCode") : t("blocks.viewCode")}
          className={cn(
            "inline-flex h-7 shrink-0 items-center gap-XS rounded-medium px-S text-caption1 font-semibold",
            showCode ? "bg-brand-background-2 text-brand-foreground-1" : "text-foreground-2 hover:bg-subtle-hover",
          )}
        >
          <Code16Regular />
          Code
        </button>
      </div>
      {showCode && <CodeBlock code={example.code} className="mt-S" />}
    </div>
  );
}

export function ExampleGrid({ examples, lang }: { examples: Example[]; lang?: string }) {
  return (
    <div lang={lang} className="grid gap-x-XL gap-y-XXL md:grid-cols-2">
      {examples.map((ex) => (
        <ExampleTile key={ex.title} example={ex} />
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
        "rounded-xlarge border border-stroke-2 bg-background-1 p-L",
        "border-t-4",
        kind === "do" ? "border-t-success-background-3" : "border-t-danger-background-3",
      )}
    >
      <div className="mb-M flex items-center gap-S text-subtitle2 font-semibold">
        {kind === "do" ? (
          <CheckmarkCircle20Filled className="text-success-foreground-1" />
        ) : (
          <DismissCircle20Filled className="text-danger-foreground-1" />
        )}
        {kind === "do" ? t("blocks.do") : t("blocks.dont")}
      </div>
      <ul lang={contentLang} className="flex flex-col gap-S">
        {items.map((item) => (
          <li key={item} className="flex gap-S text-body1 text-foreground-2">
            <span className="mt-2 size-1.5 shrink-0 rounded-circular bg-foreground-4" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
  return (
    <div className="grid gap-L md:grid-cols-2">
      {column("do", dos)}
      {column("dont", donts)}
    </div>
  );
}

/* ---------- Props table ---------- */
export function PropsTable({ props, contentLang }: { props: PropDoc[]; contentLang?: string }) {
  const { t } = useLocale();
  return (
    // Vùng cuộn ngang: focus được để cuộn bằng bàn phím, có tên khi là landmark region.
    <div role="region" aria-label={t("blocks.propsTable")} tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-left text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            <th className="px-L py-S">Prop</th>
            <th className="px-L py-S">{t("blocks.type")}</th>
            <th className="px-L py-S">{t("blocks.default")}</th>
            <th className="px-L py-S">{t("blocks.description")}</th>
          </tr>
        </thead>
        <tbody>
          {props.map((p) => (
            <tr key={p.name} className="border-b border-stroke-3 align-top last:border-b-0">
              <td className="px-L py-M font-mono text-[13px] font-semibold whitespace-nowrap text-brand-foreground-1">
                {p.name}
              </td>
              <td className="px-L py-M font-mono text-[13px] text-foreground-2">{p.type}</td>
              <td className="px-L py-M font-mono text-[13px] whitespace-nowrap text-foreground-3">{p.defaultValue ?? "—"}</td>
              <td lang={contentLang} className="px-L py-M text-foreground-2">{p.description}</td>
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
    <nav aria-label={t("blocks.onThisPage")} className="sticky top-24 mt-XL hidden w-52 shrink-0 self-start xl:block">
      <p className="mb-M text-body1 font-semibold text-foreground-1">{t("blocks.onThisPage")}</p>
      <ul className="flex flex-col border-s border-stroke-2">
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              onClick={() => document.getElementById(item.id)?.scrollIntoView({ behavior: "smooth" })}
              className={cn(
                "-ms-px w-full border-s-2 py-XS ps-M text-start text-body1 transition-colors duration-faster",
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
