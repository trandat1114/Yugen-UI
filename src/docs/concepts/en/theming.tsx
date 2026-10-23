import type { ReactNode } from "react";
import {
  Badge,
  Button,
  Checkbox,
  Input,
  MessageBar,
  Switch,
  YugenProvider,
  type YugenBrand,
  type YugenTheme,
  useYugen,
} from "@/components/ui";
import { DocSection, DoDont, PropsTable } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
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
                <td key={j} className="px-4 py-3 text-foreground-2">
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

/** Reads the context of the nearest YugenProvider, to show useYugen(). */
function ThemeInfo() {
  const { theme, brand, dir } = useYugen();
  return (
    <p className="font-mono text-caption1 text-foreground-3">
      useYugen() → theme: {theme} · brand: {brand} · dir: {dir}
    </p>
  );
}

function Sample() {
  return (
    <div className="flex flex-col gap-3">
      <ThemeInfo />
      <div className="flex flex-wrap items-center gap-2">
        <Button appearance="primary">Save</Button>
        <Button>Cancel</Button>
        <Badge>3</Badge>
      </div>
      <Input placeholder="Search the project" aria-label="Search the project" />
      <div className="flex flex-wrap items-center gap-3">
        <Switch label="Sync" defaultChecked />
        <Checkbox label="Remember me" defaultChecked />
      </div>
    </div>
  );
}

const PANELS: { theme: YugenTheme; brand: YugenBrand }[] = [
  { theme: "light", brand: "sakura" },
  { theme: "dark", brand: "web" },
  { theme: "light", brand: "teams" },
];

const NESTED_CODE = `import { YugenProvider } from "@/components/ui";

<div className="grid gap-4 md:grid-cols-3">
  <YugenProvider theme="light" brand="sakura" className="rounded-xlarge border border-stroke-2 p-4">
    <Sample />
  </YugenProvider>
  <YugenProvider theme="dark" brand="web" className="rounded-xlarge border border-stroke-2 p-4">
    <Sample />
  </YugenProvider>
  <YugenProvider theme="light" brand="teams" className="rounded-xlarge border border-stroke-2 p-4">
    <Sample />
  </YugenProvider>
</div>`;

const HOOK_CODE = `import * as React from "react";
import { WeatherMoon20Regular, WeatherSunny20Regular } from "@fluentui/react-icons";
import { Button, YugenProvider, useYugen, type YugenTheme } from "@/components/ui";

export default function App() {
  const [theme, setTheme] = React.useState<YugenTheme>("light");
  return (
    <YugenProvider applyToDocument withToaster theme={theme}>
      <ThemeToggle onToggle={() => setTheme((t) => (t === "light" ? "dark" : "light"))} />
    </YugenProvider>
  );
}

function ThemeToggle({ onToggle }: { onToggle: () => void }) {
  const { theme } = useYugen();
  const dark = theme === "dark";
  return (
    <Button
      appearance="subtle"
      icon={dark ? <WeatherSunny20Regular /> : <WeatherMoon20Regular />}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={onToggle}
    />
  );
}`;

const LAYERS_CODE = `/* 1. GLOBAL (tokens.css): raw values, no role */
:root { --grey-14: #242424; --white: #ffffff; }
[data-brand="web"] { --brand-70: #115ea3; --brand-80: #0f6cbd; /* … 10 → 160 */ }

/* 2. ALIAS (tokens.css): roles, same names as Fluent UI v9, change with the theme */
[data-theme="light"] { --colorNeutralForeground1: var(--grey-14); }
[data-theme="light"], [data-brand] { --colorBrandBackground: var(--brand-80); }
[data-theme="dark"] { --colorBrandBackground: var(--brand-70); }

/* 3. UTILITY (index.css): the bridge to Tailwind */
@theme inline {
  --color-foreground-1: var(--colorNeutralForeground1);   /* text-foreground-1 */
  --color-brand-background: var(--colorBrandBackground);  /* bg-brand-background */
}`;

const BRAND_CODE = `/* src/styles/tokens.css: paste after the existing brand blocks (illustrative values; use the Theme Designer to generate an exact ramp) */
[data-brand="matcha"] {
  --brand-10: #0a1a10;
  --brand-20: #0f2818;
  --brand-30: #13351f;
  --brand-40: #174327;
  --brand-50: #1b522f;
  --brand-60: #1f6137;
  --brand-70: #236f3f;
  --brand-80: #277d47; /* key color, must be ≥ 4.5:1 on white */
  --brand-90: #2f9455;
  --brand-100: #3fac66;
  --brand-110: #5bbb7d;
  --brand-120: #74c690;
  --brand-130: #93d4a8;
  --brand-140: #b1e1c0;
  --brand-150: #cdeed6;
  --brand-160: #e9f7ed;
}`;

