import { useEffect, useState } from "react";
import {
  Badge,
  Button,
  Input,
  Kbd,
  Switch,
  useClipboard,
  useControllableState,
  useDebouncedValue,
  useDisclosure,
  useElementSize,
  useHotkeys,
  useIntersection,
  useLocalStorage,
  useMediaQuery,
} from "@/components/ui";
import type { ComponentDoc } from "../types";
import RAW from "./hooks.tsx?raw";

/*
 * `code` của mỗi ví dụ được cắt từ chính file này (giữa dấu `#region <tên>` và `#endregion`), nên luôn trùng từng
 * ký tự với component mà `render` hiển thị.
 */
const LINES = RAW.replace(/\r\n/g, "\n").split("\n");

function source(name: string) {
  const start = LINES.findIndex((line) => line.trim() === `// #region ${name}`);
  const end = LINES.findIndex((line, i) => i > start && line.trim() === "// #endregion");
  if (start < 0 || end < 0) return `// Không tìm thấy mã nguồn "${name}"`;
  const block = LINES.slice(start + 1, end);
  const indent = Math.min(...block.filter((line) => line.trim()).map((line) => line.length - line.trimStart().length));
  return block
    .map((line) => line.slice(indent))
    .join("\n")
    .trim();
}

// #region ControllableDemo
interface ExpandProps {
  /** Controlled: cha giữ trạng thái. */
  expanded?: boolean;
  /** Uncontrolled: component tự giữ, bắt đầu từ giá trị này. */
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
}

function Expand({ expanded, defaultExpanded = false, onExpandedChange }: ExpandProps) {
  const [isExpanded, setExpanded] = useControllableState({ value: expanded, defaultValue: defaultExpanded, onChange: onExpandedChange });
  return (
    <Button appearance="outline" aria-expanded={isExpanded} onClick={() => setExpanded((prev) => !prev)}>
      {isExpanded ? "Thu gọn" : "Mở rộng"}
    </Button>
  );
}

function ControllableDemo() {
  const [open, setOpen] = useState(true);
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Expand />
      <Expand expanded={open} onExpandedChange={setOpen} />
      <span className="text-caption1 text-foreground-3">Nút thứ hai do cha điều khiển: {open ? "đang mở" : "đang đóng"}</span>
    </div>
  );
}
// #endregion

// #region DisclosureDemo
function DisclosureDemo() {
  const { open, onOpen, onClose, onToggle } = useDisclosure();
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={onOpen}>Mở</Button>
        <Button appearance="outline" onClick={onClose}>
          Đóng
        </Button>
        <Button appearance="subtle" onClick={onToggle}>
          Đảo
        </Button>
      </div>
      <p className="text-body1 text-foreground-2">{open ? "Bảng đang mở." : "Bảng đang đóng."}</p>
    </div>
  );
}
// #endregion

// #region MediaQueryDemo
function MediaQueryDemo() {
  const wide = useMediaQuery("(min-width: 768px)");
  const dark = useMediaQuery("(prefers-color-scheme: dark)");
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <div className="flex flex-wrap items-center gap-3">
      <Badge appearance={wide ? "filled" : "outline"}>{wide ? "Màn rộng ≥ 768px" : "Màn hẹp"}</Badge>
      <Badge appearance={dark ? "filled" : "outline"}>{dark ? "Hệ thống: tối" : "Hệ thống: sáng"}</Badge>
      <Badge appearance={reduce ? "filled" : "outline"}>{reduce ? "Giảm chuyển động" : "Chuyển động đầy đủ"}</Badge>
    </div>
  );
}
// #endregion

// #region LocalStorageDemo
function LocalStorageDemo() {
  const [name, setName, resetName] = useLocalStorage("docs-hooks-name", "");
  const [compact, setCompact] = useLocalStorage("docs-hooks-compact", false);
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <Input aria-label="Tên của bạn" placeholder="Tên của bạn" value={name} onChange={(e) => setName(e.target.value)} />
      <Switch label="Gọn" checked={compact} onCheckedChange={setCompact} />
      <div className="flex flex-wrap items-center gap-3">
        <Button appearance="outline" size="small" onClick={resetName}>
          Xoá tên
        </Button>
        <span className="text-caption1 text-foreground-3">Tải lại trang, hoặc mở tab thứ hai: giá trị theo bạn.</span>
      </div>
    </div>
  );
}
// #endregion

