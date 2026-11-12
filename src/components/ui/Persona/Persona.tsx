import * as React from "react";
import { cn } from "@/lib/cn";
import { Avatar, type AvatarProps } from "../Avatar/Avatar";
import { AvatarGroup, AvatarGroupItem, type AvatarGroupItemProps } from "../AvatarGroup/AvatarGroup";
import { useYugenMessages, useComponentDefaults } from "../YugenProvider/context";
import { presenceBadgeMessagesEn } from "../PresenceBadge/messages";

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

const GAP: Record<PersonaSize, string> = {
  "extra-small": "gap-1.5",
  small: "gap-2",
  medium: "gap-2",
  large: "gap-2",
  "extra-large": "gap-3",
  huge: "gap-3",
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

export type PersonaAvatarOptions = Omit<AvatarProps, "name" | "size" | "presence">;
/** One person in `avatars`: `{ name, src?, color?, image?, renderImage? }`. */
export type PersonaAvatarItem = Omit<AvatarGroupItemProps, "className">;

interface PersonaOneAvatar {
  /** Avatar options (src, image, color, shape…). */
  avatar?: PersonaAvatarOptions;
  presence?: PersonaPresence;
  /** Shows only the presence dot instead of the Avatar. */
  presenceOnly?: boolean;
  avatars?: never;
  avatarLayout?: never;
  maxAvatars?: never;
}

interface PersonaAvatarStack {
  /** Several people, shown as an AvatarGroup at the Persona's size. */
  avatars: PersonaAvatarItem[];
  /** AvatarGroup layout for `avatars`. */
  avatarLayout?: "stack" | "pie";
  /** Most avatars shown, the "+N" button included (stack only). */
  maxAvatars?: number;
  avatar?: never;
  presence?: never;
  presenceOnly?: never;
}

interface PersonaBaseProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Name: the default primaryText and the Avatar's name. */
  name?: string;
  primaryText?: React.ReactNode;
  secondaryText?: React.ReactNode;
  tertiaryText?: React.ReactNode;
  quaternaryText?: React.ReactNode;
  size?: PersonaSize;
  textPosition?: "after" | "before" | "below";
  textAlignment?: "start" | "center";
}

export type PersonaProps = PersonaBaseProps & (PersonaOneAvatar | PersonaAvatarStack);

export function Persona(inProps: PersonaProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    name = "",
    avatar,
    avatars,
    avatarLayout = "stack",
    maxAvatars = 3,
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
    ref,
    ...props
  } = useComponentDefaults("Persona", inProps);
  // Tên trạng thái dùng chung với PresenceBadge (`messages.presenceBadge`).
  const msg = useYugenMessages("presenceBadge", presenceBadgeMessagesEn);
  const below = textPosition === "below";
  const secondaryClass = cn("truncate text-foreground-2", size === "huge" ? "text-body1" : "text-caption1");

  const label = primaryText ?? name;
  const media = avatars ? (
    <AvatarGroup
      layout={avatarLayout}
      size={AVATAR_SIZE[size]}
      maxAvatars={maxAvatars}
      aria-label={typeof label === "string" && label ? label : avatars.map((a) => a.name).join(", ")}
      className="shrink-0"
    >
      {avatars.map((item, index) => (
        <AvatarGroupItem key={index} {...item} />
      ))}
    </AvatarGroup>
  ) : presenceOnly ? (
    // Khung cao bằng dòng primaryText để chấm luôn thẳng hàng với tên.
    <span className={cn("flex shrink-0 items-center", LINE[size])}>
      <span
        role="img"
        aria-label={msg[presence ?? "offline"]}
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
        <span className={cn("max-w-full truncate font-semibold text-foreground-1", PRIMARY[size])}>{label}</span>
        {secondaryText && <span className={cn("max-w-full", secondaryClass)}>{secondaryText}</span>}
        {tertiaryText && <span className="max-w-full truncate text-caption1 text-foreground-2">{tertiaryText}</span>}
        {quaternaryText && <span className="max-w-full truncate text-caption1 text-foreground-2">{quaternaryText}</span>}
      </span>
    </div>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Persona: PersonaProps;
  }
}
