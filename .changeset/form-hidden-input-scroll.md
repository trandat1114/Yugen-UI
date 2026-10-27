---
"yugen-ui": patch
---

`Checkbox`, `Switch` and `Field`: inside a `<form>`, the hidden input (or the hidden `<select>` of `Dropdown`) that Radix adds for form submission stays inside the control. It used to escape a scrolling container and add blank space at the bottom of the page.
