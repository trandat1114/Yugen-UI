/** Chuỗi giao diện có sẵn của NavigationMenu. Đổi qua `messages.navigationMenu` của YugenProvider. */
export interface NavigationMenuMessages {
  /** aria-label của thẻ <nav> (khi không truyền `aria-label`). */
  label: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    navigationMenu: NavigationMenuMessages;
  }
}

export const navigationMenuMessagesVi: NavigationMenuMessages = { label: "Điều hướng chính" };

export const navigationMenuMessagesEn: NavigationMenuMessages = { label: "Main" };
