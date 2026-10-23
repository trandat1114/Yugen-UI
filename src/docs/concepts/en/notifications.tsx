import * as React from "react";
import type { ReactNode } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogClose,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  DialogTrigger,
  Field,
  Input,
  MessageBar,
  normalizeSearchText,
  SearchBox,
  toast,
} from "@/components/ui";
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

function Tile({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-4">
      <span className="text-caption1 font-semibold text-foreground-3">{title}</span>
      {children}
    </div>
  );
}

function DeleteProjectDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button appearance="danger">Delete project</Button>
      </DialogTrigger>
      <DialogSurface modalType="alert">
        <DialogTitle action={null}>Delete project “Sakura”?</DialogTitle>
        <DialogDescription>12 files and the change history will be deleted permanently. This cannot be undone.</DialogDescription>
        <DialogActions>
          <DialogClose asChild>
            <Button>Cancel</Button>
          </DialogClose>
          <DialogClose asChild>
            <Button appearance="danger">Delete permanently</Button>
          </DialogClose>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}

const CITIES = ["Tokyo", "Kyoto", "Osaka", "Seoul", "Singapore", "Hanoi", "Da Nang", "São Paulo", "Zürich", "Montréal"];

function FilterDemo() {
  const [query, setQuery] = React.useState("");
  const [announced, setAnnounced] = React.useState("");
  const results = CITIES.filter((c) => normalizeSearchText(c).includes(normalizeSearchText(query)));

  // Announce only after the user stops typing, so the result is not read after every key.
  React.useEffect(() => {
    const id = window.setTimeout(() => setAnnounced(query ? `${results.length} results for “${query}”` : ""), 600);
    return () => window.clearTimeout(id);
  }, [query, results.length]);

  return (
    <div className="flex w-full max-w-sm flex-col gap-2">
      <SearchBox aria-label="Filter cities" placeholder="Filter cities" value={query} onValueChange={setQuery} />
      <p className="text-caption1 text-foreground-3">{results.length} results</p>
      <p role="status" className="sr-only">
        {announced}
      </p>
      <ul className="flex flex-wrap gap-1">
        {results.map((c) => (
          <li key={c} className="rounded-circular bg-background-3 px-2 py-0.5 text-caption1 text-foreground-2">
            {c}
          </li>
        ))}
      </ul>
    </div>
  );
}

const CHOOSE_CODE = `{/* An error tied to one field */}
<Field label="Discount code" validationState="error" validationMessage="The code expired on September 30.">
  <Input defaultValue="SAKURA30" />
</Field>

{/* State of the whole page / region that stays until it is resolved */}
<MessageBar
  intent="warning"
  title="Storage is almost full."
  actions={<Button size="small">Upgrade</Button>}
>
  You have used 92% of your storage.
</MessageBar>

{/* Short feedback for the action just taken */}
toast({ intent: "success", title: "Changes saved" });

{/* A decision is needed now; every other action is blocked */}
<DialogSurface modalType="alert">
  <DialogTitle action={null}>Delete project “Sakura”?</DialogTitle>
  …
</DialogSurface>`;

const POLITENESS_CODE = `{/* Polite: read when the screen reader is idle; results, status, confirmations */}
<div role="status">Draft saved at 2:05 PM</div>

{/* Assertive: interrupts right away; only for errors and warnings that need action */}
<div role="alert">Connection lost. Changes are not saved.</div>

{/* The live region must be in the DOM BEFORE its content changes */}
<p role="status" className="sr-only">{message}</p>`;

const TIMING_CODE = `import { toast } from "@/components/ui";

// Success with no action: closing after 3 seconds is fine.
toast({ intent: "success", title: "Link copied" });

// Error or an action: keep it until the user closes it.
toast({
  intent: "error",
  title: "Couldn't sync",
  body: "Check your network connection and try again.",
  timeout: -1,
  action: {
    label: "Retry",
    // Screen reader users may not reach the toast in time; describe another way to do it.
    altText: "Sync again with the Sync button in the toolbar",
    onClick: retrySync,
  },
});`;

const ANNOUNCE_CODE = `import { AriaLiveAnnouncer, useAnnounce, YugenProvider } from "@/components/ui";

// 1. Add once at the root: renders two hidden live regions (polite / assertive)
<YugenProvider applyToDocument withToaster>
  <AriaLiveAnnouncer>
    <App />
  </AriaLiveAnnouncer>
</YugenProvider>

// 2. Call it anywhere
function UploadButton({ files }: { files: File[] }) {
  const { announce } = useAnnounce();

  async function upload() {
    announce("Uploading…");
    try {
      await uploadFiles(files);
      announce(\`Uploaded \${files.length} files\`, { batchId: "upload" });
    } catch {
      announce("Upload failed. Try again later.", { politeness: "assertive", batchId: "upload" });
    }
  }

  return <Button onClick={upload}>Upload</Button>;
}`;

