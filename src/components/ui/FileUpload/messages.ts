/** Chuỗi giao diện có sẵn của FileUpload và FileUploadItem. Đổi qua `messages.fileUpload` của YugenProvider. */
export interface FileUploadMessages {
  /** Dòng chính của vùng thả: `dropzone` + nút chữ `browse` (in đậm, màu link). */
  dropzone: string;
  browse: string;
  /** Dòng chính khi đang kéo tệp vào vùng thả. */
  dropping: string;
  /** aria-label danh sách tệp đã chọn. */
  selectedFiles: string;
  /** Tên nhóm MIME trong mô tả định dạng (`image/*` → "ảnh"…). */
  typeImage: string;
  typeVideo: string;
  typeAudio: string;
  typeText: string;
  /** Phần mô tả tự sinh; `size` là dung lượng đã định dạng. */
  maxSizeHint: (size: string) => string;
  maxFilesHint: (count: number) => string;
  /** Lỗi từ chối tệp; `accepted` là danh sách định dạng, `size` là dung lượng đã định dạng. */
  invalidType: (name: string, accepted: string) => string;
  tooLarge: (name: string, size: string) => string;
  tooMany: (name: string, limit: number) => string;
  /** Khi không bật `multiple`. */
  onlyOne: (name: string) => string;
  /** Thông báo (aria-live) khi thêm / xoá tệp. */
  added: (name: string) => string;
  addedCount: (count: number) => string;
  removed: (name: string) => string;
  /** FileUploadItem. */
  uploadProgress: (name: string) => string;
  uploading: string;
  uploadingPercent: (percent: number) => string;
  uploaded: string;
  failed: string;
  retry: (name: string) => string;
  remove: (name: string) => string;
}

declare module "../YugenProvider/context" {
  interface YugenMessages {
    fileUpload: FileUploadMessages;
  }
}

export const fileUploadMessages: FileUploadMessages = {
  dropzone: "Kéo thả tệp vào đây hoặc",
  browse: "chọn tệp",
  dropping: "Thả tệp để tải lên",
  selectedFiles: "Tệp đã chọn",
  typeImage: "ảnh",
  typeVideo: "video",
  typeAudio: "âm thanh",
  typeText: "văn bản",
  maxSizeHint: (size) => `tối đa ${size} mỗi tệp`,
  maxFilesHint: (count) => `tối đa ${count} tệp`,
  invalidType: (name, accepted) => `"${name}" không đúng định dạng (chỉ nhận ${accepted}).`,
  tooLarge: (name, size) => `"${name}" vượt quá dung lượng tối đa ${size}.`,
  tooMany: (name, limit) => `Chỉ được chọn tối đa ${limit} tệp — đã bỏ qua "${name}".`,
  onlyOne: (name) => `Chỉ được chọn 1 tệp — đã bỏ qua "${name}".`,
  added: (name) => `Đã thêm tệp ${name}.`,
  addedCount: (count) => `Đã thêm ${count} tệp.`,
  removed: (name) => `Đã xoá tệp ${name}.`,
  uploadProgress: (name) => `Tiến trình tải lên ${name}`,
  uploading: "Đang tải lên…",
  uploadingPercent: (percent) => `Đang tải lên… ${percent}%`,
  uploaded: "Đã tải lên",
  failed: "Tải lên thất bại",
  retry: (name) => `Thử lại tải lên ${name}`,
  remove: (name) => `Xoá tệp ${name}`,
};
