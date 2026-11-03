import * as React from "react";
import { ArrowRight16Regular, Sparkle20Regular } from "@fluentui/react-icons";
import { Avatar, Badge, type BadgeProps, Markdown, type MarkdownLink, Tabs, TabsContent, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { NEWS_INDEX, NEWS_KINDS, useNewsFeeds, type NewsFeeds, type NewsKind, type NewsRelease } from "../news";
import { useLocale } from "../i18n";
import type { MessageKey } from "../i18n/vi";
import { SITE } from "../site";
import { markNewsSeen } from "../useNews";
import { docsPath } from "../router";
import { avatarOf, creditsBetween, profileUrl } from "../contributors";

const KIND_BADGE: Record<NewsKind, Pick<BadgeProps, "color" | "appearance">> = {
  new: { color: "brand", appearance: "tint" },
  improved: { color: "informative", appearance: "tint" },
  fixed: { color: "success", appearance: "tint" },
  breaking: { color: "warning", appearance: "tint" },
};

/** Mỗi gói một tab: yugen-ui (Changesets) và hai gói cài đặt phát hành riêng (packages/cli, packages/create-yugen-ui). */
const FEEDS: {
  id: string;
  label: string;
  releases: keyof NewsFeeds<NewsRelease>;
  changelog: string;
  releasesPage?: boolean;
  upgradeBody: MessageKey;
  upgrade: string;
}[] = [
  {
    id: "yugen-ui",
    label: "yugen-ui",
    releases: "NEWS",
    changelog: "CHANGELOG.md",
    releasesPage: true,
    upgradeBody: "news.upgradeBody",
    upgrade: `npm install ${SITE.packageName}@${SITE.version}`,
  },
  {
    id: "cli",
    label: "@yugen-ui/cli",
    releases: "CLI_NEWS",
    changelog: "packages/cli/CHANGELOG.md",
    upgradeBody: "news.cliUpgradeBody",
    upgrade: "npm install -g @yugen-ui/cli@latest",
  },
  {
    id: "create",
    label: "create-yugen-ui",
    releases: "CREATE_NEWS",
    changelog: "packages/cli/CHANGELOG.md",
    upgradeBody: "news.createUpgradeBody",
    upgrade: "npx create-yugen-ui@latest my-app",
  },
];

/**
 * Người đóng góp của từng bản yugen-ui (#248): đóng góp sau ngày của bản trước, tới ngày của bản này (bản sắp ra: ngày dự
 * kiến). Maintainer không được liệt kê.
 */
const CREDITS = new Map(NEWS_INDEX.NEWS.map((release, i, all) => [release.version, creditsBetween(all[i + 1]?.date, release.date)]));

/** Link trong nội dung tin: đường dẫn docs thêm BASE, link ngoài mở tab mới. */
function NewsLink({ href, title, children, external }: MarkdownLink) {
  return external ? (
    <a href={href} title={title} target="_blank" rel="noreferrer">
      {children}
    </a>
  ) : (
    <a href={href.startsWith("/") ? docsPath(href) : href} title={title}>
      {children}
    </a>
  );
}

function ReleaseCredits({ credits }: { credits: ReturnType<typeof creditsBetween> }) {
  const { t } = useLocale();
  return (
    <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-stroke-2 pt-3 text-caption1 text-foreground-2">
      <span>{t("news.thanks")}</span>
      {credits.map(({ person, items }) => (
        <span key={person.login} className="inline-flex items-center gap-1.5">
          <span aria-hidden>
            <Avatar name={person.name} src={avatarOf(person, 40)} size={20} color="colorful" />
          </span>
          <a href={profileUrl(person.login)} target="_blank" rel="noreferrer" className="font-semibold text-foreground-1 hover:underline">
            {person.name}
          </a>
          {/* Một số mỗi issue / PR, kể cả khi người đó có nhiều bình luận trong cùng một issue. */}
          {[...new Map(items.filter((item) => item.number && item.url).map((item) => [item.number, item])).values()].map((item) => (
            <a key={item.number} href={item.url} target="_blank" rel="noreferrer" className="text-link tabular-nums hover:text-link-hover hover:underline">
              #{item.number}
            </a>
          ))}
        </span>
      ))}
    </p>
  );
}

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
}

