/** Chuỗi giao diện có sẵn của StatusPage và ErrorBoundary. Đổi qua `messages.statusPage` của YugenProvider. */
export interface StatusPageMessages {
  /** Dòng nhỏ trên tiêu đề, đọc được mã trạng thái. */
  eyebrow: (code: number) => string;
  /** Tiêu đề và mô tả mặc định theo `status`. */
  badRequestTitle: string;
  badRequestDescription: string;
  unauthorizedTitle: string;
  unauthorizedDescription: string;
  forbiddenTitle: string;
  forbiddenDescription: string;
  notFoundTitle: string;
  notFoundDescription: string;
  goneTitle: string;
  goneDescription: string;
  tooManyRequestsTitle: string;
  tooManyRequestsDescription: string;
  serverErrorTitle: string;
  serverErrorDescription: string;
  unavailableTitle: string;
  unavailableDescription: string;
  timeoutTitle: string;
  timeoutDescription: string;
  offlineTitle: string;
  offlineDescription: string;
  updateTitle: string;
  updateDescription: string;
  /** Nhãn trước mã lỗi (`errorId`). */
  errorId: string;
  /** Nút chép mã lỗi và thông báo sau khi chép. */
  copyErrorId: string;
  copied: string;
  /** Nút của ErrorBoundary: thử render lại / tải lại trang (lỗi nạp file sau khi deploy). */
  retry: string;
  reload: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    statusPage: StatusPageMessages;
  }
}

export const statusPageMessagesVi: StatusPageMessages = {
  eyebrow: (code) => `Lỗi ${code}`,
  badRequestTitle: "Yêu cầu không hợp lệ",
  badRequestDescription: "Đường dẫn hoặc dữ liệu gửi lên không đúng dạng. Quay lại trang trước rồi thử lần nữa.",
  unauthorizedTitle: "Cần đăng nhập",
  unauthorizedDescription: "Trang này chỉ dành cho tài khoản đã đăng nhập.",
  forbiddenTitle: "Không có quyền truy cập",
  forbiddenDescription: "Tài khoản bạn đang dùng không xem được trang này. Xin quyền từ quản trị viên hoặc đổi sang tài khoản khác.",
  notFoundTitle: "Không tìm thấy trang",
  notFoundDescription: "Đường dẫn có thể bị gõ sai, hoặc trang đã đổi chỗ.",
  goneTitle: "Trang này đã bị gỡ",
  goneDescription: "Nội dung này không còn nữa.",
  tooManyRequestsTitle: "Bạn thao tác hơi nhanh",
  tooManyRequestsDescription: "Đợi một chút rồi thử lại.",
  serverErrorTitle: "Máy chủ gặp lỗi",
  serverErrorDescription: "Lỗi không do bạn. Thử lại sau ít phút; nếu vẫn lỗi, gửi mã lỗi cho chúng tôi.",
  unavailableTitle: "Đang bảo trì",
  unavailableDescription: "Hệ thống đang được nâng cấp hoặc tạm quá tải. Quay lại sau ít phút.",
  timeoutTitle: "Máy chủ phản hồi quá lâu",
  timeoutDescription: "Yêu cầu đã hết thời gian chờ. Mạng có thể đang chậm, hoặc máy chủ đang bận.",
  offlineTitle: "Không có kết nối mạng",
  offlineDescription: "Kiểm tra Wi-Fi hoặc dữ liệu di động rồi thử lại.",
  updateTitle: "Đã có phiên bản mới",
  updateDescription: "Trang vừa được cập nhật nên phần bạn đang mở không còn trên máy chủ. Tải lại để dùng bản mới.",
  errorId: "Mã lỗi",
  copyErrorId: "Sao chép mã lỗi",
  copied: "Đã sao chép",
  retry: "Thử lại",
  reload: "Tải lại",
};

export const statusPageMessagesEn: StatusPageMessages = {
  eyebrow: (code) => `Error ${code}`,
  badRequestTitle: "Bad request",
  badRequestDescription: "The link or the data sent isn't in the expected form. Go back and try again.",
  unauthorizedTitle: "Sign in to continue",
  unauthorizedDescription: "This page is for signed-in accounts.",
  forbiddenTitle: "No access",
  forbiddenDescription: "The account you're using can't view this page. Ask an admin for access or switch accounts.",
  notFoundTitle: "Page not found",
  notFoundDescription: "The link may be mistyped, or the page has moved.",
  goneTitle: "This page was removed",
  goneDescription: "This content is no longer available.",
  tooManyRequestsTitle: "Slow down a little",
  tooManyRequestsDescription: "Wait a moment, then try again.",
  serverErrorTitle: "Something went wrong on our side",
  serverErrorDescription: "It's not you. Try again in a few minutes; if it keeps failing, send us the error ID.",
  unavailableTitle: "Down for maintenance",
  unavailableDescription: "We're upgrading or under heavy load. Check back in a few minutes.",
  timeoutTitle: "The server took too long",
  timeoutDescription: "The request timed out. The network may be slow, or the server is busy.",
  offlineTitle: "You're offline",
  offlineDescription: "Check your Wi-Fi or mobile data, then try again.",
  updateTitle: "A new version is available",
  updateDescription: "This site was just updated, so the part you have open is no longer on the server. Reload to get the new version.",
  errorId: "Error ID",
  copyErrorId: "Copy error ID",
  copied: "Copied",
  retry: "Try again",
  reload: "Reload",
};
