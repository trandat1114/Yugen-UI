import { Fragment, useState, type ReactNode } from "react";
import {
  ArrowRight20Regular,
  Color24Regular,
  PuzzlePiece24Regular,
  ShieldCheckmark24Regular,
  DarkTheme24Regular,
  Code24Regular,
  Copy24Regular,
  Grid24Regular,
} from "@fluentui/react-icons";
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { cn } from "@/lib/cn";
import { homepage } from "../../../package.json";
import { COMPONENTS_META } from "../registry";
import { FOUNDATIONS } from "../foundations";
import { LATEST_RELEASE } from "../news";
import { HomeCreate } from "./HomeCreate";
import { HomeShowcase } from "./HomeShowcase";
import { HomeComponents } from "./HomeComponents";
import { FallingPetals, YugenKanji } from "../HeroArt";
import { CopyButton } from "../CodeBlock";
import { useLocale } from "../i18n";
import { docsPath } from "../router";

const PRINCIPLES = [
  { icon: Color24Regular, title: "home.p1Title", text: "home.p1Text" },
  { icon: DarkTheme24Regular, title: "home.p2Title", text: "home.p2Text" },
  { icon: ShieldCheckmark24Regular, title: "home.p3Title", text: "home.p3Text" },
  { icon: Copy24Regular, title: "home.p4Title", text: "home.p4Text" },
] as const;

// Không import từ ../install (nạp sẵn mọi module component) — trang chủ chỉ cần URL registry.
// cli: cài gói + thêm dòng theme vào CSS trong một lệnh (packages/cli) — cách ngắn nhất cho dự án có sẵn.
const INSTALL = {
  cli: "npx @yugen-ui/cli@latest init",
  npm: "npm i yugen-ui",
  shadcn: `npx shadcn@latest init ${homepage.replace(/\/$/, "")}/r/init.json`,
} as const;

function InstallSnippet({ className }: { className?: string }) {
  const [tool, setTool] = useState<keyof typeof INSTALL>("cli");
  const { t } = useLocale();
  return (
    <Tabs
      value={tool}
      onValueChange={(v) => setTool(v as keyof typeof INSTALL)}
      className={cn("overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1/80 shadow-2 backdrop-blur", className)}
    >
      <TabsList size="small" aria-label={t("home.install")} className="border-b border-stroke-2 px-1">
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="npm">npm</TabsTrigger>
        <TabsTrigger value="shadcn">shadcn</TabsTrigger>
      </TabsList>
      <div className="flex items-start gap-2 py-1 ps-3 pe-1">
        {/*
          Lệnh dài xuống dòng (ngắt ở khoảng trắng trước, URL mới ngắt giữa chừng) thay vì bị cắt. Các panel xếp chồng trong
          cùng một ô lưới → khung luôn cao bằng lệnh dài nhất, đổi tab không làm nội dung bên dưới nhảy.
        */}
        <div className="grid min-w-0 flex-1">
          {(Object.keys(INSTALL) as (keyof typeof INSTALL)[]).map((k) => (
            <TabsContent
              key={k}
              value={k}
              forceMount
              tabIndex={-1}
              className="col-start-1 row-start-1 py-1 font-mono text-body1 text-foreground-1 wrap-anywhere data-[state=inactive]:invisible"
            >
              <code>
                <span className="text-foreground-3 select-none">$ </span>
                {/* <wbr> sau mỗi "/" → URL ưu tiên xuống dòng ở ranh giới đường dẫn. */}
                {INSTALL[k].split(/(?<=\/)/).map((part, i) => (
                  <Fragment key={i}>
                    {part}
                    <wbr />
                  </Fragment>
                ))}
              </code>
            </TabsContent>
          ))}
        </div>
        <CopyButton text={INSTALL[tool]} collapse />
      </div>
    </Tabs>
  );
}

