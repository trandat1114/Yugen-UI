import * as React from "react";
import {
  ArrowClockwise16Regular,
  CheckmarkCircle12Filled,
  CloudArrowUp32Regular,
  Dismiss16Regular,
  Document24Regular,
  DocumentPdf24Regular,
  DocumentTable24Regular,
  ErrorCircle12Filled,
  FolderZip24Regular,
  Image24Regular,
  MusicNote224Regular,
  Video24Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { formatFileSize } from "../AIKit/PromptInput";
import { useAnnounce } from "../AriaLive/AriaLive";
import { Button } from "../Button/Button";
import { ProgressBar } from "../ProgressBar/ProgressBar";
import { useYugen, useYugenMessages } from "../YugenProvider/context";
import { fileUploadMessages, type FileUploadMessages } from "./messages";

export { fileUploadMessages, type FileUploadMessages } from "./messages";
export { fileUploadMessagesEn } from "./messages.en";

/* ------------------------------------------------------------------------------------------------
 * Tiện ích thuần
 * ---------------------------------------------------------------------------------------------- */

/** Trạng thái tải lên của một tệp. `idle` = mới chọn, chưa gửi đi. */
export type FileUploadStatus = "idle" | "uploading" | "done" | "error";

/** Một tệp trong danh sách. `file` có thể trống với tệp đã nằm trên server (chỉ còn tên, dung lượng, `previewUrl`). */
export interface FileUploadEntry {
  id: string;
  name: string;
  /** Dung lượng (byte). */
  size: number;
  /** MIME type, vd. `image/png`. */
  type?: string;
  file?: File;
  /** Ảnh xem trước có sẵn (tệp trên server). Tệp ảnh cục bộ tự tạo thumbnail bằng `URL.createObjectURL`. */
  previewUrl?: string;
  status?: FileUploadStatus;
  /** Tiến trình 0 → 1 khi `status="uploading"`; bỏ trống = không xác định. */
  progress?: number;
  /** Thông báo lỗi khi `status="error"`. */
  error?: string;
}

export type FileUploadRejectionCode = "file-invalid-type" | "file-too-large" | "too-many-files" | "custom";

export interface FileUploadRejection {
  file: File;
  code: FileUploadRejectionCode;
  /** Thông báo tiếng Việt hiển thị ngay dưới vùng thả. */
  message: string;
}

let entrySeq = 0;

/** Tạo `FileUploadEntry` từ `File` (id tự sinh khi gọi — chỉ gọi trong event / effect, không gọi lúc render). */
export function createFileEntry(file: File, init?: Partial<Omit<FileUploadEntry, "file">>): FileUploadEntry {
  entrySeq += 1;
  return { id: `yugen-file-${entrySeq}`, name: file.name, size: file.size, type: file.type || undefined, file, status: "idle", ...init };
}

function acceptTokens(accept?: string) {
  return (accept ?? "")
    .split(",")
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean);
}

/** `true` nếu tệp khớp chuỗi `accept` (đuôi `.pdf`, nhóm `image/*` hoặc MIME đầy đủ). */
export function isFileAccepted(file: Pick<File, "name" | "type">, accept?: string): boolean {
  const tokens = acceptTokens(accept);
  if (tokens.length === 0) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return tokens.some((token) =>
    token.startsWith(".") ? name.endsWith(token) : token.endsWith("/*") ? type.startsWith(token.slice(0, -1)) : type === token,
  );
}

const GROUP_KEY: Record<string, "typeImage" | "typeVideo" | "typeAudio" | "typeText"> = {
  image: "typeImage",
  video: "typeVideo",
  audio: "typeAudio",
  text: "typeText",
};

function describeAccept(accept: string | undefined, msg: FileUploadMessages) {
  const labels = acceptTokens(accept).map((token) => {
    if (token.startsWith(".")) return token.slice(1).toUpperCase();
    const [group, sub] = token.split("/");
    if (sub === "*") return group in GROUP_KEY ? msg[GROUP_KEY[group]] : group;
    return (sub ?? token).split(/[.+-]/).pop()!.toUpperCase();
  });
  return [...new Set(labels)].join(", ");
}

