import type { YugenDensity } from "yugen-ui";

/**
 * Width and spacing of a page's content area (#411). Pages without `layout` keep the SaaS default: a centered column up to
 * 72rem (max-w-6xl) with 16px padding (24px from a 48rem wide content area). Data pages such as wide tables and reports
 * opt in to `{ width: "fluid", density: "compact" }` in `PAGES` (pages.tsx).
 */
export interface PageLayout {
  /** default: centered column, at most 72rem wide · fluid: the whole content area at any screen width. */
  width?: "default" | "fluid";
  /**
   * `YugenProvider density` for the page: compact gives controls size small and scales spacing by 0.9375, comfortable
   * scales it by 1.125. The page padding and the gap between sections follow `SPACING` below.
   */
  density?: YugenDensity;
}

/** Layout of pages that don't set one. `{ width: "fluid", density: "compact" }` here makes every page a data page. */
export const DEFAULT_LAYOUT: Required<PageLayout> = { width: "default", density: "default" };

/** Page padding (horizontal / vertical) and the gap between sections, per density. Change them here, not in global CSS. */
const SPACING: Record<YugenDensity, string> = {
  default: "gap-4 p-4 @3xl:p-6",
  compact: "gap-3 px-3 py-3 @3xl:px-5 @3xl:py-4",
  comfortable: "gap-6 p-5 @3xl:p-8",
};

const WIDTH: Record<NonNullable<PageLayout["width"]>, string> = {
  default: "mx-auto max-w-6xl",
  // At least the height of the content area: a data page can give its table the remaining height (flex-1).
  fluid: "min-h-full",
};

export function resolveLayout(layout?: PageLayout): Required<PageLayout> {
  return { ...DEFAULT_LAYOUT, ...layout };
}

/** Classes of the page wrapper in AppShell.tsx. */
export function pageClassName(layout: Required<PageLayout>): string {
  return `flex w-full flex-col ${WIDTH[layout.width]} ${SPACING[layout.density]}`;
}
