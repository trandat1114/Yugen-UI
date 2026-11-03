/** Chuỗi giao diện có sẵn của Nav. Đổi qua `messages.nav` của YugenProvider. */
export interface NavMessages {
  /** aria-label mặc định của thẻ <nav>. */
  label: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    nav: NavMessages;
  }
}

export const navMessages: NavMessages = { label: "Điều hướng chính" };

export const navMessagesEn: NavMessages = { label: "Main navigation" };

/** Bản tiếng Việt, tên có hậu tố ngôn ngữ như `navMessagesEn` (mặc định). `navMessages` giữ cho code cũ. */
export const navMessagesVi = navMessages;
