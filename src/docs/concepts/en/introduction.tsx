import type { ReactNode } from "react";
import { Accessibility24Regular, Code24Regular, DarkTheme24Regular, Layer24Regular } from "@fluentui/react-icons";
import { Button, MessageBar } from "@/components/ui";
import { DocSection } from "../../blocks";
import { AuthorLink } from "../../AuthorLink";
import { COMPONENTS_META } from "../../registry";
import { SITE } from "../../site";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function A({ href, children }: { href: string; children: ReactNode }) {
  const external = href.startsWith("http");
  return (
    <a
      className="text-link underline hover:text-link-hover"
      href={href}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {children}
    </a>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span className="flex size-10 shrink-0 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2">
      {children}
    </span>
  );
}

const INCLUDED = [
  {
    href: docsPath("/components/button"),
    title: `${COMPONENTS_META.length} components`,
    body: "Each page has live examples, usage guidance and a props table. Yugen Labs adds charts, AI chat UI, Trace and Sheet.",
  },
  {
    href: docsPath("/blocks"),
    title: "Blocks",
    body: "Screens built from components: sign-in, data tables, scheduling… Copy the whole file into your project.",
  },
  {
    href: docsPath("/templates"),
    title: "Templates",
    body: "Sample apps created with one command: starter, SaaS, blog, dashboard, AI chat.",
  },
  {
    href: docsPath("/theme-designer"),
    title: "Theme Designer",
    body: "Build brand colors from one hex value, check contrast and export the tokens.",
  },
];

const WAYS: { way: string; command: string; when: string; update: ReactNode }[] = [
  { way: "npm package", command: "npm i yugen-ui", when: "You want to start right away and rarely change components.", update: <C>npm update yugen-ui</C> },
  {
    way: "@yugen-ui/cli",
    command: "npx @yugen-ui/cli add button",
    when: "You need to edit component source in your project.",
    update: (
      <>
        Rerun <C>add --overwrite</C> and review the diff
      </>
    ),
  },
  {
    way: "shadcn CLI",
    command: "npx shadcn@latest add …",
    when: "Your project already uses shadcn/ui.",
    update: (
      <>
        Rerun <C>add</C>, as with shadcn/ui
      </>
    ),
  },
];

const PRINCIPLES = [
  {
    icon: <Layer24Regular />,
    title: "Three token layers",
    body: "Raw value → role → Tailwind class. Components only use classes, so changing the theme means changing tokens, not components.",
  },
  {
    icon: <Accessibility24Regular />,
    title: "Accessible",
    body: "Works with a keyboard and screen readers, has a clear focus ring, text meets 4.5:1 contrast, and state is never shown by color alone.",
  },
  {
    icon: <DarkTheme24Regular />,
    title: "Themes set with attributes",
    body: "data-theme, data-brand and dir go on <html> for the whole app, or on a region through YugenProvider.",
  },
  {
    icon: <Code24Regular />,
    title: "Examples you can paste",
    body: "Examples on component pages are type-checked automatically against imports from yugen-ui.",
  },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="what"
        title="What is Yugen UI?"
        description="幽玄 (yūgen) is a quiet, deep kind of beauty that suggests more than it says. Yugen UI follows that idea: restrained and clear."
      >
        <div className="flex flex-col gap-5">
          <P>
            Yugen UI is a set of React components written in TypeScript. It runs on React 18 or 19 with Tailwind CSS v4, or with a
            precompiled CSS file if you don&apos;t use Tailwind. All components share one set of tokens, so changing the theme, brand color or text
            direction doesn&apos;t require touching components.
          </P>
          <div className="grid gap-3 sm:grid-cols-2">
            {INCLUDED.map((s) => (
              <a
                key={s.href}
                href={s.href}
                className="group flex flex-col gap-1 rounded-xlarge border border-stroke-2 bg-background-1 p-4 transition-colors duration-faster hover:bg-subtle-hover"
              >
                <span className="text-subtitle2 font-semibold text-foreground-1 group-hover:text-brand-foreground-1">{s.title}</span>
                <span className="text-body1 text-foreground-2">{s.body}</span>
              </a>
            ))}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button asChild appearance="primary">
              <a href={docsPath("/concepts/quick-start")}>Quick start</a>
            </Button>
            <Button asChild>
              <a href={docsPath("/components/button")}>Browse components</a>
            </Button>
          </div>
        </div>
      </DocSection>

      <DocSection id="ways" title="Choose how to use it" description="All three share the same tokens and themes, and you can mix them in one project.">
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
            <table className="w-full border-collapse text-start text-body1">
              <thead>
                <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
                  <th scope="col" className="px-4 py-2 text-start">
                    Option
                  </th>
                  <th scope="col" className="px-4 py-2 text-start">
                    Good when
                  </th>
                  <th scope="col" className="px-4 py-2 text-start">
                    Updating
                  </th>
                </tr>
              </thead>
              <tbody>
                {WAYS.map((w) => (
                  <tr key={w.way} className="border-b border-stroke-3 align-top last:border-b-0">
                    <th scope="row" className="px-4 py-3 text-start font-semibold text-foreground-1">
                      {w.way}
                      <span className="mt-0.5 block font-mono text-caption1 font-normal whitespace-nowrap text-foreground-3">{w.command}</span>
                    </th>
                    <td className="px-4 py-3 text-foreground-2">{w.when}</td>
                    <td className="px-4 py-3 text-foreground-2">{w.update}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <P>
            Full commands and version requirements are in <A href={docsPath("/concepts/quick-start")}>Quick start</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="principles" title="Principles">
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <IconTile>{p.icon}</IconTile>
              <div className="min-w-0 flex-1">
                <h3 className="text-subtitle2 font-semibold text-foreground-1">{p.title}</h3>
                <p className="mt-1 text-body1 text-foreground-2">{p.body}</p>
              </div>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection id="status" title="Versions and license">
        <div className="flex flex-col gap-4">
          <P>
            Yugen UI is before 1.0. A minor release may contain breaking changes, always listed in <A href={docsPath("/news")}>What&apos;s new</A>; a patch
            release only fixes bugs. The full rules are in <A href={docsPath("/concepts/versioning")}>Versioning</A>.
          </P>
          <P>
            MIT license. Report bugs in <A href={SITE.links.issues}>GitHub Issues</A>, ask questions and share ideas in{" "}
            <A href={SITE.links.discussions}>Discussions</A>.
          </P>
        </div>
      </DocSection>

      <DocSection id="credit" title="Credits">
        <div className="flex flex-col gap-4">
          <P>
            Yugen UI is made by <AuthorLink className="text-link hover:text-link-hover" />. The token structure and component behavior are
            inspired by <A href="https://fluent2.microsoft.design/">Microsoft Fluent 2</A>; the source distribution model comes from{" "}
            <A href="https://ui.shadcn.com/">shadcn/ui</A>. Complex behavior builds on Radix UI, cmdk, react-day-picker and
            react-resizable-panels. Icons: Fluent System Icons (MIT).
          </P>
          <MessageBar intent="info" title="Not a Microsoft product." className="max-w-3xl">
            The Sakura palette, gradients and brand ramp are defined by Yugen UI.
          </MessageBar>
        </div>
      </DocSection>
    </>
  );
}
