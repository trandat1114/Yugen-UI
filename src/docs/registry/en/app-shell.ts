import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/app-shell.tsx.
export const en: Record<string, ComponentDocEn> = {
  appshell: {
    description:
      "AppShell places its parts on a grid: Sidebar on the start side, AppShellHeader on top, AppShellMain in the middle and AppShellAside on the end side; a part you leave out takes no space. From `breakpoint` up (a container query, so it follows the frame, not the screen) the sidebar sits in the layout and SidebarTrigger collapses it to an icon rail, with item names in Tooltips. Below it, the same content opens in a Drawer: following a link or choosing a Nav item closes it and focus returns to the button that opened it. Ctrl+B (⌘B) works like SidebarTrigger, except while typing in a field or composing with an IME; on a page with several AppShells (like this one) only the frame that has focus or was clicked last responds. `persistKey` saves the collapsed state (and width) in a cookie; the Drawer is never saved. With server rendering, read the cookie with `readAppShellCookie(cookieHeader, key)` and pass `defaultCollapsed` so nothing flashes. The demos below sit inside the docs page, so AppShellMain uses `asChild` with a `div` (a page has one `<main>`).",
    examples: [
      {
        title: "Narrow frame",
        description: "Below the breakpoint, SidebarTrigger opens the sidebar in a Drawer. Choosing an item closes it.",
      },
      {
        title: "Sidebar + aside",
        description:
          "AppShellAside sits after the content and shows from the breakpoint up. On narrow frames, move its content to a Sheet or its own page.",
      },
      {
        title: "Header only",
        description: "No Sidebar: its column is 0 wide and AppShellHeader spans the full width.",
      },
      {
        title: "Hidden sidebar & useAppShell",
        description:
          "collapsible=\"offcanvas\" suits lists without icons (conversations, files): collapsing hides it completely. A button in the sidebar that is not a link closes the Drawer itself with useAppShell().",
      },
    ],
    dos: [
      "Put AppShell at the root of the app, as tall as the screen; content scrolls inside AppShellMain.",
      "Give every NavItem in the sidebar an icon when using collapsible=\"icon\", so the rail stays usable.",
      "Use persistKey so people find the sidebar as they left it when they come back.",
    ],
    donts: [
      "Don't put anything other than AppShell parts directly inside AppShell: the grid will place it in an empty cell.",
      "Don't nest AppShellMain (a <main>) in a page that already has one; use asChild with a div.",
      "Don't change Ctrl+B to a key the browser or an editor already uses.",
    ],
    props: {
      breakpoint: "Frame width (32 / 36 / 42 / 48 / 56 / 64rem) from which the sidebar sits in the layout; below it, a Drawer.",
      "collapsed / defaultCollapsed": "Sidebar collapsed on wide frames.",
      onCollapsedChange: "Called when the sidebar collapses or expands.",
      persistKey: "Cookie name for the collapsed state and width; a saved value wins over defaultCollapsed.",
      shortcut: "Key used with Ctrl / ⌘; false turns it off. With several AppShells on a page, only the one that has focus or was clicked last responds.",
      skipLink: "A “Skip to content” link shown on focus.",
      "Sidebar.collapsible": "Collapse to an icon rail, hide completely, or always stay open.",
      "Sidebar.resizable": "SidebarRail becomes a splitter that resizes the sidebar (arrow keys, Home / End, Enter collapses).",
      "Sidebar.defaultWidth / minWidth / maxWidth": "Open width in px.",
      "Sidebar.label": "Name of the Drawer on narrow frames.",
      "SidebarGroup.label": "Group name; in the rail it is kept for screen readers only.",
      "AppShellHeader / AppShellMain / AppShellAside.asChild": "Render the header / main / aside as the child element.",
      "useAppShell()": "narrow, collapsed, setCollapsed, drawerOpen, setDrawerOpen, toggleSidebar, rail.",
      "readAppShellCookie(cookie, persistKey)": "Reads the saved state from document.cookie, or from the Cookie header when rendering on the server.",
    },
  },
};
