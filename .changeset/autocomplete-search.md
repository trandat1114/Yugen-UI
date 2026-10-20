---
"yugen-ui": minor
---

New `Autocomplete`: a search box with suggestions following the ARIA combobox pattern — accent-insensitive filtering ("xoai" matches "Xoài"), match highlighting, grouped suggestions with icons and descriptions, disabled items, `minChars={0}` for recent searches, server-side mode (`filter={false}` + `loading` with a 300 ms spin delay), `onSelect` for suggestions and `onSubmit` for the raw query. Also exports `HighlightMatch` and `highlightRanges` for highlighting matches in filtered lists.
