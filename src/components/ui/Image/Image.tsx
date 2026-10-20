import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Fluent 2 Image — https://fluent2.microsoft.design/components/web/react/core/image/usage */
const imageVariants = cva("box-border border-stroke-1", {
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

export const Image = React.forwardRef<HTMLImageElement, ImageProps>(
  ({ className, fit, shape, bordered, shadow, block, ...props }, ref) => (
    <img ref={ref} className={cn(imageVariants({ fit, shape, bordered, shadow, block }), className)} {...props} />
  ),
);
Image.displayName = "Image";

/* ------------------------------------------------------------------ AspectRatio
   shadcn AspectRatio — https://ui.shadcn.com/docs/components/aspect-ratio (dùng CSS aspect-ratio). */
export interface AspectRatioProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tỉ lệ rộng / cao, ví dụ 16 / 9. */
  ratio?: number;
}

export const AspectRatio = React.forwardRef<HTMLDivElement, AspectRatioProps>(
  ({ ratio = 1, className, style, ...props }, ref) => (
    <div ref={ref} style={{ aspectRatio: ratio, ...style }} className={cn("relative w-full overflow-hidden", className)} {...props} />
  ),
);
AspectRatio.displayName = "AspectRatio";

export { imageVariants };
