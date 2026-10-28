// Danh mục trang trạng thái (#238): mã, hình minh hoạ và nội dung vi / en. Phòng thử Labs (StatusLab) và trang khái niệm
// "status-pages" đọc chung; component StatusPage sau này dựng trên cùng danh mục.

export type StatusId = "400" | "401" | "403" | "404" | "410" | "429" | "500" | "503" | "504" | "offline" | "update";

/**
 * Logo enso ở góc kể chuyện gì đã xảy ra: đủ hoa, không hoa, rụng một cánh (404), rụng hết (410), còn là nụ (401 / 403),
 * mực đứt giữa chừng (500), mực dừng và nhạt (504), chỉ còn vệt mờ (mất mạng).
 */
export type StatusArt = "bloom" | "plain" | "petal-fallen" | "petals-fallen" | "bud" | "broken" | "stopped" | "ghost";

/** Nét cọ ở giữa: đủ nét, đứt, dừng giữa chừng, chỉ còn vệt mờ, hoặc đầy dần theo thời gian chờ (429 / 503). */
export type StatusStroke = "full" | "broken" | "stopped" | "ghost" | "wait";

export interface StatusDef {
  id: StatusId;
  /** Mã HTTP; trạng thái của app (mất mạng, bản mới) không có mã. */
  code?: number;
  /** Chữ dọc thay cho mã: 圏外 (ngoài vùng phủ sóng, như trên điện thoại Nhật), 新版 (bản mới). */
  word?: string;
  art: StatusArt;
  stroke: StatusStroke;
  /** Thời gian chờ mô phỏng (ms): hết giờ thì nút Thử lại bật và hoa nở. */
  wait?: number;
}

export const STATUSES: StatusDef[] = [
  { id: "400", code: 400, art: "plain", stroke: "stopped" },
  { id: "401", code: 401, art: "bud", stroke: "full" },
  { id: "403", code: 403, art: "bud", stroke: "full" },
  { id: "404", code: 404, art: "petal-fallen", stroke: "full" },
  { id: "410", code: 410, art: "petals-fallen", stroke: "full" },
  { id: "429", code: 429, art: "bloom", stroke: "wait", wait: 6000 },
  { id: "500", code: 500, art: "broken", stroke: "broken" },
  { id: "503", code: 503, art: "bloom", stroke: "wait", wait: 10000 },
  { id: "504", code: 504, art: "stopped", stroke: "stopped" },
  { id: "offline", word: "圏外", art: "ghost", stroke: "ghost" },
  { id: "update", word: "新版", art: "bloom", stroke: "full" },
];

export interface StatusCopy {
  /** Dòng nhỏ phía trên tiêu đề: mã ở dạng chữ thường để đọc được (số dọc chỉ để trang trí). */
  eyebrow: string;
  title: string;
  description: string;
  primary: string;
  secondary?: string;
  /** Dòng phụ: trang gần giống, mã lỗi, tài khoản đang dùng, giờ dự kiến. */
  extra?: string;
  /** Khi nào dùng — cho bảng danh mục. */
  when: string;
}

