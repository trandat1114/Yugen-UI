import type { ReactNode } from "react";
import { MessageBar, PackageManagerTabs, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { REGISTRY_URL } from "../../install";
import { NAMESPACE, SHADCN_ADD, SHADCN_EXISTING, SHADCN_INIT, SHADCN_INIT_NEXT, TEMPLATE_COMMAND } from "../_snippets";

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

const RESULT = `components.json                       # created if missing
src/
  styles/yugen.css                    # theme — already @imported into src/index.css
  lib/cn.ts                           # cn() taught the Yugen scales
  components/ui/YugenProvider/…       # provider + the Tooltip and Toast it uses
  components/ui/Button/Button.tsx     # from the add command (folders kept so relative imports work)
  components/ui/Dialog/Dialog.tsx`;

const PROVIDER = `import { YugenProvider } from "@/components/ui/YugenProvider/YugenProvider";
import { Button } from "@/components/ui/Button/Button";

export default function App() {
  return (
    <YugenProvider applyToDocument withToaster>
      <Button appearance="primary">Hello</Button>
    </YugenProvider>
  );
}`;

const ALIAS = `// tsconfig.json (and tsconfig.app.json if present)
{ "compilerOptions": { "baseUrl": ".", "paths": { "@/*": ["./src/*"] } } }

// vite.config.ts
import path from "node:path";
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
});`;

export default function Page() {
  return (
    <>
      <DocSection id="choose" title="npm or copy the source">
        <div className="flex flex-col gap-M">
          <P>
            The <strong className="font-semibold text-foreground-1">npm package</strong> (<C>npm install yugen-ui</C>) suits you when you want
            one-command upgrades and won't change components deeply. The <strong className="font-semibold text-foreground-1">shadcn CLI</strong>{" "}
            copies the source into your project: you own and can edit every line, in exchange for handling updates yourself. Both share the
            same tokens, so you can mix them.
          </P>
          <P>
            Brand-new project? The fastest start is a one-command template (<A href="#/templates">Templates</A>) — then copy extra components
            with the CLI if needed:
          </P>
          <CodeBlock code={TEMPLATE_COMMAND} />
          <MessageBar intent="info" title="Shorter: the yugen CLI" className="max-w-3xl">
            <C>npx @yugen-ui/cli@latest init --mode source</C> and then <C>npx @yugen-ui/cli add button</C> copy the same source from the same registry, with
            short names and no components.json or extra <C>@/</C> alias. See <A href="#/concepts/cli">the yugen CLI</A>. This page is for
            projects that already use the shadcn CLI.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="init"
        title="Initialize — once per project"
        description="For a React project with Tailwind CSS v4. One command creates components.json (if missing), copies the theme + cn() + YugenProvider, installs npm packages and adds the @import to your main CSS file."
      >
        <div className="flex flex-col gap-L">
          <Tabs defaultValue="vite" className="flex flex-col gap-S">
            <TabsList aria-label="Framework">
              <TabsTrigger value="vite">Vite · TanStack Start</TabsTrigger>
              <TabsTrigger value="next">Next.js · React Router</TabsTrigger>
            </TabsList>
            <TabsContent value="vite" className="flex flex-col gap-S">
              <PackageManagerTabs packages={SHADCN_INIT} command="dlx" />
              <P>
                The theme lands in <C>src/styles/yugen.css</C>, imported from <C>src/index.css</C>.
              </P>
            </TabsContent>
            <TabsContent value="next" className="flex flex-col gap-S">
              <PackageManagerTabs packages={SHADCN_INIT_NEXT} command="dlx" />
              <P>
                The theme sits next to your main CSS file (<C>app/yugen.css</C> or <C>src/app/yugen.css</C>), imported from <C>globals.css</C>.
              </P>
            </TabsContent>
          </Tabs>
          <P>
            The <C>init</C> item is a style with <C>extends: &quot;none&quot;</C>: the CLI skips the default shadcn/ui style (colour variables,
            fonts, lucide icons), so your CSS holds only Tailwind and the Yugen theme. Then wrap your app once:
          </P>
          <CodeBlock code={PROVIDER} />
          <MessageBar intent="info" title="The CLI reports a missing import alias?" className="max-w-3xl">
            Vite projects made with <C>npm create vite</C> have no <C>@/*</C> alias yet. Add it to tsconfig and vite.config, then rerun:
          </MessageBar>
          <CodeBlock code={ALIAS} />
        </div>
      </DocSection>

      <DocSection id="add" title="Add components" description="The CLI fetches the item, copies its files, pulls in the components it depends on and installs missing npm packages.">
        <div className="flex flex-col gap-L">
          <PackageManagerTabs packages={SHADCN_ADD} command="dlx" />
          <P>Result after init + add (Yugen's folder layout is kept so relative imports between components keep working):</P>
          <CodeBlock code={RESULT} />
          <P>
            Every component page has a <C>shadcn CLI</C> tab under Import with the command for that component. Need everything? Use the{" "}
            <C>all</C> item: <C>npx shadcn@latest add {REGISTRY_URL}/all.json</C>. The full catalog is in{" "}
            <a className="text-link underline hover:text-link-hover" href={`${REGISTRY_URL}/registry.json`} target="_blank" rel="noreferrer">
              registry.json
            </a>
            .
          </P>
        </div>
      </DocSection>

      <DocSection id="namespace" title="The @yugen registry namespace" description="Shorter commands when adding many components (optional).">
        <div className="flex flex-col gap-L">
          <P>
            Add a <C>registries</C> block to <C>components.json</C>:
          </P>
          <CodeBlock code={NAMESPACE} />
          <PackageManagerTabs packages="shadcn@latest add @yugen/button @yugen/chart @yugen/sheet" command="dlx" />
        </div>
      </DocSection>

      <DocSection id="existing" title="Projects already on shadcn/ui">
        <div className="flex flex-col gap-L">
          <P>
            No need to rerun <C>init</C> — add the theme item along with your first component (Next.js uses <C>theme-next.json</C>):
          </P>
          <PackageManagerTabs packages={SHADCN_EXISTING} command="dlx" />
          <MessageBar intent="warning" title="The Yugen theme replaces Tailwind's default scales." className="max-w-3xl">
            <C>yugen.css</C> disables the default colour, radius, shadow and font-size scales (<C>bg-blue-500</C>, <C>rounded-lg</C>,{" "}
            <C>text-sm</C> are gone). Existing shadcn/ui components using those classes lose their styling — migrate gradually (see{" "}
            <A href="#/concepts/migration-shadcn">From shadcn/ui</A>) rather than mixing both themes long term.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection id="update" title="Updating">
        <P>
          Copied code is yours — the CLI doesn't update it. When Yugen ships a new version (see <A href="#/news">What's new</A>), commit your
          changes first, rerun <C>add</C> with <C>--overwrite</C>, then use git's diff to keep your customizations.
        </P>
      </DocSection>

      <DocSection id="notes" title="Notes">
        <div className="flex max-w-3xl flex-col gap-M">
          <MessageBar intent="info" title="Yugen's own cn().">
            Components import <C>cn</C> from <C>@/lib/cn</C> (tailwind-merge taught the Yugen scales), not shadcn's <C>@/lib/utils</C>.
          </MessageBar>
          <MessageBar intent="info" title={'The "use client" directive.'}>
            Every component file starts with <C>&quot;use client&quot;</C> so it works in the Next.js App Router; with Vite the line is harmless.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
