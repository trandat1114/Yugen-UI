import { useState } from "react";
import {
  Box20Regular,
  Checkmark20Regular,
  Comment20Regular,
  DocumentArrowUp20Regular,
  People20Regular,
  VehicleTruckProfile20Regular,
} from "@fluentui/react-icons";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Button } from "@/components/ui/Button/Button";
import { Sparkline } from "@/components/ui/Chart/Chart";
import { DescriptionItem, DescriptionList } from "@/components/ui/DescriptionList/DescriptionList";
import { Markdown } from "@/components/ui/Markdown/Markdown";
import { Prose } from "@/components/ui/Prose/Prose";
import { Sonner, sonner, type SonnerPosition } from "@/components/ui/Sonner/Sonner";
import { Stat } from "@/components/ui/Stat/Stat";
import { Switch } from "@/components/ui/Switch/Switch";
import { Timeline, TimelineItem } from "@/components/ui/Timeline/Timeline";
import type { ComponentDoc } from "../types";

/* ------------------------------------------------------------------ demos */

function RouterLinkDemo() {
  const [path, setPath] = useState("/");
  return (
    <div className="flex flex-col gap-2">
      <Markdown
        renderLink={({ href, title, children, external }) =>
          external ? (
            <a href={href} title={title} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ) : (
            // In an app: call your router's navigate(href).
            <a
              href={href}
              title={title}
              onClick={(e) => {
                e.preventDefault();
                setPath(href);
              }}
            >
              {children}
            </a>
          )
        }
      >
        {"Read the [installation guide](/concepts/quick-start) or [Prose](/components/prose). Source code is on [GitHub](https://github.com)."}
      </Markdown>
      <p className="text-caption1 text-foreground-3">Path: {path}</p>
    </div>
  );
}

const API_NOTES = `## Getting started with the API

Every request needs an **API key** in the \`Authorization\` header. Create one under [Settings](#settings).

1. Create a read-only key.
2. Store the key in an environment variable.
3. Try \`GET /v1/orders\`.

| Plan     | Requests / min |
| -------- | -------------: |
| Free     |             60 |
| Pro      |          1,200 |
`;

function SonnerDemo() {
  return (
    <>
      <Sonner sonnerId="docs-sonner" />
      <Button
        appearance="primary"
        onClick={() =>
          sonner.success("Changes saved", {
            description: "“Q4 plan” was saved to the cloud.",
            action: { label: "Undo" },
            sonnerId: "docs-sonner",
          })
        }
      >
        Save document
      </Button>
    </>
  );
}

function SonnerTypesDemo() {
  const options = { sonnerId: "docs-sonner-types" };
  return (
    <>
      <Sonner sonnerId="docs-sonner-types" />
      <Button onClick={() => sonner("Moved 3 files to Projects", options)}>Default</Button>
      <Button onClick={() => sonner.success("Invitation sent", options)}>Success</Button>
      <Button onClick={() => sonner.info("An update is available", options)}>Info</Button>
      <Button onClick={() => sonner.warning("Storage is almost full", options)}>Warning</Button>
      <Button onClick={() => sonner.error("Couldn't upload the file", options)}>Error</Button>
      <Button onClick={() => sonner.loading("Syncing…", { ...options, duration: 3000 })}>Loading</Button>
    </>
  );
}

function wait(ms: number, fail = false) {
  return new Promise<number>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Connection lost")) : resolve(12)), ms));
}

function SonnerPromiseDemo() {
  const run = (fail: boolean) =>
    sonner.promise(wait(1500, fail), {
      loading: "Saving 12 items…",
      success: (count) => `Saved ${count} items`,
      error: (error) => `Couldn't save: ${(error as Error).message}`,
      sonnerId: "docs-sonner-promise",
    });
  return (
    <>
      <Sonner sonnerId="docs-sonner-promise" />
      <Button appearance="primary" onClick={() => run(false)}>
        Save
      </Button>
      <Button onClick={() => run(true)}>Save (fails)</Button>
    </>
  );
}

function SonnerStackDemo() {
  const [expand, setExpand] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <>
      <Sonner sonnerId="docs-sonner-stack" expand={expand} />
      <Button
        onClick={() => {
          setCount(count + 1);
          sonner(`Notification ${count + 1}`, { description: "Hover over the stack to see them all.", sonnerId: "docs-sonner-stack" });
        }}
      >
        Add notification
      </Button>
      <Switch label="Always expanded" checked={expand} onCheckedChange={setExpand} />
    </>
  );
}

