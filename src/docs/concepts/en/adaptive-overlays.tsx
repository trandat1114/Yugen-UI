import * as React from "react";
import type { ReactNode } from "react";
import { Dismiss24Regular, Filter20Regular, Location20Regular } from "@fluentui/react-icons";
import { Button, Checkbox } from "@/components/ui";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet/Sheet";
import { useMediaQuery } from "@/components/ui/Sheet/useMediaQuery";
import { DocSection, DoDont, PropsTable } from "../../blocks";
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

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function DemoStage({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">{children}</div>
  );
}

/* ------------------------------------------------------------------ demos */

function AdaptiveFilterDemo() {
  const [open, setOpen] = React.useState(false);
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return (
    <>
      <Sheet open={open} onOpenChange={setOpen} snapPoints={[0.6, 0.92]}>
        <SheetTrigger asChild>
          <Button icon={<Filter20Regular />}>Open filters</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader
            action={
              <SheetClose asChild>
                <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Close" />
              </SheetClose>
            }
          >
            <SheetTitle>Filters</SheetTitle>
            <SheetDescription>{isDesktop ? "Currently a side panel." : "Currently a bottom sheet. Try dragging the handle."}</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <div className="flex flex-col gap-3">
              <Checkbox label="In stock" defaultChecked />
              <Checkbox label="Delivery within 2 hours" />
              <Checkbox label="Free shipping" />
            </div>
          </SheetBody>
          <SheetFooter>
            <Button appearance="primary" onClick={() => setOpen(false)}>
              Apply
            </Button>
            <SheetClose asChild>
              <Button>Cancel</Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
      <span className="text-body1 text-foreground-3">
        The viewport is {isDesktop ? "≥ 768px → panel" : "< 768px → bottom sheet"}. Resize the window to switch.
      </span>
    </>
  );
}

const STOPS = ["Ben Nghe", "City Opera House", "Ba Son", "Van Thanh", "Tan Cang", "Thao Dien", "An Phu", "Rach Chiec"];

function SnapPlaygroundDemo() {
  const [snap, setSnap] = React.useState(0.25);
  return (
    <>
      <Sheet mode="bottom" snapPoints={[0.25, 0.5, 0.9]} snapPoint={snap} onSnapPointChange={setSnap}>
        <SheetTrigger asChild>
          <Button icon={<Location20Regular />}>Try three snap points</Button>
        </SheetTrigger>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>Metro Line 1</SheetTitle>
            <SheetDescription>Current snap point: {Math.round(snap * 100)}% of the screen height.</SheetDescription>
          </SheetHeader>
          <SheetBody>
            <ol className="flex flex-col gap-2">
              {STOPS.map((stop, i) => (
                <li key={stop} className="flex items-center gap-2 rounded-medium bg-background-2 px-3 py-2">
                  <span className="flex size-6 shrink-0 items-center justify-center rounded-circular bg-background-1 text-caption1 font-semibold">
                    {i + 1}
                  </span>
                  {stop}
                </li>
              ))}
            </ol>
          </SheetBody>
        </SheetContent>
      </Sheet>
      <span className="text-body1 text-foreground-3">Last snap point: {Math.round(snap * 100)}%</span>
    </>
  );
}

/* ------------------------------------------------------------------ code */

const CHOOSE_CODE = `import { useMediaQuery, Popover, PopoverTrigger, PopoverSurface, Sheet, SheetTrigger, SheetContent } from "@/components/ui";

// Share menu: a Popover anchored to the button on desktop, a bottom sheet within thumb reach on phones.
function ShareAction() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const trigger = <Button icon={<Share20Regular />}>Share</Button>;

  if (isDesktop) {
    return (
      <Popover>
        <PopoverTrigger asChild>{trigger}</PopoverTrigger>
        <PopoverSurface><ShareOptions /></PopoverSurface>
      </Popover>
    );
  }
  return (
    <Sheet mode="bottom" snapPoints={[0.4]}>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent>
        <SheetHeader><SheetTitle>Share</SheetTitle></SheetHeader>
        <SheetBody><ShareOptions /></SheetBody>
      </SheetContent>
    </Sheet>
  );
}`;

const SHEET_CODE = `<Sheet
  side="end"              // desktop: panel on the inline-end edge (left in RTL)
  size="medium"           // 592px
  breakpoint={768}        // < 768px → bottom sheet
  snapPoints={[0.45, 0.9]}
  onSnapPointChange={(snap) => analytics.track("sheet_snap", { snap })}
>
  <SheetTrigger asChild><Button>Order details</Button></SheetTrigger>
  <SheetContent>
    <SheetHeader action={<SheetClose asChild><Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Close" /></SheetClose>}>
      <SheetTitle>Order #2026-1020</SheetTitle>
      <SheetDescription>3 items · delivery by 18:00</SheetDescription>
    </SheetHeader>
    <SheetBody>{/* long content: only scrolls when the sheet is at its highest snap point */}</SheetBody>
    <SheetFooter>{/* always stays at the bottom of the screen, even at the 45% snap point */}</SheetFooter>
  </SheetContent>
</Sheet>`;

