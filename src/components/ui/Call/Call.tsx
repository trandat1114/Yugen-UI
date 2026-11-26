/**
 * Yugen Labs · Call — khung cuộc gọi dùng chung cho trợ lý giọng nói, gọi 1-1 và phòng họp: CallSurface (bố cục),
 * CallStatus (trạng thái bằng chữ), CallControls + CallControlButton (thanh điều khiển). Không quản lý kết nối hay quyền
 * micro: chỉ nhận trạng thái và callback.
 */
import * as React from "react";
import { cn } from "@/lib/cn";
import {
  CallEnd20Regular,
  Mic20Regular,
  MicOff20Regular,
  Pause20Regular,
  PersonAdd20Regular,
  Play20Regular,
  Speaker220Regular,
  SpeakerMute20Regular,
  Video20Regular,
  VideoOff20Regular,
} from "../_internal/icons";
import { Toolbar, type ToolbarProps } from "../Toolbar/Toolbar";
import { useYugenMessages } from "../YugenProvider/context";
import { callMessagesEn } from "./messages";

export { callMessagesVi, callMessagesEn, type CallMessages } from "./messages";

export type CallState = "connecting" | "ringing" | "connected" | "muted" | "on-hold" | "ended" | "failed";
export type CallControlKind = "mute" | "speaker" | "camera" | "hold" | "add" | "end";

/** Giây → "m:ss" hoặc "h:mm:ss". */
export function formatCallDuration(seconds: number): string {
  const total = Math.max(0, Math.floor(Number.isFinite(seconds) ? seconds : 0));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = String(total % 60).padStart(2, "0");
  return h > 0 ? `${h}:${String(m).padStart(2, "0")}:${s}` : `${m}:${s}`;
}

const DOT: Record<CallState, string> = {
  connecting: "bg-warning-foreground-1 animate-pulse motion-reduce:animate-none",
  ringing: "bg-brand-background animate-pulse motion-reduce:animate-none",
  connected: "bg-success-foreground-1",
  muted: "bg-foreground-3",
  "on-hold": "bg-warning-foreground-1",
  ended: "bg-foreground-disabled",
  failed: "bg-danger-background-3",
};

export interface CallStatusProps extends React.HTMLAttributes<HTMLDivElement> {
  state: CallState;
  /** Thời lượng (giây), hiện sau trạng thái khi đã kết nối; không nằm trong vùng live nên không bị đọc mỗi giây. */
  duration?: number;
  /** Thay chữ của trạng thái. */
  label?: React.ReactNode;
}

/** Trạng thái cuộc gọi bằng chữ (không chỉ bằng màu); chữ nằm trong role="status" để đổi trạng thái được đọc lên. */
export function CallStatus({ state, duration, label, className, ref, ...props }: CallStatusProps & { ref?: React.Ref<HTMLDivElement> }) {
  const msg = useYugenMessages("call", callMessagesEn);
  const showDuration = duration !== undefined && (state === "connected" || state === "muted" || state === "on-hold");
  return (
    <div ref={ref} data-state={state} className={cn("inline-flex items-center gap-2 text-body1 text-foreground-2", className)} {...props}>
      <span aria-hidden className={cn("size-2 shrink-0 rounded-circular forced-colors:bg-[CanvasText]", DOT[state])} />
      <span role="status">{label ?? msg.states[state]}</span>
      {showDuration && (
        <span className="tabular-nums text-foreground-3">
          <span aria-hidden>· </span>
          {formatCallDuration(duration)}
        </span>
      )}
    </div>
  );
}

export interface CallSurfaceProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  /** Người / trợ lý ở đầu bên kia; cũng đặt tên cho vùng (`messages.call.surface`). */
  name: string;
  avatar?: React.ReactNode;
  state: CallState;
  duration?: number;
  /** Thay chữ của trạng thái (CallStatus `label`). */
  statusLabel?: React.ReactNode;
  /** Dòng phụ dưới tên (số máy, vai trò). */
  description?: React.ReactNode;
  /** Thanh điều khiển (CallControls). */
  controls?: React.ReactNode;
  /** stacked: dọc, căn giữa (màn hình cuộc gọi) · inline: một hàng gọn (panel, thanh dưới). */
  layout?: "stacked" | "inline";
  /** Nội dung giữa: Transcript, VoiceWave, danh sách người tham gia. */
  children?: React.ReactNode;
}

