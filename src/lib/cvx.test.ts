import { describe, expect, it, vi } from "vitest";
import { cva } from "class-variance-authority";
import { cn } from "./cn";
import { cvx } from "./cvx";

// Count the merges cvx makes.
vi.mock("./cn", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./cn")>();
  return { cn: vi.fn(actual.cn) };
});

const base = "inline-flex rounded-medium px-3 text-body1";
const config = {
  variants: {
    size: { small: "px-2 text-caption1", large: "px-4 text-body2" },
    shape: { rounded: "", circular: "rounded-circular" },
    iconOnly: { true: "min-w-0 px-0", false: "" },
    level: { 1: "shadow-2", 2: "shadow-4" },
  },
  compoundVariants: [
    { iconOnly: true, size: "small" as const, class: "w-6" },
    { shape: ["circular" as const], size: "large" as const, className: "size-10" },
  ],
  defaultVariants: { size: "small" as const, shape: "rounded" as const, iconOnly: false },
};
const plain = (props?: Parameters<ReturnType<typeof cva<typeof config.variants>>>[0]) => cn(cva(base, config)(props));

describe("cvx — cva with the merged string cached per variant combination (#355)", () => {
  it("returns what cn(cva(...)) returns, with class / className merged on top", () => {
    const variants = cvx(base, config);
    const cases = [
      undefined,
      {},
      { size: "large" as const },
      { size: "small" as const, iconOnly: true },
      { size: "large" as const, shape: "circular" as const },
      { size: null },
      { level: 2 as const },
      { size: "large" as const, className: "px-6 rounded-none" },
      { iconOnly: true, class: ["w-full", false, undefined] },
      { className: "" },
    ];
    for (const props of cases) {
      expect(variants(props)).toBe(plain(props));
      // Second call: from the cache.
      expect(variants(props)).toBe(plain(props));
    }
  });

  it("merges once per combination, not per call", () => {
    const variants = cvx(base, config);
    const merges = () => vi.mocked(cn).mock.calls.length;
    variants({ size: "large" });
    const first = merges();
    variants({ size: "large" });
    variants({ size: "large", className: undefined });
    variants({ size: "large", className: [false, undefined] });
    expect(merges()).toBe(first);
    variants({ size: "large", className: "w-full" });
    expect(merges()).toBe(first + 1);
  });

  it("keys on the exact values: null and booleans are not undefined or their string forms", () => {
    const variants = cvx(base, config);
    // A compound variant compares with ===: "true" (cached first) must not answer for true.
    expect(variants({ iconOnly: "true" as unknown as boolean, size: "small" })).not.toContain("w-6");
    expect(variants({ iconOnly: true, size: "small" })).toContain("w-6");
    // null turns the variant off; undefined takes the default.
    expect(variants({ size: null })).not.toContain("text-caption1");
    expect(variants({ size: undefined })).toContain("text-caption1");
    expect(variants({ level: 1 })).toContain("shadow-2");
    expect(variants({ level: "2" as unknown as 2 })).toContain("shadow-4");
  });

  it("does not cache objects", () => {
    const variants = cvx(base, config);
    const merges = () => vi.mocked(cn).mock.calls.length;
    const odd = () => ({ size: ["large"] as unknown as "large" });
    expect(variants(odd())).toBe(plain(odd()));
    const before = merges();
    variants(odd());
    expect(merges()).toBe(before + 1);
  });

  it("stays correct past the cache limit", () => {
    const variants = cvx(base, config);
    for (let i = 0; i < 1200; i++) {
      const props = { size: `size-${i}` as unknown as "large", shape: i % 2 ? ("circular" as const) : undefined };
      expect(variants(props)).toBe(plain(props));
    }
    expect(variants({ size: "large" })).toBe(plain({ size: "large" }));
  });

  it("works without variants", () => {
    const variants = cvx("p-2 p-3");
    expect(variants()).toBe("p-3");
    expect(variants({ className: "p-4" })).toBe("p-4");
  });
});
