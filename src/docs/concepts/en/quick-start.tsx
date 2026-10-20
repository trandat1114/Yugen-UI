import type { ReactNode } from "react";
import { Button, Field, Input, MessageBar, toast } from "@/components/ui";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-L py-M font-semibold text-foreground-1" : "px-L py-M text-foreground-2"}>
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

const INSTALL = `# Runtime dependencies
npm install @fluentui/react-icons class-variance-authority clsx tailwind-merge \\
  cmdk react-day-picker react-resizable-panels \\
  @radix-ui/react-accordion @radix-ui/react-avatar @radix-ui/react-checkbox \\
  @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog \\
  @radix-ui/react-direction @radix-ui/react-dropdown-menu @radix-ui/react-hover-card \\
  @radix-ui/react-menubar @radix-ui/react-popover @radix-ui/react-radio-group \\
  @radix-ui/react-scroll-area @radix-ui/react-select @radix-ui/react-slider \\
  @radix-ui/react-slot @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toast \\
  @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip

# Build tools
npm install -D tailwindcss @tailwindcss/vite`;

const TREE = `src/
  styles/tokens.css        # Global + Alias tokens, brands, themes — copy the whole file
  index.css                # @import tailwindcss + tokens, disables default scales, @theme bridge
  lib/cn.ts                # cn() = clsx + tailwind-merge taught the Yugen scales
  components/ui/
    index.ts               # barrel — exports by group
    YugenProvider/YugenProvider.tsx
    Button/Button.tsx
    Field/Field.tsx
    ...                    # only copy the folders you use`;

const VITE = `// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});`;

const TSCONFIG = `// tsconfig.app.json (or tsconfig.json)
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}`;

const MAIN = `// src/main.tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);`;

const APP = `// src/App.tsx
import * as React from "react";
import { YugenProvider, type YugenTheme } from "@/components/ui";

const STORAGE_KEY = "yugen-ui-theme";

function initialTheme(): YugenTheme {
  // The script in index.html already set data-theme before React ran — read it back to match.
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export default function App() {
  const [theme, setTheme] = React.useState<YugenTheme>(initialTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  return (
    <YugenProvider applyToDocument withToaster theme={theme} brand="sakura" dir="ltr">
      <AppShell onThemeChange={setTheme} />
    </YugenProvider>
  );
}`;

const HTML = `<!-- index.html — place BEFORE the app script -->
<head>
  <script>
    (function () {
      var t;
      try { t = localStorage.getItem("yugen-ui-theme"); } catch (e) {}
      if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      document.documentElement.setAttribute("data-theme", t);
    })();
  </script>
</head>`;

const FIRST = `import { Button, Field, Input, toast } from "@/components/ui";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-M"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Subscribed", body: "See you in the next issue." });
      }}
    >
      <Field label="Email" hint="One email a month, unsubscribe anytime." required>
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Button appearance="primary" type="submit" className="self-start">
        Subscribe
      </Button>
    </form>
  );
}`;

function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-M"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Subscribed", body: "See you in the next issue." });
      }}
    >
      <Field label="Email" hint="One email a month, unsubscribe anytime." required>
        <Input type="email" placeholder="you@example.com" />
      </Field>
      <Button appearance="primary" type="submit" className="self-start">
        Subscribe
      </Button>
    </form>
  );
}

