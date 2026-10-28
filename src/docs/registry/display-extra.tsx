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
import { Prose } from "@/components/ui/Prose/Prose";
import { Sonner, sonner, type SonnerPosition } from "@/components/ui/Sonner/Sonner";
import { Stat } from "@/components/ui/Stat/Stat";
import { Switch } from "@/components/ui/Switch/Switch";
import { Timeline, TimelineItem } from "@/components/ui/Timeline/Timeline";
import type { ComponentDoc } from "../types";

/* ------------------------------------------------------------------ demos */

function SonnerDemo() {
  return (
    <>
      <Sonner sonnerId="docs-sonner" />
      <Button
        appearance="primary"
        onClick={() =>
          sonner.success("Đã lưu thay đổi", {
            description: "Tài liệu “Kế hoạch Q4” đã được lưu lên đám mây.",
            action: { label: "Hoàn tác" },
            sonnerId: "docs-sonner",
          })
        }
      >
        Lưu tài liệu
      </Button>
    </>
  );
}

function SonnerTypesDemo() {
  const options = { sonnerId: "docs-sonner-types" };
  return (
    <>
      <Sonner sonnerId="docs-sonner-types" />
      <Button onClick={() => sonner("Đã chuyển 3 tệp vào thư mục Dự án", options)}>Mặc định</Button>
      <Button onClick={() => sonner.success("Đã gửi lời mời", options)}>Success</Button>
      <Button onClick={() => sonner.info("Có bản cập nhật mới", options)}>Info</Button>
      <Button onClick={() => sonner.warning("Dung lượng sắp đầy", options)}>Warning</Button>
      <Button onClick={() => sonner.error("Không thể tải tệp lên", options)}>Error</Button>
      <Button onClick={() => sonner.loading("Đang đồng bộ…", { ...options, duration: 3000 })}>Loading</Button>
    </>
  );
}

function wait(ms: number, fail = false) {
  return new Promise<number>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Mất kết nối")) : resolve(12)), ms));
}

function SonnerPromiseDemo() {
  const run = (fail: boolean) =>
    sonner.promise(wait(1500, fail), {
      loading: "Đang lưu 12 mục…",
      success: (count) => `Đã lưu ${count} mục`,
      error: (error) => `Không lưu được: ${(error as Error).message}`,
      sonnerId: "docs-sonner-promise",
    });
  return (
    <>
      <Sonner sonnerId="docs-sonner-promise" />
      <Button appearance="primary" onClick={() => run(false)}>
        Lưu
      </Button>
      <Button onClick={() => run(true)}>Lưu (lỗi)</Button>
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
          sonner(`Thông báo ${count + 1}`, { description: "Trỏ chuột vào chồng thông báo để xem tất cả.", sonnerId: "docs-sonner-stack" });
        }}
      >
        Thêm thông báo
      </Button>
      <Switch label="Luôn xoè" checked={expand} onCheckedChange={setExpand} />
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
            sonner.warning("Vị trí " + p, {
              description: "Vuốt về phía mép để đóng.",
              cancel: { label: "Bỏ qua" },
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
  "<p>Mùa thu ở Kyoto bắt đầu từ cuối tháng 10, khi lá phong ở <em>Tōfuku-ji</em> chuyển đỏ.</p>",
  "<h2>Đi lúc nào</h2>",
  "<ul><li>Sáng sớm, trước 8 giờ, để tránh đông.</li><li>Ngày thường thay vì cuối tuần.</li></ul>",
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
          sonner.success("Đã lưu thay đổi", {
            description: "Tài liệu “Kế hoạch Q4” đã được lưu lên đám mây.",
            action: { label: "Hoàn tác" },
            sonnerId: "docs-sonner",
          })
        }
      >
        Lưu tài liệu
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
      <Button onClick={() => sonner("Đã chuyển 3 tệp vào thư mục Dự án", options)}>Mặc định</Button>
      <Button onClick={() => sonner.success("Đã gửi lời mời", options)}>Success</Button>
      <Button onClick={() => sonner.info("Có bản cập nhật mới", options)}>Info</Button>
      <Button onClick={() => sonner.warning("Dung lượng sắp đầy", options)}>Warning</Button>
      <Button onClick={() => sonner.error("Không thể tải tệp lên", options)}>Error</Button>
      <Button onClick={() => sonner.loading("Đang đồng bộ…", { ...options, duration: 3000 })}>Loading</Button>
    </>
  );
}`,
        render: () => <SonnerTypesDemo />,
      },
      {
        title: "Theo một promise",
        description: "sonner.promise hiện loading, rồi đổi tại chỗ thành success hoặc error. success / error nhận hàm để dùng kết quả.",
        code: `function wait(ms: number, fail = false) {
  return new Promise<number>((resolve, reject) => setTimeout(() => (fail ? reject(new Error("Mất kết nối")) : resolve(12)), ms));
}

