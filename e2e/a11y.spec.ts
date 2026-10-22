import { test, expect, type Page } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";
import type { AxeResults, Result } from "axe-core";
import { A11Y_ALLOWLIST, routeMatches } from "./a11y-allowlist";
import { readDiscoveredRoutes } from "./routes";
import { openDocs, type Dir, type Theme } from "./utils";

/**
 * axe (WCAG 2.0 / 2.1 A + AA) trên MỌI trang docs (route gom từ sidebar ở global-setup) × sáng / tối (LTR),
 * cộng thêm tương phản cao và RTL trên một tập đại diện. Quét cả trang (khung docs + demo).
 */
const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const ROUTES = readDiscoveredRoutes();

/** Tập đại diện cho high-contrast / RTL: trang tổng + ~3 khái niệm + component trải đủ các nhóm (kể cả Yugen Labs). */
const REPRESENTATIVE = [
  "#/",
  "#/blocks",
  "#/theme-designer",
  "#/news",
  "#/community",
  "#/concepts/theming",
  "#/concepts/rtl",
  "#/concepts/wait-ux",
  "#/foundations/color",
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
  ].map((slug) => `#/components/${slug}`),
];

const VARIANTS: { theme: Theme; dir: Dir; routes: string[] }[] = [
  { theme: "light", dir: "ltr", routes: ROUTES },
  { theme: "dark", dir: "ltr", routes: ROUTES },
  { theme: "high-contrast", dir: "ltr", routes: REPRESENTATIVE },
  { theme: "light", dir: "rtl", routes: REPRESENTATIVE },
];

test("gom được route từ sidebar và tập đại diện đều tồn tại", () => {
  expect(ROUTES.length, "global-setup chưa ghi danh sách route (chạy qua `playwright test`)").toBeGreaterThan(20);
  const missing = REPRESENTATIVE.filter((r) => !ROUTES.includes(r));
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

/** Mở trang, chạy axe, lọc allowlist. */
async function scan(page: Page, route: string, theme: Theme, dir: Dir): Promise<Result[]> {
  await openDocs(page, route, { theme, dir });
  const results: AxeResults = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
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

for (const { theme, dir, routes } of VARIANTS) {
  test.describe(`${theme} · ${dir}`, () => {
    for (const route of routes) {
      test(route, async ({ page }, testInfo) => {
        const violations = await scan(page, route, theme, dir);
        if (violations.length > 0) {
          await testInfo.attach("axe-violations.json", { body: JSON.stringify(violations, null, 2), contentType: "application/json" });
        }
        const total = violations.reduce((n, v) => n + v.nodes.length, 0);
        expect(
          violations.length,
          `${route} (${theme}, ${dir}): ${violations.length} rule axe vi phạm trên ${total} phần tử\n${formatViolations(violations)}\n`,
        ).toBe(0);
      });
    }
  });
}
