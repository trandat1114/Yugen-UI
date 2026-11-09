import { cva } from "class-variance-authority";
import { clsx, type ClassValue } from "clsx";
import { cn } from "./cn";

/**
 * Combinations kept per variant function. The props of a component have far fewer (Button: under 200); more only
 * comes from values outside the variant names, so past this the cache starts over instead of growing.
 */
const MAX_ENTRIES = 500;

/** Where a combination keeps its merged string: one Map level per variant prop, keyed by the value itself. */
const MERGED = Symbol("merged");

type Node = Map<unknown, unknown>;

/**
 * `cva` that merges once per combination of variant values (#355). `cn(buttonVariants({...}), className)` used to
 * build and merge the whole class string (~500 characters for Button) on every render, although it depends only on
 * a few variant values. Here the merged string is cached per combination; `class` / `className` are merged on top
 * with `cn`, and without them the cached string is returned as is.
 *
 * Same signature as `cva`. The result equals `cn(cva(base, config)(props))`, the merged form of what `cva` returns.
 */
export const cvx: typeof cva = (base, config) => {
  const variants = cva(base, config);
  const { variants: schema, compoundVariants = [] } = (config ?? {}) as { variants?: object; compoundVariants?: object[] };
  // Every prop that cva reads: the variants, plus any key a compound variant matches on.
  const keys = Object.keys(Object.assign({}, schema, ...compoundVariants)).filter((key) => key !== "class" && key !== "className");
  let cache: Node = new Map();
  let entries = 0;

  // Map keys compare like ===, so undefined, null, true, "true", 1 and "1" stay apart: they can give different classes
  // in cva (null turns a variant off, compound variants compare with ===).
  function lookup(p: Record<string, unknown>) {
    let node: Node | undefined = cache;
    for (const key of keys) {
      node = node.get(p[key]) as Node | undefined;
      if (!node) return undefined;
    }
    return node.get(MERGED) as string | undefined;
  }

  function store(p: Record<string, unknown>, classes: string) {
    // An object or array (by mistake) would be a new key on every render: not cached.
    for (const key of keys) {
      const value = p[key];
      if (value !== null && (typeof value === "object" || typeof value === "function")) return;
    }
    if (++entries > MAX_ENTRIES) {
      cache = new Map();
      entries = 1;
    }
    let node = cache;
    for (const key of keys) {
      let next = node.get(p[key]) as Node | undefined;
      if (!next) node.set(p[key], (next = new Map()));
      node = next;
    }
    node.set(MERGED, classes);
  }

  return (props) => {
    const p = (props ?? {}) as Record<string, unknown>;
    let classes = lookup(p);
    if (classes === undefined) {
      const { class: _class, className: _className, ...rest } = p;
      classes = cn(variants(rest as typeof props));
      store(p, classes);
    }
    const extra = clsx(p.class as ClassValue, p.className as ClassValue);
    return extra ? cn(classes, extra) : classes;
  };
};
