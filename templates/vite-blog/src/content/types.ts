import type { YugenTheme, YugenMessagesInput } from "yugen-ui";

/**
 * Every string in the blog, and the site name the SEO plugin writes into each page. One file per language, posts in
 * `content/<lang>/posts/*.md`; `content/index.ts` picks the language the app and the build use.
 */
export interface Content {
  lang: "en" | "vi";
  /** Chuỗi có sẵn của component Yugen: messagesEn cho tiếng Anh, bỏ trống = mặc định tiếng Việt. Đặt ở file ngôn ngữ để
   * `create --lang vi` (xoá en.ts) bỏ hẳn bản tiếng Anh khỏi bundle. */
  messages?: YugenMessagesInput;
  /** Dates (also `locale` on YugenProvider) and `og:locale`. */
  locale: "en-US" | "vi-VN";
  site: { title: string; description: string; author: string };
  themes: Record<YugenTheme, string>;
  appearance: string;
  home: { title: string; lead: string };
  tagLead: (count: number, tag: string) => string;
  search: { label: string; placeholder: string };
  empty: { title: string; body: string };
  draft: string;
  readingTime: (minutes: number) => string;
  post: {
    toc: string;
    more: string;
    older: string;
    newer: string;
    copyLink: string;
    copied: string;
    copyFailed: { title: string; body: string };
  };
  markdown: { done: string; todo: string; table: string };
  notFound: { title: string; body: string; home: string };
  builtWith: string;
  /** `<meta name="description">` of a tag page. */
  tagDescription: (tag: string, site: string) => string;
}
