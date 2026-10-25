import * as React from "react";
import type { ReactNode } from "react";
import { ArrowClockwise16Regular, Play16Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui";
import { CodeBlock as ProductCodeBlock } from "@/components/ui/CodeBlock/CodeBlock";
import { Trace, TraceLog, TraceStatusIcon, TraceStep, type TraceStatus } from "@/components/ui/Trace/Trace";
import { DocSection, DoDont, PropsTable } from "../../blocks";
import { CodeBlock } from "../../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Stage({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-center gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-5">{children}</div>;
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

/* ---------- Demo: agent with an error & retry ---------- */

interface RunStep {
  title: string;
  ms: number;
  /** The first run fails at this step. */
  failsFirst?: boolean;
}

const RUN: RunStep[] = [
  { title: "Analyze the question", ms: 600 },
  { title: "search_docs(\"returns\")", ms: 1200 },
  { title: "get_order(\"#A1023\")", ms: 1400, failsFirst: true },
  { title: "Write the answer", ms: 1300 },
];

function AgentRunDemo() {
  const [statuses, setStatuses] = React.useState<TraceStatus[]>(RUN.map(() => "pending"));
  const [durations, setDurations] = React.useState<(number | undefined)[]>([]);
  const [attempt, setAttempt] = React.useState(0);
  const [startedAt, setStartedAt] = React.useState<number>();
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearTimeout(timer.current), []);

  const runFrom = React.useCallback((index: number, run: number) => {
    if (index >= RUN.length) return;
    const begin = Date.now();
    setStatuses((list) => list.map((s, i) => (i === index ? "running" : i > index ? "pending" : s)));
    timer.current = window.setTimeout(() => {
      const failed = RUN[index].failsFirst && run === 1;
      setDurations((list) => Object.assign([...list], { [index]: Date.now() - begin }));
      if (failed) {
        // Failed step: the steps after it are cancelled.
        setStatuses((list) => list.map((s, i) => (i === index ? "error" : i > index ? "cancelled" : s)));
        return;
      }
      setStatuses((list) => list.map((s, i) => (i === index ? "success" : s)));
      runFrom(index + 1, run);
    }, RUN[index].ms);
  }, []);

  const failedAt = statuses.indexOf("error");
  const running = statuses.includes("running");
  const finished = statuses.every((s) => s === "success");

  function start() {
    window.clearTimeout(timer.current);
    setDurations([]);
    setStartedAt(Date.now());
    setAttempt(1);
    runFrom(0, 1);
  }

  function retry() {
    setAttempt((a) => a + 1);
    runFrom(failedAt, attempt + 1);
  }

  return (
    <Trace
      className="w-full max-w-xl"
      title="Assistant: check order #A1023"
      startedAt={startedAt}
      duration={finished ? durations.reduce<number>((a, b) => a + (b ?? 0), 0) : undefined}
      actions={
        failedAt !== -1 ? (
          <Button size="small" appearance="primary" icon={<ArrowClockwise16Regular />} onClick={retry}>
            Retry failed step
          </Button>
        ) : (
          <Button size="small" icon={<Play16Regular />} disabled={running} onClick={start}>
            {attempt === 0 ? "Run" : "Run again"}
          </Button>
        )
      }
    >
      {RUN.map((step, i) => (
        <TraceStep
          key={step.title}
          title={step.title}
          status={statuses[i]}
          duration={durations[i]}
          description={statuses[i] === "error" ? "The order system did not respond within 5 seconds." : undefined}
          details={
            statuses[i] === "error" ? (
              <TraceLog intent="error">{"TimeoutError: get_order exceeded 5000ms\n  at tools/orders.ts:42"}</TraceLog>
            ) : undefined
          }
        />
      ))}
    </Trace>
  );
}

const MAPPING_CODE = `// Agent events (SSE / WebSocket) → TraceStep props
type AgentEvent =
  | { type: "step_started"; id: string; title: string; at: number }
  | { type: "step_finished"; id: string; at: number; tokens?: number }
  | { type: "step_failed"; id: string; at: number; error: string };

function reduce(steps: Step[], e: AgentEvent): Step[] {
  switch (e.type) {
    case "step_started":
      return [...steps, { id: e.id, title: e.title, status: "running", startedAt: e.at }];
    case "step_finished":
      return steps.map((s) => s.id === e.id ? { ...s, status: "success", duration: e.at - s.startedAt } : s);
    case "step_failed":
      return steps.map((s) => s.id === e.id ? { ...s, status: "error", error: e.error } : s);
  }
}

<Trace title="Agent" startedAt={runStartedAt}>
  {steps.map((s) => (
    <TraceStep
      key={s.id}
      title={s.title}
      status={s.status}
      startedAt={s.startedAt}
      duration={s.duration}
      details={s.error && <TraceLog intent="error">{s.error}</TraceLog>}
    />
  ))}
</Trace>`;

