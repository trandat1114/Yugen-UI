import type { ReactNode } from "react";
import { MessageBar } from "@/components/ui";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

const USE_CLIENT_CODE = `// scripts/use-client.mjs — run once: node scripts/use-client.mjs
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = "src/components/ui";
for (const entry of readdirSync(root, { withFileTypes: true })) {
  if (!entry.isDirectory()) continue;
  for (const file of readdirSync(join(root, entry.name))) {
    if (!file.endsWith(".tsx")) continue;
    const path = join(root, entry.name, file);
    const source = readFileSync(path, "utf8");
    if (!source.startsWith('"use client"')) writeFileSync(path, '"use client";\\n' + source);
  }
}`;

const SETUP_CODE = `# In Next.js, Tailwind v4 runs through PostCSS
npm install -D tailwindcss @tailwindcss/postcss`;

const POSTCSS_CODE = `// postcss.config.mjs
export default {
  plugins: { "@tailwindcss/postcss": {} },
};`;

const GLOBALS_CODE = `/* src/app/globals.css — the contents of src/index.css, only the tokens path changes */
@import "tailwindcss";
@import "../styles/tokens.css";

/* … keep the @theme, @theme inline, @utility, @keyframes and @layer base blocks of index.css as they are … */`;

const TSCONFIG_CODE = `// tsconfig.json — Next.js reads paths directly, no bundler config needed
{
  "compilerOptions": {
    "paths": { "@/*": ["./src/*"] }
  }
}`;

const LAYOUT_CODE = `// src/app/layout.tsx — Server Component
import type { Metadata } from "next";
import { yugenHtmlAttributes, yugenThemeScript } from "@/components/ui";
import "./globals.css";
import { Providers } from "./providers";

export const metadata: Metadata = { title: "Yugen app" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // The script changes attributes on <html> before hydration → silence the attribute mismatch warning for this element only.
    <html lang="en" {...yugenHtmlAttributes({ brand: "sakura" })} suppressHydrationWarning>
      <head>
        {/* Runs before the browser paints the page: data-theme from the saved choice, otherwise from the OS setting. */}
        <script dangerouslySetInnerHTML={{ __html: yugenThemeScript({ storageKey: "yugen-ui-theme" }) }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}`;

/** sha256 of yugenThemeScript() with no options; document.test.ts fails when the script changes and this does not. */
const THEME_SCRIPT_HASH = "sha256-aQ5/7/M1H2ZEsd4PyJ7/nRi/VlDCe/SWLVR6JGIWbgM=";

const CSP_NONCE_CODE = `// A new random nonce for every response, in the header and on the <script>:
// Content-Security-Policy: script-src 'self' 'nonce-<nonce>'
<script nonce={nonce} dangerouslySetInnerHTML={{ __html: yugenThemeScript() }} />`;

const CSP_HASH_CODE = `# yugenThemeScript() with no options, in this version
Content-Security-Policy: script-src 'self' '${THEME_SCRIPT_HASH}'`;

const CSP_HASH_COMPUTE_CODE = `// Other options: compute the hash on the server or at build time
import { createHash } from "node:crypto";
import { yugenThemeScript } from "@/components/ui";

const script = yugenThemeScript({ storageKey: "my-app-theme" }); // the same string you render in <head>
const hash = createHash("sha256").update(script).digest("base64");
// Content-Security-Policy: script-src 'self' 'sha256-\${hash}'`;

const PROVIDERS_CODE = `// src/app/providers.tsx
"use client";

import * as React from "react";
import { YugenProvider, type YugenTheme } from "@/components/ui";

const STORAGE_KEY = "yugen-ui-theme";

function readTheme(): YugenTheme {
  // No document on the server → "light"; on the client, read back the value the script set.
  if (typeof document === "undefined") return "light";
  const theme = document.documentElement.getAttribute("data-theme");
  return theme === "dark" || theme === "high-contrast" ? theme : "light";
}

export const SetThemeContext = React.createContext<(theme: YugenTheme) => void>(() => {});

export function Providers({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<YugenTheme>(readTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  return (
    <SetThemeContext.Provider value={setTheme}>
      <YugenProvider applyToDocument withToaster theme={theme}>
        {children}
      </YugenProvider>
    </SetThemeContext.Provider>
  );
}`;

