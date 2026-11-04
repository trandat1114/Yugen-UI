---
"yugen-ui": minor
---

New `useYugenTheme()` (`{ theme, brand, dir }`) and `useYugenLocale()` (the Intl locale): unlike `useYugen()`, a component that reads one of them does not re-render when the other changes. `YugenProvider` keeps the theme in its own context, so a theme switch no longer re-renders every control that reads `defaults` or `messages`: with 1,800 controls and stable children (a Next.js `Providers` component, a wrapper that passes `children`), it goes from about 66 ms and 1,500 re-renders to 1.4 ms and none. `messages` written inline (`messages={{ dialog: { close: "Close" } }}`, `{ ...messagesVi, … }`) is now compared by value like `defaults`, so a parent re-render with the same strings no longer re-renders those controls (66 → 0.1 ms). Charts, CodeBlock, the date and time pickers and the other components that need only the theme or the locale use the new hooks. `useYugen()` returns the same fields as before (#347).
