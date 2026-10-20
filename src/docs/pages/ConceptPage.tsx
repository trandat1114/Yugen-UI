import { Suspense } from "react";
import { ChevronRight12Regular } from "@fluentui/react-icons";
import { PageProgressFallback, SkeletonText } from "@/components/ui";
import { CONCEPT_BY_SLUG, CONCEPTS } from "../concepts";
import { OnThisPage, PageHeader } from "../blocks";

export function ConceptPage({ slug }: { slug: string }) {
  const entry = CONCEPT_BY_SLUG[slug];
  if (!entry) return <p className="py-XXXL text-body2 text-foreground-3">Không tìm thấy trang “{slug}”.</p>;

  const { meta, Page } = entry;
  const index = CONCEPTS.findIndex((c) => c.meta.slug === slug);
  const prev = CONCEPTS[index - 1];
  const next = CONCEPTS[index + 1];

  return (
    <div className="flex gap-XXXL">
      <article key={slug} className="min-w-0 flex-1">
        <nav className="flex items-center gap-XS pt-XL text-caption1 text-foreground-3">
          <span>Khái niệm</span>
          <ChevronRight12Regular className="rtl:-scale-x-100" />
          <span>{meta.group}</span>
          <ChevronRight12Regular className="rtl:-scale-x-100" />
          <span className="text-foreground-1">{meta.title}</span>
        </nav>
        <PageHeader title={meta.title} lead={meta.lead} />
        <div className="pb-XXL">
          <Suspense
            fallback={
              <PageProgressFallback>
                <SkeletonText lines={8} />
              </PageProgressFallback>
            }
          >
            <Page />
          </Suspense>
        </div>
        <div className="grid gap-M border-t border-stroke-2 pt-XL sm:grid-cols-2">
          {prev ? (
            <a href={`#/concepts/${prev.meta.slug}`} className="rounded-xlarge border border-stroke-2 p-L hover:bg-subtle-hover">
              <span className="text-caption1 text-foreground-3">Trang trước</span>
              <span className="block text-body1 font-semibold">{prev.meta.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a
              href={`#/concepts/${next.meta.slug}`}
              className="rounded-xlarge border border-stroke-2 p-L text-end hover:bg-subtle-hover"
            >
              <span className="text-caption1 text-foreground-3">Trang sau</span>
              <span className="block text-body1 font-semibold">{next.meta.title}</span>
            </a>
          )}
        </div>
      </article>
      <OnThisPage key={`toc-${slug}`} items={meta.toc} />
    </div>
  );
}
