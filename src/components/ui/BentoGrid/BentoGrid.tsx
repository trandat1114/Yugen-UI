import * as React from "react";
import { cn } from "@/lib/cn";
import { useComponentDefaults } from "../YugenProvider/context";

export type BentoSpan = 1 | 2 | 3 | 4 | 5 | 6;
export type BentoBreakpoint = "base" | "sm" | "md" | "lg" | "xl";
export type BentoResponsive = BentoSpan | Partial<Record<BentoBreakpoint, BentoSpan>>;

const GRID_COLUMNS: Record<BentoBreakpoint, Record<BentoSpan, string>> = {
  base: {
    1: "grid-cols-1",
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
    5: "grid-cols-5",
    6: "grid-cols-6",
  },
  sm: {
    1: "sm:grid-cols-1",
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-4",
    5: "sm:grid-cols-5",
    6: "sm:grid-cols-6",
  },
  md: {
    1: "md:grid-cols-1",
    2: "md:grid-cols-2",
    3: "md:grid-cols-3",
    4: "md:grid-cols-4",
    5: "md:grid-cols-5",
    6: "md:grid-cols-6",
  },
  lg: {
    1: "lg:grid-cols-1",
    2: "lg:grid-cols-2",
    3: "lg:grid-cols-3",
    4: "lg:grid-cols-4",
    5: "lg:grid-cols-5",
    6: "lg:grid-cols-6",
  },
  xl: {
    1: "xl:grid-cols-1",
    2: "xl:grid-cols-2",
    3: "xl:grid-cols-3",
    4: "xl:grid-cols-4",
    5: "xl:grid-cols-5",
    6: "xl:grid-cols-6",
  },
};

const COL_SPANS: Record<BentoBreakpoint, Record<BentoSpan, string>> = {
  base: {
    1: "col-span-1",
    2: "col-span-2",
    3: "col-span-3",
    4: "col-span-4",
    5: "col-span-5",
    6: "col-span-6",
  },
  sm: {
    1: "sm:col-span-1",
    2: "sm:col-span-2",
    3: "sm:col-span-3",
    4: "sm:col-span-4",
    5: "sm:col-span-5",
    6: "sm:col-span-6",
  },
  md: {
    1: "md:col-span-1",
    2: "md:col-span-2",
    3: "md:col-span-3",
    4: "md:col-span-4",
    5: "md:col-span-5",
    6: "md:col-span-6",
  },
  lg: {
    1: "lg:col-span-1",
    2: "lg:col-span-2",
    3: "lg:col-span-3",
    4: "lg:col-span-4",
    5: "lg:col-span-5",
    6: "lg:col-span-6",
  },
  xl: {
    1: "xl:col-span-1",
    2: "xl:col-span-2",
    3: "xl:col-span-3",
    4: "xl:col-span-4",
    5: "xl:col-span-5",
    6: "xl:col-span-6",
  },
};

const ROW_SPANS: Record<BentoBreakpoint, Record<BentoSpan, string>> = {
  base: {
    1: "row-span-1",
    2: "row-span-2",
    3: "row-span-3",
    4: "row-span-4",
    5: "row-span-5",
    6: "row-span-6",
  },
  sm: {
    1: "sm:row-span-1",
    2: "sm:row-span-2",
    3: "sm:row-span-3",
    4: "sm:row-span-4",
    5: "sm:row-span-5",
    6: "sm:row-span-6",
  },
  md: {
    1: "md:row-span-1",
    2: "md:row-span-2",
    3: "md:row-span-3",
    4: "md:row-span-4",
    5: "md:row-span-5",
    6: "md:row-span-6",
  },
  lg: {
    1: "lg:row-span-1",
    2: "lg:row-span-2",
    3: "lg:row-span-3",
    4: "lg:row-span-4",
    5: "lg:row-span-5",
    6: "lg:row-span-6",
  },
  xl: {
    1: "xl:row-span-1",
    2: "xl:row-span-2",
    3: "xl:row-span-3",
    4: "xl:row-span-4",
    5: "xl:row-span-5",
    6: "xl:row-span-6",
  },
};

const GAP_CLASSES = {
  small: "gap-2",
  medium: "gap-4",
  large: "gap-6",
} as const;