const STATES: { status: TraceStatus; meaning: string; when: string; token: string }[] = [
  { status: "pending", meaning: "Đang chờ (Pending)", when: "Planned, not started yet.", token: "text-foreground-3" },
  { status: "running", meaning: "Đang chạy (Running)", when: "In progress; the timer runs live.", token: "text-brand-foreground-1" },
  { status: "success", meaning: "Hoàn tất (Done)", when: "Finished, with a duration.", token: "text-success-foreground-1" },
  { status: "error", meaning: "Lỗi (Error)", when: "Failed. Details open by themselves and state the cause.", token: "text-danger-foreground-1" },
  { status: "skipped", meaning: "Bỏ qua (Skipped)", when: "No need to run (condition not met, cache hit).", token: "text-foreground-3" },
  { status: "cancelled", meaning: "Đã huỷ (Cancelled)", when: "Stopped by the user or because an earlier step failed.", token: "text-warning-foreground-1" },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="why"
        title="Why transparency matters"
        description="A “Processing…” spinner that lasts 20 seconds makes users doubtful: they click again or leave. A list of steps that keeps moving does not."
      >
        <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
          <li>
            <strong className="font-semibold text-foreground-1">Trust</strong>: users see which documents the AI read and which tools it
            called before they rely on the answer.
          </li>
          <li>
            <strong className="font-semibold text-foreground-1">Control</strong>: knowing the current step lets them decide whether to wait,
            stop or retry.
          </li>
          <li>
            <strong className="font-semibold text-foreground-1">Debugging</strong>: when something goes wrong, the failed step and its log are
            right there, with no other tab to open.
          </li>
        </ul>
      </DocSection>

      <DocSection
        id="states"
        title="Six states"
        description="Each state has its own icon, its own color token and a text label that screen readers read. Color is never the only signal."
      >
        <SimpleTable
          head={["State", "Label", "When", "Color"]}
          rows={STATES.map((s) => [
            <span key="s" className="inline-flex items-center gap-2">
              <TraceStatusIcon status={s.status} />
              <C>{s.status}</C>
            </span>,
            s.meaning,
            s.when,
            <C key="t">{s.token}</C>,
          ])}
        />
      </DocSection>

      <DocSection
        id="granularity"
        title="Choose the level of detail"
        description="One step is one task the user understands. Technical details go in the expandable part, not in the title line."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <Trace size="small" title="Create the October report" duration={9620} className="w-full max-w-xl">
              <TraceStep status="success" title="Fetch sales data" duration={2140} metadata={["sales_db", "12,480 rows"]}>
                <TraceStep status="success" title="Query orders" duration={1210} />
                <TraceStep status="skipped" title="Query refunds" description="No refunds in this period." />
              </TraceStep>
              <TraceStep
                status="success"
                title="Calculate metrics"
                duration={3380}
                details={
                  <ProductCodeBlock language="json" size="small" code={'{\n  "revenue": 1284000000,\n  "orders": 3120,\n  "aov": 411538\n}'} />
                }
              />
              <TraceStep status="success" title="Write commentary" duration={4100} metadata={["sakura-1", "2.1k tokens"]} />
            </Trace>
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>A step title is a verb plus an object (“Fetch sales data”); function and tool names go in metadata or details.</li>
            <li>Nest at most 2 levels. If the agent makes 30 small calls, group them under one parent step “Read 30 files” with collapsed children.</li>
            <li>metadata is for information you scan: tool, model, token count, row count, git branch.</li>
            <li>details (logs, JSON, CodeBlock) are collapsed by default; failed and running steps open by themselves.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="live"
        title="Live updates"
        description="Trace only displays data. You keep the list of steps in state and update it from the agent's events."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={MAPPING_CODE} />
          <PropsTable
            props={[
              { name: "status", type: "TraceStatus", defaultValue: `"pending"`, description: "Changing status is enough: the icon, color, timer and announcement follow." },
              { name: "startedAt", type: "number", description: "Start time from the server so the timer is accurate; if omitted, it counts from the switch to running." },
              { name: "duration", type: "number (ms)", description: "The actual duration once finished." },
              { name: "Trace.startedAt / duration", type: "number", description: "Overall timer while running; total duration when finished." },
              { name: "Trace.announceChanges", type: "boolean", defaultValue: "true", description: "Changes in the same tick are merged into one polite announcement." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="errors"
        title="When something fails"
        description="Press Run: the get_order step times out on the first run. The steps after it become Cancelled, and the header offers the next action."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <AgentRunDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Describe the error in the user&apos;s language (“did not respond within 5 seconds”); the technical log goes in details.</li>
            <li>Mark dependent steps as cancelled. Don&apos;t leave them pending as if they will still run.</li>
            <li>When possible, retry from the failed step instead of running everything again.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="a11y" title="Accessibility">
        <SimpleTable
          head={["Aspect", "How Trace handles it"]}
          rows={[
            ["Semantics", "A named <section> (from the title); steps are role=list / listitem, child steps are a nested list."],
            ["State", "Each step has hidden text such as “, Hoàn tất” (Done) or “, Lỗi” (Error) in its name, so it does not rely on the icon or color."],
            ["Expanding", "The title of a step with details / child steps is a disclosure button with aria-expanded + aria-controls; Enter / Space opens it."],
            ["Announcements", "One polite role=status region reads “Step name: state”; changes in the same tick are merged into one."],
            ["Motion", "The spinner stays still and new steps don't fade in when the user turns on reduced motion."],
            ["Log", "TraceLog is always dir=\"ltr\" and focusable with Tab so it can be scrolled with the keyboard."],
          ]}
        />
        <P>
          Make the TraceStep <C>title</C> a string (or pass <C>announceLabel</C>) so the state announcement has content.
        </P>
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Show a step as soon as the agent starts it, not after it finishes.",
            "Record a duration for each step so users can see where the time goes.",
            "Open the failed step by default, with the cause and a retry action.",
            "Use a small, collapsed Trace in the AI assistant's messages.",
          ]}
          donts={[
            "Faking progress with made-up steps. Only show what actually happens.",
            "Leaving dependent steps pending after the pipeline has stopped.",
            "Putting sensitive data (tokens, passwords) in visible metadata or logs.",
          ]}
        />
      </DocSection>
    </>
  );
}
