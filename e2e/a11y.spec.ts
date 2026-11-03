import { test, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";
import { A11Y_ALLOWLIST, routeMatches } from "./a11y-allowlist";
import { readDiscoveredRoutes } from "./routes";
import { openDocs, type Theme } from "./utils";

/**
 * axe (WCAG 2.0 / 2.1 A + AA) trên MỌI trang docs (route gom từ sidebar ở global-setup).
 * - Sáng: đủ rule, quét `main`. Tối và tương phản cao chỉ đổi màu nên chỉ chạy rule màu (rẻ hơn ~2 lần).
 * - Khung docs (header, sidebar, footer) giống nhau ở mọi trang: quét cả trang trên SHELL_ROUTES, một lần mỗi theme.
 * - RTL: axe không có rule nào phụ thuộc hướng chữ, nên kiểm tra bố cục thay vì quét lại.
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];
/** Rule axe cho kết quả khác nhau giữa các theme. */
const COLOR_RULES = ["color-contrast", "link-in-text-block"];

/** Trang không có trong sidebar (vào từ link trong trang, footer, bảng lệnh): quét thêm như route của sidebar. */
const OFF_SIDEBAR = ["/contributors"];

const ROUTES = [...readDiscoveredRoutes(), ...OFF_SIDEBAR];

/** Trang chủ (sidebar thu gọn) và một trang component (nhóm sidebar đang mở, mục đang chọn). */
const SHELL_ROUTES = ["/", "/components/button"];

/** Tập đại diện cho tương phản cao / RTL: trang tổng + ~3 khái niệm + component trải đủ các nhóm (kể cả Yugen Labs). */
const REPRESENTATIVE = [
  "/",
  "/blocks",
  "/theme-designer",
  "/news",
  "/community",
  "/contributors",
  "/concepts/theming",
  "/concepts/rtl",
  "/concepts/wait-ux",
  "/foundations/color",
  ...[
    "button",
    "menu",
    "tabs",
    "combobox",
    "datepicker",
    "table",
    "tree",
    "carousel",
    "toast",
    "resizable",
    "trace",
    "questionnaire",
    "messagescroller",
    "codeblock",
    "barchart",
    "sheet",
  ].map((slug) => `/components/${slug}`),
];

type Rules = "wcag" | "color";

const PASSES: { theme: Theme; rules: Rules; routes: string[] }[] = [
  { theme: "light", rules: "wcag", routes: ROUTES },
  { theme: "dark", rules: "color", routes: ROUTES },
  { theme: "high-contrast", rules: "color", routes: REPRESENTATIVE },
];

test("gom được route từ sidebar và tập đại diện đều tồn tại", () => {
  expect(ROUTES.length, "global-setup chưa ghi danh sách route (chạy qua `playwright test`)").toBeGreaterThan(20);
  const missing = [...REPRESENTATIVE, ...SHELL_ROUTES].filter((r) => !ROUTES.includes(r));
  expect(missing, `Route đại diện không có trong sidebar: ${missing.join(", ")}`).toEqual([]);
});

/** Bỏ các node khớp allowlist (so trong trang bằng element.closest). Trả về vi phạm còn lại. */
async function applyAllowlist(page: Page, violations: Result[], route: string, theme: Theme) {
  const remaining: Result[] = [];
  for (const violation of violations) {
    const entries = A11Y_ALLOWLIST.filter((e) => e.rule === violation.id && routeMatches(e, route) && (!e.theme || e.theme === theme));
    if (entries.length === 0) {
      remaining.push(violation);
      continue;
    }
    const targets = violation.nodes.map((n) => {
      const last = n.target[n.target.length - 1];
      return typeof last === "string" ? last : "";
    });
    const allowed = await page.evaluate(
      ({ targets, selectors }) =>
        targets.map((target) => {
          if (selectors.includes("")) return true;
          try {
            const el = target ? document.querySelector(target) : null;
            return !!el && selectors.some((s) => el.closest(s) !== null);
          } catch {
            return false;
          }
        }),
      { targets, selectors: entries.map((e) => e.selector ?? "") },
    );
    const nodes = violation.nodes.filter((_, i) => !allowed[i]);
    if (nodes.length > 0) remaining.push({ ...violation, nodes });
  }
  return remaining;
}

/** Mở trang, chạy axe (cả trang hoặc chỉ `main`), lọc allowlist. */
async function scan(page: Page, route: string, theme: Theme, rules: Rules, scope: "page" | "main"): Promise<Result[]> {
  await openDocs(page, route, { theme });
  let builder = new AxeBuilder({ page });
  builder = rules === "wcag" ? builder.withTags(WCAG_TAGS) : builder.withRules(COLOR_RULES);
  if (scope === "main") builder = builder.include("main");
  const results: AxeResults = await builder.analyze();
  return applyAllowlist(page, results.violations, route, theme);
}

function formatViolations(violations: Result[]) {
  return violations
    .map((v) => {
      const nodes = v.nodes
        .slice(0, 10)
        .map((n) => `      - ${n.target.join(" ")}\n        ${n.failureSummary?.split("\n").slice(1).join(" ").trim() ?? ""}`)
        .join("\n");
      const more = v.nodes.length > 10 ? `\n      … và ${v.nodes.length - 10} phần tử khác` : "";
      return `  • [${v.impact ?? "?"}] ${v.id}: ${v.help}\n    ${v.helpUrl}\n${nodes}${more}`;
    })
    .join("\n");
}

for (const { theme, rules, routes } of PASSES) {
  test.describe(`${theme} · ${rules === "wcag" ? "WCAG A/AA" : "màu"}`, () => {
    const cases = [
      ...SHELL_ROUTES.map((route) => ({ name: `khung docs · ${route}`, route, scope: "page" as const })),
      ...routes.filter((r) => !SHELL_ROUTES.includes(r)).map((route) => ({ name: route, route, scope: "main" as const })),
    ];
    for (const { name, route, scope } of cases) {
      test(name, async ({ page }, testInfo) => {
        const violations = await scan(page, route, theme, rules, scope);
        if (violations.length > 0) {
          await testInfo.attach("axe-violations.json", { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
        }
        const total = violations.reduce((n, v) => n + v.nodes.length, 0);
        expect(
          violations.length,
          `${route} (${theme}, ${scope}): ${violations.length} rule axe vi phạm trên ${total} phần tử\n${formatViolations(violations)}\n`,
        ).toBe(0);
      });
    }
  });
}

test.describe("rtl · bố cục", () => {
  for (const route of REPRESENTATIVE) {
    test(route, async ({ page }) => {
      await openDocs(page, route, { dir: "rtl" });
      const layout = await page.evaluate(() => {
        const html = document.documentElement;
        const nav = document.querySelector("aside")?.getBoundingClientRect();
        return { dir: html.dir, overflow: html.scrollWidth - html.clientWidth, navLeft: nav?.left ?? -1, width: html.clientWidth };
      });
      expect(layout.dir).toBe("rtl");
      expect(layout.overflow, "trang cuộn ngang ở RTL").toBeLessThanOrEqual(0);
      expect(layout.navLeft, "sidebar phải nằm bên phải ở RTL").toBeGreaterThan(layout.width / 2);
    });
  }
});
