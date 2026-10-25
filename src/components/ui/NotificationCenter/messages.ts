/** Chuỗi giao diện có sẵn của NotificationCenter / NotificationPanel. Đổi qua `messages.notificationCenter` của YugenProvider. */
export interface NotificationCenterMessages {
  /** Tiêu đề bảng, tên nút chuông và tên danh sách (khi không truyền `title`). */
  title: string;
  /** Tên nút chuông khi còn thông báo chưa đọc. */
  triggerUnread: (title: string, unread: number) => string;
  /** Nhãn nút đóng bottom sheet. */
  close: string;
  markAllRead: string;
  /** Tên nhóm tab lọc. */
  filter: string;
  all: string;
  /** Tab "chưa đọc" (số lượng được nối thêm phía sau). */
  unread: string;
  /** Tiêu đề ErrorState khi tải lỗi. */
  loadError: string;
  emptyTitle: string;
  emptyDescription: string;
  emptyUnreadTitle: string;
  emptyUnreadDescription: string;
  /** Chữ ẩn nối sau tiêu đề mục chưa đọc, cho trình đọc màn hình. */
  unreadSuffix: string;
  /** Tooltip nút đánh dấu đã đọc. */
  markRead: string;
  /** Tên nút đánh dấu đã đọc của một mục. */
  markReadItem: (title: string) => string;
  /** Tooltip nút bỏ thông báo. */
  dismiss: string;
  /** Tên nút bỏ thông báo của một mục. */
  dismissItem: (title: string) => string;
  /** Đọc qua live region khi có một thông báo mới. */
  announceOne: (title: string) => string;
  /** Đọc qua live region khi có nhiều thông báo mới. */
  announceMany: (count: number) => string;
  justNow: string;
  minutesAgo: (minutes: number) => string;
  hoursAgo: (hours: number) => string;
  today: string;
  yesterday: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    notificationCenter: NotificationCenterMessages;
  }
}

export const notificationCenterMessages: NotificationCenterMessages = {
  title: "Thông báo",
  triggerUnread: (title, unread) => `${title}, ${unread} chưa đọc`,
  close: "Đóng",
  markAllRead: "Đánh dấu tất cả đã đọc",
  filter: "Lọc thông báo",
  all: "Tất cả",
  unread: "Chưa đọc",
  loadError: "Không tải được thông báo",
  emptyTitle: "Chưa có thông báo",
  emptyDescription: "Thông báo mới sẽ xuất hiện ở đây.",
  emptyUnreadTitle: "Bạn đã đọc hết",
  emptyUnreadDescription: "Không còn thông báo chưa đọc.",
  unreadSuffix: ", chưa đọc",
  markRead: "Đánh dấu đã đọc",
  markReadItem: (title) => `Đánh dấu đã đọc: ${title}`,
  dismiss: "Bỏ thông báo",
  dismissItem: (title) => `Bỏ thông báo: ${title}`,
  announceOne: (title) => `Thông báo mới: ${title}`,
  announceMany: (count) => `${count} thông báo mới`,
  justNow: "Vừa xong",
  minutesAgo: (minutes) => `${minutes} phút trước`,
  hoursAgo: (hours) => `${hours} giờ trước`,
  today: "Hôm nay",
  yesterday: "Hôm qua",
};

export const notificationCenterMessagesEn: NotificationCenterMessages = {
  title: "Notifications",
  triggerUnread: (title, unread) => `${title}, ${unread} unread`,
  close: "Close",
  markAllRead: "Mark all as read",
  filter: "Filter notifications",
  all: "All",
  unread: "Unread",
  loadError: "Couldn't load notifications",
  emptyTitle: "No notifications yet",
  emptyDescription: "New notifications will appear here.",
  emptyUnreadTitle: "You're all caught up",
  emptyUnreadDescription: "No unread notifications.",
  unreadSuffix: ", unread",
  markRead: "Mark as read",
  markReadItem: (title) => `Mark as read: ${title}`,
  dismiss: "Dismiss",
  dismissItem: (title) => `Dismiss: ${title}`,
  announceOne: (title) => `New notification: ${title}`,
  announceMany: (count) => (count === 1 ? "1 new notification" : `${count} new notifications`),
  justNow: "Just now",
  minutesAgo: (minutes) => (minutes === 1 ? "1 minute ago" : `${minutes} minutes ago`),
  hoursAgo: (hours) => (hours === 1 ? "1 hour ago" : `${hours} hours ago`),
  today: "Today",
  yesterday: "Yesterday",
};
