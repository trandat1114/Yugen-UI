import { useEffect, useRef, useState } from "react";
import { Attach20Regular, Emoji20Regular, Sparkle16Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui";
import { Trace, TraceLog, TraceStep, type TraceStatus } from "@/components/ui/Trace/Trace";
import { Questionnaire, type Question, type QuestionnaireAnswers } from "@/components/ui/Questionnaire/Questionnaire";
import {
  ChatComposer,
  MessageBubble,
  MessageDaySeparator,
  MessageReaction,
  MessageScroller,
  TypingIndicator,
  type MessageStatus,
} from "@/components/ui/MessageScroller/MessageScroller";
import { CodeBlock, CodeTabs, PackageManagerTabs } from "@/components/ui/CodeBlock/CodeBlock";
import type { ComponentDoc } from "../types";

/* ================================================================ Trace */

const AGENT_STEPS = [
  { title: "Đọc yêu cầu", ms: 700 },
  { title: "Tra lịch 4 thành viên", ms: 1600 },
  { title: "Tìm khung giờ trống", ms: 1100 },
  { title: "Gửi lời mời họp", ms: 900 },
];

function AgentTraceDemo() {
  const [current, setCurrent] = useState(-1);
  const [startedAt, setStartedAt] = useState<number>();
  const [durations, setDurations] = useState<number[]>([]);
  const done = current >= AGENT_STEPS.length;

  useEffect(() => {
    if (current < 0 || done) return;
    const begin = Date.now();
    const id = window.setTimeout(() => {
      setDurations((list) => [...list, Date.now() - begin]);
      setCurrent((c) => c + 1);
    }, AGENT_STEPS[current].ms);
    return () => window.clearTimeout(id);
  }, [current, done]);

  const statusOf = (i: number): TraceStatus => (i < current ? "success" : i === current ? "running" : "pending");

  function run() {
    setDurations([]);
    setStartedAt(Date.now());
    setCurrent(0);
  }

  return (
    <Trace
      className="w-full max-w-xl"
      title="Agent: xếp lịch họp nhóm"
      startedAt={startedAt}
      duration={done ? durations.reduce((a, b) => a + b, 0) : undefined}
      actions={
        <Button size="small" appearance="primary" disabled={current >= 0 && !done} onClick={run}>
          {current < 0 ? "Chạy" : "Chạy lại"}
        </Button>
      }
    >
      <TraceStep
        title={AGENT_STEPS[0].title}
        status={statusOf(0)}
        duration={durations[0]}
        description="Họp 60 phút trong tuần này, đủ 4 người."
      />
      <TraceStep
        title={AGENT_STEPS[1].title}
        status={statusOf(1)}
        duration={durations[1]}
        metadata={["calendar.read", "song song"]}
      >
        <TraceStep title="Lịch của Lan và Minh" status={statusOf(1)} />
        <TraceStep title="Lịch của Hà và Tuấn" status={statusOf(1)} />
      </TraceStep>
      <TraceStep
        title={AGENT_STEPS[2].title}
        status={statusOf(2)}
        duration={durations[2]}
        details={<TraceLog>{'{ "slot": "Thứ Năm 14:00–15:00", "conflicts": 0 }'}</TraceLog>}
      />
      <TraceStep title={AGENT_STEPS[3].title} status={statusOf(3)} duration={durations[3]} />
    </Trace>
  );
}

const AGENT_TRACE_CODE = `const AGENT_STEPS = [
  { title: "Đọc yêu cầu", ms: 700 },
  { title: "Tra lịch 4 thành viên", ms: 1600 },
  { title: "Tìm khung giờ trống", ms: 1100 },
  { title: "Gửi lời mời họp", ms: 900 },
];

function AgentTraceDemo() {
  const [current, setCurrent] = useState(-1);
  const [startedAt, setStartedAt] = useState<number>();
  const [durations, setDurations] = useState<number[]>([]);
  const done = current >= AGENT_STEPS.length;

  useEffect(() => {
    if (current < 0 || done) return;
    const begin = Date.now();
    const id = window.setTimeout(() => {
      setDurations((list) => [...list, Date.now() - begin]);
      setCurrent((c) => c + 1);
    }, AGENT_STEPS[current].ms);
    return () => window.clearTimeout(id);
  }, [current, done]);

  const statusOf = (i: number): TraceStatus => (i < current ? "success" : i === current ? "running" : "pending");

  function run() {
    setDurations([]);
    setStartedAt(Date.now());
    setCurrent(0);
  }

  return (
    <Trace
      className="w-full max-w-xl"
      title="Agent: xếp lịch họp nhóm"
      startedAt={startedAt}
      duration={done ? durations.reduce((a, b) => a + b, 0) : undefined}
      actions={
        <Button size="small" appearance="primary" disabled={current >= 0 && !done} onClick={run}>
          {current < 0 ? "Chạy" : "Chạy lại"}
        </Button>
      }
    >
      <TraceStep
        title={AGENT_STEPS[0].title}
        status={statusOf(0)}
        duration={durations[0]}
        description="Họp 60 phút trong tuần này, đủ 4 người."
      />
      <TraceStep
        title={AGENT_STEPS[1].title}
        status={statusOf(1)}
        duration={durations[1]}
        metadata={["calendar.read", "song song"]}
      >
        <TraceStep title="Lịch của Lan và Minh" status={statusOf(1)} />
        <TraceStep title="Lịch của Hà và Tuấn" status={statusOf(1)} />
      </TraceStep>
      <TraceStep
        title={AGENT_STEPS[2].title}
        status={statusOf(2)}
        duration={durations[2]}
        details={<TraceLog>{'{ "slot": "Thứ Năm 14:00–15:00", "conflicts": 0 }'}</TraceLog>}
      />
      <TraceStep title={AGENT_STEPS[3].title} status={statusOf(3)} duration={durations[3]} />
    </Trace>
  );
}`;

/* ================================================================ Questionnaire */

const SURVEY: Question[] = [
  {
    id: "use",
    type: "single",
    title: "Bạn dùng Yugen UI cho việc gì?",
    required: true,
    options: [
      { value: "product", label: "Sản phẩm thương mại" },
      { value: "internal", label: "Công cụ nội bộ" },
      { value: "learning", label: "Học & thử nghiệm" },
    ],
  },
  {
    id: "parts",
    type: "multiple",
    title: "Bạn dùng nhiều nhất những phần nào?",
    description: "Chọn tối đa 3.",
    max: 3,
    options: [
      { value: "forms", label: "Form & nhập liệu" },
      { value: "overlay", label: "Dialog, Drawer, Popover" },
      { value: "data", label: "Bảng & dữ liệu" },
      { value: "labs", label: "Yugen Labs" },
    ],
  },
  { id: "docs", type: "rating", title: "Bạn chấm tài liệu mấy sao?", required: true },
  {
    id: "nps",
    type: "scale",
    title: "Bạn có giới thiệu Yugen UI cho đồng nghiệp không?",
    minLabel: "Chắc chắn không",
    maxLabel: "Chắc chắn có",
    required: true,
  },
  { id: "rtl", type: "yesNo", title: "Sản phẩm của bạn có cần hỗ trợ RTL không?" },
  {
    id: "idea",
    type: "longText",
    title: "Bạn muốn có thêm component nào?",
    placeholder: "Ví dụ: TimePicker, ColorPicker…",
    maxLength: 300,
  },
];

function SurveyDemo() {
  return (
    <Questionnaire
      className="w-full max-w-xl"
      title="Khảo sát nhanh"
      description="6 câu · khoảng 1 phút"
      questions={SURVEY}
      onSubmit={() => new Promise<void>((resolve) => window.setTimeout(resolve, 800))}
    />
  );
}

const SURVEY_CODE = `const SURVEY: Question[] = [
  {
    id: "use",
    type: "single",
    title: "Bạn dùng Yugen UI cho việc gì?",
    required: true,
    options: [
      { value: "product", label: "Sản phẩm thương mại" },
      { value: "internal", label: "Công cụ nội bộ" },
      { value: "learning", label: "Học & thử nghiệm" },
    ],
  },
  {
    id: "parts",
    type: "multiple",
    title: "Bạn dùng nhiều nhất những phần nào?",
    description: "Chọn tối đa 3.",
    max: 3,
    options: [
      { value: "forms", label: "Form & nhập liệu" },
      { value: "overlay", label: "Dialog, Drawer, Popover" },
      { value: "data", label: "Bảng & dữ liệu" },
      { value: "labs", label: "Yugen Labs" },
    ],
  },
  { id: "docs", type: "rating", title: "Bạn chấm tài liệu mấy sao?", required: true },
  {
    id: "nps",
    type: "scale",
    title: "Bạn có giới thiệu Yugen UI cho đồng nghiệp không?",
    minLabel: "Chắc chắn không",
    maxLabel: "Chắc chắn có",
    required: true,
  },
  { id: "rtl", type: "yesNo", title: "Sản phẩm của bạn có cần hỗ trợ RTL không?" },
  {
    id: "idea",
    type: "longText",
    title: "Bạn muốn có thêm component nào?",
    placeholder: "Ví dụ: TimePicker, ColorPicker…",
    maxLength: 300,
  },
];

function SurveyDemo() {
  return (
    <Questionnaire
      className="w-full max-w-xl"
      title="Khảo sát nhanh"
      description="6 câu · khoảng 1 phút"
      questions={SURVEY}
      onSubmit={() => new Promise<void>((resolve) => window.setTimeout(resolve, 800))}
    />
  );
}`;

const SIGNUP: Question[] = [
  { id: "name", type: "text", title: "Họ và tên", required: true, placeholder: "Nguyễn Văn A" },
  {
    id: "email",
    type: "text",
    inputType: "email",
    title: "Email công việc",
    required: true,
    validate: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Email chưa đúng định dạng."),
  },
  {
    id: "team",
    type: "single",
    title: "Quy mô nhóm",
    options: [
      { value: "s", label: "1–5 người" },
      { value: "m", label: "6–20 người" },
      { value: "l", label: "Trên 20 người" },
    ],
  },
  { id: "beta", type: "yesNo", title: "Tham gia dùng thử Yugen Labs?" },
];

function SignupDemo() {
  return <Questionnaire mode="list" review={false} className="w-full" questions={SIGNUP} submitLabel="Đăng ký" />;
}

const SIGNUP_CODE = `const SIGNUP: Question[] = [
  { id: "name", type: "text", title: "Họ và tên", required: true, placeholder: "Nguyễn Văn A" },
  {
    id: "email",
    type: "text",
    inputType: "email",
    title: "Email công việc",
    required: true,
    validate: (value) => (/^\\S+@\\S+\\.\\S+$/.test(value) ? null : "Email chưa đúng định dạng."),
  },
  {
    id: "team",
    type: "single",
    title: "Quy mô nhóm",
    options: [
      { value: "s", label: "1–5 người" },
      { value: "m", label: "6–20 người" },
      { value: "l", label: "Trên 20 người" },
    ],
  },
  { id: "beta", type: "yesNo", title: "Tham gia dùng thử Yugen Labs?" },
];

function SignupDemo() {
  return <Questionnaire mode="list" review={false} className="w-full" questions={SIGNUP} submitLabel="Đăng ký" />;
}`;

function MoodDemo() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const answered = Object.values(answers).filter((v) => v !== undefined && v !== "").length;

  return (
    <div className="flex w-full flex-col gap-S">
      <p className="text-caption1 text-foreground-3">Đã trả lời {answered}/2 câu</p>
      <Questionnaire
        appearance="subtle"
        review={false}
        questions={[
          { id: "mood", type: "rating", title: "Hôm nay của bạn thế nào?", required: true },
          { id: "word", type: "text", title: "Một từ để mô tả ngày hôm nay?" },
        ]}
        value={answers}
        onChange={setAnswers}
        completion={(result, restart) => (
          <div className="flex flex-col items-start gap-S">
            <p className="text-body1">Cảm ơn! Bạn chấm {String(result.mood)} sao.</p>
            <Button size="small" onClick={restart}>
              Trả lời lại
            </Button>
          </div>
        )}
      />
    </div>
  );
}

