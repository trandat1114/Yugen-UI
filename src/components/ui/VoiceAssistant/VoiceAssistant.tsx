/**
 * Yugen Labs · VoiceAssistant — trợ lý giọng nói ghép từ CallSurface, CallStatus, CallControls, VoiceWave và Transcript.
 * Điều khiển hoàn toàn từ ngoài (state, turns, levels / source, callback): không tự mở micro, không gắn với Web Speech,
 * Web Audio hay nhà cung cấp nào.
 */
import * as React from "react";
import { cn } from "@/lib/cn";
import { Button } from "../Button/Button";
import { CallControlButton, CallControls, CallSurface, type CallState } from "../Call/Call";
import { Transcript, type TranscriptTurn } from "../Transcript/Transcript";
import { VoiceWave, type VoiceWaveSource, type VoiceWaveState } from "../VoiceWave/VoiceWave";
import { useYugenMessages } from "../YugenProvider/context";
import { voiceAssistantMessagesEn } from "./messages";

export { voiceAssistantMessagesVi, voiceAssistantMessagesEn, type VoiceAssistantMessages } from "./messages";

export type VoiceAssistantState = "idle" | "connecting" | "listening" | "thinking" | "speaking" | "ended" | "error";

export interface VoiceAssistantProps extends Omit<React.HTMLAttributes<HTMLElement>, "children"> {
  /** Tên trợ lý, cũng đặt tên cho vùng. */
  name: string;
  avatar?: React.ReactNode;
  description?: React.ReactNode;
  state: VoiceAssistantState;
  /** Các lượt nói (Transcript). Bỏ trống hoặc rỗng: không hiện transcript. */
  turns?: readonly TranscriptTurn[];
  /** Mức âm thanh cho VoiceWave (0–1). */
  levels?: ArrayLike<number>;
  /** Đọc mức âm thanh mỗi frame (micro khi listening, giọng trợ lý khi speaking). */
  source?: VoiceWaveSource;
  /** Thời lượng phiên (giây), hiện sau trạng thái khi đang trò chuyện. */
  duration?: number;
  muted?: boolean;
  onMutedChange?: (muted: boolean) => void;
  /** Nút Bắt đầu (idle, ended). */
  onStart?: () => void;
  /** Nút Kết thúc (khi đang trò chuyện). */
  onEnd?: () => void;
  /** Nút Thử lại (error). */
  onRetry?: () => void;
  /** Lý do lỗi (state="error"). */
  error?: React.ReactNode;
  /** Đọc mỗi lượt khi xong (Transcript `announce`). Mặc định true: người dùng thường không nhìn màn hình khi nói. */
  announce?: boolean;
  /** stacked: màn hình đầy đủ · inline: panel gọn. */
  layout?: "stacked" | "inline";
  /** Lớp của khung cuộn transcript (chiều cao). */
  transcriptClassName?: string;
  /** Nút thêm trong thanh điều khiển (trước nút Kết thúc). */
  actions?: React.ReactNode;
}

const ACTIVE: ReadonlySet<VoiceAssistantState> = new Set(["listening", "thinking", "speaking"]);

/** Trạng thái của CallStatus (chấm, thời lượng) và của VoiceWave cho từng trạng thái trợ lý. */
const CALL_STATE: Record<VoiceAssistantState, CallState> = {
  idle: "ended",
  connecting: "connecting",
  listening: "connected",
  thinking: "connected",
  speaking: "connected",
  ended: "ended",
  error: "failed",
};

function waveState(state: VoiceAssistantState, muted: boolean): VoiceWaveState {
  if (state === "error") return "error";
  if (state === "listening") return muted ? "muted" : "listening";
  if (state === "speaking") return "speaking";
  return "idle";
}

export function VoiceAssistant({
  name,
  avatar,
  description,
  state,
  turns,
  levels,
  source,
  duration,
  muted = false,
  onMutedChange,
  onStart,
  onEnd,
  onRetry,
  error,
  announce = true,
  layout = "stacked",
  transcriptClassName,
  actions,
  className,
  ref,
  ...props
}: VoiceAssistantProps & { ref?: React.Ref<HTMLElement> }) {
  const msg = useYugenMessages("voiceAssistant", voiceAssistantMessagesEn);
  const active = ACTIVE.has(state);
  const callState: CallState = active && muted ? "muted" : CALL_STATE[state];
  const statusLabel = active && muted && state === "listening" ? undefined : msg.states[state];

  const controls =
    state === "error" ? (
      <Button appearance="primary" onClick={onRetry}>
        {msg.retry}
      </Button>
    ) : state === "idle" || state === "ended" ? (
      <Button appearance="primary" onClick={onStart}>
        {msg.start}
      </Button>
    ) : (
      <CallControls>
        <CallControlButton kind="mute" pressed={muted} onPressedChange={onMutedChange} disabled={state === "connecting"} />
        {actions}
        <CallControlButton kind="end" onClick={onEnd} />
      </CallControls>
    );

  return (
    <CallSurface
      ref={ref}
      name={name}
      avatar={avatar}
      description={description}
      state={callState}
      statusLabel={statusLabel}
      duration={active ? duration : undefined}
      layout={layout}
      controls={controls}
      data-assistant-state={state}
      className={cn("w-full", className)}
      {...props}
    >
      <div className="flex w-full min-w-0 flex-col items-center gap-4">
        <VoiceWave state={waveState(state, muted)} levels={levels} source={source} size={layout === "stacked" ? "large" : "medium"} bars={layout === "stacked" ? 32 : 20} />
        {state === "error" && (
          <p role="alert" className="m-0 text-center text-body1 text-danger-foreground-1">
            {error ?? msg.error}
          </p>
        )}
        {turns && turns.length > 0 && (
          <Transcript
            turns={turns}
            announce={announce}
            className={cn("w-full overflow-y-auto text-start", layout === "stacked" ? "max-h-72" : "max-h-48", transcriptClassName)}
          />
        )}
      </div>
    </CallSurface>
  );
}
