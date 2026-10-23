import * as React from "react";
import type { ReactNode } from "react";
import { Accessibility24Regular, Eye24Regular, Keyboard24Regular, Speaker224Regular, TextFont24Regular } from "@fluentui/react-icons";
import { Checkbox, Kbd, KbdGroup, ProgressBar } from "@/components/ui";
import { DocSection } from "../../blocks";
import { docsPath } from "../../router";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Keys({ children }: { children: ReactNode }) {
  return <span className="inline-flex flex-wrap items-center gap-1">{children}</span>;
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

const PRINCIPLES = [
  {
    icon: <Accessibility24Regular />,
    title: "Semantics first",
    body: "The right native element (button, a, input, table) and ARIA roles from Radix. No buttons built from a div.",
  },
  {
    icon: <Keyboard24Regular />,
    title: "Keyboard as capable as the mouse",
    body: "Everything you can do with a mouse also works from the keyboard, following the WAI-ARIA APG interaction patterns.",
  },
  {
    icon: <Eye24Regular />,
    title: "Visible state",
    body: "A 2px high-contrast focus ring; text at ≥ 4.5:1, control borders at ≥ 3:1; color is never the only signal.",
  },
  {
    icon: <Speaker224Regular />,
    title: "Announced changes",
    body: "Errors, notifications and async results are read out through live regions at the right level.",
  },
  {
    icon: <TextFont24Regular />,
    title: "User preferences respected",
    body: "prefers-reduced-motion turns off looping animations; the light / dark theme follows the OS; layouts reflow when zoomed.",
  },
];

const CHECKLIST = [
  "Every control has an accessible name: a visible label (Field, Label), or aria-label for icon-only buttons.",
  "The main flow works with the keyboard alone; focus order follows reading order; focus is always visible.",
  "Overlays (Dialog, Drawer, Menu) return focus to the trigger when they close; Esc closes them (except modalType=\"alert\").",
  "Text reaches ≥ 4.5:1 and UI components ≥ 3:1 in both light and dark (see Color › Accessibility).",
  "State does not rely on color alone: there is always an icon, text or a shape as well.",
  "Page headings use the right levels (h1 → h2 → h3), and the main regions have landmarks (header, nav, main).",
  "Images have descriptive alt text; decorative images have alt=\"\".",
  "Form errors say how to fix the problem and are linked with aria-describedby.",
  "Async results (save, upload, filter) are announced through a live region.",
  "Tested with a real screen reader and at 200% zoom.",
];

function Checklist() {
  const [done, setDone] = React.useState<boolean[]>(() => CHECKLIST.map(() => false));
  const count = done.filter(Boolean).length;

  return (
    <div className="flex flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-5">
      <ProgressBar value={count} max={CHECKLIST.length} aria-label="Checklist progress" />
      <p className="text-caption1 text-foreground-3" aria-live="polite">
        {count} of {CHECKLIST.length} done
      </p>
      <div className="flex flex-col">
        {CHECKLIST.map((item, i) => (
          <Checkbox
            key={item}
            label={item}
            checked={done[i]}
            onCheckedChange={(checked) => setDone((prev) => prev.map((v, j) => (j === i ? checked === true : v)))}
          />
        ))}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <>
      <DocSection
        id="principles"
        title="Principles"
        description="Components handle the mechanics (roles, keys, focus); you handle the content (labels, headings, alt text, page order). An interface is accessible only when both are in place."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PRINCIPLES.map((p) => (
            <div key={p.title} className="flex flex-col gap-2 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
              <span className="flex size-10 items-center justify-center rounded-large bg-brand-background-2 text-brand-foreground-2">{p.icon}</span>
              <h3 className="text-subtitle2 font-semibold text-foreground-1">{p.title}</h3>
              <p className="text-body1 text-foreground-2">{p.body}</p>
            </div>
          ))}
        </div>
      </DocSection>

      <DocSection
        id="keyboard"
        title="Keyboard"
        description="Tab stops once in each group (roving tabindex); arrow keys move inside the group. In RTL, ← / → follow the reading direction."
      >
        <SimpleTable
          head={["Component", "Keys", "Behavior"]}
          rows={[
            ["All controls", <Keys key="k"><Kbd>Tab</Kbd><KbdGroup><Kbd>Shift</Kbd>+<Kbd>Tab</Kbd></KbdGroup></Keys>, "Move to the next / previous control in DOM order."],
            ["Button, ToggleButton, Link", <Keys key="k"><Kbd>Enter</Kbd><Kbd>Space</Kbd></Keys>, "Activate (Link: Enter only). ToggleButton toggles aria-pressed."],
            ["Checkbox, Switch", <Keys key="k"><Kbd>Space</Kbd></Keys>, "Toggle the state."],
            ["RadioGroup, ToggleGroup, Toolbar", <Keys key="k"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Move within the group (RadioGroup also selects the new item)."],
            ["Tabs", <Keys key="k"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Switch tabs and show the matching panel; ↑ / ↓ for vertical tabs."],
            ["Menu, ContextMenu, Menubar", <Keys key="k"><Kbd>Enter</Kbd><Kbd>↓</Kbd><Kbd>↑</Kbd><Kbd>→</Kbd><Kbd>Esc</Kbd></Keys>, "Open, move between items, → opens a submenu, Esc closes and returns focus; type to jump to an item."],
            ["Dropdown", <Keys key="k"><Kbd>Enter</Kbd><Kbd>Space</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Esc</Kbd></Keys>, "Open the listbox, select an option, type to jump (typeahead)."],
            ["Combobox, TagPicker, Command", <Keys key="k"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Enter</Kbd><Kbd>Esc</Kbd><Kbd>Backspace</Kbd></Keys>, "Type to filter, ↑ / ↓ to highlight, Enter to select; Backspace in an empty input removes the last tag (TagPicker)."],
            ["Slider", <Keys key="k"><Kbd>←</Kbd><Kbd>→</Kbd><Kbd>PageUp</Kbd><Kbd>PageDown</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Decrease / increase by one step, by a large step, go to min / max."],
            ["Dialog, Drawer", <Keys key="k"><Kbd>Esc</Kbd><Kbd>Tab</Kbd></Keys>, "Focus stays inside the surface; Esc closes it (except modalType=\"alert\"); focus returns to the trigger after closing."],
            ["Popover, HoverCard, Tooltip", <Keys key="k"><Kbd>Esc</Kbd></Keys>, "Close. Tooltip opens when its trigger gets keyboard focus."],
            ["Accordion", <Keys key="k"><Kbd>Enter</Kbd><Kbd>Space</Kbd><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "Open / close a panel, move between headers."],
            ["Tree", <Keys key="k"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>→</Kbd><Kbd>←</Kbd><Kbd>Home</Kbd><Kbd>End</Kbd></Keys>, "→ expands a branch / moves to the first child, ← collapses a branch / moves to the parent."],
            ["List (navigationMode)", <Keys key="k"><Kbd>↑</Kbd><Kbd>↓</Kbd><Kbd>→</Kbd><Kbd>←</Kbd></Keys>, "Move between items; in composite mode, → / ← move into / out of the interactive content of an item."],
            ["Toast", <Keys key="k"><Kbd>F8</Kbd></Keys>, "Jump to the notification region; Tab to the action / close buttons."],
          ]}
        />
      </DocSection>

      <DocSection
        id="semantics"
        title="Semantics for screen readers"
        description="Most of it comes from Radix; Yugen adds default labels in Vietnamese for close buttons, pagination and breadcrumbs."
      >
        <SimpleTable
          head={["Component", "Role / attributes"]}
          rows={[
            ["Dialog / DialogSurface", <><C>role=&quot;dialog&quot;</C> or <C>alertdialog</C>, <C>aria-modal</C>, name from DialogTitle, description from DialogDescription.</>],
            ["Menu", <><C>menu</C>, <C>menuitem</C>, <C>menuitemcheckbox</C>, <C>menuitemradio</C>, <C>aria-expanded</C> on the trigger.</>],
            ["Tabs", <><C>tablist</C>, <C>tab</C> (<C>aria-selected</C>, <C>aria-controls</C>), <C>tabpanel</C>.</>],
            ["Checkbox, Switch, Radio", <><C>checkbox</C> (<C>aria-checked=&quot;mixed&quot;</C> when indeterminate), <C>switch</C>, <C>radiogroup</C> / <C>radio</C>.</>],
            ["Slider", <><C>slider</C> with <C>aria-valuenow / min / max</C>; name from <C>label</C> or <C>aria-label</C>.</>],
            ["Dropdown, Combobox", <><C>combobox</C> + <C>listbox</C> / <C>option</C>, <C>aria-expanded</C>, <C>aria-activedescendant</C> (cmdk).</>],
            ["Breadcrumb, Pagination", <><C>nav</C> with <C>aria-label</C>, current page <C>aria-current=&quot;page&quot;</C>.</>],
            ["Table", <><C>th scope=&quot;col&quot;</C>, sortable columns have <C>aria-sort</C>; TableSelectionCell is labelled “Chọn hàng” (Select row).</>],
            ["MessageBar", <><C>role=&quot;alert&quot;</C> for error / warning, <C>role=&quot;status&quot;</C> for info / success.</>],
            ["Toast", "Radix notification region: error / warning toasts are read immediately (assertive), the rest politely (polite)."],
            ["Spinner, ProgressBar", <><C>role=&quot;progressbar&quot;</C>; Spinner defaults to <C>aria-label=&quot;Đang tải&quot;</C> (Loading).</>],
            ["Avatar, Persona", <><C>role=&quot;img&quot;</C> with the person&apos;s name; the status dot has a label.</>],
            ["Field, Input", <><C>label for</C>, <C>aria-describedby</C> pointing to the hint / validation message, <C>aria-invalid</C> on error.</>],
          ]}
        />
      </DocSection>

      <DocSection id="checklist" title="Checklist before you ship" description="Tick items as you check them. The list is only kept while you are on this page.">
        <Checklist />
      </DocSection>

      <DocSection id="tools" title="Tools & related pages">
        <div className="flex flex-col gap-4">
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Automated checks: axe DevTools, Accessibility Insights for Web, Lighthouse (they find about 30–40% of issues; the rest needs manual testing).</li>
            <li>Screen readers: NVDA (Windows, free), Narrator, VoiceOver (macOS / iOS), TalkBack (Android).</li>
            <li>
              Chrome DevTools › Rendering: emulate <C>prefers-reduced-motion</C>, <C>prefers-color-scheme</C>, <C>forced-colors</C> and color
              vision deficiencies.
            </li>
          </ul>
          <P>Further reading:</P>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { href: docsPath("/concepts/component-labelling"), title: "Labelling components", body: "Field, Label, aria-label, labels for groups." },
              { href: docsPath("/concepts/focus-indicator"), title: "Focus indicator", body: ":focus-visible, the brand bar on inputs, focus management." },
              { href: docsPath("/concepts/notifications"), title: "Notifications & live regions", body: "MessageBar, Toast, role=status / alert." },
              { href: docsPath("/concepts/truncation"), title: "Text truncation", body: "When to truncate and how to show the full text." },
            ].map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex flex-col gap-0.5 rounded-xlarge border border-stroke-2 bg-background-1 p-4 transition-colors duration-faster hover:bg-subtle-hover"
              >
                <span className="text-subtitle2 font-semibold text-foreground-1">{l.title}</span>
                <span className="text-body1 text-foreground-2">{l.body}</span>
              </a>
            ))}
          </div>
        </div>
      </DocSection>
    </>
  );
}
