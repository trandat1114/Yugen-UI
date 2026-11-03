import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/hooks.tsx.
export const en: Record<string, ComponentDocEn> = {
  hooks: {
    description:
      "The library exports the hooks its own components use, so apps don't copy them or pull in a second hooks library: useControllableState (the x / defaultX / onXChange pattern), useDisclosure, useMediaQuery, useLocalStorage (SSR-safe, synced across tabs), useClipboard, useHotkeys (skips form fields, arrow keys follow reading direction in RTL), useDebouncedValue, useIntersection and useElementSize. All of them are safe to render on the server: without a window they return their starting value and update after hydration.",
    examples: [
      {
        title: "useDisclosure",
        description: "Open / close / toggle for dialogs, menus and panels. The functions have stable identity, so pass them straight to onClick.",
      },
      {
        title: "useMediaQuery",
        description: "Follows a CSS media query. Resize the window or switch the OS color scheme to see it update at once, without a flash on re-render.",
      },
      {
        title: "useLocalStorage",
        description:
          "Stores JSON in localStorage, synced between hooks with the same key and between tabs. The server and the first hydration render use the initial value, so the HTML never mismatches.",
      },
      {
        title: "useClipboard",
        description: "Copies text to the clipboard; `copied` turns itself off after the timeout. A fallback for insecure contexts is built in.",
      },
      {
        title: "useHotkeys",
        description:
          "Keys are key combinations; `mod` is ⌘ on Mac and Ctrl elsewhere. Plain shortcuts don't fire while typing in a field; `start` / `end` flip in RTL.",
      },
      {
        title: "useDebouncedValue",
        description: "The value only changes once the user stops typing for the delay. Call your API with the debounced value instead of on every key.",
      },
      {
        title: "useIntersection",
        description: "Tells you whether an element is in view. Use `once` for lazy loading or an effect that should run a single time.",
      },
      {
        title: "useElementSize",
        description: "Measures an element with ResizeObserver, so layout can follow its container instead of the window size.",
      },
    ],
    dos: [
      "Use useControllableState in every component with an x / defaultX / onXChange pair, so controlled and uncontrolled behave the same.",
      "Use useMediaQuery for logic (swapping a component, changing the column count); use Tailwind breakpoints for purely visual changes.",
      "Prefix useLocalStorage keys with your app's name, and store only small, non-sensitive data.",
      "Register global shortcuts in a few high-level places, and let useHotkeys skip form fields instead of filtering yourself.",
    ],
    donts: [
      "Don't read a useLocalStorage value while rendering to decide the server HTML. The first render is always the initial value.",
      "Don't put tokens or personal data in localStorage.",
      "Don't use `left` / `right` for reading-direction navigation shortcuts. Use `start` / `end` so RTL works.",
      "Don't debounce a value people need to see respond immediately (the input still binds the raw value).",
    ],
    props: {
      "useControllableState({ value, defaultValue, onChange })":
        "The setter has stable identity and does nothing when the value is unchanged. `value === undefined` means uncontrolled.",
      "useDisclosure({ open, defaultOpen, onOpenChange })": "Open / closed state; also works in controlled mode.",
      "useMediaQuery(query, { defaultValue })": "The value when there is no window (server, tests). Built on useSyncExternalStore, so it doesn't flash.",
      "useLocalStorage(key, initialValue, { serialize, deserialize })":
        "`set` takes a value or an updater; `remove()` deletes the key and returns to the initial value. Corrupt data or blocked localStorage never throws. Values are stored as JSON; `serialize` / `deserialize` read an existing key in another format.",
      "useClipboard({ timeout })": "`timeout` (ms) is how long `copied` stays true.",
      "useHotkeys(hotkeys, options)":
        "options: target (document by default), enabled (true), enableOnFormTags (false), preventDefault (true), repeat (false: a held key counts once). Valid keys: mod / ctrl / meta / alt / shift + a key, plus the aliases esc, space, up, down, left, right, start, end.",
      "useDebouncedValue(value, delay)": "Returns the value at once on the first render; afterwards it only changes once `value` has been still for `delay` ms.",
      "useIntersection({ root, rootMargin, threshold, once })": "Attach `ref` to the element. Without IntersectionObserver it is always false.",
      "useElementSize({ box })": "0 × 0 until measured (server, first render). The first measure runs before the browser paints, so nothing flashes. Also works with vertical writing modes.",
    },
  },
};
