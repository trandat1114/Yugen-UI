---
"yugen-ui": minor
---

New `NavigationMenu` for website headers (#168), built on Radix Navigation Menu (new dependency `@radix-ui/react-navigation-menu`): `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink` (`active` sets `aria-current="page"`; `icon` and `description` inside a panel; `asChild` for router links) and `NavigationMenuIndicator`. Hover intent with a short delay, `activationMode="manual"` to open on click only, keyboard support per the WAI-ARIA disclosure navigation pattern, one floating viewport that resizes to the open panel, RTL. The `<nav>` label comes from `messages.navigationMenu`.
