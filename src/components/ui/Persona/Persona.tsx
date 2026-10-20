import * as React from "react";
import { cn } from "@/lib/cn";
import { Avatar, type AvatarProps } from "../Avatar/Avatar";

/** Fluent 2 Persona — https://fluent2.microsoft.design/components/web/react/core/persona/usage */
export type PersonaSize = "extra-small" | "small" | "medium" | "large" | "extra-large" | "huge";
export type PersonaPresence = NonNullable<AvatarProps["presence"]>;

type AvatarSize = 20 | 24 | 32 | 40 | 48 | 64 | 96;

const AVATAR_SIZE: Record<PersonaSize, AvatarSize> = {
  "extra-small": 20,
  small: 24,
  medium: 32,
  large: 40,
  "extra-large": 48,
  huge: 64,
};

const PRESENCE_SIZE: Record<PersonaSize, string> = {
  "extra-small": "size-2",
  small: "size-2.5",
  medium: "size-3",
  large: "size-4",
  "extra-large": "size-5",
  huge: "size-6",
};

const PRESENCE_COLOR: Record<PersonaPresence, string> = {
  available: "bg-success-background-3",
  busy: "bg-danger-background-3",
  away: "bg-warning-background-3",
  offline: "bg-background-1 ring-[1.5px] ring-inset ring-foreground-3",
};

const PRESENCE_LABEL: Record<PersonaPresence, string> = {
  available: "Có mặt",
  busy: "Bận",
  away: "Vắng mặt",
  offline: "Ngoại tuyến",
};

const GAP: Record<PersonaSize, string> = {
  "extra-small": "gap-SNudge",
  small: "gap-S",
  medium: "gap-S",
  large: "gap-S",
  "extra-large": "gap-M",
  huge: "gap-M",
};

/** Chiều cao một dòng primaryText (khớp line-height của type ramp). */
const LINE: Record<PersonaSize, string> = {
  "extra-small": "h-5",
  small: "h-5",
  medium: "h-5",
  large: "h-5",
  "extra-large": "h-5.5",
  huge: "h-7",
};

const PRIMARY: Record<PersonaSize, string> = {
  "extra-small": "text-body1",
  small: "text-body1",
  medium: "text-body1",
  large: "text-body1",
  "extra-large": "text-subtitle2",
  huge: "font-display text-subtitle1",
};

export interface PersonaProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Tên người — dùng làm primaryText mặc định và tên Avatar. */
  name?: string;
  /** Tuỳ chọn cho Avatar (src, color, shape…). */
  avatar?: Omit<AvatarProps, "name" | "size" | "presence">;
  presence?: PersonaPresence;
  /** Chỉ hiện chấm trạng thái thay cho Avatar. */
  presenceOnly?: boolean;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  tertiaryText?: React.ReactNode;
  quaternaryText?: React.ReactNode;
  size?: PersonaSize;
  textPosition?: "after" | "before" | "below";
  textAlignment?: "start" | "center";
}

export const Persona = React.forwardRef<HTMLDivElement, PersonaProps>(
  (
    {
      name = "",
      avatar,
      presence,
      presenceOnly = false,
      primaryText,
      secondaryText,
      tertiaryText,
      quaternaryText,
      size = "medium",
      textPosition = "after",
      textAlignment = "start",
      className,
      ...props
    },
    ref,
  ) => {
    const below = textPosition === "below";
    const secondaryClass = cn("truncate text-foreground-2", size === "huge" ? "text-body1" : "text-caption1");

    const media = presenceOnly ? (
      // Khung cao bằng dòng primaryText để chấm luôn thẳng hàng với tên.
      <span className={cn("flex shrink-0 items-center", LINE[size])}>
        <span
          role="img"
          aria-label={PRESENCE_LABEL[presence ?? "offline"]}
          className={cn("rounded-circular", PRESENCE_SIZE[size], PRESENCE_COLOR[presence ?? "offline"])}
        />
      </span>
    ) : (
      <Avatar name={name} size={AVATAR_SIZE[size]} presence={presence} {...avatar} />
    );

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex min-w-0 max-w-full",
          GAP[size],
          below ? "flex-col" : textPosition === "before" ? "flex-row-reverse" : "flex-row",
          textAlignment === "center" ? "items-center" : "items-start",
          below && textAlignment === "center" && "text-center",
          className,
        )}
        {...props}
      >
        {media}
        <span
          className={cn(
            "flex min-w-0 flex-col",
            below && textAlignment === "center" ? "items-center" : textPosition === "before" ? "items-end text-end" : "items-start",
          )}
        >
          <span className={cn("max-w-full truncate font-semibold text-foreground-1", PRIMARY[size])}>{primaryText ?? name}</span>
          {secondaryText && <span className={cn("max-w-full", secondaryClass)}>{secondaryText}</span>}
          {tertiaryText && <span className="max-w-full truncate text-caption1 text-foreground-2">{tertiaryText}</span>}
          {quaternaryText && <span className="max-w-full truncate text-caption1 text-foreground-2">{quaternaryText}</span>}
        </span>
      </div>
    );
  },
);
Persona.displayName = "Persona";
