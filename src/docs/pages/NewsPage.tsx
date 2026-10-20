import * as React from "react";
import { ArrowRight16Regular, Sparkle20Regular } from "@fluentui/react-icons";
import { Badge, type BadgeProps, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { cn } from "@/lib/cn";
import { PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { NEWS, NEWS_KIND_LABEL, type NewsKind } from "../news";
import { useLocale } from "../i18n";
import { SITE } from "../site";
import { markNewsSeen } from "../useNews";

const KIND_BADGE: Record<NewsKind, Pick<BadgeProps, "color" | "appearance">> = {
  new: { color: "brand", appearance: "tint" },
  improved: { color: "informative", appearance: "tint" },
  fixed: { color: "success", appearance: "tint" },
  breaking: { color: "warning", appearance: "tint" },
};

function formatDate(date: string, locale: string) {
  return new Intl.DateTimeFormat(locale === "en" ? "en-US" : "vi-VN", { day: "2-digit", month: "long", year: "numeric" }).format(new Date(date));
}

export function NewsPage() {
  const [filter, setFilter] = React.useState<"all" | NewsKind>("all");
  const { t, locale } = useLocale();
  // Nội dung bản tin chưa dịch: lang="vi" khi giao diện là tiếng Anh (App hiện thông báo dịch một phần).
  const itemLang = locale === "en" ? "vi" : undefined;

  React.useEffect(() => markNewsSeen(), []);

  const releases = NEWS.map((r) => ({ ...r, items: filter === "all" ? r.items : r.items.filter((i) => i.kind === filter) })).filter(
    (r) => r.items.length > 0,
  );

  return (
    <div className="pb-XXXL">
      <PageHeader
        eyebrow={t("news.eyebrow")}
        title={t("nav.news")}
        lead={t("news.lead")}
      >
        {t("news.fullIn")} <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">CHANGELOG.md</code>
        {SITE.links.repository ? (
          <>
            {" "}
            {t("news.andPage")}{" "}
            <a className="text-link underline hover:text-link-hover" href={`${SITE.links.repository}/releases`}>
              Releases
            </a>
          </>
        ) : null}
        .
      </PageHeader>

      <div className="mb-XXL flex flex-wrap items-center justify-between gap-M">
        <ToggleGroup
          type="single"
          value={filter}
          onValueChange={(v) => v && setFilter(v as typeof filter)}
          aria-label={t("news.filter")}
        >
          <ToggleGroupItem value="all">{t("news.all")}</ToggleGroupItem>
          {(Object.keys(NEWS_KIND_LABEL) as NewsKind[]).map((k) => (
            <ToggleGroupItem key={k} value={k}>
              {t(`news.kind.${k}`)}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <span className="text-caption1 text-foreground-3">{t("news.current", { version: SITE.version })}</span>
      </div>

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

      <section className="mt-16 rounded-3xlarge border border-stroke-2 bg-background-2 p-XXL">
        <h2 className="font-display text-title3 font-semibold">{t("news.upgradeTitle")}</h2>
        <p className="mt-S max-w-2xl text-body2 text-foreground-2">
          {t("news.upgradeBody")} <code className="font-mono text-caption1">tokens.css</code>.
        </p>
        <CodeBlock className="mt-L" code={`npm install ${SITE.packageName}@${SITE.version}`} />
      </section>
    </div>
  );
}
