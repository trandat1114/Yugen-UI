import { ChevronRight12Regular } from "@fluentui/react-icons";
import type { YugenTheme } from "@/components/ui";
import { COMPONENT_BY_SLUG } from "../registry";
import { DoDont, DocSection, ExampleFrame, ExampleGrid, OnThisPage, PageHeader, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";

const TOC = [
  { id: "import", label: "Import" },
  { id: "variants", label: "Biến thể" },
  { id: "usage", label: "Cách dùng" },
  { id: "props", label: "Props" },
];

export function ComponentPage({ slug, theme, brand }: { slug: string; theme: YugenTheme; brand: string }) {
  const doc = COMPONENT_BY_SLUG[slug];
  if (!doc) return <p className="py-XXXL text-body2 text-foreground-3">Không tìm thấy component “{slug}”.</p>;

  return (
    <div className="flex gap-XXXL">
      <article key={slug} className="min-w-0 flex-1">
        <nav className="flex items-center gap-XS pt-XL text-caption1 text-foreground-3">
          <a href="#/" className="hover:text-foreground-1 hover:underline">
            Components
          </a>
          <ChevronRight12Regular className="rtl:-scale-x-100" />
          <span>{doc.category}</span>
          <ChevronRight12Regular className="rtl:-scale-x-100" />
          <span className="text-foreground-1">{doc.name}</span>
        </nav>

        <PageHeader title={doc.name} lead={doc.lead}>
          {doc.description}
        </PageHeader>

        <ExampleFrame example={doc.hero} defaultTheme={theme} defaultBrand={brand} />

        <div className="mt-XXXL">
          <DocSection id="import" title="Import">
            <CodeBlock code={doc.importCode} />
          </DocSection>
          <DocSection id="variants" title="Biến thể" description="Mỗi ô là một mẫu độc lập: hover để Copy, hoặc bấm Code để xem mã nguồn.">
            <ExampleGrid examples={doc.examples} />
          </DocSection>
          <DocSection id="usage" title="Cách dùng">
            <DoDont dos={doc.dos} donts={doc.donts} />
          </DocSection>
          <DocSection id="props" title="Props">
            <PropsTable props={doc.props} />
          </DocSection>
        </div>
      </article>
      <OnThisPage key={`toc-${slug}`} items={TOC} />
    </div>
  );
}
