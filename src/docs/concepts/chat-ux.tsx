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
import { DocSection, DoDont, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    <div className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-L py-S text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-L py-M font-semibold text-foreground-1" : "px-L py-M text-foreground-2"}>
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
  return <div className="flex flex-wrap items-start justify-center gap-L rounded-2xlarge border border-stroke-2 bg-background-1 p-XL">{children}</div>;
}

/* ---------- Demo: cấu trúc ---------- */

function AnatomyDemo() {
  return (
    <div className="flex h-96 w-full max-w-md flex-col overflow-hidden rounded-xlarge border border-stroke-2 bg-background-2">
      <MessageScroller className="flex-1" label="Ví dụ hội thoại">
        <MessageDaySeparator>Hôm nay</MessageDaySeparator>
        <MessageBubble author="Sakura Bot" time="09:41">
          Chào bạn! Mình có thể giúp gì?
        </MessageBubble>
        <MessageBubble side="outgoing" author="Bạn" time="09:42" status="read">
          Đổi brand sang màu xanh thế nào?
        </MessageBubble>
        <TypingIndicator author="Sakura Bot" />
      </MessageScroller>
      <ChatComposer className="m-S" onSend={() => {}} />
    </div>
  );
}

/* ---------- Demo: stream ---------- */

const STREAM_TEXT =
  "Đặt data-brand=\"web\" trên <html> hoặc trên YugenProvider. Mọi utility brand (bg-brand-background, text-link…) đổi theo ngay, không cần build lại.";

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
    <div className="flex w-full max-w-md flex-col gap-S">
      <MessageScroller className="h-64 rounded-xlarge border border-stroke-2" label="Ví dụ stream">
        <MessageBubble side="outgoing" author="Bạn" time="10:15">
          Làm sao đổi brand?
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
        className="self-start rounded-medium px-S py-XS text-body1 font-semibold text-link hover:bg-subtle-hover hover:text-link-hover"
      >
        {phase === "idle" ? "Gửi câu hỏi" : "Chạy lại"}
      </button>
    </div>
  );
}

/* ---------- Demo: lỗi ---------- */

function RetryDemo() {
  const [status, setStatus] = React.useState<MessageStatus>("error");
  return (
    <MessageScroller className="h-56 w-full max-w-md rounded-xlarge border border-stroke-2" label="Ví dụ gửi lỗi">
      <MessageBubble side="outgoing" author="Bạn" time="11:20" status="read">
        Gửi mình bảng giá mới nhé.
      </MessageBubble>
      <MessageBubble
        side="outgoing"
        author="Bạn"
        time="11:21"
        status={status}
        errorMessage="Không gửi được — mất kết nối."
        onRetry={() => {
          setStatus("sending");
          window.setTimeout(() => setStatus("sent"), 900);
        }}
      >
        Cần trước thứ Sáu.
      </MessageBubble>
    </MessageScroller>
  );
}

/* ---------- Demo: Trace trong câu trả lời ---------- */

function TransparencyDemo() {
  return (
    <MessageScroller className="h-104 w-full max-w-xl rounded-xlarge border border-stroke-2" label="Ví dụ trợ lý minh bạch">
      <MessageBubble side="outgoing" author="Bạn" time="14:02">
        Tóm tắt giúp mình 3 email mới nhất của khách hàng.
      </MessageBubble>
      <MessageBubble author="Sakura Bot" time="14:02" appearance="plain">
        <Trace size="small" title="Đã hoàn tất 3 bước" duration={4210}>
          <TraceStep status="success" title="Tìm email từ khách hàng" duration={820} metadata={["mail.search"]} />
          <TraceStep status="success" title="Đọc 3 email" duration={1140} metadata={["mail.read", "song song"]} />
          <TraceStep status="success" title="Viết tóm tắt" duration={2250} metadata={["1.4k token"]} />
        </Trace>
      </MessageBubble>
      <MessageBubble author="Sakura Bot" time="14:02">
        {"1. Công ty Hoa Đào cần báo giá gói Team trước 25/10.\n2. Anh Minh báo lỗi đăng nhập trên Safari.\n3. Chị Lan muốn dời buổi demo sang thứ Năm."}
      </MessageBubble>
    </MessageScroller>
  );
}

const SCROLL_CODE = `<MessageScroller
  className="h-[60vh]"
  onLoadOlder={loadOlder}      // chạm đầu danh sách → tải thêm, giữ nguyên vị trí đọc
  hasOlder={cursor !== null}
  loadingOlder={isLoading}
>
  {messages.map((m) => (
    <MessageBubble key={m.id} side={m.mine ? "outgoing" : "incoming"} author={m.author} time={m.time}>
      {m.text}
    </MessageBubble>
  ))}
</MessageScroller>`;

