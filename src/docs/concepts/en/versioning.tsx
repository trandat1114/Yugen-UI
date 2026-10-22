import type { ReactNode } from "react";
import { MessageBar } from "@/components/ui";
import { DocSection } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function Table({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} scope="col" className="px-L py-S text-start">
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

// Console output stays as the library prints it (Vietnamese message from warnDeprecated).
const WARN = `[yugen-ui] "Button.appearance.transparent" đã lỗi thời và sẽ bị xoá ở v2.0.0:
dùng appearance="subtle". Xem https://trandat1114.github.io/Yugen-UI/#/concepts/versioning`;

const DEPRECATE = `import { warnDeprecated } from "@/lib/deprecate";

/** @deprecated Use \`appearance="subtle"\`. Will be removed in v2.0.0. */
if (appearance === "transparent") {
  warnDeprecated("Button.appearance.transparent", 'dùng appearance="subtle"', "2.0.0");
}`;

const PIN = `# Stay on one minor line when you need absolute stability (0.x phase)
npm install yugen-ui@~0.6.0

# From 1.0: get every minor / patch release, never a major one automatically
npm install yugen-ui@^1.0.0`;

export default function Page() {
  return (
    <>
      <DocSection id="semver" title="Semantic Versioning" description="MAJOR.MINOR.PATCH — the version number alone tells you how risky an upgrade is.">
        <div className="flex flex-col gap-L">
          <Table
            head={["Bump", "Meaning", "Example"]}
            rows={[
              ["PATCH 1.2.3 → 1.2.4", "Bug fixes, a11y / performance improvements; no API changes.", "Fix a clipped focus ring in Dialog"],
              ["MINOR 1.2.3 → 1.3.0", "New components, props, tokens, variants; deprecations.", "Add a presets prop to DateRangePicker"],
              ["MAJOR 1.2.3 → 2.0.0", "Removal of deprecated APIs or other breaking changes.", "Drop appearance=\"transparent\""],
            ]}
          />
          <MessageBar intent="warning" title="The 0.x phase.">
            Before 1.0, a <strong className="font-semibold">minor</strong> release (0.6 → 0.7) may still contain breaking changes — always
            listed under “Breaking” in the CHANGELOG and on What's new. Patch releases (0.6.1 → 0.6.2) never do.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="breaking"
        title="What counts as breaking"
        description="Anything that forces working code to change before it runs again, or changes the UI unexpectedly."
      >
        <Table
          head={["Breaking (major only)", "Non-breaking (minor / patch)"]}
          rows={[
            ["Removing / renaming a component, prop, prop value, export or hook", "Adding a component, an optional prop, a new union value"],
            ["Renaming or removing a token / utility (text-foreground-2, p-M…)", "Adding tokens, utilities, brands, gradients"],
            ["Changing a default that alters behavior (e.g. modal by default)", "Small color / shadow tweaks within the committed contrast thresholds"],
            ["Changing DOM structure users target via slots / data-*", "Changing undocumented internal DOM"],
            ["Raising minimum requirements (React, Tailwind, browsers)", "Supporting new versions (React 19…)"],
          ]}
        />
      </DocSection>

      <DocSection id="deprecation" title="Deprecation process" description="No API disappears without at least one minor release of notice.">
        <div className="flex flex-col gap-L">
          <ol className="flex max-w-3xl list-decimal flex-col gap-S ps-XL text-body2 text-foreground-2">
            <li>
              A minor release adds the replacement and marks the old API with a JSDoc <C>@deprecated</C> tag (struck through in your
              editor) plus a <C>warnDeprecated()</C> warning — development only, once per API, stripped from production builds.
            </li>
            <li>The CHANGELOG and What's new list it under “Breaking” with concrete migration steps.</li>
            <li>The old API keeps working until the next major release (at least one minor release after the deprecation).</li>
            <li>The major release removes the API and keeps the migration guide in the docs.</li>
          </ol>
          <CodeBlock code={DEPRECATE} />
          <P>The console warning looks like this:</P>
          <CodeBlock code={WARN} />
        </div>
      </DocSection>

      <DocSection id="support" title="Support matrix">
        <Table
          head={["Area", "Supported", "Notes"]}
          rows={[
            ["React", "18 and 19", "CI runs typecheck, unit tests and the build on both"],
            ["Tailwind CSS", "v4", "Not needed if you use the precompiled styles.css"],
            ["TypeScript", "5.x, strict", "Types are checked against @types/react 18 and 19"],
            ["Next.js", "App Router & Pages Router", "Every component file has \"use client\""],
            ["Browsers", "Evergreen (last 2 versions of Chrome, Edge, Firefox, Safari)", "See Browsers & platforms"],
          ]}
        />
      </DocSection>

      <DocSection id="upgrade" title="Upgrading safely">
        <div className="flex flex-col gap-L">
          <ol className="flex max-w-3xl list-decimal flex-col gap-S ps-XL text-body2 text-foreground-2">
            <li>
              Read{" "}
              <a className="text-link underline hover:text-link-hover" href="#/news">
                What's new
              </a>{" "}
              from your current version to the new one, paying attention to “Breaking” items.
            </li>
            <li>Run your app in development and fix every <C>[yugen-ui]</C> console warning before moving to a new major.</li>
            <li>
              Copied code with @yugen-ui/cli or the shadcn CLI? Commit first, rerun <C>add --overwrite</C>, then review the git diff.{" "}
              <C>npx @yugen-ui/cli doctor</C> tells you when <C>yugen-ui</C> is out of date.
            </li>
          </ol>
          <CodeBlock code={PIN} />
        </div>
      </DocSection>
    </>
  );
}
