import type { ReactNode } from "react";
import { DocSection, DoDont } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { CustomerDirectoryDemo, type DataTableText } from "./demos/data-tables";

function C({ children }: { children: ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body2 text-foreground-2">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function SimpleTable({ head, rows }: { head: string[]; rows: ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} scope="col" className="px-4 py-2 text-start">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-stroke-3 align-top last:border-b-0">
              {row.map((cell, j) => (
                <td key={j} className={j === 0 ? "px-4 py-3 font-semibold text-foreground-1" : "px-4 py-3 text-foreground-2"}>
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

const TEXT: DataTableText = {
  locale: "vi-VN",
  grid: "Khách hàng",
  picker: "Cột khách hàng",
  count: (n) => `${n} khách hàng`,
  selected: (n) => `Đã chọn ${n}`,
  density: "Mật độ",
  comfortable: "Thoải mái",
  compact: "Gọn",
  bodyText: "Chữ 16px",
  state: "Trạng thái dữ liệu",
  states: { data: "Dữ liệu", loading: "Đang tải", empty: "Rỗng", error: "Lỗi" },
  columns: {
    name: "Khách hàng",
    code: "Mã KH",
    phone: "Điện thoại",
    email: "Email",
    address: "Địa chỉ",
    province: "Tỉnh / thành",
    tier: "Hạng",
    orders: "Đơn hàng",
    balance: "Công nợ",
    updated: "Cập nhật",
  },
  tiers: { gold: "Vàng", silver: "Bạc", bronze: "Đồng" },
  none: "Chưa có",
  emptyTitle: "Không có khách hàng phù hợp",
  emptyDescription: "Thử tỉnh khác hoặc xoá bộ lọc.",
  clearFilters: "Xoá bộ lọc",
  errorTitle: "Không tải được danh sách khách hàng",
  errorDescription: "Máy chủ không phản hồi. Cột và lựa chọn của bạn vẫn được giữ.",
  retry: "Thử lại",
  measure: (grid, need) =>
    grid === 0
      ? `Các cột đang hiện cần ${need.toLocaleString("vi-VN")}px.`
      : `Lưới rộng ${grid.toLocaleString("vi-VN")}px, các cột đang hiện cần ${need.toLocaleString("vi-VN")}px: ${
          grid >= need ? "không cuộn ngang" : "lưới cuộn ngang, trang thì không"
        }.`,
};

const RECIPE_CODE = `<DataGrid
  aria-label="Customers"
  items={customers}
  columns={columns}
  getRowId={(c) => c.id}
  hiddenColumns={hiddenColumns}
  columnOrder={columnOrder}
  sortable
  selectionMode="multiselect"
  size="small"                       // compact: 34px rows
  className="text-body2"             // keep a 16px type size; rows grow when cells wrap
  height="28rem"                     // loading, empty and error stay in the same box
  loading={status === "loading"}
  empty={status === "error" ? <LoadError onRetry={reload} /> : <NoResults />}
/>`;

const COLUMNS_CODE = `const columns = [
  // Primary identifier: pinned (needs a width), always shown, wraps instead of truncating.
  createColumn<Customer>({
    columnId: "name",
    label: "Customer",
    renderCell: (c) => <span className="min-w-0 py-1 font-semibold wrap-break-word">{c.name}</span>,
    width: 240,
    sticky: "start",
    hideable: false,
  }),
  // Codes, phone numbers, dates: fixed width, one line.
  createColumn<Customer>({ columnId: "code", label: "Code", renderCell: (c) => c.id, width: 120 }),
  // Long text: a minimum width, shares the remaining space, wraps.
  createColumn<Customer>({
    columnId: "address",
    label: "Address",
    renderCell: (c) => <span className="min-w-0 py-1 wrap-break-word">{c.address}</span>,
    minWidth: 300,
  }),
  // Amounts: fixed width, end-aligned, formatted for the locale.
  createColumn<Customer>({
    columnId: "balance",
    label: "Balance",
    renderCell: (c) => vnd.format(c.balance),
    compare: (a, b) => a.balance - b.balance,
    width: 168,
    align: "end",
  }),
];`;

const PICKER_CODE = `<DataGridColumnPicker
  compact                                  // icon + hidden count; "Customer columns" stays the name
  mode="auto"                              // menu from 768px, bottom sheet below
  resettable={{ hiddenColumns: ["phone"] }} // "Reset columns" brings back the default view
  columns={columns}
  hiddenColumns={hiddenColumns}
  onHiddenColumnsChange={(_, d) => setHiddenColumns(d.hiddenColumns)}
  columnOrder={columnOrder}
  onColumnOrderChange={(_, d) => setColumnOrder(d.columnOrder)}
>
  Customer columns
</DataGridColumnPicker>`;

const TABLE_CODE = `<Table sortable size="small" className="text-body2">
  <TableHeader>
    <TableRow>
      <TableHeaderCell>Customer</TableHeaderCell>
      <TableHeaderCell align="end" sortDirection="descending" onClick={sortByBalance}>
        Balance
      </TableHeaderCell>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell className="wrap-break-word">Công ty TNHH Thương mại và Dịch vụ Hoàng Gia Phát</TableCell>
      <TableCell align="end">1.275.900.000 ₫</TableCell>
    </TableRow>
  </TableBody>
</Table>`;

export default function Page() {
  return (
    <>
      <DocSection
        id="example"
        title="Ví dụ: danh bạ khách hàng"
        description="Mười cột, tên và địa chỉ tiếng Việt dài, ô trống, cột tên được ghim và nút chọn cột dạng gọn. Đổi mật độ, cỡ chữ và trạng thái dữ liệu; dòng dưới lưới cho biết độ rộng đo được."
      >
        <div className="flex flex-col gap-4">
          <CustomerDirectoryDemo text={TEXT} />
          <CodeBlock code={RECIPE_CODE} />
        </div>
      </DocSection>

      <DocSection id="density" title="Thoải mái hay gọn" description="Mật độ đặt chiều cao hàng và khoảng đệm, không đặt cỡ chữ.">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Tiêu chí", "Thoải mái", "Gọn"]}
            rows={[
              ["DataGrid / Table", <><C>size="medium"</C>: hàng 44px</>, <><C>size="small"</C>: hàng 34px</>],
              [
                "Dùng cho",
                "Bảng đọc từng hàng, màn hình cảm ứng, hàng có avatar hoặc ô hai dòng, khoảng 6 cột trở xuống.",
                "Bảng để quét và so sánh bằng chuột và bàn phím: hoá đơn, danh bạ, danh sách nghiệp vụ 8–15 cột.",
              ],
              ["Chữ", "body1 (14px). className=\"text-body2\" cho 16px.", "Như nhau. Gọn không thu nhỏ chữ; hàng cao lên khi ô xuống dòng."],
            ]}
          />
          <Bullets
            items={[
              <>
                Ứng dụng dùng cỡ chữ 16px truyền <C>className=&quot;text-body2&quot;</C> cho DataGrid hoặc Table và giữ nguyên ở cả hai mật
                độ.
              </>,
              <>
                Cho cả màn hình: <C>YugenProvider density=&quot;compact&quot;</C> cho control size small và thu khoảng cách (Theming › Props
                mặc định & mật độ). <C>size</C> đặt trên lưới vẫn thắng.
              </>,
              "Màn hình dùng cảm ứng là chính thì giữ hàng 44px: hàng 34px là đích chạm nhỏ với ngón tay.",
            ]}
          />
        </div>
      </DocSection>

      <DocSection
        id="columns"
        title="Độ rộng cột & chữ dài"
        description="Mỗi cột một quy tắc độ rộng, để bố cục đoán trước được và không xê dịch khi dữ liệu đổi."
      >
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              <>
                <strong className="font-semibold"><C>width</C> cố định</strong> cho mã, số điện thoại, trạng thái, số tiền và ngày: độ dài đã
                biết, và cột không dịch chuyển khi người dùng sắp xếp.
              </>,
              <>
                <strong className="font-semibold"><C>minWidth</C></strong> cho tên, địa chỉ, email: các cột này chia phần còn lại và xuống
                dòng khi hết chỗ. <C>maxWidth</C> chặn độ rộng khi người dùng kéo.
              </>,
              <>
                Xuống dòng thay vì cắt chữ. Chuỗi trả về từ <C>renderCell</C> bị cắt bằng &quot;…&quot;; trả về phần tử có{" "}
                <C>min-w-0 py-1 wrap-break-word</C> (<C>wrap-anywhere</C> cho email) thì hàng cao lên. Dữ liệu chỉ nằm trong tooltip là dữ
                liệu người dùng cảm ứng và bàn phím không thấy.
              </>,
              <>
                <C>virtualized</C> cần các hàng cao bằng nhau: khi đó giữ ô trên một dòng và cho xem đủ giá trị ở màn hình chi tiết.
              </>,
              "Ô trống hiện “—” kèm chữ cho trình đọc màn hình (“Chưa có”), không để ô trắng.",
              "Tiêu đề cột ngắn, vừa độ rộng cột: tiêu đề bị cắt làm người dùng không biết cột là gì.",
            ]}
          />
          <CodeBlock code={COLUMNS_CODE} />
        </div>
      </DocSection>

      <DocSection id="alignment" title="Số & mã định danh">
        <div className="flex flex-col gap-4">
          <Bullets
            items={[
              <>
                Số, số tiền, số lượng: <C>align: &quot;end&quot;</C> để các chữ số thẳng hàng. DataGrid và Table đã dùng{" "}
                <C>tabular-nums</C>. Định dạng bằng <C>Intl.NumberFormat</C> theo locale (1.275.900.000 ₫ với vi-VN).
              </>,
              "Mã định danh (mã khách hàng, số hoá đơn, số điện thoại): căn đầu dòng, độ rộng cố định, một dòng.",
              "Ngày: dạng ngắn của locale (dd/mm/yyyy với vi-VN) trong cột độ rộng cố định.",
              <>
                Table: <C>TableHeaderCell align=&quot;end&quot;</C> và <C>TableCell align=&quot;end&quot;</C>. Tiêu đề sortable thì nút
                sắp xếp cũng căn theo.
              </>,
            ]}
          />
          <CodeBlock code={TABLE_CODE} />
        </div>
      </DocSection>

      <DocSection
        id="scrolling"
        title="Cuộn ngang & ghim cột"
        description="Khi các cột rộng hơn màn hình, lưới cuộn trong khung của nó. Trang không cuộn ngang."
      >
        <Bullets
          items={[
            "Tiêu đề DataGrid luôn dính trên cùng. Đặt chiều cao cho lưới (height, hoặc class) khi kết quả dài hơn màn hình, để tiêu đề và bố cục trang đứng yên.",
            <>
              Ghim cột định danh chính bằng <C>sticky: &quot;start&quot;</C> ở cột đầu; cột ghim cần <C>width</C>. Có{" "}
              <C>selectionMode</C> thì cột checkbox cũng được ghim.
            </>,
            "Giữ phần ghim dưới khoảng 40% độ rộng lưới. Dưới 640px, ví dụ bỏ ghim cột tên và thu hẹp nó để còn chỗ cuộn.",
            <>
              Bật <C>virtualized</C> khi có hơn vài trăm hàng.
            </>,
            "Table không có tiêu đề dính hay cột ghim. Dùng DataGrid khi kết quả dài hoặc rộng hơn một màn hình.",
          ]}
        />
      </DocSection>

      <DocSection
        id="states"
        title="Tải, rỗng, lỗi"
        description="Cả ba trạng thái hiện trong cùng khung với các hàng, nên trang không nhảy."
      >
        <Bullets
          items={[
            "Chiều cao cố định giữ khung bằng nhau cho hàng, khung xương, trạng thái rỗng và lỗi.",
            <>
              <C>loading</C> hiện khung xương sau 300ms và giữ ít nhất 500ms (Wait UX). Tiêu đề và nút chọn cột vẫn dùng được.
            </>,
            <>
              <C>empty</C> nhận nội dung của bạn: &quot;Không có khách hàng phù hợp&quot; kèm lối ra (Xoá bộ lọc). Khi tải lỗi, truyền
              thông báo lỗi kèm Thử lại vào cùng chỗ đó và <C>items</C> rỗng, thay vì thay cả lưới.
            </>,
            "Giữ cột, sắp xếp và lựa chọn khi tải lại thất bại, để Thử lại đưa người dùng về đúng chỗ cũ.",
          ]}
        />
      </DocSection>

      <DocSection id="viewports" title="Theo độ rộng màn hình">
        <div className="flex flex-col gap-4">
          <SimpleTable
            head={["Độ rộng", "Điều xảy ra", "Hướng dẫn"]}
            rows={[
              [
                "2560px",
                "Các cột mặc định của ví dụ cần 1.588px (1.732px khi có Điện thoại). Trang rộng linh hoạt thì mọi cột vừa; Email và Địa chỉ nhận phần dư.",
                "Trang dữ liệu dùng độ rộng linh hoạt (vite-saas: width \"fluid\"), không dùng max-w-6xl.",
              ],
              [
                "1440px",
                "Có sidebar thì nội dung khoảng 1.150px: lưới cuộn khoảng 440px, cột tên đứng yên.",
                "Ẩn sẵn các cột phụ (resettable đưa chúng về) thay vì thu hẹp mọi cột.",
              ],
              [
                "1024px / 768px",
                "Sidebar thành rail hoặc drawer; lưới cuộn. Từ 768px nút chọn cột vẫn là menu.",
                "Dùng mật độ gọn và nút chọn cột dạng gọn để thanh công cụ nằm trên một dòng.",
              ],
              [
                "390px / 320px",
                "Nút chọn cột mở bottom sheet với hàng 44px. Dưới 640px ví dụ bỏ ghim cột tên.",
                "Trang không cuộn ngang. Màn hình chủ yếu để đọc thì cân nhắc List cho cùng dữ liệu.",
              ],
            ]}
          />
          <CodeBlock code={PICKER_CODE} />
        </div>
      </DocSection>

      <DocSection id="a11y" title="Bàn phím, sắp xếp, chọn hàng">
        <Bullets
          items={[
            "Lưới là một tab stop. Phím mũi tên đi từng ô; Home / End, Ctrl + Home / End và PageUp / PageDown để nhảy. Focus là viền 2px; cột đang focus bị ẩn thì focus sang cột kế bên.",
            <>
              Đặt tên cho mỗi lưới (<C>aria-label</C>) và mỗi nút chọn cột theo bảng của nó, để hai bảng trên một trang không cùng có nút
              &quot;Cột&quot;.
            </>,
            <>
              Sắp xếp: Enter hoặc Space trên tiêu đề cột có <C>compare</C>. Tiêu đề có <C>aria-sort</C>, chiều sắp xếp được đọc cùng tên
              cột; mũi tên không phải tín hiệu duy nhất.
            </>,
            <>
              Chọn hàng: Space chọn hàng đang focus, Shift + mũi tên hoặc Shift + click chọn theo khoảng, Ctrl + A chọn tất cả. Hàng có{" "}
              <C>aria-selected</C>; hiện số hàng đã chọn trong một dòng <C>role=&quot;status&quot;</C>.
            </>,
            "Mỗi ô nhiều nhất một phần tử tương tác. Gom thao tác của hàng vào một nút menu.",
            "Trong nút chọn cột, cột bắt buộc nhận focus và được đọc là “Luôn hiện”; trong bottom sheet, tay nắm đổi thứ tự dùng được bằng Space và phím mũi tên.",
          ]}
        />
      </DocSection>

      <DocSection id="rules" title="Nên & không nên">
        <DoDont
          dos={[
            "Mỗi cột một quy tắc độ rộng: cố định cho mã, số, ngày; tối thiểu cho chữ dài.",
            "Cho tên và địa chỉ dài xuống dòng; giữ mã định danh trên một dòng.",
            "Ghim cột định danh chính và đặt chiều cao cố định cho lưới khi kết quả lớn.",
            "Hiện tải, rỗng và lỗi trong cùng khung, lỗi có nút Thử lại.",
          ]}
          donts={[
            "Đừng để dữ liệu chỉ nằm trong tooltip vì bảng dày đặc.",
            "Đừng thu nhỏ chữ để có hàng gọn: đổi chiều cao hàng.",
            "Đừng để bảng rộng làm trang rộng ra; để lưới tự cuộn.",
            "Trên màn hình hẹp, đừng ghim quá khoảng 40% độ rộng.",
          ]}
        />
      </DocSection>
    </>
  );
}
