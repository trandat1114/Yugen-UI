import { useEffect, useRef, useState } from "react";
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
  useNotifications,
  useTour,
  type CitationSource,
  type NotificationItem,
  type TourStep,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import { declarationsOf } from "../setup";
import RAW from "./labs-ai.tsx?raw";

/* ================================================================ StreamingMarkdown */

const ANSWER = [
  "## Đổi brand trong Yugen UI",
  "",
  "Bạn chỉ cần đặt **`data-brand`** trên `<html>` hoặc trên *YugenProvider*:",
  "",
  "1. Chọn brand có sẵn: `sakura`, `web`, `teams`.",
  "2. Hoặc tạo brand riêng ở **Theme Designer**:",
  "   - chọn màu chủ đạo",
  "   - copy khối CSS vào `tokens.css`",
  "",
  "```tsx",
  '<YugenProvider applyToDocument brand="web">',
  "  <App />",
  "</YugenProvider>",
  "```",
  "",
  "| Brand | Màu chủ đạo | Tương phản |",
  "| :-- | :-- | --: |",
  "| Sakura | #C2347A | 5.16:1 |",
  "| Web | #0F6CBD | 5.33:1 |",
  "",
  "> Mẹo: dùng `?brand=web` trên URL docs để chia sẻ đúng giao diện.",
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
        Phát lại
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
  "## Đổi brand trong Yugen UI",
  "",
  "Bạn chỉ cần đặt **\`data-brand\`** trên \`<html>\` hoặc trên *YugenProvider*:",
  "",
  "1. Chọn brand có sẵn: \`sakura\`, \`web\`, \`teams\`.",
  "2. Hoặc tạo brand riêng ở **Theme Designer**:",
  "   - chọn màu chủ đạo",
  "   - copy khối CSS vào \`tokens.css\`",
  "",
  "\`\`\`tsx",
  '<YugenProvider applyToDocument brand="web">',
  "  <App />",
  "</YugenProvider>",
  "\`\`\`",
  "",
  "| Brand | Màu chủ đạo | Tương phản |",
  "| :-- | :-- | --: |",
  "| Sakura | #C2347A | 5.16:1 |",
  "| Web | #0F6CBD | 5.33:1 |",
  "",
  "> Mẹo: dùng \`?brand=web\` trên URL docs để chia sẻ đúng giao diện.",
].join("\\n");

${STREAM_HOOK_CODE}

function StreamingAnswerDemo() {
  const { text, streaming, replay } = useStreamedText(ANSWER);

  return (
    <div className="flex w-full max-w-2xl flex-col gap-3">
      <StreamingMarkdown streaming={streaming}>{text}</StreamingMarkdown>
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Phát lại
      </Button>
    </div>
  );
}`;

const TASKS_MD = "### Việc cần làm\n\n- [x] Thêm token màu\n- [x] Kiểm tra tương phản\n- [ ] Viết tài liệu\n\n---\n\nLink không an toàn như [bấm vào đây](javascript:alert(1)) chỉ còn là chữ.";

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
  { title: "Design.md — Quy tắc màu sắc", domain: "yugen-ui", snippet: "Brand chỉ cho CTA, trạng thái chọn, focus và link." },
];

const CITED_MD = "Màu brand chỉ nên dùng cho hành động chính và trạng thái chọn[1][3]. Chữ cần tương phản tối thiểu **4.5:1**[2].";

/* ================================================================ Reasoning */

const THOUGHT = [
  "Người dùng hỏi về **tương phản** của Sakura trên nền trắng.",
  "",
  "- Brand80 là `#C2347A` → tính độ sáng tương đối.",
  "- So với trắng: khoảng 5.16:1, vượt ngưỡng 4.5:1 của WCAG AA.",
  "- Kết luận: dùng được cho chữ thường.",
].join("\n");

function ReasoningDemo() {
  const { text, streaming, replay } = useStreamedText(THOUGHT, 4, 50);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Reasoning streaming={streaming}>{text}</Reasoning>
      {!streaming && <StreamingMarkdown>{"Có — Sakura đạt **5.16:1** trên nền trắng, đủ cho chữ thường (AA)."}</StreamingMarkdown>}
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Hỏi lại
      </Button>
    </div>
  );
}

