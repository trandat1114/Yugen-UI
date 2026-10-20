import { useState } from "react";
import { DirectionProvider } from "@radix-ui/react-direction";
import { ArrowClockwise20Regular, Delete20Regular, Mail20Regular } from "@fluentui/react-icons";
import {
  AsyncContent,
  Avatar,
  Badge,
  Button,
  createColumn,
  DataGrid,
  TableCellLayout,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  type DataGridSortState,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import RAW from "./phase3-datagrid.tsx?raw";

/*
 * `code` của mỗi ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`), nên luôn trùng
 * từng ký tự với component mà `render` hiển thị.
 */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");

function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      if (start < 0 || end < 0) return `// Không tìm thấy mã nguồn "${name}"`;
      return LINES.slice(start + 1, end).join("\n").trim();
    })
    .join("\n\n");
}

// #region data
type Order = {
  id: string;
  customer: string;
  email: string;
  status: "paid" | "pending" | "failed";
  amount: number;
  date: string;
};

const CUSTOMERS = [
  "Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Minh Dũng", "Hoàng Thu Hà",
  "Vũ Quốc Khánh", "Đặng Mai Linh", "Bùi Thanh Nam", "Đỗ Ngọc Oanh", "Ngô Đức Phúc",
];
const STATUSES = ["paid", "pending", "paid", "failed", "paid"] as const;

/** Sinh dữ liệu tất định (không random) — cùng kết quả ở mọi lần render và trên server. */
function makeOrders(count: number): Order[] {
  return Array.from({ length: count }, (_, i) => {
    const customer = CUSTOMERS[(i * 7) % CUSTOMERS.length];
    return {
      id: "DH-" + String(10001 + i),
      customer,
      email: "kh" + ((i * 7) % CUSTOMERS.length) + "@contoso.vn",
      status: STATUSES[(i * 3) % STATUSES.length],
      amount: 150000 + ((i * 7919) % 97) * 65000,
      date: "2026-" + String(1 + (i % 12)).padStart(2, "0") + "-" + String(1 + ((i * 11) % 28)).padStart(2, "0"),
    };
  });
}

const ORDERS = makeOrders(20);

const STATUS = {
  paid: { label: "Đã thanh toán", color: "success" },
  pending: { label: "Đang xử lý", color: "warning" },
  failed: { label: "Thất bại", color: "danger" },
} as const;

const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

const orderColumns = [
  createColumn<Order>({
    columnId: "customer",
    renderHeaderCell: () => "Khách hàng",
    renderCell: (order) => (
      <TableCellLayout truncate media={<Avatar name={order.customer} size={24} color="colorful" />}>
        {order.customer}
      </TableCellLayout>
    ),
    compare: (a, b) => a.customer.localeCompare(b.customer, "vi"),
    minWidth: 160,
  }),
  createColumn<Order>({
    columnId: "id",
    renderHeaderCell: () => "Mã đơn",
    renderCell: (order) => order.id,
    compare: (a, b) => a.id.localeCompare(b.id),
    width: 104,
  }),
  createColumn<Order>({
    columnId: "status",
    renderHeaderCell: () => "Trạng thái",
    renderCell: (order) => (
      <Badge appearance="tint" color={STATUS[order.status].color}>
        {STATUS[order.status].label}
      </Badge>
    ),
    compare: (a, b) => a.status.localeCompare(b.status),
    width: 140,
  }),
  createColumn<Order>({
    columnId: "date",
    renderHeaderCell: () => "Ngày",
    renderCell: (order) => order.date.split("-").reverse().join("/"),
    compare: (a, b) => a.date.localeCompare(b.date),
    width: 112,
  }),
  createColumn<Order>({
    columnId: "amount",
    renderHeaderCell: () => "Số tiền",
    renderCell: (order) => vnd.format(order.amount),
    compare: (a, b) => a.amount - b.amount,
    width: 130,
    align: "end",
  }),
];
// #endregion

// #region HeroDemo
function HeroDemo() {
  return (
    <DataGrid
      aria-label="Đơn hàng"
      items={ORDERS}
      columns={orderColumns}
      getRowId={(order) => order.id}
      sortable
      defaultSortState={{ sortColumn: "date", sortDirection: "descending" }}
      selectionMode="multiselect"
      resizableColumns
      height={360}
      className="rounded-xlarge border border-stroke-2"
    />
  );
}
// #endregion

// #region SortDemo
function SortDemo() {
  const [sortState, setSortState] = useState<DataGridSortState>({ sortColumn: "amount", sortDirection: "descending" });

  return (
    <div className="flex w-full flex-col gap-S">
      <span className="text-caption1 text-foreground-3">
        Đang sắp xếp: {sortState.sortColumn} · {sortState.sortDirection === "ascending" ? "tăng dần" : "giảm dần"}
      </span>
      <DataGrid
        aria-label="Đơn hàng sắp xếp"
        items={ORDERS.slice(0, 6)}
        columns={orderColumns}
        getRowId={(order) => order.id}
        sortable
        sortState={sortState}
        onSortChange={(_, next) => setSortState(next)}
        size="small"
        className="rounded-xlarge border border-stroke-2"
      />
    </div>
  );
}
// #endregion

