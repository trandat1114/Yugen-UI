---
"yugen-ui": minor
---

New shared hooks, the ones the components use themselves (#172): `useControllableState`, `useDisclosure`, `useLocalStorage` (synced across hooks with the same key and across tabs), `useClipboard`, `useHotkeys` (`mod` is ⌘ on Apple and Ctrl elsewhere; skips form fields, IME composition and held keys; `start` / `end` arrows follow RTL), `useDebouncedValue`, `useIntersection` and `useElementSize`. `useMediaQuery` moves next to them; importing it from `yugen-ui` or from Sheet still works. Docs page "Hooks". ToggleButton, Pagination, List, Reasoning, TeachingPopover, CodeBlock and DescriptionList use the shared versions, with no change in behaviour.