export const STATUS_COPY: Record<"vi" | "en", Record<StatusId, StatusCopy>> = {
  vi: {
    "400": {
      eyebrow: "Lỗi 400",
      title: "Yêu cầu không hợp lệ",
      description: "Đường dẫn hoặc dữ liệu gửi lên không đúng dạng. Quay lại trang trước rồi thử lần nữa.",
      primary: "Quay lại",
      secondary: "Về trang chủ",
      when: "Tham số trong URL hoặc dữ liệu gửi lên sai dạng, người dùng không sửa được tại chỗ.",
    },
    "401": {
      eyebrow: "Lỗi 401",
      title: "Cần đăng nhập",
      description: "Trang này chỉ dành cho tài khoản đã đăng nhập. Đăng nhập xong bạn quay lại đúng trang này.",
      primary: "Đăng nhập",
      secondary: "Về trang chủ",
      when: "Chưa đăng nhập hoặc phiên đã hết hạn.",
    },
    "403": {
      eyebrow: "Lỗi 403",
      title: "Không có quyền truy cập",
      description: "Tài khoản bạn đang dùng không xem được trang này. Xin quyền từ quản trị viên hoặc đổi sang tài khoản khác.",
      primary: "Xin quyền truy cập",
      secondary: "Đổi tài khoản",
      extra: "Đang đăng nhập: an@example.com",
      when: "Đã đăng nhập nhưng thiếu quyền.",
    },
    "404": {
      eyebrow: "Lỗi 404",
      title: "Không tìm thấy trang",
      description: "Đường dẫn có thể bị gõ sai, hoặc trang đã đổi chỗ.",
      primary: "Tìm kiếm",
      secondary: "Về trang chủ",
      extra: "Gần giống: /components/button",
      when: "Không có trang ở đường dẫn này.",
    },
    "410": {
      eyebrow: "Lỗi 410",
      title: "Trang này đã bị gỡ",
      description: "Nội dung không còn nữa. Phần thay thế nằm ở trang mới.",
      primary: "Tới trang mới",
      secondary: "Về trang chủ",
      when: "Trang bị gỡ có chủ đích; biết chỗ thay thế thì dẫn tới đó.",
    },
    "429": {
      eyebrow: "Lỗi 429",
      title: "Bạn thao tác hơi nhanh",
      description: "Đợi một chút rồi thử lại. Nút Thử lại sẽ bật khi hết thời gian chờ.",
      primary: "Thử lại",
      secondary: "Về trang chủ",
      when: "Vượt giới hạn số yêu cầu; thời gian chờ lấy từ header Retry-After.",
    },
    "500": {
      eyebrow: "Lỗi 500",
      title: "Máy chủ gặp lỗi",
      description: "Lỗi không do bạn. Thử lại sau ít phút; nếu vẫn lỗi, gửi mã bên dưới cho chúng tôi.",
      primary: "Thử lại",
      secondary: "Sao chép mã lỗi",
      extra: "Mã lỗi: 7f3a-91c2",
      when: "Lỗi không lường trước ở máy chủ, kể cả 502 từ cổng trung gian.",
    },
    "503": {
      eyebrow: "Lỗi 503",
      title: "Đang bảo trì",
      description: "Hệ thống đang được nâng cấp, dự kiến xong lúc 14:30. Trang tự tải lại khi xong.",
      primary: "Tải lại",
      secondary: "Trang trạng thái",
      when: "Bảo trì có kế hoạch hoặc quá tải tạm thời; có Retry-After thì đếm ngược.",
    },
    "504": {
      eyebrow: "Lỗi 504",
      title: "Máy chủ phản hồi quá lâu",
      description: "Yêu cầu đã hết thời gian chờ. Mạng có thể đang chậm, hoặc máy chủ đang bận.",
      primary: "Thử lại",
      secondary: "Về trang chủ",
      when: "Hết thời gian chờ ở máy chủ (504) hoặc ở trình duyệt (408).",
    },
    offline: {
      eyebrow: "Ngoại tuyến",
      title: "Không có kết nối mạng",
      description: "Kiểm tra Wi-Fi hoặc dữ liệu di động. Trang tự tải lại khi có mạng.",
      primary: "Thử lại",
      when: "Trình duyệt mất mạng hoặc yêu cầu lỗi mạng; nghe sự kiện online để tự thử lại.",
    },
    update: {
      eyebrow: "Bản mới",
      title: "Đã có phiên bản mới",
      description: "Trang vừa được cập nhật nên phần bạn đang mở không còn trên máy chủ. Tải lại để dùng bản mới.",
      primary: "Tải lại",
      when: "Nạp file JS lỗi sau một lần deploy (tab mở từ trước, tên file đã đổi).",
    },
  },
  en: {
    "400": {
      eyebrow: "Error 400",
      title: "Bad request",
      description: "The link or the data sent isn't in the expected form. Go back and try again.",
      primary: "Go back",
      secondary: "Home",
      when: "URL parameters or submitted data are malformed and can't be fixed in place.",
    },
    "401": {
      eyebrow: "Error 401",
      title: "Sign in to continue",
      description: "This page is for signed-in accounts. After you sign in, you come back to this page.",
      primary: "Sign in",
      secondary: "Home",
      when: "Not signed in, or the session expired.",
    },
    "403": {
      eyebrow: "Error 403",
      title: "No access",
      description: "The account you're using can't view this page. Ask an admin for access or switch accounts.",
      primary: "Request access",
      secondary: "Switch account",
      extra: "Signed in as an@example.com",
      when: "Signed in, but without permission.",
    },
    "404": {
      eyebrow: "Error 404",
      title: "Page not found",
      description: "The link may be mistyped, or the page has moved.",
      primary: "Search",
      secondary: "Home",
      extra: "Similar: /components/button",
      when: "Nothing lives at this URL.",
    },
    "410": {
      eyebrow: "Error 410",
      title: "This page was removed",
      description: "This content is gone for good. Its replacement lives on a new page.",
      primary: "Go to the new page",
      secondary: "Home",
      when: "Removed on purpose; link to the replacement when there is one.",
    },
    "429": {
      eyebrow: "Error 429",
      title: "That was a bit fast",
      description: "Wait a moment, then try again. Retry turns on when the wait is over.",
      primary: "Retry",
      secondary: "Home",
      when: "Rate limit reached; take the wait from the Retry-After header.",
    },
    "500": {
      eyebrow: "Error 500",
      title: "Something went wrong on our side",
      description: "It's not something you did. Try again in a few minutes; if it keeps failing, send us the ID below.",
      primary: "Retry",
      secondary: "Copy error ID",
      extra: "Error ID: 7f3a-91c2",
      when: "An unexpected server error, including a 502 from a gateway.",
    },
    "503": {
      eyebrow: "Error 503",
      title: "Down for maintenance",
      description: "We're upgrading the system, expected back at 14:30. The page reloads on its own when it's done.",
      primary: "Reload",
      secondary: "Status page",
      when: "Planned maintenance or temporary overload; count down when there is a Retry-After.",
    },
    "504": {
      eyebrow: "Error 504",
      title: "The server took too long",
      description: "The request timed out. Your connection may be slow, or the server is busy.",
      primary: "Retry",
      secondary: "Home",
      when: "Timed out at the server (504) or in the browser (408).",
    },
    offline: {
      eyebrow: "Offline",
      title: "You're offline",
      description: "Check Wi-Fi or mobile data. The page reloads on its own when you're back online.",
      primary: "Retry",
      when: "The browser lost its connection or a request failed on the network; listen for the online event to retry.",
    },
    update: {
      eyebrow: "New version",
      title: "A new version is available",
      description: "The site was just updated, so the part you opened is no longer on the server. Reload to use the new version.",
      primary: "Reload",
      when: "A JS file fails to load after a deploy (a tab opened earlier, file names changed).",
    },
  },
};
