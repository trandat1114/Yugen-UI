import { useState } from "react";
import {
  ArrowDownload20Regular,
  ArrowUp20Regular,
  Clock20Regular,
  Dismiss24Regular,
  Filter20Regular,
  Location20Regular,
  MoreHorizontal20Regular,
  MusicNote220Regular,
  Next20Regular,
  Pause20Regular,
  Play24Filled,
  Previous20Regular,
  Share20Regular,
  Star20Filled,
} from "@fluentui/react-icons";
import { Button } from "@/components/ui/Button/Button";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { AspectRatio } from "@/components/ui/Image/Image";
import { BloomArt } from "@/components/ui/Decorative/Decorative";
import {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/Sheet/Sheet";
import { useMediaQuery } from "@/components/ui/Sheet/useMediaQuery";
import type { ComponentDoc } from "../types";

/* ================================================================== Dữ liệu mẫu */

const amenities = [
  "Mở cửa 5:00 – 23:00, miễn phí vé vào",
  "Khoảng 800 cây anh đào Somei Yoshino",
  "Hoa nở rộ cuối tháng 3 – đầu tháng 4",
  "Đèn chiếu sáng hanami buổi tối",
  "Ga gần nhất: Ueno (JR), cửa Công viên",
  "Có nhà vệ sinh và quầy đồ ăn theo mùa",
  "Cấm trải bạt sau 20:00",
  "Lối đi bằng phẳng, thuận tiện xe lăn",
];

const team = [
  { name: "Nguyễn An", initials: "NA", tone: "bg-cranberry-bg text-cranberry-fg" },
  { name: "Trần Bình", initials: "TB", tone: "bg-marigold-bg text-marigold-fg" },
  { name: "Lê Cường", initials: "LC", tone: "bg-teal-bg text-teal-fg" },
  { name: "Phạm Dũng", initials: "PD", tone: "bg-lavender-bg text-lavender-fg" },
  { name: "Hoàng Hà", initials: "HH", tone: "bg-forest-bg text-forest-fg" },
  { name: "Vũ Khánh", initials: "VK", tone: "bg-steel-bg text-steel-fg" },
  { name: "Đặng Linh", initials: "ĐL", tone: "bg-cranberry-bg text-cranberry-fg" },
  { name: "Bùi Nam", initials: "BN", tone: "bg-teal-bg text-teal-fg" },
];

const stories = [
  { title: "Ueno", tone: "bg-gradient-sakura" },
  { title: "Kyoto", tone: "bg-gradient-sunset" },
  { title: "Hokkaido", tone: "bg-gradient-dusk" },
];

/* ================================================================== Demo có state */

function FilterSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen} snapPoints={[0.6, 0.92]}>
      <SheetTrigger asChild>
        <Button icon={<Filter20Regular />}>Bộ lọc</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader
          action={
            <SheetClose asChild>
              <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
            </SheetClose>
          }
        >
          <SheetTitle>Bộ lọc</SheetTitle>
          <SheetDescription>Panel bên phải trên màn hình rộng, bottom sheet kéo được trên điện thoại.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="flex flex-col gap-3">
            <Checkbox label="Còn hàng" defaultChecked />
            <Checkbox label="Giao trong 2 giờ" />
            <Checkbox label="Miễn phí vận chuyển" defaultChecked />
            <Checkbox label="Đánh giá từ 4 sao" />
          </div>
        </SheetBody>
        <SheetFooter>
          <Button appearance="primary" onClick={() => setOpen(false)}>
            Áp dụng
          </Button>
          <SheetClose asChild>
            <Button>Huỷ</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function PlaceSheetDemo() {
  const [snap, setSnap] = useState(0.45);
  return (
    <Sheet mode="bottom" snapPoints={[0.45, 0.9]} snapPoint={snap} onSnapPointChange={setSnap}>
      <SheetTrigger asChild>
        <Button icon={<Location20Regular />}>Xem địa điểm</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Công viên Ueno</SheetTitle>
          <SheetDescription>
            Đang ở nấc {Math.round(snap * 100)}% — kéo tay nắm, vuốt nhanh hoặc nhấn tay nắm để đổi nấc.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="flex flex-col gap-2">
            {amenities.map((item) => (
              <li key={item} className="rounded-medium bg-background-2 px-3 py-2 text-foreground-2">
                {item}
              </li>
            ))}
          </ul>
        </SheetBody>
        <SheetFooter>
          <Button appearance="primary" icon={<Location20Regular />}>
            Chỉ đường
          </Button>
          <Button icon={<Share20Regular />}>Chia sẻ</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function MediaQueryDemo() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const rows = [
    { query: "(min-width: 768px)", matches: isDesktop },
    { query: "(prefers-color-scheme: dark)", matches: prefersDark },
    { query: "(prefers-reduced-motion: reduce)", matches: reduceMotion },
    { query: "(pointer: coarse)", matches: coarsePointer },
  ];
  return (
    <ul className="flex w-full max-w-md flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.query}
          className="flex items-center justify-between gap-3 rounded-medium border border-stroke-2 bg-background-1 px-3 py-2"
        >
          <code dir="ltr" className="font-mono text-caption1 text-foreground-2">
            {row.query}
          </code>
          <span className={row.matches ? "text-caption1 font-semibold text-success-foreground-1" : "text-caption1 text-foreground-3"}>
            {row.matches ? "Khớp" : "Không khớp"}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ResponsiveActionsDemo() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? (
    <div className="flex gap-2">
      <Button icon={<Share20Regular />}>Chia sẻ</Button>
      <Button icon={<ArrowDownload20Regular />}>Tải xuống</Button>
    </div>
  ) : (
    <Button icon={<MoreHorizontal20Regular />} aria-label="Thao tác khác" />
  );
}

function ScrollTopDemo() {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <Button
      icon={<ArrowUp20Regular />}
      onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
    >
      {reduceMotion ? "Lên đầu trang (tức thì)" : "Lên đầu trang (cuộn mượt)"}
    </Button>
  );
}

/* ================================================================== Docs */

const LABS_ADAPTIVE: Record<string, ComponentDoc> = {
  /* ---------------------------------------------------------------- Sheet */
  sheet: {
    slug: "sheet",
    name: "Sheet",
    category: "Yugen Labs",
    lead: "Sheet là một overlay thích ứng: panel trượt từ cạnh trên màn hình rộng, bottom sheet kéo được trên điện thoại — cùng một API, cùng một nội dung.",
    description:
      "Dựng trên Radix Dialog nên có sẵn bẫy focus, Esc, khoá cuộn và vai trò dialog. Dưới breakpoint (mặc định 768px) Sheet thành bottom sheet bo góc trên 16px: kéo bằng tay nắm hoặc tiêu đề, dừng ở các snapPoints (phần của chiều cao màn hình), vuốt nhanh để nhảy nấc, vuốt xuống để đóng. Nội dung chỉ cuộn khi ở nấc cao nhất; footer luôn bám đáy màn hình và chừa vùng an toàn. Trên màn hình rộng là panel start / end (tự đảo ở RTL) với ba độ rộng như Drawer. Giảm chuyển động: mọi trượt / đàn hồi thành tức thì.",
    importCode: `import {
  Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription,
  SheetBody, SheetFooter, SheetClose,
} from "@/components/ui";`,
    hero: {
      title: "Sheet thích ứng",
      code: `function FilterSheetDemo() {
  const [open, setOpen] = useState(false);
  return (
    <Sheet open={open} onOpenChange={setOpen} snapPoints={[0.6, 0.92]}>
      <SheetTrigger asChild>
        <Button icon={<Filter20Regular />}>Bộ lọc</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader
          action={
            <SheetClose asChild>
              <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
            </SheetClose>
          }
        >
          <SheetTitle>Bộ lọc</SheetTitle>
          <SheetDescription>Panel bên phải trên màn hình rộng, bottom sheet kéo được trên điện thoại.</SheetDescription>
        </SheetHeader>
        <SheetBody>
          <div className="flex flex-col gap-3">
            <Checkbox label="Còn hàng" defaultChecked />
            <Checkbox label="Giao trong 2 giờ" />
            <Checkbox label="Miễn phí vận chuyển" defaultChecked />
            <Checkbox label="Đánh giá từ 4 sao" />
          </div>
        </SheetBody>
        <SheetFooter>
          <Button appearance="primary" onClick={() => setOpen(false)}>
            Áp dụng
          </Button>
          <SheetClose asChild>
            <Button>Huỷ</Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}`,
      render: () => <FilterSheetDemo />,
    },
    examples: [
      {
        title: "Bottom sheet & snap point",
        description:
          "mode=\"bottom\" ép dạng bottom sheet (thử được bằng chuột trên desktop). snapPoints [0.45, 0.9]; nội dung chỉ cuộn ở nấc 90%.",
        code: `const amenities = ["Mở cửa 5:00 – 23:00, miễn phí vé vào", "Khoảng 800 cây anh đào Somei Yoshino" /* … */];

function PlaceSheetDemo() {
  const [snap, setSnap] = useState(0.45);
  return (
    <Sheet mode="bottom" snapPoints={[0.45, 0.9]} snapPoint={snap} onSnapPointChange={setSnap}>
      <SheetTrigger asChild>
        <Button icon={<Location20Regular />}>Xem địa điểm</Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Công viên Ueno</SheetTitle>
          <SheetDescription>
            Đang ở nấc {Math.round(snap * 100)}% — kéo tay nắm, vuốt nhanh hoặc nhấn tay nắm để đổi nấc.
          </SheetDescription>
        </SheetHeader>
        <SheetBody>
          <ul className="flex flex-col gap-2">
            {amenities.map((item) => (
              <li key={item} className="rounded-medium bg-background-2 px-3 py-2 text-foreground-2">
                {item}
              </li>
            ))}
          </ul>
        </SheetBody>
        <SheetFooter>
          <Button appearance="primary" icon={<Location20Regular />}>
            Chỉ đường
          </Button>
          <Button icon={<Share20Regular />}>Chia sẻ</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}`,
        render: () => <PlaceSheetDemo />,
      },
      {
        title: "Không modal",
        description: "modal={false}: không lớp phủ, không bẫy focus — trang phía sau vẫn dùng được. Một nấc 30%, vuốt xuống để đóng.",
        code: `<Sheet mode="bottom" modal={false} snapPoints={[0.3]}>
  <SheetTrigger asChild>
    <Button icon={<MusicNote220Regular />}>Mở trình phát</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader
      action={
        <SheetClose asChild>
          <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
        </SheetClose>
      }
    >
      <SheetTitle>Đang phát</SheetTitle>
      <SheetDescription>Sakura Sakura — Nhạc dân gian Nhật Bản</SheetDescription>
    </SheetHeader>
    <SheetBody>
      <div className="flex items-center justify-center gap-2">
        <Button appearance="subtle" shape="circular" icon={<Previous20Regular />} aria-label="Bài trước" />
        <Button appearance="primary" shape="circular" size="large" icon={<Pause20Regular />} aria-label="Tạm dừng" />
        <Button appearance="subtle" shape="circular" icon={<Next20Regular />} aria-label="Bài tiếp" />
      </div>
    </SheetBody>
  </SheetContent>
</Sheet>`,
        render: () => (
          <Sheet mode="bottom" modal={false} snapPoints={[0.3]}>
            <SheetTrigger asChild>
              <Button icon={<MusicNote220Regular />}>Mở trình phát</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader
                action={
                  <SheetClose asChild>
                    <Button appearance="subtle" icon={<Dismiss24Regular />} aria-label="Đóng" />
                  </SheetClose>
                }
              >
                <SheetTitle>Đang phát</SheetTitle>
                <SheetDescription>Sakura Sakura — Nhạc dân gian Nhật Bản</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <div className="flex items-center justify-center gap-2">
                  <Button appearance="subtle" shape="circular" icon={<Previous20Regular />} aria-label="Bài trước" />
                  <Button appearance="primary" shape="circular" size="large" icon={<Pause20Regular />} aria-label="Tạm dừng" />
                  <Button appearance="subtle" shape="circular" icon={<Next20Regular />} aria-label="Bài tiếp" />
                </div>
              </SheetBody>
            </SheetContent>
          </Sheet>
        ),
      },
      {
        title: "Panel đầu dòng, bắt buộc chọn",
        description:
          "side=\"start\" size=\"medium\" trên desktop; dismissible={false} chặn Esc, bấm lớp phủ và vuốt xuống — người dùng phải chọn một hành động.",
        code: `<Sheet side="start" size="medium" dismissible={false}>
  <SheetTrigger asChild>
    <Button>Điều khoản mới</Button>
  </SheetTrigger>
  <SheetContent>
    <SheetHeader>
      <SheetTitle>Cập nhật điều khoản sử dụng</SheetTitle>
      <SheetDescription>Có hiệu lực từ ngày 1/11. Vui lòng xem và xác nhận.</SheetDescription>
    </SheetHeader>
    <SheetBody>
      <p className="text-foreground-2">
        Chúng tôi làm rõ cách lưu trữ dữ liệu sao lưu và bổ sung quyền xuất toàn bộ dữ liệu cá nhân của bạn.
      </p>
    </SheetBody>
    <SheetFooter>
      <SheetClose asChild>
        <Button appearance="primary">Đồng ý</Button>
      </SheetClose>
      <SheetClose asChild>
        <Button>Để sau</Button>
      </SheetClose>
    </SheetFooter>
  </SheetContent>
</Sheet>`,
        render: () => (
          <Sheet side="start" size="medium" dismissible={false}>
            <SheetTrigger asChild>
              <Button>Điều khoản mới</Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Cập nhật điều khoản sử dụng</SheetTitle>
                <SheetDescription>Có hiệu lực từ ngày 1/11. Vui lòng xem và xác nhận.</SheetDescription>
              </SheetHeader>
              <SheetBody>
                <p className="text-foreground-2">
                  Chúng tôi làm rõ cách lưu trữ dữ liệu sao lưu và bổ sung quyền xuất toàn bộ dữ liệu cá nhân của bạn.
                </p>
              </SheetBody>
              <SheetFooter>
                <SheetClose asChild>
                  <Button appearance="primary">Đồng ý</Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button>Để sau</Button>
                </SheetClose>
              </SheetFooter>
            </SheetContent>
          </Sheet>
        ),
      },
    ],
    dos: [
      "Luôn có SheetTitle; thêm SheetDescription khi tiêu đề chưa đủ ngữ cảnh.",
      "Đặt hành động chính trong SheetFooter — trên điện thoại nó luôn nằm trong vùng ngón cái, kể cả ở nấc thấp.",
      "Chọn nấc thấp nhất đủ cho tác vụ phổ biến (xem nhanh), nấc cao cho xem chi tiết; tối đa 2–3 nấc.",
    ],
    donts: [
      "Không dùng Sheet cho xác nhận ngắn hay hành động phá huỷ — dùng Dialog modalType=\"alert\".",
      "Không đặt vùng kéo ngang (slider, bản đồ) ở tiêu đề — tiêu đề và tay nắm là vùng kéo sheet.",
      "Không mở Sheet chồng lên Sheet; dismissible={false} chỉ khi thật sự bắt buộc chọn.",
    ],
    props: [
      { name: "open / defaultOpen / onOpenChange", type: "boolean / boolean / (open) => void", description: "Trạng thái mở (controlled hoặc uncontrolled)." },
      { name: "mode", type: `"auto" | "side" | "bottom"`, defaultValue: `"auto"`, description: "auto: panel khi viewport ≥ breakpoint, bottom sheet khi nhỏ hơn." },
      { name: "breakpoint", type: "number", defaultValue: "768", description: "Chiều rộng tối thiểu (px) để hiện dạng panel (qua useMediaQuery)." },
      { name: "side", type: `"start" | "end"`, defaultValue: `"end"`, description: "Cạnh trượt vào ở dạng panel; tự đảo ở RTL." },
      { name: "size", type: `"small" | "medium" | "large"`, defaultValue: `"small"`, description: "Độ rộng panel: 320 / 592 / 940px." },
      { name: "snapPoints", type: "number[]", defaultValue: "[0.5, 0.9]", description: "Các nấc chiều cao bottom sheet (phần của chiều cao viewport, 0–1)." },
      { name: "snapPoint / defaultSnapPoint / onSnapPointChange", type: "number / number / (snap) => void", description: "Nấc hiện tại; mặc định nấc thấp nhất, mỗi lần mở (uncontrolled) bắt đầu lại từ defaultSnapPoint." },
      { name: "modal", type: "boolean", defaultValue: "true", description: "false: không lớp phủ, không bẫy focus / khoá cuộn, không tự đóng khi bấm ra ngoài." },
      { name: "dismissible", type: "boolean", defaultValue: "true", description: "false: chặn Esc, bấm lớp phủ và vuốt xuống để đóng." },
      { name: "SheetContent.handle / handleLabel", type: "boolean / string", defaultValue: `true / "Đổi chiều cao"`, description: "Tay nắm bottom sheet; là nút (Enter, ↑ / ↓) khi có từ 2 nấc." },
      { name: "SheetHeader.action", type: "ReactNode", description: "Phần tử cuối hàng tiêu đề, thường là nút đóng." },
      { name: "data-sheet-no-drag", type: "attribute", description: "Gắn lên phần tử con để cú chạm ở đó không kéo sheet." },
    ],
  },

  /* ---------------------------------------------------------------- AspectRatio */
  aspectratio: {
    slug: "aspectratio",
    name: "AspectRatio",
    category: "Bố cục",
    lead: "AspectRatio giữ một khung đúng tỉ lệ rộng / cao bất kể chiều rộng — cho video, ảnh, avatar, banner và story.",
    description:
      "Dùng thuộc tính CSS aspect-ratio nên giữ chỗ ngay từ đầu, không nhảy bố cục khi ảnh / video tải xong. Khung rộng 100% vùng chứa (ghi đè bằng className như w-24), bo góc và cắt nội dung tràn; con bên trong lấp đầy khung (Image fit=\"cover\", BloomArt, size-full).",
    importCode: `import { AspectRatio } from "@/components/ui";`,
    hero: {
      title: "16:9 — video",
      code: `<AspectRatio ratio={16 / 9} className="max-w-xl rounded-xlarge bg-gradient-dusk">
  <div className="flex size-full items-center justify-center">
    <Button appearance="secondary" shape="circular" size="large" icon={<Play24Filled />} aria-label="Phát video" />
  </div>
  <span className="absolute inset-e-3 bottom-3 rounded-small bg-background-inverted px-1 text-caption1 text-foreground-inverted">
    4:32
  </span>
</AspectRatio>`,
      render: () => (
        <AspectRatio ratio={16 / 9} className="max-w-xl rounded-xlarge bg-gradient-dusk">
          <div className="flex size-full items-center justify-center">
            <Button appearance="secondary" shape="circular" size="large" icon={<Play24Filled />} aria-label="Phát video" />
          </div>
          <span className="absolute inset-e-3 bottom-3 rounded-small bg-background-inverted px-1 text-caption1 text-foreground-inverted">
            4:32
          </span>
        </AspectRatio>
      ),
    },
    examples: [
      {
        title: "4:3 — ảnh minh hoạ",
        description: "Tỉ lệ ảnh chụp cổ điển; hợp cho thẻ bài viết và thumbnail sản phẩm.",
        code: `<figure className="flex w-full max-w-xs flex-col gap-1">
  <AspectRatio ratio={4 / 3} className="rounded-xlarge">
    <BloomArt />
  </AspectRatio>
  <figcaption className="text-caption1 text-foreground-3">Bloom theo brand — 4:3</figcaption>
</figure>`,
        render: () => (
          <figure className="flex w-full max-w-xs flex-col gap-1">
            <AspectRatio ratio={4 / 3} className="rounded-xlarge">
              <BloomArt />
            </AspectRatio>
            <figcaption className="text-caption1 text-foreground-3">Bloom theo brand — 4:3</figcaption>
          </figure>
        ),
      },
      {
        title: "1:1 — lưới avatar",
        description: "Ô vuông co giãn theo cột lưới; rounded-circular cho avatar, rounded-xlarge cho ảnh sản phẩm.",
        code: `const team = [
  { name: "Nguyễn An", initials: "NA", tone: "bg-cranberry-bg text-cranberry-fg" },
  { name: "Trần Bình", initials: "TB", tone: "bg-marigold-bg text-marigold-fg" },
  // …
];

<ul className="grid w-full max-w-xs grid-cols-4 gap-2">
  {team.map((person) => (
    <li key={person.name}>
      <AspectRatio ratio={1} className={\`rounded-circular \${person.tone}\`}>
        <span role="img" aria-label={person.name} className="flex size-full items-center justify-center text-subtitle2 font-semibold">
          {person.initials}
        </span>
      </AspectRatio>
    </li>
  ))}
</ul>`,
        render: () => (
          <ul className="grid w-full max-w-xs grid-cols-4 gap-2">
            {team.map((person) => (
              <li key={person.name}>
                <AspectRatio ratio={1} className={`rounded-circular ${person.tone}`}>
                  <span role="img" aria-label={person.name} className="flex size-full items-center justify-center text-subtitle2 font-semibold">
                    {person.initials}
                  </span>
                </AspectRatio>
              </li>
            ))}
          </ul>
        ),
      },
      {
        title: "21:9 — banner",
        description: "Dải hero rộng; chữ đặt trên thẻ neutral để đủ tương phản thay vì trực tiếp trên gradient.",
        code: `<AspectRatio ratio={21 / 9} className="rounded-xlarge bg-gradient-sakura">
  <div className="flex size-full items-end p-3">
    <div className="rounded-medium bg-background-1 px-3 py-2 shadow-4">
      <p className="text-subtitle2 font-semibold">Mùa hoa 2026</p>
      <p className="text-caption1 text-foreground-3">Lịch hoa nở theo từng vùng</p>
    </div>
  </div>
</AspectRatio>`,
        render: () => (
          <AspectRatio ratio={21 / 9} className="rounded-xlarge bg-gradient-sakura">
            <div className="flex size-full items-end p-3">
              <div className="rounded-medium bg-background-1 px-3 py-2 shadow-4">
                <p className="text-subtitle2 font-semibold">Mùa hoa 2026</p>
                <p className="text-caption1 text-foreground-3">Lịch hoa nở theo từng vùng</p>
              </div>
            </div>
          </AspectRatio>
        ),
      },
      {
        title: "9:16 — story",
        description: "Khung dọc toàn màn hình điện thoại; đặt chiều rộng cố định (w-24) và để chiều cao tự tính.",
        code: `const stories = [
  { title: "Ueno", tone: "bg-gradient-sakura" },
  { title: "Kyoto", tone: "bg-gradient-sunset" },
  { title: "Hokkaido", tone: "bg-gradient-dusk" },
];

<div className="flex gap-2">
  {stories.map((story) => (
    <AspectRatio key={story.title} ratio={9 / 16} className={\`w-24 rounded-2xlarge \${story.tone}\`}>
      <div className="flex size-full flex-col justify-between p-2">
        <Star20Filled className="text-foreground-on-brand" />
        <span className="self-start rounded-small bg-background-1 px-1 text-caption1 font-semibold">{story.title}</span>
      </div>
    </AspectRatio>
  ))}
</div>`,
        render: () => (
          <div className="flex gap-2">
            {stories.map((story) => (
              <AspectRatio key={story.title} ratio={9 / 16} className={`w-24 rounded-2xlarge ${story.tone}`}>
                <div className="flex size-full flex-col justify-between p-2">
                  <Star20Filled className="text-foreground-on-brand" />
                  <span className="self-start rounded-small bg-background-1 px-1 text-caption1 font-semibold">{story.title}</span>
                </div>
              </AspectRatio>
            ))}
          </div>
        ),
      },
    ],
    dos: [
      "Bọc ảnh / video tải từ mạng trong AspectRatio để giữ chỗ, tránh nhảy bố cục (CLS).",
      "Dùng tỉ lệ chuẩn của nội dung: 16:9 video, 4:3 ảnh, 1:1 avatar, 21:9 banner, 9:16 story.",
      "Cho con lấp đầy khung: Image fit=\"cover\" hoặc lớp size-full.",
    ],
    donts: [
      "Không đặt cả chiều cao cố định lẫn ratio — chiều cao sẽ thắng và khung méo.",
      "Không đặt chữ quan trọng trực tiếp lên ảnh / gradient mà không có nền đảm bảo tương phản.",
      "Không dùng 9:16 cho nội dung cần đọc trên desktop — quá hẹp.",
    ],
    props: [
      { name: "ratio", type: "number", defaultValue: "1", description: "Tỉ lệ rộng / cao, ví dụ 16 / 9, 4 / 3, 21 / 9, 9 / 16." },
      { name: "className", type: "string", description: "Bo góc, nền, chiều rộng (mặc định w-full); khung luôn relative và overflow-hidden." },
      { name: "style", type: "CSSProperties", description: "Gộp sau aspect-ratio — có thể ghi đè." },
      { name: "...props", type: "HTMLAttributes<HTMLDivElement>", description: "Truyền xuống thẻ div bao ngoài." },
    ],
  },

  /* ---------------------------------------------------------------- useMediaQuery */
  usemediaquery: {
    slug: "usemediaquery",
    name: "useMediaQuery",
    category: "Tiện ích",
    lead: "useMediaQuery theo dõi một CSS media query và render lại khi nó đổi — breakpoint, chế độ tối, giảm chuyển động, loại con trỏ.",
    description:
      "Dựa trên useSyncExternalStore và matchMedia: không nháy giữa hai giá trị, tự huỷ đăng ký khi unmount, an toàn khi không có window (trả về defaultValue). Sheet dùng hook này để chọn panel hay bottom sheet. Chỉ dùng khi cần đổi hành vi hoặc component; đổi bố cục thuần tuý vẫn nên dùng biến thể responsive của Tailwind (md:…).",
    importCode: `import { useMediaQuery } from "@/components/ui";`,
    hero: {
      title: "Giá trị trực tiếp",
      code: `function MediaQueryDemo() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  const prefersDark = useMediaQuery("(prefers-color-scheme: dark)");
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  const coarsePointer = useMediaQuery("(pointer: coarse)");
  const rows = [
    { query: "(min-width: 768px)", matches: isDesktop },
    { query: "(prefers-color-scheme: dark)", matches: prefersDark },
    { query: "(prefers-reduced-motion: reduce)", matches: reduceMotion },
    { query: "(pointer: coarse)", matches: coarsePointer },
  ];
  return (
    <ul className="flex w-full max-w-md flex-col gap-2">
      {rows.map((row) => (
        <li
          key={row.query}
          className="flex items-center justify-between gap-3 rounded-medium border border-stroke-2 bg-background-1 px-3 py-2"
        >
          <code dir="ltr" className="font-mono text-caption1 text-foreground-2">
            {row.query}
          </code>
          <span className={row.matches ? "text-caption1 font-semibold text-success-foreground-1" : "text-caption1 text-foreground-3"}>
            {row.matches ? "Khớp" : "Không khớp"}
          </span>
        </li>
      ))}
    </ul>
  );
}`,
      render: () => <MediaQueryDemo />,
    },
    examples: [
      {
        title: "Đổi component theo breakpoint",
        description: "Màn hình rộng hiện đủ nút có nhãn; màn hình hẹp gom lại thành một nút icon. Thu nhỏ cửa sổ để thấy thay đổi.",
        code: `function ResponsiveActionsDemo() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? (
    <div className="flex gap-2">
      <Button icon={<Share20Regular />}>Chia sẻ</Button>
      <Button icon={<ArrowDownload20Regular />}>Tải xuống</Button>
    </div>
  ) : (
    <Button icon={<MoreHorizontal20Regular />} aria-label="Thao tác khác" />
  );
}`,
        render: () => <ResponsiveActionsDemo />,
      },
      {
        title: "Tôn trọng giảm chuyển động",
        description: "Hành vi viết bằng JS (cuộn, đếm giờ) không có biến thể motion-reduce: — đọc trực tiếp bằng hook.",
        code: `function ScrollTopDemo() {
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
  return (
    <Button
      icon={<ArrowUp20Regular />}
      onClick={() => window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" })}
    >
      {reduceMotion ? "Lên đầu trang (tức thì)" : "Lên đầu trang (cuộn mượt)"}
    </Button>
  );
}`,
        render: () => <ScrollTopDemo />,
      },
      {
        title: "Giá trị mặc định khi SSR",
        description: "Trên server không có matchMedia: hook trả defaultValue, rồi cập nhật ngay sau hydrate.",
        code: `function WideLayoutText() {
  const isWide = useMediaQuery("(min-width: 1024px)", { defaultValue: true });
  return (
    <p className="flex items-center gap-1 text-body1 text-foreground-2">
      <Clock20Regular />
      {isWide ? "Bố cục rộng" : "Bố cục gọn"}
    </p>
  );
}`,
        render: () => <WideLayoutText />,
      },
    ],
    dos: [
      "Dùng cho khác biệt về hành vi / component (Sheet panel ↔ bottom sheet, menu gộp).",
      "Viết query đúng cú pháp CSS, kể cả dấu ngoặc: \"(min-width: 768px)\".",
      "Đặt defaultValue khớp với bố cục server render để giảm nháy khi hydrate.",
    ],
    donts: [
      "Không dùng để đổi class bố cục thuần tuý — biến thể md: / lg: của Tailwind rẻ hơn và không cần JS.",
      "Không tạo query mới mỗi lần render (chuỗi nối từ state thay đổi liên tục).",
      "Không dựa vào (pointer: coarse) để đoán \"điện thoại\" — máy tính bảng có bàn phím, laptop có màn cảm ứng.",
    ],
    props: [
      { name: "query", type: "string", description: "Media query CSS, ví dụ \"(min-width: 768px)\", \"(prefers-reduced-motion: reduce)\"." },
      { name: "options.defaultValue", type: "boolean", defaultValue: "false", description: "Giá trị khi không có window / matchMedia (SSR, test)." },
      { name: "(trả về)", type: "boolean", description: "true khi query đang khớp; tự cập nhật khi đổi." },
    ],
  },
};

function WideLayoutText() {
  const isWide = useMediaQuery("(min-width: 1024px)", { defaultValue: true });
  return (
    <p className="flex items-center gap-1 text-body1 text-foreground-2">
      <Clock20Regular />
      {isWide ? "Bố cục rộng" : "Bố cục gọn"}
    </p>
  );
}

export const docs: ComponentDoc[] = Object.values(LABS_ADAPTIVE);
