import type { ReactNode } from "react";
import { MessageBar, PackageManagerTabs } from "@/components/ui";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { REGISTRY_URL } from "../../install";
import {
  CLI_ADD,
  CLI_CONFIG,
  CLI_CREATE,
  CLI_DOCTOR,
  CLI_DOCTOR_OUTPUT,
  CLI_INIT,
  CLI_INIT_SOURCE,
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

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "whitespace-nowrap px-4 py-3 font-mono text-body1 text-foreground-1" : "px-4 py-3 text-foreground-2"}>
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

const SOURCE_RESULT = `yugen.json
src/
  index.css                           # gains @import "./yugen.css"; after @import "tailwindcss";
  yugen.css                           # theme
  lib/cn.ts
  components/ui/YugenProvider/…       # plus the Toast and Tooltip it uses
  components/ui/Button/Button.tsx     # from yugen add`;

const ADD_MORE = `npx @yugen-ui/cli add select --dry-run    # list the files it would write, write nothing
npx @yugen-ui/cli add --all               # every component
npx @yugen-ui/cli add button --overwrite  # also replace files you have edited
npx @yugen-ui/cli list grid               # search the registry, ✓ means already in the project`;

const UPDATE = `npx @yugen-ui/cli diff                   # every copied component: print the diff against the registry
npx @yugen-ui/cli update button --dry-run # show the diff, write nothing
npx @yugen-ui/cli update                  # apply the registry version (asks before writing)
npx @yugen-ui/cli remove data-grid        # delete the files nothing else imports`;

const THEME = `npx @yugen-ui/cli theme --brand #0f6cbd --name acme
# → src/yugen-brand.css: [data-brand="acme"] { --brand-10 … --brand-160 }, imported from src/index.css
# <YugenProvider applyToDocument withToaster brand="acme">`;

const CI = `npx @yugen-ui/cli@latest create app -t starter -y --no-git
npx @yugen-ui/cli@latest add button dialog -y --no-install`;