const MOOD_CODE = `function MoodDemo() {
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const answered = Object.values(answers).filter((v) => v !== undefined && v !== "").length;

  return (
    <div className="flex w-full flex-col gap-S">
      <p className="text-caption1 text-foreground-3">Đã trả lời {answered}/2 câu</p>
      <Questionnaire
        appearance="subtle"
        review={false}
        questions={[
          { id: "mood", type: "rating", title: "Hôm nay của bạn thế nào?", required: true },
          { id: "word", type: "text", title: "Một từ để mô tả ngày hôm nay?" },
        ]}
        value={answers}
        onChange={setAnswers}
        completion={(result, restart) => (
          <div className="flex flex-col items-start gap-S">
            <p className="text-body1">Cảm ơn! Bạn chấm {String(result.mood)} sao.</p>
            <Button size="small" onClick={restart}>
              Trả lời lại
            </Button>
          </div>
        )}
      />
    </div>
  );
}`;

/* ================================================================ MessageScroller */

interface ChatMessage {
  id: number;
  side: "incoming" | "outgoing";
  text: string;
  time: string;
  status?: MessageStatus;
  streaming?: boolean;
}

const BOT = "Sakura Bot";
const REPLY = "Yugen UI dùng token Fluent 2, nên bạn chỉ cần đổi data-theme để chuyển sáng / tối — component không phải sửa gì.";

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function MiniChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, side: "incoming", text: "Chào bạn 👋 Mình là Sakura Bot.", time: "09:00" },
    { id: 2, side: "incoming", text: "Hỏi mình bất cứ điều gì về Yugen UI nhé!", time: "09:00" },
  ]);
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  function reply() {
    const id = Date.now();
    const words = REPLY.split(" ");
    setTyping(true);
    later(() => {
      setTyping(false);
      setMessages((list) => [...list, { id, side: "incoming", text: "", time: nowTime(), streaming: true }]);
      words.forEach((_, i) =>
        later(() => {
          const text = words.slice(0, i + 1).join(" ");
          const streaming = i < words.length - 1;
          setMessages((list) => list.map((m) => (m.id === id ? { ...m, text, streaming } : m)));
        }, (i + 1) * 60),
      );
    }, 1200);
  }

  function send(text: string) {
    const id = Date.now();
    setMessages((list) => [...list, { id, side: "outgoing", text, time: nowTime(), status: "sending" }]);
    later(() => {
      setMessages((list) => list.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
      reply();
    }, 500);
  }

  return (
    <div className="flex h-112 w-full max-w-md flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2">
      <MessageScroller className="flex-1">
        <MessageDaySeparator>Hôm nay</MessageDaySeparator>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            side={m.side}
            author={m.side === "incoming" ? BOT : "Bạn"}
            time={m.time}
            status={m.status}
            streaming={m.streaming}
          >
            {m.text}
          </MessageBubble>
        ))}
        {typing && <TypingIndicator key="typing" author={BOT} />}
      </MessageScroller>
      <ChatComposer className="m-S" placeholder="Hỏi Sakura Bot…" onSend={send} />
    </div>
  );
}

