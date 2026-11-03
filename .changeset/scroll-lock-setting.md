---
"yugen-ui": minor
---

`YugenProvider scrollLock` chooses whether the page scrollbar stays while Menu, ContextMenu or Dropdown is open (#243). These surfaces lock page scrolling through Radix (react-remove-scroll), which hides the scrollbar and adds a body margin in its place. `"hide-scrollbar"` keeps that behavior and stays the default in 0.x; with `"keep-scrollbar"` the scrollbar stays and nothing shifts, while wheel and touch scrolling outside the surface are still blocked. With `applyToDocument` the provider writes `data-yugen-scroll-lock` to `<html>`; apps without the provider can set the attribute themselves (the CSS is in `theme.css`). Menu and ContextMenu document `modal={false}` for a menu that doesn't lock scrolling at all. 1.0 will switch the default to `"keep-scrollbar"`.
