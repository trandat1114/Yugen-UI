/** Yugen Labs · PromptInput — ô soạn prompt cho AI: tự giãn, đính kèm (nút, kéo thả, dán ảnh), kiểm tra tệp, Gửi / Dừng. */
import * as React from "react";
import {
  ArrowUpload20Regular,
  Attach20Regular,
  Code20Regular,
  Dismiss12Regular,
  Document20Regular,
  DocumentPdf20Regular,
  DocumentTable20Regular,
  DocumentText20Regular,
  ErrorCircle12Filled,
  FolderZip20Regular,
  Image20Regular,
  MusicNote220Regular,
  Send20Filled,
  Stop20Filled,
  Video20Regular,
} from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "../_internal/useIsomorphicLayoutEffect";
import { useAnnounce } from "../AriaLive/AriaLive";
import { Button } from "../Button/Button";
import { fieldControlClass } from "../Field/Field";

/* ================================================================ Tệp */

/** 512 B · 12 KB · 1,2 MB (dấu phẩy thập phân kiểu Việt Nam). */
export function formatFileSize(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let value = bytes;
  let u = 0;
  while (value >= 1024 && u < units.length - 1) {
    value /= 1024;
    u++;
  }
  const text = u === 0 || value >= 10 ? String(Math.round(value)) : value.toFixed(1).replace(".", ",").replace(/,0$/, "");
  return `${text} ${units[u]}`;
}

export type FileRejectionReason = "type" | "size" | "count" | "duplicate";

export interface FileRejection {
  file: File;
  reason: FileRejectionReason;
  message: string;
}

export interface ValidateFilesOptions {
  /** Như thuộc tính `accept` của input: ".pdf,image/*,text/plain". */
  accept?: string;
  /** Dung lượng tối đa mỗi tệp (byte). */
  maxSize?: number;
  /** Số tệp tối đa (tính cả tệp đã đính kèm). */
  maxFiles?: number;
  /** Tệp đã đính kèm. */
  existing?: File[];
}

function matchesAccept(file: File, accept?: string) {
  if (!accept) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return accept
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .some((rule) => {
      if (rule.startsWith(".")) return name.endsWith(rule);
      if (rule.endsWith("/*")) return type.startsWith(rule.slice(0, -1));
      return type === rule;
    });
}

const sameFile = (a: File, b: File) => a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

/** Lọc tệp theo accept / maxSize / maxFiles; tệp trùng bị bỏ. Hàm thuần — dùng lại được cho upload khác. */
export function validateFiles(incoming: File[], { accept, maxSize, maxFiles, existing = [] }: ValidateFilesOptions = {}) {
  const accepted: File[] = [];
  const rejected: FileRejection[] = [];
  for (const file of incoming) {
    if ([...existing, ...accepted].some((f) => sameFile(f, file))) {
      rejected.push({ file, reason: "duplicate", message: `“${file.name}” đã được đính kèm.` });
    } else if (!matchesAccept(file, accept)) {
      rejected.push({ file, reason: "type", message: `“${file.name}” không đúng định dạng cho phép.` });
    } else if (maxSize !== undefined && file.size > maxSize) {
      rejected.push({ file, reason: "size", message: `“${file.name}” vượt quá ${formatFileSize(maxSize)}.` });
    } else if (maxFiles !== undefined && existing.length + accepted.length >= maxFiles) {
      rejected.push({ file, reason: "count", message: `Chỉ đính kèm tối đa ${maxFiles} tệp.` });
    } else accepted.push(file);
  }
  return { accepted, rejected };
}

type IconComponent = React.ComponentType<{ className?: string }>;

function fileIcon(file: File): IconComponent {
  const type = file.type;
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "";
  if (type.startsWith("image/")) return Image20Regular;
  if (type.startsWith("video/")) return Video20Regular;
  if (type.startsWith("audio/")) return MusicNote220Regular;
  if (type === "application/pdf" || ext === "pdf") return DocumentPdf20Regular;
  if (["zip", "rar", "7z", "gz", "tar"].includes(ext)) return FolderZip20Regular;
  if (["csv", "xls", "xlsx", "ods"].includes(ext)) return DocumentTable20Regular;
  if (["js", "ts", "tsx", "jsx", "json", "py", "css", "html", "java", "go", "rs", "c", "cpp", "sh"].includes(ext)) return Code20Regular;
  if (type.startsWith("text/") || ["md", "txt", "doc", "docx", "rtf"].includes(ext)) return DocumentText20Regular;
  return Document20Regular;
}

