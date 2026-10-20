/** Fluent 2 Textarea — https://fluent2.microsoft.design/components/web/react/core/textarea/usage */
import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { fieldAppearanceClass } from "@/components/ui/Select/Select";

const textareaVariants = cva(
  [
    "m-0 block w-full grow bg-transparent text-foreground-1 outline-none placeholder:text-foreground-4",
    "disabled:cursor-not-allowed disabled:text-foreground-disabled disabled:placeholder:text-foreground-disabled",
  ],
  {
    variants: {
      size: {
        small: "min-h-10 max-h-50 px-S py-XS text-caption1",
        medium: "min-h-13 max-h-65 px-M py-SNudge text-body1",
        large: "min-h-16 max-h-80 px-[calc(var(--spacingM)+var(--spacingXXS))] py-S text-body2",
      },
      resize: {
        none: "resize-none",
        vertical: "resize-y",
        horizontal: "resize-x",
        both: "resize",
      },
    },
    defaultVariants: { size: "medium", resize: "none" },
  },
);

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  appearance?: "outline" | "filled-darker" | "filled-lighter";
  size?: "small" | "medium" | "large";
  resize?: "none" | "vertical" | "horizontal" | "both";
  /** Class cho chính thẻ `<textarea>`; `className` áp vào khung ngoài (đặt width ở đây). */
  textareaClassName?: string;
}

/** Textarea nhập văn bản nhiều dòng; đặt trong `<Field>` để có label / hint / validation. */
export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, textareaClassName, appearance = "outline", size = "medium", resize = "none", disabled, ...props }, ref) => {
    const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
    return (
      <span
        data-disabled={disabled || undefined}
        data-invalid={invalid || undefined}
        className={cn(fieldAppearanceClass[appearance], "inline-flex pb-XXS", className)}
      >
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(textareaVariants({ size, resize }), textareaClassName)}
          {...props}
        />
      </span>
    );
  },
);
Textarea.displayName = "Textarea";
