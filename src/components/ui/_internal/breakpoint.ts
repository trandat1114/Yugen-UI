import { warnDeprecated } from "@/lib/deprecate";

/**
 * Mốc độ rộng dùng chung cho `breakpoint` của AppShell (container query), Sheet và NotificationCenter (media query).
 * Cùng tên với container query của Tailwind (`@lg` … `@5xl`). Chỉ dùng nội bộ — không export qua barrel.
 */
export type BreakpointToken = "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl";

/** Giá trị rem của từng mốc: lg 32 · xl 36 · 2xl 42 · 3xl 48 (768px) · 4xl 56 · 5xl 64. */
export const BREAKPOINT_REM: Record<BreakpointToken, number> = { lg: 32, xl: 36, "2xl": 42, "3xl": 48, "4xl": 56, "5xl": 64 };

/** Media query "rộng ít nhất bằng mốc". Số = px (cách cũ của Sheet / NotificationCenter, bỏ ở 1.0). */
export function minWidthQuery(breakpoint: BreakpointToken | number): string {
  return typeof breakpoint === "number" ? `(min-width: ${breakpoint}px)` : `(min-width: ${BREAKPOINT_REM[breakpoint]}rem)`;
}

/** Cảnh báo `breakpoint` dạng px (một lần cho mỗi component), gợi ý token gần nhất. */
export function warnPxBreakpoint(component: string, px: number): void {
  const tokens = Object.keys(BREAKPOINT_REM) as BreakpointToken[];
  const token = tokens.reduce((best, t) => (Math.abs(BREAKPOINT_REM[t] * 16 - px) < Math.abs(BREAKPOINT_REM[best] * 16 - px) ? t : best));
  warnDeprecated(
    `${component}.breakpoint={number}`,
    `use a token such as breakpoint="${token}" (${BREAKPOINT_REM[token]}rem = ${BREAKPOINT_REM[token] * 16}px)`,
    "1.0.0",
  );
}