const isImage = (file: File) => file.type.startsWith("image/");

/** URL xem trước cho ảnh: tạo trong effect (client), thu hồi khi tệp bị gỡ hoặc component unmount. */
function useFilePreviews(files: File[]) {
  const urls = React.useRef(new Map<File, string>());
  const [previews, setPreviews] = React.useState<ReadonlyMap<File, string>>(() => new Map());

  React.useEffect(() => {
    if (typeof URL === "undefined" || typeof URL.createObjectURL !== "function") return;
    const map = urls.current;
    let changed = false;
    map.forEach((url, file) => {
      if (!files.includes(file)) {
        URL.revokeObjectURL(url);
        map.delete(file);
        changed = true;
      }
    });
    files.forEach((file) => {
      if (isImage(file) && !map.has(file)) {
        map.set(file, URL.createObjectURL(file));
        changed = true;
      }
    });
    if (changed) setPreviews(new Map(map));
  }, [files]);

  React.useEffect(() => {
    const map = urls.current;
    return () => {
      map.forEach((url) => URL.revokeObjectURL?.(url));
      map.clear();
    };
  }, []);

  return previews;
}

/* ================================================================ PromptInput */

export interface PromptInputSubmit {
  text: string;
  files: File[];
}

export interface PromptInputProps
  extends Omit<React.FormHTMLAttributes<HTMLFormElement>, "onSubmit" | "onChange" | "defaultValue"> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Tệp đính kèm (controlled). */
  files?: File[];
  defaultFiles?: File[];
  onFilesChange?: (files: File[]) => void;
  /** Gửi: nội dung đã trim + tệp. Trả về `false` để giữ nguyên nội dung (vd. kiểm tra thất bại). */
  onSubmit: (payload: PromptInputSubmit) => void | boolean;
  /** Tệp bị từ chối (sai định dạng, quá lớn, quá số lượng, trùng). */
  onFilesRejected?: (rejections: FileRejection[]) => void;
  /** Model đang trả lời: chặn gửi; có onStop thì nút Gửi thành nút Dừng. */
  streaming?: boolean;
  onStop?: () => void;
  disabled?: boolean;
  placeholder?: string;
  /** Nhãn truy cập cho ô soạn. Mặc định "Nhập yêu cầu". */
  label?: string;
  /** Định dạng nhận, như `accept` của input file. */
  accept?: string;
  /** Số tệp tối đa. */
  maxFiles?: number;
  /** Dung lượng tối đa mỗi tệp (byte). */
  maxSize?: number;
  /** Cho phép đính kèm (nút, kéo thả, dán). Mặc định true. */
  allowAttachments?: boolean;
  /** Slot thanh công cụ sau nút đính kèm: chọn model (Dropdown), công cụ… */
  toolbar?: React.ReactNode;
  /** Số dòng tối đa trước khi cuộn. Mặc định 8. */
  maxRows?: number;
  /** Hiện gợi ý phím. */
  showHint?: boolean;
  sendLabel?: string;
  stopLabel?: string;
  textareaProps?: Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue" | "onChange">;
}

