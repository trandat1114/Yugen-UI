import * as React from "react";
import { ArrowLeft16Regular, ArrowRight16Regular } from "@fluentui/react-icons";
import { Divider } from "@/components/ui";
import { cn } from "@/lib/cn";
import { headingsOf, type DocPage as Page, type Heading } from "./docs";
import { routeOf } from "./HomePage";
import { Markdown } from "./Markdown";
import { readPromise, useSite } from "./pages";
import { Link, useRouter, type Route } from "./router";

/** Distance from the top of the scroll area at which a heading counts as the current one (below the sticky header). */
const ACTIVE_OFFSET = 96;

const scrollBehavior = (): ScrollBehavior => (window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

/** The heading being read: the last one above the offset, or the last heading once the page is scrolled to the end. */
function useActiveHeading(article: React.RefObject<HTMLElement | null>, headings: Heading[], scrollRoot?: React.RefObject<HTMLElement | null>) {
  const [active, setActive] = React.useState<string | undefined>(headings[0]?.id);

  React.useEffect(() => {
    const root = scrollRoot?.current ?? null;
    const target: HTMLElement | Window = root ?? window;
    let frame = 0;
    const update = () => {
      frame = 0;
      const top = (root?.getBoundingClientRect().top ?? 0) + ACTIVE_OFFSET;
      let current = headings[0]?.id;
      for (const h of headings) {
        const el = article.current?.querySelector(`#${CSS.escape(h.id)}`);
        if (!el || el.getBoundingClientRect().top > top) break;
        current = h.id;
      }
      const scrolled = root ? root.scrollTop : window.scrollY;
      const end = root ? root.scrollHeight - root.clientHeight : document.documentElement.scrollHeight - window.innerHeight;
      setActive(scrolled > 0 && scrolled >= end - 2 ? headings.at(-1)?.id : current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    target.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [article, headings, scrollRoot]);

  return active;
}

function TableOfContents({ headings, active, onJump }: { headings: Heading[]; active?: string; onJump: (id: string) => void }) {
  const { t } = useSite();
  if (headings.length < 2) return null;
  return (
    <nav aria-label={t.page.toc} className="flex flex-col gap-2">
      <p className="text-caption1 font-semibold text-foreground-1">{t.page.toc}</p>
      <ul className="flex flex-col border-s border-stroke-2">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              aria-current={active === h.id ? "location" : undefined}
              onClick={(e) => {
                e.preventDefault();
                onJump(h.id);
              }}
              className={cn(
                "-ms-px block border-s-2 border-transparent py-1 text-caption1 text-foreground-2 hover:text-foreground-1",
                h.level === 3 ? "ps-6" : "ps-3",
                active === h.id && "border-brand-stroke font-semibold text-brand-foreground-1 hover:text-brand-foreground-1",
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Pager({ page }: { page: Page }) {
  const { t, docs } = useSite();
  const i = docs.pages.findIndex((p) => p.key === page.key);
  const previous = docs.pages[i - 1];
  const next = docs.pages[i + 1];
  if (!previous && !next) return null;
  const card = (p: Page, label: string, align: "start" | "end") => (
    <Link
      to={routeOf(p)}
      className={cn(
        "flex flex-col gap-0.5 rounded-xlarge border border-stroke-2 bg-background-1 p-4 hover:border-stroke-1 hover:bg-background-1-hover",
        align === "end" && "items-end text-end",
      )}
    >
      <span className="flex items-center gap-1 text-caption1 text-foreground-3">
        {align === "start" && <ArrowLeft16Regular className="rtl:-scale-x-100" />}
        {label}
        {align === "end" && <ArrowRight16Regular className="rtl:-scale-x-100" />}
      </span>
      <span className="text-body1 font-semibold text-foreground-1">{p.title}</span>
    </Link>
  );
  return (
    <nav aria-label={t.page.pager} className="grid gap-3 @xl:grid-cols-2">
      <div>{previous && card(previous, t.page.previous, "start")}</div>
      <div>{next && card(next, t.page.next, "end")}</div>
    </nav>
  );
}

export interface DocPageProps {
  page: Page;
  /** The page's Markdown, from loadPage(): the page suspends until it is there. */
  text: Promise<string>;
  /** The route that opened the page: with `hash`, the page scrolls to that heading. */
  target: Route;
  headingLevel: "h1" | "h2";
  /** Scroll container when embedded; the window otherwise. */
  scrollRoot?: React.RefObject<HTMLElement | null>;
}

/** One Markdown page: section, title and description, the text, previous / next, and the table of contents. */
export default function DocPage({ page, text, target, headingLevel, scrollRoot }: DocPageProps) {
  const { docs } = useSite();
  const { memory } = useRouter();
  const markdown = readPromise(text);
  const headings = React.useMemo(() => headingsOf(markdown), [markdown]);
  const toc = React.useMemo(() => headings.filter((h) => h.level <= 3), [headings]);
  const articleRef = React.useRef<HTMLElement>(null);
  const active = useActiveHeading(articleRef, toc, scrollRoot);
  const section = docs.sections.find((s) => s.slug === page.section);
  const Heading = headingLevel;

  const jump = React.useCallback(
    (id: string, behavior: ScrollBehavior = scrollBehavior()) => {
      const el = articleRef.current?.querySelector(`#${CSS.escape(id)}`);
      const root = scrollRoot?.current;
      // Embedded: scroll the frame only, not the page around it.
      if (el && root) root.scrollTo({ top: root.scrollTop + el.getBoundingClientRect().top - root.getBoundingClientRect().top - 16, behavior });
      else el?.scrollIntoView({ behavior, block: "start" });
      // The address keeps the heading, so the link can be shared. Not in the embedded preview: its URL is the host page's.
      if (!memory) window.history.replaceState(null, "", `#${id}`);
    },
    [memory, scrollRoot],
  );

  // Opened from a link to a heading or from search.
  React.useEffect(() => {
    if (target.name === "page" && target.hash) jump(target.hash, "auto");
  }, [target, jump]);

  return (
    <div className="grid gap-10 @6xl/docs:grid-cols-[minmax(0,1fr)_13rem]">
      <article ref={articleRef} className="@container flex min-w-0 flex-col gap-6">
        <div className="flex flex-col gap-2">
          {section && <p className="text-caption1 font-semibold text-brand-foreground-1">{section.title}</p>}
          <Heading className="font-display text-title2 font-semibold text-foreground-1 @2xl:text-title1">{page.title}</Heading>
          {page.description && <p className="text-subtitle2 font-normal text-foreground-2">{page.description}</p>}
        </div>
        <Markdown headings={headings}>{markdown}</Markdown>
        <Divider />
        <Pager page={page} />
      </article>
      <div className="hidden @6xl/docs:block">
        <div className="sticky top-20">
          <TableOfContents headings={toc} active={active} onJump={jump} />
        </div>
      </div>
    </div>
  );
}