export default function Page() {
  return (
    <>
      <DocSection id="commands" title="Commands">
        <div className="flex flex-col gap-4">
          <Table
            head={["Command", "What it does"]}
            rows={[
              ["create [dir]", "New app from a template: starter, saas, blog, dashboard, ai-chat, glass, landing, admin, next-starter, docs. --ref <branch|tag> takes the templates from the repo."],
              ["init", "Set up an existing React project with the npm package or with copied source. Writes yugen.json and wraps the app in YugenProvider."],
              ["add <names…>", "Copy components and the components they depend on, install missing npm packages."],
              ["diff [names…]", "Compare copied source with the registry and print the diff. Changes nothing."],
              ["update [names…]", "Apply the registry version to copied source: shows the diff, asks, then writes."],
              ["remove <names…>", "Delete a component's files that nothing else imports."],
              ["theme --brand <hex>", "Generate a 16-step brand ramp into yugen-brand.css, with the Theme Designer's algorithm."],
              ["list [query]", "Components in the registry."],
              ["doctor", "Check React, Tailwind CSS v4, the theme import, the yugen-ui version and YugenProvider."],
            ]}
          />
          <P>
            Nothing to install first: run it with <C>npx @yugen-ui/cli@latest</C> (or <C>pnpm dlx</C>, <C>yarn dlx</C>, <C>bunx</C>). Requires Node.js 22
            or later.
          </P>
        </div>
      </DocSection>

      <DocSection id="create" title="Create an app" description="Asks for a directory and a template, copies the files, installs dependencies and runs git init.">
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_CREATE} command="dlx" />
          <P>
            Options: <C>-t, --template</C>, <C>--lang en|vi</C> (language of the app's text, for templates that have both; English by default), <C>--pm npm|pnpm|yarn|bun</C>, <C>--no-install</C>, <C>--no-git</C>, <C>--force</C> (write into a
            non-empty directory). <C>npx create-yugen-ui@latest</C> is a shorter way to run the same command. Templates ship inside the
            package, so this works offline. Preview them on <A href={docsPath("/templates")}>Templates</A>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="init"
        title="Set up an existing project"
        description="Detects Vite, Next.js, React Router or TanStack Start, the package manager and the main CSS file, then asks how you want to use Yugen UI."
      >
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_INIT} command="dlx" />
          <Table
            head={["Mode", "What the CLI does"]}
            rows={[
              [
                "package",
                <>
                  Installs <C>yugen-ui</C> and adds <C>@import &quot;yugen-ui/theme.css&quot;;</C> right after <C>@import &quot;tailwindcss&quot;;</C>.
                  Without Tailwind CSS v4 it adds <C>import &quot;yugen-ui/styles.css&quot;;</C> to your entry file (main.tsx, app/layout.tsx).
                </>,
              ],
              [
                "source",
                <>
                  Needs Tailwind CSS v4. Writes the theme as <C>yugen.css</C> next to your main CSS file and imports it, then copies{" "}
                  <C>cn()</C> and <C>YugenProvider</C> into the project.
                </>,
              ],
            ]}
          />
          <PackageManagerTabs packages={CLI_INIT_SOURCE} command="dlx" />
          <P>Result in source mode for a Vite project with an @/ alias:</P>
          <CodeBlock code={SOURCE_RESULT} />
          <P>
            Imports in the copied code use your tsconfig alias (<C>@/*</C>, <C>~/*</C>) when there is one and relative paths otherwise, so
            vite.config needs no changes. <C>&quot;use client&quot;</C> is kept for Next.js only. At the end the CLI prints the{" "}
            <C>{"<YugenProvider applyToDocument withToaster>"}</C> wrapper and the file to put it in.
          </P>
        </div>
      </DocSection>

      <DocSection id="add" title="Add components" description="Source mode. Names can be written either way: data-grid, DataGrid.">
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_ADD} command="dlx" />
          <CodeBlock code={ADD_MORE} />
          <P>
            Existing files that differ from the registry (usually because you edited them) are left alone. The CLI lists them so you can
            re-run with <C>--overwrite</C> when you want the update. Commit first and use git&apos;s diff to keep your changes.
          </P>
          <MessageBar intent="info" title="In package mode" className="max-w-3xl">
            The components are already in the <C>yugen-ui</C> package. <C>add</C> only prints the matching import.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="update"
        title="Update and remove components"
        description="Source mode. Without names, the CLI looks at every Yugen component in the project."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={UPDATE} />
          <P>
            <C>update</C> prints the diff of every file it would change, lists new files (for example a dependency the registry added),
            then asks before writing. Your edits in those files are replaced, so commit first. <C>remove</C> scans the project&apos;s imports
            (relative paths and aliases) and keeps files that are still used, for example Spinner while Button imports it. npm packages are
            not uninstalled.
          </P>
        </div>
      </DocSection>

      <DocSection id="theme" title="Brand color" description="Works in package and source mode, with the same algorithm as the Theme Designer.">
        <div className="flex flex-col gap-4">
          <CodeBlock code={THEME} />
          <P>
            <C>--vibrancy</C> (50–150) and <C>--torsion</C> (−30…30) match the Theme Designer&apos;s two sliders. When white text on the
            primary button is under 4.5:1, the CLI warns and suggests a darker key that passes. For radius, density, fonts and the rest, use
            the <A href={docsPath("/theme-designer")}>Theme Designer</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="doctor" title="Check the setup" description="Read-only. Exits with code 1 when something is wrong, so it can run in CI.">
        <div className="flex flex-col gap-4">
          <PackageManagerTabs packages={CLI_DOCTOR} command="dlx" />
          <CodeBlock code={CLI_DOCTOR_OUTPUT} />
          <P>
            It checks for React 18 or later, Tailwind CSS v4 when the theme is used, a single theme import placed after{" "}
            <C>@import &quot;tailwindcss&quot;</C>, the installed <C>yugen-ui</C> against the latest on npm, the component folder and{" "}
            <C>cn.ts</C> in source mode, and a <C>YugenProvider</C>.
          </P>
        </div>
      </DocSection>

      <DocSection id="config" title="yugen.json and the registry">
        <div className="flex flex-col gap-4">
          <P>
            <C>init</C> writes this file at the project root; <C>add</C>, <C>list</C> and <C>doctor</C> read it. You can edit it, for example
            to change <C>paths.ui</C> and keep components somewhere else. Without it, a project that has <C>yugen-ui</C> installed (an app
            made by <C>create</C>, for example) is treated as package mode.
          </P>
          <CodeBlock code={CLI_CONFIG} />
          <P>
            Components come from the registry at <C>{REGISTRY_URL}</C>, the same source as the{" "}
            <A href={docsPath("/concepts/shadcn-registry")}>shadcn CLI</A>. Projects that ran <C>shadcn init</C> with the Yugen registry can use{" "}
            <C>yugen add</C> straight away because the CLI reads <C>components.json</C>. Point <C>--registry</C>, or <C>registry</C> in
            yugen.json, at another URL or a local folder (<C>public/r</C> after <C>npm run registry</C> when working on Yugen).
          </P>
        </div>
      </DocSection>

      <DocSection id="options" title="Common options">
        <div className="flex flex-col gap-4">
          <Table
            head={["Option", "Meaning"]}
            rows={[
              ["-y, --yes", "Never prompt, use the defaults. On automatically in CI or without a terminal."],
              ["--cwd <dir>", "Run in another directory."],
              ["--no-install", "Print the install command instead of running it (init, add, create)."],
              ["--registry <url|dir>", "Use another registry (init, add, list)."],
              ["-h, --help", "Help for each command."],
            ]}
          />
          <CodeBlock code={CI} />
        </div>
      </DocSection>
    </>
  );
}