/** ref trỏ vào <textarea>. */
export const PromptInput = React.forwardRef<HTMLTextAreaElement, PromptInputProps>(
  (
    {
      value,
      defaultValue = "",
      onValueChange,
      files: filesProp,
      defaultFiles = [],
      onFilesChange,
      onSubmit,
      onFilesRejected,
      streaming = false,
      onStop,
      disabled = false,
      placeholder = "Hỏi bất cứ điều gì…",
      label = "Nhập yêu cầu",
      accept,
      maxFiles,
      maxSize,
      allowAttachments = true,
      toolbar,
      maxRows = 8,
      showHint = false,
      sendLabel = "Gửi",
      stopLabel = "Dừng phản hồi",
      textareaProps,
      className,
      ...props
    },
    ref,
  ) => {
    const textareaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const inputRef = React.useRef<HTMLInputElement>(null);
    const composing = React.useRef(false);
    const dragDepth = React.useRef(0);
    const errorId = React.useId();
    const hintId = React.useId();
    const listId = React.useId();
    const { announce } = useAnnounce();

    const [innerText, setInnerText] = React.useState(defaultValue);
    const text = value ?? innerText;
    const [innerFiles, setInnerFiles] = React.useState<File[]>(defaultFiles);
    const files = filesProp ?? innerFiles;
    const [errors, setErrors] = React.useState<string[]>([]);
    const [dragging, setDragging] = React.useState(false);
    const previews = useFilePreviews(files);

    const canSend = (text.trim().length > 0 || files.length > 0) && !disabled && !streaming;
    const canAttach = allowAttachments && !disabled && (maxFiles === undefined || files.length < maxFiles);

    const setText = (next: string) => {
      if (value === undefined) setInnerText(next);
      onValueChange?.(next);
    };
    const setFiles = (next: File[]) => {
      if (filesProp === undefined) setInnerFiles(next);
      onFilesChange?.(next);
    };

    const setRefs = React.useCallback(
      (node: HTMLTextAreaElement | null) => {
        textareaRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref],
    );

    // Tự giãn theo nội dung, tối đa maxRows dòng.
    useIsomorphicLayoutEffect(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = "auto";
      const style = window.getComputedStyle(el);
      const line = parseFloat(style.lineHeight) || parseFloat(style.fontSize) * 1.4 || 20;
      const padding = (parseFloat(style.paddingTop) || 0) + (parseFloat(style.paddingBottom) || 0);
      const max = line * maxRows + padding;
      el.style.height = `${Math.min(el.scrollHeight, max)}px`;
      el.style.overflowY = el.scrollHeight > max ? "auto" : "hidden";
    }, [text, maxRows]);

    const addFiles = (incoming: File[]) => {
      if (!allowAttachments || disabled || incoming.length === 0) return;
      const { accepted, rejected } = validateFiles(incoming, { accept, maxSize, maxFiles, existing: files });
      // Gộp các lỗi "quá số lượng" thành một câu.
      const messages = Array.from(new Set(rejected.map((r) => r.message)));
      setErrors(messages);
      if (rejected.length) onFilesRejected?.(rejected);
      if (accepted.length) {
        setFiles([...files, ...accepted]);
        announce(accepted.length === 1 ? `Đã đính kèm ${accepted[0].name}` : `Đã đính kèm ${accepted.length} tệp`);
      }
    };

    const removeFile = (file: File) => {
      setFiles(files.filter((f) => f !== file));
      setErrors([]);
      announce(`Đã gỡ ${file.name}`);
      textareaRef.current?.focus();
    };

    const submit = () => {
      if (!canSend) return;
      const result = onSubmit({ text: text.trim(), files });
      if (result === false) return;
      setText("");
      setFiles([]);
      setErrors([]);
      textareaRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      textareaProps?.onKeyDown?.(e);
      if (e.defaultPrevented || e.key !== "Enter" || e.shiftKey || e.altKey) return;
      // Bộ gõ (Telex/VNI, IME CJK) đang ghép chữ: Enter chỉ xác nhận chữ. keyCode 229 = Safari sau compositionend.
      if (composing.current || e.nativeEvent.isComposing || e.keyCode === 229) return;
      e.preventDefault();
      submit();
    };

    const hasFiles = (e: React.DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes("Files");

    const describedBy =
      cn(errors.length > 0 && errorId, showHint && hintId, files.length > 0 && listId, textareaProps?.["aria-describedby"]) || undefined;

    return (
      <form
        data-disabled={disabled || undefined}
        aria-busy={streaming || undefined}
        className={cn(fieldControlClass, "flex flex-col", className)}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
        onDragEnter={(e) => {
          if (!canAttach || !hasFiles(e)) return;
          e.preventDefault();
          dragDepth.current += 1;
          setDragging(true);
        }}
        onDragOver={(e) => {
          if (!canAttach || !hasFiles(e)) return;
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDragLeave={() => {
          dragDepth.current = Math.max(0, dragDepth.current - 1);
          if (dragDepth.current === 0) setDragging(false);
        }}
        onDrop={(e) => {
          if (!hasFiles(e)) return;
          e.preventDefault();
          dragDepth.current = 0;
          setDragging(false);
          addFiles(Array.from(e.dataTransfer.files));
        }}
        {...props}
      >
        {files.length > 0 && (
          <ul id={listId} aria-label="Tệp đính kèm" className="flex flex-wrap gap-1 px-2 pt-2">
            {files.map((file, i) => {
              const Icon = fileIcon(file);
              const preview = previews.get(file);
              return (
                <li
                  key={`${file.name}-${file.size}-${file.lastModified}-${i}`}
                  className="flex max-w-60 min-w-0 items-center gap-2 rounded-medium border border-stroke-2 bg-background-2 py-1 ps-1 pe-0.5"
                >
                  {preview ? (
                    <img src={preview} alt="" className="size-8 shrink-0 rounded-small object-cover" />
                  ) : (
                    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-small bg-background-4 text-foreground-2">
                      <Icon className="size-5" />
                    </span>
                  )}
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate text-caption1 font-semibold text-foreground-1" title={file.name}>
                      {file.name}
                    </span>
                    <span className="text-caption2 text-foreground-3 tabular-nums">{formatFileSize(file.size)}</span>
                  </span>
                  <Button
                    size="small"
                    appearance="subtle"
                    icon={<Dismiss12Regular />}
                    aria-label={`Gỡ ${file.name}`}
                    disabled={disabled}
                    onClick={() => removeFile(file)}
                    className="shrink-0"
                  />
                </li>
              );
            })}
          </ul>
        )}

        <textarea
          rows={1}
          {...textareaProps}
          ref={setRefs}
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          aria-label={textareaProps?.["aria-label"] ?? label}
          aria-describedby={describedBy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          onCompositionStart={(e) => {
            composing.current = true;
            textareaProps?.onCompositionStart?.(e);
          }}
          onCompositionEnd={(e) => {
            composing.current = false;
            textareaProps?.onCompositionEnd?.(e);
          }}
          onPaste={(e) => {
            textareaProps?.onPaste?.(e);
            const pasted = Array.from(e.clipboardData?.files ?? []);
            // Chỉ chặn dán khi clipboard chỉ có tệp (ảnh chụp màn hình…); có chữ thì dán chữ như thường.
            if (pasted.length && allowAttachments && !e.clipboardData.getData("text/plain")) {
              e.preventDefault();
              addFiles(pasted);
            }
          }}
          className={cn(
            "block w-full resize-none bg-transparent px-3 pt-2 pb-1 text-body1 text-foreground-1 outline-none",
            "placeholder:text-foreground-4 disabled:cursor-not-allowed disabled:text-foreground-disabled",
            textareaProps?.className,
          )}
        />

        {errors.length > 0 && (
          <div id={errorId} role="alert" className="flex items-start gap-1 px-3 pb-1 text-caption1 text-danger-foreground-1">
            <ErrorCircle12Filled aria-hidden className="mt-0.5 shrink-0" />
            <span className="min-w-0">{errors.join(" ")}</span>
          </div>
        )}

        <div className="flex items-center gap-1 px-1 pb-1">
          {allowAttachments && (
            <>
              <input
                ref={inputRef}
                type="file"
                hidden
                multiple={maxFiles !== 1}
                accept={accept}
                tabIndex={-1}
                onChange={(e) => {
                  addFiles(Array.from(e.target.files ?? []));
                  e.target.value = "";
                }}
              />
              <Button
                appearance="subtle"
                icon={<Attach20Regular />}
                aria-label="Đính kèm tệp"
                title="Đính kèm tệp"
                disabled={!canAttach}
                onClick={() => inputRef.current?.click()}
              />
            </>
          )}
          {toolbar && <div className="flex min-w-0 items-center gap-0.5">{toolbar}</div>}
          {showHint && (
            <span id={hintId} className="hidden min-w-0 truncate ps-1 text-caption1 text-foreground-3 sm:inline">
              Enter để gửi · Shift+Enter xuống dòng
            </span>
          )}
          <div className="ms-auto flex shrink-0 items-center gap-2">
            {streaming && onStop ? (
              <Button appearance="secondary" icon={<Stop20Filled />} aria-label={stopLabel} title={stopLabel} onClick={onStop} />
            ) : (
              <Button
                type="submit"
                appearance="primary"
                disabled={!canSend}
                icon={<Send20Filled className="rtl:-scale-x-100" />}
                aria-label={sendLabel}
                title={sendLabel}
              />
            )}
          </div>
        </div>

        {dragging && (
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center gap-2 rounded-medium border-2 border-dashed border-brand-stroke bg-brand-background-2 text-body1 font-semibold text-brand-foreground-2"
          >
            <ArrowUpload20Regular />
            Thả tệp để đính kèm
          </div>
        )}
      </form>
    );
  },
);
PromptInput.displayName = "PromptInput";