const RSC_CODE = `// src/app/settings/page.tsx — Server Component: fetches data, renders Yugen components with serializable props
import { Card, CardContent, CardHeader } from "@/components/ui";
import { SettingsForm } from "./settings-form";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  return (
    <Card className="max-w-lg">
      <CardHeader header="Profile" description={user.email} />
      <CardContent>
        <SettingsForm defaultName={user.name} />
      </CardContent>
    </Card>
  );
}

// src/app/settings/settings-form.tsx — everything that takes a function (onClick, render-props, toast) lives here
"use client";

import { Button, Field, Input, toast } from "@/components/ui";

export function SettingsForm({ defaultName }: { defaultName: string }) {
  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        toast({ intent: "success", title: "Profile saved" });
      }}
    >
      <Field label="Display name" required>
        <Input name="name" defaultValue={defaultName} />
      </Field>
      <Button appearance="primary" type="submit" className="self-start">
        Save
      </Button>
    </form>
  );
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="client-components"
        title="Client components"
        description="Every file in src/components/ui uses hooks, context or Radix primitives, so it has to run on the client."
      >
        <div className="flex flex-col gap-4">
          <P>
            This docs site is a Vite SPA, so the source has no <C>&quot;use client&quot;</C> directive. When you copy it into the Next.js App
            Router, add <C>&quot;use client&quot;;</C> as the first line of each component file. The script below does that once for the whole
            folder:
          </P>
          <CodeBlock code={USE_CLIENT_CODE} />
          <MessageBar intent="warning" title="Constants become client references too." className="max-w-3xl">
            Shared classes (<C>fieldControlClass</C>, <C>popoverSurfaceClass</C>, <C>buttonVariants</C>…) exported from a file with{" "}
            <C>&quot;use client&quot;</C> can only be used inside client components. In a Server Component, import <C>cn</C> directly from{" "}
            <C>@/lib/cn</C> (a file without the directive) and write the utilities yourself.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="setup"
        title="Setting up Next.js"
        description="The steps in Quick start still apply; only the Tailwind plugin and the location of the CSS differ."
      >
        <div className="flex flex-col gap-4">
          <MessageBar intent="info" title="There is a template:" className="max-w-3xl">
            <C>npx create-yugen-ui@latest my-app --template next-starter</C> creates an App Router app with the steps below
            done, and the theme in a cookie so the server renders it in the first HTML.
          </MessageBar>
          <CodeBlock code={SETUP_CODE} />
          <CodeBlock code={POSTCSS_CODE} />
          <CodeBlock code={GLOBALS_CODE} />
          <CodeBlock code={TSCONFIG_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="theme-flash"
        title="Root layout & no theme flash"
        description="HTML from the server does not know which theme the user picked. A script in <head> sets data-theme before the first paint; the client provider reads the same value back."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={LAYOUT_CODE} />
          <CodeBlock code={PROVIDERS_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>suppressHydrationWarning</C> only applies to the <C>{"<html>"}</C> element itself (one level deep). It does not hide hydration
              errors in the rest of the tree.
            </li>
            <li>
              <C>yugenThemeScript()</C> reads the saved value under <C>storageKey</C>: a theme name, or JSON with <C>theme</C> and
              optionally <C>brand</C> and <C>dir</C>. Without one it follows the OS: <C>high-contrast</C> for{" "}
              <C>prefers-contrast: more</C> (turn off with <C>highContrast: false</C>), then <C>prefers-color-scheme</C>. Set{" "}
              <C>defaultTheme</C> to use a fixed theme instead.
            </li>
            <li>
              <C>yugenHtmlAttributes()</C> returns what <C>applyToDocument</C> writes to <C>{"<html>"}</C> (same defaults), so fixed
              values such as the brand and <C>dir</C> are in the first HTML. When the server knows the theme (a cookie), pass it here and
              skip the script. Both helpers are plain functions and work in a Server Component.
            </li>
            <li>
              With <C>applyToDocument</C>, YugenProvider does not render the theme attribute into the markup, so the server and the client
              produce the same HTML. It updates <C>{"<html>"}</C> in a layout effect, before the browser paints. If your UI renders
              differently per theme (a sun / moon icon), render that part after mount.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="csp"
        title="Content Security Policy"
        description="The no-flash script is inline. A strict policy can allow it with a nonce or with its hash instead of 'unsafe-inline'."
      >
        <div className="flex flex-col gap-4">
          <P>
            With a nonce: create a new random value for every response, put it in the <C>Content-Security-Policy</C> header and on the{" "}
            <C>{"<script>"}</C>. In Next.js, create it in middleware and read it in the layout with <C>headers()</C>.
          </P>
          <CodeBlock code={CSP_NONCE_CODE} />
          <P>
            With a hash: the script is the same for the same options, so a static or prerendered page can list its sha256 hash. The value
            below is for <C>yugenThemeScript()</C> with no options. It changes when you pass options or when an update changes the script,
            so compute it from the function when you can.
          </P>
          <CodeBlock code={CSP_HASH_CODE} />
          <CodeBlock code={CSP_HASH_COMPUTE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="rsc"
        title="Use in Server Components"
        description="A Server Component imports and renders Yugen components like any other; they act as the client boundary. Their props must be serializable."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={RSC_CODE} />
          <DoDont
            dos={[
              "Pass strings, numbers, static JSX and option arrays from a Server Component.",
              "Keep handlers, state, Field render-props and toast() in a small client component.",
              "Fetch data on the server and pass it down as defaultValue.",
            ]}
            donts={[
              "Passing functions (onClick, onValueChange, function children) from a Server Component.",
              "Calling toast() while rendering on the server.",
              "Using useYugen() in a Server Component. It is a hook.",
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="hydration"
        title="Portals, Toast & hydration"
        description="Parts that only exist on the client are not in the server HTML."
      >
        <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
          <li>
            Radix portals (Dialog, Drawer, Menu, Popover, Tooltip, listbox) only attach to <C>{"<body>"}</C> after mount. A Dialog that starts
            open (<C>defaultOpen</C>) appears after hydration, so don&apos;t put content that matters for SEO inside an overlay.
          </li>
          <li>
            <C>Toaster</C> uses a client-side store; only call <C>toast()</C> from event handlers or effects.
          </li>
          <li>
            Field, Input, Checkbox… generate ids with React&apos;s <C>useId</C>, so server and client ids match and <C>htmlFor</C> /{" "}
            <C>aria-describedby</C> stay in sync.
          </li>
          <li>
            The Toaster&apos;s <C>useSyncExternalStore</C> has a server snapshot, so it renders without errors during SSR.
          </li>
          <li>
            The Toaster from <C>withToaster</C> is not in the server HTML: it loads after hydration. Breadcrumb&apos;s “…” button and
            StreamingMarkdown&apos;s citation chips render on the server as the same button and switch to the full component once its code
            has loaded, so both sides produce the same HTML. See{" "}
            <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/performance#on-demand")}>
              Performance
            </a>
            .
          </li>
        </ul>
      </DocSection>

      <DocSection
        id="docs-only"
        title="Only for the docs site"
        description="A few mechanisms in the repo exist to build the documentation site. Your app does not need them."
      >
        <div className="flex flex-col gap-4">
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>import.meta.glob</C> (a Vite-only API) in <C>src/docs/registry/index.ts</C>, <C>src/docs/concepts/index.ts</C> and{" "}
              <C>BlocksPage</C> only collects the docs pages. Components in <C>src/components/ui</C> use no Vite API, so they run with webpack,
              Turbopack and Rspack.
            </li>
            <li>
              The <C>?raw</C> imports that show Block source code also belong to the docs site.
            </li>
            <li>
              <C>useTheme()</C> in <C>src/hooks</C> is a docs-site hook; in your app, use your own state with <C>YugenProvider</C>.
            </li>
          </ul>
          <MessageBar intent="success" title="In short:" className="max-w-3xl">
            copy <C>tokens.css</C>, <C>index.css</C>, <C>cn.ts</C> and <C>components/ui</C>; add <C>&quot;use client&quot;</C>; wrap the layout
            in a client Providers component that renders YugenProvider; add the no-flash script to <C>{"<head>"}</C>.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
