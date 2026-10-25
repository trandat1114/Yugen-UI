import * as React from "react";
import type { ReactNode } from "react";
import { Kbd } from "@/components/ui";
import {
  ChatComposer,
  MessageBubble,
  MessageDaySeparator,
  MessageScroller,
  TypingIndicator,
  type MessageStatus,
} from "@/components/ui/MessageScroller/MessageScroller";
import { Trace, TraceStep } from "@/components/ui/Trace/Trace";
import { CitationList, PromptInput, Reasoning, StreamingMarkdown, type CitationSource } from "@/components/ui/AIKit/AIKit";
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

function Stage({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-center gap-4 rounded-2xlarge border border-stroke-2 bg-background-1 p-5">{children}</div>;
}

/* ---------- Demo: anatomy ---------- */

function AnatomyDemo() {
  return (
    <div className="flex h-96 w-full max-w-md flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2">
      <MessageScroller className="flex-1" label="Sample conversation">
        <MessageDaySeparator>Today</MessageDaySeparator>
        <MessageBubble author="Sakura Bot" time="09:41">
          Hi! How can I help?
        </MessageBubble>
        <MessageBubble side="outgoing" author="You" time="09:42" status="read">
          How do I switch the brand to blue?
        </MessageBubble>
        <TypingIndicator author="Sakura Bot" />
      </MessageScroller>
      <ChatComposer className="m-2" onSend={() => {}} />
    </div>
  );
}

/* ---------- Demo: streaming ---------- */

const STREAM_TEXT =
  "Set data-brand=\"web\" on <html> or on YugenProvider. Every brand utility (bg-brand-background, text-link…) changes right away, with no rebuild.";

function StreamDemo() {
  const [phase, setPhase] = React.useState<"idle" | "typing" | "streaming" | "done">("idle");
  const [text, setText] = React.useState("");
  const timers = React.useRef<number[]>([]);

  React.useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  function start() {
    timers.current.forEach((t) => window.clearTimeout(t));
    timers.current = [];
    setText("");
    setPhase("typing");
    const words = STREAM_TEXT.split(" ");
    timers.current.push(
      window.setTimeout(() => {
        setPhase("streaming");
        words.forEach((_, i) =>
          timers.current.push(
            window.setTimeout(() => {
              setText(words.slice(0, i + 1).join(" "));
              if (i === words.length - 1) setPhase("done");
            }, (i + 1) * 80),
          ),
        );
      }, 1000),
    );
  }

  return (
    <div className="flex w-full max-w-md flex-col gap-2">
      <MessageScroller className="h-64 rounded-xlarge border border-stroke-2" label="Streaming example">
        <MessageBubble side="outgoing" author="You" time="10:15">
          How do I change the brand?
        </MessageBubble>
        {phase === "typing" && <TypingIndicator key="typing" author="Sakura Bot" />}
        {(phase === "streaming" || phase === "done") && (
          <MessageBubble key="answer" author="Sakura Bot" time="10:15" streaming={phase === "streaming"}>
            {text}
          </MessageBubble>
        )}
      </MessageScroller>
      <button
        type="button"
        onClick={start}
        className="self-start rounded-medium px-2 py-1 text-body1 font-semibold text-link hover:bg-subtle-hover hover:text-link-hover"
      >
        {phase === "idle" ? "Send question" : "Run again"}
      </button>
    </div>
  );
}

/* ---------- Demo: errors ---------- */

function RetryDemo() {
  const [status, setStatus] = React.useState<MessageStatus>("error");
  return (
    <MessageScroller className="h-56 w-full max-w-md rounded-xlarge border border-stroke-2" label="Failed send example">
      <MessageBubble side="outgoing" author="You" time="11:20" status="read">
        Please send me the new price list.
      </MessageBubble>
      <MessageBubble
        side="outgoing"
        author="You"
        time="11:21"
        status={status}
        errorMessage="Not sent: connection lost."
        onRetry={() => {
          setStatus("sending");
          window.setTimeout(() => setStatus("sent"), 900);
        }}
      >
        I need it before Friday.
      </MessageBubble>
    </MessageScroller>
  );
}

/* ---------- Demo: Trace in an answer ---------- */

function TransparencyDemo() {
  return (
    <MessageScroller className="h-104 w-full max-w-xl rounded-xlarge border border-stroke-2" label="Transparent assistant example">
      <MessageBubble side="outgoing" author="You" time="14:02">
        Summarize the 3 latest customer emails for me.
      </MessageBubble>
      <MessageBubble author="Sakura Bot" time="14:02" appearance="plain">
        <Trace size="small" title="Completed 3 steps" duration={4210}>
          <TraceStep status="success" title="Find emails from customers" duration={820} metadata={["mail.search"]} />
          <TraceStep status="success" title="Read 3 emails" duration={1140} metadata={["mail.read", "parallel"]} />
          <TraceStep status="success" title="Write the summary" duration={2250} metadata={["1.4k tokens"]} />
        </Trace>
      </MessageBubble>
      <MessageBubble author="Sakura Bot" time="14:02">
        {"1. Hoa Dao Co. needs a quote for the Team plan before Oct 25.\n2. Minh reports a sign-in bug in Safari.\n3. Lan wants to move the demo to Thursday."}
      </MessageBubble>
    </MessageScroller>
  );
}

/* ---------- Demo: AI Kit ---------- */

const AI_SOURCES: CitationSource[] = [
  { title: "Fluent 2 — Color", url: "https://fluent2.microsoft.design/color", snippet: "Brand color is used sparingly for emphasis." },
  { title: "WCAG 2.2 — Contrast (Minimum)", url: "https://www.w3.org/TR/WCAG22/#contrast-minimum", snippet: "At least 4.5:1 for text." },
];

function AiAnswerDemo() {
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Reasoning duration={8200}>{"Check the brand rules and the WCAG contrast thresholds."}</Reasoning>
      <StreamingMarkdown citations={AI_SOURCES}>
        {"Use **brand** for primary actions and selected states[1]; text needs a contrast of **≥ 4.5:1**[2].\n\n- Don't cover large backgrounds with brand\n- Always pair status with an icon and text"}
      </StreamingMarkdown>
      <CitationList sources={AI_SOURCES} />
      <PromptInput placeholder="Ask a follow-up…" onSubmit={() => {}} />
    </div>
  );
}

