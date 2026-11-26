/**
 * Property-based test (fast-check) cho phần nhận nội dung không tin cậy: parseMarkdown đọc chữ do model / người dùng gửi,
 * sanitizeHref quyết định link nào được render. Thay vì vài ví dụ cố định, fast-check sinh hàng trăm chuỗi ngẫu nhiên
 * (kể cả ghép từ các mảnh hay gây lỗi) và thu nhỏ ca hỏng về ví dụ ngắn nhất khi một tính chất sai.
 */
import { describe, expect, it } from "vitest";
import fc from "fast-check";
import {
  markdownToPlainText,
  parseInlineMarkdown,
  parseMarkdown,
  parseMarkdownIncremental,
  sanitizeHref,
  type MarkdownParseState,
  type MdBlock,
  type MdInline,
} from "./markdown";

const BASE = new URL("https://app.example/docs/page");

// Mảnh URL hay gây lỗi: scheme nguy hiểm có ký tự điều khiển / khoảng trắng chen giữa, protocol-relative, dấu "\",
// entity, khoảng trắng Unicode.
const URL_PIECES = [
  "javascript:", "JaVaScRiPt:", "java\tscript:", "java\nscript:", "\u0000javascript:", " javascript:", "vbscript:",
  "data:text/html,", "http://", "https://", "HTTPS://", "http:/", "mailto:", "//", "/\\", "\\/", "/", "\\", "./", "../",
  "#", "?", ":", "@", "%2F", "%0A", "&#106;", "&colon;", "\u00a0", "\u2028", "\ufeff", "\t", " ", "\n", "a", "x.y",
  "evil.com", "www.",
];
const urlLike = fc.oneof(fc.string(), fc.string({ unit: fc.constantFrom(...URL_PIECES), maxLength: 8 }));

// Mảnh Markdown: khối, nhấn mạnh, code, bảng, link / ảnh / chú thích, URL nguy hiểm, chữ có dấu và emoji.
const MD_PIECES = [
  "\n", "\n\n", " ", "    ", "\t", "#", "## ", ">", "> ", "-", "- ", "* ", "+ ", "1. ", "2) ", "- [ ] ", "- [x] ", "*",
  "**", "_", "__", "~~", "`", "```", "```ts\n", "~~~", "---", "***", "===", "|", " | ", "|---|", ":-:", "[", "]", "(",
  ")", "![", "](", "<", ">", "\\", "&amp;", "&#x6a;", "[^1]", "[1]", "http://a.b", "https://x.y/z", "www.a.b",
  "mailto:a@b", "javascript:alert(1)", "java\tscript:x", "//evil", "/\\evil", "./a", "#h", '"t"', "'t'", "a", "b c",
  "Tiếng Việt", "😀",
];
const markdownLike = fc.oneof(fc.string({ maxLength: 200 }), fc.string({ unit: fc.constantFrom(...MD_PIECES), maxLength: 40 }));

function inlineHrefs(nodes: MdInline[], out: string[]) {
  for (const n of nodes) {
    if (n.type === "link") out.push(n.href);
    if ("children" in n) inlineHrefs(n.children, out);
  }
  return out;
}

function hrefs(blocks: MdBlock[], out: string[] = []) {
  for (const b of blocks) {
    if (b.type === "paragraph" || b.type === "heading") inlineHrefs(b.children, out);
    else if (b.type === "list") b.items.forEach((item) => hrefs(item.children, out));
    else if (b.type === "blockquote") hrefs(b.children, out);
    else if (b.type === "table") [b.head, ...b.rows].forEach((row) => row.forEach((cell) => inlineHrefs(cell, out)));
  }
  return out;
}

