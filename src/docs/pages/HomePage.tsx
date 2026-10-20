import { useEffect, useRef, useState, type ReactNode } from "react";
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
import { Card } from "@/components/ui";
import { YugenMark } from "../YugenMark";
import { COMPONENTS, COMPONENTS_BY_CATEGORY } from "../registry";
import { FOUNDATIONS } from "../foundations";
import { LATEST_RELEASE } from "../news";
import { HomeShowcase } from "./HomeShowcase";

const PRINCIPLES = [
  { icon: Color24Regular, title: "Token 3 lớp", text: "Global → Alias → Utility. Đổi brand chỉ bằng data-brand." },
  { icon: DarkTheme24Regular, title: "Light & Dark", text: "Theme và brand lồng được trên bất kỳ phần tử nào." },
  { icon: ShieldCheckmark24Regular, title: "Accessible", text: "Radix primitives, tương phản AA, không dùng màu làm tín hiệu duy nhất." },
  { icon: Copy24Regular, title: "Copy & dùng", text: "Mỗi mẫu đều có code thật — hover để copy vào dự án." },
];

/** Chỉ render demo khi tile sắp vào màn hình — trang chủ có ~80 demo. Demo bị khoá tương tác (inert). */
function LazyPreview({ render }: { render: () => ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.setAttribute("inert", "");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className="flex max-w-full origin-center scale-75 flex-wrap items-center justify-center gap-S">
      {visible ? render() : <span className="h-8 w-40 animate-pulse rounded-medium bg-stencil-1 motion-reduce:animate-none" />}
    </div>
  );
}

/** Highlight kiểu "con trỏ cộng tác" như hero của fluent2.microsoft.design. */
function CollabHighlight({ children }: { children: ReactNode }) {
  return (
    <span className="relative ms-M me-XS inline-block">
      <span className="absolute -top-2 -bottom-1 -inset-s-1 w-1 rounded-circular bg-brand-background-hover" />
      <span className="absolute -top-3 -inset-s-2 size-4 rounded-circular rounded-es-none bg-brand-background-hover" />
      <span className="relative inline-block bg-brand-background-2-hover/70 px-S text-brand-foreground-1">{children}</span>
    </span>
  );
}

