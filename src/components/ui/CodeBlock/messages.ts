/** Chuỗi giao diện có sẵn của CopyCodeButton. Đổi qua `messages.copyCodeButton` của YugenProvider. */
export interface CopyCodeButtonMessages {
  /** Chữ trên nút (showLabel). */
  copy: string;
  copied: string;
  /** Tên nút chỉ có icon. */
  copyLabel: string;
  copiedLabel: string;
  /** Đọc qua vùng status sau khi sao chép. */
  copiedStatus: string;
}

/** Chuỗi giao diện có sẵn của CodeBlock. Đổi qua `messages.codeBlock` của YugenProvider. */
export interface CodeBlockMessages {
  /** Tên nút bật / tắt xuống dòng. */
  wrap: string;
  /** Tooltip của nút khi đang tắt / đang bật xuống dòng. */
  wrapOn: string;
  wrapOff: string;
  /** Chữ ẩn trước dòng thêm / xoá trong diff. */
  added: string;
  removed: string;
  collapse: string;
  /** Nút mở rộng khối code bị thu gọn. */
  expand: (lines: number) => string;
}

/** Chuỗi giao diện có sẵn của CodeTabs. Đổi qua `messages.codeTabs` của YugenProvider. */
export interface CodeTabsMessages {
  /** Tên danh sách tab tệp. */
  files: string;
}

/** Chuỗi giao diện có sẵn của PackageManagerTabs. Đổi qua `messages.packageManagerTabs` của YugenProvider. */
export interface PackageManagerTabsMessages {
  /** Tên danh sách tab trình quản lý gói. */
  label: string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    copyCodeButton: CopyCodeButtonMessages;
    codeBlock: CodeBlockMessages;
    codeTabs: CodeTabsMessages;
    packageManagerTabs: PackageManagerTabsMessages;
  }
}

export const copyCodeButtonMessagesVi: CopyCodeButtonMessages = {
  copy: "Sao chép",
  copied: "Đã chép",
  copyLabel: "Sao chép code",
  copiedLabel: "Đã sao chép",
  copiedStatus: "Đã sao chép vào bộ nhớ tạm",
};

export const copyCodeButtonMessagesEn: CopyCodeButtonMessages = {
  copy: "Copy",
  copied: "Copied",
  copyLabel: "Copy code",
  copiedLabel: "Copied",
  copiedStatus: "Copied to clipboard",
};

export const codeBlockMessagesVi: CodeBlockMessages = {
  wrap: "Xuống dòng",
  wrapOn: "Bật xuống dòng",
  wrapOff: "Tắt xuống dòng",
  added: "Thêm:",
  removed: "Xoá:",
  collapse: "Thu gọn",
  expand: (lines) => `Xem thêm (${lines} dòng)`,
};

export const codeBlockMessagesEn: CodeBlockMessages = {
  wrap: "Word wrap",
  wrapOn: "Turn on word wrap",
  wrapOff: "Turn off word wrap",
  added: "Added:",
  removed: "Removed:",
  collapse: "Show less",
  expand: (lines) => `Show more (${lines} ${lines === 1 ? "line" : "lines"})`,
};

export const codeTabsMessagesVi: CodeTabsMessages = { files: "Tệp" };

export const codeTabsMessagesEn: CodeTabsMessages = { files: "Files" };

export const packageManagerTabsMessagesVi: PackageManagerTabsMessages = { label: "Trình quản lý gói" };

export const packageManagerTabsMessagesEn: PackageManagerTabsMessages = { label: "Package manager" };

/** @deprecated Use `copyCodeButtonMessagesVi` (Vietnamese) or `copyCodeButtonMessagesEn`. Will be removed in v1.0.0. */
export const copyCodeButtonMessages = copyCodeButtonMessagesVi;

/** @deprecated Use `codeBlockMessagesVi` (Vietnamese) or `codeBlockMessagesEn`. Will be removed in v1.0.0. */
export const codeBlockMessages = codeBlockMessagesVi;

/** @deprecated Use `codeTabsMessagesVi` (Vietnamese) or `codeTabsMessagesEn`. Will be removed in v1.0.0. */
export const codeTabsMessages = codeTabsMessagesVi;

/** @deprecated Use `packageManagerTabsMessagesVi` (Vietnamese) or `packageManagerTabsMessagesEn`. Will be removed in v1.0.0. */
export const packageManagerTabsMessages = packageManagerTabsMessagesVi;
