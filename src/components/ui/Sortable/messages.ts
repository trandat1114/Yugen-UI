/**
 * Chuỗi có sẵn của Sortable. Đổi qua `messages.sortable` của YugenProvider. `{item}` = nhãn của mục, `{list}` = nhãn của
 * danh sách, `{position}` / `{total}` = vị trí (đếm từ 1) và số mục trong danh sách.
 */
export interface SortableMessages {
  /** Nhãn tay nắm khi mục không có `label`. */
  handle: string;
  /** Nhãn tay nắm của mục có `label`. */
  handleItem: string;
  /** Hướng dẫn dùng bàn phím, là mô tả (aria-describedby) của tay nắm. */
  instructions: string;
  lifted: string;
  moved: string;
  /** Mục vừa sang danh sách khác (SortableGroup). */
  movedTo: string;
  dropped: string;
  droppedIn: string;
  canceled: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    sortable: SortableMessages;
  }
}

export const sortableMessages: SortableMessages = {
  handle: "Sắp xếp lại",
  handleItem: "Sắp xếp lại {item}",
  instructions:
    "Nhấn Space hoặc Enter để nhấc mục lên, dùng phím mũi tên để di chuyển, Space hoặc Enter để thả, Esc để huỷ.",
  lifted: "Đã nhấc {item}, vị trí {position} trên {total}.",
  moved: "{item}: vị trí {position} trên {total}.",
  movedTo: "{item}: sang {list}, vị trí {position} trên {total}.",
  dropped: "Đã thả {item} ở vị trí {position} trên {total}.",
  droppedIn: "Đã thả {item} vào {list}, vị trí {position} trên {total}.",
  canceled: "Đã huỷ. {item} về lại vị trí {position} trên {total}.",
};

export const sortableMessagesEn: SortableMessages = {
  handle: "Reorder",
  handleItem: "Reorder {item}",
  instructions: "Press Space or Enter to pick up the item, arrow keys to move it, Space or Enter to drop it, Escape to cancel.",
  lifted: "Picked up {item}, position {position} of {total}.",
  moved: "{item}: position {position} of {total}.",
  movedTo: "{item}: moved to {list}, position {position} of {total}.",
  dropped: "Dropped {item} at position {position} of {total}.",
  droppedIn: "Dropped {item} in {list}, position {position} of {total}.",
  canceled: "Canceled. {item} is back at position {position} of {total}.",
};
