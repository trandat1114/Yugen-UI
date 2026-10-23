import type { ReactNode } from "react";
import { Kbd } from "@/components/ui";
import { BarChart, LineChart, StatTile } from "@/components/ui/Chart/Chart";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: a wide table scrolls horizontally with the keyboard (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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

/* ------------------------------------------------------------------ Palette */

const CATEGORICAL = [
  { name: "Sakura 桜", light: "#C2347A", dark: "#E24A92", cl: "5.16", cd: "3.90" },
  { name: "Ai 藍 · indigo", light: "#2F6FD0", dark: "#4A8EEB", cl: "4.88", cd: "4.41" },
  { name: "Kohaku 琥珀 · amber", light: "#B78300", dark: "#C08400", cl: "3.35", cd: "4.53" },
  { name: "Fuji 藤 · wisteria", light: "#7A5AD6", dark: "#9079E6", cl: "4.93", cd: "4.20" },
  { name: "Matcha 抹茶 · jade", light: "#0E9F8A", dark: "#14A08A", cl: "3.31", cd: "4.45" },
  { name: "Kaki 柿 · persimmon", light: "#D65A22", dark: "#E0662E", cl: "3.93", cd: "4.23" },
  { name: "Sora 空 · sky", light: "#0A8FB8", dark: "#22A4C6", cl: "3.73", cd: "4.98" },
  { name: "Koke 苔 · moss", light: "#4E8A1E", dark: "#5FA032", cl: "4.22", cd: "4.55" },
];

function Swatch({ token, size = 28 }: { token: string; size?: number }) {
  return (
    <svg width={size} height={size} aria-hidden className="shrink-0">
      <rect width={size} height={size} rx={4} style={{ fill: `var(${token})` }} />
    </svg>
  );
}

function PalettePanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div data-theme={theme} className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <p className="text-caption1 font-semibold text-foreground-3">
        {theme === "light" ? "Light · surface #FFFFFF" : "Dark · surface #292929"}
      </p>
      <ol className="flex flex-col gap-2">
        {CATEGORICAL.map((c, i) => (
          <li key={c.name} className="flex items-center gap-3">
            <span className="w-4 text-end text-caption1 text-foreground-3 tabular-nums">{i + 1}</span>
            <Swatch token={`--colorChartCategorical${i + 1}`} />
            <span className="min-w-0 flex-1 truncate text-body1 text-foreground-1">{c.name}</span>
            <span dir="ltr" className="font-mono text-caption1 text-foreground-2">
              {theme === "light" ? c.light : c.dark}
            </span>
            <span className="w-12 text-end text-caption1 text-foreground-3 tabular-nums">{theme === "light" ? c.cl : c.cd}:1</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RampPanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div data-theme={theme} className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <p className="text-caption1 font-semibold text-foreground-3">{theme === "light" ? "Light" : "Dark (reversed anchor)"}</p>
      <div className="flex flex-col gap-1">
        <span className="text-caption1 text-foreground-2">Sequential · low → high</span>
        <div className="flex gap-0.5">
          {[1, 2, 3, 4, 5, 6, 7].map((n) => (
            <Swatch key={n} token={`--colorChartSequential${n}`} size={32} />
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-caption1 text-foreground-2">Diverging · negative · midpoint · positive</span>
        <div className="flex gap-0.5">
          <Swatch token="--colorChartDivergingNeg" size={32} />
          <Swatch token="--colorChartDivergingMid" size={32} />
          <Swatch token="--colorChartDivergingPos" size={32} />
          <span className="ms-3 flex items-center gap-2 text-caption1 text-foreground-2">
            <Swatch token="--colorChartOther" size={16} />
            Other / background
          </span>
        </div>
      </div>
    </div>
  );
}

const VALIDATE = `# From the dataviz skill folder: run once per mode, on the chart's actual surface
node scripts/validate_palette.js "#c2347a,#2f6fd0,#b78300,#7a5ad6,#0e9f8a,#d65a22,#0a8fb8,#4e8a1e" --mode light --surface "#ffffff"
node scripts/validate_palette.js "#e24a92,#4a8eeb,#c08400,#9079e6,#14a08a,#e0662e,#22a4c6,#5fa032" --mode dark --surface "#292929"

# "All pairs" forms (scatter, maps, small multiples): first 3 colors only
node scripts/validate_palette.js "#c2347a,#2f6fd0,#b78300" --mode light --surface "#ffffff" --pairs all`;

const TOKENS_CSS = `/* src/styles/charts.css — use in SVG via style={{ fill: "var(--…)" }} */
--colorChartCategorical1 … 8   /* series identity, fixed order */
--colorChartSequential1 … 7    /* magnitude, a single Sakura hue (ordinal: steps 3–7 only) */
--colorChartDivergingNeg / Mid / Pos
--colorChartOther              /* "Other", background series */
--colorChartSurface  --colorChartGrid  --colorChartAxis  --colorChartCrosshair
--colorChartLabel  --colorChartLabelStrong
--chartAreaOpacity  --chartDimOpacity`;

/* ------------------------------------------------------------------ Demo */

const demoSales = [
  { month: "Jul", online: 510, store: 325 },
  { month: "Aug", online: 488, store: 340 },
  { month: "Sep", online: 560, store: 352 },
  { month: "Oct", online: 615, store: 360 },
];

const demoTrend = [
  { month: "May", search: 5050, social: 3600 },
  { month: "Jun", search: 5600, social: 3900 },
  { month: "Jul", search: 6100, social: 3700 },
  { month: "Aug", search: 6400, social: 4200 },
  { month: "Sep", search: 6250, social: 4550 },
  { month: "Oct", search: 6900, social: 4800 },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="form"
        title="Choose a chart form"
        description="Color comes last. First ask what the reader needs to do with the data: compare magnitudes, tell series apart, see positive and negative values, or read a single number?"
      >
        <div className="flex flex-col gap-5">
          <SimpleTable
            head={["Task", "Default form", "Job of color", "In Yugen"]}
            rows={[
              ["One current value (+ trend)", "A stat tile, not a one-column chart", "—", <C key="c">StatTile</C>],
              ["Compare magnitudes", "Columns; horizontal bars for many categories / long names", "One color (slot 1)", <C key="c">BarChart</C>],
              ["Trend over time", "Line; area if there is only one series", "One color or categorical", <><C>LineChart</C> <C>AreaChart</C></>],
              ["Tell several series apart", "Grouped / stacked columns, several lines", "Categorical", <><C>BarChart</C> <C>LineChart</C></>],
              ["One series is the focus", "Highlight: one color, the rest gray", "1 color + gray", <C key="c">highlight</C>],
              ["Above / below zero", "Diverging columns", "Diverging (2 poles + gray midpoint)", <C key="c">diverging</C>],
              ["Part of a whole", "Stacked columns; donut with ≤ 6 slices for a quick read", "Categorical", <><C>stacked</C> <C>DonutChart</C></>],
              ["Relationship between two measures", "Scatter; bubbles when there is a third dimension", "One color; ≤ 3 categorical groups", <C key="c">ScatterChart</C>],
              ["Magnitude on a 2D grid (hour × day, cohorts)", "Heatmap", "Sequential; diverging when there is a midpoint", <C key="c">Heatmap</C>],
              ["More than ~7 equally important groups", "Table (or table + chart)", "—", <C key="c">Table</C>],
            ]}
          />
          <P>
            Series count: with 1–3 series, color alone is enough; 4 series require direct labels; 5–6 is the soft limit (legend or small
            multiples); 7–8 is the token limit. A 9th series never gets a new color: merge it into “Other”, split into small multiples, or
            combine encodings.
          </P>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <p className="text-caption1 font-semibold text-foreground-3">The answer is one number</p>
              <StatTile locale="en-US" label="Orders today" value={1284} delta={0.064} deltaLabel="vs. yesterday" trend={[820, 910, 870, 990, 1040, 1010, 1120, 1180, 1150, 1210, 1240, 1284]} />
            </div>
            <div className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <p className="text-caption1 font-semibold text-foreground-3">The story is one series</p>
              <LineChart
                locale="en-US"
                data={demoTrend}
                index="month"
                highlight="social"
                height={180}
                hideTableToggle
                series={[
                  { key: "search", label: "Search" },
                  { key: "social", label: "Social" },
                ]}
              />
            </div>
          </div>
        </div>
      </DocSection>

      <DocSection
        id="palette"
        title="Palette & tokens"
        description="Each color does one job: categorical (identity), sequential (magnitude), diverging (sign), status (good/bad, reserved). Yugen's categorical palette starts with Sakura in a fixed order, and that order is what keeps it safe for color-blind readers."
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 lg:grid-cols-2">
            <PalettePanel theme="light" />
            <PalettePanel theme="dark" />
          </div>
          <P>
            Dark is not an automatic inversion: the same 8 hues each get their own step for dark surfaces (OKLCH L 0.48–0.67) and are checked
            again on <C>#292929</C>. In the High contrast theme every mark turns white, and identity moves to 45° / 135° hatching (columns,
            slices) and dashes (lines).
          </P>
          <SimpleTable
            head={["Check (validate_palette.js)", "Light · #FFFFFF", "Dark · #292929"]}
            rows={[
              ["OKLCH lightness band", "PASS: all 8 within 0.43–0.77", "PASS: all 8 within 0.48–0.67"],
              ["Chroma ≥ 0.10", "PASS", "PASS"],
              ["Red–green color blindness, adjacent pairs (ΔE ≥ 8)", "PASS: worst 12.9 (Kaki ↔ Matcha, deutan)", "PASS: worst 12.8 (Kaki ↔ Matcha, protan)"],
              ["Normal vision, adjacent pairs (ΔE ≥ 15)", "PASS: worst 19.8 (Koke ↔ Sora)", "PASS: worst 19.0 (Koke ↔ Sora)"],
              ["Contrast with the surface ≥ 3:1", "PASS: 3.31 … 5.16", "PASS: 3.90 … 4.98"],
              ["All pairs (scatter, maps)", "First 3 colors: ΔE 14.4, so 3 series at most", "First 3 colors: ΔE 13.8, so 3 series at most"],
            ]}
          />
          <CodeBlock code={VALIDATE} />
          <div className="grid gap-4 lg:grid-cols-2">
            <RampPanel theme="light" />
            <RampPanel theme="dark" />
          </div>
          <P>
            Sequential is a single Sakura hue from light to dark (in dark the anchor is reversed, so small values sink into the background). For
            discrete ranks (funnels, rankings), use only steps 3–7 so the lightest step stays at ≥ 2:1 (checked with <C>--ordinal</C>).
            Diverging runs Sakura ↔ Ai with a neutral gray midpoint, never a hue. Status colors (success / warning / danger) are not part of
            the categorical palette and always come with an icon and text.
          </P>
          <CodeBlock code={TOKENS_CSS} />
        </div>
      </DocSection>

      <DocSection
        id="marks"
        title="Marks & spacing"
        description="The quiet, deliberate look comes from a few fixed settings and two kinds of white space. Only the data gets to be loud."
      >
        <div className="flex flex-col gap-5">
          <SimpleTable
            head={["Mark", "Spec"]}
            rows={[
              ["Column / bar", "≤ 24px (doesn't fill the slot), 4px rounding at the data end, square at the baseline, grows from a single baseline"],
              ["Line", "2px, round caps and joins"],
              ["Dot / end point", "≥ 8px, series color, 2px border in the surface color"],
              ["Area", "Series color at ~10% (dark 14%): a light wash, not a solid block"],
              ["Grid / axis", "Thin 1px, solid (never dashed), one step off the surface"],
              ["Surface gap", "2px between all marks that touch: stacked segments, adjacent columns, donut slices. No outline around marks"],
              ["Labels", "Selective: end points, extremes, the focus series. Text always uses text tokens, never the series color"],
            ]}
          />
          <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <BarChart
              locale="en-US"
              title="Revenue (million ₫)"
              description="Two series, so there is a legend; thin columns, a 2px gap between the two columns in a group"
              data={demoSales}
              index="month"
              series={[
                { key: "online", label: "Online" },
                { key: "store", label: "In store" },
              ]}
              height={220}
            />
          </div>
        </div>
      </DocSection>

      <DocSection
        id="interaction"
        title="Interaction"
        description="HTML/SVG charts are interactive by default. The tooltip adds detail; it is never the only way to read a value."
      >
        <div className="flex flex-col gap-5">
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Line / area: a vertical crosshair snaps to the nearest X value; one tooltip lists every series at that point.</li>
            <li>Column / slice: the mark itself is the hit area (wider than the mark, gap included); the selected mark stands out and the others dim.</li>
            <li>In the tooltip, the value is bold and comes first; the series name is secondary, keyed by a short stroke in the series color (not a filled square). The legend mirrors the mark: a square for columns / areas, a stroke for lines.</li>
            <li>On multi-series charts, legend items are toggle buttons; the remaining series keep their colors (color follows the entity, not its rank).</li>
            <li>Filters (date range, dimension) sit in a row above all the charts they affect, not inside a chart card.</li>
          </ul>
          <SimpleTable
            head={["Key", "Behavior"]}
            rows={[
              [<Kbd key="k">Tab</Kbd>, "Enter the chart (a single tab stop); the tooltip shows for the focused point."],
              [<span key="k" className="inline-flex gap-1"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd></span>, "Previous / next point (the plot area is always LTR, so → moves forward, even on RTL pages)."],
              [<span key="k" className="inline-flex gap-1"><Kbd>Home</Kbd><Kbd>End</Kbd></span>, "First / last point."],
              [<Kbd key="k">Esc</Kbd>, "Hide the tooltip."],
            ]}
          />
          <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <LineChart
              locale="en-US"
              title="Visits"
              description="Hover, or Tab into the chart and use the arrow keys"
              data={demoTrend}
              index="month"
              markers
              height={220}
              series={[
                { key: "search", label: "Search" },
                { key: "social", label: "Social" },
              ]}
            />
          </div>
        </div>
      </DocSection>

      <DocSection
        id="accessibility"
        title="Accessibility"
        description="Identity never relies on color alone: there is always a legend with ≥ 2 series, direct labels with ≤ 4, and every chart has an equivalent data table."
      >
        <div className="flex flex-col gap-5">
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              The frame is a <C>figure</C> named by its title; the SVG plot area has an <C>aria-label</C> that summarizes the data; each
              focusable data point is <C>role=&quot;img&quot;</C> labelled “category, series: value”.
            </li>
            <li>
              The <strong className="font-semibold text-foreground-1">Bảng dữ liệu</strong> (Data table) button switches to a <C>table</C> with
              column and row headers, the WCAG-conformant equivalent of the chart.
            </li>
            <li>
              The High contrast theme and <C>forced-colors</C> turn on hatching / dashes automatically; the <C>texture</C> prop turns them on
              manually (print, complete color blindness).
            </li>
            <li>
              Numbers and dates are formatted with Intl using <C>locale</C> (default vi-VN): compact axis labels (1 N / 2,5 Tr in vi-VN, 1K /
              2.5M in en-US), full values in tooltips and the table.
            </li>
            <li>The plot area is always <C>dir=&quot;ltr&quot;</C> (the time axis does not flip); the title, legend and tooltip follow the page&apos;s text direction.</li>
            <li>Entry animations (columns growing from the baseline, lines drawing in) are turned off entirely with <C>prefers-reduced-motion</C>.</li>
          </ul>
          <div className="rounded-xlarge border border-stroke-2 bg-background-1 p-4">
            <BarChart
              locale="en-US"
              title="Table mode"
              description="defaultShowTable opens the table first; press “Bảng dữ liệu” (Data table) to go back to the chart"
              data={demoSales}
              index="month"
              series={[
                { key: "online", label: "Online" },
                { key: "store", label: "In store" },
              ]}
              indexLabel="Month"
              defaultShowTable
              height={220}
            />
          </div>
        </div>
      </DocSection>

      <DocSection id="anti-patterns" title="Common mistakes" description="If a chart matches an item on the right, it is wrong. Fix it before you ship.">
        <DoDont
          dos={[
            "Two measures on different scales → two charts, small multiples, or both indexed to a common base on one axis.",
            "Color by entity: when some series are filtered out, the rest keep their colors.",
            "The story is one number → StatTile; one series → highlight it and gray out the rest.",
            "Thin 1px solid grid lines and axes that stay in the background; thin columns with room around them.",
            "A label that doesn't fit inside the mark goes past the end of the column or into the tooltip; the value is still in the table.",
            "Run validate_palette.js on every new palette, in both light and dark.",
          ]}
          donts={[
            "Dual Y-axis charts. They suggest correlations that don't exist.",
            "Generating a 9th color, or cycling colors past 8 series.",
            "A rainbow for sequential data; a hue at the diverging midpoint; two cool-toned poles.",
            "Status colors used for “series 4”, or series colors used to signal status.",
            "Donuts to compare close values, 2-slice pies, single-column charts.",
            "Numbers on every point, dashed grid lines, outlines around marks, a tooltip as the only way to read values.",
          ]}
        />
      </DocSection>
    </>
  );
}
