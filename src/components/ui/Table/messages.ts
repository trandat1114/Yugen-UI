/** Chuỗi giao diện có sẵn của Table. Đổi qua `messages.table` của YugenProvider. */
export interface TableMessages {
  /** aria-label của checkbox TableSelectionCell ở hàng tiêu đề. */
  selectAllRows: string;
  /** aria-label của checkbox TableSelectionCell ở từng hàng. */
  selectRow: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    table: TableMessages;
  }
}

export const tableMessages: TableMessages = {
  selectAllRows: "Chọn tất cả hàng",
  selectRow: "Chọn hàng",
};

export const tableMessagesEn: TableMessages = {
  selectAllRows: "Select all rows",
  selectRow: "Select row",
};
