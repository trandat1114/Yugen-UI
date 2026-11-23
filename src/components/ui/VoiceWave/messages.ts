import type { VoiceWaveState } from "./VoiceWave";

/** Chuỗi giao diện có sẵn của VoiceWave: tên đọc cho từng trạng thái. Đổi qua `messages.voiceWave` của YugenProvider. */
export type VoiceWaveMessages = Record<VoiceWaveState, string>;

declare module "../YugenProvider/context" {
  interface YugenMessages {
    voiceWave: VoiceWaveMessages;
  }
}

export const voiceWaveMessagesVi: VoiceWaveMessages = {
  idle: "Âm thanh: đang chờ",
  listening: "Đang nghe",
  speaking: "Đang nói",
  muted: "Đã tắt micro",
  error: "Không nhận được âm thanh",
};

export const voiceWaveMessagesEn: VoiceWaveMessages = {
  idle: "Audio: idle",
  listening: "Listening",
  speaking: "Speaking",
  muted: "Microphone muted",
  error: "No audio",
};