const MINI_CHAT_CODE = `interface ChatMessage {
  id: number;
  side: "incoming" | "outgoing";
  text: string;
  time: string;
  status?: MessageStatus;
  streaming?: boolean;
}

const BOT = "Sakura Bot";
const REPLY = "Yugen UI dùng token Fluent 2, nên bạn chỉ cần đổi data-theme để chuyển sáng / tối — component không phải sửa gì.";

function nowTime() {
  return new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" });
}

function MiniChatDemo() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 1, side: "incoming", text: "Chào bạn 👋 Mình là Sakura Bot.", time: "09:00" },
    { id: 2, side: "incoming", text: "Hỏi mình bất cứ điều gì về Yugen UI nhé!", time: "09:00" },
  ]);
  const [typing, setTyping] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const later = (fn: () => void, ms: number) => timers.current.push(window.setTimeout(fn, ms));

  function reply() {
    const id = Date.now();
    const words = REPLY.split(" ");
    setTyping(true);
    later(() => {
      setTyping(false);
      setMessages((list) => [...list, { id, side: "incoming", text: "", time: nowTime(), streaming: true }]);
      words.forEach((_, i) =>
        later(() => {
          const text = words.slice(0, i + 1).join(" ");
          const streaming = i < words.length - 1;
          setMessages((list) => list.map((m) => (m.id === id ? { ...m, text, streaming } : m)));
        }, (i + 1) * 60),
      );
    }, 1200);
  }

  function send(text: string) {
    const id = Date.now();
    setMessages((list) => [...list, { id, side: "outgoing", text, time: nowTime(), status: "sending" }]);
    later(() => {
      setMessages((list) => list.map((m) => (m.id === id ? { ...m, status: "read" } : m)));
      reply();
    }, 500);
  }

  return (
    <div className="flex h-112 w-full max-w-md flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2">
      <MessageScroller className="flex-1">
        <MessageDaySeparator>Hôm nay</MessageDaySeparator>
        {messages.map((m) => (
          <MessageBubble
            key={m.id}
            side={m.side}
            author={m.side === "incoming" ? BOT : "Bạn"}
            time={m.time}
            status={m.status}
            streaming={m.streaming}
          >
            {m.text}
          </MessageBubble>
        ))}
        {typing && <TypingIndicator key="typing" author={BOT} />}
      </MessageScroller>
      <ChatComposer className="m-S" placeholder="Hỏi Sakura Bot…" onSend={send} />
    </div>
  );
}`;

function DeliveryDemo() {
  const [status, setStatus] = useState<MessageStatus>("error");

  function retry() {
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 800);
  }

  return (
    <MessageScroller className="h-80 w-full rounded-xlarge border border-stroke-2">
      <MessageBubble side="outgoing" author="Bạn" time="10:01" status="read">
        Mình gửi file thiết kế rồi nhé.
      </MessageBubble>
      <MessageBubble side="outgoing" author="Bạn" time="10:02" status="delivered">
        Bạn xem giúp phần màu Sakura.
      </MessageBubble>
      <MessageBubble side="outgoing" author="Bạn" time="10:02" status="sent">
        Cần trước 5 giờ chiều.
      </MessageBubble>
      <MessageBubble side="outgoing" author="Bạn" time="10:03" status={status} onRetry={retry}>
        Cảm ơn bạn!
      </MessageBubble>
    </MessageScroller>
  );
}

const DELIVERY_CODE = `function DeliveryDemo() {
  const [status, setStatus] = useState<MessageStatus>("error");

  function retry() {
    setStatus("sending");
    window.setTimeout(() => setStatus("sent"), 800);
  }

  return (
    <MessageScroller className="h-80 w-full rounded-xlarge border border-stroke-2">
      <MessageBubble side="outgoing" author="Bạn" time="10:01" status="read">
        Mình gửi file thiết kế rồi nhé.
      </MessageBubble>
      <MessageBubble side="outgoing" author="Bạn" time="10:02" status="delivered">
        Bạn xem giúp phần màu Sakura.
      </MessageBubble>
      <MessageBubble side="outgoing" author="Bạn" time="10:02" status="sent">
        Cần trước 5 giờ chiều.
      </MessageBubble>
      <MessageBubble side="outgoing" author="Bạn" time="10:03" status={status} onRetry={retry}>
        Cảm ơn bạn!
      </MessageBubble>
    </MessageScroller>
  );
}`;

const GROUPING_CODE = `<MessageScroller className="h-80 w-full rounded-xlarge border border-stroke-2">
  <MessageDaySeparator>Thứ Hai, 19/10</MessageDaySeparator>
  <MessageBubble author="Trần Lan" time="08:12">Sáng nay bản build mới đã lên staging.</MessageBubble>
  <MessageBubble author="Trần Lan" time="08:12">Mọi người kiểm tra giúp phần Trace nhé!</MessageBubble>
  <MessageBubble
    author="Trần Lan"
    time="08:13"
    reactions={
      <>
        <MessageReaction emoji="👍" count={3} label="Thích" selected />
        <MessageReaction emoji="🌸" count={1} label="Hoa anh đào" />
      </>
    }
  >
    Có gì cứ nhắn mình.
  </MessageBubble>
  <MessageBubble side="outgoing" author="Bạn" time="08:20">
    Đã xem, chạy mượt lắm 🎉
  </MessageBubble>
</MessageScroller>`;

function LoadOlderDemo() {
  const [ids, setIds] = useState(() => Array.from({ length: 12 }, (_, i) => 100 + i));
  const [loading, setLoading] = useState(false);

  function loadOlder() {
    setLoading(true);
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        setIds((list) => [...Array.from({ length: 8 }, (_, i) => list[0] - 8 + i), ...list]);
        setLoading(false);
        resolve();
      }, 900);
    });
  }

  return (
    <MessageScroller
      className="h-80 w-full rounded-xlarge border border-stroke-2"
      onLoadOlder={loadOlder}
      loadingOlder={loading}
      hasOlder={ids[0] > 60}
    >
      {ids.map((n) => (
        <MessageBubble key={n} side={n % 3 === 0 ? "outgoing" : "incoming"} author={n % 3 === 0 ? "Bạn" : "Minh"}>
          Tin nhắn số {n}
        </MessageBubble>
      ))}
    </MessageScroller>
  );
}

const LOAD_OLDER_CODE = `function LoadOlderDemo() {
  const [ids, setIds] = useState(() => Array.from({ length: 12 }, (_, i) => 100 + i));
  const [loading, setLoading] = useState(false);

  function loadOlder() {
    setLoading(true);
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        setIds((list) => [...Array.from({ length: 8 }, (_, i) => list[0] - 8 + i), ...list]);
        setLoading(false);
        resolve();
      }, 900);
    });
  }

  return (
    <MessageScroller
      className="h-80 w-full rounded-xlarge border border-stroke-2"
      onLoadOlder={loadOlder}
      loadingOlder={loading}
      hasOlder={ids[0] > 60}
    >
      {ids.map((n) => (
        <MessageBubble key={n} side={n % 3 === 0 ? "outgoing" : "incoming"} author={n % 3 === 0 ? "Bạn" : "Minh"}>
          Tin nhắn số {n}
        </MessageBubble>
      ))}
    </MessageScroller>
  );
}`;