const REASONING_CODE = `const THOUGHT = [
  "Người dùng hỏi về **tương phản** của Sakura trên nền trắng.",
  "",
  "- Brand80 là \`#C2347A\` → tính độ sáng tương đối.",
  "- So với trắng: khoảng 5.16:1, vượt ngưỡng 4.5:1 của WCAG AA.",
  "- Kết luận: dùng được cho chữ thường.",
].join("\\n");

// useStreamedText: xem ví dụ của StreamingMarkdown.
function ReasoningDemo() {
  const { text, streaming, replay } = useStreamedText(THOUGHT, 4, 50);

  return (
    <div className="flex w-full max-w-xl flex-col gap-3">
      <Reasoning streaming={streaming}>{text}</Reasoning>
      {!streaming && <StreamingMarkdown>{"Có — Sakura đạt **5.16:1** trên nền trắng, đủ cho chữ thường (AA)."}</StreamingMarkdown>}
      <Button className="self-start" disabled={streaming} onClick={replay}>
        Hỏi lại
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
          setSent((list) => [`${text || "(chỉ tệp)"} · ${files.length} tệp · ${model}`, ...list].slice(0, 3));
          setStreaming(true);
          timer.current = window.setTimeout(() => setStreaming(false), 2500);
        }}
        toolbar={
          <Dropdown size="small" appearance="filled-lighter" aria-label="Chọn model" value={model} onValueChange={setModel} className="min-w-32">
            <DropdownOption value="sakura-1">Sakura-1</DropdownOption>
            <DropdownOption value="sakura-1-mini">Sakura-1 mini</DropdownOption>
          </Dropdown>
        }
      />
      {sent.map((line, i) => (
        <p key={i} className="text-caption1 text-foreground-3">
          Đã gửi: {line}
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
          setSent((list) => [\`\${text || "(chỉ tệp)"} · \${files.length} tệp · \${model}\`, ...list].slice(0, 3));
          setStreaming(true);
          timer.current = window.setTimeout(() => setStreaming(false), 2500);
        }}
        toolbar={
          <Dropdown size="small" appearance="filled-lighter" aria-label="Chọn model" value={model} onValueChange={setModel} className="min-w-32">
            <DropdownOption value="sakura-1">Sakura-1</DropdownOption>
            <DropdownOption value="sakura-1-mini">Sakura-1 mini</DropdownOption>
          </Dropdown>
        }
      />
      {sent.map((line, i) => (
        <p key={i} className="text-caption1 text-foreground-3">
          Đã gửi: {line}
        </p>
      ))}
    </div>
  );
}`;

/* ================================================================ Tour */

const TOUR_STEPS: TourStep[] = [
  { target: "#tour-search", title: "Tìm mọi thứ", content: "Gõ tên tài liệu, người hoặc lệnh — kết quả hiện ngay khi bạn gõ." },
  { target: "#tour-board", title: "Bảng công việc", content: "Kéo thả thẻ giữa các cột để cập nhật tiến độ.", placement: "bottom" },
  { target: "#tour-settings", title: "Cài đặt", content: "Đổi theme, brand và hướng chữ cho cả nhóm.", placement: "start" },
  { title: "Sẵn sàng!", content: "Bạn có thể mở lại hướng dẫn bất cứ lúc nào từ menu Trợ giúp." },
];

function StartTourButton() {
  const tour = useTour();
  return (
    <Button appearance="primary" icon={<Sparkle16Regular />} onClick={() => tour.start()}>
      Bắt đầu hướng dẫn
    </Button>
  );
}

function TourDemo() {
  return (
    <Tour steps={TOUR_STEPS}>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex items-center gap-2 rounded-xlarge border border-stroke-2 bg-background-2 p-2">
          <Button id="tour-search" appearance="subtle" icon={<Search20Regular />}>
            Tìm kiếm
          </Button>
          <Button id="tour-board" appearance="subtle" icon={<Board20Regular />}>
            Bảng
          </Button>
          <Button id="tour-settings" appearance="subtle" icon={<Settings20Regular />} aria-label="Cài đặt" className="ms-auto" />
        </div>
        <StartTourButton />
      </div>
    </Tour>
  );
}

