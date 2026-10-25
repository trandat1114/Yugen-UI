/** Chuỗi giao diện có sẵn của Sheet. Đổi qua `messages.sheet` của YugenProvider. */
export interface SheetMessages {
  /** Nhãn tay nắm đổi nấc chiều cao của bottom sheet (phần "(50%)" được thêm sau). */
  handle: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    sheet: SheetMessages;
  }
}

export const sheetMessages: SheetMessages = { handle: "Đổi chiều cao" };