export function HomePage() {
  return (
    <div className="pb-XXXL">
      {/* Hero */}
      <section className="relative -mx-L overflow-hidden px-L pt-XXXL pb-16 md:-mx-12 md:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-hero-glow mask-[linear-gradient(to_bottom,black_70%,transparent)]"
        />
        <YugenMark size={300} className="pointer-events-none absolute top-0 inset-e-[4%] hidden opacity-90 drop-shadow-2xl lg:block" />

        <div className="relative max-w-3xl">
          <a
            href="#/news"
            className="group/news mb-XL inline-flex max-w-full items-center gap-S rounded-circular border border-stroke-2 bg-background-1/80 py-XXS ps-XXS pe-M text-caption1 shadow-2 backdrop-blur transition-colors duration-faster hover:border-brand-stroke"
          >
            <span className="rounded-circular bg-brand-background px-S py-XXS font-semibold text-foreground-on-brand">v{LATEST_RELEASE.version}</span>
            <span className="truncate text-foreground-1">{LATEST_RELEASE.title}</span>
            <ArrowRight20Regular className="size-4 shrink-0 text-foreground-3 transition-transform duration-normal group-hover/news:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover/news:-translate-x-0.5" />
          </a>
          <p className="text-caption1 font-semibold tracking-[0.2em] text-foreground-1 uppercase">Welcome to</p>
          <h1 className="mt-S font-display text-[clamp(64px,11vw,136px)] leading-[0.95] font-bold tracking-[-0.02em] text-foreground-1">
            Yugen UI
          </h1>
          <p className="mt-XL font-display text-[clamp(28px,3.6vw,48px)] leading-tight font-semibold text-foreground-1">
            Để công việc<CollabHighlight>trôi chảy</CollabHighlight>
          </p>
          <p className="mt-L max-w-xl text-subtitle1 font-normal text-foreground-2">
            Thư viện UI cho React + Tailwind CSS, lấy cảm hứng từ Fluent 2 của Microsoft. Token chuẩn, {COMPONENTS.length}{" "}
            component sẵn dùng, code mẫu copy được.
          </p>
          <p className="mt-L inline-flex flex-wrap items-center gap-S rounded-circular border border-stroke-2 bg-background-1/70 px-M py-XS text-caption1 text-foreground-2 backdrop-blur">
            <YugenMark size={16} />
            Tạo bởi <span className="font-semibold text-foreground-1">trandat1114</span>
            <span aria-hidden className="text-foreground-4">·</span>
            Lấy cảm hứng từ <span className="font-semibold text-foreground-1">Microsoft Fluent 2</span>
          </p>
        </div>

        <div className="relative mt-XXXL grid gap-XXL md:grid-cols-2 xl:grid-cols-3">
          <HeroCard
            href="#/foundations/color"
            icon={<Color24Regular />}
            title="Ngôn ngữ thiết kế"
            text="Màu, typography, spacing, elevation, motion"
            tone="bg-lavender-bg text-lavender-fg"
          />
          <HeroCard
            href="#/components/button"
            icon={<Code24Regular />}
            title="Components"
            text={`${COMPONENTS.length} component React + Tailwind kèm code mẫu`}
            tone="bg-brand-background-2 text-brand-foreground-2"
          />
          <HeroCard
            href="#/blocks"
            icon={<Grid24Regular />}
            title="Blocks"
            text="Mẫu giao diện ghép sẵn để copy cả cụm"
            tone="bg-marigold-bg text-marigold-fg"
          />
        </div>
      </section>

      {/* Showcase */}
      <section className="mt-XL">
        <h2 className="font-display text-title1 font-semibold">Khám phá</h2>
        <p className="mt-S max-w-2xl text-body2 text-foreground-2">
          Rê chuột vào từng nhóm để xem component thực tế. Gradient chỉ dùng cho phần minh hoạ như thế này — không dùng
          trong control.
        </p>
        <div className="mt-XXL">
          <HomeShowcase />
        </div>
      </section>

      {/* Principles */}
      <section className="mt-20">
        <h2 className="font-display text-title1 font-semibold">Nguyên tắc</h2>
        <div className="mt-XL grid gap-L sm:grid-cols-2 lg:grid-cols-4">
          {PRINCIPLES.map(({ icon: Icon, title, text }) => (
            <div key={title} className="rounded-2xlarge border border-stroke-2 bg-background-1 p-L">
              <Icon className="text-brand-foreground-1" />
              <p className="mt-M text-subtitle2 font-semibold">{title}</p>
              <p className="mt-XS text-body1 text-foreground-2">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Foundations */}
      <section className="mt-16">
        <h2 className="font-display text-title1 font-semibold">Ngôn ngữ thiết kế</h2>
        <div className="mt-XL flex flex-wrap gap-S">
          {FOUNDATIONS.map((f) => (
            <a
              key={f.slug}
              href={`#/foundations/${f.slug}`}
              className="inline-flex h-10 items-center gap-S rounded-circular border border-stroke-1 bg-background-1 px-L text-body1 font-semibold hover:border-stroke-1-hover hover:bg-background-1-hover"
            >
              {f.name}
              <ArrowRight20Regular className="size-4 text-foreground-3 rtl:-scale-x-100" />
            </a>
          ))}
        </div>
      </section>

      {/* Components grid */}
      <section className="mt-16">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-title1 font-semibold">Components</h2>
          <span className="inline-flex items-center gap-XS text-body1 text-foreground-3">
            <PuzzlePiece24Regular className="size-5" /> {COMPONENTS.length} component
          </span>
        </div>
        <div className="mt-XL flex flex-col gap-XXXL">
          {COMPONENTS_BY_CATEGORY.map((group) => (
            <div key={group.category}>
              <h3 className="flex items-baseline gap-S border-b border-stroke-2 pb-S text-title3 font-semibold">
                {group.category}
                <span className="text-body1 font-normal text-foreground-3">{group.items.length}</span>
              </h3>
              <div className="mt-L grid gap-L sm:grid-cols-2 xl:grid-cols-4">
                {group.items.map((c) => (
                  <div key={c.slug} className="group/comp relative rounded-3xlarge">
                    <div className="pointer-events-none flex h-40 items-center justify-center overflow-hidden rounded-3xlarge border border-stroke-2 bg-background-3 p-M transition-shadow duration-normal group-hover/comp:shadow-8">
                      <LazyPreview render={c.hero.render} />
                    </div>
                    <a
                      href={`#/components/${c.slug}`}
                      className="mt-S block rounded-small text-subtitle2 font-semibold group-hover/comp:text-brand-foreground-1 after:absolute after:inset-0 after:rounded-3xlarge"
                    >
                      {c.name}
                    </a>
                    <p className="mt-XXS line-clamp-2 text-caption1 text-foreground-3">{c.lead}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function HeroCard({ href, icon, title, text, tone }: { href: string; icon: ReactNode; title: string; text: string; tone: string }) {
  return (
    <a href={href} className="group/hero block h-full rounded-3xlarge">
      <Card interactive size="large" className="h-full gap-L rounded-3xlarge p-XXL shadow-8">
        <div className="flex items-start justify-between">
          <span className={`inline-flex size-14 shrink-0 items-center justify-center rounded-2xlarge [&_svg]:size-7 ${tone}`}>{icon}</span>
          <ArrowRight20Regular className="text-foreground-3 transition-transform duration-normal ease-easy-ease rtl:-scale-x-100 group-hover/hero:translate-x-1 rtl:group-hover/hero:-translate-x-1" />
        </div>
        <span>
          <span className="block font-display text-title3 font-semibold">{title}</span>
          <span className="mt-XS block text-body1 text-foreground-2">{text}</span>
        </span>
      </Card>
    </a>
  );
}
