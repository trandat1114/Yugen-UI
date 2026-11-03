import * as React from "react";
import { Code16Regular, Eye16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useIsomorphicLayoutEffect } from "@/components/ui/_internal/useIsomorphicLayoutEffect";
import { PageHeader } from "../blocks";
import { CodeBlock, CopyButton } from "../CodeBlock";
import { useLocale } from "../i18n";

export interface BlockMeta {
  title: string;
  description: string;
  /** Thứ tự hiển thị (nhỏ trước). */
  order: number;
  /** Block rộng (nhiều thẻ con): chiếm 2 cột khi lưới có từ 2 cột. */
  wide?: boolean;
}

type BlockModule = { default: React.ComponentType; meta: BlockMeta };

// Tên và mô tả tiếng Việt theo file (trang /vi/). Block viết bằng tiếng Anh: `meta` trong file là bản tiếng Anh.
export const META_VI: Record<string, Pick<BlockMeta, "title" | "description">> = {
  "01-login": { title: "Đăng nhập", description: "Form đăng nhập với email, mật khẩu và SSO" },
  "02-stats": { title: "Thống kê", description: "Thẻ KPI kèm xu hướng và biểu đồ cột mini" },
  "03-payout": { title: "Ngưỡng thanh toán", description: "Cấu hình số tiền tối thiểu với Slider và ghi chú" },
  "04-team": { title: "Thành viên nhóm", description: "Mời thành viên và phân quyền bằng Menu" },
  "05-preferences": { title: "Tuỳ chọn", description: "Cài đặt tài khoản với Select, Switch và Toast" },
  "06-transactions": { title: "Giao dịch gần đây", description: "Danh sách List với icon, mô tả và số tiền" },
  "07-savings": { title: "Mục tiêu tiết kiệm", description: "Theo dõi tiến độ bằng ProgressBar" },
  "08-booking": { title: "Đặt lịch hẹn", description: "Calendar kết hợp ToggleGroup chọn khung giờ" },
  "09-feedback": { title: "Gửi phản hồi", description: "Form với RadioGroup, Textarea và validation" },
  "10-empty-inbox": { title: "Hộp thư trống", description: "Tabs lọc kèm trạng thái Empty có hành động" },
  "11-analytics": { title: "Bảng phân tích", description: "KPI, xu hướng, xếp hạng và tỉ trọng — một bộ lọc thời gian cho mọi thẻ" },
  "12-ai-assistant": { title: "Trợ lý AI", description: "MessageScroller, ChatComposer và Trace hiển thị từng bước agent đang làm" },
  "13-newsletter": { title: "Đăng ký bản tin", description: "Field gắn nhãn và gợi ý cho ô email, Switch và toast xác nhận" },
  "14-quantity": { title: "Chọn số lượng", description: "ButtonGroup tăng / giảm có nhãn, giới hạn min / max và aria-live" },
  "15-welcome-dialog": { title: "Hộp thoại chào mừng", description: "Dialog giữ focus bên trong, đóng bằng Esc và trả focus về nút mở" },
  "16-project-progress": { title: "Tiến độ dự án", description: "Slider điều khiển ProgressBar; màu success khi hoàn thành" },
  "17-online-team": { title: "Đang trực tuyến", description: "Persona có trạng thái hiện diện và AvatarGroup gọn khi đông người" },
};

const fileOf = (path: string) => path.replace(/^.*\/(.+)\.tsx$/, "$1");

// Component thật + mã nguồn thô của CHÍNH file đó → code copy luôn khớp với preview.
const modules = import.meta.glob<BlockModule>("../block-library/*.tsx", { eager: true });
const sources = import.meta.glob<string>("../block-library/*.tsx", { eager: true, query: "?raw", import: "default" });

const BLOCKS = Object.entries(modules)
  .map(([path, mod]) => ({ path, meta: mod.meta, Component: mod.default, source: sources[path] ?? "" }))
  .filter((b) => b.meta)
  .sort((a, b) => a.meta.order - b.meta.order);

