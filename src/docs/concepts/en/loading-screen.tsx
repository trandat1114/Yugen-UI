import type { ReactNode } from "react";
import { DocSection, DoDont } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";
import { kanji, MINCHO } from "../../boot/kanji";
import { LoadingLab } from "../../boot/LoadingLab";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: wide tables scroll horizontally with the keyboard (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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

const MEASURE = `// Count same-origin JS / CSS files that finished loading
new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) if (sameOrigin(entry)) count++;
}).observe({ type: "resource", buffered: true });

// Compare with the previous load; more files widen the denominator, so the bar slows down instead of going back
const measured = Math.min(0.95, count / Math.max(expected, count / 0.95));

// Only after the app renders (html[data-docs-ready]) does it run 95% → 100% over 400 ms
if (document.documentElement.hasAttribute("data-docs-ready")) finish();`;

const SAMPLES = [0, 7, 10, 12, 40, 99, 100];

export default function LoadingScreenPage() {
  return (
    <div className="flex flex-col">
      <DocSection id="when" title="When to use it">
        <P>
          A full-page loading screen covers everything, so it only earns its place when there is truly nothing behind it. If the page
          already has content, let people read it; use skeletons or inline indicators for the parts still loading (see Wait UX).
        </P>
        <SimpleTable
          head={["Case on the docs site", "Loading screen", "Why"]}
          rows={[
            ["Prerendered page (build)", "No", "The HTML has content on the first paint; covering it only delays LCP."],
            ["Hidden prerender (other language, RTL)", "Yes", <>data-pending hides #root until React renders.</>],
            [<C key="404">404.html</C>, "Yes", "An empty shell; React renders from the URL."],
            [<C key="dev">npm run dev</C>, "Yes", "No prerender; Vite serves individual modules (~280 files) before the first render."],
          ]}
        />
      </DocSection>

      <DocSection
        id="lab"
        title="Concept lab"
        description="Four concepts run on the same simulated load. Change the speed, turn on reduced motion or view each concept full screen."
      >
        <LoadingLab />
      </DocSection>

      <DocSection id="progress" title="Real progress">
        <P>
          A fake progress bar driven by a timer is wrong on fast and slow machines alike. The docs loading screen counts real files: JS
          and CSS files that finished loading, compared with the count from the previous visit (kept in localStorage). On the first
          visit, with nothing measured yet, it uses an estimate.
        </P>
        <CodeBlock code={MEASURE} />
        <P>
          The number holds at 95% until the page has rendered, so it never reports done before it is. After 15 seconds without a new
          file it switches to an error message with a Reload link instead of spinning forever.
        </P>
      </DocSection>

      <DocSection id="numerals" title="Kanji numerals & text">
        <P>
          Progress is written in kanji numerals to match the ensō mark, in a Mincho font when the device has one (Yu Mincho, Hiragino
          Mincho, Noto Serif JP) and serif otherwise. No % sign: the numeral sets the rhythm, and the exact value goes through ARIA.
        </P>
        <SimpleTable
          head={["Number", "Written"]}
          rows={SAMPLES.map((n) => [n, <span key={n} className="text-subtitle1" style={{ fontFamily: MINCHO }}>{kanji(n)}</span>])}
        />
        <P>“Loading” sits under the mark, widely tracked and slowly fading in and out. Vietnamese pages show “Đang tải”.</P>
      </DocSection>

      <DocSection id="motion" title="Reduced motion">
        <P>
          With reduced motion on (<C>prefers-reduced-motion: reduce</C>), the ink darkens in place instead of following the brush
          stroke, “Loading” stays still, and the screen closes at once instead of fading. Progress is still shown in full; only the
          movement goes.
        </P>
      </DocSection>

      <DocSection id="a11y" title="Accessibility">
        <P>
          The screen is a <C>role=&quot;progressbar&quot;</C> with an <C>aria-label</C> and an <C>aria-valuenow</C> in ordinary digits;
          the kanji numeral is <C>aria-hidden</C> because hearing “四十一” helps nobody. When done, the screen sets <C>aria-hidden</C> and
          leaves the DOM.
        </P>
        <P>
          In dev, Vite&apos;s compile error overlay always sits above the loading screen. In Windows high contrast mode the screen uses
          system colors (<C>Canvas</C>, <C>CanvasText</C>).
        </P>
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Show a loading screen only when the page has nothing to show yet.",
            "Measure progress from real loading and reach 100 only once the page has rendered.",
            "Wait ~200 ms before showing the mark, so fast loads don't flash.",
            "Offer an error message and a way to retry when loading stops.",
          ]}
          donts={[
            "Cover a prerendered page that already has content just to play an animation.",
            "Drive the bar with a timer and park it at 99%.",
            "Keep the screen up after the page is ready.",
            "Let screen readers read decorative numerals instead of the progress value.",
          ]}
        />
      </DocSection>
    </div>
  );
}
