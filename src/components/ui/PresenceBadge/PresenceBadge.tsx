/** Fluent 2 PresenceBadge — https://storybooks.fluentui.dev/react/?path=/docs/components-badge-presencebadge--docs */
import * as React from "react";
import {
  PresenceAvailable12Filled,
  PresenceAvailable12Regular,
  PresenceAvailable16Filled,
  PresenceAvailable16Regular,
  PresenceAvailable20Filled,
  PresenceAvailable20Regular,
  PresenceAway12Filled,
  PresenceAway16Filled,
  PresenceAway20Filled,
  PresenceBlocked12Regular,
  PresenceBlocked16Regular,
  PresenceBlocked20Regular,
  PresenceBusy12Filled,
  PresenceBusy16Filled,
  PresenceBusy20Filled,
  PresenceDnd12Filled,
  PresenceDnd12Regular,
  PresenceDnd16Filled,
  PresenceDnd16Regular,
  PresenceDnd20Filled,
  PresenceDnd20Regular,
  PresenceOffline12Regular,
  PresenceOffline16Regular,
  PresenceOffline20Regular,
  PresenceOof12Regular,
  PresenceOof16Regular,
  PresenceOof20Regular,
  PresenceUnknown12Regular,
  PresenceUnknown16Regular,
  PresenceUnknown20Regular,
  type FluentIcon,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";

export type PresenceBadgeStatus =
  | "available"
  | "away"
  | "busy"
  | "do-not-disturb"
  | "offline"
  | "out-of-office"
  | "blocked"
  | "unknown";

export type PresenceBadgeSize = "tiny" | "extra-small" | "small" | "medium" | "large" | "extra-large";

type IconSet = Record<12 | 16 | 20, FluentIcon>;

const ICONS = {
  available: { 12: PresenceAvailable12Filled, 16: PresenceAvailable16Filled, 20: PresenceAvailable20Filled },
  availableOof: { 12: PresenceAvailable12Regular, 16: PresenceAvailable16Regular, 20: PresenceAvailable20Regular },
  away: { 12: PresenceAway12Filled, 16: PresenceAway16Filled, 20: PresenceAway20Filled },
  busy: { 12: PresenceBusy12Filled, 16: PresenceBusy16Filled, 20: PresenceBusy20Filled },
  dnd: { 12: PresenceDnd12Filled, 16: PresenceDnd16Filled, 20: PresenceDnd20Filled },
  dndOof: { 12: PresenceDnd12Regular, 16: PresenceDnd16Regular, 20: PresenceDnd20Regular },
  offline: { 12: PresenceOffline12Regular, 16: PresenceOffline16Regular, 20: PresenceOffline20Regular },
  oof: { 12: PresenceOof12Regular, 16: PresenceOof16Regular, 20: PresenceOof20Regular },
  blocked: { 12: PresenceBlocked12Regular, 16: PresenceBlocked16Regular, 20: PresenceBlocked20Regular },
  unknown: { 12: PresenceUnknown12Regular, 16: PresenceUnknown16Regular, 20: PresenceUnknown20Regular },
} satisfies Record<string, IconSet>;

/** Chọn icon như Fluent: outOfOffice chuyển sang biến thể viền (Regular). */
function iconFor(status: PresenceBadgeStatus, outOfOffice: boolean): IconSet {
  switch (status) {
    case "available":
      return outOfOffice ? ICONS.availableOof : ICONS.available;
    case "away":
      return outOfOffice ? ICONS.oof : ICONS.away;
    case "busy":
      return outOfOffice ? ICONS.unknown : ICONS.busy;
    case "do-not-disturb":
      return outOfOffice ? ICONS.dndOof : ICONS.dnd;
    case "offline":
      return outOfOffice ? ICONS.oof : ICONS.offline;
    case "out-of-office":
      return ICONS.oof;
    case "blocked":
      return ICONS.blocked;
    default:
      return ICONS.unknown;
  }
}

/**
 * Màu theo token. Fluent dùng Berry cho "out of office" — Yugen chưa có alias Berry nên dùng Lavender (cùng họ tím).
 * Away dùng Marigold (đúng màu vàng của Fluent).
 */
function colorFor(status: PresenceBadgeStatus, outOfOffice: boolean) {
  if (status === "busy" || status === "do-not-disturb" || status === "blocked") return "text-danger-foreground-1";
  if (status === "available") return "text-success-foreground-1";
  if (status === "out-of-office") return "text-lavender-fg";
  if (status === "away") return outOfOffice ? "text-lavender-fg" : "text-marigold-active";
  if (status === "offline") return outOfOffice ? "text-lavender-fg" : "text-foreground-3";
  return "text-foreground-3";
}

const SIZE: Record<PresenceBadgeSize, string> = {
  tiny: "size-1.5",
  "extra-small": "size-2.5",
  small: "size-3",
  medium: "size-4",
  large: "size-5",
  "extra-large": "size-7",
};

const ICON_SIZE: Record<PresenceBadgeSize, 12 | 16 | 20> = {
  tiny: 12,
  "extra-small": 12,
  small: 12,
  medium: 16,
  large: 20,
  "extra-large": 20,
};

const LABEL: Record<PresenceBadgeStatus, string> = {
  available: "Có mặt",
  away: "Vắng mặt",
  busy: "Bận",
  "do-not-disturb": "Không làm phiền",
  offline: "Ngoại tuyến",
  "out-of-office": "Không ở văn phòng",
  blocked: "Đã chặn",
  unknown: "Không xác định",
};

export interface PresenceBadgeProps extends Omit<React.HTMLAttributes<HTMLSpanElement>, "children"> {
  status?: PresenceBadgeStatus;
  /** Đang nghỉ / không ở văn phòng — đổi sang icon viền (trừ khi status = "out-of-office"). */
  outOfOffice?: boolean;
  size?: PresenceBadgeSize;
  /** Viền 2px màu nền — bật khi đặt chồng lên Avatar. */
  ring?: boolean;
  /** Ghi đè nhãn đọc cho trình đọc màn hình. */
  label?: string;
}

export const PresenceBadge = React.forwardRef<HTMLSpanElement, PresenceBadgeProps>(
  ({ status = "available", outOfOffice = false, size = "medium", ring = false, label, className, ...props }, ref) => {
    const Icon = iconFor(status, outOfOffice)[ICON_SIZE[size]];
    const ariaLabel =
      label ?? LABEL[status] + (outOfOffice && status !== "out-of-office" ? `, ${LABEL["out-of-office"].toLowerCase()}` : "");

    return (
      <span
        ref={ref}
        role="img"
        aria-label={ariaLabel}
        className={cn(
          "inline-flex shrink-0 items-center justify-center rounded-circular bg-background-1 [&>svg]:size-full",
          SIZE[size],
          colorFor(status, outOfOffice),
          ring && "ring-2 ring-background-1",
          className,
        )}
        {...props}
      >
        <Icon aria-hidden="true" />
      </span>
    );
  },
);
PresenceBadge.displayName = "PresenceBadge";