function Timeline({ releases, credits }: { releases: NewsRelease[]; credits?: typeof CREDITS }) {
  const { t, locale } = useLocale();
  const latest = releases.find((r) => !r.upcoming);
  return (
    <ol className="relative flex flex-col gap-8 before:absolute before:inset-y-2 before:inset-s-1.75 before:w-0.5 before:rounded-circular before:bg-stroke-2 md:before:inset-s-41.75">
      {releases.map((release) => (
        <li key={release.version} className="relative grid gap-3 ps-6 md:grid-cols-[160px_minmax(0,1fr)] md:gap-6 md:ps-0">
          <span
            aria-hidden
            className={cn(
              "absolute top-1.5 inset-s-0 size-4 rounded-circular border-4 border-shell md:inset-s-40",
              release === latest ? "bg-brand-background" : "bg-stroke-accessible",
            )}
          />
          <div className="md:pe-5 md:text-end">
            <p className="font-display text-title3 font-semibold tabular-nums">v{release.version}</p>
            <time dateTime={release.date} className="text-caption1 text-foreground-3">
              {release.upcoming ? t("news.planned", { date: formatDate(release.date, locale) }) : formatDate(release.date, locale)}
            </time>
          </div>
          <article className="rounded-2xlarge border border-stroke-2 bg-background-1 p-5 shadow-2 md:ms-5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="font-display text-title3 font-semibold">
                {release.title}
              </h2>
              {release.upcoming ? (
                <Badge appearance="tint" color="warning">
                  {t("news.upcoming")}
                </Badge>
              ) : (
                release === latest && (
                  <Badge appearance="filled" color="brand" icon={<Sparkle20Regular />}>
                    {t("news.latest")}
                  </Badge>
                )
              )}
            </div>
            <p className="mt-2 text-body2 text-foreground-2">
              <Markdown inline renderLink={NewsLink}>
                {release.summary}
              </Markdown>
            </p>
            <ul className="mt-4 flex flex-col gap-2">
              {release.items.map((item) => (
                <li key={item.text} className="flex items-start gap-3">
                  <Badge size="large" shape="rounded" className="mt-0.5 w-24 shrink-0" {...KIND_BADGE[item.kind]}>
                    {t(`news.kind.${item.kind}`)}
                  </Badge>
                  <span className="text-body1 text-foreground-1">
                    <Markdown inline renderLink={NewsLink}>
                      {item.text}
                    </Markdown>
                    {item.href && (
                      <a
                        href={docsPath(item.href)}
                        className="ms-1 inline-flex items-center gap-0.5 whitespace-nowrap text-link hover:text-link-hover hover:underline"
                      >
                        {t("news.view")}
                        <ArrowRight16Regular className="rtl:-scale-x-100" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
            {!!credits?.get(release.version)?.length && <ReleaseCredits credits={credits.get(release.version)!} />}
          </article>
        </li>
      ))}
    </ol>
  );
}

export function NewsPage() {
  const [filter, setFilter] = React.useState<"all" | NewsKind>("all");
  const { t, locale } = useLocale();
  const feeds = useNewsFeeds(locale);

  React.useEffect(() => markNewsSeen(), []);

  return (
    <div className="pb-8">
      <PageHeader eyebrow={t("news.eyebrow")} title={t("nav.news")} lead={t("news.lead")} />

      <Tabs defaultValue={FEEDS[0].id} className="flex flex-col gap-5">
        <TabsList aria-label={t("news.packages")}>
          {FEEDS.map((feed) => (
            <TabsTrigger key={feed.id} value={feed.id} className="font-mono">
              {feed.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex flex-wrap items-center gap-3">
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as typeof filter)} aria-label={t("news.filter")}>
            <ToggleGroupItem value="all">{t("news.all")}</ToggleGroupItem>
            {NEWS_KINDS.map((k) => (
              <ToggleGroupItem key={k} value={k}>
                {t(`news.kind.${k}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {FEEDS.map((feed) => {
          const all = feeds[feed.releases];
          const releases = all
            .map((r) => ({ ...r, items: filter === "all" ? r.items : r.items.filter((i) => i.kind === filter) }))
            .filter((r) => r.items.length > 0);
          return (
            <TabsContent key={feed.id} value={feed.id} className="flex flex-col gap-6">
              <p className="text-caption1 text-foreground-3">
                {t("news.current", { version: (all.find((r) => !r.upcoming) ?? all[0]).version })} · {t("news.fullIn")}{" "}
                <a className="text-link underline hover:text-link-hover" href={`${SITE.links.repository}/blob/main/${feed.changelog}`}>
                  {feed.changelog}
                </a>
                {feed.releasesPage && (
                  <>
                    {" "}
                    {t("news.andPage")}{" "}
                    <a className="text-link underline hover:text-link-hover" href={`${SITE.links.repository}/releases`}>
                      Releases
                    </a>
                  </>
                )}
                .
              </p>

              {releases.length > 0 ? <Timeline releases={releases} credits={feed.id === "yugen-ui" ? CREDITS : undefined} /> : <p className="text-body1 text-foreground-3">{t("news.empty")}</p>}

              <section className="mt-6 rounded-3xlarge border border-stroke-2 bg-background-2 p-6">
                <h2 className="font-display text-title3 font-semibold">{t("news.upgradeTitle")}</h2>
                <p className="mt-2 max-w-2xl text-body2 text-foreground-2">
                  {t(feed.upgradeBody)}
                  {feed.id === "yugen-ui" && (
                    <>
                      {" "}
                      <code className="font-mono text-caption1">tokens.css</code>.
                    </>
                  )}
                </p>
                <CodeBlock className="mt-4" code={feed.upgrade} />
              </section>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
