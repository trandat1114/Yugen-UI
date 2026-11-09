import type { ComponentDocEn } from "../../types";

// English text for src/docs/registry/app-shell.tsx.
export const en: Record<string, ComponentDocEn> = {
  appshell: {
    description:
      "AppShell places its parts on a grid: Sidebar on the start side, AppShellHeader on top, AppShellMain in the middle and AppShellAside on the end side; a part you leave out takes no space. From `breakpoint` up (a container query, so it follows the frame, not the screen) the sidebar sits in the layout and SidebarTrigger collapses it to an icon rail, with item names in Tooltips. Below it, the same content opens in a Drawer: following a link or choosing a Nav item closes it and focus returns to the button that opened it. Ctrl+B (⌘B) works like SidebarTrigger, except while typing in a field or composing with an IME; on a page with several AppShells (like this one) only the frame that has focus or was clicked last responds. `persistKey` saves the collapsed state (and width) in a cookie; the Drawer is never saved. With server rendering, read the cookie with `readAppShellCookie(cookieHeader, key)` and pass `defaultCollapsed` so nothing flashes. AppShell is a container named `app-shell`: parts that follow the frame width use `@3xl/app-shell:…`. The top bar height is the `--app-shell-header` variable (3.5rem by default); SidebarHeader and the sticky parts follow it. SidebarTrigger has a Tooltip with its label and shortcut. The demos below sit inside the docs page, so AppShellMain uses `asChild` with a `div` (a page has one `<main>`).",
    examples: [
      {
        title: "Narrow frame",
        description: "Below the breakpoint, SidebarTrigger opens the sidebar in a Drawer. Choosing an item closes it.",
      },
      {
        title: "Changing the breakpoint",
        description:
          "breakpoint=\"2xl\" (42rem). The breakpoint is measured against the AppShell's own width, not the screen: drag the frame's bottom corner to try it. Crossing it while the Drawer is open closes the Drawer and moves focus to SidebarTrigger, or to the content when the trigger is hidden; the collapsed state is kept. For your own parts that should switch at the same point, use `@2xl/app-shell:…`, or `useAppShell().narrow` for behavior (always false during server rendering). `md:` and useMediaQuery follow the screen, so they won't line up.",
      },
      {
        title: "Sidebar + aside",
        description:
          "AppShellAside sits after the content and shows from the breakpoint up. On narrow frames, move its content to a Sheet or its own page.",
      },
      {
        title: "Content page: the whole page scrolls",
        description:
          "No Sidebar, so its column is 0 wide. scroll=\"page\" suits content sites (blog, store, landing): the whole page scrolls, the top bar sticks and AppShellFooter sits at the end of the page. Inside an area that scrolls itself, like this frame, that area takes the place of the window.",
      },
      {
        title: "Top bar across",
        description: "layout=\"header\": the top bar (logo, search, account) spans the full width and the sidebar sits below it. Suits admin pages.",
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
      breakpoint:
        "AppShell width (not the screen width) from which the sidebar sits in the layout and AppShellAside shows: 32 / 36 / 42 / 48 / 56 / 64rem, the same sizes as the `@lg` … `@5xl` container queries. Below it, a Drawer.",
      layout: "sidebar: the sidebar runs the full height with the top bar beside it. header: the top bar spans the full width with the sidebar below it.",
      scroll: "main: the frame is as tall as the screen and AppShellMain scrolls (apps). page: the whole page scrolls, the top bar and sidebar stick (content sites).",
      "collapsed / defaultCollapsed": "Sidebar collapsed on wide frames.",
      onCollapsedChange: "Called when the sidebar collapses or expands.",
      persistKey:
        "Cookie name for the collapsed state and width; a saved value wins over defaultCollapsed, and a missing or malformed cookie falls back to it. Letters, digits, _ and - only: with any other name nothing is saved (a warning in development). The cookie holds only collapsed or expanded, plus the width in px once a resizable Sidebar has been dragged. It is set on path=/ with samesite=lax, and secure on https, so each app on the same domain needs its own name.",
      shortcut: "Key used with Ctrl / ⌘; false turns it off. With several AppShells on a page, only the one that has focus or was clicked last responds.",
      skipLink: "A “Skip to content” link shown on focus.",
      "Sidebar.collapsible": "Collapse to an icon rail, hide completely, or always stay open.",
      "Sidebar.resizable": "SidebarRail becomes a splitter that resizes the sidebar (arrow keys, Home / End, Enter collapses).",
      "Sidebar.defaultWidth / minWidth / maxWidth": "Open width in px.",
      "Sidebar.label": "Name of the Drawer on narrow frames.",
      "SidebarGroup.label": "Group name; in the rail it is kept for screen readers only.",
      "AppShellHeader / AppShellMain / AppShellAside / AppShellFooter.asChild": "Render the header / main / aside / footer as the child element.",
      "useAppShell()": "narrow, collapsed, setCollapsed, drawerOpen, setDrawerOpen, toggleSidebar, rail.",
      "readAppShellCookie(cookie, persistKey)": "Reads the saved state from document.cookie, or from the Cookie header when rendering on the server. Callable in a Server Component when imported from yugen-ui (the package root).",
    },
  },
};
