import { useState } from "react";
import { Clock20Regular, DocumentText20Regular, People20Regular } from "@fluentui/react-icons";
import { Autocomplete, Avatar, Quote, toast, type AutocompleteSuggestion } from "@/components/ui";
import type { ComponentDoc } from "../types";
import RAW from "./content-search.tsx?raw";

/* `code` của ví dụ được cắt từ chính file này (giữa `// #region <tên>` và `// #endregion`). */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");
function source(...names: string[]) {
  return names
    .map((name) => {
      const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
      const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
      return start < 0 || end < 0 ? `// Không tìm thấy "${name}"` : LINES.slice(start + 1, end).join("\n").trim();
    })
    .join("\n\n");
}

// #region QuoteHero
function QuoteHero() {
  return (
    <Quote author="Lê Thu Hà" authorTitle="Trưởng nhóm thiết kế, Sakura Bank" className="max-w-lg">
      Từ khi chuyển sang Yugen UI, đội mình ra mắt màn hình mới nhanh gấp đôi mà vẫn đạt chuẩn tương phản.
    </Quote>
  );
}
// #endregion

// #region QuoteAppearances
function QuoteAppearances() {
  return (
    <div className="flex max-w-xl flex-col gap-XXL">
      <Quote author="Fluent 2" source="Color" cite="https://fluent2.microsoft.design/color">
        Neutral colors form the foundation; brand color highlights what matters.
      </Quote>
      <Quote appearance="subtle" size="small" source="Design.md §4.3">
        Không phủ brand lên diện tích lớn; không dùng brand cho chữ thân bài.
      </Quote>
      <Quote
        appearance="emphasis"
        author="Nguyễn Minh Khoa"
        authorTitle="CTO, Hoa Đào Studio"
        avatar={<Avatar name="Nguyễn Minh Khoa" size={40} color="colorful" />}
      >
        Một thư viện mà dark mode, RTL và trình đọc màn hình đều chạy đúng ngay từ đầu.
      </Quote>
    </div>
  );
}
// #endregion

// #region AutocompleteHero
const PAGES = ["Button", "Combobox", "DataGrid", "DatePicker", "Dialog", "Drawer", "Sheet", "Tabs", "Theme Designer", "Toast"];

function AutocompleteHero() {
  const [query, setQuery] = useState("");
  return (
    <Autocomplete
      aria-label="Tìm trong docs"
      placeholder="Tìm component…"
      suggestions={PAGES}
      value={query}
      onValueChange={setQuery}
      onSelect={(s) => toast({ title: `Mở trang ${s.value}` })}
      onSubmit={(q) => toast({ title: `Tìm “${q}”` })}
      rootClassName="w-80"
    />
  );
}
// #endregion

// #region AutocompleteGroups
const RECENT: AutocompleteSuggestion[] = [
  { value: "hoá đơn tháng 9", group: "Tìm gần đây", icon: <Clock20Regular /> },
  { value: "Trần Thị Bình", group: "Tìm gần đây", icon: <Clock20Regular /> },
];
const ENTITIES: AutocompleteSuggestion[] = [
  { value: "Trần Thị Bình", description: "Kế toán · Hà Nội", group: "Người", icon: <People20Regular /> },
  { value: "Lê Hoàng Cường", description: "Kỹ sư · Đà Nẵng", group: "Người", icon: <People20Regular /> },
  { value: "Hoá đơn #2026-091", description: "12.400.000 ₫ · đã thanh toán", group: "Tài liệu", icon: <DocumentText20Regular /> },
  { value: "Hợp đồng thuê văn phòng", description: "Hết hạn 31/12", group: "Tài liệu", icon: <DocumentText20Regular /> },
  { value: "Báo cáo quý 3 (lưu trữ)", description: "Chỉ đọc", group: "Tài liệu", icon: <DocumentText20Regular />, disabled: true },
];

function AutocompleteGroups() {
  const [query, setQuery] = useState("");
  return (
    <Autocomplete
      aria-label="Tìm người hoặc tài liệu"
      placeholder="Tìm người, tài liệu…"
      minChars={0}
      suggestions={query.trim() ? ENTITIES : RECENT}
      value={query}
      onValueChange={setQuery}
      rootClassName="w-80"
    />
  );
}
// #endregion

// #region AutocompleteAsync
const CITIES = ["Hà Nội", "Hải Phòng", "Huế", "Hội An", "Hạ Long", "Hà Giang", "Hồ Chí Minh", "Cần Thơ", "Đà Lạt", "Đà Nẵng"];

function AutocompleteAsync() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const search = (q: string) => {
    setQuery(q);
    setLoading(true);
    // Giả lập gọi API 600ms — thực tế nên debounce và huỷ request cũ.
    window.setTimeout(() => {
      const needle = q.trim().toLowerCase();
      setResults(CITIES.filter((c) => c.toLowerCase().startsWith(needle)));
      setLoading(false);
    }, 600);
  };

  return (
    <Autocomplete
      aria-label="Thành phố"
      placeholder="Gõ tên thành phố (có dấu)…"
      suggestions={results}
      filter={false}
      loading={loading}
      value={query}
      onValueChange={search}
      emptyMessage="Không tìm thấy thành phố"
      rootClassName="w-80"
    />
  );
}
// #endregion