function typeIcon(name: string, type = "") {
  const ext = name.toLowerCase().split(".").pop() ?? "";
  if (type.startsWith("image/")) return Image24Regular;
  if (type.startsWith("video/")) return Video24Regular;
  if (type.startsWith("audio/")) return MusicNote224Regular;
  if (type === "application/pdf" || ext === "pdf") return DocumentPdf24Regular;
  if (/zip|rar|7z|tar|gzip/.test(type) || ["zip", "rar", "7z", "tar", "gz"].includes(ext)) return FolderZip24Regular;
  if (/sheet|excel|csv/.test(type) || ["xls", "xlsx", "csv", "ods"].includes(ext)) return DocumentTable24Regular;
  return Document24Regular;
}

/* ------------------------------------------------------------------------------------------------
 * FileUploadItem
 * ---------------------------------------------------------------------------------------------- */

export interface FileUploadItemProps extends Omit<React.LiHTMLAttributes<HTMLLIElement>, "children"> {
  name: string;
  /** Dung lượng (byte). */
  size: number;
  type?: string;
  /** Tệp cục bộ — dùng để tạo thumbnail khi là ảnh. */
  file?: File;
  previewUrl?: string;
  status?: FileUploadStatus;
  /** 0 → 1; bỏ trống khi đang tải = thanh không xác định. */
  progress?: number;
  error?: string;
  /** Hiện ảnh thu nhỏ cho tệp ảnh. Mặc định `true`. */
  showThumbnail?: boolean;
  disabled?: boolean;
  /** Có → hiện nút xoá (icon-only, aria-label theo `messages.fileUpload.remove`). */
  onRemove?: () => void;
  /** Có + `status="error"` → hiện nút Thử lại. */
  onRetry?: () => void;
}

/**
 * Một dòng tệp: icon theo loại (hoặc thumbnail), tên (cắt bớt, đủ tên ở `title`), dung lượng, tiến trình và trạng thái
 * bằng chữ (không chỉ bằng màu). Render `<li>` — đặt trong `<ul>`.
 */
export const FileUploadItem = React.forwardRef<HTMLLIElement, FileUploadItemProps>(
  (
    { name, size, type, file, previewUrl, status = "idle", progress, error, showThumbnail = true, disabled, onRemove, onRetry, className, ...props },
    ref,
  ) => {
    const msg = useYugenMessages("fileUpload", fileUploadMessages);
    const { locale } = useYugen();
    const [objectUrl, setObjectUrl] = React.useState<string>();
    const isImage = (type ?? file?.type ?? "").startsWith("image/");

    // Tạo URL trong effect (SSR an toàn) và thu hồi khi đổi tệp / gỡ item / unmount.
    React.useEffect(() => {
      if (!showThumbnail || !file || !isImage || previewUrl) return;
      if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
      const url = URL.createObjectURL(file);
      setObjectUrl(url);
      return () => {
        URL.revokeObjectURL(url);
        setObjectUrl(undefined);
      };
    }, [file, isImage, previewUrl, showThumbnail]);

    const thumbnail = showThumbnail && isImage ? (previewUrl ?? objectUrl) : undefined;
    const Icon = typeIcon(name, type ?? file?.type);
    const percent = progress === undefined ? undefined : Math.round(Math.min(Math.max(progress, 0), 1) * 100);

    return (
      <li
        ref={ref}
        data-status={status}
        className={cn(
          "flex items-center gap-3 rounded-medium border border-stroke-2 bg-background-1 p-2",
          status === "error" && "border-danger-background-3",
          className,
        )}
        {...props}
      >
        <span className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-medium bg-background-3 text-foreground-2">
          {thumbnail ? <img src={thumbnail} alt="" className="size-full object-cover" /> : <Icon aria-hidden className="size-6" />}
        </span>
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <div className="flex min-w-0 items-baseline gap-2">
            <span className="truncate text-body1 text-foreground-1" title={name}>
              {name}
            </span>
            <span className="shrink-0 text-caption1 text-foreground-3">{formatFileSize(size, locale)}</span>
          </div>
          {status === "uploading" && (
            <>
              <ProgressBar value={progress} max={1} aria-label={msg.uploadProgress(name)} />
              <span className="text-caption1 text-foreground-3">{percent === undefined ? msg.uploading : msg.uploadingPercent(percent)}</span>
            </>
          )}
          {status === "done" && (
            <span className="flex items-center gap-1 text-caption1 text-success-foreground-1">
              <CheckmarkCircle12Filled aria-hidden className="shrink-0" />
              <span className="text-foreground-3">{msg.uploaded}</span>
            </span>
          )}
          {status === "error" && (
            <span className="flex items-center gap-1 text-caption1 text-danger-foreground-1">
              <ErrorCircle12Filled aria-hidden className="shrink-0" />
              <span>{error ?? msg.failed}</span>
            </span>
          )}
        </div>
        {(onRetry || onRemove) && (
          <div className="flex shrink-0 items-center gap-0.5">
            {status === "error" && onRetry && (
              <Button appearance="subtle" size="small" icon={<ArrowClockwise16Regular />} aria-label={msg.retry(name)} disabled={disabled} onClick={onRetry} />
            )}
            {onRemove && (
              <Button appearance="subtle" size="small" icon={<Dismiss16Regular />} aria-label={msg.remove(name)} disabled={disabled} onClick={onRemove} />
            )}
          </div>
        )}
      </li>
    );
  },
);
FileUploadItem.displayName = "FileUploadItem";