export function HomePage() {
  const { t, foundation } = useLocale();
  const count = COMPONENTS_META.length;

  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative -mx-4 overflow-hidden px-4 pt-5 pb-12 md:-mx-12 md:px-12 md:pt-8 md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-hero-glow mask-[linear-gradient(to_bottom,black_70%,transparent)]"
        />
        <FallingPetals />

        {/* lg: chữ 幽玄 chiếm 2 hàng — hàng cuối co giãn để khung cài đặt nằm sát dưới mô tả. */}
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 lg:grid-rows-[auto_auto_1fr] lg:gap-x-6">
          <a
            href={docsPath("/news")}
            className="group/news col-span-2 mb-5 inline-flex max-w-full items-center gap-2 justify-self-start rounded-circular border border-stroke-2 bg-background-1/80 py-0.5 ps-0.5 pe-3 text-caption1 shadow-2 backdrop-blur transition-colors duration-faster hover:border-brand-stroke"
          >
            <span className="rounded-circular bg-brand-background px-2 py-0.5 font-semibold text-foreground-on-brand">v{LATEST_RELEASE.version}</span>
            <span className="truncate text-foreground-1">{t("home.releasePill", { title: LATEST_RELEASE.title, version: LATEST_RELEASE.version })}</span>
            <ArrowRight20Regular className="size-4 shrink-0 text-foreground-3 transition-transform duration-normal group-hover/news:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/news:-translate-x-0.5" />
          </a>

          <div className="min-w-0 pt-2">
            <h1 className="font-display text-[clamp(44px,11vw,96px)] leading-[0.95] font-bold tracking-[-0.02em] text-foreground-1 lg:text-[clamp(72px,8vw,128px)]">
              Yugen UI
            </h1>
            <p className="mt-4 max-w-xl text-subtitle1 font-normal text-foreground-2 md:text-title3 md:font-normal">{t("home.lead")}</p>
          </div>
          <YugenKanji className="h-36 w-auto sm:h-52 lg:row-span-2 lg:h-75 xl:h-100" />
          <InstallSnippet className="col-span-2 mt-5 max-w-xl lg:col-span-1" />
        </div>

        <div className="relative mt-6 grid gap-3 md:mt-8 md:grid-cols-2 md:gap-6 xl:grid-cols-3">
          <HeroCard
            href={docsPath("/foundations/color")}
            icon={<Color24Regular />}
            title={t("nav.foundations")}
            text={t("home.cardFoundations")}
            tone="bg-lavender-bg text-lavender-fg"
          />
          <HeroCard
            href={docsPath("/components/button")}
            icon={<Code24Regular />}
            title="Components"
            text={t("home.cardComponents", { count })}
            tone="bg-brand-background-2 text-brand-foreground-2"
          />
          <HeroCard
            href={docsPath("/blocks")}
            icon={<Grid24Regular />}
            title="Blocks"
            text={t("home.cardBlocks")}
            tone="bg-marigold-bg text-marigold-fg"
          />
        </div>
      </section>

      {/* Tạo dự án nhanh (CLI) — khung cài đặt trong hero dành cho dự án có sẵn */}
      <section className="mt-12 md:mt-16 lg:mt-20">
        <h2 className="font-display text-title1 font-semibold">{t("home.create")}</h2>
        <p className="mt-2 max-w-3xl text-body1 text-foreground-2">{t("home.createLead")}</p>
        <div className="mt-4 md:mt-5">
          <HomeCreate />
        </div>
      </section>

      {/* Showcase */}
      <section className="mt-12 md:mt-16 lg:mt-20">
        <h2 className="font-display text-title1 font-semibold">{t("home.explore")}</h2>
        <div className="mt-4 md:mt-6">
          <HomeShowcase />
        </div>
      </section>

      {/* Principles */}
      <section className="mt-12 md:mt-16 lg:mt-20">
        <h2 className="font-display text-title1 font-semibold">{t("home.principles")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 md:mt-5 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 sm:block sm:rounded-2xlarge sm:border sm:border-stroke-2 sm:bg-background-1 sm:p-4">
              <Icon className="shrink-0 text-brand-foreground-1" />
              <div>
                <p className="text-subtitle2 font-semibold sm:mt-3">{t(title)}</p>
                <p className="mt-1 text-body1 text-foreground-2">{t(text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundations */}
      <section className="mt-12 md:mt-16">
        <h2 className="font-display text-title1 font-semibold">{t("nav.foundations")}</h2>
        <div className="mt-4 flex flex-wrap gap-2 md:mt-5">
          {FOUNDATIONS.map((f) => (
            <a
              key={f.slug}
              href={docsPath(`/foundations/${f.slug}`)}
              className="inline-flex h-10 items-center gap-2 rounded-circular border border-stroke-1 bg-background-1 px-4 text-body1 font-semibold hover:border-stroke-1-hover hover:bg-background-1-hover"
            >
              {foundation(f)}
              <ArrowRight20Regular className="size-4 text-foreground-3 rtl:-scale-x-100" />
            </a>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className="mt-12 md:mt-16">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-title1 font-semibold">Components</h2>
          <span className="inline-flex items-center gap-1 text-body1 text-foreground-3">
            <PuzzlePiece24Regular className="size-5" /> {t("home.componentCount", { count })}
          </span>
        </div>
        <div className="mt-2">
          <HomeComponents />
        </div>
      </section>
    </div>
  );
}

/** Màn nhỏ: một hàng gọn (icon · chữ · mũi tên). Từ md: thẻ lớn, mũi tên ở góc. */
function HeroCard({ href, icon, title, text, tone }: { href: string; icon: ReactNode; title: string; text: string; tone: string }) {
  return (
    <a href={href} className="group/hero block h-full rounded-2xlarge md:rounded-3xlarge">
      <Card
        interactive
        size="large"
        className="relative h-full flex-row items-center gap-3 rounded-2xlarge p-4 shadow-4 md:flex-col md:items-start md:gap-4 md:rounded-3xlarge md:p-6 md:shadow-8"
      >
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xlarge [&_svg]:size-5 md:size-14 md:rounded-2xlarge md:[&_svg]:size-7 ${tone}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-subtitle1 font-semibold md:text-title3">{title}</span>
          <span className="mt-0.5 block text-body1 text-foreground-2 md:mt-1">{text}</span>
        </span>
        <ArrowRight20Regular className="shrink-0 text-foreground-3 transition-transform duration-normal ease-easy-ease rtl:-scale-x-100 group-hover/hero:translate-x-1 md:absolute md:top-6 md:inset-e-6 rtl:group-hover/hero:-translate-x-1" />
      </Card>
    </a>
  );
}
