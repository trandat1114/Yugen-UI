import type { ReactNode } from "react";
import { MessageBar, PackageManagerTabs } from "@/components/ui";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { REGISTRY_URL } from "../../install";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

const COMPONENTS_JSON = `{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "new-york",
  "rsc": false,
  "tsx": true,
  "tailwind": { "config": "", "css": "src/index.css", "baseColor": "neutral", "cssVariables": true, "prefix": "" },
  "aliases": {
    "components": "@/components",
    "ui": "@/components/ui",
    "lib": "@/lib",
    "hooks": "@/hooks",
    "utils": "@/lib/utils"
  }
}`;

const RESULT = `src/
  components/ui/Button/Button.tsx     # the component you asked for
  components/ui/Spinner/Spinner.tsx   # a component it imports (pulled in automatically)
  lib/cn.ts                           # cn() taught the Yugen scales
  styles/yugen.css                    # tokens, @theme, utilities, keyframes`;

const CSS = `/* src/index.css */
@import "tailwindcss";
@import "./styles/yugen.css";`;

const PROVIDER = `import { YugenProvider } from "@/components/ui/YugenProvider/YugenProvider";
import { Button } from "@/components/ui/Button/Button";

export default function App() {
  return (
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <Button appearance="primary">Hello</Button>
    </YugenProvider>
  );
}`;

const NAMESPACE = `{
  "registries": {
    "@yugen": "${REGISTRY_URL}/{name}.json"
  }
}`;

export default function Page() {
  return (
    <>
      <DocSection id="choose" title="npm or copy the source">
        <div className="flex flex-col gap-M">
          <P>
            The <strong className="font-semibold text-foreground-1">npm package</strong> (<C>npm install yugen-ui</C>) suits you if you want
            one-command upgrades and won't modify components deeply. The <strong className="font-semibold text-foreground-1">shadcn CLI</strong>{" "}
            copies the source into your project: you own and can freely edit every line, in exchange for handling updates yourself. Both
            share the same tokens, so you can mix them — for example, install the npm package, then copy a single component you need to
            customize heavily.
          </P>
          <P>
            Every component page has a <C>shadcn CLI</C> tab in its Import section with the ready-made command for that component.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="setup"
        title="Prepare your project"
        description="React 18 or later, Tailwind CSS v4 and an @/* alias pointing at src — like any project using shadcn/ui."
      >
        <div className="flex flex-col gap-L">
          <P>
            If you've already run <C>npx shadcn@latest init</C>, skip this step. Otherwise, create <C>components.json</C> at the project
            root (Vite example; for the Next.js App Router set <C>&quot;rsc&quot;: true</C> and <C>css</C> to <C>app/globals.css</C>):
          </P>
          <CodeBlock code={COMPONENTS_JSON} />
          <P>
            Add the alias to <C>tsconfig.json</C> (<C>&quot;paths&quot;: {"{"} &quot;@/*&quot;: [&quot;./src/*&quot;] {"}"}</C>) and to your
            bundler (Vite: <C>resolve.alias</C>).
          </P>
        </div>
      </DocSection>

      <DocSection id="add" title="Add components" description="The CLI fetches the item, copies the files, pulls in dependent components and installs missing npm packages.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={`shadcn@latest add ${REGISTRY_URL}/button.json`} command="dlx" />
          <P>The result (folders keep Yugen's structure so relative imports between components keep working):</P>
          <CodeBlock code={RESULT} />
          <P>
            Need everything? Use the <C>all</C> item: <C>npx shadcn@latest add {REGISTRY_URL}/all.json</C>. The full catalog is in{" "}
            <a className="text-link underline hover:text-link-hover" href={`${REGISTRY_URL}/registry.json`} target="_blank" rel="noreferrer">
              registry.json
            </a>
            .
          </P>
        </div>
      </DocSection>

      <DocSection id="theme" title="Enable the Yugen theme" description="Do it once for the whole project.">
        <div className="flex flex-col gap-L">
          <P>
            The <C>theme</C> item (installed automatically with your first component) creates <C>styles/yugen.css</C>. Import it right after
            Tailwind in your main CSS file, then wrap your app in <C>YugenProvider</C>:
          </P>
          <CodeBlock code={CSS} />
          <CodeBlock code={PROVIDER} />
        </div>
      </DocSection>

      <DocSection id="namespace" title="The @yugen registry namespace" description="Shorter to type, and installs several components at once.">
        <div className="flex flex-col gap-L">
          <P>
            Add a <C>registries</C> block to <C>components.json</C>:
          </P>
          <CodeBlock code={NAMESPACE} />
          <PackageManagerTabs packages="shadcn@latest add @yugen/button @yugen/chart @yugen/sheet" command="dlx" />
        </div>
      </DocSection>

      <DocSection id="update" title="Updating">
        <P>
          Copied code is yours — the CLI doesn't update it. When Yugen ships a new release (see{" "}
          <a className="text-link underline hover:text-link-hover" href="#/news">
            What's new
          </a>
          ), commit your changes first, run <C>add</C> again with <C>--overwrite</C>, then use git's diff to keep your customizations.
        </P>
      </DocSection>

      <DocSection id="notes" title="Notes">
        <div className="flex max-w-3xl flex-col gap-M">
          <MessageBar intent="warning" title="The Yugen theme replaces Tailwind's default scales.">
            <C>yugen.css</C> disables the default colors, radii, shadows and font sizes (<C>bg-blue-500</C>, <C>rounded-lg</C>, <C>text-sm</C>{" "}
            no longer exist). Don't mix it with shadcn/ui's default theme in the same app.
          </MessageBar>
          <MessageBar intent="info" title="Yugen's own cn().">
            Components import <C>cn</C> from <C>@/lib/cn</C> (tailwind-merge taught the Yugen scales), not shadcn's <C>@/lib/utils</C>.
          </MessageBar>
          <MessageBar intent="info" title={'The "use client" directive.'}>
            Every component file starts with <C>&quot;use client&quot;</C> so it works in the Next.js App Router; with Vite or CRA the line is
            harmless.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
