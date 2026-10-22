import * as React from "react";
import { Accessibility20Regular, Rss20Regular, WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  Menu,
  MenuItemRadio,
  MenuPopover,
  MenuRadioGroup,
  MenuTrigger,
  type YugenTheme,
} from "yugen-ui";
import { pageMeta, type PageKind } from "./content";
import { PostList } from "./PostList";
import { PostPage } from "./PostPage";
import { POST_BY_SLUG, TAGS } from "./posts";
import { Link, useRouter, type Route } from "./router";
import { SITE } from "./site";

const THEMES: { value: YugenTheme; label: string }[] = [
  { value: "light", label: "Sáng" },
  { value: "dark", label: "Tối" },
  { value: "high-contrast", label: "Tương phản cao" },
];

function pageOf(route: Route): PageKind {
  if (route.name === "post") return POST_BY_SLUG[route.slug] ? { kind: "post", post: POST_BY_SLUG[route.slug] } : { kind: "notFound" };
  if (route.name === "tag") {
    const tag = TAGS.find((t) => t.slug === route.tag);
    return tag ? { kind: "tag", tag: tag.name } : { kind: "notFound" };
  }
  return { kind: route.name };
}

function ThemeMenu({ theme, onChange }: { theme: YugenTheme; onChange: (theme: YugenTheme) => void }) {
  const icon = theme === "dark" ? <WeatherMoon20Regular /> : theme === "high-contrast" ? <Accessibility20Regular /> : <WeatherSunny20Regular />;
  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" icon={icon} aria-label="Giao diện" />
      </MenuTrigger>
      <MenuPopover align="end">
        <MenuRadioGroup value={theme} onValueChange={(v) => onChange(v as YugenTheme)}>
          {THEMES.map((t) => (
            <MenuItemRadio key={t.value} value={t.value}>
              {t.label}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}

function NotFound({ headingLevel }: { headingLevel: "h1" | "h2" }) {
  const Heading = headingLevel;
  return (
    <Empty className="py-8">
      <Heading className="font-display text-title3 font-semibold text-foreground-1">Không tìm thấy trang</Heading>
      <EmptyDescription>Bài viết có thể đã đổi địa chỉ hoặc chưa từng tồn tại.</EmptyDescription>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={{ name: "home" }}>Về trang chủ</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}

export interface BlogLayoutProps {
  theme: YugenTheme;
  onThemeChange: (theme: YugenTheme) => void;
  /** Nhúng trong trang khác (preview): cuộn trong khung, không có landmark <main>, không ghi <head>. */
  embedded?: boolean;
}

/** Khung blog: thanh trên cùng, nội dung theo route, chân trang. */
export function BlogLayout({ theme, onThemeChange, embedded = false }: BlogLayoutProps) {
  const { route } = useRouter();
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const headingLevel = embedded ? "h2" : "h1";
  const Main = embedded ? "div" : "main";
  const post = route.name === "post" ? POST_BY_SLUG[route.slug] : undefined;
  // File sinh lúc build (rss.xml, sitemap.xml) không tồn tại trong preview.
  const fileHref = (file: string) => (embedded ? undefined : `${import.meta.env.BASE_URL}${file}`);

  React.useEffect(() => {
    if (embedded) {
      scrollRef.current?.scrollTo({ top: 0 });
      return;
    }
    const { title, description } = pageMeta(pageOf(route));
    document.title = title;
    document.querySelector('meta[name="description"]')?.setAttribute("content", description);
  }, [route, embedded]);

  return (
    <div ref={scrollRef} className={`flex flex-col bg-background-2 text-foreground-1 ${embedded ? "h-full overflow-y-auto" : "min-h-dvh"}`}>
      <header className="sticky top-0 z-10 border-b border-stroke-2 bg-background-1/90 backdrop-blur">
        <div className="mx-auto flex h-14 w-full max-w-5xl items-center gap-3 px-4">
          <Link to={{ name: "home" }} className="flex items-center gap-2 font-display text-subtitle2 font-semibold text-foreground-1">
            <span aria-hidden className="flex size-8 items-center justify-center rounded-medium bg-brand-background text-foreground-on-brand">
              桜
            </span>
            {SITE.title}
          </Link>
          <div className="ms-auto flex items-center gap-1">
            <Button asChild appearance="subtle" icon={<Rss20Regular />}>
              <a href={fileHref("rss.xml")} aria-label="RSS">
                <span className="hidden sm:inline">RSS</span>
              </a>
            </Button>
            <ThemeMenu theme={theme} onChange={onThemeChange} />
          </div>
        </div>
      </header>

      <Main aria-label={embedded ? SITE.title : undefined} className="@container mx-auto w-full max-w-5xl flex-1 px-4 py-6">
        {route.name === "home" && <PostList headingLevel={headingLevel} />}
        {route.name === "tag" && <PostList key={route.tag} tag={route.tag} headingLevel={headingLevel} />}
        {route.name === "post" && (post ? <PostPage key={post.slug} post={post} headingLevel={headingLevel} /> : <NotFound headingLevel={headingLevel} />)}
        {route.name === "notFound" && <NotFound headingLevel={headingLevel} />}
      </Main>

      <footer className="border-t border-stroke-2 bg-background-1">
        <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 text-caption1 text-foreground-3">
          <span>
            © {new Date().getFullYear()} {SITE.author} · Dựng bằng{" "}
            <a className="text-link underline hover:text-link-hover" href="https://trandat1114.github.io/Yugen-UI/" target="_blank" rel="noreferrer">
              Yugen UI
            </a>
          </span>
          <a className="text-link underline hover:text-link-hover" href={fileHref("sitemap.xml")}>
            Sitemap
          </a>
        </div>
      </footer>
    </div>
  );
}
