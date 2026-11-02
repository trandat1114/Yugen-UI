/** Kiểu cho scripts/news.mjs (plugin Vite và test là TypeScript). */
export type NewsKind = "new" | "improved" | "fixed" | "breaking";
export type NewsLocale = "vi" | "en";
export type FeedName = "NEWS" | "CLI_NEWS" | "CREATE_NEWS";

export interface NewsFileItem {
  kind: NewsKind;
  text: string;
  href?: string;
}

export interface NewsFileText {
  title: string;
  summary: string;
  items: NewsFileItem[];
}

export interface NewsFile extends NewsFileText {
  date: string;
  upcoming: boolean;
}

export interface NewsFeedRelease {
  version: string;
  date: string;
  upcoming: boolean;
  vi: NewsFileText;
  en: NewsFileText;
}

export interface NewsEntry {
  version: string;
  upcoming: boolean;
  date: string;
  kinds: NewsKind[];
}

export const NEWS_DIR: string;
export const LOCALES: NewsLocale[];
export const FEEDS: Record<FeedName, string>;
export const KIND_HEADINGS: Record<NewsLocale, Record<string, NewsKind>>;

export function parseNewsFile(source: string, file: string, locale: NewsLocale, errors: string[]): NewsFile;
export function readFeed(root: string, name: FeedName, errors?: string[]): NewsFeedRelease[];
export function readNews(root: string): { feeds: Record<FeedName, NewsFeedRelease[]>; errors: string[] };
export function localizeFeed(
  releases: NewsFeedRelease[],
  locale: NewsLocale,
): ({ version: string; upcoming?: true; date: string } & NewsFileText)[];
export function newsEntries(root: string, name: FeedName): NewsEntry[];
