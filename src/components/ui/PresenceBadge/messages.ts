/**
 * Chuỗi giao diện có sẵn của PresenceBadge — tên trạng thái đọc cho trình đọc màn hình (Persona dùng chung).
 * Đổi qua `messages.presenceBadge` của YugenProvider.
 */
export interface PresenceBadgeMessages {
  available: string;
  away: string;
  busy: string;
  doNotDisturb: string;
  offline: string;
  /** Cũng được nối sau trạng thái chính (viết thường) khi bật `outOfOffice`. */
  outOfOffice: string;
  blocked: string;
  unknown: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    presenceBadge: PresenceBadgeMessages;
  }
}

export const presenceBadgeMessages: PresenceBadgeMessages = {
  available: "Có mặt",
  away: "Vắng mặt",
  busy: "Bận",
  doNotDisturb: "Không làm phiền",
  offline: "Ngoại tuyến",
  outOfOffice: "Không ở văn phòng",
  blocked: "Đã chặn",
  unknown: "Không xác định",
};
