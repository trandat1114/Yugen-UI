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
    <Quote author="Hana Sato" authorTitle="Design lead, Sakura Bank" className="max-w-lg">
      Since we moved to Yugen UI, our team ships new screens twice as fast and still meets contrast requirements.
    </Quote>
  );
}
// #endregion

// #region QuoteAppearances
function QuoteAppearances() {
  return (
    <div className="flex max-w-xl flex-col gap-6">
      <Quote author="Fluent 2" source="Color" cite="https://fluent2.microsoft.design/color">
        Neutral colors form the foundation; brand color highlights what matters.
      </Quote>
      <Quote appearance="subtle" size="small" source="Design.md §4.3">
        Don't cover large areas with brand color; don't use brand color for body text.
      </Quote>
      <Quote
        appearance="emphasis"
        author="Alex Chen"
        authorTitle="CTO, Sakura Studio"
        avatar={<Avatar name="Alex Chen" size={40} color="colorful" />}
      >
        A library where dark mode, RTL and screen readers all work right from the start.
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
      aria-label="Search docs"
      placeholder="Search components…"
      suggestions={PAGES}
      value={query}
      onValueChange={setQuery}
      onSelect={(s) => toast({ title: `Open ${s.value}` })}
      onSubmit={(q) => toast({ title: `Search “${q}”` })}
      rootClassName="w-80"
    />
  );
}
// #endregion

// #region AutocompleteGroups
const RECENT: AutocompleteSuggestion[] = [
  { value: "september invoices", group: "Recent searches", icon: <Clock20Regular /> },
  { value: "Maria Garcia", group: "Recent searches", icon: <Clock20Regular /> },
];
const ENTITIES: AutocompleteSuggestion[] = [
  { value: "Maria Garcia", description: "Accountant · Main office", group: "People", icon: <People20Regular /> },
  { value: "Sam Lee", description: "Engineer · Kyoto office", group: "People", icon: <People20Regular /> },
  { value: "Invoice INV-2026-091", description: "$12,400.00 · paid", group: "Documents", icon: <DocumentText20Regular /> },
  { value: "Office lease", description: "Expires Dec 31", group: "Documents", icon: <DocumentText20Regular /> },
  { value: "Q3 report (archived)", description: "Read-only", group: "Documents", icon: <DocumentText20Regular />, disabled: true },
];

function AutocompleteGroups() {
  const [query, setQuery] = useState("");
  return (
    <Autocomplete
      aria-label="Search people or documents"
      placeholder="Search people, documents…"
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
const CITIES = ["Hakodate", "Hamamatsu", "Himeji", "Hiroshima", "Kanazawa", "Kobe", "Kyoto", "Nagoya", "Nara", "Osaka"];

function AutocompleteAsync() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const search = (q: string) => {
    setQuery(q);
    setLoading(true);
    // Fakes a 600ms API call. In a real app, debounce and cancel the previous request.
    window.setTimeout(() => {
      const needle = q.trim().toLowerCase();
      setResults(CITIES.filter((c) => c.toLowerCase().startsWith(needle)));
      setLoading(false);
    }, 600);
  };

  return (
    <Autocomplete
      aria-label="City"
      placeholder="Type a city name…"
      suggestions={results}
      filter={false}
      loading={loading}
      value={query}
      onValueChange={search}
      noResultsText="No cities found"
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
      { name: "noResultsText", type: "ReactNode | null", defaultValue: `"Không có gợi ý phù hợp"`, description: "Khi không có gợi ý khớp; null để đóng danh sách. Tên cũ emptyMessage đã lỗi thời (bỏ ở 1.0)." },
      { name: "maxSuggestions", type: "number", defaultValue: "8", description: "Số gợi ý tối đa." },
      { name: "minChars", type: "number", defaultValue: "1", description: "Số ký tự trước khi mở; 0 = mở khi focus." },
      { name: "highlight", type: "boolean", defaultValue: "true", description: "Tô sáng phần khớp." },
      { name: "listLabel", type: "string", defaultValue: `"Gợi ý tìm kiếm"`, description: "aria-label của danh sách." },
      { name: "value / defaultValue / onValueChange", type: "string / (v: string) => void", description: "Từ khoá (controlled / uncontrolled)." },
    ],
  },
];
