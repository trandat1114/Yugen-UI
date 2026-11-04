import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { cvx } from "@/lib/cvx";

/** Fluent 2 Image — https://fluent2.microsoft.design/components/web/react/core/image/usage */
const imageVariants = cvx("box-border border-stroke-1", {
  variants: {
    fit: {
      // object-position không có giá trị logic → neo về góc đầu dòng theo hướng chữ.
      none: "size-full object-none object-top-left rtl:object-top-right",
      center: "size-full object-none object-center",
      contain: "size-full object-contain object-center",
      cover: "size-full object-cover object-center",
      default: "",
    },
    shape: {
      square: "rounded-none",
      rounded: "rounded-medium",
      circular: "rounded-circular",
    },
    bordered: { true: "border", false: "" },
    shadow: { true: "shadow-4", false: "" },
    block: { true: "block w-full", false: "inline-block" },
  },
  defaultVariants: { fit: "default", shape: "square", bordered: false, shadow: false, block: false },
});

export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement>, VariantProps<typeof imageVariants> {}

export function Image({
  className,
  fit,
  shape,
  bordered,
  shadow,
  block,
  ref,
  ...props
}: ImageProps & { ref?: React.Ref<HTMLImageElement> }) {
  return <img ref={ref} className={imageVariants({ fit, shape, bordered, shadow, block, className })} {...props} />;
}

/* ------------------------------------------------------------------ AspectRatio
   shadcn AspectRatio — https://ui.shadcn.com/docs/components/aspect-ratio (dùng CSS aspect-ratio). */
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tỉ lệ rộng / cao, ví dụ 16 / 9. */
  ratio?: number;
}

export function AspectRatio({
  ratio = 1,
  className,
  style,
  ref,
  ...props
}: AspectRatioProps & { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div ref={ref} style={{ aspectRatio: ratio, ...style }} className={cn("relative w-full overflow-hidden", className)} {...props} />
  );
}

export { imageVariants };
