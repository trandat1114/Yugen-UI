import { Suspense, useState } from "react";
import { ChevronRight12Regular } from "@fluentui/react-icons";
import { CodeTabs, ErrorState, PageProgressFallback, SkeletonText, type YugenTheme } from "@/components/ui";
import type { AppBrand } from "@/hooks/useAppearance";
import { COMPONENT_META_BY_SLUG, readComponentDoc, retryComponentDoc } from "../registry";
import { COMPONENTS_TRANSLATED } from "../registry/translated";
import { DoDont, DocSection, ExampleFrame, ExampleGrid, OnThisPage, PageHeader, PropsTable } from "../blocks";
import { installSnippets } from "../install";
import { useLocale } from "../i18n";
import { docsPath } from "../router";

function InstallTabs({ importCode }: { importCode: string }) {
  const { npm, cli, shadcn } = installSnippets(importCode);
  const { t } = useLocale();
  const files = [
    { name: "npm", code: npm, language: "tsx" as const },
    ...(cli ? [{ name: "@yugen-ui/cli", code: cli, language: "tsx" as const }] : []),
    ...(shadcn ? [{ name: "shadcn CLI", code: shadcn, language: "tsx" as const }] : []),
    { name: t("component.repoTab"), code: importCode, language: "tsx" as const },
  ];
  return <CodeTabs files={files} />;
}


/** Phần nạp lười: demo, import, biến thể, cách dùng, props (file registry chứa component). */
function ComponentBody({ slug, theme, brand, onRetry }: { slug: string; theme: YugenTheme; brand: AppBrand; onRetry: () => void }) {
  const { t, locale } = useLocale();
  const { doc, error } = readComponentDoc(slug, locale);
  // Giao diện tiếng Anh: phần chữ chưa dịch và nội dung demo (viết bằng tiếng Việt) mang lang="vi" cho trình đọc màn hình.
  const contentLang = locale === "en" && !COMPONENTS_TRANSLATED.has(slug) ? "vi" : undefined;
  const demoLang = locale === "en" ? "vi" : undefined;
  if (!doc)
    return (
      <ErrorState
        variant="alert"
        title={t("component.loadError")}
        description={error instanceof Error ? error.message : t("component.loadErrorHint")}
        onRetry={onRetry}
      />
    );

  return (
    <>
      <ExampleFrame example={doc.hero} defaultTheme={theme} defaultBrand={brand} demoLang={demoLang} />

      <div className="mt-8">
        <DocSection
          id="import"
          title="Import"
          description={t("component.importDesc")}
        >
          <InstallTabs importCode={doc.importCode} />
        </DocSection>
        <DocSection id="variants" title={t("component.variants")} description={t("component.variantsDesc")}>
          <ExampleGrid examples={doc.examples} lang={contentLang} demoLang={demoLang} />
        </DocSection>
        <DocSection id="usage" title={t("component.usage")}>
          <DoDont dos={doc.dos} donts={doc.donts} contentLang={contentLang} />
        </DocSection>
        <DocSection id="props" title="Props">
          <PropsTable props={doc.props} contentLang={contentLang} />
        </DocSection>
      </div>
    </>
  );
}

function ComponentDescription({ slug }: { slug: string }) {
  const { locale } = useLocale();
  const description = readComponentDoc(slug, locale).doc?.description;
  // Mô tả chưa dịch: đánh dấu lang="vi" khi giao diện là tiếng Anh.
  return locale === "en" && !COMPONENTS_TRANSLATED.has(slug) ? <span lang="vi">{description}</span> : <>{description}</>;
}

export function ComponentPage({ slug, theme, brand }: { slug: string; theme: YugenTheme; brand: AppBrand }) {
  // Đổi key sau "Thử lại" → mô tả + thân trang render lại và đọc kết quả tải mới.
  const [attempt, setAttempt] = useState(0);
  const { t, locale, category, component } = useLocale();
  const meta = COMPONENT_META_BY_SLUG[slug];
  if (!meta) return <p className="py-8 text-body2 text-foreground-3">{t("component.notFound", { slug })}</p>;
  const { name, lead } = component(meta);
  const toc = [
    { id: "import", label: "Import" },
    { id: "variants", label: t("component.variants") },
    { id: "usage", label: t("component.usage") },
    { id: "props", label: "Props" },
  ];

  // Header (tên, câu dẫn) lấy từ metadata nạp sẵn → hiện ngay, không nhảy bố cục khi demo nạp xong.
  // data-page-loading: e2e (waitForDocsReady) chờ hết phần đang nạp — commit cùng lúc với h1 nên không có khe hở.
  return (
    <div className="flex gap-8">
      <article key={slug} className="min-w-0 flex-1">
        <nav className="flex items-center gap-1 pt-5 text-caption1 text-foreground-3">
          <a href={docsPath("/")} className="hover:text-foreground-1 hover:underline">
            Components
          </a>
          <ChevronRight12Regular className="rtl:-scale-x-100" />
          <span>{category(meta.category)}</span>
          <ChevronRight12Regular className="rtl:-scale-x-100" />
          <span className="text-foreground-1">{name}</span>
        </nav>

        <PageHeader title={name} lead={lead}>
          <Suspense fallback={<SkeletonText lines={2} data-page-loading="" />}>
            <ComponentDescription key={attempt} slug={slug} />
          </Suspense>
        </PageHeader>

        <Suspense
          fallback={
            <PageProgressFallback>
              <SkeletonText lines={8} data-page-loading="" />
            </PageProgressFallback>
          }
        >
          <ComponentBody
            key={attempt}
            slug={slug}
            theme={theme}
            brand={brand}
            onRetry={() => {
              retryComponentDoc(slug, locale);
              setAttempt((n) => n + 1);
            }}
          />
        </Suspense>
      </article>
      <OnThisPage key={`toc-${slug}-${locale}`} items={toc} />
    </div>
  );
}