function NewMessagesDemo() {
  const [count, setCount] = useState(14);

  return (
    <div className="flex w-full flex-col gap-S">
      <MessageScroller className="h-72 rounded-xlarge border border-stroke-2">
        {Array.from({ length: count }, (_, i) => (
          <MessageBubble key={i} author={i % 2 === 0 ? "Hà" : "Tuấn"}>
            Cập nhật #{i + 1}
          </MessageBubble>
        ))}
      </MessageScroller>
      <Button className="self-start" onClick={() => setCount((c) => c + 1)}>
        Nhận tin mới
      </Button>
    </div>
  );
}

const NEW_MESSAGES_CODE = `function NewMessagesDemo() {
  const [count, setCount] = useState(14);

  return (
    <div className="flex w-full flex-col gap-S">
      <MessageScroller className="h-72 rounded-xlarge border border-stroke-2">
        {Array.from({ length: count }, (_, i) => (
          <MessageBubble key={i} author={i % 2 === 0 ? "Hà" : "Tuấn"}>
            Cập nhật #{i + 1}
          </MessageBubble>
        ))}
      </MessageScroller>
      <Button className="self-start" onClick={() => setCount((c) => c + 1)}>
        Nhận tin mới
      </Button>
    </div>
  );
}`;

/* ================================================================ ChatComposer */

function ComposerDemo() {
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="flex w-full max-w-lg flex-col gap-S">
      <ChatComposer
        maxLength={500}
        showCount
        onSend={(text) => setSent((list) => [text, ...list].slice(0, 3))}
        actions={
          <>
            <Button appearance="subtle" icon={<Attach20Regular />} aria-label="Đính kèm tệp" />
            <Button appearance="subtle" icon={<Emoji20Regular />} aria-label="Chèn emoji" />
          </>
        }
      />
      {sent.map((text, i) => (
        <p key={i} className="text-caption1 whitespace-pre-wrap text-foreground-3">
          Đã gửi: {text}
        </p>
      ))}
    </div>
  );
}

const COMPOSER_CODE = `function ComposerDemo() {
  const [sent, setSent] = useState<string[]>([]);

  return (
    <div className="flex w-full max-w-lg flex-col gap-S">
      <ChatComposer
        maxLength={500}
        showCount
        onSend={(text) => setSent((list) => [text, ...list].slice(0, 3))}
        actions={
          <>
            <Button appearance="subtle" icon={<Attach20Regular />} aria-label="Đính kèm tệp" />
            <Button appearance="subtle" icon={<Emoji20Regular />} aria-label="Chèn emoji" />
          </>
        }
      />
      {sent.map((text, i) => (
        <p key={i} className="text-caption1 whitespace-pre-wrap text-foreground-3">
          Đã gửi: {text}
        </p>
      ))}
    </div>
  );
}`;

function StopDemo() {
  const [busy, setBusy] = useState(false);

  return (
    <ChatComposer
      className="w-full"
      busy={busy}
      onStop={() => setBusy(false)}
      onSend={() => setBusy(true)}
      placeholder={busy ? "Đang trả lời…" : "Hỏi trợ lý…"}
      actions={
        <Button size="small" appearance="subtle" icon={<Sparkle16Regular />}>
          Sakura-1
        </Button>
      }
    />
  );
}

const STOP_CODE = `function StopDemo() {
  const [busy, setBusy] = useState(false);

  return (
    <ChatComposer
      className="w-full"
      busy={busy}
      onStop={() => setBusy(false)}
      onSend={() => setBusy(true)}
      placeholder={busy ? "Đang trả lời…" : "Hỏi trợ lý…"}
      actions={
        <Button size="small" appearance="subtle" icon={<Sparkle16Regular />}>
          Sakura-1
        </Button>
      }
    />
  );
}`;

/* ================================================================ CodeBlock */

const SAVE_BAR_SOURCE = [
  'import { Button } from "@/components/ui";',
  "",
  "export function SaveBar({ onSave }: { onSave: () => void }) {",
  "  // Hành động chính dùng appearance primary",
  "  return (",
  '    <Button appearance="primary" onClick={onSave}>',
  "      Lưu thay đổi",
  "    </Button>",
  "  );",
  "}",
].join("\n");

function CodeBlockHeroDemo() {
  return (
    <CodeBlock
      className="w-full"
      filename="SaveBar.tsx"
      language="tsx"
      showLineNumbers
      highlightLines="6-8"
      code={SAVE_BAR_SOURCE}
    />
  );
}

const CODEBLOCK_HERO_CODE = `const SAVE_BAR_SOURCE = [
  'import { Button } from "@/components/ui";',
  "",
  "export function SaveBar({ onSave }: { onSave: () => void }) {",
  "  // Hành động chính dùng appearance primary",
  "  return (",
  '    <Button appearance="primary" onClick={onSave}>',
  "      Lưu thay đổi",
  "    </Button>",
  "  );",
  "}",
].join("\\n");

function CodeBlockHeroDemo() {
  return (
    <CodeBlock
      className="w-full"
      filename="SaveBar.tsx"
      language="tsx"
      showLineNumbers
      highlightLines="6-8"
      code={SAVE_BAR_SOURCE}
    />
  );
}`;

const DIFF_SOURCE = [
  " <Button",
  '-  appearance="outline"',
  '+  appearance="primary"',
  "+  icon={<Save20Regular />}",
  " >",
  "   Lưu",
  " </Button>",
].join("\n");

function DiffDemo() {
  return <CodeBlock className="w-full" title="Đổi sang nút chính" language="tsx" diff code={DIFF_SOURCE} />;
}

const DIFF_CODE = `const DIFF_SOURCE = [
  " <Button",
  '-  appearance="outline"',
  '+  appearance="primary"',
  "+  icon={<Save20Regular />}",
  " >",
  "   Lưu",
  " </Button>",
].join("\\n");

function DiffDemo() {
  return <CodeBlock className="w-full" title="Đổi sang nút chính" language="tsx" diff code={DIFF_SOURCE} />;
}`;

const TOKENS_SOURCE = [
  '[data-brand="sakura"] {',
  "  --brand-10: #240c16;",
  "  --brand-20: #391324;",
  "  --brand-30: #4c1930;",
  "  --brand-40: #61213f;",
  "  --brand-50: #79274d;",
  "  --brand-60: #912d5c;",
  "  --brand-70: #a72f69;",
  "  --brand-80: #c2347a;",
  "  --brand-90: #e24a92;",
  "  --brand-100: #fa65a8;",
  "  --brand-110: #fb7cb2;",
  "  --brand-120: #fd8ebc;",
  "}",
].join("\n");

function CollapseDemo() {
  return (
    <CodeBlock className="w-full" filename="tokens.css" language="css" showLineNumbers maxHeight={160} code={TOKENS_SOURCE} />
  );
}

const COLLAPSE_CODE = `const TOKENS_SOURCE = [
  '[data-brand="sakura"] {',
  "  --brand-10: #240c16;",
  "  --brand-20: #391324;",
  "  --brand-30: #4c1930;",
  "  --brand-40: #61213f;",
  "  --brand-50: #79274d;",
  "  --brand-60: #912d5c;",
  "  --brand-70: #a72f69;",
  "  --brand-80: #c2347a;",
  "  --brand-90: #e24a92;",
  "  --brand-100: #fa65a8;",
  "  --brand-110: #fb7cb2;",
  "  --brand-120: #fd8ebc;",
  "}",
].join("\\n");

function CollapseDemo() {
  return (
    <CodeBlock className="w-full" filename="tokens.css" language="css" showLineNumbers maxHeight={160} code={TOKENS_SOURCE} />
  );
}`;

