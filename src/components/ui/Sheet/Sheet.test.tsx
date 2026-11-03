import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { watchDeprecations } from "@/test/deprecation";
import { Sheet, SheetTrigger, type SheetProps } from "./Sheet";

/** Media query mà Sheet đọc để chọn panel / bottom sheet. */
function queries(props: SheetProps) {
  const matchMedia = vi.spyOn(window, "matchMedia");
  const { rerender } = render(
    <Sheet {...props}>
      <SheetTrigger>Mở</SheetTrigger>
    </Sheet>,
  );
  rerender(
    <Sheet {...props}>
      <SheetTrigger>Mở</SheetTrigger>
    </Sheet>,
  );
  return matchMedia.mock.calls.map(([query]) => query);
}

describe("Sheet breakpoint", () => {
  it("token như AppShell; mặc định 3xl = 48rem", () => {
    expect(queries({})).toContain("(min-width: 48rem)");
    expect(queries({ breakpoint: "2xl" })).toContain("(min-width: 42rem)");
  });

  it("số px vẫn chạy và cảnh báo một lần", () => {
    const warnings = watchDeprecations();
    expect(queries({ breakpoint: 600 })).toContain("(min-width: 600px)");
    expect(warnings("Sheet.breakpoint={number}")).toBe(1);
  });
});
