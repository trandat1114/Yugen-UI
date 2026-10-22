import { describe, expect, it } from "vitest";
import { cn } from "./cn";

describe("cn — tailwind-merge đã dạy scale của Yugen", () => {
  it("cỡ chữ (type ramp) và màu chữ là hai nhóm khác nhau → giữ cả hai", () => {
    expect(cn("text-body1", "text-foreground-1")).toBe("text-body1 text-foreground-1");
    expect(cn("text-foreground-1", "text-caption1")).toBe("text-foreground-1 text-caption1");
    expect(cn("text-large-title", "text-brand-foreground-1")).toBe("text-large-title text-brand-foreground-1");
  });

  it("hai cỡ chữ → cái sau thắng; hai màu chữ → cái sau thắng", () => {
    expect(cn("text-body1", "text-subtitle1")).toBe("text-subtitle1");
    expect(cn("text-caption2", "text-display")).toBe("text-display");
    expect(cn("text-foreground-1", "text-foreground-3")).toBe("text-foreground-3");
  });

  it("spacing theo thang số", () => {
    expect(cn("p-3", "p-4")).toBe("p-4");
    expect(cn("px-2", "px-6")).toBe("px-6");
    expect(cn("gap-1.5", "gap-2.5")).toBe("gap-2.5");
    expect(cn("mt-1", "mt-8")).toBe("mt-8");
    // Trục khác nhau không đè nhau.
    expect(cn("px-3", "py-2")).toBe("px-3 py-2");
    // p-* đè px-* đứng trước.
    expect(cn("px-3", "p-4")).toBe("p-4");
  });

  it("bo góc", () => {
    expect(cn("rounded-medium", "rounded-large")).toBe("rounded-large");
    expect(cn("rounded-small", "rounded-circular")).toBe("rounded-circular");
    expect(cn("rounded-2xlarge", "rounded-4xlarge")).toBe("rounded-4xlarge");
  });

  it("elevation", () => {
    expect(cn("shadow-4", "shadow-16")).toBe("shadow-16");
    expect(cn("shadow-2", "shadow-64")).toBe("shadow-64");
  });

  it("thời lượng chuyển động", () => {
    expect(cn("duration-fast", "duration-normal")).toBe("duration-normal");
    expect(cn("duration-ultra-fast", "duration-slow")).toBe("duration-slow");
  });

  it("gradient là background-image, không đè màu nền", () => {
    expect(cn("bg-gradient-sakura", "bg-gradient-dusk")).toBe("bg-gradient-dusk");
    expect(cn("bg-background-1", "bg-gradient-sakura")).toBe("bg-background-1 bg-gradient-sakura");
  });

  it("className người dùng ở cuối thắng biến thể mặc định", () => {
    expect(cn("h-8 rounded-medium px-3 text-body1", "rounded-circular px-4")).toBe("h-8 text-body1 rounded-circular px-4");
  });

  it("nhận điều kiện kiểu clsx", () => {
    const disabled = false as boolean;
    expect(cn("p-3", disabled && "p-4", { "text-body1": true, "text-caption1": false }, ["shadow-4"], null, undefined)).toBe(
      "p-3 text-body1 shadow-4",
    );
  });
});
