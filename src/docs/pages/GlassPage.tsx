import * as React from "react";
import {
  Add20Regular,
  ArrowLeft20Regular,
  Bookmark20Regular,
  Heart20Regular,
  Home20Regular,
  Map20Regular,
  MoreHorizontal20Regular,
  Person20Regular,
  Share20Regular,
} from "@fluentui/react-icons";
import {
  Badge,
  Button,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SearchBox,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  useScrollMinimize,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DocSection, DoDont, PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";
import { useLocale, type Locale } from "../i18n";
import { scenery, sunset } from "../sample-assets";

export const GLASS_SECTIONS: Record<Locale, { id: string; label: string }[]> = {
  vi: [
    { id: "overview", label: "Tổng quan" },
    { id: "variants", label: "Biến thể" },
    { id: "components", label: "Component" },
    { id: "utilities", label: "Utility" },
    { id: "accessibility", label: "Trợ năng" },
    { id: "performance", label: "Hiệu năng" },
    { id: "do-dont", label: "Nên & không nên" },
  ],
  en: [
    { id: "overview", label: "Overview" },
    { id: "variants", label: "Variants" },
    { id: "components", label: "Components" },
    { id: "utilities", label: "Utilities" },
    { id: "accessibility", label: "Accessibility" },
    { id: "performance", label: "Performance" },
    { id: "do-dont", label: "Do and don't" },
  ],
};

/** Mô phỏng "giảm trong suốt" trong khung demo: cùng token mà fallback CSS đặt khi người dùng bật tuỳ chọn hệ thống. */
const SOLID_PREVIEW = {
  "--glassFilter": "none",
  "--glassEdgeFilter": "none",
  "--colorGlassBackground": "var(--colorGlassBackgroundSolid)",
  "--colorGlassClearBackground": "var(--colorGlassClearBackgroundSolid)",
  "--colorGlassTinted": "var(--colorBrandBackground)",
} as React.CSSProperties;

function C({ children }: { children: React.ReactNode }) {
  return <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">{children}</code>;
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="max-w-3xl text-body1 text-foreground-2">{children}</p>;
}

function Table({ head, rows }: { head: string[]; rows: React.ReactNode[][] }) {
  return (
    // tabIndex: bảng rộng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable).
    <div tabIndex={0} className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1">
      <table className="w-full border-collapse text-start text-body1">
        <thead>
          <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
            {head.map((h) => (
              <th key={h} className="px-4 py-2 text-start">
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

/* ---------------------------------------------------------------- demo: thanh glass trên nội dung cuộn */
function ScrollDemo({ en, solid }: { en: boolean; solid: boolean }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const minimized = useScrollMinimize({ target: scrollRef, threshold: 16, topOffset: 24 });
  const t = (vi: string, e: string) => (en ? e : vi);

  return (
    <div
      ref={scrollRef}
      tabIndex={0}
      role="region"
      aria-label={t("Demo glass: cuộn để xem nội dung trượt dưới thanh", "Glass demo: scroll to see content slide under the bars")}
      style={solid ? SOLID_PREVIEW : undefined}
      className="relative h-112 overflow-y-auto rounded-3xlarge border border-stroke-2 bg-background-2"
    >
      <div className="scroll-edge sticky top-0 z-10 flex justify-center px-3 pt-3">
        <Toolbar material="glass" aria-label={t("Thao tác với chuyến đi", "Trip actions")}>
          <ToolbarButton icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />} aria-label={t("Quay lại", "Back")} />
          <ToolbarDivider />
          <ToolbarButton icon={<Share20Regular />} aria-label={t("Chia sẻ", "Share")} />
          <ToolbarButton icon={<Heart20Regular />} aria-label={t("Yêu thích", "Favorite")} />
          <Menu>
            <MenuTrigger asChild>
              <ToolbarButton icon={<MoreHorizontal20Regular />} aria-label={t("Thêm", "More")} />
            </MenuTrigger>
            <MenuPopover material="glass" align="end">
              <MenuItem icon={<Bookmark20Regular />}>{t("Lưu vào bộ sưu tập", "Save to a collection")}</MenuItem>
              <MenuItem icon={<Add20Regular />}>{t("Thêm vào lịch trình", "Add to the itinerary")}</MenuItem>
            </MenuPopover>
          </Menu>
          <SearchBox appearance="glass" size="small" placeholder={t("Tìm địa điểm", "Search places")} className="w-36" />
        </Toolbar>
      </div>

      <div className="-mt-12 grid gap-3 p-3 sm:grid-cols-2">
        {[...scenery, ...scenery].map((photo, i) => (
          <figure key={i} className="overflow-hidden rounded-xlarge bg-background-1">
            <img src={photo.src} alt="" className="aspect-video w-full object-cover" />
            <figcaption className="px-3 py-2 text-caption1 text-foreground-2">
              {t("Ngày", "Day")} {i + 1}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="scroll-edge-above sticky bottom-0 z-10 flex justify-center px-3 pb-3">
        <Tabs defaultValue="home">
          <TabsList material="glass" minimized={minimized} aria-label={t("Điều hướng", "Navigation")}>
            <TabsTrigger value="home" icon={<Home20Regular />}>
              {t("Trang chủ", "Home")}
            </TabsTrigger>
            <TabsTrigger value="map" icon={<Map20Regular />}>
              {t("Bản đồ", "Map")}
            </TabsTrigger>
            <TabsTrigger value="me" icon={<Person20Regular />}>
              {t("Cá nhân", "Profile")}
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- demo: clear trên ảnh */
function MediaDemo({ en, solid }: { en: boolean; solid: boolean }) {
  const t = (vi: string, e: string) => (en ? e : vi);
  return (
    <div style={solid ? SOLID_PREVIEW : undefined} className="relative isolate h-72 overflow-hidden rounded-3xlarge">
      <img src={sunset} alt="" className="absolute inset-0 -z-10 size-full object-cover" />
      <div aria-hidden className="glass-scrim absolute inset-0 -z-10" />
      <div className="flex h-full flex-col justify-between p-4">
        <Toolbar material="glass-clear" aria-label={t("Điều khiển ảnh", "Photo controls")} className="self-start">
          <ToolbarButton icon={<ArrowLeft20Regular className="rtl:-scale-x-100" />} aria-label={t("Quay lại", "Back")} />
          <ToolbarButton icon={<Share20Regular />}>{t("Chia sẻ", "Share")}</ToolbarButton>
        </Toolbar>
        <div className="flex flex-wrap items-center gap-2">
          <Button appearance="glass" shape="circular" icon={<Heart20Regular />}>
            {t("Yêu thích", "Favorite")}
          </Button>
          <Button appearance="glass-prominent" shape="circular" icon={<Add20Regular />}>
            {t("Đặt chuyến", "Book trip")}
          </Button>
          <Popover>
            <PopoverTrigger asChild>
              <Button appearance="glass" shape="circular">
                {t("Chi tiết", "Details")}
              </Button>
            </PopoverTrigger>
            <PopoverSurface material="glass" withArrow>
              <p className="text-body1 font-semibold">{t("Hoàng hôn trên vịnh", "Sunset over the bay")}</p>
              <p className="text-caption1 text-foreground-3">{t("Chụp lúc 18:42 · 24 ảnh", "Taken at 18:42 · 24 photos")}</p>
            </PopoverSurface>
          </Popover>
        </div>
      </div>
    </div>
  );
}

const USAGE = `import { Toolbar, ToolbarButton, TabsList, TabsTrigger, Tabs, useScrollMinimize } from "yugen-ui";

function TripBars() {
  const minimized = useScrollMinimize();
  return (
    <>
      <header className="scroll-edge sticky top-0 z-10 flex justify-center pt-3">
        <Toolbar material="glass" aria-label="Trip actions">
          <ToolbarButton icon={<Share20Regular />} aria-label="Share" />
        </Toolbar>
      </header>
      {/* … content … */}
      <Tabs defaultValue="home" className="fixed inset-x-0 bottom-3 flex justify-center">
        <TabsList material="glass" minimized={minimized} aria-label="Sections">
          <TabsTrigger value="home" icon={<Home20Regular />}>Home</TabsTrigger>
        </TabsList>
      </Tabs>
    </>
  );
}`;

const UTILITIES = `<!-- Thanh tự làm: nền glass, nút bo đồng tâm -->
<nav class="glass sticky top-3 rounded-circular p-1 [--concentric-radius:var(--borderRadiusCircular)] [--concentric-padding:--spacing(1)]">
  <a class="rounded-concentric px-3 py-1.5" href="/">Home</a>
</nav>

<!-- Trên ảnh: làm tối ảnh rồi đặt glass-clear -->
<div class="relative">
  <img src="…" alt="" />
  <div class="glass-scrim absolute inset-0"></div>
  <div class="glass-clear absolute bottom-3 inset-s-3 rounded-circular px-3 py-1.5">…</div>
</div>`;

export function GlassPage() {
  const { locale } = useLocale();
  const en = locale === "en";
  const t = (vi: string, e: string) => (en ? e : vi);
  const [solid, setSolid] = React.useState(false);

  return (
    <>
      <PageHeader
        eyebrow="Foundations · Yugen Labs"
        title="Glass"
        lead={t(
          "Vật liệu trong mờ cho lớp điều hướng nổi trên nội dung: thanh công cụ, thanh tab, sidebar, menu và các bề mặt tạm. Nội dung vẫn là trung tâm; glass chỉ nằm trên lớp điều khiển.",
          "A translucent material for the navigation layer that floats above content: toolbars, tab bars, sidebars, menus and transient surfaces. Content stays in focus; glass only sits on the control layer.",
        )}
      >
        <Badge appearance="tint" color="informative">
          {t("Labs: tên prop và token có thể đổi trước 1.0", "Labs: prop and token names may change before 1.0")}
        </Badge>
      </PageHeader>

      <DocSection id="overview" title={t("Tổng quan", "Overview")}>
        <div className="flex flex-col gap-4">
          <P>
            {t(
              "Lấy cảm hứng từ Liquid Glass, chuyển sang web và token của Yugen. Bật glass trên từng component bằng material=\"glass\"; giao diện mặc định không đổi. Cuộn trong khung dưới đây: ảnh trượt dưới thanh trên và thanh tab, thanh tab thu gọn khi cuộn xuống.",
              "Inspired by Liquid Glass, adapted to the web and to Yugen's tokens. Turn it on per component with material=\"glass\"; the default look doesn't change. Scroll inside the frame below: photos slide under the top bar and the tab bar, and the tab bar minimizes when you scroll down.",
            )}
          </P>
          <Switch
            checked={solid}
            onCheckedChange={setSolid}
            label={t("Xem như khi bật Giảm trong suốt", "Preview with Reduce transparency on")}
          />
          <ScrollDemo en={en} solid={solid} />
          <CodeBlock code={USAGE} />
        </div>
      </DocSection>

      <DocSection
        id="variants"
        title={t("Biến thể", "Variants")}
        description={t(
          "glass dùng chung, theo theme sáng / tối. glass-clear dùng trên ảnh và media: luôn đặt glass-scrim lên ảnh để chữ trắng đọc được. glass-tinted (Button appearance=\"glass-prominent\") cho một hành động chính.",
          "glass is the general one and follows the light / dark theme. glass-clear goes over photos and media: always put glass-scrim on the image so white text stays legible. glass-tinted (Button appearance=\"glass-prominent\") is for one primary action.",
        )}
      >
        <MediaDemo en={en} solid={solid} />
      </DocSection>

      <DocSection id="components" title={t("Component", "Components")}>
        <Table
          head={[t("Component", "Component"), "Prop", t("Ghi chú", "Notes")]}
          rows={[
            ["Toolbar", <C key="p">material</C>, t("Thanh nổi bo tròn hai đầu; nút bên trong bo đồng tâm.", "Floating capsule bar; buttons inside get concentric corners.")],
            ["TabsList", <C key="p">material · minimized</C>, t("Tab đang chọn là nền bo tròn. minimized chỉ còn icon (dùng với useScrollMinimize).", "The selected tab is a rounded fill. minimized keeps only the icons (use with useScrollMinimize).")],
            ["Nav", <C key="p">material</C>, t("Sidebar nổi có đệm và bo góc.", "Floating sidebar with padding and rounded corners.")],
            ["SearchBox / Input", <C key="p">appearance="glass"</C>, t("Ô nhập trong thanh glass.", "A field inside a glass bar.")],
            ["Button", <C key="p">appearance="glass" · "glass-prominent"</C>, t("Nút nổi trên nội dung; prominent là màu brand.", "A button over content; prominent uses the brand color.")],
            ["MenuPopover · PopoverSurface · TooltipContent", <C key="p">material</C>, t("Bề mặt tạm mở từ thanh glass.", "Transient surfaces opened from a glass bar.")],
            ["DialogSurface · DrawerSurface · SheetContent", <C key="p">material</C>, t("Bottom sheet glass lồi vào trong mép màn hình và đặc dần khi kéo lên nấc cao nhất.", "A glass bottom sheet is inset from the screen edges and turns opaque at the highest snap point.")],
          ]}
        />
      </DocSection>

      <DocSection id="utilities" title={t("Utility", "Utilities")}>
        <div className="flex flex-col gap-4">
          <Table
            head={["Utility", t("Dùng cho", "Use")]}
            rows={[
              [<C key="u">glass</C>, t("Nền glass theo theme, kèm viền sáng và các token chữ / hover giữ tương phản.", "Theme-aware glass background with an edge highlight, plus text / hover tokens that keep contrast.")],
              [<C key="u">glass-clear</C>, t("Glass trên ảnh / media, chữ trắng.", "Glass over photos / media, with white text.")],
              [<C key="u">glass-tinted</C>, t("Glass màu brand cho một hành động chính.", "Brand-colored glass for one primary action.")],
              [<C key="u">glass-scrim</C>, t("Lớp làm tối đặt lên ảnh dưới glass-clear.", "A dimming layer on the image under glass-clear.")],
              [<C key="u">scroll-edge · scroll-edge-above</C>, t("Nội dung cuộn dưới vùng thanh sticky nhoè và mờ dần, thay cho vạch kẻ. Đặt lên vùng thanh trải hết chiều rộng.", "Content scrolling under a sticky bar area blurs and fades out, instead of a divider. Put it on the full-width bar area.")],
              [<C key="u">rounded-concentric</C>, t("Góc trong = --concentric-radius − --concentric-padding của phần tử cha.", "Inner radius = the parent's --concentric-radius − --concentric-padding.")],
            ]}
          />
          <CodeBlock code={UTILITIES} />
        </div>
      </DocSection>

      <DocSection id="accessibility" title={t("Trợ năng", "Accessibility")}>
        <div className="flex flex-col gap-4">
          <P>
            {t(
              "Độ đục của glass được chọn để chữ chính và chữ phụ đạt ít nhất 4.5:1 cả khi phía sau là trắng hay đen hoàn toàn: nền trắng 80% ở theme sáng, xám 82% ở theme tối. Bên trong glass, chữ mờ (foreground-3, -4) dùng màu của foreground-2 và chữ brand dùng sắc đậm hơn. glass-clear cần glass-scrim: chữ trắng đạt 5.9:1 cả khi ảnh trắng.",
              "Glass opacity is chosen so primary and secondary text reach at least 4.5:1 even over pure white or pure black: 80% white in light themes, 82% grey in dark themes. Inside glass, faint text (foreground-3, -4) uses the foreground-2 color and brand text uses a deeper shade. glass-clear needs glass-scrim: white text reaches 5.9:1 even over a white image.",
            )}
          </P>
          <Table
            head={[t("Tình huống", "Situation"), t("Glass hiển thị", "Glass becomes")]}
            rows={[
              [<C key="s">prefers-reduced-transparency: reduce</C>, t("Nền đặc, không blur.", "Opaque, no blur.")],
              [<C key="s">prefers-contrast: more</C>, t("Nền đặc, viền rõ.", "Opaque, with a visible border.")],
              [t("Theme tương phản cao", "High-contrast theme"), t("Nền đen, viền trắng.", "Black background, white border.")],
              [<C key="s">forced-colors: active</C>, t("Màu hệ thống, không blur.", "System colors, no blur.")],
              [t("Trình duyệt không có backdrop-filter", "No backdrop-filter support"), t("Nền đặc.", "Opaque.")],
              [t("Glass lồng trong glass", "Glass inside glass"), t("Chỉ còn lớp màu, không blur lần hai.", "Tint only, no second blur.")],
            ]}
          />
          <P>
            {t(
              "Kiểm tra với Giảm trong suốt, Tăng tương phản, Giảm chuyển động và chế độ màu cưỡng bức của hệ điều hành; thử trên ảnh sáng nhất và tối nhất mà app có thể hiển thị.",
              "Test with the operating system's Reduce transparency, Increase contrast, Reduce motion and forced-colors modes, over the brightest and darkest images your app can show.",
            )}
          </P>
        </div>
      </DocSection>

      <DocSection id="performance" title={t("Hiệu năng", "Performance")}>
        <ul className={cn("flex max-w-3xl list-disc flex-col gap-1 ps-5 text-body1 text-foreground-2")}>
          <li>{t("Một backdrop-filter cho mỗi thanh: nút bên trong dùng chung, không tự có glass.", "One backdrop-filter per bar: the buttons inside share it instead of having their own.")}</li>
          <li>{t("Tránh glass trên vùng lớn đổi liên tục (video, canvas animate): blur tính lại mỗi khung hình.", "Avoid glass over large areas that change every frame (video, animated canvas): the blur is recomputed each frame.")}</li>
          <li>{t("Glass lồng nhau tự tắt blur ở lớp trong.", "Nested glass turns off the inner blur on its own.")}</li>
        </ul>
      </DocSection>

      <DocSection id="do-dont" title={t("Nên & không nên", "Do and don't")}>
        <DoDont
          dos={
            en
              ? [
                  "Use glass for bars, tab bars, sidebars and menus that float above content.",
                  "Put glass-scrim on photos under glass-clear.",
                  "Keep one primary glass-prominent action per view.",
                ]
              : [
                  "Dùng glass cho thanh công cụ, thanh tab, sidebar và menu nổi trên nội dung.",
                  "Đặt glass-scrim lên ảnh nằm dưới glass-clear.",
                  "Mỗi màn hình chỉ một hành động glass-prominent.",
                ]
          }
          donts={
            en
              ? [
                  "Put glass on content: cards, list rows, table cells.",
                  "Stack glass on glass.",
                  "Use glass-clear without a scrim over bright images.",
                ]
              : [
                  "Dùng glass cho nội dung: thẻ, hàng danh sách, ô bảng.",
                  "Chồng glass lên glass.",
                  "Dùng glass-clear trên ảnh sáng mà không có scrim.",
                ]
          }
        />
      </DocSection>
    </>
  );
}
