import { messagesEn } from "yugen-ui";
import type { Content } from "./types";

const en: Content = {
  lang: "en",
  messages: messagesEn,
  locale: "en-US",
  site: {
    title: "Sakura Notes Docs",
    product: "Sakura Notes",
    description: "Guides and API reference for Sakura Notes, the shared notes app for teams: SDK, REST API, CLI and webhooks.",
  },
  themes: { light: "Light", dark: "Dark", "high-contrast": "High contrast" },
  appearance: "Appearance",
  skipToContent: "Skip to content",
  nav: { label: "Documentation", open: "Open navigation", home: "Home" },
  search: {
    button: "Search docs",
    title: "Search the documentation",
    placeholder: "Search pages and headings…",
    empty: "Nothing matches. Try fewer words.",
  },
  home: {
    eyebrow: "Documentation",
    title: "Build with Sakura Notes",
    lead: "Install the SDK, create your first note in a few minutes, then look up any endpoint, CLI command or webhook event.",
    primary: { label: "Quick start", page: "getting-started/quick-start" },
    secondary: { label: "API reference", page: "api-reference/authentication" },
    sections: "Sections",
    pageCount: (count) => `${count} ${count === 1 ? "page" : "pages"}`,
  },
  page: { toc: "On this page", pager: "More pages", previous: "Previous", next: "Next" },
  markdown: { done: "Done", todo: "Not done", table: "Table", note: "Note", tip: "Tip", warning: "Warning" },
  notFound: { title: "Page not found", body: "The page may have moved, or it never existed.", home: "Back to the docs" },
  footer: { builtWith: "Built with" },
};

export default en;