const TOUR_CODE = `const TOUR_STEPS: TourStep[] = [
  { target: "#tour-search", title: "Tìm mọi thứ", content: "Gõ tên tài liệu, người hoặc lệnh — kết quả hiện ngay khi bạn gõ." },
  { target: "#tour-board", title: "Bảng công việc", content: "Kéo thả thẻ giữa các cột để cập nhật tiến độ.", placement: "bottom" },
  { target: "#tour-settings", title: "Cài đặt", content: "Đổi theme, brand và hướng chữ cho cả nhóm.", placement: "start" },
  { title: "Sẵn sàng!", content: "Bạn có thể mở lại hướng dẫn bất cứ lúc nào từ menu Trợ giúp." },
];

function StartTourButton() {
  const tour = useTour();
  return (
    <Button appearance="primary" icon={<Sparkle16Regular />} onClick={() => tour.start()}>
      Bắt đầu hướng dẫn
    </Button>
  );
}

function TourDemo() {
  return (
    <Tour steps={TOUR_STEPS}>
      <div className="flex w-full max-w-xl flex-col gap-4">
        <div className="flex items-center gap-2 rounded-xlarge border border-stroke-2 bg-background-2 p-2">
          <Button id="tour-search" appearance="subtle" icon={<Search20Regular />}>
            Tìm kiếm
          </Button>
          <Button id="tour-board" appearance="subtle" icon={<Board20Regular />}>
            Bảng
          </Button>
          <Button id="tour-settings" appearance="subtle" icon={<Settings20Regular />} aria-label="Cài đặt" className="ms-auto" />
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
        Bảng điều khiển của bạn
      </div>
      <Button onClick={() => setOpen(true)}>Xem điểm mới</Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        appearance="brand"
        steps={[{ target: anchor, title: "Bảng điều khiển mới", content: "Số liệu giờ cập nhật theo thời gian thực.", placement: "top" }]}
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
        Bảng điều khiển của bạn
      </div>
      <Button onClick={() => setOpen(true)}>Xem điểm mới</Button>
      <Tour
        open={open}
        onOpenChange={setOpen}
        appearance="brand"
        steps={[{ target: anchor, title: "Bảng điều khiển mới", content: "Số liệu giờ cập nhật theo thời gian thực.", placement: "top" }]}
      />
    </div>
  );
}`;

/* ================================================================ NotificationCenter */

function seedNotifications(now: number): NotificationItem[] {
  return [
    { id: "a", title: "Trần Lan đã nhắc bạn", body: "Xem giúp phần màu Sakura trong bản thiết kế mới nhé.", author: "Trần Lan", time: now - 4 * 60_000 },
    { id: "b", title: "Bản build #212 thành công", body: "Đã triển khai lên môi trường preview.", intent: "success", time: now - 2 * 3_600_000 },
    { id: "c", title: "Dung lượng sắp đầy", body: "Đã dùng 92% bộ nhớ của nhóm.", intent: "warning", time: now - 27 * 3_600_000, read: true },
    { id: "d", title: "Minh đã chia sẻ “Kế hoạch Q4”", author: "Lê Minh", time: now - 3 * 86_400_000, read: true },
  ];
}

function NotificationDemo() {
  const store = useNotifications(() => seedNotifications(Date.now()));
  const count = useRef(0);

  function simulate() {
    count.current += 1;
    store.add({ title: `Bình luận mới #${count.current}`, body: "Hà: Mình đồng ý với phương án 2.", author: "Phạm Hà" });
  }

  return (
    <div className="flex items-center gap-3">
      <NotificationCenter {...store.bind} footer={<Button appearance="transparent">Xem tất cả</Button>} />
      <Button onClick={simulate}>Giả lập thông báo mới</Button>
    </div>
  );
}

const NOTIFICATION_CODE = `function seedNotifications(now: number): NotificationItem[] {
  return [
    { id: "a", title: "Trần Lan đã nhắc bạn", body: "Xem giúp phần màu Sakura trong bản thiết kế mới nhé.", author: "Trần Lan", time: now - 4 * 60_000 },
    { id: "b", title: "Bản build #212 thành công", body: "Đã triển khai lên môi trường preview.", intent: "success", time: now - 2 * 3_600_000 },
    { id: "c", title: "Dung lượng sắp đầy", body: "Đã dùng 92% bộ nhớ của nhóm.", intent: "warning", time: now - 27 * 3_600_000, read: true },
    { id: "d", title: "Minh đã chia sẻ “Kế hoạch Q4”", author: "Lê Minh", time: now - 3 * 86_400_000, read: true },
  ];
}

function NotificationDemo() {
  const store = useNotifications(() => seedNotifications(Date.now()));
  const count = useRef(0);

  function simulate() {
    count.current += 1;
    store.add({ title: \`Bình luận mới #\${count.current}\`, body: "Hà: Mình đồng ý với phương án 2.", author: "Phạm Hà" });
  }

  return (
    <div className="flex items-center gap-3">
      <NotificationCenter {...store.bind} footer={<Button appearance="transparent">Xem tất cả</Button>} />
      <Button onClick={simulate}>Giả lập thông báo mới</Button>
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
        error={failed ? "Mất kết nối tới máy chủ." : undefined}
        onRetry={() => setFailed(false)}
      />
      <Button onClick={() => setLoading((v) => !v)}>{loading ? "Tải xong" : "Tải lại"}</Button>
      <Button appearance="subtle" onClick={() => setFailed(true)}>
        Giả lập lỗi
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
        error={failed ? "Mất kết nối tới máy chủ." : undefined}
        onRetry={() => setFailed(false)}
      />
      <Button onClick={() => setLoading((v) => !v)}>{loading ? "Tải xong" : "Tải lại"}</Button>
      <Button appearance="subtle" onClick={() => setFailed(true)}>
        Giả lập lỗi
      </Button>
    </div>
  );
}`;

