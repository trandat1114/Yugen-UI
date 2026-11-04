// @vitest-environment node
/**
 * Sàn CSS (#353): dist/tokens.css là CSS thường (không còn khối @theme của charts.css), và keyframes của thư viện nằm
 * trong @theme nên Tailwind chỉ xuất keyframe nào có utility animate-* (hoặc khai báo animation) dùng nó.
 * Phần dist (theme.css = @import theme-core.css + @source, đường dẫn quét) do scripts/check-package.mjs kiểm sau build.
 */
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { compile } from "@tailwindcss/node";
// @ts-expect-error -- script .mjs không có khai báo kiểu
import { stripTheme, tailwindAtRules, tokensCss } from "../../scripts/css-tokens.mjs";

const root = path.resolve(import.meta.dirname, "../..");
const src = path.join(root, "src");
const read = (file: string) => fs.readFileSync(path.join(src, file), "utf8").replace(/\r\n/g, "\n");
const indexCss = read("index.css");
const chartsCss = read("styles/charts.css");

/** Tên keyframe → tên các token --animate-* dùng nó, đọc từ index.css và charts.css. */
function animateTokens() {
  const tokens = new Map<string, string[]>();
  for (const [, token, keyframe] of `${indexCss}\n${chartsCss}`.matchAll(/--animate-([\w-]+):\s*([\w-]+)/g)) {
    tokens.set(keyframe, [...(tokens.get(keyframe) ?? []), token]);
  }
  return tokens;
}
const keyframeNames = [...`${indexCss}\n${chartsCss}`.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]);

describe("dist/tokens.css (#353)", () => {
  const tokens: string = tokensCss([read("styles/tokens.css"), chartsCss]);

  it("không còn at-rule chỉ Tailwind hiểu, không còn keyframes", () => {
    expect(tailwindAtRules(tokens)).toEqual([]);
    expect(tokens).not.toMatch(/@keyframes|--animate-/);
  });

  it("giữ nguyên token của cả hai file", () => {
    for (const name of ["--colorBrandBackground:", "--colorChartCategorical1:", "--chartDimOpacity:"]) expect(tokens).toContain(name);
    expect(tokens).toContain('[data-theme="high-contrast"] {\n  --colorChartCategorical1: #ffffff;');
    // Chỉ khối @theme bị bỏ: phần còn lại của charts.css giữ nguyên từng ký tự.
    expect(tokens).toContain(chartsCss.slice(chartsCss.indexOf("/* ===================== LIGHT")));
  });

  it("stripTheme bỏ đúng khối @theme ở cấp trên cùng, bỏ qua ngoặc trong chú thích và chuỗi", () => {
    const css = [
      '/* @theme { không phải khối } */',
      "@theme inline {",
      "  --a: 1; /* } */",
      "  @keyframes x { from { opacity: 0 } }",
      "}",
      "",
      ':root { --b: "}"; }',
      "@theme static { --c: 2; }",
    ].join("\n");
    expect(stripTheme(css)).toBe('/* @theme { không phải khối } */\n\n:root { --b: "}"; }');
    expect(() => tokensCss([".a { @apply flex; }"])).toThrow(/@apply/);
  });
});

describe("keyframes trong @theme (#353)", () => {
  it("index.css và charts.css không còn keyframe nào ngoài @theme", () => {
    expect(stripTheme(indexCss)).not.toMatch(/@keyframes/);
    expect(stripTheme(chartsCss)).not.toMatch(/@keyframes/);
  });

  it("mỗi keyframe có một token --animate-* (utility animate-<tên>), mỗi token trỏ tới một keyframe có thật", () => {
    const tokens = animateTokens();
    expect(keyframeNames.filter((name) => !tokens.has(name))).toEqual([]);
    expect([...tokens.keys()].filter((name) => !keyframeNames.includes(name))).toEqual([]);
    // Bản cũ trên trang Motion (animate-shimmer / animate-indeterminate) vẫn có.
    expect(tokens.get("shimmer")).toEqual(["shimmer"]);
    expect(tokens.get("indeterminate")).toEqual(["indeterminate"]);
  });

  it("component, demo và template dùng token, không gọi keyframe bằng tên", () => {
    // Tên keyframe trong giá trị tuỳ ý (animate-[…], [animation:…]), trong style={{ animation }} hay trong file CSS
    // không qua Tailwind: Tailwind không thấy (style, CSS thường) hoặc chỉ bản mới thấy (giá trị tuỳ ý), nên keyframe
    // có thể không được xuất. Tách từng từ của giá trị: "_" ngăn các phần trong giá trị tuỳ ý.
    const PATTERNS: Record<string, RegExp[]> = {
      ts: [/animate-\[([^\]\s]+)\]/g, /\[animation(?:-name)?:([^\]\s]+)\]/g, /animation(?:Name)?\s*:\s*["'`]([^"'`]+)["'`]/g],
      css: [/(?<![\w-])animation(?:-name)?\s*:\s*([^;}]+)/g],
    };
    const offenders: string[] = [];
    const walk = (dir: string) => {
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        const kind = /\.tsx?$/.test(entry.name) && !/\.test\./.test(entry.name) ? "ts" : entry.name.endsWith(".css") ? "css" : null;
        if (entry.isDirectory()) {
          if (entry.name !== "node_modules") walk(p);
        } else if (kind) {
          const text = fs.readFileSync(p, "utf8");
          for (const re of PATTERNS[kind]) {
            for (const [all, value] of text.matchAll(re)) {
              if (value.split(/[\s_,]+/).some((word) => keyframeNames.includes(word))) offenders.push(`${path.relative(root, p)}: ${all}`);
            }
          }
        }
      }
    };
    for (const dir of ["components/ui", "docs"]) walk(path.join(src, dir));
    expect(offenders).toEqual([]);
  });

  it("Tailwind chỉ xuất keyframe được dùng", async () => {
    const compiler = await compile(indexCss, { base: src, onDependency: () => {} });
    const emitted = (css: string) => [...css.matchAll(/@keyframes ([\w-]+)/g)].map((m) => m[1]).sort();
    expect(emitted(compiler.build([]))).toEqual([]);
    // animate-surface-out dùng keyframe fade-out; token của biểu đồ không inline (var(--animate-chart-grow)).
    expect(emitted(compiler.build(["animate-wave-flow", "animate-surface-out", "motion-safe:animate-chart-grow"]))).toEqual([
      "chart-grow",
      "fade-out",
      "wave-flow",
    ]);
  });
});
