import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

/** Fluent 2 Avatar — https://fluent2.microsoft.design/components/web/react/core/avatar/usage */
const avatarVariants = cva(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold select-none",
  {
    variants: {
      size: {
        20: "size-5 text-[9px]",
        24: "size-6 text-caption2",
        32: "size-8 text-caption1",
        40: "size-10 text-body1",
        48: "size-12 text-subtitle2",
        64: "size-16 text-subtitle1",
        96: "size-24 text-title2",
      },
      shape: {
        circular: "rounded-circular",
        square: "rounded-medium",
      },
    },
    defaultVariants: { size: 32, shape: "circular" },
  },
);

const COLORFUL = [
  "bg-cranberry-bg text-cranberry-fg",
  "bg-marigold-bg text-marigold-fg",
  "bg-teal-bg text-teal-fg",
  "bg-lavender-bg text-lavender-fg",
  "bg-forest-bg text-forest-fg",
  "bg-steel-bg text-steel-fg",
] as const;

const PRESENCE = {
  available: "bg-success-background-3",
  busy: "bg-danger-background-3",
  away: "bg-warning-background-3",
  offline: "bg-background-1 ring-[1.5px] ring-inset ring-foreground-3",
} as const;

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string;
  src?: string;
  color?: "neutral" | "brand" | "colorful";
  presence?: keyof typeof PRESENCE;
  className?: string;
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function hashOf(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export function Avatar({ name, src, size, shape, color = "neutral", presence, className }: AvatarProps) {
  const colorClass =
    color === "brand"
      ? "bg-brand-background text-foreground-on-brand"
      : color === "colorful"
        ? COLORFUL[hashOf(name) % COLORFUL.length]
        : "bg-background-6 text-foreground-3";
  const small = size === 20 || size === 24;

  return (
    <span className="relative inline-flex shrink-0" role="img" aria-label={name}>
      <AvatarPrimitive.Root className={cn(avatarVariants({ size, shape }), colorClass, className)}>
        {src && <AvatarPrimitive.Image src={src} alt="" className="size-full object-cover" />}
        <AvatarPrimitive.Fallback delayMs={src ? 400 : 0} aria-hidden>
          {initialsOf(name)}
        </AvatarPrimitive.Fallback>
      </AvatarPrimitive.Root>
      {presence && (
        <span
          className={cn(
            "absolute -inset-e-px -bottom-px rounded-circular ring-2 ring-background-1",
            small ? "size-2" : "size-3",
            PRESENCE[presence],
          )}
        />
      )}
    </span>
  );
}