/** Trình duyệt sẽ mở gì khi bấm link này trên một trang của app. */
function expectSafeHref(href: string, relative: boolean) {
  expect(href).not.toMatch(/[\u0000-\u001F\u007F\s]/);
  if (!relative) expect(href).toMatch(/^(https?:\/\/[^/]|mailto:)/i);
  let url: URL;
  try {
    url = new URL(href, BASE);
  } catch {
    return; // URL hỏng: trình duyệt không điều hướng được, vô hại.
  }
  expect(["http:", "https:", "mailto:"]).toContain(url.protocol);
  // Link tương đối không được rời khỏi site (//host, /\host…).
  if (!/^(https?:|mailto:)/i.test(href)) expect(url.origin).toBe(BASE.origin);
}

describe("sanitizeHref (property-based)", () => {
  it("chỉ trả về http / https / mailto, hoặc đường dẫn cùng site khi relative", () => {
    fc.assert(
      fc.property(urlLike, fc.boolean(), (raw, relative) => {
        const href = sanitizeHref(raw, { relative });
        if (href !== null) expectSafeHref(href, relative);
      }),
      { numRuns: 500 },
    );
  });

  it("làm sạch hai lần cho cùng kết quả", () => {
    fc.assert(
      fc.property(urlLike, fc.boolean(), (raw, relative) => {
        const href = sanitizeHref(raw, { relative });
        if (href !== null) expect(sanitizeHref(href, { relative })).toBe(href);
      }),
      { numRuns: 500 },
    );
  });
});

describe("parseMarkdownIncremental", () => {
  it("đoạn có ký hiệu chưa đóng được phân tích lại khi khối sau về (ca fast-check tìm ra)", () => {
    const full = ["Phím ` mở console", "", "Bước tiếp"].join("\n");
    let state: MarkdownParseState | null = null;
    for (const text of ["Phím `", "Phím ` mở console", full]) state = parseMarkdownIncremental(text, true, state);
    state = parseMarkdownIncremental(full, false, state);
    expect(markdownToPlainText(state.blocks)).toBe(["Phím ` mở console", "Bước tiếp"].join("\n"));
  });
});

describe("parseMarkdown (property-based)", () => {
  it("không ném lỗi, và mọi link trong AST đều đã qua sanitizeHref", () => {
    fc.assert(
      fc.property(markdownLike, fc.boolean(), fc.boolean(), (text, streaming, relativeLinks) => {
        const root = parseMarkdown(text, { streaming, relativeLinks });
        for (const href of hrefs(root.children)) {
          expect(sanitizeHref(href, { relative: relativeLinks })).toBe(href);
          expectSafeHref(href, relativeLinks);
        }
        expect(typeof markdownToPlainText(root)).toBe("string");
      }),
      { numRuns: 300 },
    );
  });

  it("parseInlineMarkdown: không ném lỗi, link đã qua sanitizeHref", () => {
    fc.assert(
      fc.property(markdownLike, fc.boolean(), (text, relativeLinks) => {
        for (const href of inlineHrefs(parseInlineMarkdown(text, { relativeLinks }), [])) expectSafeHref(href, relativeLinks);
      }),
      { numRuns: 300 },
    );
  });

  it("chịu được lồng sâu và chuỗi dài (không tràn stack)", () => {
    const deep = fc.string({ unit: fc.constantFrom(">", "> ", "[", "](", "*", "**", "_", "- ", "  ", "    ", "`", "1. ", "|"), minLength: 200, maxLength: 3000 });
    fc.assert(
      fc.property(deep, fc.boolean(), (text, streaming) => {
        parseMarkdown(text, { streaming });
      }),
      { numRuns: 50 },
    );
  });

  it("phân tích tăng dần khi chữ về từng đoạn cho đúng kết quả như phân tích lại từ đầu", () => {
    fc.assert(
      fc.property(fc.array(markdownLike, { minLength: 1, maxLength: 8 }), (chunks) => {
        let state: MarkdownParseState | null = null;
        let text = "";
        for (const chunk of chunks) {
          text += chunk;
          state = parseMarkdownIncremental(text, true, state);
          expect(state.blocks).toEqual(parseMarkdown(text, { streaming: true }).children);
        }
        state = parseMarkdownIncremental(text, false, state);
        expect(state.blocks).toEqual(parseMarkdown(text).children);
      }),
      { numRuns: 200 },
    );
  });
});
