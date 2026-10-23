/** Chuỗi giao diện có sẵn của Trace. Đổi qua `messages.trace` của YugenProvider. */
export interface TraceMessages {
  /** Nhãn trạng thái — cùng tên với `TraceStatus`. */
  pending: string;
  running: string;
  success: string;
  error: string;
  skipped: string;
  cancelled: string;
  /** Tên vùng khi không có title (và không truyền `aria-label`). */
  label: string;
  /** Tiến độ ở phần đầu: số bước đã xong / tổng số bước. */
  steps: (done: number, total: number) => string;
  /** Tên danh sách tổng kết theo trạng thái. */
  summary: string;
  /** Chữ ẩn trước thời lượng, cho trình đọc màn hình. */
  duration: string;
  collapseAll: string;
  expandAll: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    trace: TraceMessages;
  }
}

export const traceMessages: TraceMessages = {
  pending: "Đang chờ",
  running: "Đang chạy",
  success: "Hoàn tất",
  error: "Lỗi",
  skipped: "Bỏ qua",
  cancelled: "Đã huỷ",
  label: "Tiến trình",
  steps: (done, total) => `${done}/${total} bước`,
  summary: "Tổng kết theo trạng thái",
  duration: "Thời lượng:",
  collapseAll: "Thu gọn tất cả",
  expandAll: "Mở rộng tất cả",
};

export const traceMessagesEn: TraceMessages = {
  pending: "Pending",
  running: "Running",
  success: "Completed",
  error: "Failed",
  skipped: "Skipped",
  cancelled: "Canceled",
  label: "Progress",
  steps: (done, total) => `${done}/${total} ${total === 1 ? "step" : "steps"}`,
  summary: "Summary by status",
  duration: "Duration:",
  collapseAll: "Collapse all",
  expandAll: "Expand all",
};
