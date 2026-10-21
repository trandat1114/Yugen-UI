import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { loadPosts, pageMeta, parseFrontmatter, readingMinutes, slugify } from "./content";

describe("blog content", () => {
  it("đọc frontmatter: chuỗi, chuỗi có dấu nháy, mảng, boolean", () => {
    const { data, body } = parseFrontmatter('---\ntitle: "A: B"\ntags: [React, "Tailwind CSS"]\ndraft: true\n---\n\nNội dung');
    expect(data).toEqual({ title: "A: B", tags: ["React", "Tailwind CSS"], draft: true });
    expect(body).toBe("\nNội dung");
  });

  it("không có frontmatter → giữ nguyên nội dung", () => {
    expect(parseFrontmatter("# Xin chào")).toEqual({ data: {}, body: "# Xin chào" });
  });

  it("loadPosts: slug từ tên file, bỏ bản nháp, mới nhất trước, báo lỗi khi thiếu date", () => {
    const posts = loadPosts({
      "./posts/cu.md": "---\ntitle: Cũ\ndate: 2026-01-01\n---\nx",
      "./posts/moi.md": "---\ntitle: Mới\ndate: 2026-02-01\n---\nx",
      "./posts/nhap.md": "---\ntitle: Nháp\ndate: 2026-03-01\ndraft: true\n---\nx",
    });
    expect(posts.map((p) => p.slug)).toEqual(["moi", "cu"]);
    expect(() => loadPosts({ "x.md": "---\ntitle: X\n---\n" })).toThrow(/x\.md/);
  });

  it("slugify bỏ dấu tiếng Việt", () => {
    expect(slugify("Hướng dẫn Đà Lạt")).toBe("huong-dan-da-lat");
    expect(slugify("Tailwind CSS")).toBe("tailwind-css");
  });

  it("thời gian đọc tối thiểu 1 phút, không đếm code", () => {
    expect(readingMinutes("một hai ba")).toBe(1);
    expect(readingMinutes(`${"chữ ".repeat(600)}\n\`\`\`\n${"code ".repeat(5000)}\n\`\`\``)).toBe(3);
  });

  it("bài mẫu trong posts/ đều hợp lệ và có mô tả", () => {
    const dir = path.join(__dirname, "posts");
    const files = Object.fromEntries(fs.readdirSync(dir).map((f) => [f, fs.readFileSync(path.join(dir, f), "utf8")]));
    const posts = loadPosts(files);
    expect(posts.length).toBeGreaterThan(0);
    for (const post of posts) expect(pageMeta({ kind: "post", post }).description).toBe(post.description);
  });
});
