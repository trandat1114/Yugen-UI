import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Fluent 2 Card — https://fluent2.microsoft.design/components/web/react/core/card/usage */
const cardVariants = cva(
  "relative flex flex-col overflow-hidden rounded-medium border text-foreground-1 transition-[box-shadow,background-color] duration-faster ease-easy-ease",
  {
    variants: {
      appearance: {
        filled: "bg-background-1 border-transparent shadow-4",
        "filled-alternative": "bg-background-2 border-transparent shadow-4",
        outline: "bg-transparent border-stroke-1",
        subtle: "bg-transparent border-transparent",
      },
      size: {
        small: "gap-2 p-2",
        medium: "gap-3 p-3",
        large: "gap-4 p-4",
      },
      interactive: {
        true: "cursor-pointer",
        false: "",
      },
    },
    compoundVariants: [
      { interactive: true, appearance: "filled", class: "hover:shadow-8 hover:bg-background-1-hover active:bg-background-1-pressed" },
      { interactive: true, appearance: "filled-alternative", class: "hover:shadow-8" },
      { interactive: true, appearance: "outline", class: "hover:border-stroke-1-hover hover:bg-subtle-hover" },
      { interactive: true, appearance: "subtle", class: "hover:bg-subtle-hover active:bg-subtle-pressed" },
    ],
    defaultVariants: { appearance: "filled", size: "medium", interactive: false },
  },
);

export interface CardProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, appearance, size, interactive, ...props }, ref) => (
    <div ref={ref} className={cn(cardVariants({ appearance, size, interactive }), className)} {...props} />
  ),
);
Card.displayName = "Card";

export interface CardHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  image?: React.ReactNode;
  header: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
}

export function CardHeader({ image, header, description, action, className, ...props }: CardHeaderProps) {
  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      {image && <div className="shrink-0">{image}</div>}
      <div className="min-w-0 flex-1">
        <div className="text-body1 font-semibold text-foreground-1">{header}</div>
        {description && <div className="text-caption1 text-foreground-3">{description}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function CardPreview({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("-mx-3 overflow-hidden [&>img]:block [&>img]:w-full", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-body1 text-foreground-2", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center gap-2", className)} {...props} />;
}
