/** Chuỗi giao diện có sẵn của Pagination. Đổi qua `messages.pagination` của YugenProvider. */
export interface PaginationMessages {
  /** aria-label mặc định của thẻ <nav>. */
  label: string;
  /** aria-label nút trang trước. */
  previousPage: string;
  /** aria-label nút trang sau. */
  nextPage: string;
  /** Chữ hiện cạnh mũi tên trang trước (`showLabels`). */
  previous: string;
  /** Chữ hiện cạnh mũi tên trang sau (`showLabels`). */
  next: string;
  /** aria-label của nút số trang. */
  page: (page: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    pagination: PaginationMessages;
  }
}

export const paginationMessages: PaginationMessages = {
  label: "Phân trang",
  previousPage: "Trang trước",
  nextPage: "Trang sau",
  previous: "Trước",
  next: "Sau",
  page: (page) => `Trang ${page}`,
};

export const paginationMessagesEn: PaginationMessages = {
  label: "Pagination",
  previousPage: "Previous page",
  nextPage: "Next page",
  previous: "Previous",
  next: "Next",
  page: (page) => `Page ${page}`,
};
