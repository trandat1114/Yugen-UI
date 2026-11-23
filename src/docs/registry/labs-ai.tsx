import { useCallback, useEffect, useRef, useState } from "react";
import { Board20Regular, Search20Regular, Settings20Regular, Sparkle16Regular } from "@fluentui/react-icons";
import {
  Button,
  Citation,
  CitationList,
  Dropdown,
  DropdownOption,
  NotificationCenter,
  PromptInput,
  Reasoning,
  StreamingMarkdown,
  Tour,
  Transcript,
  useNotifications,
  useTour,
  VoiceWave,
  type CitationSource,
  type NotificationItem,
  type TourStep,
  type TranscriptTurn,
  type VoiceWaveState,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import { declarationsOf } from "../setup";
import RAW from "./labs-ai.tsx?raw";

/* ================================================================ StreamingMarkdown */

const ANSWER = [
  "## Change the brand in Yugen UI",
  "",
  "Set **`data-brand`** on `<html>` or on *YugenProvider*:",
  "",
  "1. Pick a built-in brand: `sakura`, `web`, `teams`.",
  "2. Or create your own in **Theme Designer**:",
  "   - pick a primary color",
  "   - copy the CSS block into `tokens.css`",
  "",
  "```tsx",
  '<YugenProvider applyToDocument brand="web">',
  "  <App />",
  "</YugenProvider>",
  "```",
  "",
  "| Brand | Primary color | Contrast |",
  "| :-- | :-- | --: |",
  "| Sakura | #C2347A | 5.16:1 |",
  "| Web | #0F6CBD | 5.33:1 |",
  "",
  "> Tip: add `?brand=web` to a docs URL to share that exact look.",
].join("\n");

function useStreamedText(full: string, chunk = 6, every = 40) {
  const [length, setLength] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setLength(0);
    const id = window.setInterval(() => {
      setLength((n) => {
        if (n >= full.length) {
          window.clearInterval(id);
          return n;
        }
        return Math.min(full.length, n + chunk);
      });
    }, every);
    return () => window.clearInterval(id);
  }, [full, chunk, every, run]);

  return { text: full.slice(0, length), streaming: length < full.length, replay: () => setRun((r) => r + 1) };
}

function StreamingAnswerDemo() {
  const { text, streaming, replay } = useStreamedText(ANSWER);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <StreamingMarkdown streaming={streaming}>{text}</StreamingMarkdown>
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Replay
      </Button>
    </div>
  );
}

const STREAM_HOOK_CODE = `function useStreamedText(full: string, chunk = 6, every = 40) {
  const [length, setLength] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    setLength(0);
    const id = window.setInterval(() => {
      setLength((n) => {
        if (n >= full.length) {
          window.clearInterval(id);
          return n;
        }
        return Math.min(full.length, n + chunk);
      });
    }, every);
    return () => window.clearInterval(id);
  }, [full, chunk, every, run]);

  return { text: full.slice(0, length), streaming: length < full.length, replay: () => setRun((r) => r + 1) };
}`;

const STREAMING_ANSWER_CODE = `const ANSWER = [
  "## Change the brand in Yugen UI",
  "",
  "Set **\`data-brand\`** on \`<html>\` or on *YugenProvider*:",
  "",
  "1. Pick a built-in brand: \`sakura\`, \`web\`, \`teams\`.",
  "2. Or create your own in **Theme Designer**:",
  "   - pick a primary color",
  "   - copy the CSS block into \`tokens.css\`",
  "",
  "\`\`\`tsx",
  '<YugenProvider applyToDocument brand="web">',
  "  <App />",
  "</YugenProvider>",
  "\`\`\`",
  "",
  "| Brand | Primary color | Contrast |",
  "| :-- | :-- | --: |",
  "| Sakura | #C2347A | 5.16:1 |",
  "| Web | #0F6CBD | 5.33:1 |",
  "",
  "> Tip: add \`?brand=web\` to a docs URL to share that exact look.",
].join("\\n");

${STREAM_HOOK_CODE}

function StreamingAnswerDemo() {
  const { text, streaming, replay } = useStreamedText(ANSWER);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <StreamingMarkdown streaming={streaming}>{text}</StreamingMarkdown>
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Replay
      </Button>
    </div>
  );
}`;

const TASKS_MD = "### To do\n\n- [x] Add color tokens\n- [x] Check contrast\n- [ ] Write the docs\n\n---\n\nUnsafe links like [click here](javascript:alert(1)) render as plain text.";

/* ================================================================ Citation */

const SOURCES: CitationSource[] = [
  {
    title: "Fluent 2 — Color",
    url: "https://fluent2.microsoft.design/color",
    snippet: "Neutral colors form the foundation; brand color is used sparingly for emphasis.",
  },
  {
    title: "WCAG 2.2 — Contrast (Minimum)",
    url: "https://www.w3.org/TR/WCAG22/#contrast-minimum",
    snippet: "Text has a contrast ratio of at least 4.5:1, large text at least 3:1.",
    meta: "W3C · 2023",
  },
  { title: "Design.md — Color rules", domain: "yugen-ui", snippet: "Brand color is only for CTAs, selected states, focus and links." },
];

const CITED_MD = "Use the brand color only for primary actions and selected states[1][3]. Text needs a contrast ratio of at least **4.5:1**[2].";

/* ================================================================ Reasoning */

const THOUGHT = [
  "The user asks about the **contrast** of Sakura on white.",
  "",
  "- Brand80 is `#C2347A` → compute its relative luminance.",
  "- Against white: about 5.16:1, above the WCAG AA minimum of 4.5:1.",
  "- Conclusion: fine for body text.",
].join("\n");

function ReasoningDemo() {
  const { text, streaming, replay } = useStreamedText(THOUGHT, 4, 50);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Reasoning streaming={streaming}>{text}</Reasoning>
      {!streaming && <StreamingMarkdown>{"Yes. Sakura reaches **5.16:1** on white, enough for body text (AA)."}</StreamingMarkdown>}
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Ask again
      </Button>
    </div>
  );
}

const REASONING_CODE = `const THOUGHT = [
  "The user asks about the **contrast** of Sakura on white.",
  "",
  "- Brand80 is \`#C2347A\` → compute its relative luminance.",
  "- Against white: about 5.16:1, above the WCAG AA minimum of 4.5:1.",
  "- Conclusion: fine for body text.",
].join("\\n");

// useStreamedText: see the StreamingMarkdown example.
function ReasoningDemo() {
  const { text, streaming, replay } = useStreamedText(THOUGHT, 4, 50);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Reasoning streaming={streaming}>{text}</Reasoning>
      {!streaming && <StreamingMarkdown>{"Yes. Sakura reaches **5.16:1** on white, enough for body text (AA)."}</StreamingMarkdown>}
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Ask again
      </Button>
    </div>
  );
}`;

