import type { ReactNode } from "react";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link underline hover:text-link-hover" href={href}>
      {children}
    </a>
  );
}

function List({ children }: { children: ReactNode }) {
  return <ul className="flex max-w-3xl list-disc flex-col gap-2 ps-5 text-body2 text-foreground-2">{children}</ul>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold text-foreground-1" : "px-4 py-3 text-foreground-2"}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const THEME_ROOT = `// ThemeRoot.tsx: the theme state lives here, the app comes in as children
import * as React from "react";
import { YugenProvider, type YugenTheme } from "yugen-ui";

export const SetThemeContext = React.createContext<(theme: YugenTheme) => void>(() => {});

export function ThemeRoot({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<YugenTheme>("light");
  return (
    <SetThemeContext.Provider value={setTheme}>
      <YugenProvider applyToDocument theme={theme}>
        {children}
      </YugenProvider>
    </SetThemeContext.Provider>
  );
}

// main.tsx
createRoot(document.getElementById("root")!).render(
  <ThemeRoot>
    <App />
  </ThemeRoot>,
);`;

export default function Page() {
  return (
    <>
      <DocSection
        id="imports"
        title="Import paths and bundlers"
        description="Importing from yugen-ui or from yugen-ui/<Folder> gives the same production build with most bundlers. esbuild code splitting and Node without a bundler are the exceptions."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Where the code runs", "yugen-ui", "yugen-ui/<Folder>"]}
            rows={[
              ["Vite, Rollup, webpack, Next.js (production)", "Only what the app uses", "Same as the root"],
              [
                <>
                  esbuild with <C>splitting: true</C>
                </>,
                "The parts that load on demand land in the first chunk",
                "Only what the app uses",
              ],
              [
                "Node, no bundler (Vitest, Jest, SSR, dev server)",
                <>
                  <C>{"{ Button }"}</C>: 498 files, 1.6 s cold
                </>,
                "14 files, 61 ms",
              ],
            ]}
          />
          <P>
            esbuild assigns whole files to chunks before it drops unused exports. From the root,{" "}
            <C>{"import { Calendar }"}</C> then brings the Toaster, Breadcrumb&apos;s menu and the citation card into the first chunk:
            76.46 kB, against 31.60 kB from <C>yugen-ui/Calendar</C>. Two subpaths hold such a part themselves: <C>yugen-ui/AIKit</C>{" "}
            also exports Citation, so StreamingMarkdown from it has the citation card in the first chunk, and <C>toast</C> from{" "}
            <C>yugen-ui/Toast</C> brings the Toaster along, because both live in one file.
          </P>
          <P>
            Next.js: add the package to <C>optimizePackageImports</C> so the dev server and the server bundle load only what a page
            uses. The config, and which folder each name comes from, are in{" "}
            <A href={docsPath("/concepts/quick-start#imports")}>Quick start › Import paths</A>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="on-demand"
        title="What loads on demand"
        description="Four parts that only some apps render have their own chunk. Each one starts loading as soon as it is rendered on the client."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Part", "Starts loading", "First chunk, 0.15 → 0.16", "Loaded later"]}
            rows={[
              [
                <>
                  Toaster of <C>withToaster</C>
                </>,
                "First client render (after hydration with SSR)",
                <>
                  <C>{"{ YugenProvider }"}</C> 24.91 → 13.31 kB
                </>,
                "12.5 kB",
              ],
              [
                "Breadcrumb's “…” menu",
                <>
                  When a <C>BreadcrumbOverflow</C> mounts
                </>,
                <>
                  <C>{"{ Breadcrumb }"}</C> 40.17 → 13.47 kB
                </>,
                "28.37 kB",
              ],
              [
                "Citation card in StreamingMarkdown",
                "When the first citation chip mounts",
                <>
                  <C>{"{ StreamingMarkdown }"}</C> 49.28 → 27.34 kB
                </>,
                "24.25 kB",
              ],
              [
                <>
                  TagPicker's Sortable (<C>reorderable</C>)
                </>,
                "When a TagPicker with reorderable mounts",
                <>
                  <C>{"{ TagPicker }"}</C> 47.35 → 38.86 kB
                </>,
                "7.10 kB",
              ],
            ]}
          />
          <List>
            <li>Measured on a Vite 8 build with React external. An app that never renders the part never loads it.</li>
            <li>
              Until the code arrives, Breadcrumb renders the same “…” button and StreamingMarkdown the same chip, with the same size and
              ARIA, so nothing moves. A click or key press in that time opens the menu or the card once the code arrives, and focus moves
              to the real button. If loading fails, the next interaction tries again. TagPicker shows the same tags; dragging and
              Alt + arrow keys work once Sortable has loaded, and a tag that has focus keeps it.
            </li>
            <li>
              The server HTML has these placeholders and no Toaster, so hydration matches (
              <A href={docsPath("/concepts/ssr#hydration")}>SSR & Next.js</A>).
            </li>
            <li>
              <C>toast()</C> calls made before the Toaster has loaded show once it mounts. A <C>{"<Toaster />"}</C> you render as a child
              of the root provider is part of the first chunk instead: the first toast does not wait for a chunk, and its live region is
              in the page from the first paint.
            </li>
            <li>
              Two components got smaller without loading anything later. Nav no longer imports Tooltip (AppShell&apos;s Sidebar adds the
              rail tooltip): <C>{"{ Nav, NavItem }"}</C> 29.94 → 11.97 kB. Calendar no longer bundles the Vietnamese locale:{" "}
              <C>{"{ Calendar }"}</C> 32.39 → 30.42 kB.
            </li>
          </List>
        </div>
      </DocSection>

      <DocSection
        id="css"
        title="CSS size"
        description="theme.css makes Tailwind scan every component in the package. The CLI's css command writes a file with only the components your code imports."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Starter template", "CSS (gzip)"]}
            rows={[
              [<C key="t">yugen-ui/theme.css</C>, "26.7 kB"],
              [
                <>
                  <C>yugen-ui.css</C> written by <C>yugen css</C> (5 component folders)
                </>,
                "13.2 kB",
              ],
              [
                <>
                  <C>theme-core.css</C> alone, no component
                </>,
                "6.74 kB",
              ],
            ]}
          />
          <P>
            On the other templates <C>yugen css</C> gives 11.8 to 20.0 kB, against about 26 kB (
            <A href={docsPath("/concepts/styling#lean-css")}>Styling › Only the CSS you use</A>). Run it in <C>predev</C> /{" "}
            <C>prebuild</C>; <C>yugen add</C> refreshes it, and <C>yugen css --check</C> exits with 1 when it is out of date (
            <A href={docsPath("/concepts/cli#css")}>CLI</A>).
          </P>
          <P>
            Without Tailwind, <C>yugen css --precompile</C> compiles the same list with your project&apos;s Tailwind packages and replaces{" "}
            <C>yugen-ui/styles.css</C>: 26.75 kB down to 12.79 to 21.06 kB on the templates.
          </P>
          <P>
            Keyframes live in <C>@theme</C>, so Tailwind writes only the ones your classes use: none for <C>theme-core.css</C> alone, one
            for an app that uses only Button.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="theme"
        title="Theme before the first paint"
        description="Server HTML does not know which theme the user picked. Two helpers put it on <html> before the browser paints."
      >
        <div className="flex flex-col gap-4">
          <P>
            <C>yugenHtmlAttributes()</C> returns the attributes <C>applyToDocument</C> writes, for the <C>{"<html>"}</C> of your root
            layout. <C>yugenThemeScript()</C> returns a <C>{"<head>"}</C> script that applies the saved theme, or the OS setting. Both are
            plain functions from <C>yugen-ui</C> or <C>yugen-ui/YugenProvider/document</C> and run in a Server Component. Setup on{" "}
            <A href={docsPath("/concepts/ssr#theme-flash")}>SSR & Next.js</A>.
          </P>
          <P>
            On the client, YugenProvider writes the attributes in a layout effect, so a child&apos;s <C>useEffect</C> already sees them.
            Without SSR (a Vite SPA) the browser paints <C>index.html</C> before React runs: use the inline script from{" "}
            <A href={docsPath("/concepts/quick-start#persist-theme")}>Quick start</A>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="re-renders"
        title="Re-renders"
        description="YugenProvider has two contexts. A theme change re-renders only the components that read the theme."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Context", "Holds", "Re-renders when it changes"]}
            rows={[
              [
                "Theme",
                "theme, brand, dir",
                <>
                  Portalled surfaces (Dialog, Menu, Popover…), charts, CodeBlock, callers of <C>useYugenTheme()</C> and{" "}
                  <C>useYugen()</C>
                </>,
              ],
              ["Settings", "locale, density, messages, defaults", "Every component that reads its defaults or strings"],
            ]}
          />
          <SimpleTable
            head={["1,800 controls, jsdom", "0.15", "0.16"]}
            rows={[
              ["Theme switch, children stable", "66–117 ms", "1.3–1.9 ms"],
              [
                <>
                  Parent re-render with the same <C>messages</C> inline
                </>,
                "65–67 ms",
                "0.1–0.2 ms",
              ],
            ]}
          />
          <P>
            The first row needs the app&apos;s elements to stay the same. When the component that holds the theme state also creates the
            app&apos;s elements, every component re-renders on a switch (about 68 ms in the same test). Keep the theme state in a component
            that receives the app as <C>children</C>: a theme switch then re-renders that component only, and React skips the tree apart
            from the theme readers.
          </P>
          <CodeBlock code={THEME_ROOT} />
          <List>
            <li>
              <C>messages</C> and <C>defaults</C> written inline are compared by value, two levels deep (component, then key), so they need
              no <C>useMemo</C>. A function or element created during render is a new value each time: define it outside the component.
            </li>
            <li>
              In your own components, <C>useYugenTheme()</C> returns <C>{"{ theme, brand, dir }"}</C> and <C>useYugenLocale()</C> the
              locale; <C>useYugen()</C> re-renders on either change (
              <A href={docsPath("/concepts/theming#use-yugen")}>Theming</A>).
            </li>
            <li>
              Components with variants (Button, Input, Badge, Card…) merge their classes once per combination of props: a server render of
              1,000 Buttons takes 6.35 ms instead of 12.58 ms. A <C>className</C> is merged on top on every render (8.13 ms).
            </li>
          </List>
        </div>
      </DocSection>

      <DocSection
        id="charts"
        title="Charts with many points"
        description="Moving the pointer over LineChart, AreaChart or BarChart no longer recomputes the chart, and a Sparkline with a fixed width measures nothing."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Hover step, jsdom", "0.15", "0.16"]}
            rows={[
              ["LineChart, 3 series of 500 points", "9.65 ms", "1.05 ms"],
              ["LineChart, 3 series of 2,000 points", "39.2 ms", "1.11 ms"],
              ["BarChart, 150 groups of 3 bars", "10.6 ms", "2.33 ms"],
            ]}
          />
          <List>
            <li>
              Scales, paths, labels and the static SVG layers are memoized on the props, the width and the hidden series. Keep{" "}
              <C>data</C> and <C>series</C> stable (state, a constant or <C>useMemo</C>) so a parent re-render does not rebuild them.
            </li>
            <li>
              Fill and stroke sit on the series group instead of each mark: a LineChart with 4 series of 200 points and markers renders
              183.9 kB of markup instead of 263.3 kB.
            </li>
            <li>
              Give Sparkline a number <C>width</C> in tables and lists: it then uses no ResizeObserver. 200 Sparklines with{" "}
              <C>{"width={120}"}</C> commit once instead of three times and mount in 60–153 ms instead of 229–514 ms.{" "}
              <C>width=&quot;auto&quot;</C> follows the parent.
            </li>
            <li>
              In your own components, <C>{"useElementSize({ enabled: false })"}</C> skips measuring when the size is known (
              <A href={docsPath("/components/hooks")}>Hooks</A>). Choosing a chart form and its palette:{" "}
              <A href={docsPath("/concepts/data-visualization")}>Data visualization</A>.
            </li>
          </List>
        </div>
      </DocSection>
    </>
  );
}