// #region ClipboardDemo
function ClipboardDemo() {
  const { copy, copied } = useClipboard({ timeout: 2000 });
  const token = "yugen_live_4f9a2c71";
  return (
    <div className="flex flex-wrap items-center gap-3">
      <code className="rounded-medium bg-background-3 px-2 py-1 text-body1">{token}</code>
      <Button appearance="outline" onClick={() => copy(token)}>
        {copied ? "Đã chép" : "Chép"}
      </Button>
      <span role="status" className="sr-only">
        {copied ? "Đã chép vào bộ nhớ tạm" : ""}
      </span>
    </div>
  );
}
// #endregion

// #region HotkeysDemo
function HotkeysDemo() {
  const [log, setLog] = useState<string[]>([]);
  const push = (name: string) => setLog((prev) => [name, ...prev].slice(0, 4));
  useHotkeys({
    "mod+k": () => push("⌘/Ctrl + K"),
    "shift+?": () => push("?"),
    start: () => push("← theo chiều chữ (start)"),
    end: () => push("→ theo chiều chữ (end)"),
  });
  return (
    <div className="flex max-w-sm flex-col gap-3">
      <p className="text-body1 text-foreground-2">
        Nhấn <Kbd>Ctrl</Kbd> + <Kbd>K</Kbd>, <Kbd>?</Kbd> hoặc mũi tên. Gõ trong ô dưới: phím thường bị bỏ qua, phím có Ctrl vẫn chạy.
      </p>
      <Input aria-label="Ô thử" placeholder="Gõ ? ở đây — không kích hoạt" />
      <ul className="min-h-24 text-body1 text-foreground-1">
        {log.map((entry, i) => (
          <li key={`${i}-${entry}`}>{entry}</li>
        ))}
      </ul>
    </div>
  );
}
// #endregion

// #region DebouncedDemo
function DebouncedDemo() {
  const [query, setQuery] = useState("");
  const debounced = useDebouncedValue(query, 400);
  const [searches, setSearches] = useState(0);
  useEffect(() => {
    if (debounced) setSearches((n) => n + 1);
  }, [debounced]);
  return (
    <div className="flex max-w-sm flex-col gap-2">
      <Input aria-label="Tìm kiếm" placeholder="Gõ nhanh vài ký tự…" value={query} onChange={(e) => setQuery(e.target.value)} />
      <p className="text-body1 text-foreground-2">Đang gõ: “{query}”</p>
      <p className="text-body1 text-foreground-2">
        Sau 400ms: “{debounced}” — đã “gọi API” {searches} lần
      </p>
    </div>
  );
}
// #endregion

// #region IntersectionDemo
function IntersectionDemo() {
  const { ref, isIntersecting } = useIntersection<HTMLDivElement>({ threshold: 0.6 });
  return (
    <div className="flex flex-col gap-2">
      <Badge appearance={isIntersecting ? "filled" : "outline"}>{isIntersecting ? "Thẻ đang hiện trong khung" : "Thẻ ngoài khung"}</Badge>
      <div className="h-40 overflow-auto rounded-large border border-stroke-2 p-3" tabIndex={0} aria-label="Vùng cuộn thử">
        <div className="h-48 text-caption1 text-foreground-3">Cuộn xuống…</div>
        <div ref={ref} className="rounded-medium bg-brand-background-2 p-4 text-center text-foreground-on-brand">
          Thẻ được theo dõi
        </div>
        <div className="h-48" />
      </div>
    </div>
  );
}
// #endregion

