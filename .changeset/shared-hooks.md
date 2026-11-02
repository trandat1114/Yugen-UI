---
"yugen-ui": minor
---

New shared hooks, the ones the components use themselves (#172): `useControllableState`, `useDisclosure`, `useLocalStorage` (synced across hooks with the same key and across tabs; `serialize` / `deserialize` for keys that are not JSON), `useClipboard`, `useHotkeys` (`mod` is ⌘ on Apple and Ctrl elsewhere; skips form fields, IME composition and held keys; `start` / `end` arrows follow RTL), `useDebouncedValue`, `useIntersection` and `useElementSize` (measures before the first paint). `useMediaQuery` moves next to them; importing it from `yugen-ui` or from Sheet still works. Docs page "Hooks".

Components now use them instead of their own copies, with no visible change: controlled / uncontrolled state goes through `useControllableState` in every component except Sheet's snap point and Trace's auto-expand (a callback is no longer called when the value does not change, for example `useTour().start()` while the tour is already open), charts measure with `useElementSize`, the copy buttons use `useClipboard` and now report a refused copy instead of showing "Copied", and `PackageManagerTabs` keeps its saved choice through `useLocalStorage`.

Thanks: @giabao12-hali
