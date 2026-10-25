# Accessibility

Yugen UI aims to meet **[WCAG 2.1](https://www.w3.org/TR/WCAG21/) Level AA** in every component: in the light, dark
and high contrast themes, in left-to-right and right-to-left layouts, and with keyboard, pointer and touch input.

How to use the components accessibly (keyboard patterns, labels, a checklist before you ship):
[Accessibility](https://trandat1114.github.io/Yugen-UI/en/concepts/accessibility) in the docs.

## What we test

On every pull request:

- **axe** with the WCAG 2.0 and 2.1 A / AA rules on every page of the docs site in the light theme, and the color
  contrast rules in the dark theme and in high contrast (`e2e/a11y.spec.ts`).
- **Keyboard flows** for dialogs, menus, comboboxes, date pickers and toasts: focus stays inside dialogs, arrow keys,
  Home / End and typeahead move, Escape closes, and focus returns to the trigger (`e2e/keyboard.spec.ts`).
- **Touch and small screens** (`e2e/touch.spec.ts`, `e2e/responsive.spec.ts`), and the reduced-motion preview on the
  Motion page (`e2e/motion.spec.ts`).
- **Templates:** axe on every page of each app template, built with the pull request's own package.
- **Unit tests** next to the components check roles, names, states and keyboard handling.

Every week, and on pull requests into `main`, the same end-to-end tests run in Firefox and WebKit. The maintenance
schedule includes a manual pass with NVDA on Windows and VoiceOver on macOS and iOS every quarter.

Automated checks find only part of the problems. Reports from people who use assistive technology every day are the
most useful ones.

## Supported browsers and assistive technology

- **Browsers:** the last two versions of Chrome and Edge (111+), Firefox (128+) and Safari on macOS and iOS (16.4+).
  Details: [Browser support](https://trandat1114.github.io/Yugen-UI/en/concepts/browser-support).
- **Screen readers checked by hand:** NVDA on Windows, VoiceOver on macOS and iOS.
- **Checked automatically:** the built-in high contrast theme (color contrast rules).
- **Motion:** components follow `prefers-reduced-motion`; the
  [Motion](https://trandat1114.github.io/Yugen-UI/en/foundations/motion) page previews it.
- Reports from JAWS, Narrator, TalkBack, Windows forced colors (high contrast mode), voice control, switch access and
  screen magnifiers are welcome too.

## Known limitations

No component is exempt from the automated checks. The only allowed exception is on a docs page: the contrast table on
Foundations › Color draws non-text token pairs (decorative borders, disabled states) on purpose.

Open problems are tracked as issues with the
[`accessibility` label](https://github.com/trandat1114/Yugen-UI/issues?q=is%3Aissue+is%3Aopen+label%3Aaccessibility).

## Reporting a problem

Open an issue with the
[Accessibility issue](https://github.com/trandat1114/Yugen-UI/issues/new?template=accessibility.yml) template, in
English or Vietnamese. Please include:

- the component or docs page;
- the steps, including the keys you pressed;
- what you heard or saw, and what you expected;
- the browser, assistive technology and operating system, with versions;
- the theme (light, dark, high contrast) and direction (LTR, RTL), if they matter.

Say so if the problem blocks people from using a product built with Yugen UI. Our targets for a first response are
**3 days** for blocking problems and **7 days** for other accessibility issues. These are targets, not guarantees.
Fixes are listed in the [changelog](./CHANGELOG.md).

## For contributors

A new or changed component needs tests for its roles, names and keyboard handling, and has to pass axe on its docs
page:

```bash
npx playwright test e2e/a11y.spec.ts --project=a11y --grep "<slug>"
```

See [CONTRIBUTING.md](./CONTRIBUTING.md) and the
[checklist before you ship](https://trandat1114.github.io/Yugen-UI/en/concepts/accessibility) in the docs.
