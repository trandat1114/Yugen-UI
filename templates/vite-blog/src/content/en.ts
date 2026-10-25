import { messagesEn } from "yugen-ui";
import type { Content } from "./types";

const en: Content = {
  lang: "en",
  messages: messagesEn,
  locale: "en-US",
  site: {
    title: "Sakura Notes",
    description: "Notes on interface design, React and Tailwind CSS. Written in Markdown, built with Yugen UI.",
    author: "Dat Tran",
  },
  themes: { light: "Light", dark: "Dark", "high-contrast": "High contrast" },
  appearance: "Appearance",
  home: { title: "Latest posts", lead: "Interface design, React and Tailwind CSS. A new post every week." },
  tagLead: (count, tag) => `${count} ${count === 1 ? "post" : "posts"} tagged ${tag}.`,
  search: { label: "Search posts", placeholder: "Search posts…" },
  empty: { title: "No matching posts", body: "Try another search or clear the tag filter." },
  draft: "Draft",
  readingTime: (minutes) => `${minutes} min read`,
  post: {
    toc: "On this page",
    more: "More posts",
    older: "Previous post",
    newer: "Next post",
    copyLink: "Copy link",
    copied: "Link copied",
    copyFailed: { title: "Couldn't copy the link", body: "The browser blocked clipboard access." },
  },
  markdown: { done: "Done", todo: "Not done", table: "Table" },
  notFound: { title: "Page not found", body: "The post may have moved, or it never existed.", home: "Back to home" },
  builtWith: "Built with",
  tagDescription: (tag, site) => `Posts tagged ${tag} on ${site}.`,
};

export default en;
