import { TAILWIND_IMPORT } from "./project.js";

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/** Bỏ chú thích (theme Yugen có ví dụ `@import "./styles/yugen.css"` trong chú thích đầu file). */
export const stripCssComments = (css: string) => css.replace(/\/\*[\s\S]*?\*\//g, "");

/** Mọi đường dẫn trong `@import "…"` / `@import url(…)`. */
export function cssImports(css: string): string[] {
  return [...stripCssComments(css).matchAll(/@import\s+(?:url\(\s*)?["']([^"']+)["']/g)].map((m) => m[1]);
}

export const hasCssImport = (css: string, spec: string) =>
  new RegExp(`@import\\s+(?:url\\(\\s*)?["']${esc(spec)}["']`).test(stripCssComments(css));

const LEADING = /^\s*(@(charset|import)\b.*|\/\*.*\*\/|\/\/.*)?\s*$/;

/**
 * Thêm `@import "<spec>";` ngay sau `@import "tailwindcss"` (theme Yugen phải đứng sau Tailwind), nếu không có thì sau
 * khối @charset / @import đầu file. Không làm gì nếu đã import. Giữ kiểu xuống dòng của file.
 */
export function addCssImport(css: string, spec: string): { css: string; changed: boolean } {
  if (hasCssImport(css, spec)) return { css, changed: false };
  const eol = css.includes("\r\n") ? "\r\n" : "\n";
  const lines = css.split(/\r?\n/);
  let at = lines.findIndex((l) => TAILWIND_IMPORT.test(l));
  if (at === -1) {
    for (let i = 0; i < lines.length && LEADING.test(lines[i]); i++) if (/^\s*@(charset|import)\b/.test(lines[i])) at = i;
  }
  lines.splice(at + 1, 0, `@import "${spec}";`);
  return { css: lines.join(eol), changed: true };
}

/** Thêm câu lệnh import vào đầu file JS / TS (sau "use client" và chú thích một dòng đầu file). */
export function addJsImport(code: string, statement: string): { code: string; changed: boolean } {
  if (code.includes(statement.replace(/;$/, ""))) return { code, changed: false };
  const eol = code.includes("\r\n") ? "\r\n" : "\n";
  const lines = code.split(/\r?\n/);
  let at = 0;
  while (at < lines.length && /^\s*(["']use (client|server)["'];?|\/\/.*)\s*$/.test(lines[at])) at++;
  lines.splice(at, 0, statement);
  return { code: lines.join(eol), changed: true };
}