const BRAND_USE_CODE = `// The whole app
<YugenProvider applyToDocument theme="light" brand="matcha">…</YugenProvider>

// Or one region only (for example the marketing page of a sub-product)
<YugenProvider theme="light" brand="matcha" className="rounded-xlarge p-5">…</YugenProvider>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="attributes"
        title="data-theme & data-brand"
        description="Every color is read from a CSS custom property. Two attributes pick the set of values: data-theme picks the neutral and semantic palette, data-brand picks the brand ramp."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Attribute", "Value", "Meaning"]}
            rows={[
              [<C key="a">data-theme</C>, <C key="b">light</C>, <>Default (declared on <C>:root</C>), equivalent to <C>webLightTheme</C>.</>],
              [<C key="a">data-theme</C>, <C key="b">dark</C>, <>Equivalent to <C>webDarkTheme</C>. Dark background, and the brand uses lighter steps (Background = brand70, Foreground1 = brand100).</>],
              [
                <C key="a">data-theme</C>,
                <C key="b">high-contrast</C>,
                <>
                  High contrast mode (equivalent to teamsHighContrastTheme): black background, white text, cyan accent, yellow links, green
                  for disabled; shadows become a 1px white border. Already declared in <C>tokens.css</C>. Pick High contrast in the Theme menu
                  at the top to try it.
                </>,
              ],
              [<C key="a">data-brand</C>, <C key="b">sakura</C>, "Default. Cherry blossom pink 桜, Brand80 reaches 5.16:1 with white text."],
              [<C key="a">data-brand</C>, <C key="b">web</C>, "Communication Blue, the original Fluent 2 brand."],
              [<C key="a">data-brand</C>, <C key="b">teams</C>, "Indigo “Dusk”."],
              [<C key="a">data-brand</C>, <C key="b">your-brand</C>, <>Any ramp you declare with <C>[data-brand=&quot;your-brand&quot;]</C> (see the end of this page).</>],
            ]}
          />
          <CodeBlock
            code={`<!-- No JavaScript needed: the attributes on <html> are enough -->
<html lang="en" data-theme="dark" data-brand="web" dir="ltr">`}
          />
          <MessageBar intent="warning" title="Don't use the dark: variant." className="max-w-3xl">
            Tailwind&apos;s <C>dark:</C> doesn&apos;t know about nested <C>data-theme</C> and doubles the number of classes. Every light / dark
            difference is already in the tokens.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="provider"
        title="YugenProvider"
        description="The equivalent of FluentProvider: applies theme, brand and text direction to a component tree, and adds Radix's DirectionProvider, TooltipProvider and (optionally) a Toaster."
      >
        <div className="flex flex-col gap-4">
          <PropsTable
            props={[
              { name: "theme", type: `"light" | "dark" | "high-contrast"`, defaultValue: `"light"`, description: "Written to data-theme." },
              { name: "brand", type: `"sakura" | "web" | "teams" | string`, defaultValue: `"sakura"`, description: "Written to data-brand. Accepts custom brand names." },
              { name: "dir", type: `"ltr" | "rtl"`, defaultValue: `"ltr"`, description: "Written as dir on the wrapper and passed to Radix as the text direction (keyboard, Slider, submenus…)." },
              {
                name: "applyToDocument",
                type: "boolean",
                defaultValue: "false",
                description:
                  "true: writes data-theme / data-brand / dir to <html>. Use it on the root provider so portals get the theme too. false: applies to the wrapping div only (nested theme); the div gets bg-background-1 text-foreground-1.",
              },
              { name: "withTooltipProvider", type: "boolean", defaultValue: "true", description: "Wraps a TooltipProvider (300ms delay) around the Tooltips inside." },
              {
                name: "withToaster",
                type: "boolean",
                defaultValue: "false",
                description: "Adds <Toaster /> so toast() works, placed bottom-end (bottom-start in RTL). Turn it on for the root provider only.",
              },
              { name: "className, …div props", type: "HTMLAttributes<HTMLDivElement>", description: "Passed to the wrapping div (the ref is forwarded)." },
            ]}
          />
          <CodeBlock
            code={`// Root provider, used once
<YugenProvider applyToDocument withToaster theme="light" brand="sakura" dir="ltr">
  <App />