export default function Page() {
  return (
    <>
      <DocSection id="requirements" title="Requirements">
        <SimpleTable
          head={["Technology", "Version", "Notes"]}
          rows={[
            ["React", "18.3+", "React 19 compatible. Components use forwardRef, useId and useSyncExternalStore."],
            ["TypeScript", "5.x", "strict recommended. Every prop is typed; no separate @types package needed."],
            ["Tailwind CSS", "4.x", <>CSS-first configuration (<C>@theme</C>, <C>@utility</C>), no tailwind.config.js. Tailwind 3 is not supported.</>],
            ["Bundler", "Vite 6 or Next.js 14+", <>Vite uses <C>@tailwindcss/vite</C>; Next.js uses <C>@tailwindcss/postcss</C> (see the SSR & Next.js page).</>],
            ["Node.js", "18+", "Required by Vite 6 and Tailwind 4."],
          ]}
        />
      </DocSection>

      <DocSection
        id="install"
        title="Install dependencies"
        description="The list below covers the whole library. If you only copy a few components, you only need the Radix primitives those files import."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={INSTALL} />
          <P>
            <C>@radix-ui/react-direction</C> is required because <C>YugenProvider</C> wraps <C>DirectionProvider</C> for RTL text;{" "}
            <C>@radix-ui/react-slot</C> provides <C>asChild</C> for Button, Link, Breadcrumb and Nav.
          </P>
        </div>
      </DocSection>

      <DocSection id="copy" title="Copy the source" description="With copy-paste, the source lives in your project — edit it however you like.">
        <div className="flex flex-col gap-L">
          <CodeBlock code={TREE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>
              <C>tokens.css</C> and <C>index.css</C> go together: <C>index.css</C> disables Tailwind's default palette and maps the Fluent
              tokens to utilities (<C>bg-background-1</C>, <C>p-M</C>, <C>text-body1</C>…).
            </li>
            <li>
              Some components reuse others: <C>Dropdown</C> needs <C>Popover</C> + <C>Select</C>, <C>SplitButton</C> needs <C>Button</C> +{" "}
              <C>Menu</C>, <C>YugenProvider</C> needs <C>Tooltip</C> + <C>Toast</C>. Check the imports at the top of each file to see what to
              copy.
            </li>
            <li>
              If you rename folders, update the <C>@/</C> alias or the matching import paths.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="config" title="Vite & the @/ alias" description="Every component file imports through the @/ alias — declare it in both Vite and TypeScript.">
        <div className="flex flex-col gap-L">
          <CodeBlock code={VITE} />
          <CodeBlock code={TSCONFIG} />
          <CodeBlock code={MAIN} />
        </div>
      </DocSection>

      <DocSection
        id="provider"
        title="YugenProvider & a no-flash theme"
        description="Wrap the whole app once. applyToDocument writes data-theme / data-brand / dir on <html> so portals (Dialog, Menu, Tooltip) get the right theme too."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={APP} />
          <P>
            <C>withToaster</C> mounts a <C>{"<Toaster />"}</C> so you can call <C>toast()</C> from anywhere; <C>TooltipProvider</C> is mounted
            by default (<C>withTooltipProvider</C>). Every prop is covered on the{" "}
            <a className="text-link underline hover:text-link-hover" href="#/concepts/theming">
              Theming
            </a>{" "}
            page.
          </P>
          <P>
            Because <C>YugenProvider</C> writes attributes in <C>useEffect</C> (after the first paint), add a small script to{" "}
            <C>{"<head>"}</C> that sets the theme before the page shows — avoiding a white flash when the user picked the dark theme:
          </P>
          <CodeBlock code={HTML} />
          <MessageBar intent="warning" title="Use the same localStorage key." className="max-w-3xl">
            The script and the app must read / write the same key (for example <C>yugen-ui-theme</C>) with the same set of values, or the
            theme will jump once React runs.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="first-component"
        title="Your first component"
        description="Field wires the label, hint and aria-* attributes to the Input; toast() shows brief feedback after submitting."
      >
        <div className="flex flex-col gap-L">
          <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">
            <NewsletterForm />
          </div>
          <CodeBlock code={FIRST} />
          <P>Next steps:</P>
          <div className="flex flex-wrap gap-S">
            <Button asChild>
              <a href="#/concepts/styling">Styling</a>
            </Button>
            <Button asChild>
              <a href="#/concepts/theming">Theming</a>
            </Button>
            <Button asChild>
              <a href="#/concepts/accessibility">Accessibility</a>
            </Button>
          </div>
        </div>
      </DocSection>
    </>
  );
}
