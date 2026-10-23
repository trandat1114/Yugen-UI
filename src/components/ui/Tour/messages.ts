/** Chuỗi giao diện có sẵn của Tour. Đổi qua `messages.tour` của YugenProvider. */
export interface TourMessages {
  next: string;
  back: string;
  skip: string;
  finish: string;
  /** aria-roledescription của bề mặt hướng dẫn. */
  roleDescription: string;
  /** Chữ ẩn (sr-only) trước số bước "1 / 3". */
  step: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    tour: TourMessages;
  }
}

export const tourMessages: TourMessages = {
  next: "Tiếp",
  back: "Quay lại",
  skip: "Bỏ qua",
  finish: "Hoàn tất",
  roleDescription: "hướng dẫn",
  step: "Bước",
};

export const tourMessagesEn: TourMessages = {
  next: "Next",
  back: "Back",
  skip: "Skip",
  finish: "Finish",
  roleDescription: "tour",
  step: "Step",
};
