# Changelog

## 0.16.0

### Minor Changes

- 0f2a5bf: Charts: moving the pointer over LineChart, AreaChart and BarChart no longer recomputes the chart (#352). Scales, paths, the screen reader label of every point and the layers that do not change on hover are kept until the data, the props or the width change, and the points share one set of event handlers, so a hover step only redraws the crosshair, the tooltip and, for bars, the bars whose dimming changes. A hover step goes from 9.7 to 1.1 ms at 500 points and from 39 to 1.1 ms at 2,000 (three series, jsdom), and a keyboard step from 43 to 9.6 ms at 2,000. Colors shared by a series (line markers, bars) and the gridlines are set once on the series group instead of on every mark: a 4 × 200 LineChart with markers has 16 inline styles instead of 1,014 (−30% markup), a 60 × 4 BarChart 13 instead of 490 (−14%). The drawn pixels, keyboard navigation and screen reader output are unchanged; points now carry a `data-i` attribute. `{ BarChart, LineChart }` grows from 30.2 to 31.1 kB gzip. New `useElementSize({ enabled })`: with `false` the hook measures nothing and adds no ResizeObserver. Sparkline passes `enabled: false` when `width` is a number, so 200 fixed-width Sparklines mount in one render instead of three, with no observers.
- 54be923: New `yugenHtmlAttributes()` and `yugenThemeScript()` for server-rendered and prerendered apps, so the first paint uses the right theme (#348). `<html {...yugenHtmlAttributes({ theme, brand, dir })}>` writes the same attributes as `<YugenProvider applyToDocument>` into the first HTML. `yugenThemeScript({ storageKey })` returns a small inline script for `<head>` that sets `data-theme` before the first paint, from the saved choice (a theme name, or JSON with `theme`, `brand` and `dir`) or else from `prefers-contrast` and `prefers-color-scheme`. Both are plain functions that work in a Next.js Server Component. `YugenProvider applyToDocument` now writes the attributes in a layout effect, before the browser paints, instead of after it.
- 54be923: New `useYugenTheme()` (`{ theme, brand, dir }`) and `useYugenLocale()` (the Intl locale): unlike `useYugen()`, a component that reads one of them does not re-render when the other changes. `YugenProvider` keeps the theme in its own context, so a theme switch no longer re-renders every control that reads `defaults` or `messages`: with 1,800 controls and stable children (a Next.js `Providers` component, a wrapper that passes `children`), it goes from about 66 ms and 1,500 re-renders to 1.4 ms and none. `messages` written inline (`messages={{ dialog: { close: "Close" } }}`, `{ ...messagesVi, … }`) is now compared by value like `defaults`, so a parent re-render with the same strings no longer re-renders those controls (66 → 0.1 ms). Charts, CodeBlock, the date and time pickers and the other components that need only the theme or the locale use the new hooks. `useYugen()` returns the same fields as before (#347).
- 39973e3: New subpath imports (#344): every component folder is also a path of the package, as in `import { Button } from "yugen-ui/Button"`, `yugen-ui/Chart` or `yugen-ui/DatePicker`, plus `yugen-ui/hooks`, `yugen-ui/AppShell/Sidebar`, `yugen-ui/messages-en` and `yugen-ui/messages-vi`. A subpath loads only that component and what it uses, which matters where nothing tree-shakes the package: tests, server rendering in Node and dev servers. A cold `import { Button }` in Node loads 14 modules in about 60 ms from `yugen-ui/Button`, against 498 modules in about 1.6 s from `yugen-ui`. Production bundles keep the same size, and the root and the subpaths load the same files, so both can be used in one app. `yugen-ui/_internal/*` stays private. The Quick start page lists the paths and shows Next.js `optimizePackageImports` for apps that keep importing from the root.

### Patch Changes

- 7524c80: Calendar no longer bundles the Vietnamese date-fns locale: it checks the locale code instead of importing `vi`. English apps save about 2 kB gzip on every date component: `{ Calendar }` goes from 32.4 to 30.4 kB and `{ DatePicker }` from 58.8 to 56.8 kB (Rolldown, as in Vite 8). Vietnamese apps still get the locale through `calendarMessagesVi` / `messagesVi`, and the short weekday names (CN, T2…) work as before (#349).
- 1c52a0a: Leaner CSS floor (#353). The library's 19 keyframes now live inside `@theme`, so Tailwind only outputs the ones an `animate-*` utility (or an `animation` declaration) in your app uses: with `theme-core.css`, a Button-only app goes from 20 keyframes to 1 (9.17 → 8.86 kB gzip in a Vite build) and the floor with no components from 7.15 to 6.85 kB. Utility and keyframe names are unchanged, including `animate-shimmer` and `animate-indeterminate`; WavyUnderline uses the new `animate-wave-flow`. As with Tailwind's own keyframes, they are written at the end of the output: an app that defines its own `@keyframes` with one of these names (`fade-in`, `sweep`…) should declare it inside `@theme` for it to win. `tokens.css` no longer carries the `@theme` block and chart keyframes of `charts.css`, so it is plain CSS with custom properties only (8.22 → 8.02 kB gzip). `styles.css` keeps the keyframes its components use and drops the unused `shimmer` and `indeterminate`. `theme.css` is now `@import "./theme-core.css"` plus its `@source` line instead of a second copy of the theme (64 kB less in the package).
- 7bbbcc9: Components with class variants (Button, Input, Badge, Card, Tag, Avatar, Label, Link, Select, Textarea, MessageBar, ButtonGroup, Image, SwatchPicker and the ToggleButton checked layer) merge their classes once per combination of variant props instead of on every render (#355). Server-rendering 1,000 Buttons takes half the time (about a third less with a `className`), re-rendering them in the browser 44–51% less (30–32% with a `className`), and the docs' server-rendered pages 2–11% less. The exported `buttonVariants`, `buttonGroupVariants`, `linkVariants` and `imageVariants` take the same arguments and return the merged string: the classes the component renders, which is what `cn(buttonVariants(…))` returned before. `cn` keeps 2,000 merged strings instead of 500, so a large page no longer evicts its own entries. Copied source (`yugen add`, the shadcn registry) gains `lib/cvx.ts` next to `lib/cn.ts`.
- 81c62ad: Deprecate `YugenProvider`'s `withToaster` prop with a development warning and point templates and documentation to an explicit `<Toaster />` child. The prop remains available until 1.0.0.
- 8b584d2: Parts that only one option needs now load on demand (#350). `Nav` no longer imports Tooltip: the AppShell `Sidebar` passes the icon-rail tooltip to it, so a Nav outside AppShell goes from 29.9 to 12.0 kB gzip (Rolldown, as in Vite 8). Breadcrumb loads the menu of its "…" button only when `maxDisplayedItems` collapses items (initial chunk 40.2 → 13.5 kB), and StreamingMarkdown loads the citation card only when the text has citations (49.3 → 27.3 kB). Until the part arrives, which starts right after the first client render, the button or chip renders with the same size, classes and ARIA; a click or key press in that window opens the menu or card once it arrives, and focus moves to the real button. Server rendering and hydration always render that placeholder, so both sides produce the same HTML. A lean dashboard (YugenProvider, Nav, Breadcrumb, Card, Button, Badge, Field, Input) goes from 51.2 to 32.2 kB and an AI chat page (YugenProvider, StreamingMarkdown, PromptInput, MessageScroller, Reasoning) from 63.8 to 54.1 kB; apps that already use Menu, Tooltip or Popover elsewhere see little change. Tests that open the Breadcrumb menu or a citation card right after rendering need to wait for it (`findByRole`). With esbuild code splitting (`splitting: true`), an import from the package root puts these parts into the first chunk even when the app does not use them, because esbuild assigns whole files to chunks; import from subpaths such as `yugen-ui/Breadcrumb` there.
- 8b17443: Combobox and TagPicker no longer use cmdk: a small built-in listbox engine handles the highlighted option, `aria-activedescendant` and the keyboard (#351). `{ Combobox }` goes from 42.83 to 38.92 kB gzip and `{ TagPicker }` from 50.56 to 41.01 kB; Command keeps cmdk. With 1,000 options an arrow key now takes one render that updates only the two options whose highlight changed (Chromium: about 40 → 2.6 ms per key, typing 30 → 7 ms per key, opening 300 → 210 ms). Keyboard and the look are unchanged; options keep `role="option"`, `data-selected` and `data-disabled`, but no longer carry `cmdk-*` attributes, so tests that query `[cmdk-item]` inside a Combobox or TagPicker should query `role="option"` instead. The listbox is now named by the field label (`aria-labelledby`, which Field sets) instead of the fixed English "Suggestions"; without one it reuses the input's `aria-label`, and with neither it uses the new `listLabel` message (`messages.combobox.listLabel`, `messages.tagPicker.listLabel`: "Suggestions" / "Gợi ý"). TagPicker loads Sortable only with `reorderable`: the server and the first render show plain tags of the same size, and dragging and Alt + arrow keys work as soon as it has loaded (tests should wait for it, for example for `[data-sortable-item]`). A tag that has focus when Sortable arrives keeps it.
- 39973e3: Fix types under TypeScript `module: "node16"` / `"nodenext"` (#343): the root declarations pointed at the Chart, AIKit and hooks modules without a `.js` ending, so 72 exports (BarChart, LineChart, StreamingMarkdown, PromptInput, useDisclosure, useHotkeys…) failed with "has no exported member". `MenubarMenu` no longer names `@radix-ui/react-context` in its type, a package yugen-ui does not depend on. CI now type-checks every export from a `nodenext` project and runs Are the Types Wrong on the package.
- 09f2a6d: Fix three details of the published package (#382). Deprecation warnings are in English and link to https://trandat1114.github.io/Yugen-UI/concepts/versioning instead of the old `#/` URL. The `AppShell` cookie gets `secure` on https pages. The published JS has no comments (the JSDoc stays in the `.d.ts` files): the 224 JS files go from 1238 to 1132 kB, 422 to 357 kB gzipped one by one. Bundled sizes do not change.
- 54be923: `YugenProvider` no longer bundles the Toaster: with `withToaster` it loads it after the first client render, and `toast()` calls made before that still show once it mounts. Apps that don't turn on `withToaster` no longer ship `@radix-ui/react-toast`: the initial chunk for `{ YugenProvider }` goes from 24.9 to 13.3 kB gzip (Rolldown, as in Vite 8), and a six-component app from 38.0 to 31.1 kB. The toast store (`toast()`, `dismissToast()`, `useToast()`) lives in its own module, so code that only calls `toast()`, such as `useOptimisticList`, no longer pulls in the Toaster UI. Server rendering and hydration render no Toaster, so both sides produce the same HTML. If the Toaster chunk fails to load, only the Toaster is missing; the rest of the app keeps rendering. Tests that render `withToaster` and look for a toast right away need to wait for it (`findByText`). Rendering `<Toaster />` as a child of the root provider is the recommended setup (#346).
- 39973e3: Fix `readAppShellCookie` in React Server Components (#345): it lived in the same file as `AppShell`, behind `"use client"`, so calling it from a Next.js layout threw. It now has a module of its own without the directive; import it from `yugen-ui`. `rampToDesignTokens`, `rampToTokensStudio` and `BRAND_ALIAS_STEPS` can be called on the server too, like `cn` and the brand ramp helpers.
- The built-in 16 px Copy icon (CodeBlock, DescriptionList and StatusPage copy buttons) follows the redrawn glyph of Fluent System Icons (`@fluentui/react-icons` 2.0.345) (#398).

## 0.15.0

### Minor Changes

- 9cf7a94: New prop names from the pre-1.0 API review (#157), so the same idea has the same name everywhere: Carousel `gap="extra-small" | "small" | "medium" | "large" | "extra-large"` (default `"small"`), Tree `onSelectionChange`, DatePicker and DateRangePicker `onValueChange` (receives `null` when cleared, like `value`), List `appearance`, RatingDisplay `showValue` (default `true`), toast option `dismissible` (default `true`), CarouselNavContainer `previousLabel` and Autocomplete `noResultsText`. Sheet and NotificationCenter `breakpoint` take the same tokens as AppShell (`"lg"` … `"5xl"`, default `"3xl"` = 48rem = 768px). Also new: TimePicker `onValueChange(Date | null)` next to `onTimeChange`, Carousel `activeIndex` / `defaultActiveIndex`, and Stepper `defaultActiveStep`.
  
  The old names keep working until 1.0 and print a one-time warning in development: Carousel `gap="XS" | "S" | "M" | "L" | "XL"` and `circular`, Tree `onSelectedChange`, DatePicker `onSelectDate`, DateRangePicker `onSelectRange`, List `variant`, RatingDisplay `hideValue`, toast `hideDismiss`, CarouselNavContainer `prevLabel`, Autocomplete `emptyMessage`, a px number for Sheet / NotificationCenter `breakpoint`, and `formatDateVi`. The unsuffixed `…Messages` constants (for example `carouselMessages`) are marked `@deprecated` in favour of `…MessagesVi` / `…MessagesEn`.
- 10d47d4: More names from the pre-1.0 API review (#157), the rows planned for 0.16, shipped early: CarouselNavContainer `showAutoplayToggle` (Carousel's own `autoplay` is the autoplay state), TimelineItem `intent="error"` (like MessageBar, Toast and Field), Stat and StatTile `size="extra-large"`, Divider `orientation="horizontal" | "vertical"` and TeachingPopoverFooter `orientation`.
  
  **Deprecated** (they keep working until 1.0 and print a one-time warning in development): CarouselNavContainer `autoplay`, TimelineItem `intent="danger"`, Stat `size="hero"`, Divider `vertical`, TeachingPopoverFooter `layout`, and three exports that leave the package in 1.0: `highlightRanges` (internal helper of `HighlightMatch`), `getOverflowGroups` (use `useIsOverflowGroupVisible(groupId)`) and the top-level `dispatchToast` (use `toast()` or `useToast().dispatchToast`, which do not warn).
- af07474: **Breaking:** `yugen-ui` no longer depends on `@fluentui/react-icons` (about 180 MB installed, plus the Griffel CSS-in-JS runtime). The 159 icons used inside components now ship with the library as small inline SVG components generated from Fluent System Icons, with the same paths, sizes and accessibility attributes, so components look the same. Apps that import icons from `@fluentui/react-icons` themselves and relied on it being installed with `yugen-ui` must add it to their own dependencies (`npm i @fluentui/react-icons`); the templates already do. Icon slots size any SVG with CSS, so other icon sets such as `lucide-react` work in them too (#320).
- b03a225: New `ColorPicker`: a saturation / brightness area, hue and optional opacity (`alpha`) sliders, HEX / RGB / HSL inputs, a screen color picker where the browser supports the EyeDropper API, and preset colors through SwatchPicker (`swatches`). The value is hex; `onValueChange` also gets rgb / hsl / hsv. `parseColor` is exported, and built-in strings live in `messages.colorPicker` (#173).
- b03a225: New `FormattedInput` with `format="phone" | "card" | "currency"`: formats as you type and keeps the caret in place, including edits in the middle and Backspace over a separator. `value` / `onValueChange` use the raw value (digits, or a decimal like `"1234.5"`); with `name`, forms submit the raw value. Phone masks follow the `locale` region (or `mask`), card numbers group by card type, and currency uses Intl with the provider `locale` and `currency`. Also exported: `applyMask`, `getPhoneMask`, `getCardMask` (#173).
- 78c622b: Yugen Labs: `glassNavigationDefaults`, a set of default props for `YugenProvider` that gives every navigation component with glass `material="glass"` in one place (#230): `<YugenProvider defaults={glassNavigationDefaults}>`, or `{ ...glassNavigationDefaults, Button: { … } }` together with other defaults. It covers Toolbar, TabsList, Nav, MenuPopover, MenuSubPopover, PopoverSurface, TooltipContent, DialogSurface, DrawerSurface and SheetContent; a `material` prop on an instance still wins. MenuSubPopover exports its props type, `MenuSubPopoverProps`.
- b03a225: New `MonthPicker`, `YearPicker` and `DateTimePicker` in the DatePicker family: the same field, popover, `value` / `defaultValue` / `onValueChange` (`Date | null`), `minDate` / `maxDate`, `clearable`, `formatDate` and locale handling as DatePicker. MonthPicker and YearPicker show a 12-cell grid with arrow keys, Home / End and PageUp / PageDown; DateTimePicker pairs the Calendar with a TimePicker (`timeIncrement`, `hourCycle`). Built-in strings live in `messages.monthPicker`, `messages.yearPicker` and `messages.dateTimePicker` (#173).
- e17a176: New `NavigationMenu` for website headers (#168), built on Radix Navigation Menu (new dependency `@radix-ui/react-navigation-menu`): `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink` (`active` sets `aria-current="page"`; `icon` and `description` inside a panel; `asChild` for router links) and `NavigationMenuIndicator`. Hover intent with a short delay, `activationMode="manual"` to open on click only, keyboard support per the WAI-ARIA disclosure navigation pattern, one floating viewport that resizes to the open panel, RTL. The `<nav>` label comes from `messages.navigationMenu`.
- b03a225: New `PasswordInput`: an Input with a show / hide button (`aria-pressed`, keeps focus in the field), a Caps Lock note read through a live region, and an optional strength meter (`strength`, or your own scoring function; `getPasswordStrength` is exported). Built-in strings live in `messages.passwordInput` (#173).
- 64e63e2: Prose reads its fonts and rhythm from CSS variables: `--prose-font-body`, `--prose-font-heading`, `--prose-font-mono`, `--prose-size`, `--prose-leading` and `--prose-flow` (space between blocks). With none of them set it looks exactly as before. New presets in the theme: `yugen-prose-docs`, `yugen-prose-article`, `yugen-prose-chat` and `yugen-prose-compact`. The docs have a Typeset page that builds your own preset and copies the CSS (#244).
- 335bd0e: `YugenProvider` takes `defaults` and `density` (#171). `defaults={{ Button: { shape: "circular" }, Input: { appearance: "filled-darker" } }}` sets props for every instance of a component in that part of the UI, typed per component; a prop on the instance still wins and nested providers merge per component. `density="compact"` gives controls (buttons, fields, pickers, tabs, toolbars, tables, Tree, Nav…) size small by default and scales spacing by 0.9375; `"comfortable"` scales spacing by 1.125. Spacing comes from a `data-density` attribute in `theme.css` (`--spacing` and the spacing tokens, the same factors as the Theme Designer), so prerendered HTML is right before hydration. `useYugen()` also returns `density`. Each component reads its defaults with one context read.
- 1ca1d9c: **Breaking:** React 19 or later is required (`peerDependencies` `react` / `react-dom` `>=19`). React 18.3 was supported through 0.14; it gets no fixes upstream since 2024-04, and CI no longer tests it. Apps on React 18 can stay on `yugen-ui@0.14` until they upgrade (#62).
- 5b04d8a: Components are plain function components that take `ref` as a prop (React 19) instead of `forwardRef` wrappers. Passing a `ref` works as before, and `React.ComponentRef<typeof Button>` and `React.ComponentProps<typeof Button>` still give the element type and the props (with `ref`). In the type declarations each component is now a function such as `Button(props: ButtonProps & { ref?: React.Ref<HTMLButtonElement> })` rather than a `React.ForwardRefExoticComponent`, so code that spelled out `ForwardRefExoticComponent` for a Yugen component should use `typeof Button` or `React.ComponentType<…>`. `DataGrid` and `DataGridColumnPicker` are declared as generic functions directly. Components that keep their own ref next to yours (Carousel, Sheet, Toolbar, FileUpload and others) now call the cleanup function that a callback ref returns when the element is removed (#62).
- 149cf64: `YugenProvider scrollLock` chooses whether the page scrollbar stays while Menu, ContextMenu or Dropdown is open (#243). These surfaces lock page scrolling through Radix (react-remove-scroll), which hides the scrollbar and adds a body margin in its place. `"hide-scrollbar"` keeps that behavior and stays the default in 0.x; with `"keep-scrollbar"` the scrollbar stays and nothing shifts, while wheel and touch scrolling outside the surface are still blocked. With `applyToDocument` the provider writes `data-yugen-scroll-lock` to `<html>`; apps without the provider can set the attribute themselves (the CSS is in `theme.css`). Menu and ContextMenu document `modal={false}` for a menu that doesn't lock scrolling at all. 1.0 will switch the default to `"keep-scrollbar"`.
- e17a176: New `StatusPage` and `ErrorBoundary` (#238). `StatusPage` is a page for HTTP errors and app states: `status` (400, 401, 403, 404, 408, 410, 429, 500, 502, 503, 504, `"offline"`, `"update"`) picks the built-in title, description and code from `messages.statusPage`; `primaryAction` / `secondaryAction` take your router's buttons or links, `errorId` shows a copyable error ID, `autoFocus` moves focus to the heading. `ErrorBoundary` catches render errors and shows a 500 page with Try again, or "A new version is available" with Reload when a lazily loaded file fails after a deploy; `fallback`, `onError` and `resetKeys` customise it. Also exported: `isChunkLoadError`, `statusPageCopy`.

### Patch Changes

- 29cafed: Untrusted content can no longer stall or crash the page (#165). Markdown and StreamingMarkdown cap nesting (32 block levels, 16 inline levels) and stop scanning unclosed brackets and emphasis markers early: deeply nested quotes or emphasis used to overflow the stack, and 200 kB of `[` took 84 s to parse; every adversarial case now parses in milliseconds. CodeBlock's Bash and Markdown highlighting stay linear on very long lines (up to 26 s before).

## 0.14.0

### Minor Changes

- db957e9: New `AppShell` (#161): the frame of an app, with `AppShellHeader`, `AppShellMain`, `AppShellAside`, `AppShellFooter` and a `Sidebar` (`SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarTrigger`, `SidebarRail`). From `breakpoint` up (a container query on the shell, named `app-shell`) the sidebar sits in the layout and collapses to an icon rail (`collapsible="icon"`, Nav labels move to Tooltips) or hides (`"offcanvas"`); below it the same content opens in a Drawer that closes when a link is followed or a Nav item is chosen. `layout="header"` puts the top bar across the full width with the sidebar below it; `scroll="page"` lets the whole page scroll with a sticky top bar and sidebar, for content sites (the top bar height is `--app-shell-header`). `Sidebar resizable` turns `SidebarRail` into a keyboard-operable splitter. Ctrl+B / ⌘B toggles the sidebar (`shortcut`), except in text fields, contenteditable and during IME composition; with several AppShells on a page only the one that has focus or was clicked last responds, and `SidebarTrigger` shows the label and the shortcut in its Tooltip. `persistKey` keeps the collapsed state and width in a cookie (read it on the server with `readAppShellCookie`); the Drawer is never saved. When the frame crosses the breakpoint with the Drawer open, it closes and focus returns to the trigger, or to the main region if the trigger is hidden. Skip link to the main region, `useAppShell()` for custom parts, strings in `messages.appShell`. `NavItem` gains `tooltip`. The SaaS, Dashboard, AI chat, Admin, Docs, Store, Blog, Landing and Starter templates use it. Thanks [@dave-otf](https://github.com/dave-otf)!
- ae1ec3a: New `yugen-ui/theme-core.css` and `yugen-ui/sources/<Component>.css` (#169). `theme.css` makes Tailwind scan every component, so every app ships the CSS of all of them. `theme-core.css` is the same theme without that scan: add one `@import "yugen-ui/sources/<Folder>.css"` per component the app uses; each file also covers the components it uses inside (`SplitButton.css` includes Menu and Button). `yugen-ui/sources/index.json` maps every export to its file. On the templates this takes CSS from about 25 kB to 14–19 kB gzip. `theme.css` stays the zero-config default.
- 0665b61: New `Markdown` (#263): renders static Markdown (articles, release notes, CMS fields) with `Prose` typography, through the same safe parser as `StreamingMarkdown` (no HTML, `javascript:` and `data:` links keep only their label). Code fences use `CodeBlock`, tables scroll inside a labelled region, task lists read "Done" / "Not done". `inline` renders inline Markdown only, in a `<span>`, for list items and table cells. Relative links (`/path`, `#id`) are kept and external links open in a new tab; `renderLink` hands every link to the app's router. `headingOffset` (default 1, so `#` is `h2`), `headingIds` (ids from the heading text, `slugifyHeading`), `breaks`, `size`. Strings in `messages.markdown`. `parseMarkdown` gains a `relativeLinks` option (off by default, so `StreamingMarkdown` still keeps absolute links only), `parseInlineMarkdown` parses one line, and `sanitizeHref` takes `{ relative: true }`.
- aa52ae4: **Breaking:** built-in strings are English by default. Components show and announce English text ("Close", "Loading…", chart descriptions, live announcements) unless you pass `messages`, and `locale` defaults to `"en-US"` (dates, times, numbers, and a 12-hour TimePicker). For Vietnamese, as before: `<YugenProvider messages={messagesVi} locale="vi-VN">`. New `messagesVi` and per-component `…MessagesVi` for copied source; `…Messages` without a suffix stays the Vietnamese set so existing imports keep working, and `messagesEn` / `…MessagesEn` are the defaults. Helpers follow the same defaults: `formatFileSize`, `validateFiles`, the NotificationCenter time formatters, TimePicker's `getDefaultHourCycle` / `formatTime` / `parseTimeString`, and the DatePicker range presets.
- cec14d2: New shared hooks, the ones the components use themselves (#172): `useControllableState`, `useDisclosure`, `useLocalStorage` (synced across hooks with the same key and across tabs; `serialize` / `deserialize` for keys that are not JSON), `useClipboard`, `useHotkeys` (`mod` is ⌘ on Apple and Ctrl elsewhere; skips form fields, IME composition and held keys; `start` / `end` arrows follow RTL), `useDebouncedValue`, `useIntersection` and `useElementSize` (measures before the first paint). `useMediaQuery` moves next to them; importing it from `yugen-ui` or from Sheet still works. Docs page "Hooks". Thanks [@giabao12-hali](https://github.com/giabao12-hali)!
  
  Components now use them instead of their own copies, with no visible change: controlled / uncontrolled state goes through `useControllableState` in every component except Sheet's snap point and Trace's auto-expand (a callback is no longer called when the value does not change, for example `useTour().start()` while the tour is already open), charts measure with `useElementSize`, the copy buttons use `useClipboard` and now report a refused copy instead of showing "Copied", and `PackageManagerTabs` keeps its saved choice through `useLocalStorage`.
- 1007038: New `Sortable` (#175): `Sortable`, `SortableItem`, `SortableHandle` and `SortableGroup` reorder lists with a mouse, pen, finger or the keyboard (Space or Enter on the handle picks the item up, arrow keys move it, Space or Enter drops it, Escape cancels), and announce every step through `useAnnounce`. Without dragging, click a handle to pick its item up and another item's handle to put it there. Vertical, horizontal (RTL-aware) and grid lists; `SortableGroup` moves items between lists (Kanban columns); the nearest scroll container scrolls near its edges; items slide into place unless reduced motion is on. `onValueChange` runs during the drag, `onSortEnd` once on drop. `SortableItem handle` makes the whole item the drag source and `shortcuts` moves it with Alt + arrow keys, for items that already use Space / Enter. `arrayMove` helper, strings in `messages.sortable`. Written in-house: about 6.5 kB gzip, no drag-and-drop dependency. `DataGrid` gains `columnOrder` (and `getOrderedColumns`); `DataGridColumnPicker` reorders columns when `onColumnOrderChange` is set (drag an item or Alt + ↑ ↓). `TagPicker` gains `reorderable`.

### Patch Changes

- ca051b9: `CodeTabs` and `PackageManagerTabs`: `className` now sizes the outer box. A `w-full` block inside a flex row (a centered demo, a card) used to keep the width of its tab bar and code and run past a narrow screen; it now fits and the tabs wrap.

## 0.13.0

### Minor Changes

- 7996f8d: Glass, part 2 (Yugen Labs). `MenuPopover` and `PopoverSurface` with `material` grow out of the button that opens them and shrink back into it when they close (scale and position from the trigger, read when the animation starts); with reduced motion they keep the plain fade. New `material="glass"` on `Slider` and `Switch`: while pressed or dragged the thumb turns to glass, larger on Slider so the track shows through it, longer on Switch. Names may change before 1.0.
- 1c3f5fd: New `GlassRefraction` (Yugen Labs): render it once at the app root and the edges of every `glass`, `glass-clear` and `glass-tinted` surface bend what is behind them, like the rim of a lens, while the middle stays frosted so text keeps its contrast. Each size and corner radius gets one SVG filter (a displacement map from Snell's law over a convex rim), applied through `backdrop-filter`; only Chromium browsers draw it, Safari and Firefox keep the regular glass. It turns off wherever the blur does (Reduce transparency, Increase contrast, forced colors, the high-contrast theme, glass inside glass) through the new `--glassLensFilter` token. Names may change before 1.0.
- 6f0ad27: New `Sonner`: notifications that stack in a corner, newest in front, and fan out into a list on hover or keyboard focus. Call `sonner("…")`, `sonner.success / info / warning / error / loading` from anywhere; `sonner.promise` turns a loading notification into success or error in place, and calling again with the same `id` updates it. Action and cancel buttons, `richColors`, `closeButton`, swipe to dismiss, F8 to reach the region. Built on Radix Toast, no new dependency. Strings in `messages.sonner`.
  
  New display components (#174): `Timeline` / `TimelineItem` (detailed and compact), `DescriptionList` / `DescriptionItem` (columns that drop on narrow containers, inline layout, copy button; strings in `messages.descriptionList`), `Stat` (the stable version of `StatTile`, with a `chart` slot; strings in `messages.stat`) and `Prose` (typography for Markdown and CMS HTML through the new `yugen-prose` theme utility, zero-specificity selectors, opt out with `not-prose`). `StatTile` is now `Stat` plus a Sparkline and reads `messages.stat`; `messages.chart.increase / decrease / noChange` are deprecated. `CodeBlock`, `Table`, `Quote` and `Timeline` carry `not-prose`.

### Patch Changes

- 8739ba8: `Checkbox`, `Switch` and `Field`: inside a `<form>`, the hidden input (or the hidden `<select>` of `Dropdown`) that Radix adds for form submission stays inside the control. It used to escape a scrolling container and add blank space at the bottom of the page.
- 24daed1: Notice: React 18.3 stays supported for the rest of 0.x; from 1.0, Yugen UI supports React 19 only. Apps still on React 18 should move to React 19 before updating to 1.0.

## 0.12.0

### Minor Changes

- 52ebbf9: DataGrid: people can choose which columns are shown. The new `hiddenColumns` prop hides columns; `DataGridColumnPicker` is the "Columns" button that edits it, and it also works with Table. The menu stays open while columns are checked, a `hideable: false` column and the last visible column can't be hidden, and the sorted column keeps sorting the rows (with an arrow in the menu) while hidden. Hidden columns keep their resized width, pinned columns are re-measured, and keyboard focus stays on the same column instead of the same index. Columns can now set `label` instead of `renderHeaderCell`. `useDataGridColumnVisibility` and `getVisibleColumns` expose the logic.
  
  Menu: long menus scroll inside the viewport instead of overflowing it, and `MenuItemCheckbox` / `MenuItemRadio` accept `secondaryContent` like `MenuItem`.
- 070891c: Glass (Yugen Labs): a translucent material for the navigation layer that floats above content, inspired by Liquid Glass. Turn it on per component with `material="glass" | "glass-clear"` on Toolbar, TabsList, Nav, MenuPopover, PopoverSurface, TooltipContent, DialogSurface, DrawerSurface and SheetContent, `appearance="glass" | "glass-prominent"` on Button and `appearance="glass"` on Input / SearchBox. TabsList gets `minimized` and the `useScrollMinimize` hook for tab bars that shrink while scrolling down. New utilities: `glass`, `glass-clear`, `glass-tinted`, `glass-scrim`, `scroll-edge`, `scroll-edge-above`, `rounded-concentric`. Text keeps 4.5:1 over any backdrop; glass turns opaque with reduced transparency, increased contrast, the high-contrast theme, forced colors or without `backdrop-filter`. Names may change before 1.0.

### Patch Changes

- b354766: ContextMenu, Menubar and every submenu scroll inside the viewport when they are long, like Menu. On touch screens, where there is no hover, Table row actions, subtle selection checkboxes (Table and DataGrid) and Tree item actions are always visible. DataGrid and Table use tabular figures, so numbers line up in a column.

## 0.11.1

### Patch Changes

- 0d825b8: Skeleton: the wave highlight crosses the whole shape and loops smoothly again. Since 0.11.0 it only showed in the last quarter of each cycle, stopped halfway and jumped back, in every shape and in the translucent appearance.

## 0.11.0

### Minor Changes

- 73aa98e: Every built-in component string can be replaced. `YugenProvider` takes `messages` (by component namespace, partial overrides allowed, nested providers inherit) and `locale` (default Intl locale for dates, times and numbers). `messagesEn` switches all built-in strings to English; each component also exports its own `…Messages` defaults and `…MessagesEn`. Vietnamese stays the default, and label props such as `dismissLabel` still take priority. `calendarMessagesEn` leaves `locale` undefined, so Calendar falls back to the en-US locale built into react-day-picker and `messagesEn` adds about 4.5 kB gzip.
- 899d863: Skeleton (wave) and the indeterminate ProgressBar now animate with transforms, so they no longer repaint or re-layout every frame. Two theme utilities back them: `animate-sweep` and `animate-indeterminate-slide`. `animate-shimmer` and `animate-indeterminate` are unchanged for existing uses.

### Patch Changes

- 7fb8afe: Calendar day buttons name the day with a plain number in every locale. With en-US the name said "October 1st" while the button shows "1", which fails WCAG 2.5.3 (Label in Name) for voice control users.
- 888d4e2: Performance: less work in the components' busiest paths, no API changes.
  
  - Charts: date formatters and label widths are reused instead of rebuilt for every data point on every hover step; the data table is only built while it is shown (`ChartContainer`'s `table` also accepts a function).
  - DataGrid: resizing a column no longer re-renders every row (pinned-column offsets come from `--dg-sticky-<col>` CSS variables on the grid), and an inline `getRowId` is no longer called for every row on every render.
  - Tree, List: moving focus with the arrow keys re-renders the two items involved instead of all items.
  - Combobox, TagPicker, Autocomplete: option labels are normalized once per option list, not on every keystroke.
  - MessageScroller, MessageBubble, StreamingMarkdown: streamed tokens skip the new-message scan, unchanged bubbles don't re-render, and an open code fence is highlighted at low priority.
  - NotificationPanel formats only the open tab; Carousel autoplay stops its per-frame loop when there is no progress bar and pauses offscreen; `useMediaQuery` reuses one MediaQueryList per query.

## 0.10.0

### Minor Changes

- b8bdbc1: Spacing uses Tailwind's numeric scale. Components, docs examples, templates and the shadcn registry now use `p-3`, `gap-2`, `mt-6` instead of the upper-case Fluent aliases (`p-M`, `gap-S`, `mt-XXL`). The Fluent spacing ramp is the same as Tailwind's 4px scale, so nothing moves at the default 16px root font size. The numeric scale is in `rem`, so spacing now follows the user's browser font size, as the numeric sizes (`h-8`, `size-5`) already did.
  
  Deprecated: the upper-case spacing aliases (`--spacing-XXS` … `--spacing-XXXL` in `theme.css` and the matching group in `cn()`). They still work and will be removed in 1.0. Rename them as XXS → 0.5, XS → 1, SNudge → 1.5, S → 2, MNudge → 2.5, M → 3, L → 4, XL → 5, XXL → 6, XXXL → 8.

### Patch Changes

- 6260f9c: `cn()` uses tailwind-merge 3, the release built for Tailwind CSS v4. Classes with the v4 trailing important modifier now merge (`cn("size-4!", "size-5!")` gives `size-5!`; tailwind-merge 2 kept both). tailwind-merge adds about 2 kB gzipped to `cn`. If your app calls tailwind-merge 2 directly, it keeps working: npm installs each version separately.

## 0.9.0

### Minor Changes

- 230a5da: React 19 is now the default. The docs site, the tests and the templates run on React 19, so new apps from `create-yugen-ui` start on it. React 18.3 is still supported and tested in CI. The end of React 18 support will be announced at least one minor release ahead, as the versioning policy requires.

### Patch Changes

- 7d35697: AvatarGroup: the overflow button's accessible name now starts with the count it shows ("+2 Xem thêm 2 thành viên"), as WCAG 2.5.3 Label in Name requires. `overflowLabel` is read after the count instead of replacing it. With `overflowIndicator="icon"`, `overflowLabel` is still the button's whole name.
- a33235f: Tooling: tests run on Vitest 5 and jsdom 30, size budgets on size-limit 14, and CI on Node 22, 24 and 26 (Node 20 reached end of life). Contributors need Node 24 LTS or 22.22+. The npm package is unchanged.

## 0.8.3

### Patch Changes

- b044bcb: Docs site: the create-project commands now work in Windows PowerShell. They use `npx create-yugen-ui@latest my-app --template <name>`, because PowerShell drops the `--` in `npm create yugen-ui@latest my-app -- --template <name>` and npm then reads `--template` as its own option. `cd my-app` and `npm run dev` go on separate lines instead of being chained with `&&`, which Windows PowerShell 5.1 rejects. The npm package is unchanged.

## 0.8.2

### Patch Changes

- e3d0dbc: AriaLive: the fallback announcer (used when there is no `AriaLiveAnnouncer`) no longer throws "window is not defined" when its queued timers fire after the window is gone, for example after a test environment is torn down.
- Docs site: new CLI page (`#/concepts/cli`) for `@yugen-ui/cli` — `npm create yugen-ui@latest` creates an app from a template, `npx @yugen-ui/cli@latest init` sets up an existing project, `add` copies component source. The home page gains a "Start a new project" section and a CLI tab in the install box, component pages a "yugen CLI" import tab, and Quick start, Templates and the template READMEs lead with the CLI. The npm package is unchanged.

## 0.8.1

### Patch Changes

- 7cb3170: Docs site: one Appearance menu in the top bar for mode, brand and text direction, with the language switch available on every screen size; component examples get a one-row toolbar that collapses to icons on small screens; the home page has a new hero, an npm / shadcn install snippet and a searchable component list that opens one demo at a time on phones. New ink-brush logo and favicon. The npm package is unchanged.

## 0.8.0

### Minor Changes

- 68a54b3: shadcn registry: set up a project in one command — `npx shadcn@latest init https://trandat1114.github.io/Yugen-UI/r/init.json` (Next.js App Router / React Router: `init-next.json`) creates `components.json` if missing, copies the theme, `cn()` and `YugenProvider`, installs the npm packages and adds the theme `@import` to your main CSS file, without the default shadcn/ui style. The `theme` and new `theme-next` items now import themselves into your CSS.

  **Breaking (registry only):** component items no longer pull in `theme`. Run `init` once per project, or add `…/r/theme.json` (Next.js: `theme-next.json`) together with your first component. The npm package is unchanged.

### Patch Changes

- dc72f1a: Templates: new `vite-starter` (blank start with a persisted theme, `@/` alias, SEO basics and a cherry-blossom welcome page to delete), `vite-saas` (8-page app with sidebar, Ctrl K command palette and notifications) and `vite-blog` (Markdown posts, build-time HTML per post, `sitemap.xml` and `rss.xml`). Create a project with `npx giget@latest gh:trandat1114/Yugen-UI/templates/vite-starter my-app --install`, or preview every template at `#/templates` on the docs.

## 0.7.0

### Minor Changes

- ad4d8c1: New `Autocomplete`: a search box with suggestions following the ARIA combobox pattern — accent-insensitive filtering ("xoai" matches "Xoài"), match highlighting, grouped suggestions with icons and descriptions, disabled items, `minChars={0}` for recent searches, server-side mode (`filter={false}` + `loading` with a 300 ms spin delay), `onSelect` for suggestions and `onSubmit` for the raw query. Also exports `HighlightMatch` and `highlightRanges` for highlighting matches in filtered lists.
- ad4d8c1: New `Quote` component: attributed quotations rendered as `<figure>` › `<blockquote cite>` + `<figcaption>` (author, title, `<cite>` source with optional link), with `default`, `subtle` and `emphasis` (testimonial) appearances and three sizes. The accent bar uses logical borders, so it flips in RTL.

## 0.7.0-next.0

### Minor Changes

- ad4d8c1: New `Autocomplete`: a search box with suggestions following the ARIA combobox pattern — accent-insensitive filtering ("xoai" matches "Xoài"), match highlighting, grouped suggestions with icons and descriptions, disabled items, `minChars={0}` for recent searches, server-side mode (`filter={false}` + `loading` with a 300 ms spin delay), `onSelect` for suggestions and `onSubmit` for the raw query. Also exports `HighlightMatch` and `highlightRanges` for highlighting matches in filtered lists.
- ad4d8c1: New `Quote` component: attributed quotations rendered as `<figure>` › `<blockquote cite>` + `<figcaption>` (author, title, `<cite>` source with optional link), with `default`, `subtle` and `emphasis` (testimonial) appearances and three sizes. The accent bar uses logical borders, so it flips in RTL.

## 0.6.0

### Minor Changes

- Charts: new `ScatterChart` (bubble size, groups with marker shapes, nearest-point tooltip, keyboard navigation, optional least-squares trend line) and `Heatmap` (sequential or diverging scale with gradient legend, 2-D keyboard navigation); `AreaChart` gains `stackOffset="expand"` (100 % stacked); `LineChart` / `AreaChart` gain a `brush` overview strip with `domain` / `defaultDomain` / `onDomainChange` for zooming.
- New `DataGrid`: typed columns (`createColumn`), stable sorting with `aria-sort`, single / multi row selection (Space, Shift ranges, Ctrl+A, indeterminate header checkbox), resizable columns (pointer, keyboard, double-click to fit; mirrored in RTL), virtualization for large lists with correct `aria-rowcount` / `aria-rowindex`, cell or row keyboard navigation, sticky header and leading columns, and loading / empty states.
- New `FileUpload` (dropzone with click, keyboard, drag-and-drop and paste; `accept` / `maxFiles` / `maxSize` / custom validation with inline errors; per-file progress, status, retry and thumbnails) and `Stepper` / `Step` / `Wizard` (horizontal or vertical steps, linear mode, per-step sync or async validation, compact "Bước n/N" view on narrow containers, RTL-aware connectors).
- Yugen Labs AI kit and more: `StreamingMarkdown` (safe Markdown renderer for token-by-token answers — no `dangerouslySetInnerHTML`, `javascript:` links rejected, code blocks via `CodeBlock`, tables, citations), `Citation` / `CitationList`, `Reasoning` (collapsible thinking block with elapsed time), `PromptInput` (auto-growing composer with attachments, validation, Send/Stop), `Tour` (guided tour with spotlight and `useTour()`), and `NotificationCenter` (bell with unread count, popover on desktop and bottom sheet on mobile, grouped by day, mark read / dismiss).
- New `Overflow` (priority-aware collapsing of toolbar, tab, breadcrumb or tag items into a "more" menu; `OverflowItem`, `OverflowDivider`, `useOverflowMenu`, `useOverflowItems`) and `TimePicker` (typed-time parsing such as "9h30" or "9:30 PM", increments, min/max bounds, 12/24-hour cycle from the locale, works inside `Field`). `DateRangePicker` gains `presets` and `DEFAULT_RANGE_PRESETS` (today, last 7 / 30 days, this month, last month).
- shadcn CLI registry: install any component as source code with `npx shadcn@latest add https://trandat1114.github.io/Yugen-UI/r/<name>.json` (or `@yugen/<name>` with a namespaced registry). Each item brings the components it imports, `cn()` and the theme (`styles/yugen.css`), and installs the npm dependencies it needs. Component pages in the docs now show npm, shadcn CLI and in-repo import snippets.
- Token export: `rampToDesignTokens()` (W3C Design Tokens / DTCG) and `rampToTokensStudio()` (Tokens Studio for Figma) turn a brand ramp into JSON with the 16 ramp steps plus light and dark brand aliases (`BRAND_ALIAS_STEPS`). The Theme Designer can now copy or download CSS, DTCG JSON and Tokens Studio JSON.

### Patch Changes

- Accessibility and RTL fixes found by the new axe and drag tests: `Tabs` gives the active tab an accessible name and only points `aria-controls` at rendered panels; `ScrollArea` viewports are keyboard-focusable; the `DatePicker` trigger uses `role="combobox"`; `Command` separators, `List` multiselect checkboxes and the `Resizable` collapse button no longer nest interactive controls; the warning `Badge` uses the new `colorNeutralForeground1Static` token for contrast; themes nested inside high contrast no longer inherit the cyan accent; `Resizable` drag and arrow keys follow the pointer in RTL.
- React 19 compatibility: `SpinButton` no longer calls `useRef` without an initial value, so the package typechecks with `@types/react` 19. CI now runs the type check, unit tests and library build against React 19 as well as React 18.
- SSR and hydration fixes: `Resizable` groups with `persistKey` now apply the saved layout after hydration instead of during render (no mismatch); components that measure layout use an isomorphic layout effect, so React 18 servers no longer warn about `useLayoutEffect`; `formatTraceDuration` rounds 999.6 ms to "1.0s" and 59.96 s to "1m 00s".

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).
While the version is `0.x`, minor releases may contain breaking changes.

From **0.6.0** on, entries are generated by [Changesets](https://github.com/changesets/changesets): every pull request
with a user-facing change adds one with `npx changeset`, and `npx changeset version` writes them here at release time
(newest release at the top of the file, as `## x.y.z`). Entries for 0.5.0 and earlier were written by hand.

## [Unreleased]

## [0.5.0] - 2026-10-20

### Added

- **Yugen Labs** components: Trace, Questionnaire, Message Scroller, Code Block, Charts (with chart tokens),
  Sheet and Wait UX (loading patterns).
- **npm package** `yugen-ui`: tree-shakeable ESM build (`preserveModules`), TypeScript declarations, `"use client"`
  directives for the Next.js App Router, and three stylesheets — `theme.css` (Tailwind v4 source),
  `styles.css` (precompiled, no Tailwind needed) and `tokens.css` (raw CSS variables).
- `cn()` and the brand-ramp helpers (`generateBrandRamp`, `adjustKeyForContrast`, `contrastRatio`, `rampToCss`,
  `rampToStyle`…) exported from the package entry.
- Community and News pages on the docs site.
- `lint:classes` script: Tailwind canonical-class checker (`--fix` to repair).
- Open-source files: README (English / Tiếng Việt), LICENSE, CONTRIBUTING, CODE_OF_CONDUCT, SECURITY, issue and PR
  templates, CI and release workflows.

### Changed

- `react` and `react-dom` (>= 18) are now peer dependencies; `tailwindcss` v4 is an optional peer.
- The docs site builds to `dist-docs/`; `dist/` is reserved for the library.
- The docs site is deployed to GitHub Pages (`.github/workflows/pages.yml`).

### Fixed

- `ChartLegendProps` no longer conflicts with the DOM `onToggle` event type of `@types/react` 19.
- `Trace`: the live duration of a running step is rendered after mount, so server and client HTML match
  (no hydration error in Next.js).
- Charts read `forced-colors` with `useSyncExternalStore`, so server and client agree during hydration.

## [0.4.0] - 2026-10-20

### Added

- **Concepts** docs section (introduction, quick start, styling, theming, accessibility, focus indicator, labelling,
  positioning, notifications, slots, truncation, SSR, browser support, migration from Fluent and shadcn/ui).
- **RTL** support across all components (logical properties, Radix `DirectionProvider`, direction-aware keyboard
  navigation and slide animations).
- **High contrast** theme (`data-theme="high-contrast"`).
- `YugenProvider` (theme, brand, direction, tooltip provider and toaster) with `useYugen` and `usePortalThemeProps`.
- **Theme Designer**: generate a custom brand ramp from one key colour with contrast checks.
- **Motion** components (Fade, Scale, Slide, Collapse, Blur, Rotate, Stagger, `usePresence`) and utilities
  (VisuallyHidden, AriaLive announcer with `useAnnounce`, focus-management hooks).

## [0.3.0] - 2026-10-20

### Added

- **Sakura 桜** brand, now the default brand.
- 47 new components, covering most of the shadcn/ui and Fluent 2 catalogues.
- **Blocks**: copy-ready page sections built only from library components.

### Changed

- Project renamed to **Yugen UI**.

## [0.2.0] - 2026-10-20

### Added

- Foundation pages: Color, Typography, Spacing, Radius, Elevation and Motion.
- Gradient tokens and utilities (for illustration and hero areas only).
- Brand themes switchable with `data-brand`.

### Changed

- Docs site redesigned after the Fluent 2 documentation.

## [0.1.0] - 2026-10-20

### Added

- Fluent 2 design tokens (global and alias layers; light and dark themes) bridged to Tailwind CSS v4 utilities.
- 11 core components.
- Documentation site.

[Unreleased]: https://github.com/trandat1114/Yugen-UI/compare/v0.11.1...HEAD
[0.16.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.16.0
[0.15.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.15.0
[0.14.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.14.0
[0.13.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.13.0
[0.12.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.12.0
[0.11.1]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.11.1
[0.11.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.11.0
[0.10.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.10.0
[0.9.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.9.0
[0.8.3]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.8.3
[0.8.2]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.8.2
[0.8.1]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.8.1
[0.8.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.8.0
[0.7.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.7.0
[0.6.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.6.0
[0.5.0]: https://github.com/trandat1114/Yugen-UI/releases/tag/v0.5.0