// #region ElementSizeDemo
function ElementSizeDemo() {
  const { ref, width, height } = useElementSize<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className="max-w-full min-w-40 resize overflow-auto rounded-large border border-dashed border-stroke-1 p-4"
      style={{ width: 320, height: 120 }}
    >
      <p className="text-body1 text-foreground-1">
        {Math.round(width)} × {Math.round(height)} px
      </p>
      <p className="text-caption1 text-foreground-3">{width < 280 ? "Bố cục gọn" : "Bố cục đầy đủ"} — kéo góc dưới phải để đổi cỡ.</p>
    </div>
  );
}
// #endregion

export const docs: ComponentDoc[] = [
  {
    slug: "hooks",
    category: "Tiện ích",
    name: "Hooks",
    lead: "Chín hook dùng chung mà chính các component của Yugen UI dùng — trạng thái, màn hình, lưu trữ, phím tắt, đo đạc.",
    description:
      "Thư viện export các hook mà component bên trong dùng, để ứng dụng khỏi chép lại hoặc kéo thêm một thư viện hook thứ hai: useControllableState (mẫu x / defaultX / onXChange), useDisclosure, useMediaQuery, useLocalStorage (an toàn SSR, đồng bộ giữa tab), useClipboard, useHotkeys (bỏ qua ô nhập, mũi tên theo chiều chữ khi RTL), useDebouncedValue, useIntersection và useElementSize. Tất cả an toàn khi render ở server: chưa có window thì trả giá trị khởi đầu và đổi sau khi hydrate.",
    importCode: `import {
  useControllableState,
  useDisclosure,
  useMediaQuery,
  useLocalStorage,
  useClipboard,
  useHotkeys,
  useDebouncedValue,
  useIntersection,
  useElementSize,
} from "@/components/ui";`,
    hero: {
      title: "useControllableState",
      description: "Cùng một component dùng được cả hai kiểu: nút đầu tự giữ trạng thái, nút sau do cha điều khiển qua `expanded` / `onExpandedChange`.",
      code: source("ControllableDemo"),
      render: () => <ControllableDemo />,
    },
    examples: [
      {
        title: "useDisclosure",
        description: "Mở / đóng / đảo cho dialog, menu, panel. Các hàm có identity ổn định nên truyền thẳng vào onClick.",
        code: source("DisclosureDemo"),
        render: () => <DisclosureDemo />,
      },
      {
        title: "useMediaQuery",
        description: "Theo dõi một CSS media query. Đổi cỡ cửa sổ hoặc chế độ sáng / tối của hệ điều hành để thấy đổi ngay, không nháy khi render lại.",
        code: source("MediaQueryDemo"),
        render: () => <MediaQueryDemo />,
      },
      {
        title: "useLocalStorage",
        description:
          "Lưu JSON vào localStorage, đồng bộ giữa các hook cùng khoá và giữa các tab. Server và lần hydrate đầu dùng giá trị ban đầu nên HTML không lệch.",
        code: source("LocalStorageDemo"),
        render: () => <LocalStorageDemo />,
      },
      {
        title: "useClipboard",
        description: "Chép chữ vào bộ nhớ tạm; `copied` tự tắt sau timeout. Đã có sẵn đường lui cho ngữ cảnh không an toàn.",
        code: source("ClipboardDemo"),
        render: () => <ClipboardDemo />,
      },
      {
        title: "useHotkeys",
        description:
          "Khoá là tổ hợp phím, `mod` là ⌘ trên Mac và Ctrl ở nơi khác. Phím thường không chạy khi đang gõ trong ô nhập; `start` / `end` đảo theo RTL.",
        code: source("HotkeysDemo"),
        render: () => <HotkeysDemo />,
      },
      {
        title: "useDebouncedValue",
        description: "Giá trị chỉ đổi khi người dùng ngừng gõ đủ delay — gọi API theo giá trị đã debounce thay vì mỗi phím.",
        code: source("DebouncedDemo"),
        render: () => <DebouncedDemo />,
      },
      {
        title: "useIntersection",
        description: "Biết phần tử có đang trong khung nhìn không. Dùng `once` để tải lười hoặc chạy hiệu ứng đúng một lần.",
        code: source("IntersectionDemo"),
        render: () => <IntersectionDemo />,
      },
      {
        title: "useElementSize",
        description: "Đo phần tử theo ResizeObserver, để đổi bố cục theo chỗ chứa thay vì theo cỡ cửa sổ.",
        code: source("ElementSizeDemo"),
        render: () => <ElementSizeDemo />,
      },
    ],
    dos: [
      "Dùng useControllableState cho mọi component có cặp x / defaultX / onXChange để hành vi controlled và uncontrolled giống nhau.",
      "Dùng useMediaQuery cho logic (đổi component, đổi số cột); dùng breakpoint của Tailwind cho thay đổi thuần giao diện.",
      "Đặt tên khoá useLocalStorage có tiền tố của ứng dụng, và chỉ lưu dữ liệu nhỏ, không nhạy cảm.",
      "Đặt phím tắt toàn cục ở vài chỗ cấp cao; để useHotkeys bỏ qua ô nhập thay vì tự lọc.",
    ],
    donts: [
      "Không đọc giá trị useLocalStorage khi render để quyết định HTML ở server — lần render đầu luôn là giá trị ban đầu.",
      "Không lưu token hay dữ liệu cá nhân vào localStorage.",
      "Không dùng `left` / `right` cho phím tắt điều hướng theo chiều chữ — dùng `start` / `end` để RTL đúng.",
      "Không debounce giá trị mà người dùng cần thấy phản hồi ngay (ô nhập vẫn bind giá trị gốc).",
    ],
    props: [
      {
        name: "useControllableState({ value, defaultValue, onChange })",
        type: "[T, (next: SetStateAction<T>) => void]",
        description: "Hàm set có identity ổn định, bỏ qua khi giá trị không đổi. `value === undefined` nghĩa là uncontrolled.",
      },
      {
        name: "useDisclosure({ open, defaultOpen, onOpenChange })",
        type: "{ open, setOpen, onOpen, onClose, onToggle }",
        defaultValue: "defaultOpen: false",
        description: "Trạng thái mở / đóng, cũng dùng được ở chế độ controlled.",
      },
      {
        name: "useMediaQuery(query, { defaultValue })",
        type: "boolean",
        defaultValue: "false",
        description: "Giá trị khi chưa có window (server, test). Dựa trên useSyncExternalStore nên không nháy.",
      },
      {
        name: "useLocalStorage(key, initialValue)",
        type: "[T, set, remove]",
        description: "`set` nhận giá trị hoặc hàm cập nhật; `remove()` xoá khoá và về giá trị ban đầu. Dữ liệu hỏng hoặc localStorage bị chặn vẫn không gây lỗi.",
      },
      {
        name: "useClipboard({ timeout })",
        type: "{ copy(text): Promise<boolean>, copied, reset }",
        defaultValue: "1600",
        description: "`timeout` (ms) là thời gian giữ `copied = true`.",
      },
      {
        name: "useHotkeys(hotkeys, options)",
        type: "void",
        description:
          "options: target (mặc định document), enabled (true), enableOnFormTags (false), preventDefault (true). Khoá hợp lệ: mod / ctrl / meta / alt / shift + phím, cùng alias esc, space, up, down, left, right, start, end.",
      },
      {
        name: "useDebouncedValue(value, delay)",
        type: "T",
        defaultValue: "300",
        description: "Trả giá trị ngay lần đầu; sau đó chỉ đổi khi `value` đứng yên `delay` ms.",
      },
      {
        name: "useIntersection({ root, rootMargin, threshold, once })",
        type: "{ ref, isIntersecting, entry }",
        description: "Gắn `ref` vào phần tử. Không có IntersectionObserver thì luôn false.",
      },
      {
        name: "useElementSize({ box })",
        type: "{ ref, width, height }",
        defaultValue: `"content-box"`,
        description: "Chưa đo được (server, lần render đầu) thì là 0 × 0. Dùng được cả với chữ viết dọc.",
      },
    ],
  },
];