/* ================================================================ PromptInput */

function PromptInputDemo() {
  const [model, setModel] = useState("sakura-1");
  const [streaming, setStreaming] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <PromptInput
        accept="image/*,.pdf,.txt,.md"
        maxFiles={4}
        maxSize={5 * 1024 * 1024}
        streaming={streaming}
        onStop={() => {
          window.clearTimeout(timer.current);
          setStreaming(false);
        }}
        onSubmit={({ text, files }) => {
          setSent((list) => [`${text || "(files only)"} · ${files.length} attached · ${model}`, ...list].slice(0, 3));
          setStreaming(true);
          timer.current = window.setTimeout(() => setStreaming(false), 2500);
        }}
        toolbar={
          <Dropdown size="small" appearance="filled-lighter" aria-label="Choose a model" value={model} onValueChange={setModel} className="min-w-32">
            <DropdownOption value="sakura-1">Sakura-1</DropdownOption>
            <DropdownOption value="sakura-1-mini">Sakura-1 mini</DropdownOption>
          </Dropdown>
        }
      />
      {sent.map((line, i) => (
        <p key={i} className="text-caption1 text-foreground-3">
          Sent: {line}
        </p>
      ))}
    </div>
  );
}

const PROMPT_INPUT_CODE = `function PromptInputDemo() {
  const [model, setModel] = useState("sakura-1");
  const [streaming, setStreaming] = useState(false);
  const [sent, setSent] = useState<string[]>([]);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <div className="flex w-full max-w-xl flex-col gap-2">
      <PromptInput
        accept="image/*,.pdf,.txt,.md"
        maxFiles={4}
        maxSize={5 * 1024 * 1024}
        streaming={streaming}
        onStop={() => {
          window.clearTimeout(timer.current);
          setStreaming(false);
        }}
        onSubmit={({ text, files }) => {
          setSent((list) => [\`\${text || "(files only)"} · \${files.length} attached · \${model}\`, ...list].slice(0, 3));
          setStreaming(true);
          timer.current = window.setTimeout(() => setStreaming(false), 2500);
        }}
        toolbar={
          <Dropdown size="small" appearance="filled-lighter" aria-label="Choose a model" value={model} onValueChange={setModel} className="min-w-32">
            <DropdownOption value="sakura-1">Sakura-1</DropdownOption>
            <DropdownOption value="sakura-1-mini">Sakura-1 mini</DropdownOption>
          </Dropdown>
        }
      />
      {sent.map((line, i) => (
        <p key={i} className="text-caption1 text-foreground-3">
          Sent: {line}
        </p>
      ))}
    </div>
  );
}`;

/* ================================================================ Tour */

const TOUR_STEPS: TourStep[] = [
  { target: "#tour-search", title: "Search everything", content: "Type a document, person or command. Results show up as you type." },
  { target: "#tour-board", title: "Task board", content: "Drag cards between columns to update progress.", placement: "bottom" },
  { target: "#tour-settings", title: "Settings", content: "Change the theme, brand and text direction for the whole team.", placement: "start" },
  { title: "You're all set", content: "You can restart this tour anytime from the Help menu." },
];

function StartTourButton() {
  const tour = useTour();
  return (
    <Button appearance="primary" icon={<Sparkle16Regular />} onClick={() => tour.start()}>
      Start tour
    </Button>
  );
}

function TourDemo() {
  return (
    <Tour steps={TOUR_STEPS}>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex items-center gap-2 rounded-xlarge border border-stroke-2 bg-background-2 p-2">
          <Button id="tour-search" appearance="subtle" icon={<Search20Regular />}>
            Search
          </Button>
          <Button id="tour-board" appearance="subtle" icon={<Board20Regular />}>
            Board
          </Button>
          <Button id="tour-settings" appearance="subtle" icon={<Settings20Regular />} aria-label="Settings" className="ms-auto" />
        </div>
        <StartTourButton />
      </div>
    </Tour>
  );
}

const TOUR_CODE = `const TOUR_STEPS: TourStep[] = [
  { target: "#tour-search", title: "Search everything", content: "Type a document, person or command. Results show up as you type." },
  { target: "#tour-board", title: "Task board", content: "Drag cards between columns to update progress.", placement: "bottom" },
  { target: "#tour-settings", title: "Settings", content: "Change the theme, brand and text direction for the whole team.", placement: "start" },
  { title: "You're all set", content: "You can restart this tour anytime from the Help menu." },
];

function StartTourButton() {
  const tour = useTour();
  return (
    <Button appearance="primary" icon={<Sparkle16Regular />} onClick={() => tour.start()}>
      Start tour
    </Button>
  );
}

function TourDemo() {
  return (
    <Tour steps={TOUR_STEPS}>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex items-center gap-2 rounded-xlarge border border-stroke-2 bg-background-2 p-2">
          <Button id="tour-search" appearance="subtle" icon={<Search20Regular />}>
            Search
          </Button>
          <Button id="tour-board" appearance="subtle" icon={<Board20Regular />}>
            Board
          </Button>
          <Button id="tour-settings" appearance="subtle" icon={<Settings20Regular />} aria-label="Settings" className="ms-auto" />
        </div>
        <StartTourButton />
      </div>
    </Tour>
  );
}`;

function BrandTourDemo() {
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <div ref={anchor} className="w-full rounded-xlarge border border-stroke-2 bg-background-2 p-4 text-body1">
        Your dashboard
      </div>
      <Button onClick={() => setOpen(true)}>See what's new</Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        appearance="brand"
        steps={[{ target: anchor, title: "New dashboard", content: "Metrics now update in real time.", placement: "top" }]}
      />
    </div>
  );
}

const BRAND_TOUR_CODE = `function BrandTourDemo() {
  const anchor = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  return (
    <div className="flex w-full max-w-md flex-col items-start gap-3">
      <div ref={anchor} className="w-full rounded-xlarge border border-stroke-2 bg-background-2 p-4 text-body1">
        Your dashboard
      </div>
      <Button onClick={() => setOpen(true)}>See what's new</Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        appearance="brand"
        steps={[{ target: anchor, title: "New dashboard", content: "Metrics now update in real time.", placement: "top" }]}
      />
    </div>
  );
}`;

/* ================================================================ NotificationCenter */

