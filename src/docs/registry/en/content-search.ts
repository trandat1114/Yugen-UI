import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/content-search.tsx.
export const en: Record<string, ComponentDocEn> = {
  quote: {
    description:
      "Quote uses standard semantics: a <figure> holding a <blockquote cite> and a <figcaption> (author, <cite> source), so screen readers announce a quotation and who said it. Three appearances: default (brand bar at the start), subtle (neutral bar, for body text) and emphasis (large text with quotation marks, for testimonials). The bar uses border-s, so it switches sides in RTL.",
    examples: [{ title: "Appearance & source", description: "default with a source link (cite), subtle at size small, emphasis with an avatar." }],
    dos: [
      "Name the author or source. A quote without one is hard to trust.",
      "Use emphasis for testimonials on landing pages; default / subtle in articles.",
      "Pass the URL to cite when quoting a page on the web.",
    ],
    donts: [
      "Don't use Quote just to indent or highlight a paragraph. Use MessageBar or Card.",
      "Don't place several emphasis Quotes next to each other in one view.",
    ],
    props: {
      children: "Quoted content; a string is wrapped in a <p>.",
      author: "Speaker or author.",
      authorTitle: "Job title, organization.",
      source: "Source name, shown in a <cite>.",
      cite: "Source URL; set on the blockquote, and it turns source into a link.",
      avatar: "Author's avatar.",
      appearance: "Display style.",
      size: "Font size of the quote.",
    },
  },

  autocomplete: {
    description:
      "Unlike Combobox (one value from a fixed list), the value of Autocomplete is free text and the suggestions only help fill it in. It filters ignoring diacritics (“xoai” finds “Xoài”), highlights matches, groups suggestions (recent searches, people, documents…), shows a loading state that follows Wait UX and announces the number of suggestions to screen readers. Keyboard: ↓/↑ move through suggestions, Enter picks one or searches, Esc closes the list (press again to clear the input).",
    examples: [
      {
        title: "Groups, icons & recent searches",
        description: "minChars={0} opens the recent searches as soon as the input gets focus; suggestions can be disabled.",
      },
      { title: "Suggestions from a server", description: "filter={false} when the server has already filtered; loading shows a spinner if the wait passes 300ms." },
    ],
    dos: [
      "Use it for search boxes with suggestions; use Combobox when people must pick exactly one value.",
      "Limit the number of suggestions (maxSuggestions) and group them when there are several kinds of results.",
      "Debounce and cancel stale requests when calling an API.",
    ],
    donts: [
      "Don't fill the first suggestion into the input while people are typing.",
      "Don't hide the Enter action: people must be able to search with their exact query.",
    ],
    props: {
      suggestions: "Suggestions: value, label, description, icon, group, disabled.",
      filter: "Filters ignoring diacritics; false when the server has already filtered.",
      onSelect: "Called when a suggestion is picked.",
      onSubmit: "Called on Enter when no suggestion is active.",
      loading: "Suggestions are loading; the spinner appears after 300ms.",
      emptyMessage: "Shown when no suggestions match; null closes the list instead.",
      maxSuggestions: "Maximum number of suggestions.",
      minChars: "Characters needed before the list opens; 0 = open on focus.",
      highlight: "Highlights the matching part.",
      listLabel: "aria-label of the list.",
      "value / defaultValue / onValueChange": "Query (controlled / uncontrolled).",
    },
    defaults: {
      emptyMessage: "“Không có gợi ý phù hợp” (No matching suggestions)",
      listLabel: "“Gợi ý tìm kiếm” (Search suggestions)",
    },
  },
};