/* ------------------------------------------------------------------------------------------------
 * FileUpload
 * ---------------------------------------------------------------------------------------------- */

export interface FileUploadChangeDetails {
  added: FileUploadEntry[];
  removed: FileUploadEntry[];
}

export interface FileUploadProps {
  /** id của `<input type="file">` — `<Field>` tự gắn để nhãn trỏ đúng control. */
  id?: string;
  /** Chuỗi `accept` như input gốc: `"image/*,.pdf"`. Tệp kéo thả cũng được kiểm tra theo chuỗi này. */
  accept?: string;
  /** Chọn nhiều tệp. Tắt → tệp mới thay tệp cũ. */
  multiple?: boolean;
  /** Tổng số tệp tối đa trong danh sách (chỉ áp dụng khi `multiple`). */
  maxFiles?: number;
  /** Dung lượng tối đa mỗi tệp (byte). */
  maxSize?: number;
  /** Kiểm tra riêng; trả về chuỗi lỗi để từ chối tệp. */
  validate?: (file: File) => string | null | undefined;
  /** Danh sách tệp (điều khiển). */
  files?: FileUploadEntry[];
  /** Danh sách ban đầu (không điều khiển). */
  defaultFiles?: FileUploadEntry[];
  /** Gọi khi thêm / xoá tệp, kèm `added` / `removed`. */
  onFilesChange?: (files: FileUploadEntry[], details: FileUploadChangeDetails) => void;
  /** Gọi khi có tệp bị từ chối (sai định dạng, quá dung lượng, quá số lượng, `validate`). */
  onReject?: (rejections: FileUploadRejection[]) => void;
  /** Bấm Thử lại trên tệp lỗi. */
  onRetry?: (entry: FileUploadEntry) => void;
  /** Cho dán tệp (Ctrl + V) khi vùng thả đang focus. */
  allowPaste?: boolean;
  /** Ảnh thu nhỏ cho tệp ảnh. Mặc định `true`. */
  showThumbnails?: boolean;
  disabled?: boolean;
  required?: boolean;
  /** Dòng chính trong vùng thả. Mặc định lấy từ `messages.fileUpload` ("Kéo thả tệp vào đây hoặc chọn tệp"). */
  label?: React.ReactNode;
  /** Dòng phụ. Mặc định tự sinh từ `accept` / `maxSize` / `maxFiles`. */
  description?: React.ReactNode;
  className?: string;
  dropzoneClassName?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
}

