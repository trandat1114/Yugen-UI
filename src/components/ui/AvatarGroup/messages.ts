/** Chuỗi giao diện có sẵn của AvatarGroup. Đổi qua `messages.avatarGroup` của YugenProvider. */
export interface AvatarGroupMessages {
  /** aria-label danh sách thành viên trong popover. */
  list: string;
  /** Tên nút ở dạng pie (mở danh sách đầy đủ). */
  viewAll: (count: number) => string;
  /** Tên nút tràn "+N" / "…". */
  viewMore: (count: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    avatarGroup: AvatarGroupMessages;
  }
}

export const avatarGroupMessages: AvatarGroupMessages = {
  list: "Danh sách thành viên",
  viewAll: (count) => `Xem ${count} thành viên`,
  viewMore: (count) => `Xem thêm ${count} thành viên`,
};