// #region SelectionDemo
function SelectionDemo() {
  const [orders, setOrders] = useState(() => ORDERS.slice(0, 8));
  const [selected, setSelected] = useState<ReadonlySet<string>>(() => new Set(["DH-10002"]));

  const remove = () => {
    setOrders((prev) => prev.filter((order) => !selected.has(order.id)));
    setSelected(new Set());
  };

  return (
    <div className="flex w-full flex-col gap-S">
      <Toolbar aria-label="Thao tác với đơn đã chọn" className="rounded-xlarge border border-stroke-2">
        <span role="status" className="px-S text-body1 font-semibold">
          Đã chọn {selected.size} / {orders.length}
        </span>
        <ToolbarDivider />
        <ToolbarButton icon={<Mail20Regular />} disabled={selected.size === 0}>
          Gửi email
        </ToolbarButton>
        <ToolbarButton icon={<Delete20Regular />} disabled={selected.size === 0} onClick={remove}>
          Xoá
        </ToolbarButton>
      </Toolbar>
      <DataGrid
        aria-label="Đơn hàng có thể chọn"
        items={orders}
        columns={orderColumns.slice(0, 3)}
        getRowId={(order) => order.id}
        selectionMode="multiselect"
        selectedItems={selected}
        onSelectionChange={(_, data) => setSelected(data.selectedItems)}
        size="small"
        className="rounded-xlarge border border-stroke-2"
      />
    </div>
  );
}
// #endregion

// #region ResizeDemo
function ResizeDemo() {
  const [last, setLast] = useState("Kéo mép phải tiêu đề, hoặc Tab tới tay nắm rồi dùng phím mũi tên.");

  return (
    <div className="flex w-full flex-col gap-S">
      <span className="text-caption1 text-foreground-3">{last}</span>
      <DataGrid
        aria-label="Đơn hàng đổi được độ rộng cột"
        items={ORDERS.slice(0, 5)}
        columns={orderColumns.map((column, i) => (i === 0 ? { ...column, sticky: "start" as const, width: 200 } : column))}
        getRowId={(order) => order.id}
        selectionMode="single"
        resizableColumns
        onColumnResize={(_, data) => setLast(`Cột ${data.columnId}: ${data.width}px`)}
        className="rounded-xlarge border border-stroke-2"
      />
    </div>
  );
}
// #endregion

// #region VirtualDemo
const MANY_ORDERS = makeOrders(10000);

function VirtualDemo() {
  return (
    <DataGrid
      aria-label="10 000 đơn hàng"
      items={MANY_ORDERS}
      columns={orderColumns}
      getRowId={(order) => order.id}
      sortable
      selectionMode="multiselect"
      virtualized
      height={400}
      className="rounded-xlarge border border-stroke-2"
    />
  );
}
// #endregion

// #region StatesDemo
type Scenario = "success" | "empty" | "error";

function StatesDemo() {
  const [scenario, setScenario] = useState<Scenario>("success");
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [orders, setOrders] = useState(() => ORDERS.slice(0, 4));

  const load = (next: Scenario) =>
    new Promise<void>((resolve) => {
      setScenario(next);
      setLoading(true);
      setFailed(false);
      window.setTimeout(() => {
        setLoading(false);
        setFailed(next === "error");
        setOrders(next === "success" ? ORDERS.slice(4, 8) : []);
        resolve();
      }, 1500);
    });

  return (
    <div className="flex w-full flex-col gap-S">
      <div className="flex flex-wrap gap-S">
        <Button size="small" icon={<ArrowClockwise20Regular />} onClick={() => load("success")}>
          Tải lại
        </Button>
        <Button size="small" onClick={() => load("empty")}>
          Trả về rỗng
        </Button>
        <Button size="small" onClick={() => load("error")}>
          Giả lập lỗi
        </Button>
      </div>
      <AsyncContent status={failed ? "error" : "success"} onRetry={() => load(scenario === "error" ? "success" : scenario)}>
        <DataGrid
          aria-label="Đơn hàng từ máy chủ"
          items={orders}
          columns={orderColumns.slice(0, 3)}
          getRowId={(order) => order.id}
          loading={loading}
          size="small"
          className="rounded-xlarge border border-stroke-2"
        />
      </AsyncContent>
    </div>
  );
}
// #endregion

// #region RtlDemo
type City = { id: string; name: string; country: string; population: number };

