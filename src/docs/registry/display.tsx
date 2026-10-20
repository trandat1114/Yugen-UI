import { useState } from "react";
import {
  Archive20Regular,
  ArrowUndo20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  Color20Regular,
  Copy20Regular,
  Delete20Regular,
  Document20Regular,
  DocumentPdf20Regular,
  DocumentText20Regular,
  Edit20Regular,
  Eye20Regular,
  Folder20Regular,
  Image20Regular,
  Keyboard20Regular,
  Mail20Regular,
  MoreHorizontal20Regular,
  People20Regular,
  Search20Regular,
  Send20Regular,
  Star20Regular,
  WeatherMoon20Regular,
} from "@fluentui/react-icons";
import { Avatar } from "@/components/ui/Avatar/Avatar";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { Input } from "@/components/ui/Input/Input";
import { Menu, MenuDivider, MenuItem, MenuPopover, MenuTrigger } from "@/components/ui/Menu/Menu";
import { BloomArt } from "@/components/ui/Decorative/Decorative";
import { AvatarGroup, AvatarGroupItem } from "@/components/ui/AvatarGroup/AvatarGroup";
import { Persona } from "@/components/ui/Persona/Persona";
import {
  Body1,
  Body1Strong,
  Body2,
  Caption1,
  Caption1Strong,
  Caption2,
  Display,
  LargeTitle,
  Subtitle1,
  Subtitle2,
  Text,
  Title1,
  Title2,
  Title3,
} from "@/components/ui/Text/Text";
import { AspectRatio, Image } from "@/components/ui/Image/Image";
import { List, ListItem } from "@/components/ui/List/List";
import {
  Table,
  TableBody,
  TableCell,
  TableCellActions,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  type TableSortDirection,
} from "@/components/ui/Table/Table";
import { Tree, TreeItem, TreeItemLayout } from "@/components/ui/Tree/Tree";
import { Divider } from "@/components/ui/Divider/Divider";
import { ScrollArea } from "@/components/ui/ScrollArea/ScrollArea";
import {
  Carousel,
  CarouselCard,
  CarouselNavContainer,
  CarouselThumbnail,
  CarouselThumbnails,
  CarouselViewport,
} from "@/components/ui/Carousel/Carousel";
import { DirectionProvider } from "@radix-ui/react-direction";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/Resizable/Resizable";
import type { ComponentDoc } from "../types";

/* ================================================================== Dữ liệu mẫu */

const people = ["Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Minh Dũng", "Hoàng Thu Hà", "Vũ Quốc Khánh", "Đặng Mai Linh", "Bùi Thanh Nam"];

/** Ảnh phong cảnh minh hoạ dạng SVG data URI (không phụ thuộc mạng). Đây là nội dung ảnh, không phải màu UI. */
function photo(sky: string, glow: string, sun: string, far: string, near: string, width = 640, height = 400) {
  const svg =
    "<svg xmlns='http://www.w3.org/2000/svg' width='" + width + "' height='" + height + "' viewBox='0 0 640 400' preserveAspectRatio='xMidYMid slice'>" +
    "<defs><linearGradient id='s' x1='0' y1='0' x2='0' y2='1'><stop offset='0' stop-color='" + sky + "'/><stop offset='1' stop-color='" + glow + "'/></linearGradient></defs>" +
    "<rect width='640' height='400' fill='url(#s)'/>" +
    "<circle cx='468' cy='130' r='52' fill='" + sun + "'/>" +
    "<path d='M0 292 L118 182 L226 262 L344 148 L498 288 L640 206 V400 H0Z' fill='" + far + "'/>" +
    "<path d='M0 338 Q170 272 330 330 T640 318 V400 H0Z' fill='" + near + "'/>" +
    "</svg>";
  return "data:image/svg+xml," + encodeURIComponent(svg);
}

// mountain, sunset, landscape, scenery: URL ảnh bất kỳ (ở đây là SVG sinh sẵn).
const mountain = photo("#8fbff0", "#e6f1fc", "#fff6dc", "#4a78a8", "#1d4a70");
const sunset = photo("#f2a68c", "#fde3cf", "#fff0c2", "#9a527a", "#552a50");
const landscape = photo("#8fbff0", "#e6f1fc", "#fff6dc", "#4a78a8", "#1d4a70", 200, 125);
const scenery = [
  { title: "Núi sáng sớm", src: mountain },
  { title: "Đồi hoàng hôn", src: sunset },
  { title: "Rừng thông", src: photo("#a8d8c0", "#eef8f1", "#fffbe6", "#3f7a5a", "#1f4a35") },
  { title: "Hồ đêm", src: photo("#2b3a67", "#6b7fb8", "#f4f1d0", "#1e2a4d", "#0f1730") },
  { title: "Sa mạc", src: photo("#f5c98a", "#fdf0d8", "#fff8e1", "#c27c43", "#8a4b22") },
];

const versions = Array.from({ length: 30 }, (_, i) => "v2." + (30 - i) + ".0");

const tips = [
  { title: "Phím tắt", text: "Nhấn Ctrl + K để mở bảng lệnh ở bất kỳ đâu.", icon: <Keyboard20Regular /> },
  { title: "Chủ đề tối", text: "Đổi Web Light / Web Dark ngay trong khung ví dụ.", icon: <WeatherMoon20Regular /> },
  { title: "Brand cục bộ", text: "Đặt data-brand trên phần tử để đổi màu cho một vùng.", icon: <Color20Regular /> },
];

const members = [
  { id: "an", name: "Nguyễn Văn An" },
  { id: "binh", name: "Trần Thị Bình" },
  { id: "cuong", name: "Lê Hoàng Cường" },
];

/* ================================================================== Demo có state */

function ListSelectionDemo() {
  const [selected, setSelected] = useState(["an"]);
  return (
    <div className="flex w-full max-w-sm flex-col gap-S">
      <List selectionMode="multiselect" selectedItems={selected} onSelectionChange={setSelected} aria-label="Người tham gia">
        <ListItem value="an" media={<Avatar name="Nguyễn Văn An" color="colorful" />} title="Nguyễn Văn An" description="Kỹ sư phần mềm" />
        <ListItem value="binh" media={<Avatar name="Trần Thị Bình" color="colorful" />} title="Trần Thị Bình" description="Nhà thiết kế" />
        <ListItem value="cuong" media={<Avatar name="Lê Hoàng Cường" color="colorful" />} title="Lê Hoàng Cường" description="Quản lý sản phẩm" />
        <ListItem value="ha" media={<Avatar name="Hoàng Thu Hà" color="colorful" />} title="Hoàng Thu Hà" description="Kiểm thử" />
      </List>
      <span className="text-caption1 text-foreground-3">Đã chọn {selected.length} người · dùng ↑ ↓ và Space để chọn</span>
    </div>
  );
}

function TableSelectionDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <Table aria-label="Thành viên" className="w-full">
      <TableHeader>
        <TableRow>
          <TableSelectionCell
            checked={selected.length === 0 ? false : selected.length === members.length ? true : "mixed"}
            onCheckedChange={(checked) => setSelected(checked ? members.map((m) => m.id) : [])}
          />
          <TableHeaderCell>Thành viên</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id} selected={selected.includes(m.id)}>
            <TableSelectionCell subtle checked={selected.includes(m.id)} onCheckedChange={() => toggle(m.id)} aria-label={"Chọn " + m.name} />
            <TableCell>
              <TableCellLayout media={<Avatar name={m.name} size={24} color="colorful" />}>{m.name}</TableCellLayout>
              <TableCellActions>
                <Button appearance="subtle" size="small" icon={<Edit20Regular />} aria-label={"Sửa " + m.name} />
              </TableCellActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function TreeSelectionDemo() {
  const [selected, setSelected] = useState("work");
  return (
    <div className="flex w-64 flex-col gap-S">
      <Tree aria-label="Thư mục thư" selectionMode="single" selectedValue={selected} onSelectedChange={setSelected} defaultOpenItems={["inbox"]}>
        <TreeItem itemType="branch" value="inbox">
          <TreeItemLayout iconBefore={<Mail20Regular />}>Hộp thư đến</TreeItemLayout>
          <Tree>
            <TreeItem itemType="leaf" value="work">
              <TreeItemLayout>Công việc</TreeItemLayout>
            </TreeItem>
            <TreeItem itemType="leaf" value="family">
              <TreeItemLayout>Gia đình</TreeItemLayout>
            </TreeItem>
          </Tree>
        </TreeItem>
        <TreeItem itemType="leaf" value="sent">
          <TreeItemLayout iconBefore={<Send20Regular className="rtl:-scale-x-100" />}>Đã gửi</TreeItemLayout>
        </TreeItem>
        <TreeItem itemType="leaf" value="archive">
          <TreeItemLayout iconBefore={<Archive20Regular />}>Lưu trữ</TreeItemLayout>
        </TreeItem>
      </Tree>
      <span className="text-caption1 text-foreground-3">Đang chọn: {selected}</span>
    </div>
  );
}

/* ------------------------------------------------------------------ DataTable (shadcn data-table) */
type Invoice = {
  id: string;
  customer: string;
  email: string;
  status: "paid" | "pending" | "failed";
  amount: number;
  date: string;
};

const invoices: Invoice[] = [
  { id: "HD-1042", customer: "Nguyễn Văn An", email: "an.nguyen@contoso.vn", status: "paid", amount: 2490000, date: "2026-10-18" },
  { id: "HD-1041", customer: "Trần Thị Bình", email: "binh.tran@contoso.vn", status: "pending", amount: 1350000, date: "2026-10-17" },
  { id: "HD-1040", customer: "Lê Hoàng Cường", email: "cuong.le@contoso.vn", status: "paid", amount: 5820000, date: "2026-10-15" },
  { id: "HD-1039", customer: "Phạm Minh Dũng", email: "dung.pham@contoso.vn", status: "failed", amount: 760000, date: "2026-10-14" },
  { id: "HD-1038", customer: "Hoàng Thu Hà", email: "ha.hoang@contoso.vn", status: "paid", amount: 3150000, date: "2026-10-12" },
  { id: "HD-1037", customer: "Vũ Quốc Khánh", email: "khanh.vu@contoso.vn", status: "pending", amount: 980000, date: "2026-10-11" },
  { id: "HD-1036", customer: "Đặng Mai Linh", email: "linh.dang@contoso.vn", status: "paid", amount: 4200000, date: "2026-10-09" },
  { id: "HD-1035", customer: "Bùi Thanh Nam", email: "nam.bui@contoso.vn", status: "paid", amount: 1890000, date: "2026-10-08" },
  { id: "HD-1034", customer: "Đỗ Ngọc Oanh", email: "oanh.do@contoso.vn", status: "failed", amount: 640000, date: "2026-10-06" },
  { id: "HD-1033", customer: "Ngô Đức Phúc", email: "phuc.ngo@contoso.vn", status: "pending", amount: 2750000, date: "2026-10-05" },
  { id: "HD-1032", customer: "Dương Bảo Quyên", email: "quyen.duong@contoso.vn", status: "paid", amount: 3600000, date: "2026-10-03" },
  { id: "HD-1031", customer: "Lý Gia Sơn", email: "son.ly@contoso.vn", status: "paid", amount: 1120000, date: "2026-10-01" },
];

const STATUS = {
  paid: { label: "Đã thanh toán", color: "success" },
  pending: { label: "Đang xử lý", color: "warning" },
  failed: { label: "Thất bại", color: "danger" },
} as const;

const PAGE_SIZE = 5;
const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

type SortKey = "customer" | "date" | "amount";

