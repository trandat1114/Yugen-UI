---
"yugen-ui": patch
---

AppShell: a `SidebarTrigger` placed inside `Sidebar` (as the last item of `SidebarFooter`) is now the wide-screen collapse button. It sits in the rail's icon column, so it keeps the same position when the sidebar collapses or expands, and with `collapsible="offcanvas"` it stays at that corner while the sidebar is hidden. When a shell has one, the `SidebarTrigger` in the top bar only opens the Drawer on narrow frames. Templates use it (#482).
