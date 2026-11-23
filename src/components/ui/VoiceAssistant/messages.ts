import type { VoiceAssistantState } from "./VoiceAssistant";

/** Chuỗi giao diện có sẵn của VoiceAssistant. Đổi qua `messages.voiceAssistant` của YugenProvider. */
export interface VoiceAssistantMessages {
  /** Trạng thái bằng chữ (đọc qua vùng status của CallStatus). */
  states: Record<VoiceAssistantState, string>;
  /** Nút bắt đầu (idle, ended). */
  start: string;
  /** Nút thử lại (error). */
  retry: string;
  /** Lỗi khi không truyền `error`. */
  error: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    voiceAssistant: VoiceAssistantMessages;
  }
}

export const voiceAssistantMessagesVi: VoiceAssistantMessages = {
  states: {
    idle: "Sẵn sàng",
    connecting: "Đang kết nối…",
    listening: "Đang nghe",
    thinking: "Đang nghĩ…",
    speaking: "Đang trả lời",
    ended: "Đã kết thúc",
    error: "Có lỗi",
  },
  start: "Bắt đầu nói",
  retry: "Thử lại",
  error: "Không kết nối được với trợ lý.",
};

export const voiceAssistantMessagesEn: VoiceAssistantMessages = {
  states: {
    idle: "Ready",
    connecting: "Connecting…",
    listening: "Listening",
    thinking: "Thinking…",
    speaking: "Speaking",
    ended: "Ended",
    error: "Something went wrong",
  },
  start: "Start talking",
  retry: "Try again",
  error: "Couldn't reach the assistant.",
};
