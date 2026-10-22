import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight16Regular } from "@fluentui/react-icons";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, SearchBox, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { COMPONENTS_BY_CATEGORY, readComponentDoc } from "../registry";
import { useLocale } from "../i18n";

/** Demo hero của một component — nạp file registry chứa nó (treo tới khi xong; lỗi → để trống). */
function HeroPreview({ slug }: { slug: string }) {
  const { doc } = readComponentDoc(slug);
  return <>{doc?.hero.render()}</>;
}

const PREVIEW_PLACEHOLDER = <span className="h-8 w-40 animate-pulse rounded-medium bg-stencil-1 motion-reduce:animate-none" />;

/**
 * Chỉ nạp + render demo khi tile sắp vào màn hình — trang chủ có ~110 demo, chia theo file registry (chunk lười).
 * Demo bị khoá tương tác (inert).
 */
function LazyPreview({ slug }: { slug: string }) {
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
      {visible ? (
        <Suspense fallback={PREVIEW_PLACEHOLDER}>
          <HeroPreview slug={slug} />
        </Suspense>
      ) : (
        PREVIEW_PLACEHOLDER
      )}
    </div>
  );
}

/**
 * Giữ dòng vừa chạm đứng yên trên màn hình trong lúc mục mở trước (nằm phía trên) đóng lại — không thì dòng bị đẩy lên
 * khỏi tầm mắt. Bù cuộn từng khung hình cho tới hết chuyển động chiều cao của Accordion.
 */
function keepInPlace(el: HTMLElement) {
  const top = el.getBoundingClientRect().top;
  const end = performance.now() + 400;
  const tick = () => {
    const dy = el.getBoundingClientRect().top - top;
    if (Math.abs(dy) > 0.5) window.scrollBy({ top: dy, behavior: "instant" });
    if (performance.now() < end) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

const ALL = "all";

/** Danh sách component của trang chủ: ô tìm + chip nhóm; màn nhỏ là Accordion (mở một mục), từ sm là lưới demo. */
export function HomeComponents() {
  const { t, category, component } = useLocale();
  const [query, setQuery] = useState("");
  const [group, setGroup] = useState(ALL);
  const [open, setOpen] = useState("");
  // Demo đã từng mở thì giữ lại (khỏi nạp lại, và panel còn nội dung khi đang thu chiều cao).
  const [mounted, setMounted] = useState<ReadonlySet<string>>(new Set());

  const q = query.trim().toLowerCase();
  const groups = useMemo(
    () =>
      COMPONENTS_BY_CATEGORY.filter((g) => group === ALL || g.category === group)
        .map((g) => ({
          ...g,
          items: g.items.map((m) => ({ ...m, ...component(m) })).filter((c) => !q || c.name.toLowerCase().includes(q) || c.slug.includes(q)),
        }))
        .filter((g) => g.items.length > 0),
    [group, q, component],
  );

  const toggle = (slug: string) => {
    if (slug) setMounted((s) => (s.has(slug) ? s : new Set(s).add(slug)));
    const trigger = slug ? document.querySelector<HTMLElement>(`[data-comp="${slug}"]`) : null;
    if (trigger) keepInPlace(trigger);
    setOpen(slug);
  };

  return (
    <>
      <div className="sticky top-14 z-20 -mx-L flex flex-col gap-S bg-shell/90 px-L py-S backdrop-blur-md md:-mx-12 md:px-12 lg:top-18.5">
        <SearchBox
          value={query}
          onValueChange={setQuery}
          placeholder={t("home.search")}
          aria-label={t("home.search")}
          dismissLabel={t("home.clear")}
          className="w-full sm:max-w-sm"
        />
        <ToggleGroup
          type="single"
          appearance="subtle"
          size="small"
          value={group}
          onValueChange={(v) => v && setGroup(v)}
          aria-label={t("home.groups")}
          className="-mx-L w-auto max-w-none overflow-x-auto px-L scrollbar-none sm:mx-0 sm:flex-wrap sm:px-0"
        >
          <ToggleGroupItem value={ALL} className="shrink-0 whitespace-nowrap">
            {t("home.all")}
          </ToggleGroupItem>
          {COMPONENTS_BY_CATEGORY.map((g) => (
            <ToggleGroupItem key={g.category} value={g.category} className="shrink-0 whitespace-nowrap">
              {category(g.category)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      {groups.length === 0 && <p className="mt-XL text-body1 text-foreground-3">{t("home.noMatch", { query })}</p>}

      {/* Màn nhỏ: danh sách tên, chạm để mở demo — mở mục mới thì mục cũ đóng. */}
      <div className="mt-L flex flex-col gap-XL sm:hidden">
        {groups.map((g) => (
          <div key={g.category}>
            <h3 className="flex items-baseline gap-S px-S pb-XS text-subtitle2 font-semibold">
              {category(g.category)}
              <span className="text-caption1 font-normal text-foreground-3">{g.items.length}</span>
            </h3>
            <Accordion type="single" collapsible value={open} onValueChange={toggle} expandIconPosition="end">
              {g.items.map((c) => (
                <AccordionItem key={c.slug} value={c.slug}>
                  <AccordionHeader data-comp={c.slug}>{c.name}</AccordionHeader>
                  <AccordionPanel>
                    {mounted.has(c.slug) && (
                      <div className="flex h-40 items-center justify-center overflow-hidden rounded-2xlarge border border-stroke-2 bg-background-3 p-M">
                        <LazyPreview slug={c.slug} />
                      </div>
                    )}
                    <p className="mt-S text-caption1 text-foreground-3">{c.lead}</p>
                    <a
                      href={`#/components/${c.slug}`}
                      className="mt-S inline-flex items-center gap-XS rounded-small text-body1 font-semibold text-brand-foreground-1 hover:underline"
                    >
                      {t("home.open", { name: c.name })}
                      <ArrowRight16Regular className="rtl:-scale-x-100" />
                    </a>
                  </AccordionPanel>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}
      </div>

      {/* Từ sm: lưới demo. */}
      <div className="mt-XL hidden flex-col gap-XXXL sm:flex">
        {groups.map((g) => (
          <div key={g.category}>
            <h3 className="flex items-baseline gap-S border-b border-stroke-2 pb-S text-title3 font-semibold">
              {category(g.category)}
              <span className="text-body1 font-normal text-foreground-3">{g.items.length}</span>
            </h3>
            <div className="mt-L grid gap-L sm:grid-cols-2 xl:grid-cols-4">
              {g.items.map((c) => (
                <div key={c.slug} className="group/comp relative rounded-3xlarge">
                  <div className="pointer-events-none flex h-40 items-center justify-center overflow-hidden rounded-3xlarge border border-stroke-2 bg-background-3 p-M transition-shadow duration-normal group-hover/comp:shadow-8">
                    <LazyPreview slug={c.slug} />
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
    </>
  );
}