const CITIES: City[] = [
  { id: "cai", name: "القاهرة", country: "مصر", population: 22183 },
  { id: "riy", name: "الرياض", country: "السعودية", population: 7682 },
  { id: "dub", name: "دبي", country: "الإمارات", population: 3604 },
];

const cityColumns = [
  createColumn<City>({ columnId: "name", renderHeaderCell: () => "المدينة", renderCell: (c) => c.name, compare: (a, b) => a.name.localeCompare(b.name, "ar") }),
  createColumn<City>({ columnId: "country", renderHeaderCell: () => "الدولة", renderCell: (c) => c.country }),
  createColumn<City>({
    columnId: "population",
    renderHeaderCell: () => "السكان (ألف)",
    renderCell: (c) => c.population.toLocaleString("ar"),
    compare: (a, b) => a.population - b.population,
    align: "end",
  }),
];

function RtlDemo() {
  return (
    <DirectionProvider dir="rtl">
      <div dir="rtl" className="w-full">
        <DataGrid
          aria-label="المدن"
          items={CITIES}
          columns={cityColumns}
          getRowId={(city) => city.id}
          sortable
          selectionMode="multiselect"
          resizableColumns
          size="small"
          className="rounded-xlarge border border-stroke-2"
        />
      </div>
    </DirectionProvider>
  );
}
// #endregion

