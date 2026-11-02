import index from "virtual:yugen-news-index";
import type { Locale } from "./i18n";

/**
 * Nhật ký thay đổi hiển thị ở trang "Có gì mới" (/news). Nội dung viết bằng Markdown trong
 * src/docs/news/<gói>/<version>.<vi|en>.md (#261); scripts/news.mjs đọc và kiểm tra, plugin yugenNews đưa vào docs.
 * Đồng bộ với CHANGELOG.md.
 */
export type NewsKind = "new" | "improved" | "fixed" | "breaking";

export const NEWS_KINDS: NewsKind[] = ["new", "improved", "fixed", "breaking"];

export interface NewsItem {
  kind: NewsKind;
  /** Markdown inline (code, đậm, link). */
  text: string;
  /** Link nội bộ của docs, tính từ gốc docs, vd. "/components/trace" (NewsPage thêm BASE qua docsPath). */
  href?: string;
}

export interface NewsRelease {
  version: string;
  /** Bản chưa phát hành, viết trên next (wiki › Release Process › Tin cho bản sắp phát hành); `date` là ngày dự kiến. */
  upcoming?: true;
  date: string; // YYYY-MM-DD
  title: string;
  /** Markdown inline. */
  summary: string;
  items: NewsItem[];
}

/** Phần nạp sẵn ở mọi trang: đủ cho chấm "tin mới" ở thanh trên, nút tin ở trang chủ và ROADMAP.md. */
export interface NewsIndexRelease {
  version: string;
  upcoming?: true;
  date: string;
  title: Record<Locale, string>;
}

/** Mỗi gói một mảng, mới trước: yugen-ui, @yugen-ui/cli (packages/cli), create-yugen-ui. */
export interface NewsFeeds<T> {
  NEWS: T[];
  CLI_NEWS: T[];
  CREATE_NEWS: T[];
}

export const NEWS_INDEX: NewsFeeds<NewsIndexRelease> = index;

/** Bản yugen-ui đã phát hành mới nhất (bỏ qua mục `upcoming`). */
export const LATEST_RELEASE = index.NEWS.find((r) => !r.upcoming) ?? index.NEWS[0];

// Tin đầy đủ theo ngôn ngữ: mỗi ngôn ngữ một chunk, chỉ nạp cùng trang Có gì mới.
const loaders: Record<Locale, () => Promise<{ default: NewsFeeds<NewsRelease> }>> = {
  vi: () => import("virtual:yugen-news-vi"),
  en: () => import("virtual:yugen-news-en"),
};
const loaded: Partial<Record<Locale, NewsFeeds<NewsRelease>>> = {};
const pending: Partial<Record<Locale, Promise<void>>> = {};
const failed: Partial<Record<Locale, { error: unknown }>> = {};

/** Nạp tin của một ngôn ngữ. App gọi cùng route (main.tsx, prerender) nên lần render đầu không treo. */
export function preloadNews(locale: Locale): Promise<void> {
  if (loaded[locale]) return Promise.resolve();
  return (pending[locale] ??= loaders[locale]().then(
    (m) => void (loaded[locale] = m.default),
    (error: unknown) => {
      // Lỗi mạng: lần render này báo lỗi (ErrorBoundary), lần sau thử nạp lại — như lazyPage.
      failed[locale] = { error };
      pending[locale] = undefined;
    },
  ));
}

/** Tin đầy đủ theo ngôn ngữ; treo (Suspense) tới khi nạp xong. */
export function useNewsFeeds(locale: Locale): NewsFeeds<NewsRelease> {
  const failure = failed[locale];
  if (failure) {
    failed[locale] = undefined;
    throw failure.error;
  }
  const feeds = loaded[locale];
  if (!feeds) throw preloadNews(locale);
  return feeds;
}
