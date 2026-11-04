import * as React from "react";
import { ArrowClockwise20Regular, ArrowSync24Regular, Checkmark16Regular, Copy16Regular, WifiOff48Regular } from "../_internal/icons";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button/Button";
import { useClipboard } from "../hooks/useClipboard";
import { useYugenMessages, useComponentDefaults } from "../YugenProvider/context";
import { statusPageMessagesEn, type StatusPageMessages } from "./messages";

export { statusPageMessagesVi, statusPageMessagesEn, type StatusPageMessages } from "./messages";

/** Mã HTTP hoặc trạng thái của app: mất mạng, có bản mới (nạp file JS lỗi sau khi deploy). */
export type StatusPageStatus = 400 | 401 | 403 | 404 | 408 | 410 | 429 | 500 | 502 | 503 | 504 | "offline" | "update";

type CopyKey = "badRequest" | "unauthorized" | "forbidden" | "notFound" | "gone" | "tooManyRequests" | "serverError" | "unavailable" | "timeout" | "offline" | "update";

const COPY: Record<StatusPageStatus, CopyKey> = {
  400: "badRequest",
  401: "unauthorized",
  403: "forbidden",
  404: "notFound",
  408: "timeout",
  410: "gone",
  429: "tooManyRequests",
  500: "serverError",
  502: "serverError",
  503: "unavailable",
  504: "timeout",
  offline: "offline",
  update: "update",
};

/** Tiêu đề và mô tả có sẵn của một trạng thái (theo `messages.statusPage`). */
export function statusPageCopy(status: StatusPageStatus, messages: StatusPageMessages = statusPageMessagesEn) {
  const key = COPY[status];
  return { title: messages[`${key}Title`], description: messages[`${key}Description`] };
}

const ICON: Partial<Record<StatusPageStatus, React.ReactNode>> = {
  offline: <WifiOff48Regular />,
  update: <ArrowSync24Regular />,
};

export interface StatusPageProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  /** Trạng thái: chọn tiêu đề, mô tả và mã hiển thị có sẵn. */
  status?: StatusPageStatus;
  /** Mã hiển thị lớn; mặc định là mã HTTP của `status` (offline / update không có). `null` để ẩn. */
  code?: React.ReactNode;
  /** Mặc định theo `status` từ `messages.statusPage`. */
  title?: React.ReactNode;
  /** Mặc định theo `status`; `null` để ẩn. */
  description?: React.ReactNode;
  /** Hành động chính (Button, link). */
  primaryAction?: React.ReactNode;
  /** Hành động phụ. */
  secondaryAction?: React.ReactNode;
  /** Hình minh hoạ thay cho mã / icon có sẵn. */
  illustration?: React.ReactNode;
  /** Mã lỗi để người dùng gửi cho bộ phận hỗ trợ: hiện dạng chữ chọn được, kèm nút chép. */
  errorId?: string;
  /** Thẻ của tiêu đề. Mặc định h1 (trang lỗi là cả trang); h2 khi đặt trong một vùng đã có h1. */
  headingAs?: "h1" | "h2";
  /** Focus vào tiêu đề khi hiện (chuyển trang phía client), để trình đọc màn hình đọc ngay trạng thái. */
  autoFocus?: boolean;
  /** Cao tối thiểu bằng màn hình (trang lỗi đứng một mình, không có khung app). */
  fullscreen?: boolean;
}

/**
 * StatusPage: trang trạng thái cho lỗi HTTP (404, 500, 503…) và trạng thái của app (mất mạng, có bản mới). Tiêu đề nói
 * chuyện gì xảy ra, mô tả nói làm gì tiếp, kèm hành động và mã lỗi chép được. Không tự điều hướng: truyền link / nút
 * của router vào `primaryAction` / `secondaryAction`.
 */
