import type { YugenMessagesInput, YugenTheme } from "yugen-ui";

/** A link to a page: "<section>/<page>", the path of its Markdown file under content/<lang>/docs/ without `.md`. */
export interface PageLink {
  label: string;
  page: string;
}

/**
 * Every string of the site around the pages, and the name the SEO plugin writes into each page. One file per language,
 * pages in `content/<lang>/docs/<section>/<page>.md`; `content/index.ts` picks the language the app and the build use.
 */
export interface Content {
  lang: "en" | "vi";
  /** Built-in strings of Yugen components: messagesEn for English, empty = Vietnamese defaults. Kept in the language
   * file so `create --lang vi` (which deletes en.ts) drops the English set from the bundle. */
  messages?: YugenMessagesInput;
  /** `locale` on YugenProvider and `og:locale`. */
  locale: "en-US" | "vi-VN";
  /** `product`: the name in the footer. */
  site: { title: string; product: string; description: string };
  themes: Record<YugenTheme, string>;
  appearance: string;
  skipToContent: string;
  nav: { label: string; open: string; home: string };
  search: { button: string; title: string; placeholder: string; empty: string };
  home: {
    eyebrow: string;
    title: string;
    lead: string;
    primary: PageLink;
    secondary: PageLink;
    sections: string;
    pageCount: (count: number) => string;
  };
  page: { toc: string; pager: string; previous: string; next: string };
  markdown: { done: string; todo: string; table: string; note: string; tip: string; warning: string };
  notFound: { title: string; body: string; home: string };
  footer: { builtWith: string };
}
