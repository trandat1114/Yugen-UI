---
"yugen-ui": minor
---

Yugen Labs: `glassNavigationDefaults`, a set of default props for `YugenProvider` that gives every navigation component with glass `material="glass"` in one place (#230): `<YugenProvider defaults={glassNavigationDefaults}>`, or `{ ...glassNavigationDefaults, Button: { … } }` together with other defaults. It covers Toolbar, TabsList, Nav, MenuPopover, MenuSubPopover, PopoverSurface, TooltipContent, DialogSurface, DrawerSurface and SheetContent; a `material` prop on an instance still wins. MenuSubPopover exports its props type, `MenuSubPopoverProps`.
