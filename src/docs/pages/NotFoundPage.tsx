import { Search20Regular } from "@fluentui/react-icons";
import { Button, StatusPage } from "@/components/ui";
import { CONCEPTS } from "../concepts";
import { useLocale } from "../i18n";
import { COMPONENTS_META } from "../registry";
import { docsPath } from "../router";

/** Khoảng cách sửa chữ (Levenshtein) — gợi ý trang gần giống đường dẫn gõ sai. */
function distance(a: string, b: string) {
  const row = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let prev = row[0];
    row[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (a[i - 1] === b[j - 1] ? 0 : 1));
      prev = next;
    }
  }
  return row[b.length];
}

interface Candidate {
  slug: string;
  path: string;
  name: string;
}

/** Tối đa 3 trang có slug gần với đoạn cuối của đường dẫn (gõ sai một vài ký tự, đổi tên trang). */
export function suggestionsFor(path: string, candidates: Candidate[]): Candidate[] {
  const last = path.toLowerCase().split("/").filter(Boolean).pop()?.replace(/\.html?$/, "") ?? "";
  if (last.length < 3) return [];
  return candidates
    .map((c) => ({ c, d: c.slug.startsWith(last) || last.startsWith(c.slug) ? 0 : distance(last, c.slug) }))
    .filter(({ c, d }) => d <= Math.max(2, Math.floor(Math.min(last.length, c.slug.length) / 3)))
    .sort((x, y) => x.d - y.d || x.c.slug.localeCompare(y.c.slug))
    .slice(0, 3)
    .map(({ c }) => c);
}

/** Trang 404 của docs (#238): StatusPage của thư viện, gợi ý trang gần giống, tìm nhanh và về trang chủ. */
export function NotFoundPage({ path, onSearch }: { path: string; onSearch?: () => void }) {
  const l = useLocale();
  const candidates: Candidate[] = [
    ...COMPONENTS_META.map((m) => ({ slug: m.slug, path: `/components/${m.slug}`, name: l.component(m).name })),
    ...CONCEPTS.map((c) => ({ slug: c.meta.slug, path: `/concepts/${c.meta.slug}`, name: l.concept(c.meta).title })),
  ];
  const suggestions = suggestionsFor(path, candidates);

  return (
    <StatusPage
      status={404}
      autoFocus
      className="min-h-[60dvh]"
      primaryAction={
        onSearch && (
          <Button appearance="primary" icon={<Search20Regular />} onClick={onSearch}>
            {l.t("notFound.search")}
          </Button>
        )
      }
      secondaryAction={
        <Button asChild>
          <a href={docsPath("/")}>{l.t("notFound.home")}</a>
        </Button>
      }
    >
      {suggestions.length > 0 && (
        <nav aria-label={l.t("notFound.suggestions")} className="flex flex-col items-center gap-1">
          <p className="text-caption1 text-foreground-3">{l.t("notFound.suggestions")}</p>
          <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1">
            {suggestions.map((s) => (
              <li key={s.path}>
                <a href={docsPath(s.path)} className="text-body1 text-link underline-offset-2 hover:text-link-hover hover:underline">
                  {s.name}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </StatusPage>
  );
}