function assignRef<T>(ref: React.ForwardedRef<T>, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

/**
 * Vùng kéo thả + danh sách tệp (tương đương FileUpload / Dropzone). Dùng `<input type="file">` thật (ẩn trực quan) nên
 * bàn phím, nhãn của `<Field>` và trình đọc màn hình hoạt động sẵn. Tự kiểm tra `accept` / `maxSize` / `maxFiles`, báo lỗi
 * (theo `messages.fileUpload`) ngay dưới vùng thả và đọc "Đã thêm / Đã xoá tệp" qua live region polite. `ref` trỏ tới `<input>`.
 */
export const FileUpload = React.forwardRef<HTMLInputElement, FileUploadProps>(
  (
    {
      id,
      accept,
      multiple = false,
      maxFiles,
      maxSize,
      validate,
      files,
      defaultFiles,
      onFilesChange,
      onReject,
      onRetry,
      allowPaste = false,
      showThumbnails = true,
      disabled,
      required,
      label,
      description,
      className,
      dropzoneClassName,
      "aria-label": ariaLabel,
      "aria-labelledby": ariaLabelledBy,
      "aria-describedby": ariaDescribedBy,
      "aria-invalid": ariaInvalid,
    },
    ref,
  ) => {
    const autoId = React.useId();
    const inputId = id ?? `${autoId}-input`;
    const titleId = `${autoId}-title`;
    const descriptionId = `${autoId}-description`;
    const errorsId = `${autoId}-errors`;
    const inputRef = React.useRef<HTMLInputElement | null>(null);
    const dragDepth = React.useRef(0);
    const { announce } = useAnnounce();
    const msg = useYugenMessages("fileUpload", fileUploadMessages);
    const { locale } = useYugen();

    const [innerFiles, setInnerFiles] = React.useState<FileUploadEntry[]>(defaultFiles ?? []);
    const controlled = files !== undefined;
    const list = controlled ? files : innerFiles;
    const [rejections, setRejections] = React.useState<FileUploadRejection[]>([]);
    const [dragging, setDragging] = React.useState(false);

    const commit = (next: FileUploadEntry[], details: FileUploadChangeDetails) => {
      if (!controlled) setInnerFiles(next);
      onFilesChange?.(next, details);
    };

    const addFiles = (incoming: File[]) => {
      if (disabled || incoming.length === 0) return;
      const limit = multiple ? (maxFiles ?? Infinity) : 1;
      const kept = multiple ? list : [];
      const accepted: FileUploadEntry[] = [];
      const rejected: FileUploadRejection[] = [];
      for (const file of incoming) {
        const custom = validate?.(file);
        if (!isFileAccepted(file, accept)) {
          rejected.push({ file, code: "file-invalid-type", message: msg.invalidType(file.name, describeAccept(accept, msg)) });
        } else if (maxSize !== undefined && file.size > maxSize) {
          rejected.push({ file, code: "file-too-large", message: msg.tooLarge(file.name, formatFileSize(maxSize, locale)) });
        } else if (custom) {
          rejected.push({ file, code: "custom", message: custom });
        } else if (kept.length + accepted.length >= limit) {
          rejected.push({
            file,
            code: "too-many-files",
            message: multiple ? msg.tooMany(file.name, limit) : msg.onlyOne(file.name),
          });
        } else {
          accepted.push(createFileEntry(file));
        }
      }
      setRejections(rejected);
      if (rejected.length) onReject?.(rejected);
      if (accepted.length === 0) return;
      const removed = multiple ? [] : list;
      commit([...kept, ...accepted], { added: accepted, removed });
      announce(accepted.length === 1 ? msg.added(accepted[0].name) : msg.addedCount(accepted.length));
    };

    const removeEntry = (entry: FileUploadEntry) => {
      commit(
        list.filter((item) => item.id !== entry.id),
        { added: [], removed: [entry] },
      );
      announce(msg.removed(entry.name));
      // Nút xoá biến mất cùng item → trả focus về vùng thả để không rơi về <body>.
      inputRef.current?.focus();
    };

    const openDialog = () => {
      if (!disabled) inputRef.current?.click();
    };

    const handlePaste = (event: React.ClipboardEvent) => {
      const pasted = Array.from(event.clipboardData?.files ?? []);
      if (pasted.length === 0) return;
      event.preventDefault();
      addFiles(pasted);
    };

    const hasFiles = (event: React.DragEvent) => Array.from(event.dataTransfer?.types ?? []).includes("Files");

    const autoDescription = [
      describeAccept(accept, msg),
      maxSize !== undefined && msg.maxSizeHint(formatFileSize(maxSize, locale)),
      multiple && maxFiles !== undefined && msg.maxFilesHint(maxFiles),
    ]
      .filter(Boolean)
      .join(" · ");
    const descriptionContent = description ?? (autoDescription || undefined);
    const invalid = !!ariaInvalid || rejections.length > 0;

    return (
      <div className={cn("flex min-w-0 flex-col gap-2", className)} onPaste={allowPaste ? handlePaste : undefined}>
        <label
          htmlFor={inputId}
          data-dragging={dragging || undefined}
          data-invalid={invalid || undefined}
          data-disabled={disabled || undefined}
          className={cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xlarge border border-dashed border-stroke-accessible bg-background-1 px-4 py-5 text-center",
            "transition-[background-color,border-color] duration-faster ease-easy-ease hover:border-brand-stroke hover:bg-background-1-hover",
            "has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-stroke-focus",
            "data-invalid:border-danger-background-3",
            "data-dragging:border-solid data-dragging:border-brand-stroke data-dragging:bg-brand-background-2",
            "data-disabled:cursor-not-allowed data-disabled:border-stroke-disabled data-disabled:bg-background-disabled data-disabled:text-foreground-disabled",
            dropzoneClassName,
          )}
          onDragEnter={(event) => {
            if (disabled || !hasFiles(event)) return;
            event.preventDefault();
            dragDepth.current += 1;
            setDragging(true);
          }}
          onDragOver={(event) => {
            if (disabled || !hasFiles(event)) return;
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragging(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            dragDepth.current = 0;
            setDragging(false);
            addFiles(Array.from(event.dataTransfer?.files ?? []));
          }}
        >
          <input
            ref={(node) => {
              inputRef.current = node;
              assignRef(ref, node);
            }}
            id={inputId}
            type="file"
            className="sr-only"
            accept={accept}
            multiple={multiple}
            disabled={disabled}
            aria-required={required || undefined}
            aria-invalid={invalid || undefined}
            aria-label={ariaLabel}
            aria-labelledby={ariaLabel ? undefined : (ariaLabelledBy ?? titleId)}
            aria-describedby={cn(ariaDescribedBy, descriptionContent !== undefined && descriptionId, rejections.length > 0 && errorsId) || undefined}
            onChange={(event) => {
              addFiles(Array.from(event.target.files ?? []));
              // Cho phép chọn lại đúng tệp vừa xoá.
              event.target.value = "";
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDialog();
              }
            }}
          />
          <CloudArrowUp32Regular aria-hidden className={cn("size-8", disabled ? "text-foreground-disabled" : "text-brand-foreground-1")} />
          <span id={titleId} className={cn("text-body1", !disabled && "text-foreground-1")}>
            {dragging ? (
              <span className="font-semibold">{msg.dropping}</span>
            ) : (
              (label ?? (
                <>
                  {msg.dropzone} <span className={cn("font-semibold", !disabled && "text-link")}>{msg.browse}</span>
                </>
              ))
            )}
          </span>
          {descriptionContent !== undefined && (
            <span id={descriptionId} className={cn("text-caption1", !disabled && "text-foreground-3")}>
              {descriptionContent}
            </span>
          )}
        </label>

        {rejections.length > 0 && (
          <ul id={errorsId} role="alert" className="flex flex-col gap-0.5">
            {rejections.map((rejection, index) => (
              <li key={`${rejection.file.name}-${index}`} className="flex items-start gap-1 text-caption1 text-danger-foreground-1">
                <ErrorCircle12Filled aria-hidden className="mt-0.5 shrink-0" />
                <span>{rejection.message}</span>
              </li>
            ))}
          </ul>
        )}

        {list.length > 0 && (
          <ul aria-label={msg.selectedFiles} className="flex flex-col gap-2">
            {list.map((entry) => (
              <FileUploadItem
                key={entry.id}
                name={entry.name}
                size={entry.size}
                type={entry.type}
                file={entry.file}
                previewUrl={entry.previewUrl}
                status={entry.status}
                progress={entry.progress}
                error={entry.error}
                showThumbnail={showThumbnails}
                disabled={disabled}
                onRemove={() => removeEntry(entry)}
                onRetry={onRetry ? () => onRetry(entry) : undefined}
              />
            ))}
          </ul>
        )}
      </div>
    );
  },
);
FileUpload.displayName = "FileUpload";
