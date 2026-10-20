import * as React from "react";
import {
  CheckmarkCircle48Regular,
  ErrorCircle48Regular,
  Info48Regular,
  Warning48Regular,
  CheckmarkCircle16Filled,
  DismissCircle16Filled,
} from "@fluentui/react-icons";
import {
  Badge,
  Button,
  Checkbox,
  GradientText,
  Input,
  Switch,
  Tabs,
  TabsList,
  TabsTrigger,
  WavyUnderline,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import { DoDont, DocSection, PageHeader } from "../blocks";
import { CodeBlock } from "../CodeBlock";

/* ======================================================================= helpers */

function readVar(name: string, el: Element = document.documentElement) {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

function parseColor(value: string): [number, number, number] | null {
  const hex = value.match(/^#([0-9a-f]{6})$/i);
  if (hex) return [0, 2, 4].map((i) => parseInt(hex[1].slice(i, i + 2), 16)) as [number, number, number];
  const rgb = value.match(/rgba?\(([\d.]+)[ ,]+([\d.]+)[ ,]+([\d.]+)/i);
  if (rgb) return [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])];
  return null;
}

function luminance([r, g, b]: [number, number, number]) {
  const f = (c: number) => {
    const s = c / 255;
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function contrastRatio(a: string, b: string) {
  const ca = parseColor(a);
  const cb = parseColor(b);
  if (!ca || !cb) return null;
  const [hi, lo] = [luminance(ca), luminance(cb)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

/** Đọc giá trị token sau khi theme/brand áp dụng (phụ thuộc theme để tính lại). */
function useTokenValue(token: string, theme: string, scopeRef?: React.RefObject<HTMLElement | null>) {
  const [value, setValue] = React.useState("");
  React.useEffect(() => {
    setValue(readVar(`--${token}`, scopeRef?.current ?? document.documentElement));
  }, [token, theme, scopeRef]);
  return value;
}

function Tile({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("overflow-hidden rounded-3xlarge bg-background-3 p-XXL", className)}>{children}</div>;
}

/* ======================================================================= data */

const SHARED_GRID = ["forest", "green", "teal", "steel", "blue", "royal-blue", "navy", "lavender", "purple", "grape", "magenta", "cranberry"];
const SHARED_ROWS: [number, string][] = [
  [60, "black"],
  [80, "black"],
  [100, "white"],
  [70, "white"],
  [45, "white"],
];
const mix = (hue: string, pct: number, withColor: string) =>
  pct === 100 ? `var(--shared-${hue})` : `color-mix(in srgb, var(--shared-${hue}) ${pct}%, ${withColor})`;

const SHIFT_HUES = ["blue", "lavender", "magenta", "dark-orange", "green"];

const NEUTRAL_STRIP = [100, 98, 96, 94, 88, 82, 74, 60, 44, 26, 14, 0];

const BRANDS = [
  { id: "sakura", label: "Sakura 桜 (mặc định Yugen)" },
  { id: "web", label: "Fluent Communication Blue" },
  { id: "teams", label: "Teams / Dusk" },
] as const;

const BRAND_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];

/* ======================================================================= hero art */

const MOSAIC = ["teal", "blue", "lavender", "magenta", "cranberry", "dark-orange", "marigold", "green", "cyan", "berry", "purple", "orange"];

function ColorMosaic() {
  return (
    <div className="relative h-72 overflow-hidden rounded-3xlarge bg-linear-to-b from-background-3 to-background-5 perspective-[1400px]">
      <div className="absolute top-1/2 left-1/2 grid w-190 -translate-x-1/2 -translate-y-1/2 grid-cols-10 gap-S transform-[rotateX(58deg)_rotateZ(-36deg)]">
        {Array.from({ length: 60 }, (_, i) => {
          const hue = MOSAIC[(i * 7 + Math.floor(i / 10) * 3) % MOSAIC.length];
          const pct = [100, 70, 45, 85, 60][i % 5];
          return (
            <span
              key={i}
              className="aspect-square rounded-large shadow-8"
              style={{
                background: `linear-gradient(135deg, rgb(255 255 255 / 0.45), transparent 55%), ${mix(hue, pct, "white")}`,
              }}
            />
          );
        })}
      </div>
    </div>
  );
}

/* ======================================================================= sections */

function PalettesSection() {
  const cards = [
    {
      title: "Neutral",
      text: "Đen, trắng và xám — nền tảng cho bề mặt, chữ và bố cục.",
      swatches: [100, 94, 82, 60, 38, 14].map((g) => (g === 100 ? "var(--white)" : `var(--grey-${g})`)),
    },
    {
      title: "Shared",
      text: "Màu dùng chung toàn M365 cho avatar, lịch, badge và trạng thái.",
      swatches: ["green", "teal", "blue", "lavender", "magenta", "dark-orange"].map((h) => `var(--shared-${h})`),
    },
    {
      title: "Brand",
      text: "Màu nhận diện sản phẩm cho hành động chính và trạng thái chọn.",
      swatches: [40, 60, 80, 100, 130, 160].map((s) => `var(--brand-${s})`),
    },
  ];
  return (
    <div className="grid gap-L md:grid-cols-3">
      {cards.map((c) => (
        <div key={c.title} className="rounded-2xlarge border border-stroke-2 bg-background-1 p-L">
          <div className="flex h-12 overflow-hidden rounded-large">
            {c.swatches.map((s) => (
              <span key={s} className="flex-1" style={{ background: s }} />
            ))}
          </div>
          <p className="mt-M text-subtitle2 font-semibold">{c.title}</p>
          <p className="mt-XS text-body1 text-foreground-2">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

function NeutralSection() {
  return (
    <>
      <Tile className="p-XXXL">
        <div className="flex h-56 overflow-hidden rounded-3xlarge shadow-4">
          {NEUTRAL_STRIP.map((g) => (
            <span
              key={g}
              className="flex flex-1 items-end justify-center pb-S font-mono text-[10px]"
              style={{
                background: g === 100 ? "var(--white)" : g === 0 ? "var(--black)" : `var(--grey-${g})`,
                color: g > 50 ? "var(--grey-26)" : "var(--grey-90)",
              }}
            >
              {g === 100 ? "W" : g === 0 ? "B" : g}
            </span>
          ))}
        </div>
      </Tile>

      <h3 className="mt-XXL text-title3 font-semibold">Phân cấp thị giác bằng neutral</h3>
      <p className="mt-S max-w-3xl text-body2 text-foreground-2">
        Dùng neutral sáng hơn cho bề mặt cần tập trung. Mắt người dùng sẽ được dẫn tới vùng quan trọng nhất mà không cần
        thêm màu.
      </p>
      <Tile className="mt-L">
        <div className="rounded-2xlarge bg-background-4 p-XL">
          <p className="mb-S font-mono text-caption1 text-foreground-3">bg-background-4 · nền ứng dụng</p>
          <div className="rounded-xlarge bg-background-2 p-XL shadow-2">
            <p className="mb-S font-mono text-caption1 text-foreground-3">bg-background-2 · vùng nội dung</p>
            <div className="grid gap-L sm:grid-cols-2">
              <div className="rounded-medium bg-background-1 p-L shadow-4">
                <p className="text-body1 font-semibold">bg-background-1 + shadow-4</p>
                <p className="mt-XS text-caption1 text-foreground-3">Bề mặt trọng tâm: Card, Dialog</p>
              </div>
              <div className="rounded-medium bg-background-1 p-L shadow-4">
                <p className="text-body1 font-semibold">Sáng nhất = quan trọng nhất</p>
                <p className="mt-XS text-caption1 text-foreground-3">Tối dần về phía nền</p>
              </div>
            </div>
          </div>
        </div>
      </Tile>
    </>
  );
}

function SharedSection() {
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        Shared color đồng bộ trên toàn bộ M365, dùng trong component giá trị cao (avatar, lịch, badge) để người dùng nhận
        ra chức năng giữa các sản phẩm. <strong className="font-semibold text-foreground-1">Dùng tiết kiệm</strong> — chỉ
        để nhấn vào vùng quan trọng.
      </p>
      <Tile className="mt-L">
        <div className="mx-auto grid max-w-3xl grid-cols-12 overflow-hidden rounded-xlarge shadow-8">
          {SHARED_ROWS.map(([pct, withColor]) =>
            SHARED_GRID.map((hue) => (
              <span key={`${hue}-${pct}-${withColor}`} className="aspect-4/3" style={{ background: mix(hue, pct, withColor) }} title={hue} />
            )),
          )}
        </div>
      </Tile>

      <h3 className="mt-XXL text-title3 font-semibold">Shared color trong dark mode</h3>
      <p className="mt-S max-w-3xl text-body2 text-foreground-2">
        Ở dark mode, shared color dịch chuyển độ bão hoà và độ sáng để giảm mỏi mắt và đảm bảo tương phản — không chỉ đảo
        ngược màu.
      </p>
      <div className="mt-L grid overflow-hidden rounded-3xlarge sm:grid-cols-2">
        <div data-theme="light" className="flex justify-center bg-background-3 p-XXL">
          <div className="grid w-full max-w-56 grid-cols-4 overflow-hidden rounded-xlarge shadow-8">
            {SHIFT_HUES.map((hue) =>
              [55, 70, 85, 100].map((pct) => <span key={hue + pct} className="aspect-square" style={{ background: mix(hue, pct, "black") }} />),
            )}
          </div>
        </div>
        <div data-theme="dark" className="flex justify-center bg-background-2 p-XXL">
          <div className="grid w-full max-w-56 grid-cols-4 overflow-hidden rounded-xlarge shadow-8">
            {SHIFT_HUES.map((hue) =>
              [75, 62, 50, 38].map((pct) => <span key={hue + pct} className="aspect-square" style={{ background: mix(hue, pct, "white") }} />),
            )}
          </div>
        </div>
      </div>

      <h3 className="mt-XXL text-title3 font-semibold">Màu ngữ nghĩa (semantic)</h3>
      <p className="mt-S max-w-3xl text-body2 text-foreground-2">
        Một số shared color được dành riêng để truyền đạt phản hồi, trạng thái hoặc mức khẩn cấp, dựa trên liên tưởng
        thực tế: <span className="text-danger-foreground-1">đỏ = nguy hiểm</span>,{" "}
        <span className="text-warning-foreground-1">vàng/cam = thận trọng</span>,{" "}
        <span className="text-success-foreground-1">xanh lá = tích cực</span>. Luôn đi kèm icon/chữ để giảm tải nhận thức.
      </p>
      <Tile className="mt-L">
        <div className="flex flex-wrap items-center justify-center gap-XXXL">
          <CheckmarkCircle48Regular className="size-20 text-success-foreground-1" />
          <ErrorCircle48Regular className="size-20 text-danger-foreground-1" />
          <Info48Regular className="size-20 text-brand-foreground-1" />
          <Warning48Regular className="size-20 text-warning-foreground-1" />
        </div>
      </Tile>
      <div className="mt-L">
        <DoDont
          dos={[
            "Dùng màu ngữ nghĩa cho thông điệp quan trọng: lỗi, cảnh báo, thành công.",
            "Luôn ghép với icon và chữ (MessageBar, Badge có nhãn).",
            "Dùng nhất quán: cùng một trạng thái luôn cùng một màu.",
          ]}
          donts={[
            "Không dùng màu ngữ nghĩa để trang trí (nút đỏ cho đẹp, tiêu đề xanh lá).",
            "Không để màu là tín hiệu duy nhất (chỉ tô đỏ ô nhập mà không có thông báo).",
          ]}
        />
      </div>
    </>
  );
}

function BrandSection() {
  const [brand, setBrand] = React.useState<(typeof BRANDS)[number]["id"]>("sakura");
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        Brand color tạo nhận diện tức thì cho sản phẩm. Áp dụng có chủ đích vào <strong className="font-semibold text-foreground-1">vùng cụ thể</strong> để
        tạo điểm nhấn và giữ người dùng định hướng. Mỗi brand là một ramp 16 bậc; đổi brand chỉ cần{" "}
        <code className="rounded-small bg-background-4 px-XS font-mono text-caption1">data-brand</code>.
      </p>
      <p className="mt-S max-w-3xl text-body2 text-foreground-2">
        Brand mặc định của Yugen UI là <strong className="font-semibold text-brand-foreground-1">Sakura 桜 #C2347A</strong> — hồng
        anh đào đậm, tương phản <strong className="font-semibold text-foreground-1">5.16:1</strong> với chữ trắng, và lệch
        hue ~30° so với đỏ <span className="text-danger-foreground-1">danger</span> để nút chính không bao giờ bị nhầm với
        hành động phá huỷ. Bậc nhạt 130–160 chính là sắc cánh hoa (#FFA7C9 → #FDEDF3).
      </p>

      <div className="mt-L flex flex-wrap gap-S" role="radiogroup" aria-label="Chọn brand">
        {BRANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={brand === b.id}
            onClick={() => setBrand(b.id)}
            className={cn(
              "inline-flex h-8 items-center gap-S rounded-circular border px-M text-body1 transition-colors duration-faster",
              brand === b.id ? "border-brand-stroke bg-brand-background-2 font-semibold text-brand-foreground-2" : "border-stroke-1 hover:bg-subtle-hover",
            )}
          >
            <span data-brand={b.id} className="size-3 rounded-circular bg-brand-background" />
            {b.label}
          </button>
        ))}
      </div>

      <div data-brand={brand} className="mt-L">
        <div className="flex overflow-hidden rounded-2xlarge border border-stroke-2">
          {BRAND_STEPS.map((step) => (
            <div key={step} className="flex h-24 flex-1 items-end justify-center pb-S" style={{ background: `var(--brand-${step})` }}>
              <span className={cn("font-mono text-[10px]", step < 100 ? "text-(--white)" : "text-(--grey-14)")}>{step}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-XXL text-title3 font-semibold">Brand dùng ở đâu</h3>
        <Tile className="mt-L">
          <div className="grid gap-XL md:grid-cols-2">
            <div className="flex flex-col items-start gap-M">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">Hành động chính (CTA)</p>
              <div className="flex gap-S">
                <Button appearance="primary">Bắt đầu</Button>
                <Button>Để sau</Button>
              </div>
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">Liên kết</p>
              <a href="#/foundations/color" className="text-body1 text-link underline-offset-2 hover:text-link-hover hover:underline">
                Xem hướng dẫn màu
              </a>
            </div>
            <div className="flex flex-col items-start gap-M">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">Trạng thái chọn / bật</p>
              <Tabs defaultValue="a">
                <TabsList size="small">
                  <TabsTrigger value="a">Đang chọn</TabsTrigger>
                  <TabsTrigger value="b">Khác</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-L">
                <Checkbox label="Đã chọn" defaultChecked />
                <Switch label="Bật" defaultChecked />
              </div>
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">Chỉ báo focus</p>
              <Input placeholder="Click để thấy thanh brand" rootClassName="w-64" />
            </div>
          </div>
        </Tile>
      </div>

      <div className="mt-L">
        <DoDont
          dos={[
            "Dùng brand cho nút/CTA chính, trạng thái chọn, bật, focus và liên kết.",
            "Giữ brand ở diện tích nhỏ để nó luôn là điểm nhấn.",
            "Dùng bậc tint (Background2) cho vùng chọn nhạt như nav item, badge tint.",
          ]}
          donts={[
            "Không phủ brand lên diện tích lớn (header, sidebar, nền trang) — làm loãng phân cấp và khó điều hướng.",
            "Không dùng brand cho chữ thân bài hoặc tiêu đề trang trí.",
            "Không trộn hai brand trong cùng một vùng nội dung.",
          ]}
        />
      </div>
      <div className="mt-L">
        <CodeBlock
          code={`// index.html — đổi brand cho toàn ứng dụng
<html data-brand="web">

// Một vùng riêng (đặt kèm data-theme nếu nằm trong theme khác)
<section data-theme="light" data-brand="teams">...</section>`}
        />
      </div>
    </>
  );
}

const STATE_ROWS = [
  {
    name: "Primary",
    states: [
      ["Rest", "colorBrandBackground"],
      ["Hover", "colorBrandBackgroundHover"],
      ["Pressed", "colorBrandBackgroundPressed"],
    ],
    demo: <Button appearance="primary">Thử hover / nhấn</Button>,
  },
  {
    name: "Secondary",
    states: [
      ["Rest", "colorNeutralBackground1"],
      ["Hover", "colorNeutralBackground1Hover"],
      ["Pressed", "colorNeutralBackground1Pressed"],
    ],
    demo: <Button>Thử hover / nhấn</Button>,
  },
  {
    name: "Subtle",
    states: [
      ["Rest", "transparent"],
      ["Hover", "colorSubtleBackgroundHover"],
      ["Pressed", "colorSubtleBackgroundPressed"],
    ],
    demo: <Button appearance="subtle">Thử hover / nhấn</Button>,
  },
  {
    name: "Selected (tint)",
    states: [
      ["Rest", "colorBrandBackground2"],
      ["Hover", "colorBrandBackground2Hover"],
      ["Pressed", "colorBrandBackground2Pressed"],
    ],
    demo: <Badge appearance="tint">Đang chọn</Badge>,
  },
] as const;

function StateSwatch({ token, theme }: { token: string; theme: string }) {
  const value = useTokenValue(token, theme);
  const isTransparent = token === "transparent";
  return (
    <div className="flex min-w-0 items-center gap-S">
      <span
        className="size-9 shrink-0 rounded-medium border border-stroke-2"
        style={{
          background: isTransparent
            ? "repeating-conic-gradient(var(--colorNeutralBackground4) 0 25%, var(--colorNeutralBackground1) 0 50%) 0 0/10px 10px"
            : `var(--${token})`,
        }}
      />
      <div className="min-w-0">
        <p className="font-mono text-caption2 font-semibold break-all">{token}</p>
        {!isTransparent && <p className="font-mono text-caption2 text-foreground-3">{value}</p>}
      </div>
    </div>
  );
}

function StatesSection({ theme }: { theme: string }) {
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        Trên web, component <strong className="font-semibold text-foreground-1">đậm dần khi tương tác</strong>: sáng nhất
        khi nghỉ, đậm hơn khi hover, đậm nhất khi nhấn/chọn. (Windows làm ngược lại: control sáng dần khi tương tác.)
      </p>
      <div className="mt-L overflow-x-auto rounded-2xlarge border border-stroke-2 bg-background-1">
        <table className="w-full min-w-170 table-fixed text-left text-body1">
          <thead>
            <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
              <th className="w-28 px-L py-S">Kiểu</th>
              <th className="px-L py-S">Rest</th>
              <th className="px-L py-S">Hover</th>
              <th className="px-L py-S">Pressed</th>
              <th className="w-44 px-L py-S">Thử</th>
            </tr>
          </thead>
          <tbody>
            {STATE_ROWS.map((row) => (
              <tr key={row.name} className="border-b border-stroke-3 last:border-b-0">
                <td className="px-L py-M font-semibold">{row.name}</td>
                {row.states.map(([label, token]) => (
                  <td key={label} className="px-L py-M">
                    <StateSwatch token={token} theme={theme} />
                  </td>
                ))}
                <td className="px-L py-M">{row.demo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-XXL text-title3 font-semibold">Trạng thái focus</h3>
      <p className="mt-S max-w-3xl text-body2 text-foreground-2">
        Khi focus bằng bàn phím, <strong className="font-semibold text-foreground-1">màu control không đổi</strong> — thay
        vào đó khung ngoài có nét dày hơn (2px <code className="font-mono text-caption1">colorStrokeFocus2</code>) để phân
        biệt tương tác bàn phím với chuột. Nhấn Tab để thử.
      </p>
      <Tile className="mt-L">
        <div className="flex flex-wrap items-center justify-center gap-XL">
          <div className="flex flex-col items-center gap-S">
            <Button appearance="primary">Rest</Button>
            <span className="text-caption1 text-foreground-3">Bình thường</span>
          </div>
          <div className="flex flex-col items-center gap-S">
            <Button appearance="primary" className="outline-2 outline-offset-1 outline-stroke-focus outline-solid">
              Focus
            </Button>
            <span className="text-caption1 text-foreground-3">Cùng màu, thêm nét focus</span>
          </div>
        </div>
      </Tile>
    </>
  );
}

const GRADIENTS = [
  { name: "Sakura", utility: "bg-gradient-sakura", text: "text-gradient-sakura", tokens: "colorGradientSakura1 → 3 · chữ ký Yugen", gradient: "sakura" as const },
  { name: "Dusk", utility: "bg-gradient-dusk", text: "text-gradient-dusk", tokens: "colorGradientDusk1 → 3 · hoàng hôn", gradient: "dusk" as const },
  { name: "Sunset", utility: "bg-gradient-sunset", text: "text-gradient-sunset", tokens: "colorGradientSunset1 → 3 · bình minh", gradient: "sunset" as const },
  { name: "Aurora", utility: "bg-gradient-aurora", text: "text-gradient-aurora", tokens: "colorGradientAurora1 → 3 · tông lạnh", gradient: "aurora" as const },
  { name: "Brand", utility: "bg-gradient-brand", text: "text-gradient-brand", tokens: "gradientBrand (theo data-brand)", gradient: "brand" as const },
];

function GradientSection() {
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        Gradient trong Fluent 2 là ngôn ngữ <strong className="font-semibold text-foreground-1">biểu cảm</strong>: xuất hiện
        ở minh hoạ, hero, trang giới thiệu — tạo cảm giác ánh sáng và chuyển động. Gradient{" "}
        <strong className="font-semibold text-foreground-1">không</strong> phải màu chức năng nên không bao giờ dùng cho
        control hay trạng thái.
      </p>

      <Tile className="mt-L flex flex-col items-center gap-S py-16">
        <p className="relative inline-block font-display text-[clamp(48px,7vw,96px)] leading-none font-normal">
          <GradientText gradient="sakura">Yugen UI</GradientText>
          <WavyUnderline gradient="sakura" className="absolute inset-x-0 -bottom-5 h-5" />
        </p>
      </Tile>

      <div className="mt-L grid gap-L sm:grid-cols-2 xl:grid-cols-3">
        {GRADIENTS.map((g) => (
          <div key={g.name} className="overflow-hidden rounded-2xlarge border border-stroke-2 bg-background-1">
            <div className={cn("h-28", g.utility)} />
            <div className="p-L">
              <p className={cn("font-display text-title2 font-semibold", g.text)}>{g.name}</p>
              <p className="mt-XS font-mono text-caption1 text-brand-foreground-1">
                {g.utility} · {g.text}
              </p>
              <p className="mt-XXS font-mono text-caption1 text-foreground-3">{g.tokens}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-L">
        <CodeBlock
          code={`import { GradientText, WavyUnderline, BloomArt } from "@/components/ui";

<h1 className="relative inline-block font-display text-display">
  <GradientText gradient="sakura">Yugen UI</GradientText>
  <WavyUnderline gradient="sakura" className="absolute inset-x-0 -bottom-4 h-5" />
</h1>

<div className="h-28 rounded-2xlarge bg-gradient-dusk" />`}
        />
      </div>

      <div className="mt-L">
        <DoDont
          dos={[
            "Dùng cho hero, minh hoạ, onboarding, empty state, trang marketing.",
            "Chữ gradient chỉ ở cỡ ≥ 28px (title2 trở lên) và mọi điểm màu đạt ≥ 3:1 với nền.",
            "Tối đa một điểm nhấn gradient trong một khung nhìn.",
            "Dùng token gradient có sẵn (có biến thể dark), không tự pha stop màu.",
          ]}
          donts={[
            "Không dùng gradient cho Button, Input, nav, Badge trạng thái hay bất kỳ control nào.",
            "Không dùng chữ gradient cho thân bài, nhãn, số liệu.",
            "Không dùng gradient để biểu thị trạng thái (thành công/lỗi).",
            "Không chạy animation gradient khi người dùng bật giảm chuyển động (prefers-reduced-motion).",
          ]}
        />
      </div>
    </>
  );
}

const CONTRAST_PAIRS: { fg: string; bg: string; kind: "text" | "ui" | "decor"; label: string }[] = [
  { fg: "colorNeutralForeground1", bg: "colorNeutralBackground1", kind: "text", label: "Chữ chính" },
  { fg: "colorNeutralForeground2", bg: "colorNeutralBackground1", kind: "text", label: "Chữ phụ" },
  { fg: "colorNeutralForeground3", bg: "colorNeutralBackground1", kind: "text", label: "Chữ mờ" },
  { fg: "colorNeutralForeground4", bg: "colorNeutralBackground1", kind: "text", label: "Placeholder" },
  { fg: "colorNeutralForegroundOnBrand", bg: "colorBrandBackground", kind: "text", label: "Chữ trên nút primary" },
  { fg: "colorBrandForegroundLink", bg: "colorNeutralBackground1", kind: "text", label: "Liên kết" },
  { fg: "colorBrandForeground2", bg: "colorBrandBackground2", kind: "text", label: "Chữ trên tint brand" },
  { fg: "colorStatusDangerForeground1", bg: "colorStatusDangerBackground1", kind: "text", label: "Lỗi" },
  { fg: "colorStatusSuccessForeground1", bg: "colorStatusSuccessBackground1", kind: "text", label: "Thành công" },
  { fg: "colorStatusWarningForeground1", bg: "colorStatusWarningBackground1", kind: "text", label: "Cảnh báo" },
  { fg: "colorNeutralStrokeAccessible", bg: "colorNeutralBackground1", kind: "ui", label: "Viền control (checkbox, đáy input)" },
  { fg: "colorCompoundBrandStroke", bg: "colorNeutralBackground1", kind: "ui", label: "Chỉ báo focus / chọn" },
  { fg: "colorNeutralStroke1", bg: "colorNeutralBackground1", kind: "decor", label: "Viền trang trí" },
  { fg: "colorNeutralForegroundDisabled", bg: "colorNeutralBackground1", kind: "decor", label: "Disabled" },
];

const REQUIRED = { text: 4.5, ui: 3, decor: 0 };

function ContrastRow({ fg, bg, kind, label, theme }: (typeof CONTRAST_PAIRS)[number] & { theme: string }) {
  const fgValue = useTokenValue(fg, theme);
  const bgValue = useTokenValue(bg, theme);
  const ratio = contrastRatio(fgValue, bgValue);
  const required = REQUIRED[kind];
  const pass = ratio !== null && ratio >= required;

  return (
    <tr className="border-b border-stroke-3 last:border-b-0">
      <td className="px-L py-S">
        <span
          className="inline-flex h-9 w-14 items-center justify-center rounded-medium border border-stroke-2 text-body2 font-semibold"
          style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
        >
          Aa
        </span>
      </td>
      <td className="px-L py-S">
        <p className="text-body1">{label}</p>
        <p className="font-mono text-caption2 text-foreground-3">
          {fg} / {bg}
        </p>
      </td>
      <td className="px-L py-S font-mono text-body1 tabular-nums">{ratio ? `${ratio.toFixed(2)}:1` : "—"}</td>
      <td className="px-L py-S">
        {kind === "decor" ? (
          <span className="text-caption1 text-foreground-3">Không yêu cầu</span>
        ) : (
          <span className={cn("inline-flex items-center gap-XS text-caption1 font-semibold", pass ? "text-success-foreground-1" : "text-danger-foreground-1")}>
            {pass ? <CheckmarkCircle16Filled /> : <DismissCircle16Filled />}
            {pass ? "Đạt" : "Không đạt"} {required}:1
          </span>
        )}
      </td>
    </tr>
  );
}

function AccessibilitySection({ theme }: { theme: string }) {
  return (
    <>
      <ol className="flex max-w-3xl list-decimal flex-col gap-S ps-L text-body2 text-foreground-2">
        <li>Đảm bảo tương phản đủ cho người thị lực kém hoặc mù màu: chữ ≥ 4.5:1 (chữ lớn ≥ 3:1), thành phần UI ≥ 3:1.</li>
        <li>Khi có thể, cho phép người dùng tự chọn bảng màu (light / dark / brand) phù hợp với họ.</li>
        <li>Không dùng màu làm cách truyền đạt duy nhất — luôn đi kèm chữ, icon hoặc hình dạng.</li>
      </ol>
      <p className="mt-L text-body1 text-foreground-3">
        Bảng dưới đây được tính <strong className="font-semibold text-foreground-1">trực tiếp</strong> từ token đang áp
        dụng — đổi theme ở góc trên để kiểm tra dark mode.
      </p>
      <div className="mt-S overflow-x-auto rounded-2xlarge border border-stroke-2 bg-background-1">
        <table className="w-full min-w-160 text-left">
          <thead>
            <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
              <th className="px-L py-S">Mẫu</th>
              <th className="px-L py-S">Cặp token</th>
              <th className="px-L py-S">Tỉ lệ</th>
              <th className="px-L py-S">WCAG AA</th>
            </tr>
          </thead>
          <tbody>
            {CONTRAST_PAIRS.map((p) => (
              <ContrastRow key={p.fg + p.bg} {...p} theme={theme} />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function Swatch({ token, utility, theme }: { token: string; utility: string; theme: string }) {
  const value = useTokenValue(token, theme);
  return (
    <div className="flex items-center gap-M rounded-xlarge border border-stroke-2 bg-background-1 p-S">
      <div className="size-12 shrink-0 rounded-large border border-stroke-2" style={{ background: `var(--${token})` }} />
      <div className="min-w-0">
        <p className="truncate font-mono text-[13px] font-semibold text-foreground-1">{token}</p>
        <p className="truncate font-mono text-caption1 text-foreground-3">
          {utility} · {value}
        </p>
      </div>
    </div>
  );
}

const TOKEN_GROUPS: { title: string; tokens: [string, string][] }[] = [
  {
    title: "Neutral",
    tokens: [
      ["colorNeutralForeground1", "text-foreground-1"],
      ["colorNeutralForeground2", "text-foreground-2"],
      ["colorNeutralForeground3", "text-foreground-3"],
      ["colorNeutralForegroundDisabled", "text-foreground-disabled"],
      ["colorNeutralBackground1", "bg-background-1"],
      ["colorNeutralBackground2", "bg-background-2"],
      ["colorNeutralBackground3", "bg-background-3"],
      ["colorSubtleBackgroundHover", "bg-subtle-hover"],
      ["colorNeutralStroke1", "border-stroke-1"],
      ["colorNeutralStroke2", "border-stroke-2"],
      ["colorNeutralStrokeAccessible", "border-stroke-accessible"],
      ["colorStrokeFocus2", "outline-stroke-focus"],
    ],
  },
  {
    title: "Brand",
    tokens: [
      ["colorBrandBackground", "bg-brand-background"],
      ["colorBrandBackgroundHover", "bg-brand-background-hover"],
      ["colorBrandBackgroundPressed", "bg-brand-background-pressed"],
      ["colorBrandBackground2", "bg-brand-background-2"],
      ["colorBrandBackground2Hover", "bg-brand-background-2-hover"],
      ["colorBrandForeground1", "text-brand-foreground-1"],
      ["colorBrandForeground2", "text-brand-foreground-2"],
      ["colorCompoundBrandStroke", "border-brand-stroke"],
    ],
  },
  {
    title: "Trạng thái",
    tokens: [
      ["colorStatusDangerBackground3", "bg-danger-background-3"],
      ["colorStatusDangerBackground1", "bg-danger-background-1"],
      ["colorStatusDangerForeground1", "text-danger-foreground-1"],
      ["colorStatusSuccessBackground3", "bg-success-background-3"],
      ["colorStatusSuccessBackground1", "bg-success-background-1"],
      ["colorStatusSuccessForeground1", "text-success-foreground-1"],
      ["colorStatusWarningBackground3", "bg-warning-background-3"],
      ["colorStatusWarningBackground1", "bg-warning-background-1"],
      ["colorStatusWarningForeground1", "text-warning-foreground-1"],
    ],
  },
];

function TokensSection({ theme }: { theme: string }) {
  return (
    <div className="flex flex-col gap-XXL">
      <p className="max-w-3xl text-body2 text-foreground-2">
        Mỗi giá trị trong bảng màu được lưu thành <strong className="font-semibold text-foreground-1">global token</strong>{" "}
        không ngữ cảnh. <strong className="font-semibold text-foreground-1">Alias token</strong> gắn ngữ cảnh để designer
        và developer chọn đúng màu mà không phải tra mã HEX. Component chỉ dùng utility map từ alias.
      </p>
      {TOKEN_GROUPS.map((group) => (
        <div key={group.title}>
          <h3 className="mb-M text-subtitle1 font-semibold">{group.title}</h3>
          <div className="grid gap-S md:grid-cols-2">
            {group.tokens.map(([token, utility]) => (
              <Swatch key={token} token={token} utility={utility} theme={theme} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/* ======================================================================= page */

export const COLOR_SECTIONS = [
  { id: "palettes", label: "Bảng màu Fluent" },
  { id: "neutral", label: "Neutral" },
  { id: "shared", label: "Shared & semantic" },
  { id: "brand", label: "Brand" },
  { id: "states", label: "Trạng thái tương tác" },
  { id: "gradient", label: "Gradient" },
  { id: "a11y", label: "Khả năng tiếp cận" },
  { id: "tokens", label: "Color tokens" },
];

export function ColorPage({ theme }: { theme: string }) {
  return (
    <>
      <PageHeader
        eyebrow="Ngôn ngữ thiết kế"
        title="Màu sắc"
        lead="Màu là công cụ để thể hiện phong cách, gợi cảm xúc và truyền đạt ý nghĩa. Bảng màu chuẩn hoá và cách dùng có chủ đích tạo nên trải nghiệm quen thuộc, dễ chịu và nhất quán."
      />
      <ColorMosaic />

      <div className="mt-XXL">
        <DocSection id="palettes" title="Bảng màu Fluent" description="Fluent định nghĩa ba bảng màu: neutral, shared và brand. Mỗi bảng đảm nhận một vai trò riêng.">
          <PalettesSection />
        </DocSection>
        <DocSection id="neutral" title="Neutral" description="Bảng neutral gồm đen, trắng và các sắc xám làm nền tảng cho giao diện: bề mặt, chữ, bố cục. Trong component, neutral thường biểu thị thay đổi trạng thái.">
          <NeutralSection />
        </DocSection>
        <DocSection id="shared" title="Shared & semantic">
          <SharedSection />
        </DocSection>
        <DocSection id="brand" title="Brand">
          <BrandSection />
        </DocSection>
        <DocSection id="states" title="Trạng thái tương tác">
          <StatesSection theme={theme} />
        </DocSection>
        <DocSection id="gradient" title="Gradient">
          <GradientSection />
        </DocSection>
        <DocSection id="a11y" title="Khả năng tiếp cận">
          <AccessibilitySection theme={theme} />
        </DocSection>
        <DocSection id="tokens" title="Color tokens">
          <TokensSection theme={theme} />
        </DocSection>
      </div>
    </>
  );
}