export default function Page() {
  return (
    <>
      <DocSection
        id="choose"
        title="Choose a notification channel"
        description="The level of interruption should match the importance. Start with the least disruptive channel that users will still notice."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Channel", "When", "Interruption", "Screen reader"]}
            rows={[
              ["Inline validation (Field)", "An error or hint tied to one input.", "Low", "Read when the field gets focus (aria-describedby)."],
              ["MessageBar", "State of a page / region: quota warnings, read-only mode, data load errors. Stays until resolved.", "Medium", "role=alert (error, warning) or role=status (info, success)."],
              ["Toast", "Short feedback for the action just taken: saved, sent, copied. Does not block anything.", "Low", "Radix notification region; press F8 to reach it."],
              ["Dialog modalType=\"alert\"", "A decision is needed now, usually destructive or irreversible.", "High (blocking)", "role=alertdialog, focus moves to the surface."],
              ["Live region (AriaLiveAnnouncer)", "Changes with no visible message: filtering done, more items loaded, result counts.", "None", "Read only, nothing is shown."],
            ]}
          />
          <div className="grid gap-4 md:grid-cols-2">
            <Tile title="Inline validation">
              <Field label="Discount code" validationState="error" validationMessage="The code expired on September 30.">
                <Input defaultValue="SAKURA30" />
              </Field>
            </Tile>
            <Tile title="MessageBar">
              <MessageBar intent="warning" title="Storage is almost full." actions={<Button size="small">Upgrade</Button>}>
                You have used 92% of your storage.
              </MessageBar>
            </Tile>
            <Tile title="Toast">
              <Button className="self-start" onClick={() => toast({ intent: "success", title: "Changes saved" })}>
                Save
              </Button>
            </Tile>
            <Tile title="Alert dialog">
              <div className="self-start">
                <DeleteProjectDialog />
              </div>
            </Tile>
          </div>
          <CodeBlock code={CHOOSE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="politeness"
        title="polite & assertive"
        description="A live region decides when the screen reader reads a change: polite waits until the user is idle, assertive interrupts right away."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Level", "Attributes", "Yugen components", "Used for"]}
            rows={[
              ["Polite", <C key="a">role=&quot;status&quot; · aria-live=&quot;polite&quot;</C>, "MessageBar info / success; Toast info / success; announce() by default", "Confirmations, results, progress."],
              ["Assertive", <C key="a">role=&quot;alert&quot; · aria-live=&quot;assertive&quot;</C>, "MessageBar error / warning; Toast error / warning; announce(…, { politeness: \"assertive\" })", "Errors that block work, data loss, session expiry."],
            ]}
          />
          <CodeBlock code={POLITENESS_CODE} />
          <P>
            Some screen reader and browser combinations ignore a live region that is inserted into the DOM{" "}
            <strong className="font-semibold">at the same time</strong> as its content. For a MessageBar that appears after an action, keep a
            container that is always present and only replace what is inside it, or also call <C>announce()</C>, so it is read.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="timing"
        title="Don't auto-dismiss what matters"
        description="A toast closes after 3 seconds by default. Slow readers, people using screen magnification and screen reader users can all miss it (WCAG 2.2.1)."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <Button onClick={() => toast({ intent: "success", title: "Link copied" })}>Auto-closing toast</Button>
            <Button
              onClick={() =>
                toast({
                  intent: "error",
                  title: "Couldn't sync",
                  body: "Check your network connection and try again.",
                  timeout: -1,
                  action: { label: "Retry", altText: "Sync again with the Sync button in the toolbar" },
                })
              }
            >
              Persistent toast
            </Button>
          </div>
          <CodeBlock code={TIMING_CODE} />
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Hovering or focusing a toast pauses the timer; F8 moves focus to the notification region.</li>
            <li>
              An action in a toast must also be available elsewhere (a button on the page, a menu); <C>altText</C> tells screen reader users
              where.
            </li>
            <li>Errors that block work belong in a MessageBar or inline validation, not in a toast.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="async"
        title="Async results"
        description="When content changes without a visible message (filtering a list, loading more, autosave), read the result through a live region."
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-6">
            <FilterDemo />
          </div>
          <P>
            The example above uses a <C>{'<p role="status" className="sr-only">'}</C> that updates 600ms after the user stops typing. For
            many messages from different places, use the <C>AriaLiveAnnouncer</C> utility with <C>useAnnounce()</C>: its queue spaces
            messages out so none is dropped, and <C>batchId</C> replaces an older message of the same kind with the latest one.
          </P>
          <CodeBlock code={ANNOUNCE_CODE} />
        </div>
      </DocSection>

      <DocSection id="rules" title="Do & don't">
        <DoDont
          dos={[
            "Add an icon and text to every state; don't rely on color alone.",
            "Write messages that say what happened and what to do next.",
            "One event, one message; combine rapid updates with batchId or a debounce.",
            "Keep error toasts and toasts with an action until the user closes them (timeout: -1).",
          ]}
          donts={[
            "Using role=\"alert\" for routine information. It interrupts the user.",
            "Announcing on every keystroke.",
            "Putting the only copy of information or an action in an auto-closing toast.",
            "Using a Dialog for a message that needs no decision.",
          ]}
        />
      </DocSection>
    </>
  );
}