function seedNotifications(now: number): NotificationItem[] {
  return [
    { id: "a", title: "Alex Chen mentioned you", body: "Could you check the Sakura colors in the new design?", author: "Alex Chen", time: now - 4 * 60_000 },
    { id: "b", title: "Build #212 succeeded", body: "Deployed to the preview environment.", intent: "success", time: now - 2 * 3_600_000 },
    { id: "c", title: "Storage almost full", body: "Your team has used 92% of its storage.", intent: "warning", time: now - 27 * 3_600_000, read: true },
    { id: "d", title: "Maria Garcia shared “Q4 plan”", author: "Maria Garcia", time: now - 3 * 86_400_000, read: true },
  ];
}

function NotificationDemo() {
  const store = useNotifications(() => seedNotifications(Date.now()));
  const count = useRef(0);

  function simulate() {
    count.current += 1;
    store.add({ title: `New comment #${count.current}`, body: "Sam: I agree with option 2.", author: "Sam Lee" });
  }

  return (
    <div className="flex items-center gap-3">
      <NotificationCenter {...store.bind} footer={<Button appearance="transparent">View all</Button>} />
      <Button onClick={simulate}>Simulate a notification</Button>
    </div>
  );
}

const NOTIFICATION_CODE = `function seedNotifications(now: number): NotificationItem[] {
  return [
    { id: "a", title: "Alex Chen mentioned you", body: "Could you check the Sakura colors in the new design?", author: "Alex Chen", time: now - 4 * 60_000 },
    { id: "b", title: "Build #212 succeeded", body: "Deployed to the preview environment.", intent: "success", time: now - 2 * 3_600_000 },
    { id: "c", title: "Storage almost full", body: "Your team has used 92% of its storage.", intent: "warning", time: now - 27 * 3_600_000, read: true },
    { id: "d", title: "Maria Garcia shared “Q4 plan”", author: "Maria Garcia", time: now - 3 * 86_400_000, read: true },
  ];
}

function NotificationDemo() {
  const store = useNotifications(() => seedNotifications(Date.now()));
  const count = useRef(0);

  function simulate() {
    count.current += 1;
    store.add({ title: \`New comment #\${count.current}\`, body: "Sam: I agree with option 2.", author: "Sam Lee" });
  }

  return (
    <div className="flex items-center gap-3">
      <NotificationCenter {...store.bind} footer={<Button appearance="transparent">View all</Button>} />
      <Button onClick={simulate}>Simulate a notification</Button>
    </div>
  );
}`;

function LoadingNotificationsDemo() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <NotificationCenter
        items={[]}
        loading={loading}
        error={failed ? "Lost connection to the server." : undefined}
        onRetry={() => setFailed(false)}
      />
      <Button onClick={() => setLoading((v) => !v)}>{loading ? "Finish loading" : "Reload"}</Button>
      <Button appearance="subtle" onClick={() => setFailed(true)}>
        Simulate an error
      </Button>
    </div>
  );
}

const LOADING_NOTIFICATIONS_CODE = `function LoadingNotificationsDemo() {
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  return (
    <div className="flex items-center gap-3">
      <NotificationCenter
        items={[]}
        loading={loading}
        error={failed ? "Lost connection to the server." : undefined}
        onRetry={() => setFailed(false)}
      />
      <Button onClick={() => setLoading((v) => !v)}>{loading ? "Finish loading" : "Reload"}</Button>
      <Button appearance="subtle" onClick={() => setFailed(true)}>
        Simulate an error
      </Button>
    </div>
  );
}`;

/* ================================================================ Docs */


/* ================================================================ VoiceWave */

const VOICE_WAVE_CODE = `function useFakeLevels(running: boolean) {
  // Stands in for an AnalyserNode: smooth noise around a slow pulse.
  const levels = useRef(new Float32Array(32));
  const source = useCallback(() => {
    const t = performance.now() / 1000;
    const data = levels.current;
    for (let i = 0; i < data.length; i++) {
      const target = 0.35 + 0.3 * Math.sin(t * 3 + i * 0.5) * Math.sin(t * 1.3 + i * 0.17);
      data[i] += (Math.max(0, target + (Math.random() - 0.5) * 0.3) - data[i]) * 0.3;
    }
    return running ? data : null;
  }, [running]);
  return source;
}

function VoiceDemo() {
  const [state, setState] = useState<VoiceWaveState>("listening");
  const source = useFakeLevels(state === "listening" || state === "speaking");
  return (
    <div className="flex flex-col items-center gap-4">
      <VoiceWave state={state} source={source} bars={32} size="large" />
      <div className="flex flex-wrap justify-center gap-2">
        {(["idle", "listening", "speaking", "muted", "error"] as const).map((s) => (
          <Button key={s} size="small" appearance={s === state ? "primary" : "secondary"} onClick={() => setState(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}`;

function useFakeLevels(running: boolean) {
  // Stands in for an AnalyserNode: smooth noise around a slow pulse.
  const levels = useRef(new Float32Array(32));
  const source = useCallback(() => {
    const t = performance.now() / 1000;
    const data = levels.current;
    for (let i = 0; i < data.length; i++) {
      const target = 0.35 + 0.3 * Math.sin(t * 3 + i * 0.5) * Math.sin(t * 1.3 + i * 0.17);
      data[i] += (Math.max(0, target + (Math.random() - 0.5) * 0.3) - data[i]) * 0.3;
    }
    return running ? data : null;
  }, [running]);
  return source;
}

function VoiceDemo() {
  const [state, setState] = useState<VoiceWaveState>("listening");
  const source = useFakeLevels(state === "listening" || state === "speaking");
  return (
    <div className="flex flex-col items-center gap-4">
      <VoiceWave state={state} source={source} bars={32} size="large" />
      <div className="flex flex-wrap justify-center gap-2">
        {(["idle", "listening", "speaking", "muted", "error"] as const).map((s) => (
          <Button key={s} size="small" appearance={s === state ? "primary" : "secondary"} onClick={() => setState(s)}>
            {s}
          </Button>
        ))}
      </div>
    </div>
  );
}

const WEB_AUDIO_CODE = `// Your app owns the microphone and the AnalyserNode; VoiceWave only reads numbers.
async function microphoneLevels(): Promise<VoiceWaveSource> {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const context = new AudioContext();
  const analyser = context.createAnalyser();
  analyser.fftSize = 64;
  context.createMediaStreamSource(stream).connect(analyser);
  const bytes = new Uint8Array(analyser.frequencyBinCount);
  const levels = new Float32Array(bytes.length);
  return () => {
    analyser.getByteFrequencyData(bytes);
    for (let i = 0; i < bytes.length; i++) levels[i] = bytes[i] / 255;
    return levels;
  };
}

function VoiceInput() {
  const [source, setSource] = useState<VoiceWaveSource>();
  const start = async () => {
    const read = await microphoneLevels();
    setSource(() => read);
  };
  return (
    <div className="flex items-center gap-3">
      <Button onClick={start}>Use microphone</Button>
      <VoiceWave state={source ? "listening" : "idle"} source={source} />
    </div>
  );
}`;