const SONNER_POSITIONS: SonnerPosition[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

function SonnerPositionDemo() {
  const [position, setPosition] = useState<SonnerPosition>("top-end");
  return (
    <>
      <Sonner sonnerId="docs-sonner-position" position={position} richColors closeButton />
      {SONNER_POSITIONS.map((p) => (
        <Button
          key={p}
          size="small"
          onClick={() => {
            setPosition(p);
            sonner.warning("Position: " + p, {
              description: "Swipe toward the edge to dismiss.",
              cancel: { label: "Dismiss" },
              sonnerId: "docs-sonner-position",
            });
          }}
        >
          {p}
        </Button>
      ))}
    </>
  );
}

const POST_HTML = [
  "<p>Autumn in Kyoto starts in late October, when the maples at <em>Tōfuku-ji</em> turn red.</p>",
  "<h2>When to go</h2>",
  "<ul><li>Early morning, before 8 a.m., to beat the crowds.</li><li>On a weekday rather than a weekend.</li></ul>",
].join("");

const REVENUE = [42, 45, 44, 51, 49, 56, 61, 58, 66, 71, 69, 78];

/* ------------------------------------------------------------------ docs */

const DOCS: Record<string, ComponentDoc> = {
  /* ---------------------------------------------------------------- Sonner */
  sonner: {
    slug: "sonner",
    name: "Sonner",
    category: "Phản hồi",
    lead: "Sonner là thông báo ngắn xếp chồng ở góc màn hình: thông báo mới ở trước, thông báo cũ lùi ra sau, trỏ chuột vào thì xoè ra.",
    description:
      "Đặt `<Sonner />` một lần ở gốc ứng dụng, rồi gọi `sonner(\"…\")`, `sonner.success(…)` hoặc `sonner.promise(…)` ở bất kỳ đâu. Gọi lại với cùng `id` sẽ thay nội dung tại chỗ. Trỏ chuột hoặc focus vào vùng thông báo thì chồng xoè thành danh sách và tạm dừng đếm giờ; vuốt để đóng; F8 để focus vùng thông báo. Toast vẫn dùng cho một danh sách thông báo cố định theo Fluent.",
    importCode: `import { Sonner, sonner } from "@/components/ui";`,
    hero: {
      title: "Sonner",
      code: `function SonnerDemo() {
  return (
    <>
      <Sonner sonnerId="docs-sonner" />
      <Button
        appearance="primary"
        onClick={() =>
          sonner.success("Changes saved", {
            description: "“Q4 plan” was saved to the cloud.",
            action: { label: "Undo" },
            sonnerId: "docs-sonner",
          })
        }
      >
        Save document
      </Button>
    </>
  );
}`,
      render: () => <SonnerDemo />,
    },
    examples: [
      {
        title: "Loại",
        description: "Mặc định không có icon; success, info, warning, error dùng icon của MessageBar; loading không tự đóng.",
        code: `function SonnerTypesDemo() {
  const options = { sonnerId: "docs-sonner-types" };
  return (
    <>
      <Sonner sonnerId="docs-sonner-types" />
      <Button onClick={() => sonner("Moved 3 files to Projects", options)}>Default</Button>
      <Button onClick={() => sonner.success("Invitation sent", options)}>Success</Button>
      <Button onClick={() => sonner.info("An update is available", options)}>Info</Button>
      <Button onClick={() => sonner.warning("Storage is almost full", options)}>Warning</Button>
      <Button onClick={() => sonner.error("Couldn't upload the file", options)}>Error</Button>
      <Button onClick={() => sonner.loading("Syncing…", { ...options, duration: 3000 })}>Loading</Button>
    </>
  );
}`,
        render: () => <SonnerTypesDemo />,
      },
      {
        title: "Theo một promise",
        description: "sonner.promise hiện loading, rồi đổi tại chỗ thành success hoặc error. success / error nhận hàm để dùng kết quả.",
        code: `function wait(ms: number, fail = false) {
  return new Promise<number>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Connection lost")) : resolve(12)), ms));
}

function SonnerPromiseDemo() {
  const run = (fail: boolean) =>
    sonner.promise(wait(1500, fail), {
      loading: "Saving 12 items…",
      success: (count) => \`Saved \${count} items\`,
      error: (error) => \`Couldn't save: \${(error as Error).message}\`,
      sonnerId: "docs-sonner-promise",
    });
  return (
    <>
      <Sonner sonnerId="docs-sonner-promise" />
      <Button appearance="primary" onClick={() => run(false)}>
        Save
      </Button>
      <Button onClick={() => run(true)}>Save (fails)</Button>
    </>
  );
}`,
        render: () => <SonnerPromiseDemo />,
      },
      {
        title: "Xếp chồng & xoè",
        description: "Tối đa visibleToasts (3) thông báo nhìn thấy; thông báo cũ hơn chờ phía sau. expand giữ chồng luôn xoè.",
        code: `function SonnerStackDemo() {
  const [expand, setExpand] = useState(false);
  const [count, setCount] = useState(0);
  return (
    <>
      <Sonner sonnerId="docs-sonner-stack" expand={expand} />
      <Button
        onClick={() => {
          setCount(count + 1);
          sonner(\`Notification \${count + 1}\`, { description: "Hover over the stack to see them all.", sonnerId: "docs-sonner-stack" });
        }}
      >
        Add notification
      </Button>
      <Switch label="Always expanded" checked={expand} onCheckedChange={setExpand} />
    </>
  );
}`,
        render: () => <SonnerStackDemo />,
      },
      {
        title: "Vị trí, richColors & nút đóng",
        description: "richColors tô nền và viền theo loại; closeButton thêm nút X; cancel là nút phụ đóng thông báo.",
        code: `const SONNER_POSITIONS: SonnerPosition[] = ["top-start", "top", "top-end", "bottom-start", "bottom", "bottom-end"];

function SonnerPositionDemo() {
  const [position, setPosition] = useState<SonnerPosition>("top-end");
  return (
    <>
      <Sonner sonnerId="docs-sonner-position" position={position} richColors closeButton />
      {SONNER_POSITIONS.map((p) => (
        <Button
          key={p}
          size="small"
          onClick={() => {
            setPosition(p);
            sonner.warning("Position: " + p, {
              description: "Swipe toward the edge to dismiss.",
              cancel: { label: "Dismiss" },
              sonnerId: "docs-sonner-position",
            });
          }}
        >
          {p}
        </Button>
      ))}
    </>
  );
}`,
        render: () => <SonnerPositionDemo />,
      },
    ],
    dos: [
      "Dùng cho phản hồi ngắn sau thao tác: đã lưu, đã gửi, đã xoá kèm Hoàn tác.",
      "Dùng sonner.promise cho thao tác chạy nền để người dùng thấy kết quả mà không phải chờ.",
      "Đặt altText cho action khi label không phải chuỗi.",
    ],
    donts: [
      "Không đặt thông tin quan trọng duy nhất trong thông báo, nó sẽ biến mất.",
      "Không đặt cả Toaster và Sonner cùng vị trí trong một app.",
      "Không đặt form hay nhiều hơn hai nút trong một thông báo.",
    ],
    props: [
      { name: "position", type: `"top-start" | "top" | "top-end" | "bottom-start" | "bottom" | "bottom-end"`, defaultValue: `"bottom-end"`, description: "Vị trí vùng thông báo; start / end đổi theo chiều đọc." },
      { name: "expand", type: "boolean", defaultValue: "false", description: "Luôn xoè thành danh sách." },
      { name: "visibleToasts", type: "number", defaultValue: "3", description: "Số thông báo nhìn thấy cùng lúc." },
      { name: "richColors", type: "boolean", defaultValue: "false", description: "Nền và viền theo loại, như MessageBar." },
      { name: "closeButton", type: "boolean", defaultValue: "false", description: "Nút đóng (X) trên mọi thông báo; từng thông báo có thể ghi đè." },
      { name: "duration", type: "number", defaultValue: "4000", description: "Thời gian tự đóng mặc định (ms)." },
      { name: "gap", type: "number", defaultValue: "12", description: "Khoảng cách khi xoè và phần ló ra khi xếp chồng (px)." },
      { name: "sonnerId", type: "string", description: "Khi có nhiều Sonner: thông báo truyền cùng sonnerId mới hiện ở đây." },
      { name: "sonner(title, options?)", type: "string", description: "Hiện thông báo, trả về id. Có thêm .success, .info, .warning, .error, .loading." },
      { name: "sonner.promise(promise, data)", type: "string", description: "data: { loading, success, error } cùng các tuỳ chọn khác; success / error nhận giá trị hoặc hàm." },
      { name: "sonner.dismiss(id?)", type: "void", description: "Đóng một thông báo, hoặc tất cả khi bỏ trống id." },
      { name: "SonnerOptions.description", type: "ReactNode", description: "Dòng mô tả dưới tiêu đề." },
      { name: "SonnerOptions.action", type: "{ label; altText?; onClick? }", description: "Nút chính; gọi event.preventDefault() trong onClick để giữ thông báo mở." },
      { name: "SonnerOptions.cancel", type: "{ label; altText?; onClick? }", description: "Nút phụ, đóng thông báo." },
      { name: "SonnerOptions.id", type: "string", description: "Gọi lại với id của thông báo đang mở để thay nội dung tại chỗ." },
      { name: "SonnerOptions.icon", type: "ReactNode", description: "Thay icon theo loại; null = không icon." },
      { name: "SonnerOptions.duration", type: "number", description: "Ghi đè thời gian tự đóng; Infinity = không tự đóng." },
      { name: "SonnerOptions.onDismiss", type: "(id: string) => void", description: "Người dùng đóng (nút, vuốt, Esc) hoặc gọi sonner.dismiss." },
      { name: "SonnerOptions.onAutoClose", type: "(id: string) => void", description: "Hết thời gian tự đóng." },
    ],
  },

  /* ---------------------------------------------------------------- Timeline */
  timeline: {
    slug: "timeline",
    name: "Timeline",
    category: "Hiển thị dữ liệu",
    lead: "Timeline liệt kê các sự kiện theo thời gian: lịch sử đơn hàng, nhật ký hoạt động, các bước đã qua của một yêu cầu.",
    description:
      "Timeline là một `<ol>`; mỗi TimelineItem có tiêu đề, thời gian, icon (hoặc Avatar) và nội dung thêm tuỳ chọn. Truyền `dateTime` để thời gian thành thẻ `<time>` máy đọc được. variant compact dùng chấm nhỏ và một dòng cho mỗi sự kiện, hợp với nhật ký dài. Icon chỉ để trang trí, nên tiêu đề phải tự nói đủ sự kiện.",
    importCode: `import { Timeline, TimelineItem } from "@/components/ui";`,
    hero: {
      title: "Timeline",
      code: `<Timeline aria-label="Order history" className="w-full max-w-md">
  <TimelineItem icon={<VehicleTruckProfile20Regular />} intent="brand" title="Out for delivery" time="Today, 8:30 AM" dateTime="2026-10-28T08:30">
    Express Post · tracking no. EP-5520417
  </TimelineItem>
  <TimelineItem icon={<Box20Regular />} title="Packed" time="Yesterday, 4:05 PM" dateTime="2026-10-27T16:05" />
  <TimelineItem icon={<Checkmark20Regular />} intent="success" title="Paid" time="Yesterday, 9:12 AM" dateTime="2026-10-27T09:12" />
  <TimelineItem icon={<Avatar name="Maria Garcia" size={32} />} title={<><strong className="font-semibold">Maria Garcia</strong> placed order #2041</>} time="Yesterday, 9:10 AM" dateTime="2026-10-27T09:10" />
</Timeline>`,
      render: () => (
        <Timeline aria-label="Order history" className="w-full max-w-md">
          <TimelineItem icon={<VehicleTruckProfile20Regular />} intent="brand" title="Out for delivery" time="Today, 8:30 AM" dateTime="2026-10-28T08:30">
            Express Post · tracking no. EP-5520417
          </TimelineItem>
          <TimelineItem icon={<Box20Regular />} title="Packed" time="Yesterday, 4:05 PM" dateTime="2026-10-27T16:05" />
          <TimelineItem icon={<Checkmark20Regular />} intent="success" title="Paid" time="Yesterday, 9:12 AM" dateTime="2026-10-27T09:12" />
          <TimelineItem
            icon={<Avatar name="Maria Garcia" size={32} />}
            title={
              <>
                <strong className="font-semibold">Maria Garcia</strong> placed order #2041
              </>
            }
            time="Yesterday, 9:10 AM"
            dateTime="2026-10-27T09:10"
          />
        </Timeline>
      ),
    },
    examples: [
      {
        title: "Compact",
        description: "Chấm nhỏ, tiêu đề và thời gian trên một dòng; nội dung thêm dùng chữ caption.",
        code: `<Timeline variant="compact" aria-label="Recent activity" className="w-full max-w-md">
  <TimelineItem title="Sam changed the status to Done" time="10 min ago" intent="success" />
  <TimelineItem title="Priya commented" time="1 hour ago" icon={<Comment20Regular />}>
    “I've updated the Q3 numbers. Could everyone take a look?”
  </TimelineItem>
  <TimelineItem title="Priya uploaded q3-report.pdf" time="1 hour ago" icon={<DocumentArrowUp20Regular />} />
  <TimelineItem title="Maria added 2 members" time="Yesterday" icon={<People20Regular />} />
</Timeline>`,
        render: () => (
          <Timeline variant="compact" aria-label="Recent activity" className="w-full max-w-md">
            <TimelineItem title="Sam changed the status to Done" time="10 min ago" intent="success" />
            <TimelineItem title="Priya commented" time="1 hour ago" icon={<Comment20Regular />}>
              “I've updated the Q3 numbers. Could everyone take a look?”
            </TimelineItem>
            <TimelineItem title="Priya uploaded q3-report.pdf" time="1 hour ago" icon={<DocumentArrowUp20Regular />} />
            <TimelineItem title="Maria added 2 members" time="Yesterday" icon={<People20Regular />} />
          </Timeline>
        ),
      },
      {
        title: "Intent không icon",
        description: "Không có icon thì là chấm tròn theo intent: neutral, brand, success, warning, danger.",
        code: `<Timeline aria-label="Deployment history" className="w-full max-w-md">
  <TimelineItem intent="danger" title="Deploy of v2.4.1 failed" time="14:02">
    Health check failed after 3 attempts; rolled back to v2.4.0.
  </TimelineItem>
  <TimelineItem intent="warning" title="Response time up 30%" time="13:48" />
  <TimelineItem intent="success" title="Deployed v2.4.0" time="Yesterday" />
  <TimelineItem title="Created staging environment" time="Oct 20" />
</Timeline>`,
        render: () => (
          <Timeline aria-label="Deployment history" className="w-full max-w-md">
            <TimelineItem intent="danger" title="Deploy of v2.4.1 failed" time="14:02">
              Health check failed after 3 attempts; rolled back to v2.4.0.
            </TimelineItem>
            <TimelineItem intent="warning" title="Response time up 30%" time="13:48" />
            <TimelineItem intent="success" title="Deployed v2.4.0" time="Yesterday" />
            <TimelineItem title="Created staging environment" time="Oct 20" />
          </Timeline>
        ),
      },
    ],
    dos: [
      "Xếp sự kiện mới nhất lên đầu, trừ khi người dùng đang theo dõi một quy trình từ đầu đến cuối.",
      "Viết tiêu đề đủ ý (ai, làm gì) vì icon không được đọc cho trình đọc màn hình.",
      "Truyền dateTime khi thời gian hiển thị là tương đối (“2 giờ trước”).",
    ],
    donts: [
      "Không dùng Timeline cho các bước chưa xảy ra mà người dùng phải đi qua — dùng Stepper.",
      "Không dùng intent chỉ để trang trí; giữ màu cho trạng thái thật sự khác.",
    ],
    props: [
      { name: "variant", type: `"detailed" | "compact"`, defaultValue: `"detailed"`, description: "detailed: ô icon 32px, nội dung bên dưới · compact: chấm nhỏ, một dòng." },
      { name: "TimelineItem.title", type: "ReactNode", description: "Sự kiện: ai làm gì." },
      { name: "TimelineItem.time", type: "ReactNode", description: "Thời gian hiển thị." },
      { name: "TimelineItem.dateTime", type: "string", description: "Thời điểm ISO 8601 → thẻ <time dateTime>." },
      { name: "TimelineItem.icon", type: "ReactNode", description: "Icon hoặc Avatar; bỏ trống = chấm tròn." },
      { name: "TimelineItem.intent", type: `"neutral" | "brand" | "success" | "warning" | "danger"`, defaultValue: `"neutral"`, description: "Màu ô icon / chấm." },
      { name: "TimelineItem.children", type: "ReactNode", description: "Nội dung thêm: bình luận, tệp, thẻ." },
    ],
  },

  /* ---------------------------------------------------------------- DescriptionList */
  descriptionlist: {
    slug: "descriptionlist",
    name: "DescriptionList",
    category: "Hiển thị dữ liệu",
    lead: "DescriptionList hiển thị các cặp nhãn / giá trị: chi tiết đơn hàng, hồ sơ, tóm tắt cài đặt.",
    description:
      "DescriptionList là một `<dl>`; mỗi DescriptionItem gồm `<dt>` và `<dd>`. columns là số cột tối đa: khung hẹp tự bớt cột mà không cần breakpoint. layout inline đặt nhãn và giá trị cùng hàng; valueAlign end đẩy giá trị về cuối hàng cho bảng tổng tiền. copyable thêm nút sao chép giá trị, trình đọc màn hình đọc kèm nhãn của mục.",
    importCode: `import { DescriptionList, DescriptionItem } from "@/components/ui";`,
    hero: {
      title: "DescriptionList",
      code: `<DescriptionList columns={2} className="w-full max-w-xl">
  <DescriptionItem label="Order ID" copyable>
    ORD-2041
  </DescriptionItem>
  <DescriptionItem label="Order date">Oct 27, 2026, 9:10 AM</DescriptionItem>
  <DescriptionItem label="Customer">Maria Garcia</DescriptionItem>
  <DescriptionItem label="Email" copyable="maria.garcia@example.com">
    <a className="text-link hover:underline" href="mailto:maria.garcia@example.com">maria.garcia@example.com</a>
  </DescriptionItem>
  <DescriptionItem label="Shipping address" fullWidth>
    400 Market Street, Suite 12, San Francisco, CA 94105
  </DescriptionItem>
</DescriptionList>`,
      render: () => (
        <DescriptionList columns={2} className="w-full max-w-xl">
          <DescriptionItem label="Order ID" copyable>
            ORD-2041
          </DescriptionItem>
          <DescriptionItem label="Order date">Oct 27, 2026, 9:10 AM</DescriptionItem>
          <DescriptionItem label="Customer">Maria Garcia</DescriptionItem>
          <DescriptionItem label="Email" copyable="maria.garcia@example.com">
            <a className="text-link hover:underline" href="mailto:maria.garcia@example.com">
              maria.garcia@example.com
            </a>
          </DescriptionItem>
          <DescriptionItem label="Shipping address" fullWidth>
            400 Market Street, Suite 12, San Francisco, CA 94105
          </DescriptionItem>
        </DescriptionList>
      ),
    },
    examples: [
      {
        title: "Inline & divided",
        description: "Nhãn và giá trị cùng hàng, có đường kẻ giữa các mục — hợp với trang hồ sơ, cài đặt.",
        code: `<DescriptionList layout="inline" divided className="w-full max-w-lg">
  <DescriptionItem label="Name">Sam Lee</DescriptionItem>
  <DescriptionItem label="Role">Admin</DescriptionItem>
  <DescriptionItem label="Time zone">(UTC+09:00) Osaka, Sapporo, Tokyo</DescriptionItem>
  <DescriptionItem label="API key" copyable>
    <span className="font-mono">yg_live_51Hc…9QeD</span>
  </DescriptionItem>
</DescriptionList>`,
        render: () => (
          <DescriptionList layout="inline" divided className="w-full max-w-lg">
            <DescriptionItem label="Name">Sam Lee</DescriptionItem>
            <DescriptionItem label="Role">Admin</DescriptionItem>
            <DescriptionItem label="Time zone">(UTC+09:00) Osaka, Sapporo, Tokyo</DescriptionItem>
            <DescriptionItem label="API key" copyable>
              <span className="font-mono">yg_live_51Hc…9QeD</span>
            </DescriptionItem>
          </DescriptionList>
        ),
      },
      {
        title: "Tổng tiền",
        description: "valueAlign end đẩy giá trị về cuối hàng; mục cuối đậm hơn bằng className.",
        code: `<DescriptionList layout="inline" valueAlign="end" className="w-full max-w-xs tabular-nums">
  <DescriptionItem label="Subtotal">$1,240.00</DescriptionItem>
  <DescriptionItem label="Shipping">Free</DescriptionItem>
  <DescriptionItem label="Discount">−$124.00</DescriptionItem>
  <DescriptionItem label="Total" className="border-t border-stroke-2 pt-2 font-semibold [&_dt]:text-foreground-1">
    $1,116.00
  </DescriptionItem>
</DescriptionList>`,
        render: () => (
          <DescriptionList layout="inline" valueAlign="end" className="w-full max-w-xs tabular-nums">
            <DescriptionItem label="Subtotal">$1,240.00</DescriptionItem>
            <DescriptionItem label="Shipping">Free</DescriptionItem>
            <DescriptionItem label="Discount">−$124.00</DescriptionItem>
            <DescriptionItem label="Total" className="border-t border-stroke-2 pt-2 font-semibold [&_dt]:text-foreground-1">
              $1,116.00
            </DescriptionItem>
          </DescriptionList>
        ),
      },
    ],
    dos: [
      "Viết nhãn ngắn, viết hoa chữ đầu câu, không dấu hai chấm.",
      "Bật copyable cho giá trị người dùng hay chép: mã đơn, email, mã API.",
      "Dùng fullWidth cho giá trị dài (địa chỉ, ghi chú) khi có nhiều cột.",
    ],
    donts: [
      "Không dùng DescriptionList cho dữ liệu nhiều hàng cùng cột — dùng Table.",
      "Không để giá trị trống; ghi “Chưa có” hoặc một dấu gạch có giải thích.",
    ],
    props: [
      { name: "columns", type: "1 | 2 | 3 | 4", defaultValue: "1", description: "Số cột tối đa; khung hẹp tự bớt cột." },
      { name: "layout", type: `"stacked" | "inline"`, defaultValue: `"stacked"`, description: "Nhãn trên giá trị, hoặc cùng hàng." },
      { name: "divided", type: "boolean", defaultValue: "false", description: "Đường kẻ trên mỗi mục." },
      { name: "valueAlign", type: `"start" | "end"`, defaultValue: `"start"`, description: "end: giá trị ở cuối hàng (layout inline)." },
      { name: "DescriptionItem.label", type: "ReactNode", description: "Nhãn (<dt>)." },
      { name: "DescriptionItem.children", type: "ReactNode", description: "Giá trị (<dd>)." },
      { name: "DescriptionItem.copyable", type: "boolean | string", description: "Nút sao chép: true chép chữ đang hiển thị, chuỗi = chép đúng chuỗi đó." },
      { name: "DescriptionItem.fullWidth", type: "boolean", description: "Chiếm cả hàng khi có nhiều cột." },
    ],
  },

  /* ---------------------------------------------------------------- Stat */
  stat: {
    slug: "stat",
    name: "Stat",
    category: "Hiển thị dữ liệu",
    lead: "Stat hiển thị một con số chính kèm mức thay đổi và biểu đồ nhỏ tuỳ chọn.",
    description:
      "Số được định dạng theo locale của YugenProvider và tự rút gọn từ 10.000 (12,9 N). delta là mức thay đổi có dấu, mặc định hiển thị phần trăm; goodDirection quyết định tăng là tốt (xanh) hay xấu (đỏ), và chiều thay đổi luôn có chữ ẩn cho trình đọc màn hình. chart nhận một biểu đồ nhỏ, thường là Sparkline. StatTile trong Yugen Labs giờ là Stat kèm Sparkline vẽ từ trend.",
    importCode: `import { Stat } from "@/components/ui";`,
    hero: {
      title: "Stat",
      code: `<div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-6">
  <Stat label="Revenue" value={128_400} valueFormat={{ notation: "compact", style: "currency", currency: "USD" }} delta={0.124} deltaLabel="vs. last month" />
  <Stat label="Orders" value={1_284} delta={0.031} deltaLabel="vs. last month" />
  <Stat label="Return rate" value="2.1%" delta={-0.004} deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }} goodDirection="down" deltaLabel="vs. last month" />
</div>`,
      render: () => (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-6">
          <Stat
            label="Revenue"
            value={128_400}
            valueFormat={{ notation: "compact", style: "currency", currency: "USD" }}
            delta={0.124}
            deltaLabel="vs. last month"
          />
          <Stat label="Orders" value={1_284} delta={0.031} deltaLabel="vs. last month" />
          <Stat
            label="Return rate"
            value="2.1%"
            delta={-0.004}
            deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
            goodDirection="down"
            deltaLabel="vs. last month"
          />
        </div>
      ),
    },
    examples: [
      {
        title: "Biểu đồ nhỏ & icon",
        description: "chart đặt biểu đồ cạnh con số; icon đứng trước nhãn.",
        code: `const REVENUE = [42, 45, 44, 51, 49, 56, 61, 58, 66, 71, 69, 78];

<Stat
  className="w-full max-w-sm"
  icon={<People20Regular />}
  label="Active users"
  value={78_200}
  delta={0.13}
  deltaLabel="vs. last month"
  chart={<Sparkline data={REVENUE} width={120} height={40} />}
/>`,
        render: () => (
          <Stat
            className="w-full max-w-sm"
            icon={<People20Regular />}
            label="Active users"
            value={78_200}
            delta={0.13}
            deltaLabel="vs. last month"
            chart={<Sparkline data={REVENUE} width={120} height={40} />}
          />
        ),
      },
      {
        title: "Kích thước",
        description: "medium 28px, large 40px, hero 68px — tối đa một hero mỗi màn hình.",
        code: `<div className="flex flex-wrap items-end gap-10">
  <Stat size="medium" label="Medium" value={4_210} />
  <Stat size="large" label="Large" value={4_210} />
  <Stat size="hero" label="Hero" value={4_210} />
</div>`,
        render: () => (
          <div className="flex flex-wrap items-end gap-10">
            <Stat size="medium" label="Medium" value={4_210} />
            <Stat size="large" label="Large" value={4_210} />
            <Stat size="hero" label="Hero" value={4_210} />
          </div>
        ),
      },
    ],
    dos: [
      "Ghi rõ mốc so sánh trong deltaLabel (“so với tháng trước”).",
      "Đặt goodDirection=\"down\" cho chỉ số càng thấp càng tốt: tỉ lệ lỗi, thời gian chờ, chi phí.",
      "Dùng valueFormat với style currency / unit để có đơn vị đúng locale.",
    ],
    donts: [
      "Không đặt quá 4–5 Stat trên một hàng; người đọc sẽ không biết nhìn vào đâu.",
      "Không dùng màu delta khi thay đổi không có tốt / xấu — đặt goodDirection=\"neutral\".",
    ],
    props: [
      { name: "label", type: "ReactNode", description: "Nhãn viết hoa chữ đầu câu, không dấu hai chấm." },
      { name: "value", type: "number | string", description: "Số được định dạng theo locale; chuỗi giữ nguyên." },
      { name: "valueFormat", type: "Intl.NumberFormatOptions | (value) => string", defaultValue: "rút gọn từ 10.000", description: "Định dạng con số." },
      { name: "delta", type: "number", description: "Mức thay đổi có dấu (0.124 = +12,4%)." },
      { name: "deltaFormat", type: "Intl.NumberFormatOptions | (value) => string", defaultValue: "phần trăm", description: "Định dạng delta." },
      { name: "deltaLabel", type: "ReactNode", description: "Mốc so sánh." },
      { name: "goodDirection", type: `"up" | "down" | "neutral"`, defaultValue: `"up"`, description: "Chiều tốt: quyết định màu success / danger." },
      { name: "size", type: `"medium" | "large" | "hero"`, defaultValue: `"medium"`, description: "Cỡ con số 28 / 40 / 68px." },
      { name: "icon", type: "ReactNode", description: "Icon trước nhãn." },
      { name: "chart", type: "ReactNode", description: "Biểu đồ nhỏ cạnh con số, thường là Sparkline." },
      { name: "locale", type: "string", description: "Locale cho Intl.NumberFormat; mặc định theo YugenProvider." },
    ],
  },

  /* ---------------------------------------------------------------- Prose */
  prose: {
    slug: "prose",
    name: "Prose",
    category: "Hiển thị dữ liệu",
    lead: "Prose định dạng nội dung dài từ Markdown hoặc CMS: tiêu đề, đoạn văn, danh sách, bảng, code, trích dẫn và ảnh theo thang chữ Yugen.",
    description:
      "Bọc nội dung trong `<Prose>` (hoặc thêm class `yugen-prose` của theme); các thẻ HTML bên trong được định dạng mà không cần class. Selector có độ ưu tiên 0, nên class đặt trên từng thẻ luôn thắng; thêm class `not-prose` cho phần nào cần thoát hẳn. CodeBlock, Table, Quote và Timeline đã có sẵn `not-prose`. size large (16px) cho bài viết dài, medium (14px) cho docs và ghi chú. Prose không làm sạch HTML: nội dung từ người dùng phải được sanitize trước.",
    importCode: `import { Prose } from "@/components/ui";`,
    hero: {
      title: "Prose",
      code: `<Prose className="w-full max-w-prose">
  <h2>Getting started with the API</h2>
  <p>
    Every request needs an <strong>API key</strong> in the <code>Authorization</code> header. Create one under <a href="#">Settings › Developer</a>.
  </p>
  <ol>
    <li>Create a read-only key.</li>
    <li>Store the key in an environment variable, not in source code.</li>
    <li>Try the <code>/v1/orders</code> endpoint.</li>
  </ol>
  <blockquote>
    <p>Revoke a leaked key right away. A new key works within a few seconds.</p>
  </blockquote>
  <h3>Rate limits</h3>
  <table>
    <thead>
      <tr><th>Plan</th><th>Requests / min</th></tr>
    </thead>
    <tbody>
      <tr><td>Free</td><td>60</td></tr>
      <tr><td>Pro</td><td>1,200</td></tr>
    </tbody>
  </table>
</Prose>`,
      render: () => (
        <Prose className="w-full max-w-prose">
          <h2>Getting started with the API</h2>
          <p>
            Every request needs an <strong>API key</strong> in the <code>Authorization</code> header. Create one under{" "}
            <a href="#">Settings › Developer</a>.
          </p>
          <ol>
            <li>Create a read-only key.</li>
            <li>Store the key in an environment variable, not in source code.</li>
            <li>
              Try the <code>/v1/orders</code> endpoint.
            </li>
          </ol>
          <blockquote>
            <p>Revoke a leaked key right away. A new key works within a few seconds.</p>
          </blockquote>
          <h3>Rate limits</h3>
          <table>
            <thead>
              <tr>
                <th>Plan</th>
                <th>Requests / min</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Free</td>
                <td>60</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>1,200</td>
              </tr>
            </tbody>
          </table>
        </Prose>
      ),
    },
    examples: [
      {
        title: "Bài viết & HTML từ CMS",
        description: "asChild render vào <article>; nội dung HTML đã sanitize có thể đưa vào bằng dangerouslySetInnerHTML.",
        code: `const POST_HTML = [
  "<p>Autumn in Kyoto starts in late October, when the maples at <em>Tōfuku-ji</em> turn red.</p>",
  "<h2>When to go</h2>",
  "<ul><li>Early morning, before 8 a.m., to beat the crowds.</li><li>On a weekday rather than a weekend.</li></ul>",
].join("");

function ArticleDemo() {
  return (
    <Prose asChild size="large" className="w-full max-w-prose">
      <article dangerouslySetInnerHTML={{ __html: POST_HTML }} />
    </Prose>
  );
}`,
        render: () => (
          <Prose asChild size="large" className="w-full max-w-prose">
            <article
              dangerouslySetInnerHTML={{
                __html: POST_HTML,
              }}
            />
          </Prose>
        ),
      },
      {
        title: "Thoát bằng not-prose",
        description: "Phần tử có class not-prose (và mọi thứ bên trong) giữ nguyên kiểu gốc.",
        code: `<Prose className="w-full max-w-prose">
  <p>The list below is a menu, not part of the article:</p>
  <ul className="not-prose flex flex-wrap gap-2">
    <li><Button size="small">Copy link</Button></li>
    <li><Button size="small">Share</Button></li>
  </ul>
</Prose>`,
        render: () => (
          <Prose className="w-full max-w-prose">
            <p>The list below is a menu, not part of the article:</p>
            <ul className="not-prose flex flex-wrap gap-2">
              <li>
                <Button size="small">Copy link</Button>
              </li>
              <li>
                <Button size="small">Share</Button>
              </li>
            </ul>
          </Prose>
        ),
      },
    ],
    dos: [
      "Giới hạn độ rộng dòng (max-w-prose, khoảng 65 ký tự) cho nội dung dài.",
      "Sanitize HTML từ CMS hoặc người dùng trước khi render.",
      "Dùng not-prose cho phần giao diện nằm giữa nội dung (nút, menu, form).",
    ],
    donts: [
      "Không bọc cả trang ứng dụng trong Prose; chỉ bọc phần nội dung.",
      "Không dùng Prose để định dạng một đoạn chữ ngắn — dùng Text.",
    ],
    props: [
      { name: "size", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ nền: body1 (14px) hoặc body2 (16px)." },
      { name: "asChild", type: "boolean", defaultValue: "false", description: "Render vào phần tử con duy nhất (vd. <article>)." },
    ],
  },

  /* ---------------------------------------------------------------- Markdown */
  markdown: {
    slug: "markdown",
    name: "Markdown",
    category: "Hiển thị dữ liệu",
    lead: "Markdown hiển thị nội dung viết bằng Markdown (bài viết, ghi chú phát hành, mô tả từ CMS) theo kiểu chữ của Prose, an toàn với nội dung không tin cậy.",
    description:
      "Truyền chuỗi Markdown làm children. Hỗ trợ CommonMark và phần GFM hay dùng: heading, đoạn văn, danh sách, danh sách việc, trích dẫn, bảng, code fence (tô màu bằng CodeBlock), đậm, nghiêng, gạch, code và link. Không nhận HTML: thẻ HTML hiện như chữ, link `javascript:` hay `data:` chỉ còn nhãn. Link tương đối (`/path`, `#id`) được giữ; link ngoài mở tab mới. `inline` cho đoạn một dòng: chỉ phần inline, trong một `<span>`. `renderLink` giao link cho router của app. Nội dung đang về theo từng token (câu trả lời AI) dùng StreamingMarkdown.",
    importCode: `import { Markdown } from "@/components/ui";`,
    hero: {
      title: "Markdown",
      code: `const NOTES = \`## Getting started with the API

Every request needs an **API key** in the \\\`Authorization\\\` header. Create one under [Settings](#settings).

1. Create a read-only key.
2. Store the key in an environment variable.
3. Try \\\`GET /v1/orders\\\`.

| Plan     | Requests / min |
| -------- | -------------: |
| Free     |             60 |
| Pro      |          1,200 |
\`;

<Markdown className="w-full max-w-prose">{NOTES}</Markdown>`,
      render: () => <Markdown className="w-full max-w-prose">{API_NOTES}</Markdown>,
    },
    examples: [
      {
        title: "Inline",
        description: "inline render phần inline trong một <span>, không bọc <p>: hợp với mục danh sách, ô bảng, mô tả một dòng.",
        code: `<ul className="flex flex-col gap-2 text-body1">
  <li><Markdown inline>{"Call \`sonner.promise\` to turn **loading** into the result."}</Markdown></li>
  <li><Markdown inline>{"HTML from a CMS? See [Prose](#prose)."}</Markdown></li>
</ul>`,
        render: () => (
          <ul className="flex flex-col gap-2 text-body1">
            <li>
              <Markdown inline>{"Call `sonner.promise` to turn **loading** into the result."}</Markdown>
            </li>
            <li>
              <Markdown inline>{"HTML from a CMS? See [Prose](#prose)."}</Markdown>
            </li>
          </ul>
        ),
      },
      {
        title: "Link qua router",
        description:
          "renderLink nhận href, title, nhãn và external; link nội bộ đi qua router của app (router.navigate, <Link to> của router) thay vì tải lại trang. Ví dụ thay router bằng state.",
        code: `function RouterLinkDemo() {
  const [path, setPath] = useState("/");
  return (
    <div className="flex flex-col gap-2">
      <Markdown
        renderLink={({ href, title, children, external }) =>
          external ? (
            <a href={href} title={title} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          ) : (
            // In an app: call your router's navigate(href).
            <a href={href} title={title} onClick={(e) => { e.preventDefault(); setPath(href); }}>
              {children}
            </a>
          )
        }
      >
        {"Read the [installation guide](/concepts/quick-start) or [Prose](/components/prose). Source code is on [GitHub](https://github.com)."}
      </Markdown>
      <p className="text-caption1 text-foreground-3">Path: {path}</p>
    </div>
  );
}`,
        render: () => <RouterLinkDemo />,
      },
      {
        title: "Nội dung không tin cậy",
        description: "HTML hiện như chữ, link javascript: chỉ còn nhãn; không cần sanitize trước.",
        code: `<Markdown>{'<img src=x onerror="alert(1)"> and [click here](javascript:alert(1))'}</Markdown>`,
        render: () => <Markdown>{'<img src=x onerror="alert(1)"> and [click here](javascript:alert(1))'}</Markdown>,
      },
    ],
    dos: [
      "Dùng Markdown cho nội dung viết sẵn hoặc từ CMS; dùng StreamingMarkdown cho chữ đang về theo từng token.",
      "Dùng inline cho đoạn một dòng nằm trong bố cục khác (mục danh sách, ô bảng).",
      "Bật headingIds khi trang có mục lục hoặc link tới từng heading.",
    ],
    donts: [
      "Không dùng Markdown để hiện HTML từ CMS: HTML hiện như chữ. Dùng Prose với HTML đã sanitize.",
      "Không đặt Markdown trong Prose: Markdown đã bọc Prose.",
    ],
    props: [
      { name: "children", type: "string", description: "Nội dung Markdown. Không nhận HTML." },
      { name: "inline", type: "boolean", defaultValue: "false", description: "Chỉ phần inline (đậm, nghiêng, gạch, code, link) trong một <span>, không đoạn văn." },
      { name: "size", type: `"medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ của Prose: body1 (14px) hoặc body2 (16px)." },
      { name: "headingOffset", type: "number", defaultValue: "1", description: "Cộng vào cấp heading: mặc định # → h2." },
      { name: "headingIds", type: "boolean | ((text: string) => string)", defaultValue: "false", description: "Gắn id cho heading từ chữ của nó (bỏ dấu, khử trùng bằng -2, -3); truyền hàm để tự tạo id." },
      { name: "breaks", type: "boolean", defaultValue: "false", description: "Xuống dòng đơn thành <br>." },
      { name: "renderLink", type: "(link: MarkdownLink) => ReactNode", description: "Tự render mọi link; MarkdownLink gồm href, title, children, external." },
    ],
  },
};

export const docs: ComponentDoc[] = Object.values(DOCS);