export const docs: ComponentDoc[] = [
  {
    slug: "datagrid",
    name: "DataGrid",
    category: "Hiển thị dữ liệu",
    lead: "DataGrid là lưới dữ liệu tương tác: sắp xếp, chọn hàng, kéo đổi độ rộng cột và ảo hoá cho hàng chục nghìn hàng.",
    description:
      "Tương đương DataGrid của Fluent 2. Khai báo cột bằng createColumn<T>() (renderHeaderCell, renderCell, compare, width…), truyền items + getRowId. Lưới có role=\"grid\" với aria-rowcount / aria-rowindex đúng cả khi ảo hoá, một tab stop duy nhất (roving tabindex): mũi tên đi từng ô (đảo trái / phải trong RTL), Home / End, Ctrl + Home / End, PageUp / PageDown; Space chọn hàng, Shift + mũi tên hoặc Shift + click chọn theo khoảng. Tiêu đề sticky; loading hiện khung xương theo Wait UX (useSpinDelay), không có hàng thì hiện Empty. Logic dùng lại được qua useDataGridSort, useDataGridSelection và hàm thuần sortItems.",
    importCode: `import {
  DataGrid, createColumn, sortItems, useDataGridSort, useDataGridSelection,
  type DataGridColumn, type DataGridSortState,
} from "@/components/ui";`,
    hero: {
      title: "Đơn hàng",
      description: "Bấm tiêu đề để sắp xếp, click hàng hoặc Space để chọn, kéo mép tiêu đề để đổi độ rộng.",
      code: source("data", "HeroDemo"),
      render: () => <HeroDemo />,
    },
    examples: [
      {
        title: "Sắp xếp (điều khiển từ ngoài)",
        description: "Cột có compare mới sắp xếp được; sắp xếp ổn định, aria-sort trên tiêu đề, icon kèm chữ cho trình đọc màn hình.",
        code: source("SortDemo"),
        setup: source("data"),
        render: () => <SortDemo />,
      },
      {
        title: "Chọn nhiều + thanh công cụ",
        description: "selectedItems / onSelectionChange là Set<string> các id. Checkbox tiêu đề có trạng thái indeterminate.",
        code: source("SelectionDemo"),
        setup: source("data"),
        render: () => <SelectionDemo />,
      },
      {
        title: "Đổi độ rộng cột, ghim cột đầu",
        description: "Tay nắm nhận focus khi Tab từ ô tiêu đề: ← / → ±10px, Shift ±50px, nhấp đúp để vừa nội dung. Cột sticky giữ nguyên khi cuộn ngang.",
        code: source("ResizeDemo"),
        setup: source("data"),
        render: () => <ResizeDemo />,
      },
      {
        title: "Ảo hoá 10 000 hàng",
        description: "virtualized + height: chỉ render các hàng trong khung nhìn (+ overscan). Ctrl + End cuộn tới và focus hàng cuối.",
        code: source("VirtualDemo"),
        setup: source("data"),
        render: () => <VirtualDemo />,
      },
      {
        title: "Đang tải · rỗng · lỗi",
        description: "loading hiện khung xương sau 300ms (giữ ≥ 500ms); rỗng hiện Empty; lỗi do AsyncContent lo, kèm nút Thử lại.",
        code: source("StatesDemo"),
        setup: source("data"),
        render: () => <StatesDemo />,
      },
      {
        title: "RTL",
        description: "Cột xếp phải → trái, ArrowLeft đi về cuối dòng, kéo tay nắm sang trái để nới rộng cột. Không cần prop riêng — đọc từ DirectionProvider / YugenProvider.",
        code: source("RtlDemo"),
        setup: source("data"),
        render: () => <RtlDemo />,
      },
    ],
    dos: [
      "Đặt aria-label (hoặc aria-labelledby) cho lưới và getRowId trả về id ổn định — không dùng chỉ số mảng.",
      "Bật virtualized cho danh sách > vài trăm hàng, kèm height cố định và rowHeight bằng nhau.",
      "Dùng align=\"end\" cho cột số / tiền tệ và width cố định cho cột hẹp; để cột chính co giãn.",
    ],
    donts: [
      "Không đặt nhiều nút bấm trong mỗi ô — mỗi nút là một tab stop; gom vào một Menu thao tác.",
      "Không dùng DataGrid cho bố cục hay danh sách thẻ — dùng Table (tĩnh) hoặc List.",
      "Không tự hiện spinner riêng khi tải lại — dùng prop loading để không nháy loader dưới 300ms.",
    ],
    props: [
      { name: "items", type: "readonly T[]", description: "Dữ liệu theo thứ tự gốc; T được suy ra cho columns và getRowId." },
      { name: "columns", type: "DataGridColumn<T>[]", description: "Tạo bằng createColumn<T>({ columnId, renderHeaderCell, renderCell, compare?, width?, minWidth?, maxWidth?, resizable?, align?, sticky? })." },
      { name: "getRowId", type: "(item: T) => string", description: "Id ổn định của hàng (key, lựa chọn)." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Chiều cao hàng 34 / 44 / 56px." },
      { name: "sortable", type: "boolean", defaultValue: "false", description: "Bấm / Enter / Space trên tiêu đề cột có compare để sắp xếp (cùng cột → đảo chiều)." },
      { name: "sortState / defaultSortState", type: "{ sortColumn: string | undefined; sortDirection: \"ascending\" | \"descending\" }", description: "Trạng thái sắp xếp (điều khiển / ban đầu)." },
      { name: "onSortChange", type: "(event, state) => void", description: "Gọi khi đổi cột hoặc chiều sắp xếp." },
      { name: "selectionMode", type: `"single" | "multiselect"`, description: "Bật cột chọn. Không truyền = không chọn được." },
      { name: "selectedItems / defaultSelectedItems", type: "ReadonlySet<string> / Iterable<string>", description: "Tập id đang chọn (điều khiển / ban đầu)." },
      { name: "onSelectionChange", type: "(event, { selectedItems: Set<string> }) => void", description: "Gọi khi lựa chọn đổi (click, Space, Shift + mũi tên, chọn tất cả, Ctrl + A)." },
      { name: "selectionAppearance", type: `"brand" | "neutral" | "none"`, defaultValue: `"brand"`, description: "Nền hàng đã chọn." },
      { name: "subtleSelection", type: "boolean", defaultValue: "false", description: "Checkbox chỉ hiện khi hover / focus hoặc khi hàng đã chọn." },
      { name: "resizableColumns", type: "boolean", defaultValue: "false", description: "Tay nắm đổi độ rộng ở mép cuối tiêu đề (chuột, cảm ứng, bàn phím; nhấp đúp = vừa nội dung)." },
      { name: "columnSizingOptions", type: "Record<columnId, { defaultWidth?, minWidth?, maxWidth? }>", description: "Ghi đè kích thước theo cột (giống Fluent)." },
      { name: "onColumnResize", type: "(event, { columnId, width }) => void", description: "Gọi khi độ rộng cột đổi. Không lưu gì mặc định." },
      { name: "virtualized", type: "boolean", defaultValue: "false", description: "Chỉ render hàng trong khung nhìn; aria-rowcount / aria-rowindex vẫn là tổng số thật." },
      { name: "rowHeight", type: "number", description: "Chiều cao hàng (px), mặc định theo size." },
      { name: "height", type: "number | string", description: "Chiều cao khung cuộn. virtualized mà không truyền → 400px (h-100)." },
      { name: "overscan", type: "number", defaultValue: "6", description: "Số hàng render thêm trên / dưới khung nhìn." },
      { name: "focusMode", type: `"cell" | "row"`, defaultValue: `"cell"`, description: "Mũi tên đi từng ô hoặc từng hàng." },
      { name: "loading", type: "boolean", defaultValue: "false", description: "Khung xương sau 300ms, giữ ≥ 500ms (useSpinDelay); aria-busy trên lưới." },
      { name: "empty", type: "ReactNode", description: "Nội dung khi không có hàng; mặc định Empty \"Không có dữ liệu\"." },
      { name: "useDataGridSort / useDataGridSelection / sortItems", type: "hook / hook / (items, columns, sortState) => T[]", description: "Logic dùng riêng được — ví dụ để sắp xếp phía server hoặc điều khiển lựa chọn từ toolbar." },
    ],
  },
];
