import * as React from "react";
import type { ReactNode } from "react";
import { ArrowClockwise16Regular, Play16Regular } from "@fluentui/react-icons";
import { Button } from "@/components/ui";
import { CodeBlock as ProductCodeBlock } from "@/components/ui/CodeBlock/CodeBlock";
import { Trace, TraceLog, TraceStatusIcon, TraceStep, type TraceStatus } from "@/components/ui/Trace/Trace";
import { DocSection, DoDont, PropsTable } from "../blocks";
import { CodeBlock } from "../CodeBlock";

function P({ children }: { children: ReactNode }) {
  return <p className="max-w-3xl text-body2 text-foreground-2">{children}</p>;
}

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">{children}</code>;
}

function Stage({ children }: { children: ReactNode }) {
  return <div className="flex flex-wrap items-start justify-center gap-L rounded-2xlarge border border-stroke-2 bg-background-1 p-XL">{children}</div>;
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
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

/* ---------- Demo: agent có lỗi & thử lại ---------- */

interface RunStep {
  title: string;
  ms: number;
  /** Lần chạy đầu thất bại ở bước này. */
  failsFirst?: boolean;
}

const RUN: RunStep[] = [
  { title: "Phân tích câu hỏi", ms: 600 },
  { title: "search_docs(\"đổi trả\")", ms: 1200 },
  { title: "get_order(\"#A1023\")", ms: 1400, failsFirst: true },
  { title: "Soạn câu trả lời", ms: 1300 },
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
        // Bước lỗi: các bước sau bị huỷ.
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
      title="Trợ lý: kiểm tra đơn hàng #A1023"
      startedAt={startedAt}
      duration={finished ? durations.reduce<number>((a, b) => a + (b ?? 0), 0) : undefined}
      actions={
        failedAt !== -1 ? (
          <Button size="small" appearance="primary" icon={<ArrowClockwise16Regular />} onClick={retry}>
            Thử lại bước lỗi
          </Button>
        ) : (
          <Button size="small" icon={<Play16Regular />} disabled={running} onClick={start}>
            {attempt === 0 ? "Chạy" : "Chạy lại"}
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
          description={statuses[i] === "error" ? "Hệ thống đơn hàng không phản hồi sau 5 giây." : undefined}
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

const MAPPING_CODE = `// Sự kiện từ agent (SSE / WebSocket) → props của TraceStep
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
  { status: "pending", meaning: "Đang chờ", when: "Đã lên kế hoạch, chưa bắt đầu.", token: "text-foreground-3" },
  { status: "running", meaning: "Đang chạy", when: "Đang thực hiện — đồng hồ chạy trực tiếp.", token: "text-brand-foreground-1" },
  { status: "success", meaning: "Hoàn tất", when: "Xong, có thời lượng.", token: "text-success-foreground-1" },
  { status: "error", meaning: "Lỗi", when: "Thất bại — tự mở chi tiết, nói nguyên nhân.", token: "text-danger-foreground-1" },
  { status: "skipped", meaning: "Bỏ qua", when: "Không cần chạy (điều kiện không thoả, cache trúng).", token: "text-foreground-3" },
  { status: "cancelled", meaning: "Đã huỷ", when: "Bị dừng bởi người dùng hoặc vì bước trước lỗi.", token: "text-warning-foreground-1" },
];

export default function Page() {
  return (
    <>
      <DocSection
        id="why"
        title="Vì sao cần minh bạch"
        description="Một spinner “Đang xử lý…” kéo dài 20 giây khiến người dùng nghi ngờ, bấm lại, hoặc bỏ đi. Một danh sách bước đang tiến triển thì không."
      >
        <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
          <li>
            <strong className="font-semibold text-foreground-1">Niềm tin</strong> — người dùng thấy AI đã đọc tài liệu nào, gọi công cụ
            nào trước khi tin vào câu trả lời.
          </li>
          <li>
            <strong className="font-semibold text-foreground-1">Quyền kiểm soát</strong> — biết đang ở bước nào thì mới quyết định chờ,
            dừng hay thử lại.
          </li>
          <li>
            <strong className="font-semibold text-foreground-1">Gỡ lỗi</strong> — khi sai, bước lỗi và log nằm ngay đó, không phải mở
            tab khác.
          </li>
        </ul>
      </DocSection>

      <DocSection
        id="states"
        title="Sáu trạng thái"
        description="Mỗi trạng thái có icon riêng, màu token riêng và nhãn chữ (đọc được bởi trình đọc màn hình) — màu không bao giờ là tín hiệu duy nhất."
      >
        <SimpleTable
          head={["Trạng thái", "Nhãn", "Khi nào", "Màu"]}
          rows={STATES.map((s) => [
            <span key="s" className="inline-flex items-center gap-S">
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
        title="Chọn độ chi tiết"
        description="Một bước = một việc người dùng hiểu được. Chi tiết kỹ thuật nằm trong phần mở rộng, không nằm trên dòng tiêu đề."
      >
        <div className="flex flex-col gap-L">
          <Stage>
            <Trace size="small" title="Tạo báo cáo tháng 10" duration={9620} className="w-full max-w-xl">
              <TraceStep status="success" title="Lấy dữ liệu bán hàng" duration={2140} metadata={["sales_db", "12 480 dòng"]}>
                <TraceStep status="success" title="Truy vấn đơn hàng" duration={1210} />
                <TraceStep status="skipped" title="Truy vấn hoàn tiền" description="Không có hoàn tiền trong kỳ." />
              </TraceStep>
              <TraceStep
                status="success"
                title="Tính chỉ số"
                duration={3380}
                details={
                  <ProductCodeBlock language="json" size="small" code={'{\n  "revenue": 1284000000,\n  "orders": 3120,\n  "aov": 411538\n}'} />
                }
              />
              <TraceStep status="success" title="Viết nhận xét" duration={4100} metadata={["sakura-1", "2.1k token"]} />
            </Trace>
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Tiêu đề bước là động từ + đối tượng (“Lấy dữ liệu bán hàng”); tên hàm / công cụ để trong metadata hoặc details.</li>
            <li>Lồng tối đa 2 cấp. Agent gọi 30 lệnh nhỏ → gộp thành một bước cha “Đọc 30 tệp” với bước con thu gọn.</li>
            <li>metadata cho thông tin quét nhanh: công cụ, model, số token, số dòng, nhánh git.</li>
            <li>details (log, JSON, CodeBlock) mặc định thu gọn; bước lỗi và bước đang chạy tự mở.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection
        id="live"
        title="Cập nhật trực tiếp"
        description="Trace là component hiển thị thuần: bạn giữ danh sách bước trong state và cập nhật theo sự kiện từ agent."
      >
        <div className="flex flex-col gap-L">
          <CodeBlock code={MAPPING_CODE} />
          <PropsTable
            props={[
              { name: "status", type: "TraceStatus", defaultValue: `"pending"`, description: "Đổi status là đủ — icon, màu, đồng hồ, thông báo tự theo." },
              { name: "startedAt", type: "number", description: "Mốc bắt đầu từ server để đồng hồ chính xác; bỏ trống thì tính từ lúc chuyển sang running." },
              { name: "duration", type: "number (ms)", description: "Thời lượng thật khi xong." },
              { name: "Trace.startedAt / duration", type: "number", description: "Đồng hồ tổng khi đang chạy; tổng thời lượng khi xong." },
              { name: "Trace.announceChanges", type: "boolean", defaultValue: "true", description: "Gộp các thay đổi cùng nhịp thành một thông báo polite." },
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="errors"
        title="Khi có lỗi"
        description="Bấm Chạy: bước get_order sẽ hết thời gian chờ ở lần đầu. Các bước sau chuyển sang Đã huỷ, và phần đầu đưa ra hành động tiếp theo."
      >
        <div className="flex flex-col gap-L">
          <Stage>
            <AgentRunDemo />
          </Stage>
          <ul className="flex max-w-3xl list-disc flex-col gap-XS ps-XL text-body2 text-foreground-2">
            <li>Mô tả lỗi bằng ngôn ngữ người dùng (“không phản hồi sau 5 giây”); log kỹ thuật nằm trong details.</li>
            <li>Đánh dấu các bước phụ thuộc là cancelled — đừng để chúng ở pending như thể vẫn sẽ chạy.</li>
            <li>Cho thử lại từ bước lỗi thay vì chạy lại tất cả khi có thể.</li>
          </ul>
        </div>
      </DocSection>

      <DocSection id="a11y" title="Khả năng tiếp cận">
        <SimpleTable
          head={["Khía cạnh", "Cách Trace xử lý"]}
          rows={[
            ["Ngữ nghĩa", "Vùng <section> có tên (tiêu đề); các bước là role=list / listitem, bước con là danh sách lồng."],
            ["Trạng thái", "Mỗi bước có chữ ẩn “, Hoàn tất” / “, Lỗi”… ngay trong tên — không chỉ dựa vào icon hay màu."],
            ["Mở rộng", "Tiêu đề bước có details / bước con là nút disclosure với aria-expanded + aria-controls; Enter / Space để mở."],
            ["Thông báo", "Một vùng role=status polite đọc “Tên bước: trạng thái”; thay đổi cùng nhịp được gộp làm một."],
            ["Chuyển động", "Spinner đứng yên và bước mới không mờ dần khi người dùng bật giảm chuyển động."],
            ["Log", "TraceLog luôn dir=\"ltr\", focus được bằng Tab để cuộn bằng bàn phím."],
          ]}
        />
        <P>
          Đặt <C>title</C> của TraceStep là chuỗi (hoặc truyền <C>announceLabel</C>) để thông báo trạng thái có nội dung.
        </P>
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Hiện bước ngay khi agent bắt đầu nó, không đợi xong mới in ra.",
            "Ghi thời lượng cho từng bước để người dùng biết chậm ở đâu.",
            "Mở sẵn bước lỗi, kèm nguyên nhân và hành động thử lại.",
            "Dùng Trace size small, thu gọn, trong tin nhắn của trợ lý AI.",
          ]}
          donts={[
            "Không giả lập tiến độ bằng các bước bịa — chỉ hiện việc thật sự xảy ra.",
            "Không để bước phụ thuộc ở pending khi pipeline đã dừng.",
            "Không đưa dữ liệu nhạy cảm (token, mật khẩu) vào metadata hay log hiển thị.",
          ]}
        />
      </DocSection>
    </>
  );
}
