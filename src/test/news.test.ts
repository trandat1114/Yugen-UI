// @vitest-environment node
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { parseInlineMarkdown } from "@/components/ui/AIKit/markdown";
import { localizeFeed, parseNewsFile, readFeed, readNews } from "../../scripts/news.mjs";

/** Tin của trang Có gì mới viết bằng Markdown (#261): scripts/news.mjs. */
const root = path.resolve(__dirname, "../..");

const VI = `---
date: 2026-11-11
upcoming: true
---

# AppShell và Sortable

Tóm tắt dùng \`code\`
trên hai dòng.

## Mới

- AppShell: khung ứng dụng. [→](/components/appshell)
- Sortable sắp xếp lại
  bằng kéo thả.

## Sửa lỗi

- Skeleton chạy mượt.
`;

const parse = (source: string, locale: "vi" | "en" = "vi") => {
  const errors: string[] = [];
  return { ...parseNewsFile(source, "x.vi.md", locale, errors), errors };
};

describe("parseNewsFile", () => {
  it("reads frontmatter, title, summary and items", () => {
    expect(parse(VI)).toEqual({
      date: "2026-11-11",
      upcoming: true,
      title: "AppShell và Sortable",
      summary: "Tóm tắt dùng `code` trên hai dòng.",
      items: [
        { kind: "new", text: "AppShell: khung ứng dụng.", href: "/components/appshell" },
        { kind: "new", text: "Sortable sắp xếp lại bằng kéo thả." },
        { kind: "fixed", text: "Skeleton chạy mượt." },
      ],
      errors: [],
    });
  });

  it("reports mistakes with the line", () => {
    expect(parse(VI.replace("## Sửa lỗi", "## Fixed")).errors).toEqual([expect.stringMatching(/^x\.vi\.md:17: mục "Fixed" không hợp lệ/)]);
    expect(parse(VI.replace("date: 2026-11-11\n", "")).errors).toEqual([expect.stringContaining("thiếu `date")]);
    expect(parse(VI.replace("(/components/appshell)", "(https://x.dev)")).errors).toEqual([expect.stringContaining('link "https://x.dev"')]);
    expect(parse(VI.replace("## Mới\n", "")).errors[0]).toMatch(/tóm tắt chỉ một đoạn văn/);
    expect(parse(VI.replace("- Skeleton", "Skeleton")).errors).toEqual([expect.stringContaining("chỉ có danh sách")]);
    expect(parse(VI.replace("## Mới", "## New"), "en").errors).toEqual([expect.stringContaining('mục "Sửa lỗi" không hợp lệ')]);
  });
});

describe("readFeed", () => {
  let dir: string;
  afterEach(() => fs.rmSync(dir, { recursive: true, force: true }));

  const feed = (files: Record<string, string>) => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), "yugen-news-"));
    const feedDir = path.join(dir, "src/docs/news/cli");
    fs.mkdirSync(feedDir, { recursive: true });
    for (const [name, source] of Object.entries(files)) fs.writeFileSync(path.join(feedDir, name), source);
    const errors: string[] = [];
    return { releases: readFeed(dir, "CLI_NEWS", errors), errors };
  };
  const EN = VI.replace("# AppShell và Sortable", "# AppShell and Sortable").replace("## Mới", "## New").replace("## Sửa lỗi", "## Fixed");

  it("pairs vi and en, newest first", () => {
    const old = VI.replace("upcoming: true\n", "").replace("2026-11-11", "2026-10-01");
    const { releases, errors } = feed({ "0.10.0.vi.md": VI, "0.10.0.en.md": EN, "0.9.0.vi.md": old, "0.9.0.en.md": old.replace(/## Mới/, "## New").replace("## Sửa lỗi", "## Fixed") });
    expect(errors).toEqual([]);
    expect(releases.map((r) => r.version)).toEqual(["0.10.0", "0.9.0"]);
    expect(localizeFeed(releases, "en")[0]).toMatchObject({ version: "0.10.0", upcoming: true, title: "AppShell and Sortable" });
    expect(localizeFeed(releases, "vi")[1]).not.toHaveProperty("upcoming");
  });

  it("reports a missing language and differences between the two", () => {
    expect(feed({ "0.10.0.vi.md": VI }).errors).toEqual([expect.stringContaining("0.10.0.en.md: thiếu")]);
    expect(feed({ "0.10.0.vi.md": VI, "0.10.0.en.md": EN.replace("2026-11-11", "2026-11-12") }).errors).toEqual([expect.stringContaining("`date`")]);
    expect(feed({ "0.10.0.vi.md": VI, "0.10.0.en.md": EN.replace(" [→](/components/appshell)", "") }).errors).toEqual([expect.stringContaining("mục 1 lệch")]);
    expect(feed({ "0.10.0.vi.md": VI, "0.10.0.en.md": EN, "notes.md": "x" }).errors).toEqual([expect.stringContaining("tên file")]);
  });
});

describe("src/docs/news", () => {
  const { feeds, errors } = readNews(root);

  it("has no format errors and both languages for every release", () => {
    expect(errors).toEqual([]);
    expect(feeds.NEWS.length).toBeGreaterThan(0);
  });

  it("uses only inline Markdown that renders: balanced code spans, no raw links", () => {
    for (const releases of Object.values(feeds))
      for (const r of releases)
        for (const locale of ["vi", "en"] as const)
          for (const text of [r[locale].summary, ...r[locale].items.map((i) => i.text)]) {
            expect((text.match(/`/g) ?? []).length % 2, `${r.version}.${locale}: ${text}`).toBe(0);
            const plain = parseInlineMarkdown(text, { relativeLinks: true });
            expect(plain.some((n) => n.type === "text" && /\]\(/.test(n.text)), `${r.version}.${locale}: ${text}`).toBe(false);
          }
  });
});
