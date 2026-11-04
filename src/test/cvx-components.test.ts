/**
 * Every `cvx` of the library gives the same classes as before (#355): for each combination of its variant values (and
 * a few `className` overrides), the cached result equals `cn(cva(base, config)(props))`, which is what components and
 * apps built with `cn(xVariants(...), className)` got from plain cva.
 */
import { describe, expect, it, vi } from "vitest";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
import * as ui from "@/components/ui";

type Variants = (props?: Record<string, unknown>) => string;
type Config = { variants?: Record<string, Record<string, unknown>> };

const created = vi.hoisted(() => [] as { base: unknown; config: Config | undefined; variants: Variants }[]);
vi.mock("@/lib/cvx", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/cvx")>();
  const cvx = ((base: unknown, config: Config | undefined) => {
    const variants = (actual.cvx as unknown as (b: unknown, c: unknown) => Variants)(base, config);
    created.push({ base, config, variants });
    return variants;
  }) as unknown as typeof actual.cvx;
  return { ...actual, cvx };
});

/** Values a prop can take: each option (booleans and numbers in their typed form too), unset, and null (variant off). */
function valuesOf(options: Record<string, unknown>): unknown[] {
  const values: unknown[] = [undefined, null];
  for (const option of Object.keys(options)) {
    if (option === "true" || option === "false") values.push(option === "true");
    else if (/^\d+$/.test(option)) values.push(Number(option), option);
    else values.push(option);
  }
  return values;
}

function combinations(schema: Record<string, Record<string, unknown>>): Record<string, unknown>[] {
  let out: Record<string, unknown>[] = [{}];
  for (const [key, options] of Object.entries(schema)) {
    out = out.flatMap((props) => valuesOf(options).map((value) => ({ ...props, [key]: value })));
  }
  return out;
}

const CLASS_NAMES: unknown[] = [
  undefined,
  "w-full rounded-none px-8 text-body2 bg-danger-background-3 border-transparent min-w-0 glass",
  ["h-12", false, "hover:bg-subtle-hover data-[state=on]:bg-brand-background"],
];

describe("cvx in components", () => {
  it("covers every variant function of the library", () => {
    // Badge, Avatar, Card, ButtonGroup, Button, Label, Input, Image, Link, MessageBar, Select, Tag, Textarea,
    // SwatchPicker, ToggleButton (checked layer).
    expect(created.length).toBeGreaterThanOrEqual(15);
    for (const exported of [ui.buttonVariants, ui.buttonGroupVariants, ui.linkVariants, ui.imageVariants]) {
      expect(created.some((c) => c.variants === (exported as unknown))).toBe(true);
    }
  });

  it("Button: every combination equals cn(cva(...))", () => {
    const button = created.find((c) => c.variants === (ui.buttonVariants as unknown))!;
    const plain = cva(button.base as string, button.config as never) as unknown as Variants;
    const all = combinations(button.config!.variants!);
    expect(all.length).toBe(10 * 5 * 5 * 4);
    for (const props of all) {
      for (const className of CLASS_NAMES) {
        const withClass = { ...props, className };
        expect(ui.buttonVariants(withClass as never)).toBe(cn(plain(withClass)));
      }
    }
  });

  it("every other variant function: every combination equals cn(cva(...))", () => {
    for (const { base, config, variants } of created) {
      const plain = cva(base as string, config as never) as unknown as Variants;
      for (const props of combinations(config?.variants ?? {})) {
        for (const className of CLASS_NAMES) {
          const withClass = { ...props, className };
          const expected = cn(plain(withClass));
          expect(variants(withClass), `${String(base).slice(0, 40)} ${JSON.stringify(withClass)}`).toBe(expected);
          // Cached.
          expect(variants(withClass)).toBe(expected);
        }
      }
    }
  });
});