function SonnerPromiseDemo() {
  const run = (fail: boolean) =>
    sonner.promise(wait(1500, fail), {
      loading: "Đang lưu 12 mục…",
      success: (count) => \`Đã lưu \${count} mục\`,
      error: (error) => \`Không lưu được: \${(error as Error).message}\`,
      sonnerId: "docs-sonner-promise",
    });
  return (
    <>
      <Sonner sonnerId="docs-sonner-promise" />
      <Button appearance="primary" onClick={() => run(false)}>
        Lưu
      </Button>
      <Button onClick={() => run(true)}>Lưu (lỗi)</Button>
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
          sonner(\`Thông báo \${count + 1}\`, { description: "Trỏ chuột vào chồng thông báo để xem tất cả.", sonnerId: "docs-sonner-stack" });
        }}
      >
        Thêm thông báo
      </Button>
      <Switch label="Luôn xoè" checked={expand} onCheckedChange={setExpand} />
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
            sonner.warning("Vị trí " + p, {
              description: "Vuốt về phía mép để đóng.",
              cancel: { label: "Bỏ qua" },
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
      code: `<Timeline aria-label="Lịch sử đơn hàng" className="w-full max-w-md">
  <TimelineItem icon={<VehicleTruckProfile20Regular />} intent="brand" title="Đang giao hàng" time="Hôm nay, 08:30" dateTime="2026-10-28T08:30">
    Giao Hàng Nhanh · mã vận đơn GHN-5520417
  </TimelineItem>
  <TimelineItem icon={<Box20Regular />} title="Đã đóng gói" time="Hôm qua, 16:05" dateTime="2026-10-27T16:05" />
  <TimelineItem icon={<Checkmark20Regular />} intent="success" title="Đã thanh toán" time="Hôm qua, 09:12" dateTime="2026-10-27T09:12" />
  <TimelineItem icon={<Avatar name="Lan Phạm" size={32} />} title={<><strong className="font-semibold">Lan Phạm</strong> đã đặt đơn #2041</>} time="Hôm qua, 09:10" dateTime="2026-10-27T09:10" />
</Timeline>`,
      render: () => (
        <Timeline aria-label="Lịch sử đơn hàng" className="w-full max-w-md">
          <TimelineItem icon={<VehicleTruckProfile20Regular />} intent="brand" title="Đang giao hàng" time="Hôm nay, 08:30" dateTime="2026-10-28T08:30">
            Giao Hàng Nhanh · mã vận đơn GHN-5520417
          </TimelineItem>
          <TimelineItem icon={<Box20Regular />} title="Đã đóng gói" time="Hôm qua, 16:05" dateTime="2026-10-27T16:05" />
          <TimelineItem icon={<Checkmark20Regular />} intent="success" title="Đã thanh toán" time="Hôm qua, 09:12" dateTime="2026-10-27T09:12" />
          <TimelineItem
            icon={<Avatar name="Lan Phạm" size={32} />}
            title={
              <>
                <strong className="font-semibold">Lan Phạm</strong> đã đặt đơn #2041
              </>
            }
            time="Hôm qua, 09:10"
            dateTime="2026-10-27T09:10"
          />
        </Timeline>
      ),
    },
    examples: [
      {
        title: "Compact",
        description: "Chấm nhỏ, tiêu đề và thời gian trên một dòng; nội dung thêm dùng chữ caption.",
        code: `<Timeline variant="compact" aria-label="Hoạt động gần đây" className="w-full max-w-md">
  <TimelineItem title="Minh đã đổi trạng thái sang Hoàn thành" time="10 phút trước" intent="success" />
  <TimelineItem title="Hà đã bình luận" time="1 giờ trước" icon={<Comment20Regular />}>
    “Mình đã cập nhật số liệu quý 3, nhờ mọi người xem lại.”
  </TimelineItem>
  <TimelineItem title="Hà đã tải lên bao-cao-q3.pdf" time="1 giờ trước" icon={<DocumentArrowUp20Regular />} />
  <TimelineItem title="Lan đã thêm 2 thành viên" time="Hôm qua" icon={<People20Regular />} />
</Timeline>`,
        render: () => (
          <Timeline variant="compact" aria-label="Hoạt động gần đây" className="w-full max-w-md">
            <TimelineItem title="Minh đã đổi trạng thái sang Hoàn thành" time="10 phút trước" intent="success" />
            <TimelineItem title="Hà đã bình luận" time="1 giờ trước" icon={<Comment20Regular />}>
              “Mình đã cập nhật số liệu quý 3, nhờ mọi người xem lại.”
            </TimelineItem>
            <TimelineItem title="Hà đã tải lên bao-cao-q3.pdf" time="1 giờ trước" icon={<DocumentArrowUp20Regular />} />
            <TimelineItem title="Lan đã thêm 2 thành viên" time="Hôm qua" icon={<People20Regular />} />
          </Timeline>
        ),
      },
      {
        title: "Intent không icon",
        description: "Không có icon thì là chấm tròn theo intent: neutral, brand, success, warning, danger.",
        code: `<Timeline aria-label="Lịch sử triển khai" className="w-full max-w-md">
  <TimelineItem intent="danger" title="Triển khai v2.4.1 thất bại" time="14:02">
    Kiểm tra sức khoẻ không đạt sau 3 lần thử; đã quay về v2.4.0.
  </TimelineItem>
  <TimelineItem intent="warning" title="Thời gian phản hồi tăng 30%" time="13:48" />
  <TimelineItem intent="success" title="Triển khai v2.4.0" time="Hôm qua" />
  <TimelineItem title="Tạo môi trường staging" time="20/10" />
</Timeline>`,
        render: () => (
          <Timeline aria-label="Lịch sử triển khai" className="w-full max-w-md">
            <TimelineItem intent="danger" title="Triển khai v2.4.1 thất bại" time="14:02">
              Kiểm tra sức khoẻ không đạt sau 3 lần thử; đã quay về v2.4.0.
            </TimelineItem>
            <TimelineItem intent="warning" title="Thời gian phản hồi tăng 30%" time="13:48" />
            <TimelineItem intent="success" title="Triển khai v2.4.0" time="Hôm qua" />
            <TimelineItem title="Tạo môi trường staging" time="20/10" />
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
  <DescriptionItem label="Mã đơn" copyable>
    DH-2041
  </DescriptionItem>
  <DescriptionItem label="Ngày đặt">27/10/2026, 09:10</DescriptionItem>
  <DescriptionItem label="Khách hàng">Lan Phạm</DescriptionItem>
  <DescriptionItem label="Email" copyable="lan.pham@example.com">
    <a className="text-link hover:underline" href="mailto:lan.pham@example.com">lan.pham@example.com</a>
  </DescriptionItem>
  <DescriptionItem label="Địa chỉ giao hàng" fullWidth>
    12 Nguyễn Trãi, phường Bến Thành, TP. Hồ Chí Minh
  </DescriptionItem>
</DescriptionList>`,
      render: () => (
        <DescriptionList columns={2} className="w-full max-w-xl">
          <DescriptionItem label="Mã đơn" copyable>
            DH-2041
          </DescriptionItem>
          <DescriptionItem label="Ngày đặt">27/10/2026, 09:10</DescriptionItem>
          <DescriptionItem label="Khách hàng">Lan Phạm</DescriptionItem>
          <DescriptionItem label="Email" copyable="lan.pham@example.com">
            <a className="text-link hover:underline" href="mailto:lan.pham@example.com">
              lan.pham@example.com
            </a>
          </DescriptionItem>
          <DescriptionItem label="Địa chỉ giao hàng" fullWidth>
            12 Nguyễn Trãi, phường Bến Thành, TP. Hồ Chí Minh
          </DescriptionItem>
        </DescriptionList>
      ),
    },
    examples: [
      {
        title: "Inline & divided",
        description: "Nhãn và giá trị cùng hàng, có đường kẻ giữa các mục — hợp với trang hồ sơ, cài đặt.",
        code: `<DescriptionList layout="inline" divided className="w-full max-w-lg">
  <DescriptionItem label="Họ tên">Trần Minh</DescriptionItem>
  <DescriptionItem label="Vai trò">Quản trị viên</DescriptionItem>
  <DescriptionItem label="Múi giờ">(UTC+07:00) Bangkok, Hà Nội, Jakarta</DescriptionItem>
  <DescriptionItem label="Mã API" copyable>
    <span className="font-mono">yg_live_51Hc…9QeD</span>
  </DescriptionItem>
</DescriptionList>`,
        render: () => (
          <DescriptionList layout="inline" divided className="w-full max-w-lg">
            <DescriptionItem label="Họ tên">Trần Minh</DescriptionItem>
            <DescriptionItem label="Vai trò">Quản trị viên</DescriptionItem>
            <DescriptionItem label="Múi giờ">(UTC+07:00) Bangkok, Hà Nội, Jakarta</DescriptionItem>
            <DescriptionItem label="Mã API" copyable>
              <span className="font-mono">yg_live_51Hc…9QeD</span>
            </DescriptionItem>
          </DescriptionList>
        ),
      },
      {
        title: "Tổng tiền",
        description: "valueAlign end đẩy giá trị về cuối hàng; mục cuối đậm hơn bằng className.",
        code: `<DescriptionList layout="inline" valueAlign="end" className="w-full max-w-xs tabular-nums">
  <DescriptionItem label="Tạm tính">1.240.000 ₫</DescriptionItem>
  <DescriptionItem label="Phí giao hàng">Miễn phí</DescriptionItem>
  <DescriptionItem label="Giảm giá">−124.000 ₫</DescriptionItem>
  <DescriptionItem label="Tổng cộng" className="border-t border-stroke-2 pt-2 font-semibold [&_dt]:text-foreground-1">
    1.116.000 ₫
  </DescriptionItem>
</DescriptionList>`,
        render: () => (
          <DescriptionList layout="inline" valueAlign="end" className="w-full max-w-xs tabular-nums">
            <DescriptionItem label="Tạm tính">1.240.000 ₫</DescriptionItem>
            <DescriptionItem label="Phí giao hàng">Miễn phí</DescriptionItem>
            <DescriptionItem label="Giảm giá">−124.000 ₫</DescriptionItem>
            <DescriptionItem label="Tổng cộng" className="border-t border-stroke-2 pt-2 font-semibold [&_dt]:text-foreground-1">
              1.116.000 ₫
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
  <Stat label="Doanh thu" value={128_400_000} valueFormat={{ notation: "compact", style: "currency", currency: "VND" }} delta={0.124} deltaLabel="so với tháng trước" />
  <Stat label="Đơn hàng" value={1_284} delta={0.031} deltaLabel="so với tháng trước" />
  <Stat label="Tỉ lệ hoàn đơn" value="2,1%" delta={-0.004} deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }} goodDirection="down" deltaLabel="so với tháng trước" />
</div>`,
      render: () => (
        <div className="grid w-full grid-cols-[repeat(auto-fit,minmax(12rem,1fr))] gap-6">
          <Stat
            label="Doanh thu"
            value={128_400_000}
            valueFormat={{ notation: "compact", style: "currency", currency: "VND" }}
            delta={0.124}
            deltaLabel="so với tháng trước"
          />
          <Stat label="Đơn hàng" value={1_284} delta={0.031} deltaLabel="so với tháng trước" />
          <Stat
            label="Tỉ lệ hoàn đơn"
            value="2,1%"
            delta={-0.004}
            deltaFormat={{ style: "percent", maximumFractionDigits: 1, signDisplay: "exceptZero" }}
            goodDirection="down"
            deltaLabel="so với tháng trước"
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
  label="Người dùng hoạt động"
  value={78_200}
  delta={0.13}
  deltaLabel="so với tháng trước"
  chart={<Sparkline data={REVENUE} width={120} height={40} />}
/>`,
        render: () => (
          <Stat
            className="w-full max-w-sm"
            icon={<People20Regular />}
            label="Người dùng hoạt động"
            value={78_200}
            delta={0.13}
            deltaLabel="so với tháng trước"
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
  <h2>Bắt đầu với API</h2>
  <p>
    Mọi yêu cầu cần <strong>khoá API</strong> trong header <code>Authorization</code>. Tạo khoá ở trang <a href="#">Cài đặt › Nhà phát triển</a>.
  </p>
  <ol>
    <li>Tạo khoá với quyền chỉ đọc.</li>
    <li>Lưu khoá vào biến môi trường, không đưa vào mã nguồn.</li>
    <li>Gọi thử endpoint <code>/v1/orders</code>.</li>
  </ol>
  <blockquote>
    <p>Khoá bị lộ phải được thu hồi ngay; khoá mới có hiệu lực sau vài giây.</p>
  </blockquote>
  <h3>Giới hạn</h3>
  <table>
    <thead>
      <tr><th>Gói</th><th>Yêu cầu / phút</th></tr>
    </thead>
    <tbody>
      <tr><td>Miễn phí</td><td>60</td></tr>
      <tr><td>Pro</td><td>1.200</td></tr>
    </tbody>
  </table>
</Prose>`,
      render: () => (
        <Prose className="w-full max-w-prose">
          <h2>Bắt đầu với API</h2>
          <p>
            Mọi yêu cầu cần <strong>khoá API</strong> trong header <code>Authorization</code>. Tạo khoá ở trang{" "}
            <a href="#">Cài đặt › Nhà phát triển</a>.
          </p>
          <ol>
            <li>Tạo khoá với quyền chỉ đọc.</li>
            <li>Lưu khoá vào biến môi trường, không đưa vào mã nguồn.</li>
            <li>
              Gọi thử endpoint <code>/v1/orders</code>.
            </li>
          </ol>
          <blockquote>
            <p>Khoá bị lộ phải được thu hồi ngay; khoá mới có hiệu lực sau vài giây.</p>
          </blockquote>
          <h3>Giới hạn</h3>
          <table>
            <thead>
              <tr>
                <th>Gói</th>
                <th>Yêu cầu / phút</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Miễn phí</td>
                <td>60</td>
              </tr>
              <tr>
                <td>Pro</td>
                <td>1.200</td>
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
  "<p>Mùa thu ở Kyoto bắt đầu từ cuối tháng 10, khi lá phong ở <em>Tōfuku-ji</em> chuyển đỏ.</p>",
  "<h2>Đi lúc nào</h2>",
  "<ul><li>Sáng sớm, trước 8 giờ, để tránh đông.</li><li>Ngày thường thay vì cuối tuần.</li></ul>",
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
  <p>Danh sách bên dưới là menu, không phải nội dung bài viết:</p>
  <ul className="not-prose flex flex-wrap gap-2">
    <li><Button size="small">Sao chép liên kết</Button></li>
    <li><Button size="small">Chia sẻ</Button></li>
  </ul>
</Prose>`,
        render: () => (
          <Prose className="w-full max-w-prose">
            <p>Danh sách bên dưới là menu, không phải nội dung bài viết:</p>
            <ul className="not-prose flex flex-wrap gap-2">
              <li>
                <Button size="small">Sao chép liên kết</Button>
              </li>
              <li>
                <Button size="small">Chia sẻ</Button>
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
};

export const docs: ComponentDoc[] = Object.values(DOCS);
