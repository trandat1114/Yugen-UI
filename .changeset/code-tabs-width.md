---
"yugen-ui": patch
---

`CodeTabs` and `PackageManagerTabs`: `className` now sizes the outer box. A `w-full` block inside a flex row (a centered demo, a card) used to keep the width of its tab bar and code and run past a narrow screen; it now fits and the tabs wrap.
