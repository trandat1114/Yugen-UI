/** Chuỗi giao diện có sẵn của Breadcrumb. Đổi qua `messages.breadcrumb` của YugenProvider. */
export interface BreadcrumbMessages {
  /** aria-label mặc định của thẻ <nav>. */
  label: string;
  /** aria-label của nút "…" (BreadcrumbOverflow). */
  overflow: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    breadcrumb: BreadcrumbMessages;
  }
}

export const breadcrumbMessages: BreadcrumbMessages = {
  label: "Đường dẫn điều hướng",
  overflow: "Hiện thêm mục",
};

export const breadcrumbMessagesEn: BreadcrumbMessages = {
  label: "Breadcrumb",
  overflow: "More items",
};