export const docs: ComponentDoc[] = [
  {
    slug: "quote",
    name: "Quote",
    category: "Hiển thị dữ liệu",
    lead: "Quote hiển thị trích dẫn có ghi nguồn — lời chứng thực, trích tài liệu, câu nói trong bài viết.",
    description:
      "Ngữ nghĩa chuẩn: <figure> chứa <blockquote cite> và <figcaption> (tác giả, <cite> nguồn) nên trình đọc màn hình biết đây là trích dẫn và ai nói. Ba kiểu: default (vạch brand ở đầu dòng), subtle (vạch neutral, trong thân bài) và emphasis (chữ lớn kèm dấu ngoặc cho testimonial). Vạch nhấn dùng border-s nên tự đổi bên khi RTL.",
    importCode: `import { Quote } from "@/components/ui";`,
    hero: { title: "Quote", code: source("QuoteHero"), render: () => <QuoteHero /> },
    examples: [
      {
        title: "Appearance & nguồn",
        description: "default có link nguồn (cite), subtle size small, emphasis kèm avatar.",
        code: source("QuoteAppearances"),
        render: () => <QuoteAppearances />,
      },
    ],
    dos: [
      "Ghi rõ tác giả hoặc nguồn — trích dẫn không nguồn khó tin cậy.",
      "Dùng emphasis cho testimonial ở trang giới thiệu; default / subtle trong bài viết.",
      "Truyền URL vào cite khi trích từ tài liệu trên web.",
    ],
    donts: [
      "Không dùng Quote chỉ để thụt lề hay làm nổi bật đoạn văn — dùng MessageBar hoặc Card.",
      "Không đặt nhiều Quote emphasis cạnh nhau trong một khung nhìn.",
    ],
    props: [
      { name: "children", type: "ReactNode", description: "Nội dung trích dẫn; chuỗi được bọc trong <p>." },
      { name: "author", type: "ReactNode", description: "Người nói / tác giả." },
      { name: "authorTitle", type: "ReactNode", description: "Chức danh, tổ chức." },
      { name: "source", type: "ReactNode", description: "Tên nguồn, hiển thị trong <cite>." },
      { name: "cite", type: "string", description: "URL nguồn — gắn vào blockquote và biến source thành link." },
      { name: "avatar", type: "ReactNode", description: "Avatar của tác giả." },
      { name: "appearance", type: `"default" | "subtle" | "emphasis"`, defaultValue: `"default"`, description: "Kiểu hiển thị." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"medium"`, description: "Cỡ chữ trích dẫn." },
    ],
  },
  {
    slug: "autocomplete",
    name: "Autocomplete",
    category: "Nhập liệu",
    lead: "Autocomplete là ô tìm kiếm có gợi ý: gõ để lọc, chọn gợi ý để điền nhanh, hoặc Enter để tìm với nguyên từ khoá.",
    description:
      "Khác Combobox (chọn một giá trị trong danh sách cố định), giá trị của Autocomplete là từ khoá tự do — gợi ý chỉ giúp điền nhanh. Lọc không dấu (gõ “xoai” ra “Xoài”), tô sáng phần khớp, nhóm gợi ý (Tìm gần đây, Người, Tài liệu…), trạng thái đang tải theo Wait UX và thông báo số gợi ý cho trình đọc màn hình. Bàn phím: ↓/↑ chọn gợi ý, Enter chọn hoặc tìm, Esc đóng danh sách (nhấn lần nữa để xoá ô).",
    importCode: `import { Autocomplete } from "@/components/ui";`,
    hero: { title: "Autocomplete", code: source("AutocompleteHero"), render: () => <AutocompleteHero /> },
    examples: [
      {
        title: "Nhóm, icon & tìm gần đây",
        description: "minChars={0} mở danh sách “Tìm gần đây” ngay khi focus; gợi ý có thể bị disabled.",
        code: source("AutocompleteGroups"),
        render: () => <AutocompleteGroups />,
      },
      {
        title: "Gợi ý từ server",
        description: "filter={false} khi server đã lọc; loading hiện spinner nếu chờ quá 300ms.",
        code: source("AutocompleteAsync"),
        render: () => <AutocompleteAsync />,
      },
    ],
    dos: [
      "Dùng cho ô tìm kiếm có gợi ý; dùng Combobox khi người dùng phải chọn đúng một giá trị.",
      "Giới hạn số gợi ý (maxSuggestions) và nhóm chúng khi có nhiều loại kết quả.",
      "Debounce và huỷ request cũ khi gọi API.",
    ],
    donts: [
      "Không tự điền gợi ý đầu tiên vào ô khi người dùng đang gõ.",
      "Không ẩn hành động Enter — người dùng phải tìm được với nguyên từ khoá.",
    ],
    props: [
      { name: "suggestions", type: "(string | AutocompleteSuggestion)[]", description: "Gợi ý: value, label, description, icon, group, disabled." },
      { name: "filter", type: "boolean | (s, query) => boolean", defaultValue: "true", description: "Lọc không dấu; false khi server đã lọc." },
      { name: "onSelect", type: "(s: AutocompleteSuggestion) => void", description: "Chọn một gợi ý." },
      { name: "onSubmit", type: "(query: string) => void", description: "Enter khi không có gợi ý đang chọn." },
      { name: "loading", type: "boolean", defaultValue: "false", description: "Đang tải gợi ý; spinner hiện sau 300ms." },
      { name: "emptyMessage", type: "ReactNode | null", defaultValue: `"Không có gợi ý phù hợp"`, description: "Khi không có gợi ý khớp; null để đóng danh sách." },
      { name: "maxSuggestions", type: "number", defaultValue: "8", description: "Số gợi ý tối đa." },
      { name: "minChars", type: "number", defaultValue: "1", description: "Số ký tự trước khi mở; 0 = mở khi focus." },
      { name: "highlight", type: "boolean", defaultValue: "true", description: "Tô sáng phần khớp." },
      { name: "listLabel", type: "string", defaultValue: `"Gợi ý tìm kiếm"`, description: "aria-label của danh sách." },
      { name: "value / defaultValue / onValueChange", type: "string / (v: string) => void", description: "Từ khoá (controlled / uncontrolled)." },
    ],
  },
];
