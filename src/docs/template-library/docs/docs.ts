/**
 * Markdown pages → sidebar sections, reading order, headings and page titles. Plain TypeScript (no browser APIs) so the
 * plugins in vite.config.ts reuse it at build time.
 *
 * Pages are `content/<lang>/docs/<section>/<page>.md`: the folder is the sidebar section, the file name the URL
 * (`/<section>/<page>/`). Each folder has an `index.md` whose front matter names the section (`title`, `order`); its body
 * is not shown.
 */
import type { Content } from "./content/types.ts";

export interface DocPage {
  /** "<section>/<page>": the URL path without slashes, and the key in `byKey`. */
  key: string;
  section: string;
  slug: string;
  title: string;
  description: string;
  order: number;
}

export interface DocSection {
  slug: string;
  title: string;
  order: number;
  pages: DocPage[];
}

export interface Docs {
  sections: DocSection[];
  /** Every page in reading order (section by section): previous / next links follow it. */
  pages: DocPage[];
  byKey: Record<string, DocPage>;
}

export interface Heading {
  id: string;
  text: string;
  /** 2–6: `#` in a page counts as level 2, the page title is the only h1. */
  level: number;
}

type Frontmatter = Record<string, string | string[] | boolean>;

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?/;
const FENCE = /^\s*(```|~~~)/;
/** ATX headings at the start of a line. Setext headings (underlined with === or ---) are not used for the outline. */
const HEADING = /^(#{1,6})[ \t]+(.+?)(?:[ \t]+#+)?[ \t]*$/;
const LAST = Number.MAX_SAFE_INTEGER;

const unquote = (s: string) => s.replace(/^(["'])(.*)\1$/, "$2");

/**
 * Simple front matter between two `---` lines:
 *   title: Installation
 *   order: 2
 *   tags: [cli, setup]
 */
export function parseFrontmatter(raw: string): { data: Frontmatter; body: string } {
  const text = raw.replace(/\r\n/g, "\n");
  const m = text.match(FRONTMATTER);
  if (!m) return { data: {}, body: text };
  const data: Frontmatter = {};
  for (const line of m[1].split("\n")) {
    const kv = line.match(/^([\w-]+):\s*(.*)$/);
    if (!kv) continue;
    const value = kv[2].trim();
    if (value.startsWith("[") && value.endsWith("]")) {
      data[kv[1]] = value
        .slice(1, -1)
        .split(",")
        .map((s) => unquote(s.trim()))
        .filter(Boolean);
    } else if (value === "true" || value === "false") {
      data[kv[1]] = value === "true";
    } else {
      data[kv[1]] = unquote(value);
    }
  }
  return { data, body: text.slice(m[0].length) };
}

/** Only the front matter block: all the sidebar needs (the build trims page imports to this, see vite.config.ts). */
export function frontmatterOf(raw: string) {
  return raw.replace(/\r\n/g, "\n").match(FRONTMATTER)?.[0] ?? "";
}

/** Front matter plus the heading lines: all search needs. */
export function outlineOf(raw: string) {
  const { body } = parseFrontmatter(raw);
  let fence = false;
  const lines = body.split("\n").filter((line) => {
    if (FENCE.test(line)) fence = !fence;
    return !fence && HEADING.test(line);
  });
  return `${frontmatterOf(raw)}${lines.join("\n")}\n`;
}

/** "Tailwind CSS" → "tailwind-css", Vietnamese accents removed: URLs and heading ids. */
export const slugify = (s: string) =>
  s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Heading text without Markdown: links, code, emphasis and escapes. */
export function plainText(inline: string) {
  return inline
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/(\*\*|__|~~)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .replace(/\\([\\`*_{}[\]()#+\-.!~|])/g, "$1")
    .trim();
}

/**
 * Headings of a page in order, with unique ids (a repeated title gets -1, -2…). The page, its table of contents and the
 * search index all take their ids from here, so a link from search lands on the right heading.
 */
export function headingsOf(markdown: string): Heading[] {
  const seen = new Map<string, number>();
  const out: Heading[] = [];
  let fence = false;
  for (const line of parseFrontmatter(markdown).body.split("\n")) {
    if (FENCE.test(line)) fence = !fence;
    const m = !fence && line.match(HEADING);
    if (!m) continue;
    const text = plainText(m[2]);
    const base = slugify(text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    out.push({ id: n ? `${base}-${n}` : base, text, level: Math.max(2, m[1].length) });
  }
  return out;
}

const byOrder = <T extends { order: number; title: string }>(a: T, b: T) => a.order - b.order || a.title.localeCompare(b.title);

/** `files`: path → raw Markdown (import.meta.glob or fs). Only the last two parts of the path count: `<section>/<page>.md`. */
export function loadDocs(files: Record<string, string>): Docs {
  const sections = new Map<string, DocSection>();
  const section = (slug: string) => {
    let s = sections.get(slug);
    if (!s) {
      // Folder without index.md: its name, at the end of the sidebar.
      s = { slug, title: slug.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase()), order: LAST, pages: [] };
      sections.set(slug, s);
    }
    return s;
  };
  for (const [file, raw] of Object.entries(files)) {
    const parts = file.split(/[\\/]/);
    const name = parts.at(-1)!.replace(/\.md$/, "");
    const folder = parts.at(-2) ?? "";
    const { data } = parseFrontmatter(raw);
    const str = (key: string) => (typeof data[key] === "string" ? (data[key] as string) : "");
    const order = str("order") === "" ? LAST : Number(str("order"));
    if (!str("title") || Number.isNaN(order)) throw new Error(`${file}: front matter needs a "title" (and "order" must be a number)`);
    const s = section(folder);
    if (name === "index") {
      s.title = str("title");
      s.order = order;
      continue;
    }
    s.pages.push({ key: `${folder}/${name}`, section: folder, slug: name, title: str("title"), description: str("description"), order });
  }
  const list = [...sections.values()].filter((s) => s.pages.length > 0).sort(byOrder);
  for (const s of list) s.pages.sort(byOrder);
  const pages = list.flatMap((s) => s.pages);
  return { sections: list, pages, byKey: Object.fromEntries(pages.map((p) => [p.key, p])) };
}

export type PageKind = { kind: "home" } | { kind: "page"; page: DocPage } | { kind: "notFound" };

/** Title and description of a page: the app writes them into <head> on navigation, the SEO plugin into each HTML file. */
export function pageMeta(page: PageKind, t: Content): { title: string; description: string } {
  const { site } = t;
  if (page.kind === "page") return { title: `${page.page.title} · ${site.title}`, description: page.page.description || site.description };
  if (page.kind === "notFound") return { title: `${t.notFound.title} · ${site.title}`, description: site.description };
  return { title: site.title, description: site.description };
}