const SCROLL_CODE = `<MessageScroller
  className="h-[60vh]"
  onLoadOlder={loadOlder}      // reaching the top loads more and keeps the reading position
  hasOlder={cursor !== null}
  loadingOlder={isLoading}
>
  {messages.map((m) => (
    <MessageBubble key={m.id} side={m.mine ? "outgoing" : "incoming"} author={m.author} time={m.time}>
      {m.text}
    </MessageBubble>
  ))}
</MessageScroller>`;

const STREAM_CODE = `// 1. Sent, no tokens yet → TypingIndicator
{waiting && <TypingIndicator key="typing" author="Sakura Bot" />}

// 2. First token arrives → replace it with a streaming bubble (same position, no layout jump)
<MessageBubble key={answer.id} author="Sakura Bot" streaming={!answer.done}>
  {answer.text}
</MessageBubble>

// 3. Done → streaming={false}: the caret disappears and the live region reads the whole answer once
// While waiting: <ChatComposer busy onStop={abortController.abort} … />`;

const A11Y_CODE = `<div role="log" aria-label="Conversation" aria-live="off" tabIndex={0}>
  …messages…
</div>
{/* Separate announcement region: only receives complete incoming messages */}
<div aria-live="polite" aria-atomic="true" className="sr-only">Sakura Bot: Set data-brand…</div>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="anatomy"
        title="Anatomy of a chat screen"
        description="A chat screen in Yugen UI is built from five parts, each with one responsibility."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <AnatomyDemo />
          </Stage>
          <SimpleTable
            head={["Part", "Responsibility"]}
            rows={[
              ["MessageScroller", "The scroll area: sticks to the bottom, new-message button, loading older messages, live region, End key."],
              ["MessageBubble", "One message: side (incoming / outgoing), sender, time, send status, reactions, streaming. Groups consecutive messages by sender."],
              ["MessageDaySeparator", "A date marker between messages. It stays readable text, not role=separator."],
              ["TypingIndicator", "Three “typing” dots before any content arrives; role=status."],
              ["ChatComposer", "An auto-growing input: Enter sends, Shift+Enter adds a line, busy + a Stop button for AI."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="scrolling"
        title="Scrolling rules"
        description="Keep users where they are reading. Only scroll automatically when you are sure they want to see the latest message."
      >
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Situation", "Behavior"]}
            rows={[
              ["At the bottom, a new message or streamed text arrives", "Stick to the bottom so new content stays in view (a ResizeObserver also tracks images that finish loading and the composer growing)."],
              ["Scrolled up, a new message arrives", "No jump. A floating “N tin nhắn mới ↓” (N new messages) button appears; it scrolls down, and the count resets when the bottom is reached."],
              ["The user sends a message", "Always scroll to the bottom. They need to see that their message went out."],
              ["Reaching the top of the list", "onLoadOlder is called; older messages are inserted above without moving the reading point (scrollTop is compensated, overflow-anchor is off)."],
              ["Keyboard", <span key="k">Focus the message area and press <Kbd size="small">End</Kbd> to jump to the latest message; arrows / PageUp / PageDown scroll as usual.</span>],
            ]}
          />
          <CodeBlock code={SCROLL_CODE} />
          <P>
            Every child needs a stable <C>key</C> (the message id). MessageScroller compares the first and last keys between renders to tell
            older messages inserted at the top from new messages added at the end.
          </P>
          <PropsTable
            props={[
              { name: "onLoadOlder", type: "() => void | Promise<void>", description: "Return a Promise so it is not called again while loading." },
              { name: "hasOlder / loadingOlder", type: "boolean", description: "Turn off when the history runs out; spinner at the top of the list." },
              { name: "bottomThreshold", type: "number", defaultValue: "48", description: "How many px from the bottom still count as “at the end”." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="streaming"
        title="Streaming & typing indicator"
        description="AI responses arrive in chunks. The UI has to show progress without layout jumps and without making screen readers stutter."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <StreamDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Show TypingIndicator right after sending, before the first token, so the user knows the request was received.</li>
            <li>When the first token arrives, replace TypingIndicator with a <C>streaming</C> MessageBubble in the same position.</li>
            <li>A blinking caret means more is coming; with reduced motion it stays still.</li>
            <li>Allow stopping: <C>ChatComposer busy onStop</C>. Keep the partial answer, with a “Stopped” note.</li>
          </ul>
          <CodeBlock code={STREAM_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="errors"
        title="Errors & retry"
        description="A send error belongs to the message that failed, not to a toast that slides away."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <RetryDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>Keep the content of the failed message; the red border and message come with an icon, not just a color change.</li>
            <li>A “Thử lại” (Retry) button sits right under the message; the error message uses role=alert so it is read at once.</li>
            <li>AI errors (quota exceeded, content blocked) are a normal incoming message that explains why and what the user can do.</li>
            <li>A global connection loss gets one MessageBar above the list, not an error repeated on every message.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="a11y"
        title="Live regions & screen readers"
        description="By default role=log announces every change. With streamed text, that means reading a few words at a time. Yugen separates what is displayed from what is announced."
      >
        <div className="flex flex-col gap-4">
          <CodeBlock code={A11Y_CODE} />
          <SimpleTable
            head={["Event", "Announced", "How"]}
            rows={[
              ["Complete incoming message", "“Sender name: content”", "MessageScroller's own polite region."],
              ["Message still streaming", "Not yet", "Read once when streaming becomes false."],
              ["Your own message", "Not read", "The user just typed it."],
              ["Older messages loaded", "Not read", "They are not new."],
              ["Typing", "“Sakura Bot đang soạn tin…” (Sakura Bot is typing…)", "TypingIndicator role=status."],
              ["Send failed", "The error message", "role=alert under the message."],
            ]}
          />
          <P>
            The message area has <C>tabIndex=0</C> so keyboard users can scroll it, and a name (<C>label</C>). The send status is an icon
            with hidden text such as “Đã xem” (Seen), not just a color.
          </P>
        </div>
      </DocSection>

      <DocSection id="composer" title="Keyboard in the composer" description="It follows the conventions of common chat apps.">
        <SimpleTable
          head={["Key", "Action"]}
          rows={[
            [<Kbd key="k">Enter</Kbd>, "Send (when there is content and it is not busy)."],
            [
              <span key="k" className="inline-flex items-center gap-0.5">
                <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd>
              </span>,
              "New line.",
            ],
            ["Typing with Telex / VNI / an IME", "Enter only confirms the text being composed and does not send (checks isComposing)."],
            ["Auto-growing input", "Up to maxRows lines (default 6), then it scrolls inside."],
            ["After sending", "The input is cleared and keeps focus for the next message."],
          ]}
        />
      </DocSection>

      <DocSection
        id="transparency"
        title="Transparency with Trace"
        description="An AI assistant does many steps out of sight: searching, calling tools, reading documents. Put a collapsed Trace in the answer so users can check them."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <TransparencyDemo />
          </Stage>
          <P>
            A Trace inside a message should use <C>size=&quot;small&quot;</C>, sit in a bubble with <C>appearance=&quot;plain&quot;</C>, and
            come before the answer. See also <a href={docsPath("/concepts/agent-trace")} className="text-link underline hover:text-link-hover">Process transparency with Trace</a>.
          </P>
        </div>
      </DocSection>

      <DocSection
        id="ai-kit"
        title="AI answers: Markdown, sources, reasoning"
        description="The AI Kit pairs with MessageScroller to build a complete answer: collapsed reasoning, streaming Markdown, source chips and a composer with attachments."
      >
        <div className="flex flex-col gap-4">
          <Stage>
            <AiAnswerDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
            <li>
              <C>Reasoning</C> comes before the answer: it is open while the model is thinking and collapses on its own with “Đã suy luận trong
              12s” (Reasoned for 12s).
            </li>
            <li>
              <C>StreamingMarkdown</C> takes a growing string: no stray <C>**</C> or unfinished fences, finished blocks are not re-rendered, and
              links are limited to http / https / mailto. Inside <C>MessageBubble streaming</C>, set <C>caret=&#123;false&#125;</C>.
            </li>
            <li>
              <C>[1]</C> in the Markdown plus <C>citations</C> becomes a <C>Citation</C> chip; <C>CitationList</C> lists the sources below.
            </li>
            <li>
              <C>PromptInput</C> replaces <C>ChatComposer</C> when you need attachments (button, drag and drop, pasted images), a model picker
              and a Stop button.
            </li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="rules" title="Do and don't">
        <DoDont
          dos={[
            "Stick to the bottom only when the user is at the bottom; otherwise use the “new messages” button.",
            "Show the typing indicator as soon as a message is sent, and a Stop button for long answers.",
            "Attach the error and the retry button to the message that failed.",
            "Show the steps the agent took with a Trace, collapsed by default.",
          ]}
          donts={[
            "Jumping the list to the bottom while the user is reading older messages.",
            "Letting screen readers read streamed text chunk by chunk.",
            "Deleting the failed message or the composer content when sending fails.",
            "Hiding that the AI called tools or read the user's data.",
          ]}
        />
      </DocSection>
    </>
  );
}
