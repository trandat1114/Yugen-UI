/** Chuỗi giao diện có sẵn của TeachingPopover. Đổi qua `messages.teachingPopover` của YugenProvider. */
export interface TeachingPopoverMessages {
  /** aria-label nút X của TeachingPopoverHeader. */
  close: string;
  /** Nút của TeachingPopoverCarousel. */
  next: string;
  previous: string;
  finish: string;
  /** Nút phụ ở bước đầu (đóng popover). */
  later: string;
  /** aria-roledescription của từng bước. */
  stepRoleDescription: string;
  /** Tên bước hiện tại; `current` đếm từ 1. */
  step: (current: number, count: number) => string;
  /** aria-label chấm điều hướng; `index` đếm từ 1. */
  goToStep: (index: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    teachingPopover: TeachingPopoverMessages;
  }
}

export const teachingPopoverMessages: TeachingPopoverMessages = {
  close: "Đóng",
  next: "Tiếp",
  previous: "Quay lại",
  finish: "Hoàn tất",
  later: "Để sau",
  stepRoleDescription: "bước",
  step: (current, count) => `Bước ${current}/${count}`,
  goToStep: (index) => `Đến bước ${index}`,
};