/* ================================================================ Transcript */

const TRANSCRIPT_CODE = `const SCRIPT: TranscriptTurn[] = [
  { id: "1", speaker: "Maya", role: "user", text: "Can you move my 3 pm meeting to tomorrow?", timestamp: Date.UTC(2026, 10, 23, 2, 4) },
  { id: "2", speaker: "Assistant", role: "assistant", text: "Sure. Tomorrow at 3 pm is free for everyone. Should I send the update?", timestamp: Date.UTC(2026, 10, 23, 2, 4) },
  { id: "3", speaker: "Maya", role: "user", text: "Yes, and add a note that the agenda is the same.", timestamp: Date.UTC(2026, 10, 23, 2, 5) },
];
const REPLY = "Done. The meeting is now tomorrow at 3 pm, and the invite says the agenda is unchanged.";

function TranscriptDemo() {
  const [turns, setTurns] = useState<TranscriptTurn[]>(SCRIPT);
  const [run, setRun] = useState(0);
  useEffect(() => {
    let length = 0;
    setTurns(SCRIPT);
    const timer = setInterval(() => {
      length = Math.min(REPLY.length, length + 4);
      const done = length === REPLY.length;
      setTurns([
        ...SCRIPT,
        { id: "4", speaker: "Assistant", role: "assistant", text: REPLY.slice(0, length), status: done ? "complete" : "streaming", timestamp: Date.UTC(2026, 10, 23, 2, 5) },
      ]);
      if (done) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [run]);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Transcript turns={turns} announce locale="en-US" className="max-h-72 overflow-y-auto rounded-large border border-stroke-2 p-2" />
      <Button size="small" className="self-start" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </div>
  );
}`;

const SCRIPT: TranscriptTurn[] = [
  { id: "1", speaker: "Maya", role: "user", text: "Can you move my 3 pm meeting to tomorrow?", timestamp: Date.UTC(2026, 10, 23, 2, 4) },
  { id: "2", speaker: "Assistant", role: "assistant", text: "Sure. Tomorrow at 3 pm is free for everyone. Should I send the update?", timestamp: Date.UTC(2026, 10, 23, 2, 4) },
  { id: "3", speaker: "Maya", role: "user", text: "Yes, and add a note that the agenda is the same.", timestamp: Date.UTC(2026, 10, 23, 2, 5) },
];
const REPLY = "Done. The meeting is now tomorrow at 3 pm, and the invite says the agenda is unchanged.";

function TranscriptDemo() {
  const [turns, setTurns] = useState<TranscriptTurn[]>(SCRIPT);
  const [run, setRun] = useState(0);
  useEffect(() => {
    let length = 0;
    setTurns(SCRIPT);
    const timer = setInterval(() => {
      length = Math.min(REPLY.length, length + 4);
      const done = length === REPLY.length;
      setTurns([
        ...SCRIPT,
        { id: "4", speaker: "Assistant", role: "assistant", text: REPLY.slice(0, length), status: done ? "complete" : "streaming", timestamp: Date.UTC(2026, 10, 23, 2, 5) },
      ]);
      if (done) clearInterval(timer);
    }, 60);
    return () => clearInterval(timer);
  }, [run]);
  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Transcript turns={turns} announce locale="en-US" className="max-h-72 overflow-y-auto rounded-large border border-stroke-2 p-2" />
      <Button size="small" className="self-start" onClick={() => setRun((r) => r + 1)}>
        Replay
      </Button>
    </div>
  );
}

