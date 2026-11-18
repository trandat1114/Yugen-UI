import * as React from "react";
import { ArrowClockwise20Regular, DocumentSearch24Regular, ErrorCircle24Regular } from "@fluentui/react-icons";
import {
  Badge,
  Button,
  createColumn,
  DataGrid,
  DataGridColumnPicker,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Switch,
  ToggleGroup,
  ToggleGroupItem,
  useElementSize,
  useMediaQuery,
  type DataGridColumn,
} from "@/components/ui";
import { cn } from "@/lib/cn";

/*
 * Ví dụ cho trang "Bảng dữ liệu dày đặc" (#412), dùng chung cho bản tiếng Việt và tiếng Anh: chữ giao diện truyền qua
 * `text`, dữ liệu khách hàng luôn là tiếng Việt (tên và địa chỉ dài là mục đích của ví dụ) và mang lang="vi".
 */

type Tier = "gold" | "silver" | "bronze";

export interface Customer {
  id: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  province: string;
  tier: Tier;
  orders: number;
  balance: number;
  updated: string;
}

export const CUSTOMERS: Customer[] = [
  { id: "KH-000231", name: "Nguyễn Thị Thanh Hương", phone: "0912 345 678", email: "huong.nguyen@hoanggiaphat.example", address: "Số 18 ngõ 102 Trường Chinh, phường Phương Mai, quận Đống Đa", province: "Hà Nội", tier: "gold", orders: 128, balance: 48250000, updated: "2026-11-12" },
  { id: "KH-000232", name: "Công ty TNHH Thương mại và Dịch vụ Hoàng Gia Phát", phone: "028 3823 4567", email: "ketoan@hoanggiaphat.example", address: "Tầng 12, tòa nhà Thương mại Sài Gòn, 37 Tôn Đức Thắng, phường Bến Nghé, quận 1", province: "TP. Hồ Chí Minh", tier: "gold", orders: 342, balance: 1275900000, updated: "2026-11-15" },
  { id: "KH-000245", name: "Trần Quốc Bảo Long", phone: "0987 654 321", address: "123/45/6 Nguyễn Văn Linh, phường Tân Phong, quận 7", province: "TP. Hồ Chí Minh", tier: "silver", orders: 17, balance: 0, updated: "2026-10-30" },
  { id: "KH-000251", name: "Lê Hoàng Minh Khôi", phone: "0905 112 233", email: "khoi.le@example.com", address: "Thôn Phú Mỹ, xã Hòa Phú, huyện Hòa Vang", province: "Đà Nẵng", tier: "bronze", orders: 4, balance: 1350000, updated: "2026-09-02" },
  { id: "KH-000260", name: "Công ty Cổ phần Đầu tư Xây dựng Sông Hồng Việt Nam", phone: "024 3974 1188", email: "info@songhong.example", address: "Lô B2-15 Khu công nghiệp Thăng Long, xã Kim Chung, huyện Đông Anh", province: "Hà Nội", tier: "gold", orders: 96, balance: 3480000000, updated: "2026-11-17" },
  { id: "KH-000274", name: "Phạm Ngọc Bích Trâm", email: "tram.pham@example.com", address: "Số 5 Lê Lợi, phường Vĩnh Ninh", province: "Thừa Thiên Huế", tier: "silver", orders: 23, balance: 2100000, updated: "2026-10-08" },
  { id: "KH-000288", name: "Võ Thị Kim Ngân", phone: "0938 221 445", email: "kimngan.vo@example.com", address: "Ấp Tân Hòa, xã Tân Phú Trung, huyện Củ Chi", province: "TP. Hồ Chí Minh", tier: "bronze", orders: 2, balance: 0, updated: "2026-08-21" },
  { id: "KH-000293", name: "Hộ kinh doanh Đặng Văn Hùng Cường", phone: "0263 3822 019", address: "Số 27 đường 3 Tháng 2, phường 10", province: "Lâm Đồng", tier: "silver", orders: 41, balance: 12600000, updated: "2026-11-01" },
  { id: "KH-000301", name: "Huỳnh Lê Bảo Châu", phone: "0909 778 899", email: "baochau.huynh@chaugroup.example", address: "Căn hộ 2405, tháp A, chung cư Thảo Điền Xanh, 208 Nguyễn Hữu Cảnh, phường 22, quận Bình Thạnh", province: "TP. Hồ Chí Minh", tier: "gold", orders: 77, balance: 86400000, updated: "2026-11-16" },
  { id: "KH-000315", name: "Bùi Thị Mỹ Duyên", phone: "0292 3761 552", email: "duyen.bui@example.edu.vn", address: "Khu dân cư 91B, phường An Khánh, quận Ninh Kiều", province: "Cần Thơ", tier: "bronze", orders: 9, balance: 450000, updated: "2026-07-14" },
  { id: "KH-000322", name: "Ngô Đức Phúc", phone: "0254 3855 120", email: "phuc.ngo@cangbien.example", address: "Số 1 Hạ Long, phường 2", province: "Bà Rịa - Vũng Tàu", tier: "silver", orders: 35, balance: 7890000, updated: "2026-10-27" },
  { id: "KH-000337", name: "Công ty TNHH Một thành viên Nông sản Xuất khẩu Tây Nguyên Xanh", phone: "0262 3956 777", email: "export@taynguyenxanh.example", address: "Km 7 Quốc lộ 14, xã Hòa Thắng, thành phố Buôn Ma Thuột", province: "Đắk Lắk", tier: "gold", orders: 154, balance: 642000000, updated: "2026-11-14" },
];