export function CallSurface({
  name,
  avatar,
  state,
  duration,
  statusLabel,
  description,
  controls,
  layout = "stacked",
  className,
  children,
  ref,
  ...props
}: CallSurfaceProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("call", callMessagesEn);
  const stacked = layout === "stacked";
  return (
    <section
      ref={ref}
      aria-label={msg.surface(name)}
      data-state={state}
      data-layout={layout}
      className={cn(
        "flex min-w-0 rounded-xlarge border border-stroke-2 bg-background-1 text-foreground-1",
        stacked ? "flex-col items-center gap-5 p-6 text-center" : "flex-col gap-3 p-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
      {...props}
    >
      <div className={cn("flex min-w-0 gap-3", stacked ? "flex-col items-center" : "flex-1 items-center")}>
        {avatar && <div className="shrink-0">{avatar}</div>}
        <div className={cn("flex min-w-0 flex-col", stacked ? "items-center gap-1" : "gap-0.5")}>
          <div className={cn("min-w-0 truncate font-semibold", stacked ? "text-title3" : "text-body1")}>{name}</div>
          {description && <div className="min-w-0 truncate text-caption1 text-foreground-3">{description}</div>}
          <CallStatus state={state} duration={duration} label={statusLabel} />
        </div>
      </div>
      {children && <div className={cn("min-w-0", stacked ? "w-full" : "w-full sm:order-last")}>{children}</div>}
      {controls}
    </section>
  );
}

export type CallControlsProps = Omit<ToolbarProps, "orientation" | "size">;

/** Thanh điều khiển: role="toolbar", Tab vào một lần, phím mũi tên giữa các nút (roving focus của Toolbar). */
export function CallControls({ className, ...props }: CallControlsProps & { ref?: React.Ref<HTMLDivElement> }) {
  const msg = useYugenMessages("call", callMessagesEn);
  return (
    <Toolbar
      aria-label={props["aria-labelledby"] ? undefined : msg.toolbar}
      className={cn("flex-wrap justify-center gap-3 bg-transparent p-0 shadow-none", className)}
      {...props}
    />
  );
}

const ICONS: Record<CallControlKind, { on: React.ComponentType<{ className?: string }>; off: React.ComponentType<{ className?: string }> }> = {
  mute: { on: MicOff20Regular, off: Mic20Regular },
  speaker: { on: Speaker220Regular, off: SpeakerMute20Regular },
  camera: { on: Video20Regular, off: VideoOff20Regular },
  hold: { on: Play20Regular, off: Pause20Regular },
  add: { on: PersonAdd20Regular, off: PersonAdd20Regular },
  end: { on: CallEnd20Regular, off: CallEnd20Regular },
};

const TOGGLES: ReadonlySet<CallControlKind> = new Set(["mute", "speaker", "camera", "hold"]);

/** Thời gian chờ lần bấm thứ hai của `confirm` (ms). */
const CONFIRM_WINDOW = 4000;

export interface CallControlButtonProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  /** Nút có sẵn: icon + nhãn (`messages.call.controls`). mute / speaker / camera / hold là nút bật-tắt (aria-pressed). */
  kind?: CallControlKind;
  /** Trạng thái của nút bật-tắt: mute = đang tắt micro, speaker = loa ngoài bật, camera = camera bật, hold = đang giữ máy. */
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  /** Thay nhãn (cũng là tên đọc). */
  label?: React.ReactNode;
  icon?: React.ReactNode;
  /** kind="end": cần bấm hai lần trong 4 giây; lần đầu đổi nhãn thành `messages.call.confirmEnd`. */
  confirm?: boolean;
}

export function CallControlButton({
  kind,
  pressed,
  onPressedChange,
  label,
  icon,
  confirm = false,
  className,
  onClick,
  onBlur,
  disabled,
  ref,
  ...props
}: CallControlButtonProps & { ref?: React.Ref<HTMLButtonElement> }) {
  const msg = useYugenMessages("call", callMessagesEn);
  const toggle = kind !== undefined && TOGGLES.has(kind);
  const danger = kind === "end";
  const [armed, setArmed] = React.useState(false);

  React.useEffect(() => {
    if (!armed) return;
    const timer = window.setTimeout(() => setArmed(false), CONFIRM_WINDOW);
    return () => window.clearTimeout(timer);
  }, [armed]);

  const Icon = kind ? (pressed ? ICONS[kind].on : ICONS[kind].off) : null;
  const text = armed ? msg.confirmEnd : (label ?? (kind ? msg.controls[kind] : null));

  return (
    <button
      ref={ref}
      type="button"
      data-toolbar-item=""
      data-kind={kind}
      aria-pressed={toggle ? Boolean(pressed) : undefined}
      disabled={disabled}
      className={cn(
        "group/call flex min-w-16 flex-col items-center gap-1.5 rounded-medium p-1 text-caption1 text-foreground-2 outline-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stroke-focus",
        "disabled:cursor-not-allowed disabled:text-foreground-disabled",
        className,
      )}
      onClick={(event) => {
        if (danger && confirm && !armed) {
          setArmed(true);
          return;
        }
        setArmed(false);
        if (toggle) onPressedChange?.(!pressed);
        onClick?.(event);
      }}
      onBlur={(event) => {
        setArmed(false);
        onBlur?.(event);
      }}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          "flex size-12 items-center justify-center rounded-circular transition-colors duration-faster motion-reduce:transition-none [&_svg]:size-5",
          danger
            ? "bg-danger-background-3 text-foreground-on-brand group-hover/call:brightness-110"
            : pressed
              ? "bg-foreground-1 text-background-1"
              : "bg-background-3 text-foreground-1 group-hover/call:bg-background-1-hover",
          "group-disabled/call:bg-background-disabled group-disabled/call:text-foreground-disabled",
          "forced-colors:border forced-colors:border-[ButtonText]",
        )}
      >
        {icon ?? (Icon && <Icon />)}
      </span>
      <span aria-live={danger && confirm ? "polite" : undefined}>{text}</span>
    </button>
  );
}
