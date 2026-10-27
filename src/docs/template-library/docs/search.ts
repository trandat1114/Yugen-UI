import { headingsOf, loadDocs, type DocPage } from "./docs";

/** One result in the search palette: a page, or an h2 / h3 heading of a page. */
export interface SearchEntry {
  /** Unique: "<section>/<page>" or "<section>/<page>#<heading id>". */
  id: string;
  page: DocPage;
  /** Section title, the group in the palette. */
  section: string;
  title: string;
  /** Heading id; none for the page itself. */
  hash?: string;
  /** What a query is matched against, folded (lower case, no accents). */
  text: string;
}

/** Lower case without Vietnamese accents: "Bắt đầu" and "bat dau" match. */
export const fold = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase();

/**
 * Index of one language. `files`: path → Markdown (front matter and headings are enough, which is what the build gives
 * the palette, see vite.config.ts). Pages in reading order, each followed by its h2 / h3 headings.
 */
export function buildIndex(files: Record<string, string>): SearchEntry[] {
  const docs = loadDocs(files);
  const byKey = Object.fromEntries(Object.entries(files).map(([file, raw]) => [file.split(/[\\/]/).slice(-2).join("/").replace(/\.md$/, ""), raw]));
  return docs.sections.flatMap((section) =>
    section.pages.flatMap((page): SearchEntry[] => [
      { id: page.key, page, section: section.title, title: page.title, text: fold(`${page.title} ${page.description} ${section.title}`) },
      ...headingsOf(byKey[page.key] ?? "")
        .filter((h) => h.level <= 3)
        .map((h) => ({ id: `${page.key}#${h.id}`, page, section: section.title, title: h.text, hash: h.id, text: fold(`${h.text} ${page.title}`) })),
    ]),
  );
}

/**
 * Entries with every word of the query (any order, ignoring case and accents); titles that contain them all come first.
 * An empty query lists the pages only.
 */
export function searchIndex(index: SearchEntry[], query: string, limit = 40): SearchEntry[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return index.filter((e) => !e.hash);
  const found = index.filter((e) => words.every((w) => e.text.includes(w)));
  const inTitle = (e: SearchEntry) => words.every((w) => fold(e.title).includes(w));
  return [...found.filter(inTitle), ...found.filter((e) => !inTitle(e))].slice(0, limit);
}
