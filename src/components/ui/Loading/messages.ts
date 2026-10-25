/** Chuỗi giao diện có sẵn của LoadingOverlay. Đổi qua `messages.loadingOverlay` của YugenProvider. */
export interface LoadingOverlayMessages {
  /** Nhãn dưới Spinner, cũng là câu đọc cho trình đọc màn hình. */
  label: string;
  /** Câu đọc khi `label` không phải chuỗi. */
  announcement: string;
}

/** Chuỗi giao diện có sẵn của PageProgress. Đổi qua `messages.pageProgress` của YugenProvider. */
export interface PageProgressMessages {
  /** aria-label của progressbar. */
  label: string;
}

/** Chuỗi giao diện có sẵn của ErrorState. Đổi qua `messages.errorState` của YugenProvider. */
export interface ErrorStateMessages {
  title: string;
  description: string;
  /** Nút thử lại (khi có `onRetry`). */
  retry: string;
}

/** Chuỗi giao diện có sẵn của AsyncContent. Đổi qua `messages.asyncContent` của YugenProvider. */
export interface AsyncContentMessages {
  /** Câu đọc cho trình đọc màn hình khi khung xương hiện. */
  loading: string;
  /** Tiêu đề / mô tả của trạng thái rỗng mặc định. */
  emptyTitle: string;
  emptyDescription: string;
}

/** Chuỗi giao diện có sẵn của useOptimisticList (toast khi thất bại). Đổi qua `messages.optimisticList` của YugenProvider. */
export interface OptimisticListMessages {
  errorTitle: string;
  errorBody: string;
  /** Nút trong toast. */
  retry: string;
  /** Mô tả thay thế của nút (cho trình đọc màn hình). */
  retryAltText: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    loadingOverlay: LoadingOverlayMessages;
    pageProgress: PageProgressMessages;
    errorState: ErrorStateMessages;
    asyncContent: AsyncContentMessages;
    optimisticList: OptimisticListMessages;
  }
}

export const loadingOverlayMessages: LoadingOverlayMessages = { label: "Đang tải…", announcement: "Đang tải" };

export const loadingOverlayMessagesEn: LoadingOverlayMessages = { label: "Loading…", announcement: "Loading" };

export const pageProgressMessages: PageProgressMessages = { label: "Đang tải trang" };

export const pageProgressMessagesEn: PageProgressMessages = { label: "Loading page" };

export const errorStateMessages: ErrorStateMessages = {
  title: "Không tải được nội dung",
  description: "Đã có lỗi khi kết nối tới máy chủ. Kiểm tra mạng rồi thử lại.",
  retry: "Thử lại",
};

export const errorStateMessagesEn: ErrorStateMessages = {
  title: "Couldn't load content",
  description: "Something went wrong while connecting to the server. Check your connection and try again.",
  retry: "Retry",
};

export const asyncContentMessages: AsyncContentMessages = {
  loading: "Đang tải…",
  emptyTitle: "Chưa có dữ liệu",
  emptyDescription: "Khi có nội dung mới, chúng sẽ xuất hiện ở đây.",
};

export const asyncContentMessagesEn: AsyncContentMessages = {
  loading: "Loading…",
  emptyTitle: "No data yet",
  emptyDescription: "New content will appear here.",
};

export const optimisticListMessages: OptimisticListMessages = {
  errorTitle: "Không lưu được thay đổi",
  errorBody: "Thay đổi đã được hoàn tác.",
  retry: "Thử lại",
  retryAltText: "Thực hiện lại thao tác vừa rồi",
};

export const optimisticListMessagesEn: OptimisticListMessages = {
  errorTitle: "Couldn't save changes",
  errorBody: "Your changes were undone.",
  retry: "Retry",
  retryAltText: "Retry the last action",
};
