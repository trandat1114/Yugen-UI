---
"yugen-ui": patch
---

Combobox and TagPicker no longer use cmdk: a small built-in listbox engine handles the highlighted option, `aria-activedescendant` and the keyboard (#351). `{ Combobox }` goes from 42.57 to 38.59 kB gzip and `{ TagPicker }` from 50.30 to 40.38 kB; Command keeps cmdk. With 1,000 options an arrow key now takes one render that updates only the two options whose highlight changed (Chromium: about 40 → 2.6 ms per key, typing 30 → 7 ms per key, opening 300 → 210 ms). Keyboard, ARIA and the look are unchanged; options keep `role="option"`, `data-selected` and `data-disabled`, but no longer carry `cmdk-*` attributes, so tests that query `[cmdk-item]` inside a Combobox or TagPicker should query `role="option"` instead. TagPicker loads Sortable only with `reorderable`: the server and the first render show plain tags of the same size, and dragging and Alt + arrow keys work as soon as it has loaded (tests should wait for it, for example for `[data-sortable-item]`).
