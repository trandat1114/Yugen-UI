/** Phần chung của chip `[n]`: Citation và bản thay thế mà StreamingMarkdown render khi Citation chưa nạp (#350). */
import { cn } from "@/lib/cn";

export interface CitationSource {
  title: string;
  url?: string;
  /** Tên miền hiển thị; mặc định tách từ url. */
  domain?: string;
  /** Đoạn trích liên quan. */
  snippet?: string;
  /** Thông tin phụ: ngày đăng, tác giả… */
  meta?: string;
}

/** Tên miền gọn ("www." bị bỏ). */
export function getSourceDomain(source: CitationSource): string {
  if (source.domain) return source.domain;
  if (!source.url) return "";
  try {
    return new URL(source.url).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export const citationChipClass = cn(
  "relative -top-0.5 mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-small border border-stroke-2 bg-background-4 px-0.5 align-text-top",
  "font-sans text-caption2 font-semibold text-foreground-2 tabular-nums no-underline",
  "transition-colors duration-faster ease-easy-ease hover:bg-brand-background-2 hover:text-brand-foreground-2",
  "data-[state=open]:border-brand-stroke data-[state=open]:bg-brand-background-2 data-[state=open]:text-brand-foreground-2",
);

/** Chữ trong chip: số thứ tự, và tên nguồn cho trình đọc màn hình (`descId`, nối với `aria-describedby`). */
export function CitationChipText({ index, source, descId, label }: { index: number; source: CitationSource; descId: string; label: string }) {
  const domain = getSourceDomain(source);
  return (
    <>
      <span className="sr-only">{label} </span>
      {index}
      <span id={descId} className="sr-only">
        {`: ${source.title}${domain ? ` — ${domain}` : ""}`}
      </span>
    </>
  );
}