const PROJECT_FILES = [
  {
    name: "App.tsx",
    code: [
      'import { YugenProvider, Button } from "@/components/ui";',
      "",
      "export default function App() {",
      "  return (",
      '    <YugenProvider applyToDocument theme="dark">',
      '      <Button appearance="primary">Xin chào</Button>',
      "    </YugenProvider>",
      "  );",
      "}",
    ].join("\n"),
  },
  {
    name: "index.css",
    code: ['@import "tailwindcss";', '@import "./styles/tokens.css";', "", "body {", "  background: var(--colorShellBackground);", "}"].join("\n"),
  },
  {
    name: "package.json",
    code: ["{", '  "name": "sakura-app",', '  "private": true,', '  "dependencies": { "react": "^18.3.1" }', "}"].join("\n"),
  },
];

function CodeTabsDemo() {
  return <CodeTabs className="w-full" appearance="dark" files={PROJECT_FILES} />;
}

const CODE_TABS_CODE = `const PROJECT_FILES = [
  {
    name: "App.tsx",
    code: [
      'import { YugenProvider, Button } from "@/components/ui";',
      "",
      "export default function App() {",
      "  return (",
      '    <YugenProvider applyToDocument theme="dark">',
      '      <Button appearance="primary">Xin chào</Button>',
      "    </YugenProvider>",
      "  );",
      "}",
    ].join("\\n"),
  },
  {
    name: "index.css",
    code: ['@import "tailwindcss";', '@import "./styles/tokens.css";', "", "body {", "  background: var(--colorShellBackground);", "}"].join("\\n"),
  },
  {
    name: "package.json",
    code: ["{", '  "name": "sakura-app",', '  "private": true,', '  "dependencies": { "react": "^18.3.1" }', "}"].join("\\n"),
  },
];

function CodeTabsDemo() {
  return <CodeTabs className="w-full" appearance="dark" files={PROJECT_FILES} />;
}`;

/* ================================================================ Docs */

