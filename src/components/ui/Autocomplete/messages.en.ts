import type { AutocompleteMessages } from "./messages";

export const autocompleteMessagesEn: AutocompleteMessages = {
  empty: "No matching suggestions",
  listLabel: "Search suggestions",
  searching: "Searching…",
  count: (count) => (count === 1 ? "1 suggestion" : `${count} suggestions`),
};
