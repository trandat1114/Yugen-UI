/** Chuỗi giao diện có sẵn của AppShell và Sidebar. Đổi qua `messages.appShell` của YugenProvider. */
export interface AppShellMessages {
  /** Skip link đầu trang, tới AppShellMain. */
  skipToContent: string;
  /** Tên của Drawer chứa sidebar trên màn hẹp. */
  sidebar: string;
  /** SidebarTrigger trên màn hẹp. */
  openSidebar: string;
  /** SidebarTrigger và SidebarRail trên màn rộng. */
  collapseSidebar: string;
  expandSidebar: string;
  /** Thanh chia kéo đổi độ rộng (Sidebar `resizable`). */
  resizeSidebar: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    appShell: AppShellMessages;
  }
}

export const appShellMessages: AppShellMessages = {
  skipToContent: "Chuyển tới nội dung",
  sidebar: "Thanh bên",
  openSidebar: "Mở thanh bên",
  collapseSidebar: "Thu gọn thanh bên",
  expandSidebar: "Mở rộng thanh bên",
  resizeSidebar: "Đổi độ rộng thanh bên",
};

export const appShellMessagesEn: AppShellMessages = {
  skipToContent: "Skip to content",
  sidebar: "Sidebar",
  openSidebar: "Open sidebar",
  collapseSidebar: "Collapse sidebar",
  expandSidebar: "Expand sidebar",
  resizeSidebar: "Resize sidebar",
};

/** Bản tiếng Việt, tên có hậu tố ngôn ngữ như `appShellMessagesEn` (mặc định). `appShellMessages` giữ cho code cũ. */
export const appShellMessagesVi = appShellMessages;