export interface DataTableText {
  /** Locale cho số tiền (VND) và ngày. */
  locale: string;
  grid: string;
  /** Tên nút chọn cột: riêng cho bảng này, không trùng nút "Cột" của bảng khác trên trang. */
  picker: string;
  count: (n: number) => string;
  selected: (n: number) => string;
  density: string;
  comfortable: string;
  compact: string;
  bodyText: string;
  state: string;
  states: Record<"data" | "loading" | "empty" | "error", string>;
  columns: Record<"name" | "code" | "phone" | "email" | "address" | "province" | "tier" | "orders" | "balance" | "updated", string>;
  tiers: Record<Tier, string>;
  /** Chữ cho trình đọc màn hình ở ô trống (trên màn hình là "—"). */
  none: string;
  emptyTitle: string;
  emptyDescription: string;
  clearFilters: string;
  errorTitle: string;
  errorDescription: string;
  retry: string;
  /** Độ rộng đo được của lưới và tổng độ rộng tối thiểu của các cột đang hiện. */
  measure: (grid: number, need: number) => string;
}

const TIER_COLOR = { gold: "warning", silver: "informative", bronze: "subtle" } as const;

/** Chữ dài (tên, địa chỉ) xuống dòng thay vì bị cắt: không có dữ liệu nào chỉ thấy được qua tooltip. */
function Wrap({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return <span className={cn("min-w-0 py-1 wrap-break-word", className)} {...props} />;
}

function NotProvided({ label }: { label: string }) {
  return (
    <>
      <span aria-hidden className="text-foreground-3">
        —
      </span>
      <span className="sr-only">{label}</span>
    </>
  );
}

/**
 * Mỗi cột có một quy tắc độ rộng: cố định cho mã, số, ngày; tối thiểu + co giãn cho chữ dài. `narrow` (< 640px): cột tên
 * hẹp lại và không ghim, để phần cuộn ngang còn chỗ.
 */
export function customerColumns(t: DataTableText, narrow = false): DataGridColumn<Customer>[] {
  const money = new Intl.NumberFormat(t.locale, { style: "currency", currency: "VND", maximumFractionDigits: 0 });
  const count = new Intl.NumberFormat(t.locale);
  const date = new Intl.DateTimeFormat(t.locale, { dateStyle: "short", timeZone: "UTC" });
  const c = t.columns;
  return [
    createColumn<Customer>({
      columnId: "name",
      label: c.name,
      renderCell: (row) => <Wrap className="font-semibold" lang="vi">{row.name}</Wrap>,
      compare: (a, b) => a.name.localeCompare(b.name, "vi"),
      width: narrow ? 176 : 240,
      sticky: narrow ? undefined : "start",
      hideable: false,
    }),
    createColumn<Customer>({ columnId: "code", label: c.code, renderCell: (row) => row.id, compare: (a, b) => a.id.localeCompare(b.id), width: 120 }),
    createColumn<Customer>({
      columnId: "phone",
      label: c.phone,
      renderCell: (row) => (row.phone ? <span className="whitespace-nowrap">{row.phone}</span> : <NotProvided label={t.none} />),
      width: 144,
    }),
    createColumn<Customer>({
      columnId: "email",
      label: c.email,
      renderCell: (row) => (row.email ? <Wrap className="wrap-anywhere">{row.email}</Wrap> : <NotProvided label={t.none} />),
      minWidth: 220,
    }),
    createColumn<Customer>({
      columnId: "address",
      label: c.address,
      renderCell: (row) => <Wrap lang="vi">{row.address}</Wrap>,
      minWidth: 300,
    }),
    createColumn<Customer>({
      columnId: "province",
      label: c.province,
      renderCell: (row) => <Wrap lang="vi">{row.province}</Wrap>,
      compare: (a, b) => a.province.localeCompare(b.province, "vi"),
      width: 160,
    }),
    createColumn<Customer>({
      columnId: "tier",
      label: c.tier,
      renderCell: (row) => (
        <Badge appearance="tint" color={TIER_COLOR[row.tier]}>
          {t.tiers[row.tier]}
        </Badge>
      ),
      width: 112,
    }),
    createColumn<Customer>({
      columnId: "orders",
      label: c.orders,
      renderCell: (row) => count.format(row.orders),
      compare: (a, b) => a.orders - b.orders,
      width: 104,
      align: "end",
    }),
    createColumn<Customer>({
      columnId: "balance",
      label: c.balance,
      renderCell: (row) => money.format(row.balance),
      compare: (a, b) => a.balance - b.balance,
      width: 168,
      align: "end",
    }),
    createColumn<Customer>({
      columnId: "updated",
      label: c.updated,
      renderCell: (row) => date.format(new Date(row.updated)),
      compare: (a, b) => a.updated.localeCompare(b.updated),
      width: 120,
    }),
  ];
}

/** Cột mặc định của bảng: "Đặt lại cột" đưa về đây. */
const DEFAULT_VIEW = { hiddenColumns: ["phone"] };
const SELECTION_PX = 44;

type State = keyof DataTableText["states"];
type Density = "comfortable" | "compact";

export function CustomerDirectoryDemo({ text: t }: { text: DataTableText }) {
  const narrow = !useMediaQuery("(min-width: 40rem)", { defaultValue: true });
  const columns = React.useMemo(() => customerColumns(t, narrow), [t, narrow]);
  const [hiddenColumns, setHiddenColumns] = React.useState<ReadonlySet<string>>(() => new Set(DEFAULT_VIEW.hiddenColumns));
  const [columnOrder, setColumnOrder] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<ReadonlySet<string>>(() => new Set());
  const [density, setDensity] = React.useState<Density>("compact");
  const [largeText, setLargeText] = React.useState(false);
  const [state, setState] = React.useState<State>("data");
  const { ref, width } = useElementSize<HTMLDivElement>({ box: "border-box" });

  const items = state === "data" ? CUSTOMERS : [];
  // Tổng độ rộng tối thiểu của các cột đang hiện (cột chọn 44px): hẹp hơn thì lưới cuộn ngang, cột Khách hàng đứng yên.
  const need =
    SELECTION_PX +
    columns
      .filter((c) => c.hideable === false || !hiddenColumns.has(c.columnId))
      .reduce((sum, c) => sum + (c.width ?? c.minWidth ?? 80), 0);

  const empty =
    state === "error" ? (
      <Empty role="alert">
        <EmptyHeader>
          <EmptyMedia>
            <ErrorCircle24Regular />
          </EmptyMedia>
          <EmptyTitle>{t.errorTitle}</EmptyTitle>
          <EmptyDescription>{t.errorDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="small" icon={<ArrowClockwise20Regular />} onClick={() => setState("data")}>
            {t.retry}
          </Button>
        </EmptyContent>
      </Empty>
    ) : (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            <DocumentSearch24Regular />
          </EmptyMedia>
          <EmptyTitle>{t.emptyTitle}</EmptyTitle>
          <EmptyDescription>{t.emptyDescription}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="small" onClick={() => setState("data")}>
            {t.clearFilters}
          </Button>
        </EmptyContent>
      </Empty>
    );

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 rounded-2xlarge border border-stroke-2 bg-background-1 p-3 @3xl:p-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ToggleGroup
          type="single"
          size="small"
          aria-label={t.density}
          value={density}
          onValueChange={(v) => v && setDensity(v as Density)}
        >
          <ToggleGroupItem value="comfortable">{t.comfortable}</ToggleGroupItem>
          <ToggleGroupItem value="compact">{t.compact}</ToggleGroupItem>
        </ToggleGroup>
        <ToggleGroup type="single" size="small" aria-label={t.state} value={state} onValueChange={(v) => v && setState(v as State)}>
          {(Object.keys(t.states) as State[]).map((s) => (
            <ToggleGroupItem key={s} value={s}>
              {t.states[s]}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
        <Switch label={t.bodyText} checked={largeText} onCheckedChange={setLargeText} />
      </div>

      <div className="flex items-center justify-between gap-2">
        <p role="status" className="min-w-0 text-body1 font-semibold">
          {selected.size > 0 ? t.selected(selected.size) : t.count(items.length)}
        </p>
        <DataGridColumnPicker
          compact
          mode="auto"
          resettable={DEFAULT_VIEW}
          size="small"
          columns={columns}
          hiddenColumns={hiddenColumns}
          onHiddenColumnsChange={(_, data) => setHiddenColumns(data.hiddenColumns)}
          columnOrder={columnOrder}
          onColumnOrderChange={(_, data) => setColumnOrder(data.columnOrder)}
        >
          {t.picker}
        </DataGridColumnPicker>
      </div>

      <div ref={ref} className="min-w-0">
        <DataGrid
          aria-label={t.grid}
          items={items}
          columns={columns}
          getRowId={(row) => row.id}
          hiddenColumns={hiddenColumns}
          columnOrder={columnOrder}
          sortable
          defaultSortState={{ sortColumn: "name", sortDirection: "ascending" }}
          selectionMode="multiselect"
          selectedItems={selected}
          onSelectionChange={(_, data) => setSelected(data.selectedItems)}
          size={density === "compact" ? "small" : "medium"}
          loading={state === "loading"}
          empty={empty}
          // Chiều cao cố định: tải, rỗng và lỗi hiện trong cùng một khung, trang không nhảy.
          height="28rem"
          className={cn("rounded-xlarge border border-stroke-2", largeText && "text-body2")}
        />
      </div>
      <p className="text-caption1 text-foreground-3 tabular-nums">{t.measure(Math.round(width), need)}</p>
    </div>
  );
}