export const docs: ComponentDoc[] = [
  {
    slug: "streamingmarkdown",
    category: "Hiển thị dữ liệu",
    name: "StreamingMarkdown",
    lead: "StreamingMarkdown hiển thị câu trả lời Markdown của AI ngay khi từng token về — không nháy ký hiệu thô, không chèn HTML, và không render lại cả bài mỗi lần có chữ mới.",
    description:
      "Bộ phân tích tự viết (parseMarkdown, xuất riêng để test) dựng React element trực tiếp: đoạn văn, heading (lệch cấp qua headingOffset — không bao giờ sinh h1), đậm / nghiêng / gạch / code inline, link chỉ http · https · mailto (http / https mở tab mới, rel noreferrer noopener), danh sách lồng và việc cần làm, trích dẫn, bảng GFM có căn lề, đường kẻ và khối code dùng CodeBlock. Khi streaming: fence chưa đóng là khối code đang viết, ** / link / [1] dở dang không lộ ký hiệu, có con trỏ (đứng yên khi giảm chuyển động) và aria-busy; các khối đã ổn định giữ nguyên object nên React.memo bỏ qua render lại.",
    importCode: `import { StreamingMarkdown, parseMarkdown } from "@/components/ui";`,
    hero: { title: "Câu trả lời đang stream", code: STREAMING_ANSWER_CODE, render: () => <StreamingAnswerDemo /> },
    examples: [
      {
        title: "Việc cần làm & link không an toàn",
        setup: declarationsOf(RAW, ["TASKS_MD"]),
        description: "Mục `- [x]` có icon + chữ ẩn “Đã xong”; link javascript: bị loại, chỉ còn nhãn.",
        code: `<StreamingMarkdown className="w-full max-w-xl">{TASKS_MD}</StreamingMarkdown>`,
        render: () => <StreamingMarkdown className="w-full max-w-xl">{TASKS_MD}</StreamingMarkdown>,
      },
      {
        title: "Cỡ nhỏ",
        description: "size=\"small\" dùng caption1 — hợp cho chú thích, khối suy luận, thẻ trong panel.",
        code: `<StreamingMarkdown size="small" className="w-full max-w-md">
  {"**Note:** the \`colorBrandBackground\` token follows \`data-brand\`.\\n\\n- Light: Brand80\\n- Dark: Brand70"}
</StreamingMarkdown>`,
        render: () => (
          <StreamingMarkdown size="small" className="w-full max-w-md">
            {"**Note:** the `colorBrandBackground` token follows `data-brand`.\n\n- Light: Brand80\n- Dark: Brand70"}
          </StreamingMarkdown>
        ),
      },
    ],
    dos: [
      "Truyền nguyên chuỗi đang dài dần và bật streaming tới khi nhận token cuối — component tự xử lý cú pháp dở dang.",
      "Đặt headingOffset theo cấp tiêu đề của trang chứa (mặc định 2: # → h3).",
      "Trong MessageBubble streaming, đặt caret={false} để không có hai con trỏ.",
    ],
    donts: [
      "Không tự nối HTML hay dùng dangerouslySetInnerHTML cho câu trả lời của model.",
      "Không bật announceWhenDone khi đã nằm trong MessageScroller (sẽ đọc hai lần).",
      "Không kỳ vọng đủ CommonMark: không có HTML thô, ảnh, link tham chiếu, code thụt lề.",
    ],
    props: [
      { name: "children", type: "string", description: "Nội dung Markdown." },
      { name: "streaming", type: "boolean", defaultValue: "false", description: "Chịu cú pháp dở dang, hiện con trỏ, aria-busy." },
      { name: "headingOffset", type: "number", defaultValue: "2", description: "Cộng vào cấp heading; luôn ≥ h2." },
      { name: "citations", type: "CitationSource[]", description: "Nguồn cho [1] / [^1] → chip Citation. Thẻ xem nhanh của chip nạp lúc cần, ngay sau khi chip đầu tiên hiện." },
      { name: "breaks", type: "boolean", defaultValue: "true", description: "Xuống dòng đơn thành <br>." },
      { name: "caret", type: "boolean", defaultValue: "true", description: "Con trỏ khi streaming." },
      { name: "size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "caption1 hoặc body1." },
      { name: "announceWhenDone", type: "boolean", defaultValue: "false", description: "Đọc văn bản thuần qua live region khi stream xong." },
      { name: "parseMarkdown(text, { streaming })", type: "MdRoot", description: "Bộ phân tích thuần; kèm sanitizeHref, markdownToPlainText." },
    ],
  },
  {
    slug: "citation",
    category: "Hiển thị dữ liệu",
    name: "Citation",
    lead: "Citation gắn số nguồn [1] ngay trong câu trả lời; rê chuột hoặc focus để xem nhanh tiêu đề, tên miền và đoạn trích, bấm để mở thẻ và tới link.",
    description:
      "Chip là nút Popover: rê chuột / focus bàn phím mở thẻ xem nhanh mà không cướp focus; bấm hoặc Enter ghim thẻ và đưa focus vào link; Esc đóng và trả focus. Chip mô tả nguồn qua aria-describedby. Không tải favicon từ ngoài — dùng chữ cái đầu tên miền. CitationList liệt kê nguồn dưới câu trả lời, số thứ tự khớp với chip.",
    importCode: `import { Citation, CitationList, type CitationSource } from "@/components/ui";`,
    hero: {
        setup: declarationsOf(RAW, ["SOURCES"]),
      title: "Chip nguồn + danh sách",
      code: `<div className="flex w-full max-w-xl flex-col gap-4">
  <p className="text-body1 text-foreground-1">
    Use the brand color only for primary actions and selected states
    <Citation index={1} source={SOURCES[0]} />
    <Citation index={3} source={SOURCES[2]} />. Text needs a contrast ratio of at least 4.5:1
    <Citation index={2} source={SOURCES[1]} />.
  </p>
  <CitationList sources={SOURCES} />
</div>`,
      render: () => (
        <div className="flex w-full max-w-xl flex-col gap-4">
          <p className="text-body1 text-foreground-1">
            Use the brand color only for primary actions and selected states
            <Citation index={1} source={SOURCES[0]} />
            <Citation index={3} source={SOURCES[2]} />. Text needs a contrast ratio of at least 4.5:1
            <Citation index={2} source={SOURCES[1]} />.
          </p>
          <CitationList sources={SOURCES} />
        </div>
      ),
    },
    examples: [
      {
        title: "Từ Markdown",
        setup: declarationsOf(RAW, ["SOURCES", "CITED_MD"]),
        description: "StreamingMarkdown nhận citations: mọi [n] có nguồn tương ứng thành chip.",
        code: `<StreamingMarkdown className="w-full max-w-xl" citations={SOURCES}>
  {CITED_MD}
</StreamingMarkdown>`,
        render: () => (
          <StreamingMarkdown className="w-full max-w-xl" citations={SOURCES}>
            {CITED_MD}
          </StreamingMarkdown>
        ),
      },
    ],
    dos: [
      "Đánh số theo thứ tự nguồn xuất hiện trong CitationList.",
      "Cung cấp snippet — người đọc kiểm chứng được mà không rời trang.",
      "Đặt chip ngay sau mệnh đề mà nguồn hỗ trợ.",
    ],
    donts: [
      "Không dùng chip cho chú thích không có nguồn thật.",
      "Không tải favicon hay ảnh xem trước từ trang ngoài (lộ quyền riêng tư người đọc).",
      "Không gắn quá 3 chip liền nhau — gộp lại hoặc dẫn sang CitationList.",
    ],
    props: [
      { name: "index", type: "number", description: "Số thứ tự hiển thị (từ 1)." },
      { name: "source", type: "{ title, url?, domain?, snippet?, meta? }", description: "Thông tin nguồn; url chỉ nhận http / https / mailto." },
      { name: "openDelay / closeDelay", type: "number (ms)", defaultValue: "250 / 200", description: "Độ trễ mở / đóng khi rê chuột." },
      { name: "CitationList.sources", type: "CitationSource[]", description: "Danh sách nguồn (lưới 2 cột từ sm)." },
      { name: "CitationList.title", type: "ReactNode", defaultValue: `"Sources"`, description: "Tiêu đề kèm số lượng." },
    ],
  },
  {
    slug: "voicewave",
    category: "Yugen Labs",
    name: "VoiceWave",
    lead: "VoiceWave hiện mức âm thanh của trợ lý giọng nói hoặc cuộc gọi bằng các vạch dọc: phẳng khi chờ hay tắt micro, nhấp nhô khi đang nghe hoặc đang nói.",
    description:
      "VoiceWave không tự mở micro hay tạo AudioContext: app truyền levels (mảng 0–1, re-render khi đổi) hoặc source, một hàm được gọi một lần mỗi animation frame khi đang nghe / nói. Với source, các vạch được cập nhật thẳng qua transform, không re-render và không có timer hay listener cho từng vạch. Số vạch cố định nên chiều rộng không đổi khi dữ liệu đổi. Không có dữ liệu thì mỗi trạng thái có một dáng tĩnh; khi người dùng giảm chuyển động, vòng frame không chạy. Cả khối có role=\"img\" với tên theo trạng thái (messages.voiceWave), các vạch bị ẩn khỏi trình đọc màn hình.",
    importCode: `import { VoiceWave } from "@/components/ui";`,
    hero: { title: "Luồng âm thanh giả lập", code: VOICE_WAVE_CODE, render: () => <VoiceDemo /> },
    examples: [
      {
        title: "Mức âm thanh tĩnh",
        description: "levels được lấy mẫu lại cho đủ số vạch; align=\"bottom\" cho vạch mọc từ đáy.",
        code: `<div className="flex items-center gap-6">
  <VoiceWave state="speaking" levels={[0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4, 0.8]} bars={16} />
  <VoiceWave state="speaking" levels={[0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4, 0.8]} bars={16} align="bottom" tone="neutral" />
</div>`,
        render: () => (
          <div className="flex items-center gap-6">
            <VoiceWave state="speaking" levels={[0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4, 0.8]} bars={16} />
            <VoiceWave state="speaking" levels={[0.2, 0.5, 0.9, 0.6, 0.3, 0.7, 0.4, 0.8]} bars={16} align="bottom" tone="neutral" />
          </div>
        ),
      },
      {
        title: "Trạng thái và kích thước",
        description: "idle, muted và error nằm phẳng; muted và error có màu riêng.",
        code: `<div className="flex flex-wrap items-center gap-6">
  <VoiceWave state="idle" size="small" />
  <VoiceWave state="listening" />
  <VoiceWave state="muted" />
  <VoiceWave state="error" size="large" />
</div>`,
        render: () => (
          <div className="flex flex-wrap items-center gap-6">
            <VoiceWave state="idle" size="small" />
            <VoiceWave state="listening" />
            <VoiceWave state="muted" />
            <VoiceWave state="error" size="large" />
          </div>
        ),
      },
      {
        title: "Web Audio",
        description: "Đọc AnalyserNode trong source; quyền micro và AudioContext là của app.",
        code: WEB_AUDIO_CODE,
        render: () => <VoiceWave state="listening" bars={24} />,
      },
    ],
    dos: [
      "Dùng source cho luồng micro để không re-render mỗi frame.",
      "Hiện trạng thái bằng chữ ở gần (Đang nghe, Đã tắt micro) khi đây là tín hiệu chính của màn hình.",
      "Giữ số vạch cố định trong một giao diện.",
    ],
    donts: [
      "Không tạo AudioContext hay xin quyền micro chỉ để hiển thị sóng.",
      "Không dùng màu sóng làm cách duy nhất để báo lỗi micro.",
      "Không đưa levels mới vào state mỗi frame — dùng source.",
    ],
    props: [
      { name: "state", type: `"idle" | "listening" | "speaking" | "muted" | "error"`, defaultValue: `"idle"`, description: "Trạng thái; quyết định dáng tĩnh, màu và tên đọc." },
      { name: "levels", type: "ArrayLike<number>", description: "Mức âm thanh 0–1, lấy mẫu lại cho đủ bars." },
      { name: "source", type: "() => ArrayLike<number> | null", description: "Gọi mỗi animation frame khi listening / speaking; cập nhật vạch không re-render." },
      { name: "bars", type: "number", defaultValue: "24", description: "Số vạch (3–64)." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao 20 / 32 / 56 px." },
      { name: "tone", type: `"brand" | "neutral"`, defaultValue: `"brand"`, description: "Màu khi nghe / nói." },
      { name: "align", type: `"center" | "bottom"`, defaultValue: `"center"`, description: "Vạch đối xứng quanh đường giữa hoặc mọc từ đáy." },
      { name: "label", type: "string", description: "Tên đọc; mặc định theo state (messages.voiceWave)." },
      { name: "resampleLevels(levels, count)", type: "number[]", description: "Hàm lấy mẫu lại dùng bên trong, cũng được export." },
    ],
  },
  {
    slug: "transcript",
    category: "Yugen Labs",
    name: "Transcript",
    lead: "Transcript hiện các lượt của một cuộc hội thoại giọng nói: ai nói, lúc nào, và câu trả lời đang đến dần.",
    description:
      "Mỗi lượt có id, speaker, text, role (user / assistant), timestamp và status (complete, streaming, error). Lượt đang diễn ra (mặc định: lượt đang streaming, hoặc activeId) có viền nhấn, nhãn chữ “Đang nói” và aria-current, không chỉ đổi màu. Danh sách không phải vùng live: với announce, mỗi lượt được đọc một lần khi xong, lịch sử không bao giờ bị đọc lại. Mỗi lượt được memo, nên khi một token mới đến chỉ lượt đó render lại (renderText cũng chỉ được gọi cho lượt đó). Đặt chiều cao và overflow-y-auto để có khung cuộn: autoScroll giữ cuộn ở cuối khi người dùng đang ở cuối, và thôi kéo xuống khi họ cuộn lên đọc lại.",
    importCode: `import { Transcript, type TranscriptTurn } from "@/components/ui";`,
    hero: { title: "Trợ lý đang trả lời", code: TRANSCRIPT_CODE, render: () => <TranscriptDemo /> },
    examples: [
      {
        title: "Lỗi nhận dạng và trạng thái trống",
        description: "status=\"error\" hiện lý do bằng chữ kèm icon; không có lượt nào thì hiện empty.",
        code: `<div className="flex w-full max-w-xl flex-col gap-4">
  <Transcript
    turns={[
      { id: "1", speaker: "Maya", role: "user", text: "Call the…", status: "error", error: "The microphone stopped. Try again." },
    ]}
  />
  <Transcript turns={[]} empty="Press the microphone and start talking." />
</div>`,
        render: () => (
          <div className="flex w-full max-w-xl flex-col gap-4">
            <Transcript
              turns={[{ id: "1", speaker: "Maya", role: "user", text: "Call the…", status: "error", error: "The microphone stopped. Try again." }]}
            />
            <Transcript turns={[]} empty="Press the microphone and start talking." />
          </div>
        ),
      },
    ],
    dos: [
      "Bật announce khi người dùng không nhìn màn hình (cuộc gọi, trợ lý giọng nói).",
      "Giữ id ổn định cho mỗi lượt và chỉ tạo object mới cho lượt vừa đổi.",
      "Đặt khung cuộn có chiều cao cố định để autoScroll hoạt động.",
    ],
    donts: [
      "Không bọc Transcript trong một vùng aria-live: cả lịch sử sẽ bị đọc lại.",
      "Không dùng màu làm cách duy nhất để báo ai đang nói.",
      "Không tạo lại mọi lượt mỗi token — các lượt cũ sẽ render lại.",
    ],
    props: [
      { name: "turns", type: "TranscriptTurn[]", description: "Các lượt: id, speaker, text, role, timestamp / time, status, error, avatar." },
      { name: "activeId", type: "string | null", description: "Lượt đang diễn ra; mặc định lượt streaming cuối cùng, null để tắt." },
      { name: "autoScroll", type: "boolean", defaultValue: "true", description: "Giữ cuộn ở cuối khi có chữ mới, nếu người dùng đang ở cuối." },
      { name: "announce", type: "boolean", defaultValue: "false", description: "Đọc mỗi lượt một lần khi xong (useAnnounce)." },
      { name: "loading", type: "boolean", defaultValue: "false", description: "Đang tải: aria-busy, chữ “Đang tải bản ghi…” khi chưa có lượt nào." },
      { name: "empty", type: "ReactNode", description: "Nội dung khi chưa có lượt nào (mặc định messages.transcript.empty)." },
      { name: "renderText", type: "(turn) => ReactNode", description: "Thay cách hiện chữ; chỉ được gọi cho lượt đổi." },
      { name: "locale", type: "string", description: "Định dạng giờ của timestamp; mặc định locale của YugenProvider." },
    ],
  },
  {
    slug: "reasoning",
    category: "Yugen Labs",
    name: "Reasoning",
    lead: "Reasoning gói phần suy nghĩ của model vào một khối thu gọn: “Đang suy luận…” kèm đồng hồ khi đang chạy, “Đã suy luận trong 12s” khi xong.",
    description:
      "Dựng trên Collapsible (aria-expanded, chuyển động chiều cao tắt khi giảm chuyển động). autoOpen mở khi bắt đầu và thu lại khi xong — trừ khi người dùng đã tự bấm. Thời gian đo trong effect (không đọc Date.now() lúc render) nên an toàn SSR; hoặc truyền duration. Nội dung chuỗi được render bằng StreamingMarkdown cỡ nhỏ, aria-busy khi đang chạy.",
    importCode: `import { Reasoning } from "@/components/ui";`,
    hero: {
        setup: STREAM_HOOK_CODE, title: "Suy luận rồi trả lời", code: REASONING_CODE, render: () => <ReasoningDemo /> },
    examples: [
      {
        title: "Đã xong, có thời lượng",
        description: "Thu gọn mặc định; truyền duration khi server đã đo sẵn.",
        code: `<Reasoning duration={12400} className="w-full max-w-xl">
  {"Compared 3 ways to store tokens: CSS variables, JSON, TS. Picked **CSS variables** because switching themes needs no rebuild."}
</Reasoning>`,
        render: () => (
          <Reasoning duration={12400} className="w-full max-w-xl">
            {"Compared 3 ways to store tokens: CSS variables, JSON, TS. Picked **CSS variables** because switching themes needs no rebuild."}
          </Reasoning>
        ),
      },
    ],
    dos: [
      "Đặt Reasoning ngay trên câu trả lời, thu gọn khi đã xong.",
      "Hiện thời gian suy luận để người dùng hiểu vì sao phải chờ.",
      "Cho phép mở lại để kiểm chứng lập luận.",
    ],
    donts: [
      "Không mở sẵn khối suy luận dài khi đã có câu trả lời.",
      "Không dùng Reasoning cho các bước gọi công cụ — dùng Trace.",
      "Không đọc nội dung suy luận qua live region.",
    ],
    props: [
      { name: "streaming", type: "boolean", defaultValue: "false", description: "Đang suy luận: nhãn động, đồng hồ, aria-busy." },
      { name: "duration", type: "number (ms)", description: "Thời lượng; bỏ trống thì tự đo." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Điều khiển trạng thái mở." },
      { name: "autoOpen", type: "boolean", defaultValue: "true", description: "Tự mở khi bắt đầu, tự thu khi xong." },
      { name: "label", type: "ReactNode", description: "Thay nhãn mặc định." },
      { name: "children", type: "string | ReactNode", description: "Chuỗi → StreamingMarkdown size small." },
    ],
  },
  {
    slug: "promptinput",
    category: "Yugen Labs",
    name: "PromptInput",
    lead: "PromptInput là ô soạn prompt đầy đủ cho trợ lý AI: tự giãn, đính kèm bằng nút / kéo thả / dán ảnh, kiểm tra tệp ngay tại chỗ và nút Gửi đổi thành Dừng khi model đang trả lời.",
    description:
      "Tệp hiện thành chip có icon theo loại, dung lượng và ảnh thu nhỏ (URL.createObjectURL, thu hồi khi gỡ / unmount). accept, maxFiles, maxSize kiểm tra trước khi thêm, lỗi hiện inline (role=alert). Enter gửi, Shift+Enter xuống dòng, không gửi khi bộ gõ đang ghép chữ (Telex, IME). onSubmit nhận { text, files }; trả false để giữ nội dung. ChatComposer vẫn là lựa chọn gọn cho chat thuần chữ.",
    importCode: `import { PromptInput, validateFiles, formatFileSize } from "@/components/ui";`,
    hero: { title: "Có đính kèm và chọn model", code: PROMPT_INPUT_CODE, render: () => <PromptInputDemo /> },
    examples: [
      {
        title: "Chỉ chữ, có gợi ý phím",
        code: `<PromptInput className="w-full max-w-xl" allowAttachments={false} showHint onSubmit={() => {}} />`,
        render: () => <PromptInput className="w-full max-w-xl" allowAttachments={false} showHint onSubmit={() => {}} />,
      },
      {
        title: "Vô hiệu hoá",
        code: `<PromptInput className="w-full max-w-xl" disabled placeholder="You have used all of today's prompts" onSubmit={() => {}} />`,
        render: () => <PromptInput className="w-full max-w-xl" disabled placeholder="You have used all of today's prompts" onSubmit={() => {}} />,
      },
    ],
    dos: [
      "Khai báo accept / maxSize trùng với giới hạn của server để báo lỗi sớm.",
      "Đặt chọn model, công cụ vào toolbar — gần nút Gửi.",
      "Cho phép Dừng (onStop) khi câu trả lời dài.",
    ],
    donts: [
      "Không xoá nội dung khi gửi thất bại — trả false từ onSubmit.",
      "Không gửi khi Enter đang xác nhận chữ của bộ gõ.",
      "Không giấu lý do tệp bị từ chối.",
    ],
    props: [
      { name: "onSubmit", type: "({ text, files }) => void | boolean", description: "Gửi; false giữ nội dung." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Nội dung (controlled / uncontrolled)." },
      { name: "files / defaultFiles / onFilesChange", type: "File[]", description: "Tệp đính kèm." },
      { name: "accept / maxFiles / maxSize", type: "string / number / number (byte)", description: "Kiểm tra tệp; onFilesRejected nhận lý do." },
      { name: "streaming / onStop", type: "boolean / () => void", description: "Chặn gửi; nút Dừng." },
      { name: "toolbar", type: "ReactNode", description: "Slot sau nút đính kèm." },
      { name: "allowAttachments", type: "boolean", defaultValue: "true", description: "Nút đính kèm, kéo thả, dán tệp." },
      { name: "maxRows / showHint / disabled", type: "number / boolean / boolean", defaultValue: "8 / false / false", description: "Giãn tối đa, gợi ý phím, vô hiệu hoá." },
      { name: "placeholder / label / sendLabel / stopLabel", type: "string", description: "Nhãn hiển thị và nhãn truy cập." },
    ],
  },
  {
    slug: "tour",
    category: "Yugen Labs",
    name: "Tour",
    lead: "Tour dẫn người dùng qua các phần quan trọng của sản phẩm từng bước: làm tối phần còn lại, khoét sáng đúng phần tử và giải thích bằng TeachingPopover.",
    description:
      "steps nhận target là CSS selector hoặc ref (bỏ trống → popover giữa màn hình), title, content, placement (top / bottom / start / end — tự đảo ở RTL) và media. Popover modal: focus vào trong, Tab không thoát ra ngoài, Esc đóng, kết thúc thì trả focus về chỗ cũ. Phần tử được cuộn vào tầm nhìn và theo dõi mỗi khung hình (cuộn, đổi kích thước). Spotlight có viền outline nên vẫn thấy ở chế độ tương phản cao. useTour() điều khiển start / stop / next / back / goTo.",
    importCode: `import { Tour, useTour, type TourStep } from "@/components/ui";`,
    hero: { title: "Hướng dẫn 4 bước", code: TOUR_CODE, render: () => <TourDemo /> },
    examples: [
      {
        title: "Một bước, controlled, brand",
        description: "target là ref; open / onOpenChange điều khiển từ ngoài.",
        code: BRAND_TOUR_CODE,
        render: () => <BrandTourDemo />,
      },
    ],
    dos: [
      "Giữ tour ngắn (3–5 bước), mỗi bước một ý.",
      "Luôn có Bỏ qua và cho mở lại tour từ menu Trợ giúp.",
      "Nhắm vào phần tử ổn định (id, data-attribute) thay vì class dễ đổi.",
    ],
    donts: [
      "Không tự mở tour mỗi lần vào trang — chỉ lần đầu hoặc khi người dùng yêu cầu.",
      "Không đặt thao tác bắt buộc bên trong tour.",
      "Không dùng tour để bù cho giao diện khó hiểu.",
    ],
    props: [
      { name: "steps", type: "{ target?, title, content, placement?, media? }[]", description: "Các bước; target là selector hoặc ref." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Trạng thái mở." },
      { name: "step / defaultStep / onStepChange", type: "number", description: "Bước hiện tại (từ 0)." },
      { name: "onFinish", type: "() => void", description: "Bấm Hoàn tất ở bước cuối." },
      { name: "appearance", type: `"normal" | "brand"`, defaultValue: `"normal"`, description: "Bề mặt như TeachingPopover." },
      { name: "spotlightPadding / closeOnOverlayClick", type: "number / boolean", defaultValue: "8 / false", description: "Khoảng hở spotlight; bấm lớp phủ để đóng." },
      { name: "nextLabel / backLabel / skipLabel / finishLabel", type: "string", description: "Nhãn nút." },
      { name: "useTour()", type: "{ open, step, total, start, stop, next, back, goTo }", description: "Điều khiển trong cây con của Tour." },
    ],
  },
  {
    slug: "notificationcenter",
    category: "Yugen Labs",
    name: "NotificationCenter",
    lead: "NotificationCenter là chuông thông báo kèm số chưa đọc, mở bảng thông báo nhóm theo ngày — Popover trên desktop, bottom sheet trên mobile.",
    description:
      "Mỗi thông báo có avatar hoặc icon theo intent, tiêu đề, nội dung, thời gian tương đối, chấm chưa đọc (kèm chữ ẩn) và hành động Đánh dấu đã đọc / Bỏ. Lọc Tất cả / Chưa đọc, Đánh dấu tất cả đã đọc, trạng thái trống (Empty), đang tải (SkeletonList qua useSpinDelay) và lỗi (ErrorState có Thử lại). Thời gian tính sau khi mount hoặc theo prop now — không lệch hydration. Thông báo mới được đọc polite qua useAnnounce. useNotifications() là kho nhỏ cho demo.",
    importCode: `import { NotificationCenter, useNotifications, type NotificationItem } from "@/components/ui";`,
    hero: { title: "Chuông thông báo", code: NOTIFICATION_CODE, render: () => <NotificationDemo /> },
    examples: [
      {
        title: "Đang tải & lỗi",
        description: "Khung xương chỉ hiện khi chờ > 300ms; lỗi có nút Thử lại khi truyền onRetry.",
        code: LOADING_NOTIFICATIONS_CODE,
        render: () => <LoadingNotificationsDemo />,
      },
    ],
    dos: [
      "Viết tiêu đề nói rõ ai làm gì; nội dung chi tiết để ở body.",
      "Cho bấm vào thông báo để tới đúng nơi và tự đánh dấu đã đọc.",
      "Dùng intent warning / error chỉ cho việc cần người dùng xử lý.",
    ],
    donts: [
      "Không dùng NotificationCenter cho phản hồi tức thời của thao tác — dùng Toast.",
      "Không đếm cả thông báo đã đọc trên chuông.",
      "Không tính “bây giờ” trong render trên server — truyền now hoặc để component tự lấy sau khi mount.",
    ],
    props: [
      { name: "items", type: "NotificationItem[]", description: "{ id, title, body?, time, read?, author?, icon?, intent?, href? }." },
      { name: "onMarkRead / onMarkAllRead / onDismiss", type: "(id) => void / () => void / (id) => void", description: "Hành động (controlled)." },
      { name: "onItemClick", type: "(item) => void", description: "Bấm thông báo; tự gọi onMarkRead nếu chưa đọc." },
      { name: "loading / error / onRetry", type: "boolean / ReactNode / () => void", description: "Trạng thái tải và lỗi." },
      { name: "now", type: "Date | number", description: "Mốc thời gian cố định (SSR, test)." },
      { name: "open / defaultOpen / onOpenChange", type: "boolean", description: "Trạng thái bảng." },
      { name: "mode / breakpoint", type: `"auto" | "popover" | "sheet" / "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | number`, defaultValue: `"auto" / "3xl"`, description: "Popover hay bottom sheet; breakpoint dùng token như Sheet (số px đã lỗi thời, bỏ ở 1.0)." },
      { name: "title / footer / announce", type: "string / ReactNode / boolean", defaultValue: `"Notifications" / — / true`, description: "Tiêu đề, chân bảng, đọc thông báo mới." },
      { name: "useNotifications(initial)", type: "{ items, unreadCount, add, markRead, markAllRead, dismiss, clear, bind }", description: "Kho nhỏ cho demo; trải bind vào NotificationCenter." },
    ],
  },
];
