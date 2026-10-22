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
      <TabsList size="small" aria-label={t("home.install")} className="border-b border-stroke-2 px-XS">
        <TabsTrigger value="cli">CLI</TabsTrigger>
        <TabsTrigger value="npm">npm</TabsTrigger>
        <TabsTrigger value="shadcn">shadcn</TabsTrigger>
      </TabsList>
      <div className="flex items-start gap-S py-XS ps-M pe-XS">
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
              className="col-start-1 row-start-1 py-XS font-mono text-body1 text-foreground-1 wrap-anywhere data-[state=inactive]:invisible"
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
    <div className="pb-XXXL">
      {/* Hero */}
      <section className="relative -mx-L overflow-hidden px-L pt-XL pb-12 md:-mx-12 md:px-12 md:pt-XXXL md:pb-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-hero-glow mask-[linear-gradient(to_bottom,black_70%,transparent)]"
        />
        <FallingPetals />

        {/* lg: chữ 幽玄 chiếm 2 hàng — hàng cuối co giãn để khung cài đặt nằm sát dưới mô tả. */}
        <div className="relative grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-L lg:grid-rows-[auto_auto_1fr] lg:gap-x-XXL">
          <a
            href="#/news"
            className="group/news col-span-2 mb-XL inline-flex max-w-full items-center gap-S justify-self-start rounded-circular border border-stroke-2 bg-background-1/80 py-XXS ps-XXS pe-M text-caption1 shadow-2 backdrop-blur transition-colors duration-faster hover:border-brand-stroke"
          >
            <span className="rounded-circular bg-brand-background px-S py-XXS font-semibold text-foreground-on-brand">v{LATEST_RELEASE.version}</span>
            <span className="truncate text-foreground-1">{t("home.releasePill", { title: LATEST_RELEASE.title, version: LATEST_RELEASE.version })}</span>
            <ArrowRight20Regular className="size-4 shrink-0 text-foreground-3 transition-transform duration-normal group-hover/news:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/news:-translate-x-0.5" />
          </a>

          <div className="min-w-0 pt-S">
            <h1 className="font-display text-[clamp(44px,11vw,96px)] leading-[0.95] font-bold tracking-[-0.02em] text-foreground-1 lg:text-[clamp(72px,8vw,128px)]">
              Yugen UI
            </h1>
            <p className="mt-L max-w-xl text-subtitle1 font-normal text-foreground-2 md:text-title3 md:font-normal">{t("home.lead")}</p>
          </div>
          <YugenKanji className="h-36 w-auto sm:h-52 lg:row-span-2 lg:h-75 xl:h-100" />
          <InstallSnippet className="col-span-2 mt-XL max-w-xl lg:col-span-1" />
        </div>

        <div className="relative mt-XXL grid gap-M md:mt-XXXL md:grid-cols-2 md:gap-XXL xl:grid-cols-3">
          <HeroCard
            href="#/foundations/color"
            icon={<Color24Regular />}
            title={t("nav.foundations")}
            text={t("home.cardFoundations")}
            tone="bg-lavender-bg text-lavender-fg"
          />
          <HeroCard
            href="#/components/button"
            icon={<Code24Regular />}
            title="Components"
            text={t("home.cardComponents", { count })}
            tone="bg-brand-background-2 text-brand-foreground-2"
          />
          <HeroCard
            href="#/blocks"
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
        <p className="mt-S max-w-3xl text-body1 text-foreground-2">{t("home.createLead")}</p>
        <div className="mt-L md:mt-XL">
          <HomeCreate />
        </div>
      </section>

      {/* Showcase */}
      <section className="mt-12 md:mt-16 lg:mt-20">
        <h2 className="font-display text-title1 font-semibold">{t("home.explore")}</h2>
        <div className="mt-L md:mt-XXL">
          <HomeShowcase />
        </div>
      </section>

      {/* Principles */}
      <section className="mt-12 md:mt-16 lg:mt-20">
        <h2 className="font-display text-title1 font-semibold">{t("home.principles")}</h2>
        <div className="mt-L grid gap-L sm:grid-cols-2 md:mt-XL lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-M sm:block sm:rounded-2xlarge sm:border sm:border-stroke-2 sm:bg-background-1 sm:p-L">
              <Icon className="shrink-0 text-brand-foreground-1" />
              <div>
                <p className="text-subtitle2 font-semibold sm:mt-M">{t(title)}</p>
                <p className="mt-XS text-body1 text-foreground-2">{t(text)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Foundations */}
      <section className="mt-12 md:mt-16">
        <h2 className="font-display text-title1 font-semibold">{t("nav.foundations")}</h2>
        <div className="mt-L flex flex-wrap gap-S md:mt-XL">
          {FOUNDATIONS.map((f) => (
            <a
              key={f.slug}
              href={`#/foundations/${f.slug}`}
              className="inline-flex h-10 items-center gap-S rounded-circular border border-stroke-1 bg-background-1 px-L text-body1 font-semibold hover:border-stroke-1-hover hover:bg-background-1-hover"
            >
              {foundation(f)}
              <ArrowRight20Regular className="size-4 text-foreground-3 rtl:-scale-x-100" />
            </a>
          ))}
        </div>
      </section>

      {/* Components */}
      <section className="mt-12 md:mt-16">
        <div className="flex items-end justify-between gap-M">
          <h2 className="font-display text-title1 font-semibold">Components</h2>
          <span className="inline-flex items-center gap-XS text-body1 text-foreground-3">
            <PuzzlePiece24Regular className="size-5" /> {t("home.componentCount", { count })}
          </span>
        </div>
        <div className="mt-S">
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
        className="relative h-full flex-row items-center gap-M rounded-2xlarge p-L shadow-4 md:flex-col md:items-start md:gap-L md:rounded-3xlarge md:p-XXL md:shadow-8"
      >
        <span
          className={`inline-flex size-10 shrink-0 items-center justify-center rounded-xlarge [&_svg]:size-5 md:size-14 md:rounded-2xlarge md:[&_svg]:size-7 ${tone}`}
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-subtitle1 font-semibold md:text-title3">{title}</span>
          <span className="mt-XXS block text-body1 text-foreground-2 md:mt-XS">{text}</span>
        </span>
        <ArrowRight20Regular className="shrink-0 text-foreground-3 transition-transform duration-normal ease-easy-ease rtl:-scale-x-100 group-hover/hero:translate-x-1 md:absolute md:top-XXL md:inset-e-XXL rtl:group-hover/hero:-translate-x-1" />
      </Card>
    </a>
  );
}