const SAFE_AREA_CODE = `<!-- index.html: enable env(safe-area-inset-*) and let the on-screen keyboard shrink the content -->
<meta
  name="viewport"
  content="width=device-width, initial-scale=1, viewport-fit=cover, interactive-widget=resizes-content"
/>`;

const MOTION_CODE = `// CSS: Sheet already uses motion-reduce:animate-none / motion-reduce:transition-none.
// JS: behavior you write yourself reads the user's preference directly.
const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

list.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });`;

/* ------------------------------------------------------------------ page */

export default function Page() {
  return (
    <>
      <DocSection
        id="choose"
        title="Choose an overlay"
        description="Start from the task, then think about the device. The more an overlay blocks, the more the task has to justify the interruption."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Overlay", "Desktop", "Phone", "Use for"]}
            rows={[
              [
                "Dialog",
                "A modal box in the center of the screen.",
                "Still centered; only for short content.",
                "Immediate decisions: confirm, delete, fill in 1–3 fields. modalType=\"alert\" for destructive actions.",
              ],
              [
                "Drawer",
                "A left / right side panel (overlay) or a panel inside the layout (inline).",
                "Easily covers the whole screen; the close button in the top corner is hard to reach.",
                "Navigation and secondary panels that stay on one side, especially InlineDrawer on wide screens.",
              ],
              [
                "Sheet (Labs)",
                "A start / end side panel, like Drawer.",
                "A draggable bottom sheet with several snap points; swipe down to close.",
                "Secondary tasks that need a moderate amount of space on any device: filters, record details, sharing, picking options.",
              ],
              [
                "Popover",
                "A small non-modal surface anchored to a button.",
                "Anchored to a small button, easily hidden by the on-screen keyboard or the screen edge.",
                "Short information or choices tied to a specific spot. On phones, consider switching to a Sheet.",
              ],
            ]}
          />
          <Bullets
            items={[
              <>
                The user needs to <strong className="font-semibold">stop and decide</strong> → Dialog. Don&apos;t put an important decision in a
                sheet that can be swiped away.
              </>,
              <>
                Content that <strong className="font-semibold">supports the page</strong> (filters, details) and may be used on a phone →
                Sheet: one declaration, two forms.
              </>,
              <>
                A small choice <strong className="font-semibold">tied to a button</strong> → Popover on desktop; on narrow screens switch to a
                bottom sheet with <C>useMediaQuery</C>.
              </>,
              <>The app&apos;s main navigation → Nav / InlineDrawer, not a temporary overlay.</>,
            ]}
          />
          <CodeBlock code={CHOOSE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="sheet"
        title="Sheet: one API, two forms"
        description="Sheet picks its form from the viewport width (useMediaQuery). Content, focus and state are kept when the user rotates the device or resizes the window."
      >
        <div className="flex flex-col gap-4">
          <DemoStage>
            <AdaptiveFilterDemo />
          </DemoStage>
          <CodeBlock code={SHEET_CODE} />
          <PropsTable
            props={[
              { name: "mode", type: `"auto" | "side" | "bottom"`, defaultValue: `"auto"`, description: "auto follows the breakpoint; side / bottom forces one form." },
              { name: "breakpoint", type: "number", defaultValue: "768", description: "Minimum viewport width (px) for the panel form." },
              { name: "side / size", type: `"start" | "end" / "small" | "medium" | "large"`, defaultValue: `"end" / "small"`, description: "Panel form: the edge (flips in RTL) and the width, 320 / 592 / 940px." },
              { name: "snapPoints", type: "number[]", defaultValue: "[0.5, 0.9]", description: "Bottom sheet snap heights (as a fraction of the viewport height)." },
              { name: "modal / dismissible", type: "boolean", defaultValue: "true / true", description: "Overlay + focus trap; allow closing with Esc / an outside click / a swipe." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="ergonomics"
        title="Bottom sheet ergonomics"
        description="On a phone held in one hand, the bottom third of the screen is the easiest area for the thumb to reach. A bottom sheet puts content and actions in that area."
      >
        <div className="flex flex-col gap-4">
          <DemoStage>
            <SnapPlaygroundDemo />
          </DemoStage>
          <SimpleTable
            head={["Factor", "Behavior in Yugen", "Guidance"]}
            rows={[
              ["Thumb zone", "SheetFooter always stays at the bottom of the screen, even at a low snap point.", "Put the primary action in the footer, not in the header."],
              [
                "Snap points",
                "On release, the sheet moves to the nearest snap point; snap points are fractions of the viewport height (dvh).",
                "2–3 snap points: a quick look (0.25–0.5) and details (≈ 0.9, leaving a strip of the page visible above so users know they are still on the same page).",
              ],
              [
                "Fast swipe",
                "Velocity > 0.45 px/ms → jumps to the next snap point in the swipe direction.",
                "No need to drag far; one flick is enough.",
              ],
              [
                "Swipe down to close",
                "Drag below half of the lowest snap point, or flick down from the lowest snap point; the overlay fades as you drag.",
                "Turn it off with dismissible={false} when a choice is required.",
              ],
              [
                "Scrolling content",
                "Content only scrolls at the highest snap point; at lower ones, dragging anywhere moves the sheet. Dragging down while at the top of the content moves the whole sheet.",
                "Open long content at a low snap point first and let the user drag it up.",
              ],
              [
                "No-drag areas",
                "Inputs, textareas, selects and elements with data-sheet-no-drag don't start a drag; horizontal swipes are left to carousels / sliders.",
                "Add data-sheet-no-drag to maps, canvases and drawing areas.",
              ],
            ]}
          />
          <P>
            In desktop browsers, dragging works with the mouse (pointer events) when Sheet is in bottom form; the mouse wheel and two-finger
            touchpad gestures don&apos;t move the sheet. That is why the default form on wide screens is a side panel, not a bottom sheet.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="a11y"
        title="Keyboard & screen readers"
        description="Every gesture has an equivalent that does not require dragging (WCAG 2.5.1 Pointer Gestures, 2.5.7 Dragging Movements)."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Key / situation", "Result"]}
            rows={[
              ["Esc", "Closes the Sheet (unless dismissible={false}); focus returns to the button that opened it."],
              ["Tab / Shift+Tab", "Cycles inside the Sheet when it is modal; when it is not modal, focus can move to the page behind."],
              ["Opening a bottom sheet", "Focus moves to the surface itself (role=\"dialog\") so screen readers read SheetTitle + SheetDescription."],
              ["Handle (a button)", "Enter / Space: next snap point (wraps around); ↑ / ↓: up / down one snap point. The label includes the current snap point, for example “Đổi chiều cao (45%)” (Change height)."],
              ["Keyboard focus or a tap on an input at a low snap point", "The sheet expands to its highest snap point so the focused element is not off screen."],
              ["Swipe to close", "Always paired with a visible Close / Cancel button in the header or footer."],
            ]}
          />
          <P>
            Sheet is built on Radix Dialog: <C>aria-labelledby</C> points to SheetTitle, <C>aria-describedby</C> is only set when there is a
            SheetDescription, and the rest of the page is hidden from the accessibility tree when the sheet is modal. The handle is a button only
            when there are two or more snap points; with one it is decorative (aria-hidden).
          </P>
        </div>
      </DocSection>

      <DocSection
        id="safe-area"
        title="Safe areas & the on-screen keyboard"
        description="The notch, the Dynamic Island and the home indicator cut into the visible area. A bottom sheet has to leave room for them."
      >
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              <>
                The footer (and the body when there is no footer) adds <C>env(safe-area-inset-bottom)</C> to its bottom padding so buttons
                don&apos;t sit under the home indicator.
              </>,
              <>
                Maximum height = <C>min(highest snap point × 100dvh, 100dvh − env(safe-area-inset-top))</C>, so the sheet never goes under the
                notch.
              </>,
              <>
                Use <C>dvh</C> instead of <C>vh</C>: the real height changes as the address bar of a mobile browser shrinks and grows.
              </>,
              <>
                <C>env()</C> is non-zero only when the page declares <C>viewport-fit=cover</C>; add <C>interactive-widget=resizes-content</C> so
                the on-screen keyboard pushes the content up instead of covering the input.
              </>,
            ]}
          />
          <CodeBlock code={SAFE_AREA_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="motion"
        title="Reduced motion"
        description="When reduced motion is turned on in the OS, overlays appear and disappear instantly, but direct manipulation still follows the finger."
      >
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              "Slide in / out, the overlay fade and the snap animation are all turned off (motion-reduce:animate-none, motion-reduce:transition-none).",
              "Dragging still moves the sheet with the finger. That is direct manipulation, not decorative animation.",
              "The rubber-band effect when dragging past the highest snap point only happens during the drag and stops on release.",
              "Carousel does not start autoplay when the user prefers reduced motion.",
            ]}
          />
          <CodeBlock code={MOTION_CODE} />
        </div>
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Use one Sheet for both desktop and phone instead of two components switched by hand.",
            "Put the primary action in SheetFooter, within thumb reach and always visible.",
            "Always provide a visible close button; gestures are only shortcuts.",
            "Test on a real device with a collapsing address bar, the on-screen keyboard and reduced motion.",
          ]}
          donts={[
            "A bottom sheet for destructive decisions. Use Dialog with modalType=\"alert\".",
            "More than 3 snap points; users can't remember that many positions.",
            "Overlays on top of overlays (a Sheet in a Sheet, a Dialog over a Sheet), except for short confirmations.",
            "Required information in the lower part of a low snap point, where it is off screen.",
          ]}
        />
      </DocSection>
    </>
  );
}
