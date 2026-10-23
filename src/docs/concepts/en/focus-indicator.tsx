import * as React from "react";
import type { ReactNode } from "react";
import { Document20Regular } from "@fluentui/react-icons";
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Dropdown,
  DropdownOption,
  Field,
  Input,
  Link,
  MessageBar,
  Radio,
  RadioGroup,
  Slider,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";
import { DocSection, DoDont } from "../../blocks";
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

const BASE_CSS = `/* src/index.css — @layer base: applies to EVERY element that gets keyboard focus */
:focus-visible {
  outline: 2px solid var(--colorStrokeFocus2); /* black in light, white in dark */
  outline-offset: 1px;
  border-radius: var(--borderRadiusMedium);
}`;

const CUSTOM_CODE = `{/* A custom element gets the focus ring from the base style; it only needs tabIndex and the right role */}
<div
  role="button"
  tabIndex={0}
  onClick={open}
  onKeyDown={(e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      open();
    }
  }}
  className="flex items-center gap-2 rounded-medium p-3 hover:bg-subtle-hover"
>
  …
</div>

{/* Inside an overflow-hidden frame (list, rounded card): pull the outline inward so it is not clipped */}
<a href="/files/42" className="block px-3 py-2 hover:bg-subtle-hover focus-visible:-outline-offset-2">…</a>

{/* To change the ring style, REPLACE it with an equivalent indicator; don't remove it */}
<button className="outline-none focus-visible:ring-2 focus-visible:ring-stroke-focus focus-visible:ring-offset-1">…</button>`;

const DIALOG_CODE = `function RenameDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Rename</Button>
      </DialogTrigger>
      <DialogSurface
        // By default Radix focuses the first element (the X button). Move focus to the input instead:
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          nameRef.current?.select();
        }}
      >
        <DialogTitle>Rename file</DialogTitle>
        <DialogContent>
          <Field label="New name">
            <Input ref={nameRef} defaultValue="Q3 report" />
          </Field>
        </DialogContent>
        <DialogActions>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="primary">Save</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
{/* Closing with Esc, the X button or Cancel → focus returns to the "Rename" button */}`;

function RenameDialog() {
  const nameRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Rename</Button>
      </DialogTrigger>
      <DialogSurface
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          nameRef.current?.select();
        }}
      >
        <DialogTitle>Rename file</DialogTitle>
        <DialogContent>
          <Field label="New name">
            <Input ref={nameRef} defaultValue="Q3 report" />
          </Field>
        </DialogContent>
        <DialogActions>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="primary">Save</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