/* ================================================================ Docs */

export const docs: ComponentDoc[] = [
  {
    slug: "streamingmarkdown",
    category: "Yugen Labs",
    name: "StreamingMarkdown",
    lead: "StreamingMarkdown hiển thị câu trả lời Markdown của AI ngay khi từng token về — không nháy ký hiệu thô, không chèn HTML, và không render lại cả bài mỗi lần có chữ mới.",
    description:
      "Bộ phân tích tự viết (parseMarkdown, xuất riêng để test) dựng React element trực tiếp: đoạn văn, heading (lệch cấp qua headingOffset — không bao giờ sinh h1), đậm / nghiêng / gạch / code inline, link chỉ http · https · mailto (mở tab mới, rel noreferrer noopener), danh sách lồng và việc cần làm, trích dẫn, bảng GFM có căn lề, đường kẻ và khối code dùng CodeBlock. Khi streaming: fence chưa đóng là khối code đang viết, ** / link / [1] dở dang không lộ ký hiệu, có con trỏ (đứng yên khi giảm chuyển động) và aria-busy; các khối đã ổn định giữ nguyên object nên React.memo bỏ qua render lại.",
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
  {"**Ghi chú:** token \`colorBrandBackground\` đổi theo \`data-brand\`.\\n\\n- Light: Brand80\\n- Dark: Brand70"}
</StreamingMarkdown>`,
        render: () => (
          <StreamingMarkdown size="small" className="w-full max-w-md">
            {"**Ghi chú:** token `colorBrandBackground` đổi theo `data-brand`.\n\n- Light: Brand80\n- Dark: Brand70"}
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
      { name: "citations", type: "CitationSource[]", description: "Nguồn cho [1] / [^1] → chip Citation." },
      { name: "breaks", type: "boolean", defaultValue: "true", description: "Xuống dòng đơn thành <br>." },
      { name: "caret", type: "boolean", defaultValue: "true", description: "Con trỏ khi streaming." },
      { name: "size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "caption1 hoặc body1." },
      { name: "announceWhenDone", type: "boolean", defaultValue: "false", description: "Đọc văn bản thuần qua live region khi stream xong." },
      { name: "parseMarkdown(text, { streaming })", type: "MdRoot", description: "Bộ phân tích thuần; kèm sanitizeHref, markdownToPlainText." },
    ],
  },
  {
    slug: "citation",
    category: "Yugen Labs",
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
    Màu brand chỉ nên dùng cho hành động chính và trạng thái chọn
    <Citation index={1} source={SOURCES[0]} />
    <Citation index={3} source={SOURCES[2]} />. Chữ cần tương phản tối thiểu 4.5:1
    <Citation index={2} source={SOURCES[1]} />.
  </p>
  <CitationList sources={SOURCES} />
</div>`,
      render: () => (
        <div className="flex w-full max-w-xl flex-col gap-4">
          <p className="text-body1 text-foreground-1">
            Màu brand chỉ nên dùng cho hành động chính và trạng thái chọn
            <Citation index={1} source={SOURCES[0]} />
            <Citation index={3} source={SOURCES[2]} />. Chữ cần tương phản tối thiểu 4.5:1
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
      { name: "CitationList.title", type: "ReactNode", defaultValue: `"Nguồn"`, description: "Tiêu đề kèm số lượng." },
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
  {"So sánh 3 phương án lưu token: CSS biến, JSON, TS. Chọn **CSS biến** vì đổi theme không cần build lại."}
</Reasoning>`,
        render: () => (
          <Reasoning duration={12400} className="w-full max-w-xl">
            {"So sánh 3 phương án lưu token: CSS biến, JSON, TS. Chọn **CSS biến** vì đổi theme không cần build lại."}
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
        code: `<PromptInput className="w-full max-w-xl" disabled placeholder="Bạn đã dùng hết lượt hôm nay" onSubmit={() => {}} />`,
        render: () => <PromptInput className="w-full max-w-xl" disabled placeholder="Bạn đã dùng hết lượt hôm nay" onSubmit={() => {}} />,
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
        description: "Khung xương chỉ hiện khi chờ > 300ms; lỗi luôn có nút Thử lại.",
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
      { name: "mode / breakpoint", type: `"auto" | "popover" | "sheet" / number`, defaultValue: `"auto" / 768`, description: "Popover hay bottom sheet." },
      { name: "title / footer / announce", type: "string / ReactNode / boolean", defaultValue: `"Thông báo" / — / true`, description: "Tiêu đề, chân bảng, đọc thông báo mới." },
      { name: "useNotifications(initial)", type: "{ items, unreadCount, add, markRead, markAllRead, dismiss, clear, bind }", description: "Kho nhỏ cho demo; trải bind vào NotificationCenter." },
    ],
  },
];
