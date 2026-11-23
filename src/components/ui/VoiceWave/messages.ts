/** Chuỗi giao diện có sẵn của VoiceWave: tên đọc cho từng trạng thái. Đổi qua `messages.voiceWave` của YugenProvider. */
export interface VoiceWaveMessages {
  /** Chưa có âm thanh. */
  idle: string;
  listening: string;
  speaking: string;
  muted: string;
  /** Không nhận được âm thanh (micro lỗi, bị chặn). */
  error: string;
}

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
