/** Chuỗi giao diện có sẵn của Autocomplete. Đổi qua `messages.autocomplete` của YugenProvider. */
export interface AutocompleteMessages {
  /** Nội dung khi không có gợi ý nào khớp. */
  empty: string;
  /** aria-label của danh sách gợi ý. */
  listLabel: string;
  /** Chữ cạnh spinner khi đang tải gợi ý. */
  searching: string;
  /** Thông báo (aria-live) số gợi ý đang hiện. */
  count: (count: number) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    autocomplete: AutocompleteMessages;
  }
}

export const autocompleteMessages: AutocompleteMessages = {
  empty: "Không có gợi ý phù hợp",
  listLabel: "Gợi ý tìm kiếm",
  searching: "Đang tìm…",
  count: (count) => `${count} gợi ý`,
};

export const autocompleteMessagesEn: AutocompleteMessages = {
  empty: "No matching suggestions",
  listLabel: "Search suggestions",
  searching: "Searching…",
  count: (count) => (count === 1 ? "1 suggestion" : `${count} suggestions`),
};