function responsiveClasses(value: BentoResponsive, classes: Record<BentoBreakpoint, Record<BentoSpan, string>>) {
  const entries = typeof value === "number" ? { base: value } : value;
  return Object.entries(entries).map(([breakpoint, span]) => classes[breakpoint as BentoBreakpoint][span as BentoSpan]);
}

const DEFAULT_COLUMNS = { base: 1, sm: 2, lg: 4 } as const;

export interface BentoGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Số cột theo breakpoint; không đo layout bằng JavaScript. */
  columns?: BentoResponsive;
  gap?: keyof typeof GAP_CLASSES;
}

export function BentoGrid(inProps: BentoGridProps & { ref?: React.Ref<HTMLDivElement> }) {
  const { className, columns = DEFAULT_COLUMNS, gap = "medium", ref, ...props } = useComponentDefaults("BentoGrid", inProps);
  return (
    <div
      ref={ref}
      data-bento-grid
      data-bento-columns={typeof columns === "number" ? columns : undefined}
      className={cn("grid min-w-0 auto-rows-[minmax(8rem,auto)] items-stretch", GAP_CLASSES[gap], responsiveClasses(columns, GRID_COLUMNS), className)}
      {...props}
    />
  );
}

export interface BentoGridItemProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  colSpan?: BentoResponsive;
  rowSpan?: BentoResponsive;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Nội dung đầu ô, thường là media hoặc một header trực quan. */
  header?: React.ReactNode;
  media?: React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  /** Link card mode. Do not combine with action containing another interactive control. */
  href?: string;
  target?: React.HTMLAttributeAnchorTarget;
  rel?: string;
  /** Heading element for the title slot; use `div` when the surrounding page owns the heading. */
  titleAs?: "h2" | "h3" | "h4" | "h5" | "div";
}

export function BentoGridItem(inProps: BentoGridItemProps & { ref?: React.Ref<HTMLElement> }) {
  const {
    className,
    colSpan = 1,
    rowSpan = 1,
    title,
    description,
    header,
    media,
    icon,
    action,
    href,
    target,
    rel,
    titleAs: Title = "h3",
    ref,
    children,
    ...props
  } = inProps;
  const itemClassName = cn(
    "group relative flex min-w-0 flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1 p-5 text-foreground-1",
    "[&_*]:min-w-0 [&_img]:max-w-full",
    href && "cursor-pointer transition-[background-color,border-color,box-shadow] duration-faster hover:border-stroke-1-hover hover:bg-background-1-hover hover:shadow-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-stroke",
    responsiveClasses(colSpan, COL_SPANS),
    responsiveClasses(rowSpan, ROW_SPANS),
    className,
  );
  const content = (
    <>
      {header && <div className="-mx-5 -mt-5 mb-5 overflow-hidden [&_img]:block [&_img]:h-auto [&_img]:w-full">{header}</div>}
      {(icon || title || description) && (
        <div className="flex items-start gap-3">
          {icon && <span aria-hidden className="flex size-9 shrink-0 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2 [&_svg]:size-5">{icon}</span>}
          {(title || description) && (
            <div className="min-w-0">
              {title && <Title className="break-words font-display text-title3 font-semibold">{title}</Title>}
              {description && <p className="mt-1 break-words text-body2 text-foreground-2">{description}</p>}
            </div>
          )}
        </div>
      )}
      {children && <div className="mt-4 break-words text-body2 text-foreground-2">{children}</div>}
      {action && <div className="mt-5 flex flex-wrap items-center gap-2">{action}</div>}
      {media && <div className="mt-auto -mx-5 -mb-5 overflow-hidden pt-5 [&_img]:block [&_img]:h-auto [&_img]:w-full">{media}</div>}
    </>
  );
  if (href) {
    return (
      <a data-bento-item ref={ref as React.Ref<HTMLAnchorElement>} href={href} target={target} rel={rel} className={itemClassName} {...props}>
        {content}
      </a>
    );
  }
  return (
    <article data-bento-item ref={ref as React.Ref<HTMLElement>} className={itemClassName} {...props}>
      {content}
    </article>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    BentoGrid: BentoGridProps;
  }
}
