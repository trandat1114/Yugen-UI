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
  CLI_ADD,
  CLI_INIT,
  CLI_INIT_SOURCE,
  CSS_PRECOMPILED,
  CSS_TAILWIND,
  PROVIDER_NEXT,
  PROVIDER_VITE,
  TEMPLATE_COMMAND,
} from "../_snippets";
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

/** Numbered steps — each with an h3 title and a body. */
function Steps({ items }: { items: { title: ReactNode; body: ReactNode }[] }) {
  return (
    <ol className="flex max-w-4xl flex-col gap-5">
      {items.map((s, i) => (
        <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3">
          <span
            aria-hidden
            className="flex size-8 items-center justify-center rounded-circular bg-brand-background-2 text-body1 font-semibold text-brand-foreground-2"
          >
            {i + 1}
          </span>
          <div className="flex min-w-0 flex-col gap-2 pt-1">
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

const FIRST = `import { Button, Field, Input, toast } from "yugen-ui";

export function NewsletterForm() {
  return (
    <form
      className="flex w-full max-w-sm flex-col gap-3"
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
      className="flex w-full max-w-sm flex-col gap-3"
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
        description="The CLI copies a template, installs dependencies and starts the dev server. Nothing else to configure."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={TEMPLATE_COMMAND} />
          <P>
            The starter comes with a remembered theme choice, toast, an <C>@/</C> alias, SEO basics and a welcome page to delete when you
            start. Swap <C>starter</C> for <C>saas</C> (8-page SaaS app), <C>blog</C> (Markdown blog), <C>dashboard</C>, <C>ai-chat</C>,
            <C>glass</C> (travel journal with glass navigation), <C>landing</C> (product landing page), <C>admin</C> (back office: tables, forms, sign-in),
            <C>next-starter</C> (Next.js App Router) or <C>docs</C> (Markdown documentation site), or drop <C>--template</C> to pick in the terminal. More options on <A href={docsPath("/concepts/cli")}>@yugen-ui/cli</A>.
          </P>
          <div className="flex flex-wrap gap-2">
            <Button asChild appearance="primary" icon={<Rocket16Regular />}>
              <a href={docsPath("/templates")}>Browse templates</a>
            </Button>
            <Button asChild icon={<Open16Regular />}>
              <a href={templateStackBlitzUrl("vite-starter")} target="_blank" rel="noreferrer">
                Open in StackBlitz
              </a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="existing" title="Add to an existing project" description="React 19 (or 18.3) and Tailwind CSS v4. No aliases or bundler config.">
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_INIT} command="dlx" />
          <P>
            Pick <C>package</C> when asked: the CLI installs <C>yugen-ui</C>, adds the theme line to your main CSS file (or{" "}
            <C>styles.css</C> without Tailwind v4) and prints the <C>YugenProvider</C> wrapper with the file to put it in. Prefer doing it
            by hand? Follow the three steps below.
          </P>
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
                  <Tabs defaultValue="vite" className="flex flex-col gap-2">
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
        </div>
      </DocSection>

      <DocSection
        id="shadcn"
        title="Need deeper customization?"
        description="Copy component source into your project and edit it directly, instead of using the prebuilt npm package. Run init once, then add each component."
      >
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_INIT_SOURCE} command="dlx" />
          <PackageManagerTabs packages={CLI_ADD} command="dlx" />
          <P>
            The CLI writes the theme, <C>cn()</C> and <C>YugenProvider</C>, copies the components each one depends on, installs missing npm
            packages and rewrites imports to your project&apos;s alias. Details on <A href={docsPath("/concepts/cli")}>@yugen-ui/cli</A>. Already using
            the shadcn CLI? See <A href={docsPath("/concepts/shadcn-registry")}>Install with the shadcn CLI</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="first-component" title="Your first component" description="Field wires the label, hint and aria-* to the Input; toast() shows brief feedback after submitting.">
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
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
        <div className="flex flex-col gap-4">
          <CodeBlock code={PERSIST} />
          <P>
            <C>YugenProvider</C> writes attributes in <C>useEffect</C> (after the first paint), so add a script to <C>{"<head>"}</C> to avoid
            a white flash for users who picked the dark theme. For Next.js, see <A href={docsPath("/concepts/ssr")}>SSR & Next.js</A>.
          </P>
          <CodeBlock code={HTML} />
          <MessageBar intent="warning" title="Use the same localStorage key." className="max-w-3xl">
            The script and the app must read / write the same key (for example <C>yugen-ui-theme</C>) and the same set of values, or the
            theme jumps once React runs.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="requirements" title="Requirements">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Technology", "Version", "Notes"]}
            rows={[
              ["React", "19 (recommended), 18.3", "React 18 is still supported; the end date will be announced on What's new."],
              ["Tailwind CSS", "4.x", <>Optional when using <C>yugen-ui/styles.css</C>. Tailwind 3 is not supported.</>],
              ["Bundler", "Vite 6, Next.js 14+", <>Vite uses <C>@tailwindcss/vite</C>; Next.js uses <C>@tailwindcss/postcss</C>.</>],
              ["TypeScript", "5.x", "Optional — types ship with the package."],
              ["Node.js", "18+", "Required by Vite 6 and Tailwind 4."],
            ]}
          />
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <a href={docsPath("/concepts/styling")}>Styling</a>
            </Button>
            <Button asChild>
              <a href={docsPath("/concepts/theming")}>Theming</a>
            </Button>
            <Button asChild>
              <a href={docsPath("/concepts/accessibility")}>Accessibility</a>
            </Button>
          </div>
        </div>
      </DocSection>
    </>
  );
}
