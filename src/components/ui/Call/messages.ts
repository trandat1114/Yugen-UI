import type { CallControlKind, CallState } from "./Call";

/** Chuỗi giao diện có sẵn của CallSurface, CallStatus, CallControls. Đổi qua `messages.call` của YugenProvider. */
export interface CallMessages {
  /** Chữ của từng trạng thái cuộc gọi (CallStatus). */
  states: Record<CallState, string>;
  /** Nhãn của từng nút điều khiển có sẵn. */
  controls: Record<CallControlKind, string>;
  /** Tên của thanh điều khiển. */
  toolbar: string;
  /** Tên của CallSurface; `name` là người / trợ lý ở đầu bên kia. */
  surface: (name: string) => string;
  /** Nhãn của nút Kết thúc khi `confirm` đang chờ lần bấm thứ hai. */
  confirmEnd: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    call: CallMessages;
  }
}

export const callMessagesVi: CallMessages = {
  states: {
    connecting: "Đang kết nối…",
    ringing: "Đang đổ chuông…",
    connected: "Đã kết nối",
    muted: "Đã tắt micro",
    "on-hold": "Đang giữ máy",
    ended: "Đã kết thúc",
    failed: "Không kết nối được",
  },
  controls: {
    mute: "Tắt micro",
    speaker: "Loa ngoài",
    camera: "Camera",
    hold: "Giữ máy",
    add: "Thêm người",
    end: "Kết thúc",
  },
  toolbar: "Điều khiển cuộc gọi",
  surface: (name) => `Cuộc gọi với ${name}`,
  confirmEnd: "Bấm lần nữa để kết thúc",
};

export const callMessagesEn: CallMessages = {
  states: {
    connecting: "Connecting…",
    ringing: "Ringing…",
    connected: "Connected",
    muted: "Muted",
    "on-hold": "On hold",
    ended: "Call ended",
    failed: "Call failed",
  },
  controls: {
    mute: "Mute",
    speaker: "Speaker",
    camera: "Camera",
    hold: "Hold",
    add: "Add people",
    end: "End call",
  },
  toolbar: "Call controls",
  surface: (name) => `Call with ${name}`,
  confirmEnd: "Press again to end",
};