function BlockCard({ path, meta, Component, source }: (typeof BLOCKS)[number]) {
  const [mode, setMode] = React.useState<"preview" | "code">("preview");
  const { locale } = useLocale();
  const vi = locale === "vi" ? META_VI[fileOf(path)] : undefined;
  const { title, description } = vi ?? meta;

  return (
    <article
      className={cn(
        "flex min-w-0 flex-col self-start overflow-hidden rounded-3xlarge border border-stroke-2 bg-background-1 shadow-2 [contain-intrinsic-size:auto_none_auto_28rem] [content-visibility:auto]",
        meta.wide && "lg:col-span-2",
      )}
    >
      <header className="flex items-center justify-between gap-3 border-b border-stroke-2 px-4 py-2">
        <div className="min-w-0">
          <h2 className="truncate text-subtitle2 font-semibold">{title}</h2>
          <p className="truncate text-caption1 text-foreground-3">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <div className="inline-flex rounded-medium bg-background-3 p-0.5" role="tablist" aria-label={locale === "en" ? "View" : "Chế độ xem"}>
            {(["preview", "code"] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={mode === m}
                onClick={() => setMode(m)}
                aria-label={m === "preview" ? "Preview" : "Code"}
                title={m === "preview" ? "Preview" : "Code"}
                className={cn(
                  "inline-flex size-6 items-center justify-center rounded-small transition-colors duration-faster",
                  mode === m ? "bg-background-1 text-foreground-1 shadow-2" : "text-foreground-3 hover:text-foreground-1",
                )}
              >
                {m === "preview" ? <Eye16Regular /> : <Code16Regular />}
              </button>
            ))}
          </div>
          <CopyButton text={source} />
        </div>
      </header>
      {mode === "preview" ? (
        <div lang={locale === "en" ? undefined : "en"} className="flex justify-center bg-background-3 p-5">
          <div className="w-full">
            <Component />
          </div>
        </div>
      ) : (
        <CodeBlock code={source} bare className="max-h-140 overflow-auto" />
      )}
    </article>
  );
}

/** Bước lưới của chế độ masonry (px): mỗi block chiếm số hàng vừa chiều cao của nó. */
const ROW = 4;
const GAP = 20;

/**
 * Masonry bằng CSS grid: đo chiều cao từng block (ResizeObserver) rồi đặt `grid-row-end: span n`, auto-placement xếp
 * block kế tiếp vào chỗ trống cao nhất — thứ tự đọc vẫn theo hàng. Trước khi đo (prerender) là lưới thường.
 * Block ngoài màn hình có `content-visibility: auto` (#308): đo ra chỗ giữ chỗ 28rem, rồi ResizeObserver đặt lại span khi
 * trình duyệt vẽ thật (trước khi block vào khung nhìn, nên không thấy nhảy).
 */
function useMasonry(ref: React.RefObject<HTMLDivElement | null>) {
  useIsomorphicLayoutEffect(() => {
    const grid = ref.current;
    if (!grid || typeof ResizeObserver === "undefined") return;
    const items = [...grid.children] as HTMLElement[];
    const place = (item: HTMLElement) => {
      item.style.gridRowEnd = `span ${Math.ceil((item.getBoundingClientRect().height + GAP) / ROW)}`;
    };
    items.forEach(place);
    grid.dataset.masonry = "";
    const observer = new ResizeObserver((entries) => entries.forEach((e) => place(e.target as HTMLElement)));
    items.forEach((item) => observer.observe(item));
    return () => {
      observer.disconnect();
      delete grid.dataset.masonry;
      items.forEach((item) => item.style.removeProperty("grid-row-end"));
    };
  }, [ref]);
}

export function BlocksPage() {
  const { locale } = useLocale();
  const en = locale === "en";
  const gridRef = React.useRef<HTMLDivElement>(null);
  useMasonry(gridRef);
  return (
    <div className="pb-8">
      <PageHeader
        eyebrow="Blocks"
        title="Blocks"
        lead={
          en
            ? "Ready-made UI sections built from Yugen UI components: sign-in, settings, stats, lists. Copy a whole block into your project, then change the content."
            : "Các cụm giao diện ghép sẵn từ component của Yugen UI — đăng nhập, cài đặt, thống kê, danh sách… Copy nguyên khối vào dự án rồi chỉnh nội dung."
        }
      >
        {en ? (
          <>
            Each block is one file in <code className="font-mono text-caption1">src/docs/block-library/</code>. The Code tab shows that
            file&apos;s source.
          </>
        ) : (
          <>
            Mỗi block là một file trong <code className="font-mono text-caption1">src/docs/block-library/</code>. Tab “Code” hiển thị đúng
            mã nguồn của file đó.
          </>
        )}
      </PageHeader>
      <div
        ref={gridRef}
        className="grid grid-flow-row-dense gap-5 lg:grid-cols-2 2xl:grid-cols-3 data-masonry:auto-rows-1 data-masonry:gap-y-0"
      >
        {BLOCKS.map((b) => (
          <BlockCard key={b.path} {...b} />
        ))}
      </div>
    </div>
  );
}
