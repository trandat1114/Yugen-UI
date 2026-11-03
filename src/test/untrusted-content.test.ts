import { describe, expect, it } from "vitest";
import { MAX_BLOCK_DEPTH, parseMarkdown, sanitizeHref } from "@/components/ui/AIKit/markdown";
import { tokenizeCode, type CodeLanguage } from "@/components/ui/CodeBlock/CodeBlock";

/**
 * Nội dung không tin cậy (#165): Markdown từ người dùng / mô hình và code được tô màu không được làm treo trang (thời gian
 * bậc hai, regex quay lui) hay ném lỗi (tràn stack). Ngân sách rộng để CI chậm vẫn qua; trước bản sửa, các input này mất
 * 10–84 s hoặc tràn stack.
 */
const N = 60_000;
const BUDGET_MS = 1500;

/** PRNG có seed: lỗi fuzz lặp lại được. */
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 2 ** 32;
  };
}

function timed<T>(fn: () => T): { ms: number; value: T } {
  const t = performance.now();
  const value = fn();
  return { ms: performance.now() - t, value };
}

const MARKDOWN_CASES: [string, string][] = [
  ["nested quotes", "> ".repeat(N / 2) + "x"],
  ["nested list", Array.from({ length: 200 }, (_, i) => "  ".repeat(i) + "- a").join("\n")],
  ["emphasis without closers", "**a ".repeat(N / 4)],
  ["mixed emphasis", "_a*".repeat(N / 3)],
  ["open brackets", "[".repeat(N / 2) + "x" + "]".repeat(N / 2)],
  ["link destination parens", "[a](" + "(".repeat(N)],
  ["backticks", "`".repeat(N)],
  ["table rows", "|a|b|\n|-|-|\n" + "|x|y|\n".repeat(N / 6)],
];

describe("Markdown từ nguồn không tin cậy", () => {
  it.each(MARKDOWN_CASES)("%s: phân tích xong trong ngân sách, không ném lỗi", (_, input) => {
    const { ms } = timed(() => parseMarkdown(input));
    expect(ms).toBeLessThan(BUDGET_MS);
  });

  it("blockquote lồng sâu dừng ở MAX_BLOCK_DEPTH, phần còn lại thành chữ", () => {
    const root = parseMarkdown("> ".repeat(500) + "x");
    let depth = 0;
    let node = root.children[0];
    while (node?.type === "blockquote") {
      depth++;
      node = node.children[0];
    }
    expect(depth).toBe(MAX_BLOCK_DEPTH);
  });

  it("fuzz: input ngẫu nhiên không ném lỗi", () => {
    const random = rng(165);
    const alphabet = "*_~`[]()<>#>-|!\\:/ \n\tab1.\"'";
    const end = performance.now() + 1500;
    let runs = 0;
    while (performance.now() < end) {
      const length = Math.floor(random() * 4000);
      let text = "";
      for (let i = 0; i < length; i++) text += alphabet[Math.floor(random() * alphabet.length)];
      expect(() => parseMarkdown(text, { streaming: random() < 0.5 })).not.toThrow();
      runs++;
    }
    expect(runs).toBeGreaterThan(10);
  });
});

describe("sanitizeHref", () => {
  it.each([
    "javascript:alert(1)",
    "JaVaScRiPt:alert(1)",
    " javascript:alert(1)",
    "java\tscript:alert(1)",
    "java\nscript:alert(1)",
    "data:text/html,<script>alert(1)</script>",
    "vbscript:msgbox(1)",
    "//evil.example/path",
    "\\\\evil.example",
  ])("loại %j", (url) => {
    expect(sanitizeHref(url)).toBeNull();
  });

  it("giữ http(s) và mailto; link tương đối chỉ khi cho phép", () => {
    expect(sanitizeHref("https://example.com/a?b=1")).toBe("https://example.com/a?b=1");
    expect(sanitizeHref("mailto:hi@example.com")).toBe("mailto:hi@example.com");
    expect(sanitizeHref("/docs")).toBeNull();
    expect(sanitizeHref("/docs", { relative: true })).toBe("/docs");
  });
});

const CODE_CASES: [string, string][] = [
  ["template nesting", "`${".repeat(N / 3)],
  ["comment openers", "/*".repeat(N / 2)],
  ["angles", "<a ".repeat(N / 3)],
  ["backslashes in a string", '"' + "\\".repeat(N)],
];
const LANGUAGES: CodeLanguage[] = ["tsx", "css", "html", "bash", "json", "md"];

describe("Tô màu code không tin cậy", () => {
  for (const language of LANGUAGES) {
    it.each(CODE_CASES)(`${language}: %s trong ngân sách`, (_, code) => {
      const { ms, value } = timed(() => tokenizeCode(code, language));
      expect(ms).toBeLessThan(BUDGET_MS);
      expect(value.map((t) => t.text).join("")).toBe(code);
    });
  }
});
