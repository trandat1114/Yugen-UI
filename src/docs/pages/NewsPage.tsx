import * as React from "react";
import { ArrowRight16Regular, Sparkle20Regular } from "@fluentui/react-icons";
import { Badge, type BadgeProps, Tabs, TabsContent, TabsList, TabsTrigger, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { CLI_NEWS, CREATE_NEWS, NEWS, NEWS_KIND_LABEL, type NewsKind, type NewsRelease } from "../news";
import { useLocale } from "../i18n";
import type { MessageKey } from "../i18n/vi";
import { SITE } from "../site";
import { markNewsSeen } from "../useNews";

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
  releases: NewsRelease[];
  changelog: string;
  releasesPage?: boolean;
  upgradeBody: MessageKey;
  upgrade: string;
}[] = [
  {
    id: "yugen-ui",
    label: "yugen-ui",
    releases: NEWS,
    changelog: "CHANGELOG.md",
    releasesPage: true,
    upgradeBody: "news.upgradeBody",
    upgrade: `npm install ${SITE.packageName}@${SITE.version}`,
  },
  {
    id: "cli",
    label: "@yugen-ui/cli",
    releases: CLI_NEWS,
    changelog: "packages/cli/CHANGELOG.md",
    upgradeBody: "news.cliUpgradeBody",
    upgrade: "npm install -g @yugen-ui/cli@latest",
  },
  {
    id: "create",
    label: "create-yugen-ui",
    releases: CREATE_NEWS,
    changelog: "packages/cli/CHANGELOG.md",
    upgradeBody: "news.createUpgradeBody",
    upgrade: "npx create-yugen-ui@latest my-app",
  },
];

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
}

function Timeline({ releases }: { releases: NewsRelease[] }) {
  const { t, locale } = useLocale();
  // Nội dung bản tin chưa dịch: lang="vi" khi giao diện là tiếng Anh (App hiện thông báo dịch một phần).
  const itemLang = locale === "en" ? "vi" : undefined;
  return (
    <ol className="relative flex flex-col gap-XXXL before:absolute before:inset-y-2 before:inset-s-1.75 before:w-0.5 before:rounded-circular before:bg-stroke-2 md:before:inset-s-41.75">
      {releases.map((release, index) => (
        <li key={release.version} className="relative grid gap-M ps-XXL md:grid-cols-[160px_minmax(0,1fr)] md:gap-XXL md:ps-0">
          <span
            aria-hidden
            className={cn(
              "absolute top-1.5 inset-s-0 size-4 rounded-circular border-4 border-shell md:inset-s-40",
              index === 0 ? "bg-brand-background" : "bg-stroke-accessible",
            )}
          />
          <div className="md:pe-XL md:text-end">
            <p className="font-display text-title3 font-semibold tabular-nums">v{release.version}</p>
            <time dateTime={release.date} className="text-caption1 text-foreground-3">
              {formatDate(release.date, locale)}
            </time>
          </div>
          <article className="rounded-2xlarge border border-stroke-2 bg-background-1 p-XL shadow-2 md:ms-XL">
            <div className="flex flex-wrap items-center gap-S">
              <h2 lang={itemLang} className="font-display text-title3 font-semibold">
                {release.title}
              </h2>
              {index === 0 && (
                <Badge appearance="filled" color="brand" icon={<Sparkle20Regular />}>
                  {t("news.latest")}
                </Badge>
              )}
            </div>
            <p lang={itemLang} className="mt-S text-body2 text-foreground-2">
              {release.summary}
            </p>
            <ul className="mt-L flex flex-col gap-S">
              {release.items.map((item) => (
                <li key={item.text} className="flex items-start gap-M">
                  <Badge size="large" shape="rounded" className="mt-XXS w-24 shrink-0" {...KIND_BADGE[item.kind]}>
                    {t(`news.kind.${item.kind}`)}
                  </Badge>
                  <span className="text-body1 text-foreground-1">
                    {itemLang ? <span lang={itemLang}>{item.text}</span> : item.text}
                    {item.href && (
                      <a
                        href={item.href}
                        className="ms-XS inline-flex items-center gap-XXS whitespace-nowrap text-link hover:text-link-hover hover:underline"
                      >
                        {t("news.view")}
                        <ArrowRight16Regular className="rtl:-scale-x-100" />
                      </a>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        </li>
      ))}
    </ol>
  );
}

export function NewsPage() {
  const [filter, setFilter] = React.useState<"all" | NewsKind>("all");
  const { t } = useLocale();

  React.useEffect(() => markNewsSeen(), []);

  return (
    <div className="pb-XXXL">
      <PageHeader eyebrow={t("news.eyebrow")} title={t("nav.news")} lead={t("news.lead")} />

      <Tabs defaultValue={FEEDS[0].id} className="flex flex-col gap-XL">
        <TabsList aria-label={t("news.packages")}>
          {FEEDS.map((feed) => (
            <TabsTrigger key={feed.id} value={feed.id} className="font-mono">
              {feed.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="flex flex-wrap items-center gap-M">
          <ToggleGroup type="single" value={filter} onValueChange={(v) => v && setFilter(v as typeof filter)} aria-label={t("news.filter")}>
            <ToggleGroupItem value="all">{t("news.all")}</ToggleGroupItem>
            {(Object.keys(NEWS_KIND_LABEL) as NewsKind[]).map((k) => (
              <ToggleGroupItem key={k} value={k}>
                {t(`news.kind.${k}`)}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>

        {FEEDS.map((feed) => {
          const releases = feed.releases
            .map((r) => ({ ...r, items: filter === "all" ? r.items : r.items.filter((i) => i.kind === filter) }))
            .filter((r) => r.items.length > 0);
          return (
            <TabsContent key={feed.id} value={feed.id} className="flex flex-col gap-XXL">
              <p className="text-caption1 text-foreground-3">
                {t("news.current", { version: feed.releases[0].version })} · {t("news.fullIn")}{" "}
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

              {releases.length > 0 ? <Timeline releases={releases} /> : <p className="text-body1 text-foreground-3">{t("news.empty")}</p>}

              <section className="mt-XXL rounded-3xlarge border border-stroke-2 bg-background-2 p-XXL">
                <h2 className="font-display text-title3 font-semibold">{t("news.upgradeTitle")}</h2>
                <p className="mt-S max-w-2xl text-body2 text-foreground-2">
                  {t(feed.upgradeBody)}
                  {feed.id === "yugen-ui" && (
                    <>
                      {" "}
                      <code className="font-mono text-caption1">tokens.css</code>.
                    </>
                  )}
                </p>
                <CodeBlock className="mt-L" code={feed.upgrade} />
              </section>
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
}
