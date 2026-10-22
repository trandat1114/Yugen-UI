import type { ReactNode } from "react";
import { Open16Regular, Rocket16Regular } from "@fluentui/react-icons";
import {
  Button,
  Field,
  Input,
  MessageBar,
  PackageManagerTabs,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  toast,
} from "@/components/ui";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { templateStackBlitzUrl } from "../../templates";
import {
  CSS_PRECOMPILED,
  CSS_TAILWIND,
  PROVIDER_NEXT,
  PROVIDER_VITE,
  SHADCN_ADD,
  SHADCN_INIT,
  TEMPLATE_COMMAND,
} from "../_snippets";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a className="text-link underline hover:text-link-hover" href={href}>
      {children}
    </a>
  );
}

/** Numbered steps — each with an h3 title and a body. */
function Steps({ items }: { items: { title: ReactNode; body: ReactNode }[] }) {
  return (
    <ol className="flex max-w-4xl flex-col gap-XL">
      {items.map((s, i) => (
        <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-M">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-circular bg-brand-background-2 text-body1 font-semibold text-brand-foreground-2"
          >
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-S pt-XS">
            <h3 className="text-subtitle2 font-semibold text-foreground-1">{s.title}</h3>
            {s.body}
          </div>
        </li>
      ))}
    </ol>
  );
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

const FIRST = `import { Button, Field, Input, toast } from "yugen-ui";

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

const PERSIST = `// src/App.tsx — remember the user's theme
import * as React from "react";
import { YugenProvider, type YugenTheme } from "yugen-ui";

const STORAGE_KEY = "yugen-ui-theme";

// The script in index.html already set data-theme before React ran — read it back to match.
const initialTheme = (): YugenTheme =>
  document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";

export default function App() {
  const [theme, setTheme] = React.useState(initialTheme);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      /* storage blocked */
    }
  }, [theme]);

  return (
    <YugenProvider applyToDocument withToaster theme={theme}>
      <AppShell onThemeChange={setTheme} />
    </YugenProvider>
  );
}`;

const HTML = `<!-- index.html — place BEFORE the app script -->
<script>
  (function () {
    var t;
    try { t = localStorage.getItem("yugen-ui-theme"); } catch (e) {}
    if (t !== "light" && t !== "dark") t = matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", t);
  })();
</script>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="template"
        title="Fastest: one command"
        description="Downloads a template, installs dependencies and starts the dev server — nothing else to configure."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={TEMPLATE_COMMAND} />
          <P>
            That creates the starter: persisted theme, toast, an <C>@/</C> alias, SEO basics and a welcome page to delete once you start
            building. Need more? Swap <C>vite-starter</C> for <C>vite-saas</C> (8-page SaaS app), <C>vite-blog</C> (Markdown blog),{" "}
            <C>vite-dashboard</C> or <C>vite-ai-chat</C> — preview them all on the Templates page. Nothing to install? Open it on
            StackBlitz. Prefer picking a template from a list? Use the <A href="#/concepts/cli">yugen CLI</A>: <C>npx @yugen-ui/cli@latest create</C>.
          </P>
          <div className="flex flex-wrap gap-S">
            <Button asChild appearance="primary" icon={<Rocket16Regular />}>
              <a href="#/templates">Browse templates</a>
            </Button>
            <Button asChild icon={<Open16Regular />}>
              <a href={templateStackBlitzUrl("vite-starter")} target="_blank" rel="noreferrer">
                Open in StackBlitz
              </a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="existing" title="Add to an existing project" description="React 18+ and Tailwind CSS v4 — three steps, no aliases or bundler config.">
        <Steps
          items={[
            {
              title: "Install the package",
              body: (
                <>
                  <PackageManagerTabs packages="yugen-ui" />
                  <P>Radix primitives, Fluent icons and helpers are all dependencies of the package — nothing else to install.</P>
                </>
              ),
            },
            {
              title: "Add the theme to your CSS",
              body: (
                <>
                  <CodeBlock code={CSS_TAILWIND} />
                  <P>
                    Not using Tailwind? Skip that and import the precompiled stylesheet (preflight + tokens + every utility the components use):
                  </P>
                  <CodeBlock code={CSS_PRECOMPILED} />
                </>
              ),
            },
            {
              title: "Wrap your app in YugenProvider",
              body: (
                <>
                  <Tabs defaultValue="vite" className="flex flex-col gap-S">
                    <TabsList aria-label="Framework">
                      <TabsTrigger value="vite">Vite</TabsTrigger>
                      <TabsTrigger value="next">Next.js</TabsTrigger>
                    </TabsList>
                    <TabsContent value="vite">
                      <CodeBlock code={PROVIDER_VITE} />
                    </TabsContent>
                    <TabsContent value="next">
                      <CodeBlock code={PROVIDER_NEXT} />
                    </TabsContent>
                  </Tabs>
                  <P>
                    <C>applyToDocument</C> writes the theme to <C>{"<html>"}</C> so portalled Dialog, Menu and Tooltip match;{" "}
                    <C>withToaster</C> lets you call <C>toast()</C> anywhere. Done — try your first component below.
                  </P>
                </>
              ),
            },
          ]}
        />
      </DocSection>

      <DocSection
        id="shadcn"
        title="Want to own the source?"
        description="The shadcn CLI copies components into your project so you can edit every line — two commands; the CLI handles components.json, the theme and npm packages."
      >
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={SHADCN_INIT} command="dlx" />
          <PackageManagerTabs packages={SHADCN_ADD} command="dlx" />
          <P>
            Next.js projects use <C>init-next.json</C>. Details, output and updating are on{" "}
            <A href="#/concepts/shadcn-registry">Install with the shadcn CLI</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="first-component" title="Your first component" description="Field wires the label, hint and aria-* to the Input; toast() shows brief feedback after submitting.">
        <div className="flex flex-col gap-L">
          <div className="flex flex-wrap items-center gap-M rounded-2xlarge border border-stroke-2 bg-background-1 p-XXL">
            <NewsletterForm />
          </div>
          <CodeBlock code={FIRST} />
        </div>
      </DocSection>

      <DocSection
        id="persist-theme"
        title="Remember the theme, no flash (optional)"
        description="Templates already do this. Doing it yourself takes two pieces: state that stores the choice and a tiny script that sets the theme before the page paints."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={PERSIST} />
          <P>
            <C>YugenProvider</C> writes attributes in <C>useEffect</C> (after the first paint), so add a script to <C>{"<head>"}</C> to avoid
            a white flash for users who picked the dark theme. For Next.js, see <A href="#/concepts/ssr">SSR & Next.js</A>.
          </P>
          <CodeBlock code={HTML} />
          <MessageBar intent="warning" title="Use the same localStorage key." className="max-w-3xl">
            The script and the app must read / write the same key (for example <C>yugen-ui-theme</C>) and the same set of values, or the
            theme jumps once React runs.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="requirements" title="Requirements">
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Technology", "Version", "Notes"]}
            rows={[
              ["React", "18.3+", "Compatible with React 19."],
              ["Tailwind CSS", "4.x", <>Optional when using <C>yugen-ui/styles.css</C>. Tailwind 3 is not supported.</>],
              ["Bundler", "Vite 6, Next.js 14+", <>Vite uses <C>@tailwindcss/vite</C>; Next.js uses <C>@tailwindcss/postcss</C>.</>],
              ["TypeScript", "5.x", "Optional — types ship with the package."],
              ["Node.js", "18+", "Required by Vite 6 and Tailwind 4."],
            ]}
          />
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