export default function Page() {
  return (
    <>
      <DocSection
        id="how"
        title="How it works"
        description="A global rule in index.css draws an outline for :focus-visible. Browsers only apply it when the user moves with the keyboard, not on mouse clicks."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={BASE_CSS} />
          <MessageBar intent="info" title="Try it:" className="max-w-3xl">
            click an empty spot in the frame below, then press <strong className="font-semibold">Tab</strong> /{" "}
            <strong className="font-semibold">Shift + Tab</strong>. Click the same controls with the mouse and the ring does not appear.
          </MessageBar>
          <div className="flex flex-col gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <div className="flex flex-wrap items-center gap-3">
              <Button appearance="primary">Primary</Button>
              <Button>Secondary</Button>
              <Button appearance="subtle" icon={<Document20Regular />} aria-label="Document" />
              <Link href={docsPath("/concepts/accessibility")}>Link</Link>
              <Checkbox label="Checkbox" defaultChecked />
              <Switch label="Switch" />
            </div>
            <div className="flex flex-wrap items-center gap-5">
              <RadioGroup aria-label="Size" layout="horizontal" defaultValue="m">
                <Radio value="s" label="Small" />
                <Radio value="m" label="Medium" />
              </RadioGroup>
              <Tabs defaultValue="a">
                <TabsList>
                  <TabsTrigger value="a">Overview</TabsTrigger>
                  <TabsTrigger value="b">Details</TabsTrigger>
                </TabsList>
              </Tabs>
              <Slider aria-label="Volume" defaultValue={[40]} rootClassName="w-48" />
            </div>
          </div>
          <P>
            The matching utility is <C>outline-stroke-focus</C> (token <C>colorStrokeFocus2</C>). Radio draws the ring around both the button
            and its label with <C>has-[button:focus-visible]</C>, so the indicator matches the click area.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="why"
        title="Why the control color does not change on focus"
        description="Fluent keeps focus as a separate channel: hover / pressed / selected change color, focus only adds a ring."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["State", "Signal", "Reason"]}
            rows={[
              ["Rest → Hover → Pressed", "Background / border gets darker (X → XHover → XPressed)", "Feedback for the pointer."],
              ["Selected / Checked", "Brand (background, indicator bar, semibold text)", "A lasting state of the data."],
              ["Focus (keyboard)", "2px black / white outline, 1px offset", "The current position. It has to combine with every state above."],
              ["Disabled", "Disabled colors, no opacity", "Not interactive."],
            ]}
          />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>A tab that is both selected and focused still shows both: the brand bar at the bottom and the focus ring around it.</li>
            <li>
              Black / white always reaches ≥ 3:1 against every neutral background of the theme, whether the brand is Sakura, Web or your own.
              A brand color cannot guarantee that.
            </li>
            <li>A color change on focus is easy to mistake for hover or pressed, so users may think they already clicked.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="inputs"
        title="Inputs & list items"
        description="Two intended exceptions. Both replace the outline with an equivalent indicator."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-start gap-5 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Field label="Input" className="w-64">
              <Input placeholder="Click or Tab here" />
            </Field>
            <Field label="Dropdown" className="w-64">
              <Dropdown placeholder="Choose a color" className="min-w-0 w-full">
                <DropdownOption value="sakura">Sakura</DropdownOption>
                <DropdownOption value="web">Web</DropdownOption>
                <DropdownOption value="teams">Teams</DropdownOption>
              </Dropdown>
            </Field>
          </div>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <strong className="font-semibold text-foreground-1">Inputs</strong> (Input, Textarea, Select, Dropdown, Combobox, TagPicker,
              SpinButton, DatePicker): a 2px brand bar grows from the center along the bottom edge, driven by <C>:focus-within</C>. It also
              shows on click, because users need to know which field receives their typing. The inner <C>{"<input>"}</C> has{" "}
              <C>outline-none</C> since the bar replaces the ring.
            </li>
            <li>
              <strong className="font-semibold text-foreground-1">Items in composite widgets</strong> (Menu items, Dropdown / Combobox
              options, Command items): focus sits on the highlighted item, shown with the <C>background-1-hover</C> background through{" "}
              <C>data-highlighted</C> / <C>data-selected</C>.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="custom"
        title="Custom elements"
        description="Because the rule lives in the base layer, interactive elements you write get the focus ring for free. Your job is not to remove it by accident."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <div className="w-64 overflow-hidden rounded-xlarge border border-stroke-2">
              {["Q3 report.pdf", "2027 plan.docx", "Budget.xlsx"].map((f) => (
                <a
                  key={f}
                  href={docsPath("/concepts/focus-indicator")}
                  onClick={(e) => e.preventDefault()}
                  className="flex items-center gap-2 border-b border-stroke-3 px-3 py-2 text-body1 text-foreground-1 last:border-b-0 hover:bg-subtle-hover focus-visible:-outline-offset-2"
                >
                  <Document20Regular className="shrink-0 text-foreground-3" />
                  <span className="min-w-0 truncate">{f}</span>
                </a>
              ))}
            </div>
            <p className="max-w-xs text-caption1 text-foreground-3">
              The list sits in an <code className="font-mono">overflow-hidden</code> frame: <code className="font-mono">-outline-offset-2</code>{" "}
              pulls the ring inward so it is not clipped.
            </p>
          </div>
          <CodeBlock code={CUSTOM_CODE} />
          <DoDont
            dos={[
              "Use focus-visible: for every keyboard-only style.",
              "Pull the outline inward (-outline-offset-2) when the element touches the edge of an overflow-hidden frame.",
              "If you replace the outline, use an equivalent indicator: ≥ 2px, contrast ≥ 3:1, around the element.",
            ]}
            donts={[
              "Using outline-none / focus:outline-none without a replacement indicator.",
              "Using focus: for the ring. It also shows on mouse clicks.",
              "Changing only the background or brand color as the sole focus signal.",
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="management"
        title="Focus management: dialogs, menus, popovers"
        description="Radix handles the hard parts: it traps focus in Dialog / Drawer, moves focus into the surface on open and returns it to the trigger on close."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <RenameDialog />
            <p className="text-body1 text-foreground-2">Open with Enter, close with Esc; focus returns to the button.</p>
          </div>
          <CodeBlock code={DIALOG_CODE} />
          <SimpleTable
            head={["Situation", "What to do"]}
            rows={[
              ["Opening a Dialog / Drawer", <>Focus goes to the first focusable element by default. Use <C>onOpenAutoFocus</C> to pick the main input.</>],
              ["Closing an overlay", <>Focus returns to the trigger. Use <C>onCloseAutoFocus</C> to send it somewhere else.</>],
              ["The trigger disappears (deleting the item whose menu was open)", "Move focus to the next item or the list heading yourself. Don't let focus fall back to <body>."],
              ["Page navigation in an SPA", "Move focus to the h1 heading (tabIndex={-1}) or the main region of the new page."],
              ["Loading more content", "Keep focus where it is; announce the number of new items in a live region instead of moving focus."],
            ]}
          />
        </div>
      </DocSection>
    </>
  );
}
