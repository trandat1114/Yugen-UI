import type { ReactNode } from "react";
import { Badge, MessageBar } from "@/components/ui";
import { DocSection } from "../../blocks";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: wide tables can be scrolled horizontally with the keyboard (axe scrollable-region-focusable).
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

const Supported = () => (
  <Badge appearance="tint" color="success">
    Supported
  </Badge>
);
const NotSupported = () => (
  <Badge appearance="tint" color="danger">
    Not supported
  </Badge>
);

export default function Page() {
  return (
    <>
      <DocSection
        id="browsers"
        title="Browsers"
        description="The latest two versions of each evergreen browser. In practice the minimum versions are those of Tailwind CSS v4."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Browser", "Version", "Status"]}
            rows={[
              ["Chrome, Edge (Chromium)", "Latest 2 · minimum 111", <Supported key="s" />],
              ["Firefox", "Latest 2 · minimum 128", <Supported key="s" />],
              ["Safari macOS & iOS / iPadOS", "Latest 2 · minimum 16.4", <Supported key="s" />],
              ["Chrome Android, Samsung Internet", "Latest", <Supported key="s" />],
              ["Internet Explorer, Edge Legacy (EdgeHTML)", "—", <NotSupported key="n" />],
            ]}
          />
          <MessageBar intent="info" title="Need older browsers?" className="max-w-3xl">
            Tailwind CSS v4 has no backward-compatible mode. In that case consider Tailwind 3 and move the token config to{" "}
            <C>tailwind.config.js</C> yourself. This is outside what Yugen UI supports.
          </MessageBar>
        </div>
      </DocSection>

      <DocSection
        id="css"
        title="CSS features used"
        description="All of them work in every browser in the table above. No polyfills or extra PostCSS plugins needed."
      >
        <SimpleTable
          head={["Feature", "Where it is used"]}
          rows={[
            ["CSS custom properties", <>All tokens: <C>--colorNeutralForeground1</C>, <C>--spacingM</C>, <C>--brand-80</C>…</>],
            [<C key="a">@layer</C>, "Tailwind v4 outputs CSS in cascade layers (theme, base, components, utilities), so utilities always win over base."],
            [<C key="a">@property</C>, "Tailwind v4 registers variables for transform, shadow and gradient so they animate smoothly."],
            [<C key="a">color-mix()</C>, <>Opacity modifiers on token colors: <C>bg-shell/85</C> (top bar), <C>border-brand-stroke/30</C> (tint Badge).</>],
            [<C key="a">:has()</C>, <>Disabled Input (<C>has-[input:disabled]</C>), Radio focus ring (<C>has-[button:focus-visible]</C>), disabled Switch.</>],
            ["Logical properties", <><C>ms-*</C>, <C>ps-*</C>, <C>start-*</C>, <C>border-s</C>, <C>rounded-s-*</C>, <C>text-start</C>. The basis of RTL support.</>],
            [<C key="a">:focus-visible</C>, "The 2px focus ring shows only for keyboard use."],
            [<C key="a">:dir() / [dir]</C>, <>The <C>rtl:</C> variant for flipping icons and transforms.</>],
            ["dvh unit", <>Dialog / Drawer / Toast height on mobile (<C>max-h-dvh</C>).</>],
            [<C key="a">clip-path: inset()</C>, "The 2px brand bar at the bottom of inputs."],
            [<C key="a">aspect-ratio</C>, "AspectRatio, Image."],
            [<C key="a">translate / scale / rotate</C>, "The individual transform properties Tailwind v4 generates."],
            ["prefers-reduced-motion, prefers-color-scheme", <>Turning off looping animations (<C>motion-reduce:animate-none</C>), picking the initial theme.</>],
            [<C key="a">oklch()</C>, "Not required: tokens use HEX values, and Tailwind's default (oklch) palette is turned off."],
          ]}
        />
      </DocSection>

      <DocSection id="stack" title="React, TypeScript, Tailwind">
        <SimpleTable
          head={["Technology", "Version", "Notes"]}
          rows={[
            ["React / React DOM", "19 (default) · 18.3 (still supported, tested in CI)", "Uses forwardRef, useId, useSyncExternalStore; Radix, cmdk and react-day-picker all support React 19."],
            ["TypeScript", "5.x", "The source is written in strict mode; every prop type is exported with its component (ButtonProps, FieldProps…)."],
            ["Tailwind CSS", "4.x", <>v4 is required: CSS-first config (<C>@theme</C>, <C>@utility</C>), syntax such as <C>size-4!</C> and <C>max-h-(--var)</C>.</>],
            ["Bundler", "Vite 6 or later · Next.js 14 / 15 · any bundler with PostCSS support", <>Components use no bundler-specific APIs; only the <C>@/</C> alias is needed.</>],
            ["Radix UI", "As in package.json", "Each primitive is a separate package. Install only the ones you use."],
            ["Icons", "@fluentui/react-icons 2.x", "Tree-shaken per icon; no icon font needed."],
          ]}
        />
      </DocSection>

      <DocSection
        id="input"
        title="Mouse, touch, keyboard"
        description="Every component works with all three input methods and with assistive technology."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Input", "Behavior"]}
            rows={[
              ["Mouse / pen", <>All states from hover to pressed. In Tailwind v4, <C>hover:</C> applies only on devices that can actually hover, so hover doesn&apos;t “stick” on touch screens.</>],
              ["Touch", <>Slider sets <C>touch-none</C> so dragging doesn&apos;t scroll the page; Toast can be swiped away; Drawer and Carousel work with touch gestures. Medium controls are 32px tall (≥ 24px per WCAG 2.5.8). Touch-first interfaces should use <C>size=&quot;large&quot;</C> (40px).</>],
              ["Keyboard", "Tab / Shift+Tab between controls, arrow keys inside groups (Tabs, Menu, RadioGroup, Toolbar, Tree, List…), Esc closes overlays. The full table is on the Accessibility overview page."],
              ["Screen readers", "Test with NVDA + Firefox / Chrome, JAWS + Chrome, VoiceOver + Safari (macOS, iOS), TalkBack + Chrome (Android), Narrator + Edge."],
              ["Contrast mode (forced-colors)", <>Floating surfaces and buttons keep <C>border-transparent</C> instead of removing the border, so Windows High Contrast still draws an outline. Focus uses <C>outline</C>, so it always shows.</>],
              ["Zoom", "Layouts use flex / grid and viewport-based max widths (calc(100vw - …)) so they reflow when zoomed in."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="engines"
        title="Testing on each engine"
        description="Every PR runs E2E tests on Chromium. Firefox and WebKit run weekly and on release PRs into main."
      >
        <div className="flex flex-col gap-4">
          <p className="max-w-3xl text-body1 text-foreground-2">
            Firefox and WebKit (desktop Safari, iPhone) run the tests for mouse dragging, Carousel, keyboard, the main docs flows and mobile
            layout. Accessibility checks (axe) run on Chromium only, since the results do not depend on the engine. Known differences:
          </p>
          <SimpleTable
            head={["Engine", "Difference", "Impact"]}
            rows={[
              ["Safari / WebKit", "A mouse click does not focus the button (the macOS default).", "Component behavior is unchanged. Use the keyboard when testing focus."],
              ["Firefox, WebKit", <>Playwright cannot emulate touch dragging (<C>Input.dispatchTouchEvent</C> is Chromium only).</>, "Sheet dragging and Carousel swiping are tested automatically on Chromium only; on iOS, test them by hand."],
              ["Firefox, WebKit", "Pages cannot read the clipboard unless the user allows it.", <>The Copy button only writes (<C>navigator.clipboard.writeText</C> in the click handler), so it works on every engine.</>],
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
