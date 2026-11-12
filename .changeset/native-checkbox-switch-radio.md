---
"yugen-ui": minor
---

**Breaking:** Checkbox, Switch and Radio render a native `<input>` instead of a Radix `<button>` (#357). Mount and hydration take one commit instead of three (measured in #357 with 500 checkboxes: hydrate 181 → 49 ms), the value goes with the form, FormData, autofill and form reset without a hidden copy, and the arrow keys move between radios natively. DataGrid drops from 28 to 20.3 kB gzip. Migration: `ref` now points to an `HTMLInputElement`; Checkbox's `onCheckedChange` receives a boolean (it never received `"indeterminate"` from a click); RadioGroup no longer takes Radix's `loop`, `orientation` or `asChild`. `data-state="checked | unchecked | indeterminate"` stays on the input, so `data-[state=checked]:` styles keep working, but selectors that name the element (`button[data-state=checked]`) need `input` or `:checked` (Tailwind `has-checked:`). `@radix-ui/react-switch` is no longer a dependency.