const LABS_CHAT: Record<string, ComponentDoc> = {
  trace: {
    slug: "trace",
    category: "Yugen Labs",
    name: "Trace",
    lead: "Trace hiển thị tiến trình thực thi theo từng bước — agent AI gọi công cụ, CI pipeline, triển khai — để người dùng thấy hệ thống đang làm gì và vì sao.",
    description:
      "Mỗi TraceStep có trạng thái (pending, running, success, error, skipped, cancelled) kèm icon + chữ, thời lượng hoặc đồng hồ chạy trực tiếp, badge metadata, phần chi tiết mở rộng (log, JSON, CodeBlock) và bước con lồng nhau. Phần đầu tự tổng kết số bước theo trạng thái, tổng thời gian và có nút mở rộng / thu gọn tất cả. Thay đổi trạng thái được đọc qua live region polite.",
    importCode: `import { Trace, TraceStep, TraceLog } from "@/components/ui";`,
    hero: { title: "Agent đang chạy", code: AGENT_TRACE_CODE, render: () => <AgentTraceDemo /> },
    examples: [
      {
        title: "Sáu trạng thái",
        description: "Icon và màu token đi cùng nhãn chữ — không dùng màu làm tín hiệu duy nhất. Bước running tự chạy đồng hồ.",
        code: `<Trace hideHeader size="small" appearance="subtle" aria-label="Các trạng thái" className="w-full">
  <TraceStep status="pending" title="pending — Đang chờ" />
  <TraceStep status="running" title="running — Đang chạy" />
  <TraceStep status="success" title="success — Hoàn tất" duration={1240} />
  <TraceStep status="error" title="error — Lỗi" duration={320} />
  <TraceStep status="skipped" title="skipped — Bỏ qua" />
  <TraceStep status="cancelled" title="cancelled — Đã huỷ" />
</Trace>`,
        render: () => (
          <Trace hideHeader size="small" appearance="subtle" aria-label="Các trạng thái" className="w-full">
            <TraceStep status="pending" title="pending — Đang chờ" />
            <TraceStep status="running" title="running — Đang chạy" />
            <TraceStep status="success" title="success — Hoàn tất" duration={1240} />
            <TraceStep status="error" title="error — Lỗi" duration={320} />
            <TraceStep status="skipped" title="skipped — Bỏ qua" />
            <TraceStep status="cancelled" title="cancelled — Đã huỷ" />
          </Trace>
        ),
      },
      {
        title: "Pipeline có lỗi",
        description: "Bước lỗi tự mở phần chi tiết; các bước sau được đánh dấu bỏ qua / đã huỷ.",
        code: `<Trace title="Triển khai sakura-web" duration={48300} size="small" className="w-full">
  <TraceStep status="success" title="Cài phụ thuộc" duration={12400} />
  <TraceStep status="success" title="Kiểm thử" duration={31800} metadata={["212 test"]} />
  <TraceStep
    status="error"
    title="Kiểm tra bundle"
    duration={4100}
    description="Bundle vượt ngân sách 180 KB."
    details={<TraceLog intent="error">{"✖ dist/index.js  214.6 KB > 180 KB"}</TraceLog>}
  />
  <TraceStep status="skipped" title="Triển khai preview" />
  <TraceStep status="cancelled" title="Triển khai production" />
</Trace>`,
        render: () => (
          <Trace title="Triển khai sakura-web" duration={48300} size="small" className="w-full">
            <TraceStep status="success" title="Cài phụ thuộc" duration={12400} />
            <TraceStep status="success" title="Kiểm thử" duration={31800} metadata={["212 test"]} />
            <TraceStep
              status="error"
              title="Kiểm tra bundle"
              duration={4100}
              description="Bundle vượt ngân sách 180 KB."
              details={<TraceLog intent="error">{"✖ dist/index.js  214.6 KB > 180 KB"}</TraceLog>}
            />
            <TraceStep status="skipped" title="Triển khai preview" />
            <TraceStep status="cancelled" title="Triển khai production" />
          </Trace>
        ),
      },
      {
        title: "Gọi công cụ kèm JSON",
        description: "Slot details nhận bất kỳ nội dung nào — ở đây là CodeBlock JSON.",
        code: `<Trace title="Trả lời câu hỏi đổi trả" duration={3122} size="small" className="w-full">
  <TraceStep
    status="success"
    title="search_docs"
    duration={812}
    metadata={["tool", "3 kết quả"]}
    defaultExpanded
    details={
      <CodeBlock
        language="json"
        size="small"
        code={'{\\n  "query": "chính sách đổi trả",\\n  "top_k": 3\\n}'}
      />
    }
  />
  <TraceStep status="success" title="Tổng hợp câu trả lời" duration={2310} metadata={["1.2k token"]} />
</Trace>`,
        render: () => (
          <Trace title="Trả lời câu hỏi đổi trả" duration={3122} size="small" className="w-full">
            <TraceStep
              status="success"
              title="search_docs"
              duration={812}
              metadata={["tool", "3 kết quả"]}
              defaultExpanded
              details={
                <CodeBlock
                  language="json"
                  size="small"
                  code={'{\n  "query": "chính sách đổi trả",\n  "top_k": 3\n}'}
                />
              }
            />
            <TraceStep status="success" title="Tổng hợp câu trả lời" duration={2310} metadata={["1.2k token"]} />
          </Trace>
        ),
      },
    ],
    dos: [
      "Đặt tên bước bằng động từ ngắn, mô tả việc hệ thống đang làm (“Tra lịch”, “Gửi lời mời”).",
      "Mở sẵn chi tiết của bước lỗi và ghi rõ nguyên nhân + cách khắc phục.",
      "Cho người dùng hành động ngay trên phần đầu: Dừng, Chạy lại, Xem log đầy đủ.",
    ],
    donts: [
      "Không đổ toàn bộ log thô vào mô tả — để trong details, mặc định thu gọn.",
      "Không lồng quá 2 cấp; nhóm lại nếu agent có hàng chục lệnh gọi nhỏ.",
      "Không tắt announceChanges khi Trace là nơi duy nhất báo tiến độ.",
    ],
    props: [
      { name: "Trace.title / description", type: "ReactNode", description: "Tiêu đề lần chạy và chú thích phụ." },
      { name: "Trace.status", type: "TraceStatus", description: "Trạng thái tổng; mặc định suy ra từ các bước." },
      { name: "Trace.duration / startedAt", type: "number (ms) / number (Date.now())", description: "Tổng thời lượng khi xong; mốc bắt đầu để chạy đồng hồ khi đang chạy." },
      { name: "Trace.actions", type: "ReactNode", description: "Nút ở phần đầu (Chạy lại, Dừng…)." },
      { name: "Trace.appearance", type: `"outline" | "subtle"`, defaultValue: `"outline"`, description: "Có khung hay nhúng vào bề mặt khác." },
      { name: "Trace.size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Icon 16 / 20px, chữ caption1 / body1." },
      { name: "Trace.hideHeader / announceChanges", type: "boolean", defaultValue: "false / true", description: "Ẩn phần đầu; đọc thay đổi trạng thái qua live region." },
      { name: "TraceStep.status", type: `"pending" | "running" | "success" | "error" | "skipped" | "cancelled"`, defaultValue: `"pending"`, description: "Trạng thái bước." },
      { name: "TraceStep.title / description", type: "ReactNode", description: "Tên bước (nên là chuỗi để dùng cho thông báo) và mô tả." },
      { name: "TraceStep.duration / startedAt", type: "number", description: "Thời lượng (ms) khi xong; running tự ghi mốc nếu không truyền startedAt." },
      { name: "TraceStep.metadata", type: "string[] | ReactNode", description: "Badge thông tin: model, token, nhánh…" },
      { name: "TraceStep.details", type: "ReactNode", description: "Nội dung mở rộng (TraceLog, CodeBlock…)." },
      { name: "TraceStep.expanded / defaultExpanded / onExpandedChange", type: "boolean", description: "Điều khiển disclosure; mặc định mở khi running / error." },
      { name: "TraceStep.children", type: "TraceStep", description: "Bước con lồng nhau, có đường nối." },
      { name: "TraceLog.intent", type: `"neutral" | "error"`, defaultValue: `"neutral"`, description: "Khối log monospace, luôn LTR." },
    ],
  },

  questionnaire: {
    slug: "questionnaire",
    category: "Yugen Labs",
    name: "Questionnaire",
    lead: "Questionnaire dựng khảo sát hoặc form nhiều bước từ một mảng cấu hình — mỗi màn một câu như Typeform, hoặc tất cả trên một trang.",
    description:
      "Hỗ trợ single, multiple, rating (dùng Rating), scale (NPS 0–10), text, longText, yesNo; required và validate tuỳ chỉnh; thanh tiến độ, Quay lại / Tiếp, Enter để tiếp tục, phím số 1–9 để chọn, chuyển cảnh trượt (tắt khi giảm chuyển động), bước xem lại và màn hoàn tất. Hỗ trợ controlled value / onChange.",
    importCode: `import { Questionnaire, type Question } from "@/components/ui";`,
    hero: { title: "Khảo sát nhiều bước", code: SURVEY_CODE, render: () => <SurveyDemo /> },
    examples: [
      {
        title: "Chế độ list + validate",
        description: "mode=\"list\": mọi câu trên một trang, mỗi câu bọc trong Field; email kiểm tra bằng validate.",
        code: SIGNUP_CODE,
        render: () => <SignupDemo />,
      },
      {
        title: "Controlled & màn hoàn tất",
        description: "value / onChange để đồng bộ với state bên ngoài; completion là render-prop nhận answers và restart.",
        code: MOOD_CODE,
        render: () => <MoodDemo />,
      },
    ],
    dos: [
      "Giữ mỗi câu một ý; mô tả ngắn chỉ khi cần giải thích.",
      "Chỉ đánh dấu required khi thật sự cần — câu tuỳ chọn giúp người dùng đi nhanh.",
      "Bật bước xem lại cho khảo sát dài hoặc khi câu trả lời khó sửa sau khi gửi.",
    ],
    donts: [
      "Không dùng stepper cho form 2–3 ô đơn giản — dùng mode=\"list\" hoặc Field thường.",
      "Không quá 9 lựa chọn trong một câu (phím số chỉ tới 9, và khó đọc).",
      "Không dùng validate để chặn câu tuỳ chọn còn trống — validate chỉ chạy khi đã có câu trả lời.",
    ],
    props: [
      { name: "questions", type: "Question[]", description: "Cấu hình câu hỏi: { id, type, title, description?, required?, validate?, …theo loại }." },
      { name: "mode", type: `"stepper" | "list"`, defaultValue: `"stepper"`, description: "Mỗi màn một câu, hoặc tất cả trên một trang." },
      { name: "value / defaultValue", type: "QuestionnaireAnswers", description: "Record<id, string | string[] | number | boolean>." },
      { name: "onChange", type: "(answers, questionId) => void", description: "Gọi mỗi khi một câu trả lời đổi." },
      { name: "onSubmit", type: "(answers) => void | Promise<void>", description: "Gọi khi mọi câu hợp lệ; Promise → nút Gửi hiện “Đang gửi…”, lỗi → thông báo thử lại." },
      { name: "review", type: "boolean", defaultValue: "true", description: "Thêm bước xem lại trước khi gửi." },
      { name: "completion", type: "ReactNode | (answers, restart) => ReactNode", description: "Thay màn hoàn tất mặc định." },
      { name: "title / description / submitLabel", type: "ReactNode / ReactNode / string", defaultValue: `— / — / "Gửi"`, description: "Phần đầu và nhãn nút gửi." },
      { name: "appearance", type: `"outline" | "subtle"`, defaultValue: `"outline"`, description: "Có khung (Card) hay không." },
      { name: "SingleQuestion / MultipleQuestion", type: "{ options, min?, max? }", description: "Thẻ lựa chọn; multiple giới hạn bằng min / max." },
      { name: "RatingQuestion / ScaleQuestion", type: "{ max? } / { min?, max?, minLabel?, maxLabel? }", description: "Sao (Rating) hoặc thang điểm phân đoạn (mặc định 0–10)." },
      { name: "TextQuestion / LongTextQuestion", type: "{ placeholder?, inputType?, maxLength?, rows? }", description: "Input một dòng / Textarea có bộ đếm." },
      { name: "YesNoQuestion", type: "{ yesLabel?, noLabel? }", description: "Có / Không — phím Y, N (hoặc C, K)." },
    ],
  },

  messagescroller: {
    slug: "messagescroller",
    category: "Yugen Labs",
    name: "MessageScroller",
    lead: "MessageScroller là vùng cuộn hội thoại biết bám đáy khi có tin mới, báo “N tin nhắn mới” khi bạn đang đọc tin cũ và giữ nguyên vị trí khi tải thêm lịch sử.",
    description:
      "Đi kèm MessageBubble (tin đến / đi, avatar, giờ, trạng thái gửi, thử lại, cảm xúc, tự gộp nhóm tin liên tiếp cùng người gửi, nội dung stream), MessageReaction, MessageDaySeparator và TypingIndicator. Phím End nhảy tới tin mới nhất; tin đến được đọc qua live region polite — tin đang stream chỉ đọc khi đã nhận đủ.",
    importCode: `import {
  MessageScroller, MessageBubble, MessageReaction, MessageDaySeparator, TypingIndicator, ChatComposer,
} from "@/components/ui";`,
    hero: { title: "Chat với bot", code: MINI_CHAT_CODE, render: () => <MiniChatDemo /> },
    examples: [
      {
        title: "Trạng thái gửi & thử lại",
        description: "sending → sent → delivered → read; lỗi hiện thông báo + nút Thử lại.",
        code: DELIVERY_CODE,
        render: () => <DeliveryDemo />,
      },
      {
        title: "Nhóm tin & cảm xúc",
        description: "Tin liên tiếp cùng người gửi tự gộp: chỉ tin đầu có avatar, tên, giờ.",
        code: GROUPING_CODE,
        render: () => (
          <MessageScroller className="h-80 w-full rounded-xlarge border border-stroke-2">
            <MessageDaySeparator>Thứ Hai, 19/10</MessageDaySeparator>
            <MessageBubble author="Trần Lan" time="08:12">Sáng nay bản build mới đã lên staging.</MessageBubble>
            <MessageBubble author="Trần Lan" time="08:12">Mọi người kiểm tra giúp phần Trace nhé!</MessageBubble>
            <MessageBubble
              author="Trần Lan"
              time="08:13"
              reactions={
                <>
                  <MessageReaction emoji="👍" count={3} label="Thích" selected />
                  <MessageReaction emoji="🌸" count={1} label="Hoa anh đào" />
                </>
              }
            >
              Có gì cứ nhắn mình.
            </MessageBubble>
            <MessageBubble side="outgoing" author="Bạn" time="08:20">
              Đã xem, chạy mượt lắm 🎉
            </MessageBubble>
          </MessageScroller>
        ),
      },
      {
        title: "Tải tin cũ",
        description: "Cuộn lên đầu để gọi onLoadOlder; vị trí đọc được giữ nguyên khi tin cũ chèn vào.",
        code: LOAD_OLDER_CODE,
        render: () => <LoadOlderDemo />,
      },
      {
        title: "Tin mới khi đang đọc tin cũ",
        description: "Cuộn lên rồi bấm “Nhận tin mới”: danh sách không tự nhảy, nút nổi đếm số tin mới.",
        code: NEW_MESSAGES_CODE,
        render: () => <NewMessagesDemo />,
      },
    ],
    dos: [
      "Đặt key ổn định (id tin nhắn) cho mỗi phần tử để phát hiện tin mới / tin cũ chính xác.",
      "Luôn kéo xuống đáy khi chính người dùng gửi tin (component tự làm với side=\"outgoing\").",
      "Cho tin lỗi một đường thử lại rõ ràng ngay tại tin đó.",
    ],
    donts: [
      "Không tự cuộn xuống khi người dùng đang đọc tin cũ — để nút “tin nhắn mới” làm việc đó.",
      "Không đặt aria-live trên cả danh sách khi stream chữ — trình đọc màn hình sẽ đọc từng mẩu.",
      "Không render HTML/markdown chưa làm sạch trong bong bóng — MessageBubble hiển thị văn bản thuần.",
    ],
    props: [
      { name: "MessageScroller.onLoadOlder", type: "() => void | Promise<void>", description: "Gọi khi cuộn chạm đầu; Promise chặn gọi lặp." },
      { name: "MessageScroller.hasOlder / loadingOlder", type: "boolean", description: "Còn tin cũ không; hiện spinner ở đầu danh sách." },
      { name: "MessageScroller.label", type: "string", defaultValue: `"Cuộc trò chuyện"`, description: "Tên truy cập của vùng log." },
      { name: "MessageScroller.bottomThreshold", type: "number", defaultValue: "48", description: "Khoảng (px) tới đáy vẫn coi là “đang ở cuối”." },
      { name: "MessageScroller.announceIncoming", type: "boolean", defaultValue: "true", description: "Đọc tin đến qua live region polite." },
      { name: "MessageBubble.side", type: `"incoming" | "outgoing"`, defaultValue: `"incoming"`, description: "Tin của người khác / của mình." },
      { name: "MessageBubble.author / avatar / avatarSrc", type: "string / ReactNode / string", description: "Người gửi; avatar mặc định là Avatar theo tên (tin đến)." },
      { name: "MessageBubble.time / dateTime", type: "string", description: "Giờ hiển thị và giá trị ISO cho <time>." },
      { name: "MessageBubble.status / onRetry / errorMessage", type: `"sending" | "sent" | "delivered" | "read" | "error"`, description: "Trạng thái gửi; error hiện nút Thử lại." },
      { name: "MessageBubble.groupPosition", type: `"single" | "first" | "middle" | "last"`, description: "Ghi đè vị trí trong nhóm (mặc định tự tính)." },
      { name: "MessageBubble.reactions", type: "ReactNode", description: "Slot cảm xúc (MessageReaction)." },
      { name: "MessageBubble.streaming", type: "boolean", description: "Đang stream: con trỏ nhấp nháy, aria-busy, chưa đọc qua live region." },
      { name: "MessageBubble.appearance", type: `"bubble" | "plain"`, defaultValue: `"bubble"`, description: "plain: không nền, rộng hết — cho câu trả lời dài của AI." },
      { name: "MessageReaction", type: "{ emoji, count?, selected?, label? }", description: "Nút cảm xúc (aria-pressed)." },
      { name: "TypingIndicator", type: "{ author?, avatar?, label? }", description: "Ba chấm (tĩnh khi giảm chuyển động), role=status." },
    ],
  },

  chatcomposer: {
    slug: "chatcomposer",
    category: "Yugen Labs",
    name: "ChatComposer",
    lead: "ChatComposer là ô soạn tin tự giãn theo nội dung: Enter để gửi, Shift+Enter để xuống dòng, nút gửi chỉ bật khi có nội dung.",
    description:
      "Có slot actions cho đính kèm / emoji / chọn model, bộ đếm ký tự, gợi ý phím, trạng thái busy với nút Dừng cho phản hồi AI. Không gửi khi bộ gõ tiếng Việt (Telex, VNI) hoặc IME còn đang ghép chữ. ref trỏ vào textarea.",
    importCode: `import { ChatComposer } from "@/components/ui";`,
    hero: { title: "ChatComposer", code: COMPOSER_CODE, render: () => <ComposerDemo /> },
    examples: [
      {
        title: "Đang trả lời & nút Dừng",
        description: "busy chặn gửi; có onStop thì nút gửi thành nút Dừng.",
        code: STOP_CODE,
        render: () => <StopDemo />,
      },
      {
        title: "Gợi ý phím",
        description: "showHint hiện “Enter để gửi · Shift+Enter xuống dòng” (ẩn trên màn hẹp).",
        code: `<ChatComposer className="w-full" showHint onSend={() => {}} />`,
        render: () => <ChatComposer className="w-full" showHint onSend={() => {}} />,
      },
      {
        title: "Disabled",
        description: "Giải thích lý do ngay trong placeholder hoặc bên cạnh.",
        code: `<ChatComposer className="w-full" disabled placeholder="Bạn chỉ có quyền xem kênh này" onSend={() => {}} />`,
        render: () => <ChatComposer className="w-full" disabled placeholder="Bạn chỉ có quyền xem kênh này" onSend={() => {}} />,
      },
    ],
    dos: [
      "Đưa focus lại ô soạn sau khi gửi (component tự làm) để gõ tiếp liền mạch.",
      "Dùng busy + onStop khi chờ AI để người dùng chủ động dừng câu trả lời dài.",
    ],
    donts: [
      "Không bắt Ctrl+Enter mới gửi trong chat thông thường — Enter là kỳ vọng mặc định.",
      "Không xoá nội dung khi gửi thất bại — giữ lại để người dùng thử lại.",
    ],
    props: [
      { name: "onSend", type: "(text: string) => void", description: "Nhận nội dung đã trim; ô soạn tự xoá." },
      { name: "value / defaultValue / onValueChange", type: "string", description: "Controlled hoặc uncontrolled." },
      { name: "placeholder / label", type: "string", defaultValue: `"Nhập tin nhắn…" / "Tin nhắn"`, description: "Placeholder và tên truy cập của textarea." },
      { name: "maxLength / showCount", type: "number / boolean", description: "Giới hạn ký tự và bộ đếm (đổi màu khi gần hết)." },
      { name: "maxRows", type: "number", defaultValue: "6", description: "Số dòng tối đa trước khi cuộn." },
      { name: "actions", type: "ReactNode", description: "Nút ở đầu thanh công cụ." },
      { name: "busy / onStop", type: "boolean / () => void", description: "Chặn gửi khi đang chờ; nút Dừng." },
      { name: "showHint / sendLabel / disabled", type: "boolean / string / boolean", defaultValue: `false / "Gửi" / false`, description: "Gợi ý phím, nhãn nút gửi, vô hiệu hoá." },
      { name: "textareaProps", type: "TextareaHTMLAttributes", description: "Thuộc tính thêm cho textarea." },
    ],
  },

  codeblock: {
    slug: "codeblock",
    category: "Yugen Labs",
    name: "CodeBlock",
    lead: "CodeBlock hiển thị code với tô màu cú pháp gọn nhẹ tự viết (không Prism / Shiki), số dòng, dòng nhấn mạnh, diff, xuống dòng và nút sao chép.",
    description:
      "Hỗ trợ tsx, ts, jsx, js, css, html, bash, json, md. Phần đầu có tên tệp + nhãn ngôn ngữ; maxHeight thu gọn khối dài với “Xem thêm / Thu gọn”; appearance auto theo theme hoặc dark. Luôn dir=\"ltr\". Kèm CodeTabs (nhiều tệp) và PackageManagerTabs (npm / pnpm / yarn / bun — nhớ lựa chọn và đồng bộ giữa các khối).",
    importCode: `import { CodeBlock, CodeTabs, PackageManagerTabs } from "@/components/ui";`,
    hero: { title: "CodeBlock", code: CODEBLOCK_HERO_CODE, render: () => <CodeBlockHeroDemo /> },
    examples: [
      {
        title: "Diff",
        description: "Dòng + / - tô xanh / đỏ kèm ký hiệu; Sao chép lấy phiên bản sau thay đổi.",
        code: DIFF_CODE,
        render: () => <DiffDemo />,
      },
      {
        title: "Thu gọn khối dài",
        description: "maxHeight cắt khối và thêm nút Xem thêm / Thu gọn (aria-expanded).",
        code: COLLAPSE_CODE,
        render: () => <CollapseDemo />,
      },
      {
        title: "CodeTabs",
        description: "Nhiều tệp trong một khối; ngôn ngữ đoán theo đuôi tệp. appearance=\"dark\" luôn nền tối.",
        code: CODE_TABS_CODE,
        render: () => <CodeTabsDemo />,
      },
      {
        title: "PackageManagerTabs",
        description: "Chọn trình quản lý ở một khối — mọi khối khác trên trang đổi theo và được nhớ cho lần sau.",
        code: `<div className="flex w-full flex-col gap-S">
  <PackageManagerTabs packages={["@fluentui/react-icons", "class-variance-authority"]} />
  <PackageManagerTabs packages="tailwindcss @tailwindcss/vite" dev />
</div>`,
        render: () => (
          <div className="flex w-full flex-col gap-S">
            <PackageManagerTabs packages={["@fluentui/react-icons", "class-variance-authority"]} />
            <PackageManagerTabs packages="tailwindcss @tailwindcss/vite" dev />
          </div>
        ),
      },
    ],
    dos: [
      "Ghi filename khi đoạn code thuộc một tệp cụ thể — người đọc biết dán vào đâu.",
      "Dùng highlightLines để chỉ đúng dòng đang được giải thích.",
      "Dùng diff khi hướng dẫn sửa code có sẵn thay vì in lại cả tệp.",
    ],
    donts: [
      "Không dùng CodeBlock cho đoạn code ngắn trong câu — dùng <code> inline.",
      "Không đặt maxHeight quá thấp khiến người đọc phải mở mọi khối.",
      "Không kỳ vọng tô màu đầy đủ như IDE — tokenizer cố ý gọn nhẹ.",
    ],
    props: [
      { name: "code", type: "string", description: "Nội dung code." },
      { name: "language", type: `"tsx" | "ts" | "jsx" | "js" | "css" | "html" | "bash" | "json" | "md" | "text"`, defaultValue: `"tsx"`, description: "Bộ tô màu cú pháp." },
      { name: "title / filename", type: "ReactNode / string", description: "Hiện phần đầu với nhãn ngôn ngữ, nút xuống dòng, nút sao chép." },
      { name: "showLineNumbers", type: "boolean", defaultValue: "false", description: "Cột số dòng." },
      { name: "highlightLines", type: `string | number[]`, description: "Dòng nhấn mạnh: \"2,4-6\"." },
      { name: "diff", type: "boolean", defaultValue: "false", description: "Dòng bắt đầu bằng + / - được tô màu." },
      { name: "wrap / defaultWrap / onWrapChange", type: "boolean", defaultValue: "false", description: "Xuống dòng thay vì cuộn ngang." },
      { name: "maxHeight", type: "number | string", description: "Thu gọn khi cao hơn; nút Xem thêm / Thu gọn." },
      { name: "appearance", type: `"auto" | "dark"`, defaultValue: `"auto"`, description: "Theo theme hoặc luôn tối (giữ nguyên ở tương phản cao)." },
      { name: "size / copyable / bare", type: `"small" | "medium" / boolean / boolean`, defaultValue: `"medium" / true / false`, description: "Cỡ chữ; nút sao chép; bỏ khung để lồng vào bề mặt khác." },
      { name: "CodeTabs.files", type: "{ name, code, language?, highlightLines? }[]", description: "Danh sách tệp; value / defaultValue / onValueChange chọn tệp." },
      { name: "PackageManagerTabs.packages", type: "string | string[]", description: "Gói cần cài, hoặc lệnh khi command=\"dlx\"." },
      { name: "PackageManagerTabs.dev / command / managers", type: `boolean / "install" | "dlx" / PackageManager[]`, description: "devDependency; npx / pnpm dlx / yarn dlx / bunx; giới hạn danh sách." },
    ],
  },
};

export const docs: ComponentDoc[] = Object.values(LABS_CHAT);