export function StatusPage(inProps: StatusPageProps & { ref?: React.Ref<HTMLDivElement> }) {
  const {
    status,
    code: codeProp,
    title: titleProp,
    description: descriptionProp,
    primaryAction,
    secondaryAction,
    illustration,
    errorId,
    headingAs: Heading = "h1",
    autoFocus = false,
    fullscreen = false,
    className,
    children,
    ref,
    ...props
  } = useComponentDefaults("StatusPage", inProps);
  const msg = useYugenMessages("statusPage", statusPageMessagesEn);
  const copy = status !== undefined ? statusPageCopy(status, msg) : undefined;
  const title = titleProp ?? copy?.title;
  const description = descriptionProp === undefined ? copy?.description : descriptionProp;
  const numeric = typeof status === "number" ? status : undefined;
  const code = codeProp === undefined ? numeric : codeProp;
  const headingId = React.useId();
  const headingRef = React.useRef<HTMLHeadingElement>(null);
  const { copy: copyId, copied } = useClipboard();

  React.useEffect(() => {
    if (autoFocus) headingRef.current?.focus();
  }, [autoFocus]);

  const art = illustration ?? (code === undefined || code === null ? (status !== undefined ? ICON[status] : undefined) : undefined);

  return (
    <div
      ref={ref}
      aria-labelledby={headingId}
      className={cn(
        "flex flex-col items-center justify-center px-4 py-12 text-center",
        fullscreen ? "min-h-dvh" : "min-h-80",
        className,
      )}
      {...props}
    >
      {art && <div className="mb-6 flex text-foreground-3 [&_svg]:size-12">{art}</div>}
      {code !== undefined && code !== null && !illustration && (
        <p aria-hidden className="mb-2 text-display leading-none font-semibold tracking-tight text-foreground-3 tabular-nums">
          {code}
        </p>
      )}
      {numeric !== undefined && <p className="mb-1 text-caption1 tracking-wide text-foreground-3 uppercase">{msg.eyebrow(numeric)}</p>}
      <Heading
        ref={headingRef}
        id={headingId}
        tabIndex={autoFocus ? -1 : undefined}
        className="max-w-xl text-title3 font-semibold text-balance text-foreground-1"
      >
        {title}
      </Heading>
      {description !== null && description !== undefined && (
        <p className="mt-2 max-w-prose text-body1 text-pretty text-foreground-2">{description}</p>
      )}
      {children && <div className="mt-4 flex w-full max-w-md flex-col items-center gap-2">{children}</div>}
      {(primaryAction || secondaryAction) && (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {primaryAction}
          {secondaryAction}
        </div>
      )}
      {errorId && (
        <div className="mt-6 flex items-center gap-1 text-caption1 text-foreground-3">
          <span>{msg.errorId}:</span>
          <code className="rounded-small bg-background-3 px-1 font-mono text-foreground-2 select-all">{errorId}</code>
          <Button
            size="small"
            appearance="subtle"
            icon={copied ? <Checkmark16Regular /> : <Copy16Regular />}
            aria-label={msg.copyErrorId}
            title={msg.copyErrorId}
            onClick={() => void copyId(errorId)}
          />
          <span aria-live="polite" className="sr-only">
            {copied ? msg.copied : ""}
          </span>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ ErrorBoundary */

/**
 * Lỗi nạp file JS (`import()` lười) — thường do tab mở từ trước một lần deploy: tên file đã đổi trên máy chủ. Tải lại
 * trang là đủ, khác với lỗi render (thử lại).
 */
export function isChunkLoadError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  return (
    error.name === "ChunkLoadError" ||
    /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Unable to preload CSS|Loading (CSS )?chunk [\w-]+ failed/i.test(
      error.message,
    )
  );
}

export interface ErrorBoundaryFallbackProps {
  error: unknown;
  /** Bỏ lỗi và render lại `children`. */
  reset: () => void;
}

export interface ErrorBoundaryProps {
  children?: React.ReactNode;
  /** Hiện khi có lỗi. Mặc định: StatusPage "update" (lỗi nạp file, nút Tải lại) hoặc 500 (nút Thử lại). */
  fallback?: React.ReactNode | ((props: ErrorBoundaryFallbackProps) => React.ReactNode);
  /** Gọi khi bắt được lỗi — gửi lên dịch vụ theo dõi lỗi ở đây. */
  onError?: (error: unknown, info: React.ErrorInfo) => void;
  /** Đổi một giá trị trong mảng (vd. đường dẫn hiện tại) thì bỏ lỗi và render lại. */
  resetKeys?: unknown[];
  /** Truyền cho StatusPage mặc định (vd. `fullscreen` khi bọc cả app). */
  statusPageProps?: Omit<StatusPageProps, "status" | "primaryAction">;
}

interface ErrorBoundaryState {
  error: unknown;
  failed: boolean;
}

const changed = (a: unknown[] = [], b: unknown[] = []) => a.length !== b.length || a.some((v, i) => !Object.is(v, b[i]));

function DefaultFallback({ error, reset, statusPageProps }: ErrorBoundaryFallbackProps & Pick<ErrorBoundaryProps, "statusPageProps">) {
  const msg = useYugenMessages("statusPage", statusPageMessagesEn);
  const chunk = isChunkLoadError(error);
  return (
    <StatusPage
      role="alert"
      {...statusPageProps}
      status={chunk ? "update" : 500}
      primaryAction={
        <Button appearance="primary" icon={<ArrowClockwise20Regular />} onClick={chunk ? () => window.location.reload() : reset}>
          {chunk ? msg.reload : msg.retry}
        </Button>
      }
    />
  );
}

/**
 * ErrorBoundary: bắt lỗi render của phần con và hiện trang trạng thái thay vì trang trắng. Lỗi nạp file sau khi deploy
 * hiện "Đã có phiên bản mới" + Tải lại; lỗi khác hiện 500 + Thử lại.
 */
export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null, failed: false };

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    return { error, failed: true };
  }

  componentDidCatch(error: unknown, info: React.ErrorInfo) {
    this.props.onError?.(error, info);
  }

  componentDidUpdate(previous: ErrorBoundaryProps) {
    if (this.state.failed && changed(previous.resetKeys, this.props.resetKeys)) this.reset();
  }

  reset = () => this.setState({ error: null, failed: false });

  render() {
    if (!this.state.failed) return this.props.children;
    const { fallback, statusPageProps } = this.props;
    const props = { error: this.state.error, reset: this.reset };
    if (typeof fallback === "function") return fallback(props);
    if (fallback !== undefined) return fallback;
    return <DefaultFallback {...props} statusPageProps={statusPageProps} />;
  }
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    StatusPage: StatusPageProps;
  }
}
