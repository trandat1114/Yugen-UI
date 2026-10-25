/** Chuỗi giao diện có sẵn của DataGrid. Đổi qua `messages.dataGrid` của YugenProvider. */
export interface DataGridMessages {
  /** Tên ô chọn của từng hàng (và tiêu đề cột chọn khi chọn một hàng). */
  selectRow: string;
  /** Tên ô chọn tất cả ở hàng tiêu đề. */
  selectAll: string;
  /** Chữ ẩn sau tên cột đang sắp xếp. */
  sortAscending: string;
  sortDescending: string;
  /** Tên tay nắm đổi độ rộng cột (ghép trước tên cột). */
  resizeColumn: string;
  emptyTitle: string;
  emptyDescription: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    dataGrid: DataGridMessages;
  }
}

export const dataGridMessages: DataGridMessages = {
  selectRow: "Chọn hàng",
  selectAll: "Chọn tất cả hàng",
  sortAscending: "(tăng dần)",
  sortDescending: "(giảm dần)",
  resizeColumn: "Đổi độ rộng cột",
  emptyTitle: "Không có dữ liệu",
  emptyDescription: "Chưa có hàng nào để hiển thị.",
};
