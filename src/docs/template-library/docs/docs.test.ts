import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import en from "./content/en";
import vi from "./content/vi";
import type { Content } from "./content/types";
import { frontmatterOf, headingsOf, loadDocs, outlineOf, pageMeta, parseFrontmatter, slugify } from "./docs";
import { packageCommand } from "./Markdown";
import { parsePath, pathOf } from "./router";
import { buildIndex, searchIndex } from "./search";

/** content/<lang>/docs/<section>/<page>.md → { "<section>/<page>.md": raw } */
function readDocs(t: Content) {
  const dir = path.join(__dirname, "content", t.lang, "docs");
  const files: Record<string, string> = {};
  for (const section of fs.readdirSync(dir)) {
    for (const file of fs.readdirSync(path.join(dir, section))) files[`${section}/${file}`] = fs.readFileSync(path.join(dir, section, file), "utf8");
  }
  return files;
}

describe("docs template", () => {
  it("front matter: strings, quoted strings, arrays, booleans; trimmed to the block or the outline", () => {
    const raw = '---\ntitle: "A: B"\norder: 2\ntags: [cli, "set up"]\ndraft: true\n---\n\nText\n\n## One\n\n```md\n## Not a heading\n```\n\n### Two';
    expect(parseFrontmatter(raw).data).toEqual({ title: "A: B", order: "2", tags: ["cli", "set up"], draft: true });
    expect(parseFrontmatter("# Hi")).toEqual({ data: {}, body: "# Hi" });
    expect(frontmatterOf(raw.replace(/\n/g, "\r\n"))).toBe('---\ntitle: "A: B"\norder: 2\ntags: [cli, "set up"]\ndraft: true\n---\n');
    expect(outlineOf(raw)).toBe(`${frontmatterOf(raw)}## One\n### Two\n`);
    expect(headingsOf(outlineOf(raw))).toEqual(headingsOf(raw));
  });

  it("headings: ids from plain text, unique, code fences skipped, # counts as level 2", () => {
    const md = "# Intro\n\n## Install `the SDK`\n\n```bash\n# comment\n```\n\n### [Links](/x/) and **bold**\n\n## Install the SDK\n\n#### Đặt tên";
    expect(headingsOf(md)).toEqual([
      { id: "intro", text: "Intro", level: 2 },
      { id: "install-the-sdk", text: "Install the SDK", level: 2 },
      { id: "links-and-bold", text: "Links and bold", level: 3 },
      { id: "install-the-sdk-1", text: "Install the SDK", level: 2 },
      { id: "dat-ten", text: "Đặt tên", level: 4 },
    ]);
    expect(slugify("Chia sẻ và phân quyền")).toBe("chia-se-va-phan-quyen");
  });

  it("loadDocs: sections from folders and index.md, ordered by front matter; errors name the file", () => {
    const docs = loadDocs({
      "./b/index.md": "---\ntitle: Second\norder: 2\n---\n",
      "./b/z.md": "---\ntitle: Zed\norder: 1\n---\n",
      "./a/index.md": "---\ntitle: First\norder: 1\n---\n",
      "./a/y.md": "---\ntitle: Why\norder: 2\n---\n",
      "./a/x.md": "---\ntitle: Ex\norder: 1\n---\n",
      "./c-d/w.md": "---\ntitle: Double\n---\n",
    });
    expect(docs.sections.map((s) => [s.slug, s.title])).toEqual([["a", "First"], ["b", "Second"], ["c-d", "C d"]]);
    expect(docs.pages.map((p) => p.key)).toEqual(["a/x", "a/y", "b/z", "c-d/w"]);
    expect(() => loadDocs({ "./a/broken.md": "---\norder: 1\n---\n" })).toThrow(/broken\.md/);
    expect(() => loadDocs({ "./a/nan.md": "---\ntitle: X\norder: two\n---\n" })).toThrow(/nan\.md/);
  });

  it("router: path ⇄ route, heading in the hash, unknown paths", () => {
    for (const route of [{ name: "home" }, { name: "page", section: "guides", page: "cli" }] as const) expect(parsePath(pathOf(route))).toEqual(route);
    expect(parsePath("/guides/cli", "#in-ci")).toEqual({ name: "page", section: "guides", page: "cli", hash: "in-ci" });
    expect(parsePath("/guides/cli/more/")).toEqual({ name: "notFound" });
    expect(parsePath("/guides/")).toEqual({ name: "notFound" });
  });

  it("```npm fences become package manager tabs, other commands stay code", () => {
    expect(packageCommand("npm install @sakura-notes/sdk")).toEqual({ packages: ["@sakura-notes/sdk"], dev: false, command: "install" });
    expect(packageCommand("npm i a b --save-dev")).toEqual({ packages: ["a", "b"], dev: true, command: "install" });
    expect(packageCommand("npx @sakura-notes/cli login")).toEqual({ packages: "@sakura-notes/cli login", command: "dlx" });
    expect(packageCommand("npm run build")).toBeNull();
    expect(packageCommand("npm install a\nnpm install b")).toBeNull();
  });

  it.each([en, vi])("sample pages in content/$lang/docs: complete, and every internal link points at a page and heading", (t) => {
    const files = readDocs(t);
    const docs = loadDocs(files);
    expect(docs.sections.map((s) => s.pages.length)).toEqual([3, 4, 3]);
    const headings = Object.fromEntries(docs.pages.map((p) => [p.key, new Set(headingsOf(files[`${p.key}.md`]).map((h) => h.id))]));
    for (const page of docs.pages) {
      expect(page.description, page.key).not.toBe("");
      expect(pageMeta({ kind: "page", page }, t)).toEqual({ title: `${page.title} · ${t.site.title}`, description: page.description });
      for (const [, target, hash] of files[`${page.key}.md`].matchAll(/\]\(\/([^/)#]+\/[^/)#]+)\/(?:#([^)]+))?\)/g)) {
        expect(docs.byKey[target], `${page.key} → ${target}`).toBeTruthy();
        if (hash) expect(headings[target], `${page.key} → ${target}#${hash}`).toContain(hash);
      }
    }
    for (const link of [t.home.primary, t.home.secondary]) expect(docs.byKey[link.page], link.page).toBeTruthy();
  });

  it("search: titles and h2 / h3 headings, every word, accents ignored; empty query lists the pages", () => {
    const enIndex = buildIndex(Object.fromEntries(Object.entries(readDocs(en)).map(([f, raw]) => [f, outlineOf(raw)])));
    const viIndex = buildIndex(Object.fromEntries(Object.entries(readDocs(vi)).map(([f, raw]) => [f, outlineOf(raw)])));
    expect(searchIndex(enIndex, "")).toHaveLength(10);
    expect(searchIndex(enIndex, "install cli")[0]).toMatchObject({ title: "Install the CLI", hash: "install-the-cli", page: { key: "getting-started/installation" } });
    expect(searchIndex(enIndex, "ROTATE")[0]).toMatchObject({ title: "Rotate a key", section: "API reference" });
    expect(searchIndex(viIndex, "bat dau nhanh")[0]).toMatchObject({ id: "bat-dau/bat-dau-nhanh", title: "Bắt đầu nhanh" });
    expect(searchIndex(viIndex, "chữ ký")[0]).toMatchObject({ hash: "kiem-tra-chu-ky" });
    expect(searchIndex(enIndex, "zzz")).toEqual([]);
    expect(enIndex.filter((e) => e.hash).every((e) => !e.title.startsWith("#"))).toBe(true);
  });

  it("pageMeta: home and not found per language", () => {
    expect(pageMeta({ kind: "home" }, en)).toEqual({ title: en.site.title, description: en.site.description });
    expect(pageMeta({ kind: "notFound" }, vi).title).toBe("Không tìm thấy trang · Tài liệu Sakura Notes");
  });
});