const STREAM_CODE = `// 1. Đã gửi, chưa có token nào → TypingIndicator
{waiting && <TypingIndicator key="typing" author="Sakura Bot" />}

// 2. Token đầu tiên về → thay bằng bong bóng streaming (cùng vị trí, không nhảy bố cục)
<MessageBubble key={answer.id} author="Sakura Bot" streaming={!answer.done}>
  {answer.text}
</MessageBubble>

// 3. Xong → streaming={false}: con trỏ biến mất, live region đọc toàn bộ câu trả lời một lần
// Trong lúc chờ: <ChatComposer busy onStop={abortController.abort} … />`;

const A11Y_CODE = `<div role="log" aria-label="Cuộc trò chuyện" aria-live="off" tabIndex={0}>
  …tin nhắn…
</div>
{/* Vùng đọc riêng: chỉ nhận tin đến đã hoàn chỉnh */}
<div aria-live="polite" aria-atomic="true" className="sr-only">Sakura Bot: Đặt data-brand…</div>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="anatomy"
        title="Cấu trúc màn hội thoại"
        description="Một màn chat trong Yugen UI ghép từ năm phần, mỗi phần giữ đúng một trách nhiệm."
      >
        <div className="flex flex-col gap-L">
          <Stage>
            <AnatomyDemo />
          </Stage>
          <SimpleTable
            head={["Phần", "Trách nhiệm"]}
            rows={[
              ["MessageScroller", "Vùng cuộn: bám đáy, nút tin mới, tải tin cũ, live region, phím End."],
              ["MessageBubble", "Một tin: phía (đến / đi), người gửi, giờ, trạng thái gửi, cảm xúc, stream. Tự gộp nhóm theo người gửi."],
              ["MessageDaySeparator", "Mốc ngày giữa các tin — vẫn là chữ đọc được, không phải role=separator."],
              ["TypingIndicator", "Ba chấm “đang soạn” trước khi có nội dung; role=status."],
              ["ChatComposer", "Ô soạn tự giãn: Enter gửi, Shift+Enter xuống dòng, busy + nút Dừng cho AI."],
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="scrolling"
        title="Quy tắc cuộn"
        description="Người dùng đang đọc ở đâu thì giữ họ ở đó. Chỉ tự cuộn khi chắc chắn họ muốn thấy tin mới nhất."
      >
        <div className="flex flex-col gap-L">
          <SimpleTable
            head={["Tình huống", "Hành vi"]}
            rows={[
              ["Đang ở đáy, có tin mới / chữ stream", "Bám đáy — nội dung mới luôn trong tầm nhìn (ResizeObserver theo dõi cả ảnh tải xong, composer giãn)."],
              ["Đã cuộn lên, có tin mới", "Không nhảy. Hiện nút nổi “N tin nhắn mới ↓”; bấm để xuống, số đếm về 0 khi chạm đáy."],
              ["Chính người dùng gửi tin", "Luôn xuống đáy — họ cần thấy tin của mình đã đi."],
              ["Chạm đầu danh sách", "Gọi onLoadOlder; tin cũ chèn lên trên mà điểm đang đọc không xê dịch (tự bù scrollTop, tắt overflow-anchor)."],
              ["Bàn phím", <span key="k">Focus vùng tin rồi nhấn <Kbd size="small">End</Kbd> để nhảy tới tin mới nhất; mũi tên / PageUp / PageDown cuộn như thường.</span>],
            ]}
          />
          <CodeBlock code={SCROLL_CODE} />
          <P>
            Mỗi phần tử con cần <C>key</C> ổn định (id tin nhắn): MessageScroller so sánh key đầu / cuối giữa các lần render để phân biệt
            tin cũ được chèn lên đầu với tin mới thêm vào cuối.
          </P>
          <PropsTable
            props={[
              { name: "onLoadOlder", type: "() => void | Promise<void>", description: "Trả Promise để không bị gọi lặp khi đang tải." },
              { name: "hasOlder / loadingOlder", type: "boolean", description: "Hết lịch sử thì tắt; spinner ở đầu danh sách." },
              { name: "bottomThreshold", type: "number", defaultValue: "48", description: "Còn cách đáy bao nhiêu px vẫn coi là “đang ở cuối”." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="streaming"
        title="Stream & chỉ báo đang soạn"
        description="Phản hồi AI đến theo từng mẩu. Giao diện phải cho thấy tiến triển mà không giật bố cục, không đọc lắp bắp cho trình đọc màn hình."
      >
        <div className="flex flex-col gap-L">
          <Stage>
            <StreamDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Hiện TypingIndicator ngay sau khi gửi — trước token đầu tiên — để người dùng biết yêu cầu đã được nhận.</li>
            <li>Token đầu tiên về: thay TypingIndicator bằng MessageBubble <C>streaming</C> ở đúng vị trí đó.</li>
            <li>Con trỏ nhấp nháy báo “còn tiếp”; ở chế độ giảm chuyển động nó đứng yên.</li>
            <li>Cho phép dừng: <C>ChatComposer busy onStop</C>. Câu trả lời dở dang vẫn giữ lại, kèm ghi chú “Đã dừng”.</li>
          </ul>
          <CodeBlock code={STREAM_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="errors"
        title="Lỗi & thử lại"
        description="Lỗi gửi thuộc về chính tin nhắn đó — không phải một toast trôi qua."
      >
        <div className="flex flex-col gap-L">
          <Stage>
            <RetryDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Giữ nguyên nội dung tin lỗi; viền và thông báo đỏ kèm icon — không chỉ đổi màu.</li>
            <li>Nút “Thử lại” ngay dưới tin; thông báo lỗi dùng role=alert để được đọc ngay.</li>
            <li>Lỗi của AI (hết hạn mức, bị chặn nội dung) là một tin đến bình thường, giải thích lý do và việc có thể làm.</li>
            <li>Mất kết nối toàn cục → MessageBar phía trên danh sách, không lặp lỗi trên từng tin.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="a11y"
        title="Live region & trình đọc màn hình"
        description="role=log mặc định đọc mọi thay đổi — với chữ stream, điều đó nghĩa là đọc từng mẩu vài từ. Yugen tách việc hiển thị và việc thông báo."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={A11Y_CODE} />
          <SimpleTable
            head={["Sự kiện", "Được đọc", "Cách"]}
            rows={[
              ["Tin đến hoàn chỉnh", "“Tên người gửi: nội dung”", "Vùng polite riêng của MessageScroller."],
              ["Tin đang stream", "Chưa đọc", "Đọc một lần khi streaming chuyển sang false."],
              ["Tin của chính mình", "Không đọc", "Người dùng vừa gõ nó."],
              ["Tin cũ tải thêm", "Không đọc", "Không phải tin mới."],
              ["Đang soạn", "“Sakura Bot đang soạn tin…”", "TypingIndicator role=status."],
              ["Gửi lỗi", "Thông báo lỗi", "role=alert dưới tin."],
            ]}
          />
          <P>
            Vùng tin có <C>tabIndex=0</C> để người dùng bàn phím cuộn được, và có tên (<C>label</C>). Trạng thái gửi là icon kèm chữ ẩn
            (“Đã xem”), không chỉ là màu.
          </P>
        </div>
      </DocSection>

      <DocSection id="composer" title="Bàn phím trong ô soạn" description="Theo thói quen của mọi ứng dụng chat phổ biến.">
        <SimpleTable
          head={["Phím", "Hành động"]}
          rows={[
            [<Kbd key="k">Enter</Kbd>, "Gửi (khi có nội dung, không busy)."],
            [
              <span key="k" className="inline-flex items-center gap-XXS">
                <Kbd>Shift</Kbd>+<Kbd>Enter</Kbd>
              </span>,
              "Xuống dòng.",
            ],
            ["Đang gõ Telex / VNI / IME", "Enter chỉ xác nhận chữ đang ghép — không gửi (kiểm tra isComposing)."],
            ["Ô soạn tự giãn", "Tối đa maxRows dòng (mặc định 6) rồi cuộn bên trong."],
            ["Sau khi gửi", "Ô soạn được xoá và giữ focus để gõ tiếp."],
          ]}
        />
      </DocSection>

      <DocSection
        id="transparency"
        title="Minh bạch với Trace"
        description="Trợ lý AI làm nhiều bước ngầm: tìm kiếm, gọi công cụ, đọc tài liệu. Đặt một Trace thu gọn trong câu trả lời để người dùng kiểm chứng được."
      >
        <div className="flex flex-col gap-L">
          <Stage>
            <TransparencyDemo />
          </Stage>
          <P>
            Trace trong tin nhắn nên ở <C>size=&quot;small&quot;</C>, dùng <C>appearance=&quot;plain&quot;</C> cho bong bóng chứa nó, và
            đặt trước câu trả lời. Xem thêm trang <a href="#/concepts/agent-trace" className="text-link hover:underline">Minh bạch tiến trình với Trace</a>.
          </P>
        </div>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Bám đáy chỉ khi người dùng đang ở đáy; còn lại dùng nút “tin nhắn mới”.",
            "Hiện chỉ báo đang soạn ngay khi gửi, và nút Dừng cho câu trả lời dài.",
            "Gắn lỗi và nút thử lại vào đúng tin nhắn thất bại.",
            "Cho thấy các bước agent đã làm bằng Trace, mặc định thu gọn.",
          ]}
          donts={[
            "Không giật danh sách xuống đáy khi người dùng đang đọc tin cũ.",
            "Không để trình đọc màn hình đọc từng mẩu chữ đang stream.",
            "Không xoá tin lỗi hay nội dung ô soạn khi gửi thất bại.",
            "Không giấu việc AI đã gọi công cụ hay đọc dữ liệu của người dùng.",
          ]}
        />
      </DocSection>
    </>
  );
}