function DataTableDemo() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: TableSortDirection }>({ key: "date", direction: "descending" });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const filtered = invoices.filter((row) => row.customer.toLowerCase().includes(query.trim().toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const { key, direction } = sort;
    const diff = key === "amount" ? a.amount - b.amount : a[key].localeCompare(b[key], "vi");
    return direction === "ascending" ? diff : -diff;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = sorted.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const selectedOnPage = rows.filter((row) => selected.includes(row.id)).length;

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({ key, direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending" }));
  const directionOf = (key: SortKey) => (sort.key === key ? sort.direction : undefined);
  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const togglePage = (checked: boolean) => {
    const ids = rows.map((row) => row.id);
    setSelected((prev) => (checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id))));
  };

  return (
    <div className="flex w-full flex-col gap-M">
      <div className="flex flex-wrap items-center justify-between gap-S">
        <Input
          aria-label="Lọc theo khách hàng"
          placeholder="Lọc theo khách hàng…"
          contentBefore={<Search20Regular />}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          rootClassName="w-full max-w-72"
        />
        <span className="text-caption1 text-foreground-3">
          Đã chọn {selected.length} / {invoices.length} hoá đơn
        </span>
      </div>

      <div className="overflow-x-auto rounded-xlarge border border-stroke-2">
        <Table sortable aria-label="Hoá đơn" className="min-w-180">
          <TableHeader>
            <TableRow>
              <TableSelectionCell
                checked={selectedOnPage === 0 ? false : selectedOnPage === rows.length ? true : "mixed"}
                onCheckedChange={togglePage}
                aria-label="Chọn tất cả hàng trên trang"
              />
              <TableHeaderCell sortDirection={directionOf("customer")} onClick={() => toggleSort("customer")}>
                Khách hàng
              </TableHeaderCell>
              <TableHeaderCell sortable={false} className="w-36">
                Trạng thái
              </TableHeaderCell>
              <TableHeaderCell sortDirection={directionOf("date")} onClick={() => toggleSort("date")} className="w-28">
                Ngày
              </TableHeaderCell>
              <TableHeaderCell sortDirection={directionOf("amount")} onClick={() => toggleSort("amount")} className="w-36">
                Số tiền
              </TableHeaderCell>
              <TableHeaderCell sortable={false} className="w-14">
                <span className="sr-only">Thao tác</span>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} selected={selected.includes(row.id)}>
                <TableSelectionCell
                  checked={selected.includes(row.id)}
                  onCheckedChange={() => toggleRow(row.id)}
                  aria-label={"Chọn " + row.id}
                />
                <TableCell>
                  <TableCellLayout truncate media={<Avatar name={row.customer} color="colorful" />} description={row.email}>
                    {row.customer}
                  </TableCellLayout>
                </TableCell>
                <TableCell>
                  <Badge appearance="tint" color={STATUS[row.status].color}>
                    {STATUS[row.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">{row.date.split("-").reverse().join("/")}</TableCell>
                <TableCell className="tabular-nums">{vnd.format(row.amount)}</TableCell>
                <TableCell>
                  <Menu>
                    <MenuTrigger asChild>
                      <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label={"Thao tác cho " + row.id} />
                    </MenuTrigger>
                    <MenuPopover align="end">
                      <MenuItem icon={<Eye20Regular />}>Xem chi tiết</MenuItem>
                      <MenuItem icon={<Copy20Regular />} onSelect={() => navigator.clipboard?.writeText(row.id)}>
                        Sao chép mã hoá đơn
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />} disabled={row.status !== "paid"}>
                        Hoàn tiền
                      </MenuItem>
                    </MenuPopover>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-foreground-3">
                  Không có kết quả phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-S">
        <span className="text-caption1 text-foreground-3">
          Trang {current + 1} / {pageCount} · {sorted.length} kết quả
        </span>
        <div className="flex gap-S">
          <Button size="small" icon={<ChevronLeft20Regular className="rtl:-scale-x-100" />} disabled={current === 0} onClick={() => setPage(current - 1)}>
            Trước
          </Button>
          <Button
            size="small"
            icon={<ChevronRight20Regular className="rtl:-scale-x-100" />}
            iconPosition="after"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}

/* ================================================================== Docs */

const DISPLAY: Record<string, ComponentDoc> = {
  /* ---------------------------------------------------------------- AvatarGroup */
  avatargroup: {
    slug: "avatargroup",
    name: "AvatarGroup",
    category: "Hiển thị dữ liệu",
    lead: "AvatarGroup hiển thị một nhóm người hoặc thực thể bằng các avatar xếp cạnh nhau, chồng lên nhau hoặc chia trong một vòng tròn.",
    description:
      "Dùng khi cần cho biết ai đang tham gia một cuộc họp, tài liệu hay dự án. Khi vượt quá maxAvatars, các thành viên còn lại gom vào nút “+N” mở Popover liệt kê đầy đủ.",
    importCode: `import { AvatarGroup, AvatarGroupItem } from "@/components/ui";`,
    hero: {
      title: "AvatarGroup",
      code: `<AvatarGroup layout="stack" size={40} maxAvatars={4} aria-label="Thành viên dự án">
  <AvatarGroupItem name="Nguyễn Văn An" />
  <AvatarGroupItem name="Trần Thị Bình" />
  <AvatarGroupItem name="Lê Hoàng Cường" />
  <AvatarGroupItem name="Phạm Minh Dũng" />
  <AvatarGroupItem name="Hoàng Thu Hà" />
  <AvatarGroupItem name="Vũ Quốc Khánh" />
  <AvatarGroupItem name="Đặng Mai Linh" />
</AvatarGroup>`,
      render: () => (
        <AvatarGroup layout="stack" size={40} maxAvatars={4} aria-label="Thành viên dự án">
          <AvatarGroupItem name="Nguyễn Văn An" />
          <AvatarGroupItem name="Trần Thị Bình" />
          <AvatarGroupItem name="Lê Hoàng Cường" />
          <AvatarGroupItem name="Phạm Minh Dũng" />
          <AvatarGroupItem name="Hoàng Thu Hà" />
          <AvatarGroupItem name="Vũ Quốc Khánh" />
          <AvatarGroupItem name="Đặng Mai Linh" />
        </AvatarGroup>
      ),
    },
    examples: [
      {
        title: "Layout",
        description: "spread (mặc định), stack có viền tách nền, pie chia 2–3 avatar trong một vòng tròn.",
        code: `const people = ["Nguyễn Văn An", "Trần Thị Bình", "Lê Hoàng Cường", "Phạm Minh Dũng", "Hoàng Thu Hà", "Vũ Quốc Khánh", "Đặng Mai Linh", "Bùi Thanh Nam"];

<div className="flex flex-col items-start gap-L">
  <AvatarGroup layout="spread" aria-label="Spread">
    {people.slice(0, 4).map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
  <AvatarGroup layout="stack" aria-label="Stack">
    {people.slice(0, 4).map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
  <AvatarGroup layout="pie" aria-label="Pie">
    {people.slice(0, 3).map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-L">
            <AvatarGroup layout="spread" aria-label="Spread">
              {people.slice(0, 4).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
            <AvatarGroup layout="stack" aria-label="Stack">
              {people.slice(0, 4).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
            <AvatarGroup layout="pie" aria-label="Pie">
              {people.slice(0, 3).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
          </div>
        ),
      },
      {
        title: "Kích thước",
        description: "Dùng chung thang size của Avatar: 20, 24, 32 (mặc định), 40, 48, 64, 96.",
        code: `<div className="flex flex-col items-start gap-M">
  <AvatarGroup layout="stack" size={24} aria-label="Cỡ 24">
    {people.slice(0, 5).map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
  <AvatarGroup layout="stack" size={32} aria-label="Cỡ 32">
    {people.slice(0, 5).map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
  <AvatarGroup layout="stack" size={48} aria-label="Cỡ 48">
    {people.slice(0, 5).map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-M">
            <AvatarGroup layout="stack" size={24} aria-label="Cỡ 24">
              {people.slice(0, 5).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
            <AvatarGroup layout="stack" size={32} aria-label="Cỡ 32">
              {people.slice(0, 5).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
            <AvatarGroup layout="stack" size={48} aria-label="Cỡ 48">
              {people.slice(0, 5).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
          </div>
        ),
      },
      {
        title: "Tràn & danh sách đầy đủ",
        description: "maxAvatars giới hạn số ô (tính cả nút tràn). Bấm “+N” hoặc “…” để xem danh sách trong Popover.",
        code: `<div className="flex flex-col items-start gap-M">
  <AvatarGroup maxAvatars={3} aria-label="Nhóm thiết kế">
    {people.map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
  <AvatarGroup layout="stack" maxAvatars={3} overflowIndicator="icon" aria-label="Nhóm kỹ thuật">
    {people.map((name) => <AvatarGroupItem key={name} name={name} />)}
  </AvatarGroup>
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-M">
            <AvatarGroup maxAvatars={3} aria-label="Nhóm thiết kế">
              {people.map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
            <AvatarGroup layout="stack" maxAvatars={3} overflowIndicator="icon" aria-label="Nhóm kỹ thuật">
              {people.map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
          </div>
        ),
      },
      {
        title: "Pie",
        description: "Gọn nhất cho không gian hẹp; cả vòng tròn là nút mở danh sách thành viên.",
        code: `<AvatarGroup layout="pie" size={48} aria-label="Hai thành viên">
  {people.slice(0, 2).map((name) => <AvatarGroupItem key={name} name={name} />)}
</AvatarGroup>
<AvatarGroup layout="pie" size={64} aria-label="Năm thành viên">
  {people.slice(2, 7).map((name) => <AvatarGroupItem key={name} name={name} />)}
</AvatarGroup>`,
        render: () => (
          <>
            <AvatarGroup layout="pie" size={48} aria-label="Hai thành viên">
              {people.slice(0, 2).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
            <AvatarGroup layout="pie" size={64} aria-label="Năm thành viên">
              {people.slice(2, 7).map((name) => <AvatarGroupItem key={name} name={name} />)}
            </AvatarGroup>
          </>
        ),
      },
    ],
    dos: [
      "Đặt aria-label mô tả nhóm (ví dụ “Thành viên dự án”).",
      "Dùng stack khi không gian hẹp, spread khi cần nhìn rõ từng người.",
      "Giữ cùng một size cho mọi avatar trong nhóm.",
    ],
    donts: [
      "Không hiển thị quá 5–6 avatar cùng lúc — dùng maxAvatars.",
      "Không trộn layout pie với số lượng lớn người mà không cho xem danh sách.",
      "Không dùng AvatarGroup cho một người duy nhất — dùng Avatar hoặc Persona.",
    ],
    props: [
      { name: "layout", type: `"spread" | "stack" | "pie"`, defaultValue: `"spread"`, description: "Cách sắp xếp avatar." },
      { name: "size", type: "20 | 24 | 32 | 40 | 48 | 64 | 96", defaultValue: "32", description: "Kích thước mọi avatar trong nhóm." },
      { name: "maxAvatars", type: "number", defaultValue: "5", description: "Số ô tối đa (tính cả nút tràn); không áp dụng cho pie." },
      { name: "overflowIndicator", type: `"count" | "icon"`, defaultValue: `"count"`, description: "Nút tràn hiện “+N” hoặc icon “…”." },
      { name: "overflowLabel", type: "string", description: "aria-label cho nút mở danh sách." },
      { name: "AvatarGroupItem.name / src / color", type: "string / string / AvatarColor", defaultValue: `color "colorful"`, description: "Thông tin từng thành viên." },
    ],
  },

  /* ---------------------------------------------------------------- Persona */
  persona: {
    slug: "persona",
    name: "Persona",
    category: "Hiển thị dữ liệu",
    lead: "Persona ghép Avatar (hoặc chỉ chấm trạng thái) với tên và tối đa ba dòng thông tin phụ về một người.",
    description:
      "Dùng trong danh sách người, thẻ hồ sơ, kết quả tìm kiếm. Kích thước Avatar và cỡ chữ đi theo size; textPosition và textAlignment điều chỉnh bố cục.",
    importCode: `import { Persona } from "@/components/ui";`,
    hero: {
      title: "Persona",
      code: `<Persona
  size="huge"
  name="Nguyễn Văn An"
  secondaryText="Trưởng nhóm thiết kế"
  tertiaryText="Hà Nội · 09:30"
  presence="available"
  avatar={{ color: "colorful" }}
/>`,
      render: () => (
        <Persona
          size="huge"
          name="Nguyễn Văn An"
          secondaryText="Trưởng nhóm thiết kế"
          tertiaryText="Hà Nội · 09:30"
          presence="available"
          avatar={{ color: "colorful" }}
        />
      ),
    },
    examples: [
      {
        title: "Kích thước",
        description: "extra-small → huge; Avatar 20 → 64px.",
        code: `<div className="flex flex-col items-start gap-M">
  <Persona size="extra-small" name="Trần Thị Bình" secondaryText="extra-small" presence="available" />
  <Persona size="small" name="Trần Thị Bình" secondaryText="small" presence="busy" />
  <Persona size="medium" name="Trần Thị Bình" secondaryText="medium" presence="away" />
  <Persona size="large" name="Trần Thị Bình" secondaryText="large" presence="offline" />
  <Persona size="extra-large" name="Trần Thị Bình" secondaryText="extra-large" presence="available" />
  <Persona size="huge" name="Trần Thị Bình" secondaryText="huge" presence="available" />
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-M">
            <Persona size="extra-small" name="Trần Thị Bình" secondaryText="extra-small" presence="available" />
            <Persona size="small" name="Trần Thị Bình" secondaryText="small" presence="busy" />
            <Persona size="medium" name="Trần Thị Bình" secondaryText="medium" presence="away" />
            <Persona size="large" name="Trần Thị Bình" secondaryText="large" presence="offline" />
            <Persona size="extra-large" name="Trần Thị Bình" secondaryText="extra-large" presence="available" />
            <Persona size="huge" name="Trần Thị Bình" secondaryText="huge" presence="available" />
          </div>
        ),
      },
      {
        title: "Vị trí chữ",
        description: "after (mặc định), before, below.",
        code: `<div className="flex flex-wrap items-start justify-center gap-XL">
  <Persona size="large" name="Lê Hoàng Cường" secondaryText="after" presence="available" avatar={{ color: "colorful" }} />
  <Persona size="large" textPosition="before" name="Lê Hoàng Cường" secondaryText="before" presence="available" avatar={{ color: "colorful" }} />
  <Persona size="large" textPosition="below" textAlignment="center" name="Lê Hoàng Cường" secondaryText="below" presence="available" avatar={{ color: "colorful" }} />
</div>`,
        render: () => (
          <div className="flex flex-wrap items-start justify-center gap-XL">
            <Persona size="large" name="Lê Hoàng Cường" secondaryText="after" presence="available" avatar={{ color: "colorful" }} />
            <Persona size="large" textPosition="before" name="Lê Hoàng Cường" secondaryText="before" presence="available" avatar={{ color: "colorful" }} />
            <Persona size="large" textPosition="below" textAlignment="center" name="Lê Hoàng Cường" secondaryText="below" presence="available" avatar={{ color: "colorful" }} />
          </div>
        ),
      },
      {
        title: "Căn chữ & bốn dòng",
        description: "textAlignment start (mặc định) bám mép trên Avatar; center căn giữa theo chiều dọc.",
        code: `<div className="flex flex-col items-start gap-L">
  <Persona
    size="extra-large"
    name="Phạm Minh Dũng"
    secondaryText="Quản lý sản phẩm"
    tertiaryText="Đang họp"
    quaternaryText="Rảnh lúc 15:00"
    presence="busy"
  />
  <Persona size="extra-large" textAlignment="center" name="Phạm Minh Dũng" secondaryText="Quản lý sản phẩm" presence="busy" />
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-L">
            <Persona
              size="extra-large"
              name="Phạm Minh Dũng"
              secondaryText="Quản lý sản phẩm"
              tertiaryText="Đang họp"
              quaternaryText="Rảnh lúc 15:00"
              presence="busy"
            />
            <Persona size="extra-large" textAlignment="center" name="Phạm Minh Dũng" secondaryText="Quản lý sản phẩm" presence="busy" />
          </div>
        ),
      },
      {
        title: "Chỉ trạng thái",
        description: "presenceOnly thay Avatar bằng chấm trạng thái — hợp với danh sách dày.",
        code: `<div className="flex flex-col items-start gap-M">
  <Persona presenceOnly presence="available" name="Hoàng Thu Hà" secondaryText="Có mặt" />
  <Persona presenceOnly presence="away" name="Vũ Quốc Khánh" secondaryText="Vắng mặt" />
  <Persona presenceOnly presence="offline" name="Đặng Mai Linh" secondaryText="Ngoại tuyến" />
</div>`,
        render: () => (
          <div className="flex flex-col items-start gap-M">
            <Persona presenceOnly presence="available" name="Hoàng Thu Hà" secondaryText="Có mặt" />
            <Persona presenceOnly presence="away" name="Vũ Quốc Khánh" secondaryText="Vắng mặt" />
            <Persona presenceOnly presence="offline" name="Đặng Mai Linh" secondaryText="Ngoại tuyến" />
          </div>
        ),
      },
    ],
    dos: [
      "Dòng phụ ngắn gọn: chức danh, trạng thái, giờ địa phương.",
      "Chọn size theo mật độ: small/medium cho danh sách, huge cho trang hồ sơ.",
      "Luôn có chữ đi kèm trạng thái khi trạng thái quan trọng.",
    ],
    donts: [
      "Không nhồi quá bốn dòng chữ.",
      "Không dùng presenceOnly khi người dùng cần nhận diện bằng ảnh.",
      "Không tô brand cho tên người.",
    ],
    props: [
      { name: "name", type: "string", description: "Tên — primaryText mặc định và tên của Avatar." },
      { name: "primaryText / secondaryText / tertiaryText / quaternaryText", type: "ReactNode", description: "Bốn dòng chữ; dòng đầu semibold, các dòng sau caption foreground-2." },
      { name: "size", type: `"extra-small" | "small" | "medium" | "large" | "extra-large" | "huge"`, defaultValue: `"medium"`, description: "Avatar 20 / 24 / 32 / 40 / 48 / 64px." },
      { name: "presence", type: `"available" | "busy" | "away" | "offline"`, description: "Trạng thái hiện trên Avatar." },
      { name: "presenceOnly", type: "boolean", defaultValue: "false", description: "Chỉ hiện chấm trạng thái." },
      { name: "avatar", type: "{ src, color, shape }", description: "Tuỳ chọn truyền cho Avatar." },
      { name: "textPosition", type: `"after" | "before" | "below"`, defaultValue: `"after"`, description: "Vị trí khối chữ so với Avatar." },
      { name: "textAlignment", type: `"start" | "center"`, defaultValue: `"start"`, description: "Căn khối chữ." },
    ],
  },

  /* ---------------------------------------------------------------- Text */
  text: {
    slug: "text",
    name: "Text",
    category: "Hiển thị dữ liệu",
    lead: "Text hiển thị chữ theo type ramp của Fluent 2, kèm các preset sẵn cho từng vai trò từ Display đến Caption2.",
    description:
      "size 100–1000 ánh xạ thẳng vào token fontSizeBase/Hero và line-height tương ứng; chữ từ 20px trở lên tự dùng font Display. Ưu tiên dùng preset (Title3, Body1…) để giữ nhất quán.",
    importCode: `import {
  Text, Display, LargeTitle, Title1, Title2, Title3, Subtitle1, Subtitle2,
  Body1, Body1Strong, Body2, Caption1, Caption1Strong, Caption2,
} from "@/components/ui";`,
    hero: {
      title: "Text",
      code: `<div className="flex max-w-xl flex-col gap-S">
  <Caption1Strong className="text-brand-foreground-1">Typography</Caption1Strong>
  <Display>Aa Bb</Display>
  <Title3>Chữ rõ ràng, nhịp đều</Title3>
  <Body2 className="text-foreground-2">
    Text và các preset ánh xạ thẳng vào type ramp của Fluent 2 — cỡ chữ, line-height và độ đậm luôn đồng bộ.
  </Body2>
</div>`,
      render: () => (
        <div className="flex max-w-xl flex-col gap-S">
          <Caption1Strong className="text-brand-foreground-1">Typography</Caption1Strong>
          <Display>Aa Bb</Display>
          <Title3>Chữ rõ ràng, nhịp đều</Title3>
          <Body2 className="text-foreground-2">
            Text và các preset ánh xạ thẳng vào type ramp của Fluent 2 — cỡ chữ, line-height và độ đậm luôn đồng bộ.
          </Body2>
        </div>
      ),
    },
    examples: [
      {
        title: "Preset",
        description: "Mỗi preset = một bậc type ramp + weight chuẩn.",
        code: `<div className="flex flex-col gap-XS">
  <LargeTitle>Large title</LargeTitle>
  <Title1>Title 1</Title1>
  <Title2>Title 2</Title2>
  <Title3>Title 3</Title3>
  <Subtitle1>Subtitle 1</Subtitle1>
  <Subtitle2>Subtitle 2</Subtitle2>
  <Body2>Body 2</Body2>
  <Body1Strong>Body 1 strong</Body1Strong>
  <Body1>Body 1</Body1>
  <Caption1Strong>Caption 1 strong</Caption1Strong>
  <Caption1>Caption 1</Caption1>
  <Caption2>Caption 2</Caption2>
</div>`,
        render: () => (
          <div className="flex flex-col gap-XS">
            <LargeTitle>Large title</LargeTitle>
            <Title1>Title 1</Title1>
            <Title2>Title 2</Title2>
            <Title3>Title 3</Title3>
            <Subtitle1>Subtitle 1</Subtitle1>
            <Subtitle2>Subtitle 2</Subtitle2>
            <Body2>Body 2</Body2>
            <Body1Strong>Body 1 strong</Body1Strong>
            <Body1>Body 1</Body1>
            <Caption1Strong>Caption 1 strong</Caption1Strong>
            <Caption1>Caption 1</Caption1>
            <Caption2>Caption 2</Caption2>
          </div>
        ),
      },
      {
        title: "Size & weight",
        description: "size 100–1000; weight regular, medium, semibold, bold.",
        code: `<div className="flex flex-col gap-XS">
  <Text size={500} weight="regular">size 500 · regular</Text>
  <Text size={500} weight="medium">size 500 · medium</Text>
  <Text size={500} weight="semibold">size 500 · semibold</Text>
  <Text size={500} weight="bold">size 500 · bold</Text>
  <Text size={200}>size 200 · regular</Text>
</div>`,
        render: () => (
          <div className="flex flex-col gap-XS">
            <Text size={500} weight="regular">size 500 · regular</Text>
            <Text size={500} weight="medium">size 500 · medium</Text>
            <Text size={500} weight="semibold">size 500 · semibold</Text>
            <Text size={500} weight="bold">size 500 · bold</Text>
            <Text size={200}>size 200 · regular</Text>
          </div>
        ),
      },
      {
        title: "Định dạng & font",
        description: "italic, underline, strikethrough; font base, monospace, numeric.",
        code: `<div className="flex flex-col gap-XS">
  <Text italic>Chữ nghiêng</Text>
  <Text underline>Chữ gạch chân</Text>
  <Text strikethrough>Chữ gạch ngang</Text>
  <Text underline strikethrough>Gạch chân và gạch ngang</Text>
  <Text font="monospace">npm install @fluentui/react-icons</Text>
  <Text font="numeric">1.234.567,89 ₫</Text>
</div>`,
        render: () => (
          <div className="flex flex-col gap-XS">
            <Text italic>Chữ nghiêng</Text>
            <Text underline>Chữ gạch chân</Text>
            <Text strikethrough>Chữ gạch ngang</Text>
            <Text underline strikethrough>Gạch chân và gạch ngang</Text>
            <Text font="monospace">npm install @fluentui/react-icons</Text>
            <Text font="numeric">1.234.567,89 ₫</Text>
          </div>
        ),
      },
      {
        title: "Truncate, căn lề & as",
        description: "truncate cần wrap={false} và block; as đổi thẻ HTML mà không đổi style.",
        code: `<div className="flex w-56 flex-col gap-S">
  <Text block truncate wrap={false}>
    Đoạn chữ rất dài sẽ bị cắt bằng dấu ba chấm khi vượt quá chiều rộng
  </Text>
  <Text block>Đoạn chữ dài mặc định xuống dòng tự nhiên trong khung chứa.</Text>
  <Text as="h3" size={400} weight="semibold" block>
    Tiêu đề dùng thẻ h3
  </Text>
  <Text as="p" block align="end" className="text-foreground-3">
    Căn phải (align="end")
  </Text>
</div>`,
        render: () => (
          <div className="flex w-56 flex-col gap-S">
            <Text block truncate wrap={false}>
              Đoạn chữ rất dài sẽ bị cắt bằng dấu ba chấm khi vượt quá chiều rộng
            </Text>
            <Text block>Đoạn chữ dài mặc định xuống dòng tự nhiên trong khung chứa.</Text>
            <Text as="h3" size={400} weight="semibold" block>
              Tiêu đề dùng thẻ h3
            </Text>
            <Text as="p" block align="end" className="text-foreground-3">
              Căn phải (align="end")
            </Text>
          </div>
        ),
      },
    ],
    dos: [
      "Dùng preset theo vai trò (Title3 cho tiêu đề section, Body1 cho nội dung UI).",
      "Đặt `as` đúng ngữ nghĩa (h1–h6, p) để trình đọc màn hình hiểu cấu trúc.",
      "Giữ chữ phụ ở foreground-2/3 thay vì đổi cỡ chữ.",
    ],
    donts: [
      "Không đặt cỡ chữ ngoài type ramp (text-[15px]).",
      "Không dùng Display / LargeTitle trong control hay bảng.",
      "Không dùng bold cho cả đoạn văn — chỉ để nhấn mạnh.",
    ],
    props: [
      { name: "size", type: "100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 1000", defaultValue: "300", description: "Bậc type ramp (10 → 68px)." },
      { name: "weight", type: `"regular" | "medium" | "semibold" | "bold"`, defaultValue: `"regular"`, description: "Độ đậm." },
      { name: "font", type: `"base" | "monospace" | "numeric"`, defaultValue: `"base"`, description: "Họ phông; numeric = số đều cột." },
      { name: "align", type: `"start" | "center" | "end" | "justify"`, defaultValue: `"start"`, description: "Căn lề." },
      { name: "italic / underline / strikethrough", type: "boolean", defaultValue: "false", description: "Định dạng chữ." },
      { name: "truncate / wrap / block", type: "boolean", defaultValue: "false / true / false", description: "Cắt chữ, xuống dòng, hiển thị block." },
      { name: "as", type: `"span" | "p" | "h1"…"h6" | "pre" | "code" | "strong" | "em" | "label"…`, defaultValue: `"span"`, description: "Thẻ HTML render ra." },
    ],
  },

  /* ---------------------------------------------------------------- Image */
  image: {
    slug: "image",
    name: "Image",
    category: "Hiển thị dữ liệu",
    lead: "Image hiển thị ảnh với các tuỳ chọn cách lấp khung, bo góc, viền và đổ bóng; AspectRatio giữ khung đúng tỉ lệ.",
    description:
      "fit quyết định ảnh lấp khung chứa ra sao (none, center, contain, cover). AspectRatio (theo shadcn) dùng CSS aspect-ratio để giữ chỗ trước khi ảnh tải xong, tránh nhảy bố cục.",
    importCode: `import { Image, AspectRatio } from "@/components/ui";`,
    hero: {
      title: "Image",
      code: `// mountain, sunset, landscape, scenery: URL ảnh bất kỳ (ở đây là SVG sinh sẵn).
<div className="flex flex-wrap items-center justify-center gap-L">
  <Image src={mountain} alt="Núi và hồ buổi sáng" shape="rounded" shadow className="w-56" />
  <Image src={sunset} alt="Đồi lúc hoàng hôn" shape="circular" fit="cover" bordered className="size-32" />
</div>`,
      render: () => (
        <div className="flex flex-wrap items-center justify-center gap-L">
          <Image src={mountain} alt="Núi và hồ buổi sáng" shape="rounded" shadow className="w-56" />
          <Image src={sunset} alt="Đồi lúc hoàng hôn" shape="circular" fit="cover" bordered className="size-32" />
        </div>
      ),
    },
    examples: [
      {
        title: "Fit",
        description: "Cách ảnh lấp một khung cố định 144 × 112.",
        code: `<div className="grid grid-cols-2 gap-M">
  {(["none", "center", "contain", "cover"] as const).map((fit) => (
    <div key={fit} className="flex flex-col gap-XS">
      <div className="h-28 w-36 overflow-hidden rounded-medium border border-stroke-2 bg-background-4">
        <Image src={landscape} alt="" fit={fit} />
      </div>
      <span className="text-caption1 text-foreground-3">fit="{fit}"</span>
    </div>
  ))}
</div>`,
        render: () => (
          <div className="grid grid-cols-2 gap-M">
            {(["none", "center", "contain", "cover"] as const).map((fit) => (
              <div key={fit} className="flex flex-col gap-XS">
                <div className="h-28 w-36 overflow-hidden rounded-medium border border-stroke-2 bg-background-4">
                  <Image src={landscape} alt="" fit={fit} />
                </div>
                <span className="text-caption1 text-foreground-3">fit="{fit}"</span>
              </div>
            ))}
          </div>
        ),
      },
      {
        title: "Shape",
        description: "square (mặc định), rounded, circular.",
        code: `<div className="flex items-center gap-L">
  <Image src={sunset} alt="" fit="cover" shape="square" className="size-24" />
  <Image src={sunset} alt="" fit="cover" shape="rounded" className="size-24" />
  <Image src={sunset} alt="" fit="cover" shape="circular" className="size-24" />
</div>`,
        render: () => (
          <div className="flex items-center gap-L">
            <Image src={sunset} alt="" fit="cover" shape="square" className="size-24" />
            <Image src={sunset} alt="" fit="cover" shape="rounded" className="size-24" />
            <Image src={sunset} alt="" fit="cover" shape="circular" className="size-24" />
          </div>
        ),
      },
      {
        title: "Viền & bóng",
        description: "bordered thêm viền stroke-1; shadow dùng shadow-4 như Card.",
        code: `<div className="flex items-center gap-L">
  <Image src={mountain} alt="" bordered shape="rounded" className="w-36" />
  <Image src={mountain} alt="" shadow shape="rounded" className="w-36" />
</div>`,
        render: () => (
          <div className="flex items-center gap-L">
            <Image src={mountain} alt="" bordered shape="rounded" className="w-36" />
            <Image src={mountain} alt="" shadow shape="rounded" className="w-36" />
          </div>
        ),
      },
      {
        title: "AspectRatio",
        description: "Khung 16 / 9 và 1 / 1; nội dung bên trong lấp đầy khung.",
        code: `<div className="grid w-full grid-cols-2 items-center gap-M">
  <AspectRatio ratio={16 / 9} className="rounded-xlarge">
    <Image src={mountain} alt="Núi và hồ buổi sáng" fit="cover" />
  </AspectRatio>
  <AspectRatio ratio={1} className="rounded-xlarge">
    <BloomArt />
  </AspectRatio>
</div>`,
        render: () => (
          <div className="grid w-full grid-cols-2 items-center gap-M">
            <AspectRatio ratio={16 / 9} className="rounded-xlarge">
              <Image src={mountain} alt="Núi và hồ buổi sáng" fit="cover" />
            </AspectRatio>
            <AspectRatio ratio={1} className="rounded-xlarge">
              <BloomArt />
            </AspectRatio>
          </div>
        ),
      },
    ],
    dos: [
      "Luôn có alt mô tả nội dung; alt=\"\" cho ảnh thuần trang trí.",
      "Dùng AspectRatio cho ảnh tải từ mạng để tránh nhảy bố cục.",
      "Dùng fit=\"cover\" cho thumbnail, \"contain\" khi phải thấy toàn bộ ảnh.",
    ],
    donts: [
      "Không kéo méo ảnh bằng width/height lệch tỉ lệ mà không đặt fit.",
      "Không dùng circular cho ảnh không phải chân dung / logo.",
      "Không đặt chữ quan trọng chồng lên ảnh mà không có nền đảm bảo tương phản.",
    ],
    props: [
      { name: "fit", type: `"none" | "center" | "contain" | "cover" | "default"`, defaultValue: `"default"`, description: "Cách ảnh lấp khung chứa (object-fit)." },
      { name: "shape", type: `"square" | "rounded" | "circular"`, defaultValue: `"square"`, description: "Bo góc 0 / 4px / tròn." },
      { name: "bordered", type: "boolean", defaultValue: "false", description: "Viền 1px stroke-1." },
      { name: "shadow", type: "boolean", defaultValue: "false", description: "Đổ bóng shadow-4." },
      { name: "block", type: "boolean", defaultValue: "false", description: "Ảnh rộng 100% khung chứa." },
      { name: "AspectRatio.ratio", type: "number", defaultValue: "1", description: "Tỉ lệ rộng / cao, ví dụ 16 / 9." },
    ],
  },

  /* ---------------------------------------------------------------- List */
  list: {
    slug: "list",
    name: "List",
    category: "Hiển thị dữ liệu",
    lead: "List hiển thị một chuỗi mục liên quan theo chiều dọc, có thể điều hướng bằng bàn phím và chọn một hoặc nhiều mục.",
    description:
      "Mỗi ListItem gồm media (Avatar / icon), tiêu đề, mô tả và vùng actions. selectionMode bật chọn mục (multiselect hiện Checkbox); navigationMode=\"composite\" cho phép → / ← để vào / ra các nút bên trong item.",
    importCode: `import { List, ListItem } from "@/components/ui";`,
    hero: {
      title: "List",
      code: `function ListSelectionDemo() {
  const [selected, setSelected] = useState(["an"]);
  return (
    <div className="flex w-full max-w-sm flex-col gap-S">
      <List selectionMode="multiselect" selectedItems={selected} onSelectionChange={setSelected} aria-label="Người tham gia">
        <ListItem value="an" media={<Avatar name="Nguyễn Văn An" color="colorful" />} title="Nguyễn Văn An" description="Kỹ sư phần mềm" />
        <ListItem value="binh" media={<Avatar name="Trần Thị Bình" color="colorful" />} title="Trần Thị Bình" description="Nhà thiết kế" />
        <ListItem value="cuong" media={<Avatar name="Lê Hoàng Cường" color="colorful" />} title="Lê Hoàng Cường" description="Quản lý sản phẩm" />
        <ListItem value="ha" media={<Avatar name="Hoàng Thu Hà" color="colorful" />} title="Hoàng Thu Hà" description="Kiểm thử" />
      </List>
      <span className="text-caption1 text-foreground-3">Đã chọn {selected.length} người · dùng ↑ ↓ và Space để chọn</span>
    </div>
  );
}`,
      render: () => <ListSelectionDemo />,
    },
    examples: [
      {
        title: "Cơ bản",
        description: "List tĩnh với icon, tiêu đề và mô tả.",
        code: `<List aria-label="Tệp gần đây" className="w-full max-w-sm">
  <ListItem media={<Document20Regular />} title="Báo cáo quý 3.docx" description="Sửa 2 giờ trước" />
  <ListItem media={<Image20Regular />} title="Ảnh bìa.png" description="Sửa hôm qua" />
  <ListItem media={<DocumentPdf20Regular />} title="Hợp đồng.pdf" description="Sửa 3 ngày trước" />
</List>`,
        render: () => (
          <List aria-label="Tệp gần đây" className="w-full max-w-sm">
            <ListItem media={<Document20Regular />} title="Báo cáo quý 3.docx" description="Sửa 2 giờ trước" />
            <ListItem media={<Image20Regular />} title="Ảnh bìa.png" description="Sửa hôm qua" />
            <ListItem media={<DocumentPdf20Regular />} title="Hợp đồng.pdf" description="Sửa 3 ngày trước" />
          </List>
        ),
      },
      {
        title: "Chọn một",
        description: "selectionMode=\"single\": mục chọn có nền tint brand và dấu tick.",
        code: `<List selectionMode="single" defaultSelectedItems={["week"]} aria-label="Khoảng thời gian" className="w-full max-w-xs">
  <ListItem value="day" title="Hôm nay" />
  <ListItem value="week" title="7 ngày qua" />
  <ListItem value="month" title="30 ngày qua" />
</List>`,
        render: () => (
          <List selectionMode="single" defaultSelectedItems={["week"]} aria-label="Khoảng thời gian" className="w-full max-w-xs">
            <ListItem value="day" title="Hôm nay" />
            <ListItem value="week" title="7 ngày qua" />
            <ListItem value="month" title="30 ngày qua" />
          </List>
        ),
      },
      {
        title: "Outline & actions",
        description: "variant=\"outline\" biến mỗi item thành thẻ; composite: → vào nút, ← / Esc quay lại item.",
        code: `<List navigationMode="composite" variant="outline" aria-label="Hộp thư" className="w-full max-w-sm">
  <ListItem
    media={<Avatar name="Trần Thị Bình" color="colorful" />}
    title="Trần Thị Bình"
    description="Gửi bạn bản thiết kế mới cho trang chủ, xem giúp mình nhé."
    actions={
      <>
        <Button appearance="subtle" size="small" icon={<Mail20Regular />} aria-label="Trả lời" />
        <Button appearance="subtle" size="small" icon={<Delete20Regular />} aria-label="Xoá" />
      </>
    }
  />
  <ListItem
    media={<Avatar name="Lê Hoàng Cường" color="colorful" />}
    title="Lê Hoàng Cường"
    description="Lịch họp sprint chuyển sang 10:00 thứ Năm."
    actions={
      <>
        <Button appearance="subtle" size="small" icon={<Mail20Regular />} aria-label="Trả lời" />
        <Button appearance="subtle" size="small" icon={<Delete20Regular />} aria-label="Xoá" />
      </>
    }
  />
</List>`,
        render: () => (
          <List navigationMode="composite" variant="outline" aria-label="Hộp thư" className="w-full max-w-sm">
            <ListItem
              media={<Avatar name="Trần Thị Bình" color="colorful" />}
              title="Trần Thị Bình"
              description="Gửi bạn bản thiết kế mới cho trang chủ, xem giúp mình nhé."
              actions={
                <>
                  <Button appearance="subtle" size="small" icon={<Mail20Regular />} aria-label="Trả lời" />
                  <Button appearance="subtle" size="small" icon={<Delete20Regular />} aria-label="Xoá" />
                </>
              }
            />
            <ListItem
              media={<Avatar name="Lê Hoàng Cường" color="colorful" />}
              title="Lê Hoàng Cường"
              description="Lịch họp sprint chuyển sang 10:00 thứ Năm."
              actions={
                <>
                  <Button appearance="subtle" size="small" icon={<Mail20Regular />} aria-label="Trả lời" />
                  <Button appearance="subtle" size="small" icon={<Delete20Regular />} aria-label="Xoá" />
                </>
              }
            />
          </List>
        ),
      },
    ],
    dos: [
      "Đặt aria-label cho List; value ổn định cho từng ListItem khi có selection.",
      "Dùng composite khi item chứa nút / menu riêng.",
      "Giữ mỗi item một hành động chính rõ ràng.",
    ],
    donts: [
      "Không lồng List trong ListItem — dùng Tree cho dữ liệu phân cấp.",
      "Không chỉ dùng màu để báo mục đã chọn (đã có checkbox / dấu tick).",
      "Không dùng List cho dữ liệu nhiều cột — dùng Table.",
    ],
    props: [
      { name: "selectionMode", type: `"none" | "single" | "multiselect"`, defaultValue: `"none"`, description: "Chế độ chọn; multiselect hiện Checkbox." },
      { name: "selectedItems / defaultSelectedItems", type: "string[]", description: "Danh sách value đang chọn (controlled / uncontrolled)." },
      { name: "onSelectionChange", type: "(selectedItems: string[]) => void", description: "Gọi khi chọn / bỏ chọn." },
      { name: "navigationMode", type: `"items" | "composite"`, defaultValue: `items khi có selection`, description: "Điều hướng bằng phím mũi tên (roving tabindex)." },
      { name: "variant", type: `"default" | "outline"`, defaultValue: `"default"`, description: "outline: mỗi item là thẻ có viền, bo rounded-xlarge." },
      { name: "ListItem.media / title / description / actions", type: "ReactNode", description: "Các vùng nội dung của item." },
      { name: "ListItem.onAction", type: "(event) => void", description: "Hành động chính khi click / Enter." },
      { name: "ListItem.value / disabled", type: "string / boolean", description: "Định danh và trạng thái vô hiệu." },
    ],
  },

  /* ---------------------------------------------------------------- Table */
  table: {
    slug: "table",
    name: "Table",
    category: "Hiển thị dữ liệu",
    lead: "Table sắp xếp dữ liệu thành hàng và cột để người dùng quét, so sánh và thao tác trên từng bản ghi.",
    description:
      "Gồm Table, TableHeader, TableHeaderCell (sắp xếp với aria-sort), TableBody, TableRow, TableCell, TableCellLayout, TableSelectionCell và TableCellActions. Ví dụ đầu là một DataTable hoàn chỉnh: lọc, sắp xếp, chọn hàng, menu thao tác và phân trang.",
    importCode: `import {
  Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell,
  TableCellLayout, TableSelectionCell, TableCellActions,
} from "@/components/ui";`,
    hero: {
      title: "DataTable",
      code: `type Invoice = {
  id: string;
  customer: string;
  email: string;
  status: "paid" | "pending" | "failed";
  amount: number;
  date: string;
};

const invoices: Invoice[] = [
  { id: "HD-1042", customer: "Nguyễn Văn An", email: "an.nguyen@contoso.vn", status: "paid", amount: 2490000, date: "2026-10-18" },
  { id: "HD-1041", customer: "Trần Thị Bình", email: "binh.tran@contoso.vn", status: "pending", amount: 1350000, date: "2026-10-17" },
  { id: "HD-1040", customer: "Lê Hoàng Cường", email: "cuong.le@contoso.vn", status: "paid", amount: 5820000, date: "2026-10-15" },
  { id: "HD-1039", customer: "Phạm Minh Dũng", email: "dung.pham@contoso.vn", status: "failed", amount: 760000, date: "2026-10-14" },
  { id: "HD-1038", customer: "Hoàng Thu Hà", email: "ha.hoang@contoso.vn", status: "paid", amount: 3150000, date: "2026-10-12" },
  { id: "HD-1037", customer: "Vũ Quốc Khánh", email: "khanh.vu@contoso.vn", status: "pending", amount: 980000, date: "2026-10-11" },
  { id: "HD-1036", customer: "Đặng Mai Linh", email: "linh.dang@contoso.vn", status: "paid", amount: 4200000, date: "2026-10-09" },
  { id: "HD-1035", customer: "Bùi Thanh Nam", email: "nam.bui@contoso.vn", status: "paid", amount: 1890000, date: "2026-10-08" },
  { id: "HD-1034", customer: "Đỗ Ngọc Oanh", email: "oanh.do@contoso.vn", status: "failed", amount: 640000, date: "2026-10-06" },
  { id: "HD-1033", customer: "Ngô Đức Phúc", email: "phuc.ngo@contoso.vn", status: "pending", amount: 2750000, date: "2026-10-05" },
  { id: "HD-1032", customer: "Dương Bảo Quyên", email: "quyen.duong@contoso.vn", status: "paid", amount: 3600000, date: "2026-10-03" },
  { id: "HD-1031", customer: "Lý Gia Sơn", email: "son.ly@contoso.vn", status: "paid", amount: 1120000, date: "2026-10-01" },
];

const STATUS = {
  paid: { label: "Đã thanh toán", color: "success" },
  pending: { label: "Đang xử lý", color: "warning" },
  failed: { label: "Thất bại", color: "danger" },
} as const;

const PAGE_SIZE = 5;
const vnd = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });

type SortKey = "customer" | "date" | "amount";

function DataTableDemo() {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: SortKey; direction: TableSortDirection }>({ key: "date", direction: "descending" });
  const [selected, setSelected] = useState<string[]>([]);
  const [page, setPage] = useState(0);

  const filtered = invoices.filter((row) => row.customer.toLowerCase().includes(query.trim().toLowerCase()));
  const sorted = [...filtered].sort((a, b) => {
    const { key, direction } = sort;
    const diff = key === "amount" ? a.amount - b.amount : a[key].localeCompare(b[key], "vi");
    return direction === "ascending" ? diff : -diff;
  });
  const pageCount = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pageCount - 1);
  const rows = sorted.slice(current * PAGE_SIZE, (current + 1) * PAGE_SIZE);
  const selectedOnPage = rows.filter((row) => selected.includes(row.id)).length;

  const toggleSort = (key: SortKey) =>
    setSort((prev) => ({ key, direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending" }));
  const directionOf = (key: SortKey) => (sort.key === key ? sort.direction : undefined);
  const toggleRow = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const togglePage = (checked: boolean) => {
    const ids = rows.map((row) => row.id);
    setSelected((prev) => (checked ? [...new Set([...prev, ...ids])] : prev.filter((id) => !ids.includes(id))));
  };

  return (
    <div className="flex w-full flex-col gap-M">
      <div className="flex flex-wrap items-center justify-between gap-S">
        <Input
          aria-label="Lọc theo khách hàng"
          placeholder="Lọc theo khách hàng…"
          contentBefore={<Search20Regular />}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(0);
          }}
          rootClassName="w-full max-w-72"
        />
        <span className="text-caption1 text-foreground-3">
          Đã chọn {selected.length} / {invoices.length} hoá đơn
        </span>
      </div>

      <div className="overflow-x-auto rounded-xlarge border border-stroke-2">
        <Table sortable aria-label="Hoá đơn" className="min-w-180">
          <TableHeader>
            <TableRow>
              <TableSelectionCell
                checked={selectedOnPage === 0 ? false : selectedOnPage === rows.length ? true : "mixed"}
                onCheckedChange={togglePage}
                aria-label="Chọn tất cả hàng trên trang"
              />
              <TableHeaderCell sortDirection={directionOf("customer")} onClick={() => toggleSort("customer")}>
                Khách hàng
              </TableHeaderCell>
              <TableHeaderCell sortable={false} className="w-36">
                Trạng thái
              </TableHeaderCell>
              <TableHeaderCell sortDirection={directionOf("date")} onClick={() => toggleSort("date")} className="w-28">
                Ngày
              </TableHeaderCell>
              <TableHeaderCell sortDirection={directionOf("amount")} onClick={() => toggleSort("amount")} className="w-36">
                Số tiền
              </TableHeaderCell>
              <TableHeaderCell sortable={false} className="w-14">
                <span className="sr-only">Thao tác</span>
              </TableHeaderCell>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} selected={selected.includes(row.id)}>
                <TableSelectionCell
                  checked={selected.includes(row.id)}
                  onCheckedChange={() => toggleRow(row.id)}
                  aria-label={"Chọn " + row.id}
                />
                <TableCell>
                  <TableCellLayout truncate media={<Avatar name={row.customer} color="colorful" />} description={row.email}>
                    {row.customer}
                  </TableCellLayout>
                </TableCell>
                <TableCell>
                  <Badge appearance="tint" color={STATUS[row.status].color}>
                    {STATUS[row.status].label}
                  </Badge>
                </TableCell>
                <TableCell className="tabular-nums">{row.date.split("-").reverse().join("/")}</TableCell>
                <TableCell className="tabular-nums">{vnd.format(row.amount)}</TableCell>
                <TableCell>
                  <Menu>
                    <MenuTrigger asChild>
                      <Button appearance="subtle" icon={<MoreHorizontal20Regular />} aria-label={"Thao tác cho " + row.id} />
                    </MenuTrigger>
                    <MenuPopover align="end">
                      <MenuItem icon={<Eye20Regular />}>Xem chi tiết</MenuItem>
                      <MenuItem icon={<Copy20Regular />} onSelect={() => navigator.clipboard?.writeText(row.id)}>
                        Sao chép mã hoá đơn
                      </MenuItem>
                      <MenuDivider />
                      <MenuItem icon={<ArrowUndo20Regular className="rtl:-scale-x-100" />} disabled={row.status !== "paid"}>
                        Hoàn tiền
                      </MenuItem>
                    </MenuPopover>
                  </Menu>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-foreground-3">
                  Không có kết quả phù hợp.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-S">
        <span className="text-caption1 text-foreground-3">
          Trang {current + 1} / {pageCount} · {sorted.length} kết quả
        </span>
        <div className="flex gap-S">
          <Button size="small" icon={<ChevronLeft20Regular className="rtl:-scale-x-100" />} disabled={current === 0} onClick={() => setPage(current - 1)}>
            Trước
          </Button>
          <Button
            size="small"
            icon={<ChevronRight20Regular className="rtl:-scale-x-100" />}
            iconPosition="after"
            disabled={current >= pageCount - 1}
            onClick={() => setPage(current + 1)}
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
}`,
      render: () => <DataTableDemo />,
    },
    examples: [
      {
        title: "Cơ bản",
        description: "TableCellLayout ghép icon với nội dung chính.",
        code: `<Table aria-label="Tệp" className="w-full">
  <TableHeader>
    <TableRow>
      <TableHeaderCell>Tệp</TableHeaderCell>
      <TableHeaderCell className="w-32">Sửa lần cuối</TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>
        <TableCellLayout truncate media={<Document20Regular />}>Báo cáo quý 3.docx</TableCellLayout>
      </TableCell>
      <TableCell className="text-foreground-2">2 giờ trước</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <TableCellLayout truncate media={<Folder20Regular />}>Tài liệu dự án</TableCellLayout>
      </TableCell>
      <TableCell className="text-foreground-2">Hôm qua</TableCell>
    </TableRow>
    <TableRow>
      <TableCell>
        <TableCellLayout truncate media={<DocumentPdf20Regular />}>Hợp đồng.pdf</TableCellLayout>
      </TableCell>
      <TableCell className="text-foreground-2">3 ngày trước</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
        render: () => (
          <Table aria-label="Tệp" className="w-full">
            <TableHeader>
              <TableRow>
                <TableHeaderCell>Tệp</TableHeaderCell>
                <TableHeaderCell className="w-32">Sửa lần cuối</TableHeaderCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>
                  <TableCellLayout truncate media={<Document20Regular />}>Báo cáo quý 3.docx</TableCellLayout>
                </TableCell>
                <TableCell className="text-foreground-2">2 giờ trước</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <TableCellLayout truncate media={<Folder20Regular />}>Tài liệu dự án</TableCellLayout>
                </TableCell>
                <TableCell className="text-foreground-2">Hôm qua</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>
                  <TableCellLayout truncate media={<DocumentPdf20Regular />}>Hợp đồng.pdf</TableCellLayout>
                </TableCell>
                <TableCell className="text-foreground-2">3 ngày trước</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ),
      },
      {
        title: "Kích thước",
        description: "extra-small (24px) và small (34px); medium mặc định cao 44px.",
        code: `<div className="flex w-full flex-col gap-L">
  <Table size="extra-small" aria-label="extra-small">
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Tên</TableHeaderCell>
        <TableHeaderCell>Vai trò</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Nguyễn Văn An</TableCell>
        <TableCell>Kỹ sư</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Trần Thị Bình</TableCell>
        <TableCell>Thiết kế</TableCell>
      </TableRow>
    </TableBody>
  </Table>
  <Table size="small" aria-label="small">
    <TableHeader>
      <TableRow>
        <TableHeaderCell>Tên</TableHeaderCell>
        <TableHeaderCell>Vai trò</TableHeaderCell>
      </TableRow>
    </TableHeader>
    <TableBody>
      <TableRow>
        <TableCell>Nguyễn Văn An</TableCell>
        <TableCell>Kỹ sư</TableCell>
      </TableRow>
      <TableRow>
        <TableCell>Trần Thị Bình</TableCell>
        <TableCell>Thiết kế</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</div>`,
        render: () => (
          <div className="flex w-full flex-col gap-L">
            <Table size="extra-small" aria-label="extra-small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Tên</TableHeaderCell>
                  <TableHeaderCell>Vai trò</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Nguyễn Văn An</TableCell>
                  <TableCell>Kỹ sư</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Trần Thị Bình</TableCell>
                  <TableCell>Thiết kế</TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <Table size="small" aria-label="small">
              <TableHeader>
                <TableRow>
                  <TableHeaderCell>Tên</TableHeaderCell>
                  <TableHeaderCell>Vai trò</TableHeaderCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Nguyễn Văn An</TableCell>
                  <TableCell>Kỹ sư</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Trần Thị Bình</TableCell>
                  <TableCell>Thiết kế</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        ),
      },
      {
        title: "Chọn hàng & thao tác",
        description: "TableSelectionCell subtle chỉ hiện checkbox khi hover; TableCellActions hiện nút khi hover / focus hàng.",
        code: `const members = [
  { id: "an", name: "Nguyễn Văn An" },
  { id: "binh", name: "Trần Thị Bình" },
  { id: "cuong", name: "Lê Hoàng Cường" },
];

function TableSelectionDemo() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) =>
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  return (
    <Table aria-label="Thành viên" className="w-full">
      <TableHeader>
        <TableRow>
          <TableSelectionCell
            checked={selected.length === 0 ? false : selected.length === members.length ? true : "mixed"}
            onCheckedChange={(checked) => setSelected(checked ? members.map((m) => m.id) : [])}
          />
          <TableHeaderCell>Thành viên</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((m) => (
          <TableRow key={m.id} selected={selected.includes(m.id)}>
            <TableSelectionCell subtle checked={selected.includes(m.id)} onCheckedChange={() => toggle(m.id)} aria-label={"Chọn " + m.name} />
            <TableCell>
              <TableCellLayout media={<Avatar name={m.name} size={24} color="colorful" />}>{m.name}</TableCellLayout>
              <TableCellActions>
                <Button appearance="subtle" size="small" icon={<Edit20Regular />} aria-label={"Sửa " + m.name} />
              </TableCellActions>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}`,
        render: () => <TableSelectionDemo />,
      },
    ],
    dos: [
      "Căn tiêu đề cột cùng phía với dữ liệu; dùng tabular-nums cho số.",
      "Cho phép sắp xếp ở cột người dùng hay so sánh; header phản ánh hướng sắp xếp.",
      "Đặt thao tác hàng vào Menu “…” hoặc TableCellActions để bảng gọn.",
    ],
    donts: [
      "Không dùng Table để dàn bố cục trang.",
      "Không nhồi quá nhiều cột trên màn hẹp — bọc overflow-x-auto hoặc ẩn cột phụ.",
      "Không chỉ dùng màu nền để báo hàng đã chọn — luôn có checkbox.",
    ],
    props: [
      { name: "Table.size", type: `"extra-small" | "small" | "medium"`, defaultValue: `"medium"`, description: "Chiều cao hàng 24 / 34 / 44px." },
      { name: "Table.sortable", type: "boolean", defaultValue: "false", description: "Mọi TableHeaderCell thành nút sắp xếp." },
      { name: "TableHeaderCell.sortDirection", type: `"ascending" | "descending"`, description: "Hiện icon ArrowSortUp/Down và aria-sort." },
      { name: "TableHeaderCell.sortable / onClick", type: "boolean / MouseEventHandler", description: "Bật / tắt sắp xếp riêng cột; onClick gắn vào nút trong header." },
      { name: "TableRow.selected / appearance", type: `boolean / "none" | "neutral" | "brand"`, description: "Trạng thái nền của hàng." },
      { name: "TableCellLayout.media / description / appearance / truncate", type: `ReactNode / ReactNode / "primary" / boolean`, description: "Bố cục ô: media + nội dung chính + mô tả." },
      { name: "TableSelectionCell.checked / onCheckedChange / subtle", type: `boolean | "mixed" / (checked) => void / boolean`, description: "Checkbox chọn hàng; trong TableHeader thành ô chọn tất cả." },
    ],
  },

  /* ---------------------------------------------------------------- Tree */
  tree: {
    slug: "tree",
    name: "Tree",
    category: "Hiển thị dữ liệu",
    lead: "Tree hiển thị dữ liệu phân cấp dạng nhánh có thể mở / đóng, như cây thư mục hay danh mục điều hướng.",
    description:
      "TreeItem là nhánh (branch) hoặc lá (leaf); đặt một Tree bên trong nhánh để tạo cấp con, thụt lề tự động theo --tree-level. Bàn phím: ↑ ↓ di chuyển, → mở / vào con, ← đóng / về cha, Enter chọn.",
    importCode: `import { Tree, TreeItem, TreeItemLayout } from "@/components/ui";`,
    hero: {
      title: "Tree",
      code: `<Tree aria-label="Tệp dự án" defaultOpenItems={["src", "components"]} className="w-72">
  <TreeItem itemType="branch" value="src">
    <TreeItemLayout iconBefore={<Folder20Regular />}>src</TreeItemLayout>
    <Tree>
      <TreeItem itemType="branch" value="components">
        <TreeItemLayout
          iconBefore={<Folder20Regular />}
          aside={
            <Badge appearance="tint" color="informative" size="small">
              3
            </Badge>
          }
        >
          components
        </TreeItemLayout>
        <Tree>
          <TreeItem itemType="leaf" value="button">
            <TreeItemLayout iconBefore={<DocumentText20Regular />}>Button.tsx</TreeItemLayout>
          </TreeItem>
          <TreeItem itemType="leaf" value="card">
            <TreeItemLayout iconBefore={<DocumentText20Regular />}>Card.tsx</TreeItemLayout>
          </TreeItem>
          <TreeItem itemType="leaf" value="tree">
            <TreeItemLayout iconBefore={<DocumentText20Regular />}>Tree.tsx</TreeItemLayout>
          </TreeItem>
        </Tree>
      </TreeItem>
      <TreeItem itemType="leaf" value="main">
        <TreeItemLayout iconBefore={<DocumentText20Regular />}>main.tsx</TreeItemLayout>
      </TreeItem>
    </Tree>
  </TreeItem>
  <TreeItem itemType="branch" value="public">
    <TreeItemLayout iconBefore={<Folder20Regular />}>public</TreeItemLayout>
    <Tree>
      <TreeItem itemType="leaf" value="favicon">
        <TreeItemLayout iconBefore={<Image20Regular />}>favicon.svg</TreeItemLayout>
      </TreeItem>
    </Tree>
  </TreeItem>
  <TreeItem itemType="leaf" value="package">
    <TreeItemLayout iconBefore={<Document20Regular />}>package.json</TreeItemLayout>
  </TreeItem>
</Tree>`,
      render: () => (
        <Tree aria-label="Tệp dự án" defaultOpenItems={["src", "components"]} className="w-72">
          <TreeItem itemType="branch" value="src">
            <TreeItemLayout iconBefore={<Folder20Regular />}>src</TreeItemLayout>
            <Tree>
              <TreeItem itemType="branch" value="components">
                <TreeItemLayout
                  iconBefore={<Folder20Regular />}
                  aside={
                    <Badge appearance="tint" color="informative" size="small">
                      3
                    </Badge>
                  }
                >
                  components
                </TreeItemLayout>
                <Tree>
                  <TreeItem itemType="leaf" value="button">
                    <TreeItemLayout iconBefore={<DocumentText20Regular />}>Button.tsx</TreeItemLayout>
                  </TreeItem>
                  <TreeItem itemType="leaf" value="card">
                    <TreeItemLayout iconBefore={<DocumentText20Regular />}>Card.tsx</TreeItemLayout>
                  </TreeItem>
                  <TreeItem itemType="leaf" value="tree">
                    <TreeItemLayout iconBefore={<DocumentText20Regular />}>Tree.tsx</TreeItemLayout>
                  </TreeItem>
                </Tree>
              </TreeItem>
              <TreeItem itemType="leaf" value="main">
                <TreeItemLayout iconBefore={<DocumentText20Regular />}>main.tsx</TreeItemLayout>
              </TreeItem>
            </Tree>
          </TreeItem>
          <TreeItem itemType="branch" value="public">
            <TreeItemLayout iconBefore={<Folder20Regular />}>public</TreeItemLayout>
            <Tree>
              <TreeItem itemType="leaf" value="favicon">
                <TreeItemLayout iconBefore={<Image20Regular />}>favicon.svg</TreeItemLayout>
              </TreeItem>
            </Tree>
          </TreeItem>
          <TreeItem itemType="leaf" value="package">
            <TreeItemLayout iconBefore={<Document20Regular />}>package.json</TreeItemLayout>
          </TreeItem>
        </Tree>
      ),
    },
    examples: [
      {
        title: "Kích thước small",
        description: "Hàng cao 24px, chữ caption1, icon 16px.",
        code: `<Tree size="small" aria-label="Tài liệu" defaultOpenItems={["docs"]} className="w-60">
  <TreeItem itemType="branch" value="docs">
    <TreeItemLayout iconBefore={<Folder20Regular />}>Tài liệu</TreeItemLayout>
    <Tree>
      <TreeItem itemType="leaf">
        <TreeItemLayout iconBefore={<Document20Regular />}>Kế hoạch.docx</TreeItemLayout>
      </TreeItem>
      <TreeItem itemType="leaf">
        <TreeItemLayout iconBefore={<DocumentPdf20Regular />}>Hợp đồng.pdf</TreeItemLayout>
      </TreeItem>
    </Tree>
  </TreeItem>
  <TreeItem itemType="leaf">
    <TreeItemLayout iconBefore={<Image20Regular />}>Ảnh bìa.png</TreeItemLayout>
  </TreeItem>
</Tree>`,
        render: () => (
          <Tree size="small" aria-label="Tài liệu" defaultOpenItems={["docs"]} className="w-60">
            <TreeItem itemType="branch" value="docs">
              <TreeItemLayout iconBefore={<Folder20Regular />}>Tài liệu</TreeItemLayout>
              <Tree>
                <TreeItem itemType="leaf">
                  <TreeItemLayout iconBefore={<Document20Regular />}>Kế hoạch.docx</TreeItemLayout>
                </TreeItem>
                <TreeItem itemType="leaf">
                  <TreeItemLayout iconBefore={<DocumentPdf20Regular />}>Hợp đồng.pdf</TreeItemLayout>
                </TreeItem>
              </Tree>
            </TreeItem>
            <TreeItem itemType="leaf">
              <TreeItemLayout iconBefore={<Image20Regular />}>Ảnh bìa.png</TreeItemLayout>
            </TreeItem>
          </Tree>
        ),
      },
      {
        title: "Transparent & actions",
        description: "appearance=\"transparent\" bỏ nền hover; actions chỉ hiện khi hover hoặc focus.",
        code: `<Tree appearance="transparent" aria-label="Kênh" defaultOpenItems={["design"]} className="w-64">
  <TreeItem itemType="branch" value="design">
    <TreeItemLayout
      iconBefore={<People20Regular />}
      actions={<Button appearance="subtle" size="small" icon={<MoreHorizontal20Regular />} aria-label="Tuỳ chọn nhóm" />}
    >
      Nhóm thiết kế
    </TreeItemLayout>
    <Tree>
      <TreeItem itemType="leaf">
        <TreeItemLayout actions={<Button appearance="subtle" size="small" icon={<MoreHorizontal20Regular />} aria-label="Tuỳ chọn kênh" />}>
          Chung
        </TreeItemLayout>
      </TreeItem>
      <TreeItem itemType="leaf">
        <TreeItemLayout iconAfter={<Star20Regular />}>Thông báo</TreeItemLayout>
      </TreeItem>
    </Tree>
  </TreeItem>
</Tree>`,
        render: () => (
          <Tree appearance="transparent" aria-label="Kênh" defaultOpenItems={["design"]} className="w-64">
            <TreeItem itemType="branch" value="design">
              <TreeItemLayout
                iconBefore={<People20Regular />}
                actions={<Button appearance="subtle" size="small" icon={<MoreHorizontal20Regular />} aria-label="Tuỳ chọn nhóm" />}
              >
                Nhóm thiết kế
              </TreeItemLayout>
              <Tree>
                <TreeItem itemType="leaf">
                  <TreeItemLayout actions={<Button appearance="subtle" size="small" icon={<MoreHorizontal20Regular />} aria-label="Tuỳ chọn kênh" />}>
                    Chung
                  </TreeItemLayout>
                </TreeItem>
                <TreeItem itemType="leaf">
                  <TreeItemLayout iconAfter={<Star20Regular />}>Thông báo</TreeItemLayout>
                </TreeItem>
              </Tree>
            </TreeItem>
          </Tree>
        ),
      },
      {
        title: "Chọn mục",
        description: "selectionMode=\"single\": click hoặc Enter để chọn; mục chọn có tint brand và vạch chỉ báo.",
        code: `function TreeSelectionDemo() {
  const [selected, setSelected] = useState("work");
  return (
    <div className="flex w-64 flex-col gap-S">
      <Tree aria-label="Thư mục thư" selectionMode="single" selectedValue={selected} onSelectedChange={setSelected} defaultOpenItems={["inbox"]}>
        <TreeItem itemType="branch" value="inbox">
          <TreeItemLayout iconBefore={<Mail20Regular />}>Hộp thư đến</TreeItemLayout>
          <Tree>
            <TreeItem itemType="leaf" value="work">
              <TreeItemLayout>Công việc</TreeItemLayout>
            </TreeItem>
            <TreeItem itemType="leaf" value="family">
              <TreeItemLayout>Gia đình</TreeItemLayout>
            </TreeItem>
          </Tree>
        </TreeItem>
        <TreeItem itemType="leaf" value="sent">
          <TreeItemLayout iconBefore={<Send20Regular className="rtl:-scale-x-100" />}>Đã gửi</TreeItemLayout>
        </TreeItem>
        <TreeItem itemType="leaf" value="archive">
          <TreeItemLayout iconBefore={<Archive20Regular />}>Lưu trữ</TreeItemLayout>
        </TreeItem>
      </Tree>
      <span className="text-caption1 text-foreground-3">Đang chọn: {selected}</span>
    </div>
  );
}`,
        render: () => <TreeSelectionDemo />,
      },
    ],
    dos: [
      "Đặt aria-label cho Tree và value ổn định cho TreeItem cần điều khiển.",
      "Dùng icon trước (Folder / Document) để phân biệt loại mục.",
      "Giữ độ sâu tối đa 3–4 cấp để dễ quét.",
    ],
    donts: [
      "Không dùng Tree cho danh sách phẳng — dùng List.",
      "Không đặt hành động quan trọng chỉ trong actions ẩn; cung cấp thêm cách khác.",
      "Không dùng màu brand cho icon thư mục.",
    ],
    props: [
      { name: "Tree.size", type: `"small" | "medium"`, defaultValue: `"medium"`, description: "Hàng cao 24 / 32px." },
      { name: "Tree.appearance", type: `"subtle" | "transparent"`, defaultValue: `"subtle"`, description: "Nền khi hover." },
      { name: "Tree.openItems / defaultOpenItems / onOpenChange", type: "string[] / (openItems, { value, open }) => void", description: "Các nhánh đang mở." },
      { name: "Tree.selectionMode / selectedValue / onSelectedChange", type: `"none" | "single" / string / (value) => void`, defaultValue: `"none"`, description: "Chọn một mục (aria-selected)." },
      { name: "TreeItem.itemType", type: `"branch" | "leaf"`, description: "Nhánh có subtree hoặc mục lá." },
      { name: "TreeItem.value", type: "string", description: "Định danh cho openItems / selectedValue." },
      { name: "TreeItemLayout.iconBefore / iconAfter / aside / actions / expandIcon", type: "ReactNode", description: "Các vùng của hàng; actions chỉ hiện khi hover / focus." },
    ],
  },

  /* ---------------------------------------------------------------- Divider */
  divider: {
    slug: "divider",
    name: "Divider",
    category: "Bố cục",
    lead: "Divider là đường kẻ mảnh tách các nhóm nội dung, có thể kèm chữ hoặc icon ở giữa, đầu hoặc cuối.",
    description:
      "Mặc định nằm ngang và dùng stroke-2. Đặt vertical để chia các phần tử trên cùng một hàng. appearance subtle / brand / strong đổi độ đậm của đường kẻ.",
    importCode: `import { Divider } from "@/components/ui";`,
    hero: {
      title: "Divider",
      code: `<div className="flex w-full max-w-md flex-col gap-L">
  <Divider />
  <Divider>Hoặc</Divider>
  <Divider alignContent="start">Bắt đầu</Divider>
  <Divider alignContent="end">Kết thúc</Divider>
</div>`,
      render: () => (
        <div className="flex w-full max-w-md flex-col gap-L">
          <Divider />
          <Divider>Hoặc</Divider>
          <Divider alignContent="start">Bắt đầu</Divider>
          <Divider alignContent="end">Kết thúc</Divider>
        </div>
      ),
    },
    examples: [
      {
        title: "Appearance",
        description: "default (stroke-2), subtle (stroke-3), brand, strong (stroke-1).",
        code: `<div className="flex w-full flex-col gap-L">
  <Divider>default</Divider>
  <Divider appearance="subtle">subtle</Divider>
  <Divider appearance="brand">brand</Divider>
  <Divider appearance="strong">strong</Divider>
</div>`,
        render: () => (
          <div className="flex w-full flex-col gap-L">
            <Divider>default</Divider>
            <Divider appearance="subtle">subtle</Divider>
            <Divider appearance="brand">brand</Divider>
            <Divider appearance="strong">strong</Divider>
          </div>
        ),
      },
      {
        title: "Dọc",
        description: "vertical chia các phần tử trên cùng hàng; cao theo hàng chứa.",
        code: `<div className="flex h-20 items-center gap-M text-body1">
  <span>Thư</span>
  <Divider vertical />
  <span>Lịch</span>
  <Divider vertical>hoặc</Divider>
  <span>Danh bạ</span>
</div>`,
        render: () => (
          <div className="flex h-20 items-center gap-M text-body1">
            <span>Thư</span>
            <Divider vertical />
            <span>Lịch</span>
            <Divider vertical>hoặc</Divider>
            <span>Danh bạ</span>
          </div>
        ),
      },
      {
        title: "Icon & inset",
        description: "Nội dung có thể là icon; inset thụt hai đầu 12px.",
        code: `<div className="flex w-full flex-col gap-L">
  <Divider>
    <Star20Regular />
  </Divider>
  <Divider inset>Thụt hai đầu</Divider>
</div>`,
        render: () => (
          <div className="flex w-full flex-col gap-L">
            <Divider>
              <Star20Regular />
            </Divider>
            <Divider inset>Thụt hai đầu</Divider>
          </div>
        ),
      },
    ],
    dos: [
      "Dùng để tách nhóm nội dung khác nhau trong cùng một bề mặt.",
      "Chữ trên Divider ngắn gọn (“Hoặc”, tên nhóm).",
    ],
    donts: [
      "Không dùng Divider thay cho khoảng trắng khi khoảng trắng đã đủ tách nhóm.",
      "Không dùng appearance brand tràn lan — chỉ để nhấn một ranh giới quan trọng.",
    ],
    props: [
      { name: "vertical", type: "boolean", defaultValue: "false", description: "Đường kẻ dọc." },
      { name: "alignContent", type: `"start" | "center" | "end"`, defaultValue: `"center"`, description: "Vị trí chữ / icon trên đường kẻ." },
      { name: "appearance", type: `"default" | "subtle" | "brand" | "strong"`, defaultValue: `"default"`, description: "Màu đường kẻ và chữ." },
      { name: "inset", type: "boolean", defaultValue: "false", description: "Thụt hai đầu 12px." },
    ],
  },

  /* ---------------------------------------------------------------- ScrollArea */
  scrollarea: {
    slug: "scrollarea",
    name: "ScrollArea",
    category: "Bố cục",
    lead: "ScrollArea thay thanh cuộn mặc định của trình duyệt bằng thanh cuộn mảnh kiểu Fluent, chỉ hiện khi rê chuột.",
    description:
      "Dựa trên Radix Scroll Area nên vẫn giữ cuộn gốc (bánh xe, cảm ứng, bàn phím). orientation chọn thanh cuộn dọc, ngang hoặc cả hai.",
    importCode: `import { ScrollArea, ScrollBar } from "@/components/ui";`,
    hero: {
      title: "ScrollArea",
      code: `const versions = Array.from({ length: 30 }, (_, i) => "v2." + (30 - i) + ".0");

<ScrollArea className="h-72 w-56 rounded-medium border border-stroke-2 bg-background-1">
  <div className="p-L">
    <p className="mb-S text-body1 font-semibold">Phiên bản</p>
    {versions.map((version) => (
      <div key={version}>
        <div className="py-S text-body1">{version}</div>
        <Divider appearance="subtle" />
      </div>
    ))}
  </div>
</ScrollArea>`,
      render: () => (
        <ScrollArea className="h-72 w-56 rounded-medium border border-stroke-2 bg-background-1">
          <div className="p-L">
            <p className="mb-S text-body1 font-semibold">Phiên bản</p>
            {versions.map((version) => (
              <div key={version}>
                <div className="py-S text-body1">{version}</div>
                <Divider appearance="subtle" />
              </div>
            ))}
          </div>
        </ScrollArea>
      ),
    },
    examples: [
      {
        title: "Ngang",
        description: "orientation=\"horizontal\" cho dải thẻ / ảnh.",
        code: `// mountain, sunset, landscape, scenery: URL ảnh bất kỳ (ở đây là SVG sinh sẵn).
<ScrollArea orientation="horizontal" className="w-full max-w-sm rounded-medium border border-stroke-2 bg-background-1">
  <div className="flex w-max gap-M p-M">
    {scenery.map((item) => (
      <figure key={item.title} className="m-0 shrink-0">
        <Image src={item.src} alt={item.title} fit="cover" shape="rounded" className="h-28 w-40" />
        <figcaption className="pt-XS text-caption1 text-foreground-3">{item.title}</figcaption>
      </figure>
    ))}
  </div>
</ScrollArea>`,
        render: () => (
          <ScrollArea orientation="horizontal" className="w-full max-w-sm rounded-medium border border-stroke-2 bg-background-1">
            <div className="flex w-max gap-M p-M">
              {scenery.map((item) => (
                <figure key={item.title} className="m-0 shrink-0">
                  <Image src={item.src} alt={item.title} fit="cover" shape="rounded" className="h-28 w-40" />
                  <figcaption className="pt-XS text-caption1 text-foreground-3">{item.title}</figcaption>
                </figure>
              ))}
            </div>
          </ScrollArea>
        ),
      },
      {
        title: "Cả hai chiều",
        description: "orientation=\"both\" cho lưới lớn hơn khung.",
        code: `<ScrollArea orientation="both" className="h-56 w-full max-w-sm rounded-medium border border-stroke-2 bg-background-1">
  <div className="grid w-max grid-cols-10 gap-S p-M">
    {Array.from({ length: 80 }, (_, i) => (
      <div key={i} className="flex size-16 items-center justify-center rounded-medium bg-background-3 text-caption1 text-foreground-2">
        {i + 1}
      </div>
    ))}
  </div>
</ScrollArea>`,
        render: () => (
          <ScrollArea orientation="both" className="h-56 w-full max-w-sm rounded-medium border border-stroke-2 bg-background-1">
            <div className="grid w-max grid-cols-10 gap-S p-M">
              {Array.from({ length: 80 }, (_, i) => (
                <div key={i} className="flex size-16 items-center justify-center rounded-medium bg-background-3 text-caption1 text-foreground-2">
                  {i + 1}
                </div>
              ))}
            </div>
          </ScrollArea>
        ),
      },
    ],
    dos: [
      "Đặt chiều cao / rộng cố định cho ScrollArea để vùng cuộn rõ ràng.",
      "Dùng cho panel, danh sách dài trong bề mặt nhỏ (Popover, Card, Drawer).",
    ],
    donts: [
      "Không bọc cả trang trong ScrollArea — để trình duyệt cuộn trang.",
      "Không lồng nhiều vùng cuộn cùng chiều trong nhau.",
    ],
    props: [
      { name: "orientation", type: `"vertical" | "horizontal" | "both"`, defaultValue: `"vertical"`, description: "Thanh cuộn hiển thị." },
      { name: "type", type: `"hover" | "scroll" | "auto" | "always"`, defaultValue: `"hover"`, description: "Khi nào hiện thanh cuộn (Radix)." },
      { name: "viewportClassName", type: "string", description: "Class cho viewport bên trong." },
      { name: "ScrollBar.orientation", type: `"vertical" | "horizontal"`, defaultValue: `"vertical"`, description: "Dùng khi tự ghép Radix primitive." },
    ],
  },

  /* ---------------------------------------------------------------- Carousel */
  carousel: {
    slug: "carousel",
    name: "Carousel",
    category: "Hiển thị dữ liệu",
    lead: "Carousel trình bày một chuỗi nội dung theo từng slide, điều hướng bằng nút trước / sau, chấm chỉ mục, ảnh thu nhỏ hoặc phím mũi tên.",
    description:
      "Track dùng CSS scroll-snap nên vuốt / cuộn tự nhiên trên mọi thiết bị. loop quay vòng ở hai đầu; slidesPerView (vd. 1.15) và gap lộ một phần slide kế. Autoplay hiện tiến độ ngay trong chấm đang chọn, tự dừng khi rê chuột, focus vào slide hoặc khi tab bị ẩn, và không tự bật nếu người dùng chọn giảm chuyển động. Mỗi slide có nhãn “Slide x / n”; chấm và thumbnail là tablist điều khiển bằng mũi tên (đảo vai ở RTL), Home / End.",
    importCode: `import {
  Carousel, CarouselViewport, CarouselCard, CarouselNavContainer, CarouselThumbnails, CarouselThumbnail,
} from "@/components/ui";`,
    hero: {
      title: "Carousel",
      code: `<Carousel loop aria-label="Điểm nổi bật" className="w-full max-w-2xl">
  <CarouselViewport>
    <CarouselCard>
      <div className="relative h-64 overflow-hidden rounded-xlarge bg-gradient-aurora">
        <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
          <p className="text-subtitle2 font-semibold">Fluent 2 cho web</p>
          <p className="text-caption1 text-foreground-3">Token, component và tài liệu luôn đồng bộ.</p>
        </div>
      </div>
    </CarouselCard>
    <CarouselCard>
      <div className="relative h-64 overflow-hidden rounded-xlarge">
        <BloomArt />
        <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
          <p className="text-subtitle2 font-semibold">Bloom theo brand</p>
          <p className="text-caption1 text-foreground-3">Đổi data-brand là đổi màu minh hoạ.</p>
        </div>
      </div>
    </CarouselCard>
    <CarouselCard>
      <div className="relative h-64 overflow-hidden rounded-xlarge bg-gradient-sunset">
        <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
          <p className="text-subtitle2 font-semibold">Ngôn ngữ biểu cảm</p>
          <p className="text-caption1 text-foreground-3">Gradient chỉ dành cho minh hoạ và hero.</p>
        </div>
      </div>
    </CarouselCard>
    <CarouselCard>
      <div className="relative h-64 overflow-hidden rounded-xlarge bg-gradient-brand">
        <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
          <p className="text-subtitle2 font-semibold">Sáng & tối</p>
          <p className="text-caption1 text-foreground-3">Đổi theme ngay trong khung ví dụ.</p>
        </div>
      </div>
    </CarouselCard>
  </CarouselViewport>
  <CarouselNavContainer autoplay />
</Carousel>`,
      render: () => (
        <Carousel loop aria-label="Điểm nổi bật" className="w-full max-w-2xl">
          <CarouselViewport>
            <CarouselCard>
              <div className="relative h-64 overflow-hidden rounded-xlarge bg-gradient-aurora">
                <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
                  <p className="text-subtitle2 font-semibold">Fluent 2 cho web</p>
                  <p className="text-caption1 text-foreground-3">Token, component và tài liệu luôn đồng bộ.</p>
                </div>
              </div>
            </CarouselCard>
            <CarouselCard>
              <div className="relative h-64 overflow-hidden rounded-xlarge">
                <BloomArt />
                <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
                  <p className="text-subtitle2 font-semibold">Bloom theo brand</p>
                  <p className="text-caption1 text-foreground-3">Đổi data-brand là đổi màu minh hoạ.</p>
                </div>
              </div>
            </CarouselCard>
            <CarouselCard>
              <div className="relative h-64 overflow-hidden rounded-xlarge bg-gradient-sunset">
                <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
                  <p className="text-subtitle2 font-semibold">Ngôn ngữ biểu cảm</p>
                  <p className="text-caption1 text-foreground-3">Gradient chỉ dành cho minh hoạ và hero.</p>
                </div>
              </div>
            </CarouselCard>
            <CarouselCard>
              <div className="relative h-64 overflow-hidden rounded-xlarge bg-gradient-brand">
                <div className="absolute inset-s-L bottom-L max-w-xs rounded-medium bg-background-1 p-M shadow-4">
                  <p className="text-subtitle2 font-semibold">Sáng & tối</p>
                  <p className="text-caption1 text-foreground-3">Đổi theme ngay trong khung ví dụ.</p>
                </div>
              </div>
            </CarouselCard>
          </CarouselViewport>
          <CarouselNavContainer autoplay />
        </Carousel>
      ),
    },
    examples: [
      {
        title: "Peek & vòng lặp",
        description: "slidesPerView={1.15} lộ 15% slide kế, gap=\"M\" giãn khoảng cách; loop quay vòng ở hai đầu.",
        code: `// scenery: { title, src }[] — URL ảnh bất kỳ (ở đây là SVG sinh sẵn).
<Carousel loop slidesPerView={1.15} gap="M" aria-label="Phong cảnh" className="w-full">
  <CarouselViewport>
    {scenery.map((item) => (
      <CarouselCard key={item.title}>
        <Image src={item.src} alt={item.title} fit="cover" shape="rounded" className="h-40" />
        <p className="pt-XS text-caption1 text-foreground-3">{item.title}</p>
      </CarouselCard>
    ))}
  </CarouselViewport>
  <CarouselNavContainer />
</Carousel>`,
        render: () => (
          <Carousel loop slidesPerView={1.15} gap="M" aria-label="Phong cảnh" className="w-full">
            <CarouselViewport>
              {scenery.map((item) => (
                <CarouselCard key={item.title}>
                  <Image src={item.src} alt={item.title} fit="cover" shape="rounded" className="h-40" />
                  <p className="pt-XS text-caption1 text-foreground-3">{item.title}</p>
                </CarouselCard>
              ))}
            </CarouselViewport>
            <CarouselNavContainer />
          </Carousel>
        ),
      },
      {
        title: "Autoplay có tiến độ",
        description: "Chấm đang chọn dài ra và đầy dần theo autoplayInterval; rê chuột / focus vào slide hoặc ẩn tab là tạm dừng.",
        code: `const tips = [
  { title: "Phím tắt", text: "Nhấn Ctrl + K để mở bảng lệnh ở bất kỳ đâu.", icon: <Keyboard20Regular /> },
  { title: "Chủ đề tối", text: "Đổi Web Light / Web Dark ngay trong khung ví dụ.", icon: <WeatherMoon20Regular /> },
  { title: "Brand cục bộ", text: "Đặt data-brand trên phần tử để đổi màu cho một vùng.", icon: <Color20Regular /> },
];

<Carousel loop defaultAutoplay autoplayInterval={5000} aria-label="Mẹo sử dụng" className="w-full">
  <CarouselViewport>
    {tips.map((tip) => (
      <CarouselCard key={tip.title}>
        <div className="flex h-36 flex-col justify-center gap-XS rounded-xlarge border border-stroke-2 bg-background-1 p-L">
          <span className="flex text-brand-foreground-1 [&>svg]:size-6">{tip.icon}</span>
          <p className="text-subtitle2 font-semibold">{tip.title}</p>
          <p className="text-body1 text-foreground-2">{tip.text}</p>
        </div>
      </CarouselCard>
    ))}
  </CarouselViewport>
  <CarouselNavContainer autoplay />
</Carousel>`,
        render: () => (
          <Carousel loop defaultAutoplay autoplayInterval={5000} aria-label="Mẹo sử dụng" className="w-full">
            <CarouselViewport>
              {tips.map((tip) => (
                <CarouselCard key={tip.title}>
                  <div className="flex h-36 flex-col justify-center gap-XS rounded-xlarge border border-stroke-2 bg-background-1 p-L">
                    <span className="flex text-brand-foreground-1 [&>svg]:size-6">{tip.icon}</span>
                    <p className="text-subtitle2 font-semibold">{tip.title}</p>
                    <p className="text-body1 text-foreground-2">{tip.text}</p>
                  </div>
                </CarouselCard>
              ))}
            </CarouselViewport>
            <CarouselNavContainer autoplay />
          </Carousel>
        ),
      },
      {
        title: "Ảnh thu nhỏ",
        description: "CarouselThumbnails thay cho chấm: tablist ảnh nhỏ, tự cuộn tới ảnh đang chọn; đặt aria-label từng ảnh.",
        code: `<Carousel aria-label="Thư viện ảnh" className="w-full">
  <CarouselViewport>
    {scenery.map((item) => (
      <CarouselCard key={item.title}>
        <Image src={item.src} alt={item.title} fit="cover" shape="rounded" className="h-40" />
      </CarouselCard>
    ))}
  </CarouselViewport>
  <CarouselThumbnails aria-label="Chọn ảnh" className="mx-auto w-fit max-w-full">
    {scenery.map((item) => (
      <CarouselThumbnail key={item.title} aria-label={item.title}>
        <Image src={item.src} alt="" fit="cover" />
      </CarouselThumbnail>
    ))}
  </CarouselThumbnails>
</Carousel>`,
        render: () => (
          <Carousel aria-label="Thư viện ảnh" className="w-full">
            <CarouselViewport>
              {scenery.map((item) => (
                <CarouselCard key={item.title}>
                  <Image src={item.src} alt={item.title} fit="cover" shape="rounded" className="h-40" />
                </CarouselCard>
              ))}
            </CarouselViewport>
            <CarouselThumbnails aria-label="Chọn ảnh" className="mx-auto w-fit max-w-full">
              {scenery.map((item) => (
                <CarouselThumbnail key={item.title} aria-label={item.title}>
                  <Image src={item.src} alt="" fit="cover" />
                </CarouselThumbnail>
              ))}
            </CarouselThumbnails>
          </Carousel>
        ),
      },
    ],
    dos: [
      "Đặt aria-label cho Carousel; mỗi slide tự có nhãn “Slide x / n”, thumbnail nên có aria-label riêng.",
      "Giữ 3–6 slide cùng loại; dùng slidesPerView lẻ (1.15, 2.5) để gợi ý còn nội dung phía sau.",
      "Khi bật autoplay, luôn hiện nút tạm dừng (CarouselNavContainer autoplay).",
    ],
    donts: [
      "Không đặt thông tin quan trọng duy nhất trong slide ẩn.",
      "Không bật autoplay mặc định cho nội dung cần đọc kỹ.",
      "Không dùng cả chấm và thumbnail cho cùng một Carousel.",
    ],
    props: [
      { name: "loop", type: "boolean", defaultValue: "false", description: "Quay vòng ở hai đầu (tên cũ: circular)." },
      { name: "slidesPerView", type: "number", description: "Số slide thấy cùng lúc; số lẻ để lộ slide kế (1.15, 2.5). Bỏ trống = 100%." },
      { name: "gap", type: `"none" | "XS" | "S" | "M" | "L" | "XL"`, defaultValue: `"S"`, description: "Khoảng cách giữa các slide (token spacing)." },
      { name: "autoplay / defaultAutoplay / onAutoplayChange", type: "boolean / boolean / (value) => void", defaultValue: "— / false", description: "Tự chạy (controlled / uncontrolled). defaultAutoplay bị bỏ qua khi prefers-reduced-motion." },
      { name: "autoplayInterval", type: "number", defaultValue: "4000", description: "Thời gian mỗi slide (ms); tiến độ hiện trong chấm / thumbnail đang chọn." },
      { name: "onActiveIndexChange", type: "(index: number) => void", description: "Gọi khi slide hiện tại thay đổi." },
      { name: "CarouselCard.className", type: "string", description: "basis-full mặc định; basis-4/5 hoặc basis-1/2 khi không dùng slidesPerView." },
      { name: "CarouselNavContainer.autoplay", type: "boolean", defaultValue: "false", description: "Hiện nút bật / tắt tự chạy." },
      { name: "CarouselNavContainer.prevLabel / nextLabel", type: "string", defaultValue: `"Slide trước" / "Slide tiếp theo"`, description: "aria-label cho nút điều hướng." },
      { name: "CarouselThumbnails / CarouselThumbnail", type: "HTMLAttributes / ButtonHTMLAttributes", description: "Tablist ảnh thu nhỏ; mỗi CarouselThumbnail ứng với slide cùng vị trí." },
    ],
  },

  /* ---------------------------------------------------------------- Resizable */
  resizable: {
    slug: "resizable",
    name: "Resizable",
    category: "Bố cục",
    lead: "Resizable chia một vùng thành các panel mà người dùng kéo để đổi kích thước, thu gọn / mở rộng, theo chiều ngang hoặc dọc.",
    description:
      "Dựa trên react-resizable-panels v4. defaultSize / minSize dạng chuỗi “30%” là phần trăm, dạng số là pixel. Đường chia mảnh stroke-2, chuyển brand khi hover / kéo. Bàn phím khi focus đường chia: mũi tên đổi 5%, Home / End về cực, Enter thu gọn / mở rộng, F6 sang đường chia kế. Nhấp đúp đường chia đưa panel về defaultSize. persistKey lưu bố cục vào localStorage. Ở RTL, nhóm ngang hiển thị phải → trái; kéo và phím mũi tên đi theo hướng nhìn thấy.",
    importCode: `import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui";`,
    hero: {
      title: "Resizable",
      code: `<div className="h-80 w-full max-w-2xl overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
  <ResizablePanelGroup orientation="horizontal">
    <ResizablePanel id="ide-sidebar" defaultSize="28%" minSize="18%" collapsible>
      <div className="flex h-full items-center justify-center bg-background-2 p-L font-semibold">Thanh bên</div>
    </ResizablePanel>
    <ResizableHandle withHandle collapseButton="before" />
    <ResizablePanel id="ide-main" defaultSize="72%">
      <ResizablePanelGroup orientation="vertical">
        <ResizablePanel id="ide-editor" defaultSize="65%">
          <div className="flex h-full items-center justify-center p-L font-semibold">Nội dung</div>
        </ResizablePanel>
        <ResizableHandle withHandle collapseButton="after" />
        <ResizablePanel id="ide-terminal" defaultSize="35%" minSize="20%" collapsible>
          <div className="flex h-full items-center justify-center p-L font-semibold">Terminal</div>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  </ResizablePanelGroup>
</div>`,
      render: () => (
        <div className="h-80 w-full max-w-2xl overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
          <ResizablePanelGroup orientation="horizontal">
            <ResizablePanel id="ide-sidebar" defaultSize="28%" minSize="18%" collapsible>
              <div className="flex h-full items-center justify-center bg-background-2 p-L font-semibold">Thanh bên</div>
            </ResizablePanel>
            <ResizableHandle withHandle collapseButton="before" />
            <ResizablePanel id="ide-main" defaultSize="72%">
              <ResizablePanelGroup orientation="vertical">
                <ResizablePanel id="ide-editor" defaultSize="65%">
                  <div className="flex h-full items-center justify-center p-L font-semibold">Nội dung</div>
                </ResizablePanel>
                <ResizableHandle withHandle collapseButton="after" />
                <ResizablePanel id="ide-terminal" defaultSize="35%" minSize="20%" collapsible>
                  <div className="flex h-full items-center justify-center p-L font-semibold">Terminal</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      ),
    },
    examples: [
      {
        title: "Lưu bố cục",
        description: "persistKey ghi bố cục vào localStorage sau mỗi lần kéo (bọc try/catch); đặt id cố định cho từng panel. Kéo rồi tải lại trang.",
        code: `<div className="h-48 w-full overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
  <ResizablePanelGroup orientation="horizontal" persistKey="yugen-docs-mail">
    <ResizablePanel id="mail-folders" defaultSize="35%" minSize="20%">
      <div className="flex h-full items-center justify-center bg-background-2 p-L font-semibold">Thư mục</div>
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel id="mail-messages" defaultSize="65%">
      <div className="flex h-full items-center justify-center p-L text-center font-semibold">Kéo rồi tải lại trang</div>
    </ResizablePanel>
  </ResizablePanelGroup>
</div>`,
        render: () => (
          <div className="h-48 w-full overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            <ResizablePanelGroup orientation="horizontal" persistKey="yugen-docs-mail">
              <ResizablePanel id="mail-folders" defaultSize="35%" minSize="20%">
                <div className="flex h-full items-center justify-center bg-background-2 p-L font-semibold">Thư mục</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel id="mail-messages" defaultSize="65%">
                <div className="flex h-full items-center justify-center p-L text-center font-semibold">Kéo rồi tải lại trang</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ),
      },
      {
        title: "Dọc có grip",
        description: "orientation=\"vertical\" và ResizableHandle withHandle.",
        code: `<div className="h-56 w-full overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
  <ResizablePanelGroup orientation="vertical">
    <ResizablePanel defaultSize="30%" minSize="20%">
      <div className="flex h-full items-center justify-center p-L font-semibold">Tiêu đề</div>
    </ResizablePanel>
    <ResizableHandle withHandle />
    <ResizablePanel defaultSize="70%">
      <div className="flex h-full items-center justify-center p-L font-semibold">Nội dung</div>
    </ResizablePanel>
  </ResizablePanelGroup>
</div>`,
        render: () => (
          <div className="h-56 w-full overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            <ResizablePanelGroup orientation="vertical">
              <ResizablePanel defaultSize="30%" minSize="20%">
                <div className="flex h-full items-center justify-center p-L font-semibold">Tiêu đề</div>
              </ResizablePanel>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize="70%">
                <div className="flex h-full items-center justify-center p-L font-semibold">Nội dung</div>
              </ResizablePanel>
            </ResizablePanelGroup>
          </div>
        ),
      },
      {
        title: "RTL lật thứ tự",
        description:
          "Panel đầu tiên nằm bên phải; kéo và ArrowLeft / ArrowRight di chuyển đường chia đúng hướng nhìn thấy. mirrorInRtl={false} giữ bố cục LTR như bản cũ.",
        code: `import { DirectionProvider } from "@radix-ui/react-direction";

<DirectionProvider dir="rtl">
  <div dir="rtl" className="h-48 w-full overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
    <ResizablePanelGroup orientation="horizontal">
      <ResizablePanel defaultSize="35%" minSize="20%" collapsible>
        <div className="flex h-full items-center justify-center bg-background-2 p-L font-semibold">الشريط الجانبي</div>
      </ResizablePanel>
      <ResizableHandle withHandle collapseButton="before" />
      <ResizablePanel defaultSize="65%">
        <div className="flex h-full items-center justify-center p-L font-semibold">المحتوى</div>
      </ResizablePanel>
    </ResizablePanelGroup>
  </div>
</DirectionProvider>`,
        render: () => (
          <DirectionProvider dir="rtl">
            <div dir="rtl" className="h-48 w-full overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
              <ResizablePanelGroup orientation="horizontal">
                <ResizablePanel defaultSize="35%" minSize="20%" collapsible>
                  <div className="flex h-full items-center justify-center bg-background-2 p-L font-semibold">الشريط الجانبي</div>
                </ResizablePanel>
                <ResizableHandle withHandle collapseButton="before" />
                <ResizablePanel defaultSize="65%">
                  <div className="flex h-full items-center justify-center p-L font-semibold">المحتوى</div>
                </ResizablePanel>
              </ResizablePanelGroup>
            </div>
          </DirectionProvider>
        ),
      },
    ],
    dos: [
      "Đặt minSize để panel không bị kéo mất nội dung; collapsible cho panel phụ (thanh bên, terminal).",
      "Dùng collapseButton cho panel người dùng hay ẩn / hiện; Enter trên đường chia làm cùng việc.",
      "Đặt id cố định cho panel khi dùng persistKey; đặt khung chứa có chiều cao cố định cho group dọc.",
    ],
    donts: [
      "Không chia quá 3–4 panel trong một group.",
      "Không bỏ ResizableHandle giữa hai panel — ở RTL, chỉ đường chia mới được lật hướng kéo.",
      "Không dùng Resizable cho bố cục người dùng không cần tuỳ chỉnh.",
    ],
    props: [
      { name: "ResizablePanelGroup.orientation", type: `"horizontal" | "vertical"`, defaultValue: `"horizontal"`, description: "Hướng chia panel." },
      { name: "ResizablePanelGroup.persistKey", type: "string", description: "Lưu / khôi phục bố cục qua localStorage (khoá react-resizable-panels:<persistKey>)." },
      { name: "ResizablePanelGroup.mirrorInRtl", type: "boolean", defaultValue: "true", description: "RTL: hiển thị nhóm ngang phải → trái và đảo hướng kéo / phím; false = giữ bố cục LTR." },
      { name: "ResizablePanelGroup.onLayoutChanged", type: "(layout: Layout, meta) => void", description: "Gọi sau khi kéo xong — dùng để lưu bố cục theo cách riêng." },
      { name: "ResizablePanel.defaultSize / minSize / maxSize", type: "number | string", description: "Chuỗi “30%” = phần trăm, số = px. Nhấp đúp đường chia trả về defaultSize." },
      { name: "ResizablePanel.collapsible / collapsedSize", type: "boolean / number | string", defaultValue: `false / "0%"`, description: "Cho phép thu gọn panel (kéo qua minSize, Enter, hoặc nút)." },
      { name: "ResizableHandle.withHandle", type: "boolean", defaultValue: "false", description: "Hiện grip ở giữa đường chia." },
      { name: "ResizableHandle.collapseButton", type: `"before" | "after"`, description: "Nút thu gọn / mở rộng panel trước (trên / đầu dòng) hoặc sau đường chia; panel đó phải collapsible." },
      { name: "ResizableHandle.collapseLabel / expandLabel", type: "string", defaultValue: `"Thu gọn panel" / "Mở rộng panel"`, description: "Chú thích (title) của nút." },
      { name: "ResizableHandle.disabled / disableDoubleClick", type: "boolean", defaultValue: "false", description: "Khoá đường chia / tắt nhấp đúp để đặt lại." },
    ],
  },

};

export const docs: ComponentDoc[] = Object.values(DISPLAY);
