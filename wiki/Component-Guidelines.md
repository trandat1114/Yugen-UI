# Component Guidelines

*Tiếng Việt: [Component-Guidelines-vi](Component-Guidelines-vi).*

The full, mandatory rules are in [`Design.md`](https://github.com/trandat1114/Yugen-UI/blob/main/Design.md). This page is a
shortcut for when you start work.

## Add a component, step by step

1. Open / pick up an issue (`confirmed`, or an idea agreed on in Discussions **Ideas**).
2. `src/components/ui/<Name>/<Name>.tsx`: a named function component that takes `ref` as a prop (no `forwardRef`, no
   `displayName`), `className` last in `cn()`, Vietnamese JSDoc.
3. Add `export * from "./<Name>/<Name>";` to the right group in `src/components/ui/index.ts`.
4. Docs page: add a `ComponentDoc` to a `src/docs/registry/*.tsx` file. `slug`, `name`, `category`, `lead` are string literals;
   each example's `code` must run when copied out (use `setup` for shared data).
5. English description: `<slug>: { lead: "…" }` in `src/docs/i18n/en/components.ts` (required by a test).
6. Tests: `<Name>.test.tsx` next to the component (behavior, keyboard, ARIA). Add an SSR case to `src/test/ssrCases.tsx` if some state depends on the environment.
7. `npx changeset` → choose `minor` (new component) and write one sentence for users (in English).
8. Run the checklist in [[Testing and Quality]] + axe for your page:
   `npx playwright test e2e/a11y.spec.ts --project=a11y --grep "<slug>"`.

## Real example: adding `Quote` and `Autocomplete` (0.7, `next` branch)

| Step | What | Files |
|---|---|---|
| 1 | Branch `feat/quote-autocomplete` from `next` (new feature → `next`) | — |
| 2 | Components, reusing what already exists: `SearchBox`, `listboxOptionClass`, `popoverSurfaceClass`, `normalizeSearchText`, `useSpinDelay` | `src/components/ui/Quote/`, `Autocomplete/` |
| 3 | Export into the right group of the barrel | `src/components/ui/index.ts` |
| 4 | Docs page, code trimmed with `#region` | `src/docs/registry/content-search.tsx` |
| 5 | English descriptions for the 2 slugs | `src/docs/i18n/en/components.ts` |
| 6 | Tests: diacritic-insensitive matching, ↓/Enter/Esc, combobox ARIA, `<figure>` semantics | `Autocomplete.test.tsx` |
| 7 | `check:examples`, `check:props`, axe by slug → fix the non-focusable scroll region that axe reported | — |
| 8 | 2 `minor` changesets (one file per component); fixing the SearchBox example is docs only → no changeset | `.changeset/*.md` |
| 9 | PR into `next`; the maintainer publishes `0.7.0-next.N` when users should try it | — |

Lessons learned: Radix Popover catches Esc at the document level before the input does, so close the popover through
`onOpenChange`, don't only listen to `onKeyDown`. Files may use CRLF, so bulk-editing scripts must normalize line endings.

## The 10 most common mistakes

| Wrong | Right |
|---|---|
| `bg-[#c2347a]`, `p-[12px]`, `duration-[200ms]` | `bg-brand-background`, `p-3`, `duration-normal` |
| `ml-2`, `left-0`, `text-left` | `ms-2`, `inset-s-0`, `text-start` |
| `start-4`, `data-[disabled]:`, `p-M` | `inset-s-4`, `data-disabled:`, `p-3` (`npm run lint:classes -- --fix`) |
| `outline-none` with no replacement | keep the focus ring `focus-visible:outline-stroke-focus` |
| Directional icons that don't flip | `rtl:-scale-x-100` |
| Reading `Date.now()` / `window` / `matchMedia` during render | an effect, or `useSyncExternalStore` + a server snapshot |
| `useLayoutEffect` directly | `useIsomorphicLayoutEffect` (`_internal/`) |
| Hand-written popup / menu | Radix primitive + `usePortalThemeProps()` |
| Icon-only button with no name | Vietnamese `aria-label` |
| Renaming a prop right away | add the new prop + `warnDeprecated()`, remove the old one in a major; see [Versioning](https://trandat1114.github.io/Yugen-UI/#/concepts/versioning) |

## Yugen Labs

Components beyond Fluent 2 (AI kit, Chart, Trace, DataGrid…) are in the **Yugen Labs** group, with their own rules in
Design.md §7.1 (for example Chart: categorical colors in a fixed order, one Y axis, always an equivalent data table).
