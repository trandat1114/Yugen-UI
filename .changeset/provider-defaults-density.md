---
"yugen-ui": minor
---

`YugenProvider` takes `defaults` and `density` (#171). `defaults={{ Button: { shape: "circular" }, Input: { appearance: "filled-darker" } }}` sets props for every instance of a component in that part of the UI, typed per component; a prop on the instance still wins and nested providers merge per component. `density="compact"` gives controls (buttons, fields, pickers, tabs, toolbars, tables, Tree, Nav…) size small by default and scales spacing by 0.9375; `"comfortable"` scales spacing by 1.125. Spacing comes from a `data-density` attribute in `theme.css` (`--spacing` and the spacing tokens, the same factors as the Theme Designer), so prerendered HTML is right before hydration. `useYugen()` also returns `density`. Each component reads its defaults with one context read.