</YugenProvider>`}
          />
        </div>
      </DocSection>

      <DocSection
        id="use-yugen"
        title="The useYugen() hook"
        description="Returns { theme, brand, dir } from the nearest YugenProvider. Use it when a component needs to change content (not colors) with the theme or text direction."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={HOOK_CODE} />
          <P>
            Don&apos;t use <C>useYugen()</C> to pick colors; they already change through the tokens. Use it for content: a sun or moon icon,
            light and dark illustrations, arrow direction. Surfaces in portals already follow the nested provider (see Positioning).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="nested"
        title="Nested themes"
        description="Set data-theme / data-brand on any element to change the theme of everything inside it. A YugenProvider without applyToDocument does exactly that."
      >
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 md:grid-cols-3">
            {PANELS.map((p) => (
              <YugenProvider key={`${p.theme}-${p.brand}`} theme={p.theme} brand={p.brand} className="rounded-xlarge border border-stroke-2 p-4">
                <Sample />
              </YugenProvider>
            ))}
          </div>
          <CodeBlock code={NESTED_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              When you nest a brand inside a theme that differs from <C>{"<html>"}</C>, put <strong className="font-semibold">both</strong>{" "}
              attributes on <strong className="font-semibold">the same element</strong>: brand aliases are recomputed per{" "}
              <C>[data-brand][data-theme]</C> pair. YugenProvider always writes both.
            </li>
            <li>
              The element with the attributes should set its own background (<C>bg-background-1</C>, <C>bg-background-2</C>…). Otherwise it
              is transparent and the parent theme&apos;s background shows through.
            </li>
            <li>
              Dialog, Menu, Popover and Tooltip render through a portal into <C>{"<body>"}</C> but still pick up the theme, brand and text
              direction of the nearest nested YugenProvider (through <C>usePortalThemeProps()</C>). Details on{" "}
              <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/positioning")}>Positioning</a>.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="layers" title="Three token layers" description="Global → Alias → Utility. Each layer is read only by the layer right after it.">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Layer", "Examples", "Used by"]}
            rows={[
              ["Global", <C key="a">--grey-14, --brand-80, --red-shade-10</C>, "tokens.css only (plus decorative illustrations and the palette page)."],
              ["Alias", <C key="a">--colorNeutralForeground1, --colorBrandBackground, --spacingM, --shadow16</C>, "index.css (mapping to Tailwind) and custom CSS when you really need it."],
              ["Utility", <C key="a">text-foreground-1, bg-brand-background, p-3, shadow-16</C>, "Every .tsx file."],
            ]}
          />
          <CodeBlock code={LAYERS_CODE} />
          <P>
            Alias names match Fluent UI v9 tokens one to one, so you can look them up in the Fluent docs: <C>tokens.colorNeutralStroke1</C> is{" "}
            <C>var(--colorNeutralStroke1)</C> and the <C>border-stroke-1</C> utility.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="custom-brand"
        title="Create your own brand"
        description="A brand is a 16-step ramp, --brand-10 … --brand-160. Aliases (button background, link, focus, selection tint) take the right step for light and dark."
      >
        <div className="flex flex-col gap-4">
          <ol className="flex max-w-3xl list-decimal flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              Open the <a className="text-link underline hover:text-link-hover" href={docsPath("/theme-designer")}>Theme Designer</a> and enter a
              key color and a brand name. It builds the ramp by keeping the OKLCH lightness / chroma curve of Communication Blue and changing
              the hue, previews it on real components and checks contrast.
            </li>
            <li>
              In the export section at the end of the page, copy the CSS (or download the file) and paste the{" "}
              <C>[data-brand=&quot;name&quot;]</C> block into your app&apos;s main CSS file, right after{" "}
              <C>@import &quot;yugen-ui/theme.css&quot;</C>. If you copied the source into your project, paste it into{" "}
              <C>src/styles/tokens.css</C> after the existing brands.
            </li>
            <li>
              Use <C>brand=&quot;name&quot;</C> on YugenProvider (the <C>YugenBrand</C> type accepts any string) or{" "}
              <C>data-brand=&quot;name&quot;</C> on <C>{"<html>"}</C>.
            </li>
          </ol>
          <CodeBlock code={BRAND_CODE} />
          <CodeBlock code={BRAND_USE_CODE} />
          <DoDont
            dos={[
              "Keep Brand80 at 4.5:1 or more with white text. It is the primary button background.",
              "Pick a hue far from danger red, so a delete button is not mistaken for the primary one.",
              "Check both light and dark under Color › Accessibility.",
            ]}
            donts={[
              "Don't adjust steps by hand. An uneven lightness curve gives wrong hover / pressed colors.",
              "Don't mix two brands in the same part of the UI.",
              "Don't spread the brand over large areas (header, sidebar, page background).",
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
