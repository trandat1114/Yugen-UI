---
"yugen-ui": minor
---

Glass (Yugen Labs): a translucent material for the navigation layer that floats above content, inspired by Liquid Glass. Turn it on per component with `material="glass" | "glass-clear"` on Toolbar, TabsList, Nav, MenuPopover, PopoverSurface, TooltipContent, DialogSurface, DrawerSurface and SheetContent, `appearance="glass" | "glass-prominent"` on Button and `appearance="glass"` on Input / SearchBox. TabsList gets `minimized` and the `useScrollMinimize` hook for tab bars that shrink while scrolling down. New utilities: `glass`, `glass-clear`, `glass-tinted`, `glass-scrim`, `scroll-edge`, `scroll-edge-above`, `rounded-concentric`. Text keeps 4.5:1 over any backdrop; glass turns opaque with reduced transparency, increased contrast, the high-contrast theme, forced colors or without `backdrop-filter`. Names may change before 1.0.
