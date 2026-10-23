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
import { useLocale, type Locale } from "../i18n";
import { docsPath } from "../router";

/* ======================================================================= helpers */

type Text = Record<Locale, string>;

/** Chọn chuỗi theo ngôn ngữ: `t("tiếng Việt", "English")`. */
function useT() {
  const { locale } = useLocale();
  return (vi: string, en: string) => (locale === "en" ? en : vi);
}

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
  return <div className={cn("overflow-hidden rounded-3xlarge bg-background-3 p-6", className)}>{children}</div>;
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
  { id: "sakura", label: { vi: "Sakura 桜 (mặc định Yugen)", en: "Sakura 桜 (Yugen default)" } },
  { id: "web", label: { vi: "Fluent Communication Blue", en: "Fluent Communication Blue" } },
  { id: "teams", label: { vi: "Teams / Dusk", en: "Teams / Dusk" } },
] as const;

const BRAND_STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];

/* ======================================================================= hero art */

const MOSAIC = ["teal", "blue", "lavender", "magenta", "cranberry", "dark-orange", "marigold", "green", "cyan", "berry", "purple", "orange"];

function ColorMosaic() {
  return (
    <div className="relative h-72 overflow-hidden rounded-3xlarge bg-linear-to-b from-background-3 to-background-5 perspective-[1400px]">
      <div className="absolute top-1/2 left-1/2 grid w-190 -translate-x-1/2 -translate-y-1/2 grid-cols-10 gap-2 transform-[rotateX(58deg)_rotateZ(-36deg)]">
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
  const t = useT();
  const cards = [
    {
      title: "Neutral",
      text: t("Đen, trắng và xám — nền tảng cho bề mặt, chữ và bố cục.", "Black, white and grays: the base for surfaces, text and layout."),
      swatches: [100, 94, 82, 60, 38, 14].map((g) => (g === 100 ? "var(--white)" : `var(--grey-${g})`)),
    },
    {
      title: "Shared",
      text: t("Màu dùng chung toàn M365 cho avatar, lịch, badge và trạng thái.", "Colors shared across Microsoft 365 for avatars, calendars, badges and status."),
      swatches: ["green", "teal", "blue", "lavender", "magenta", "dark-orange"].map((h) => `var(--shared-${h})`),
    },
    {
      title: "Brand",
      text: t("Màu nhận diện sản phẩm cho hành động chính và trạng thái chọn.", "The product's identity color, for primary actions and selected states."),
      swatches: [40, 60, 80, 100, 130, 160].map((s) => `var(--brand-${s})`),
    },
  ];
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {cards.map((c) => (
        <div key={c.title} className="rounded-2xlarge border border-stroke-2 bg-background-1 p-4">
          <div className="flex h-12 overflow-hidden rounded-large">
            {c.swatches.map((s) => (
              <span key={s} className="flex-1" style={{ background: s }} />
            ))}
          </div>
          <p className="mt-3 text-subtitle2 font-semibold">{c.title}</p>
          <p className="mt-1 text-body1 text-foreground-2">{c.text}</p>
        </div>
      ))}
    </div>
  );
}

function NeutralSection() {
  const t = useT();
  return (
    <>
      <Tile className="p-8">
        <div className="flex h-56 overflow-hidden rounded-3xlarge shadow-4">
          {NEUTRAL_STRIP.map((g) => (
            <span
              key={g}
              className="flex flex-1 items-end justify-center pb-2 font-mono text-[10px]"
              style={{
                background: g === 100 ? "var(--white)" : g === 0 ? "var(--black)" : `var(--grey-${g})`,
                // Nhãn 10px cần ≥ 4.5:1: nền từ grey-48 trở lên dùng chữ đen, tối hơn dùng chữ trắng.
                color: g >= 48 ? "var(--black)" : "var(--white)",
              }}
            >
              {g === 100 ? "W" : g === 0 ? "B" : g}
            </span>
          ))}
        </div>
      </Tile>

      <h3 className="mt-6 text-title3 font-semibold">{t("Phân cấp thị giác bằng neutral", "Visual hierarchy with neutrals")}</h3>
      <p className="mt-2 max-w-3xl text-body2 text-foreground-2">
        {t(
          "Dùng neutral sáng hơn cho bề mặt cần tập trung. Mắt người dùng sẽ được dẫn tới vùng quan trọng nhất mà không cần thêm màu.",
          "Use lighter neutrals for surfaces that need attention. The eye goes to the most important area without any added color.",
        )}
      </p>
      <Tile className="mt-4">
        <div className="rounded-2xlarge bg-background-4 p-5">
          <p className="mb-2 font-mono text-caption1 text-foreground-3">bg-background-4 · {t("nền ứng dụng", "app background")}</p>
          <div className="rounded-xlarge bg-background-2 p-5 shadow-2">
            <p className="mb-2 font-mono text-caption1 text-foreground-3">bg-background-2 · {t("vùng nội dung", "content area")}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-medium bg-background-1 p-4 shadow-4">
                <p className="text-body1 font-semibold">bg-background-1 + shadow-4</p>
                <p className="mt-1 text-caption1 text-foreground-3">{t("Bề mặt trọng tâm: Card, Dialog", "Focus surfaces: Card, Dialog")}</p>
              </div>
              <div className="rounded-medium bg-background-1 p-4 shadow-4">
                <p className="text-body1 font-semibold">{t("Sáng nhất = quan trọng nhất", "Lightest = most important")}</p>
                <p className="mt-1 text-caption1 text-foreground-3">{t("Tối dần về phía nền", "Darker toward the background")}</p>
              </div>
            </div>
          </div>
        </div>
      </Tile>
    </>
  );
}

function SharedSection() {
  const { locale } = useLocale();
  const t = useT();
  const en = locale === "en";
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        {en ? (
          <>
            Shared colors are the same across Microsoft 365. High-value components (avatar, calendar, badge) use them so people
            recognize a function from one product to the next. <strong className="font-semibold text-foreground-1">Use them sparingly</strong>,
            only to highlight important areas.
          </>
        ) : (
          <>
            Shared color đồng bộ trên toàn bộ M365, dùng trong component giá trị cao (avatar, lịch, badge) để người dùng nhận
            ra chức năng giữa các sản phẩm. <strong className="font-semibold text-foreground-1">Dùng tiết kiệm</strong> — chỉ
            để nhấn vào vùng quan trọng.
          </>
        )}
      </p>
      <Tile className="mt-4">
        <div className="mx-auto grid max-w-3xl grid-cols-12 overflow-hidden rounded-xlarge shadow-8">
          {SHARED_ROWS.map(([pct, withColor]) =>
            SHARED_GRID.map((hue) => (
              <span key={`${hue}-${pct}-${withColor}`} className="aspect-4/3" style={{ background: mix(hue, pct, withColor) }} title={hue} />
            )),
          )}
        </div>
      </Tile>

      <h3 className="mt-6 text-title3 font-semibold">{t("Shared color trong dark mode", "Shared colors in dark mode")}</h3>
      <p className="mt-2 max-w-3xl text-body2 text-foreground-2">
        {t(
          "Ở dark mode, shared color dịch chuyển độ bão hoà và độ sáng để giảm mỏi mắt và đảm bảo tương phản — không chỉ đảo ngược màu.",
          "In dark mode, shared colors shift in saturation and lightness to reduce eye strain and keep enough contrast. They are not simply inverted.",
        )}
      </p>
      <div className="mt-4 grid overflow-hidden rounded-3xlarge sm:grid-cols-2">
        <div data-theme="light" className="flex justify-center bg-background-3 p-6">
          <div className="grid w-full max-w-56 grid-cols-4 overflow-hidden rounded-xlarge shadow-8">
            {SHIFT_HUES.map((hue) =>
              [55, 70, 85, 100].map((pct) => <span key={hue + pct} className="aspect-square" style={{ background: mix(hue, pct, "black") }} />),
            )}
          </div>
        </div>
        <div data-theme="dark" className="flex justify-center bg-background-2 p-6">
          <div className="grid w-full max-w-56 grid-cols-4 overflow-hidden rounded-xlarge shadow-8">
            {SHIFT_HUES.map((hue) =>
              [75, 62, 50, 38].map((pct) => <span key={hue + pct} className="aspect-square" style={{ background: mix(hue, pct, "white") }} />),
            )}
          </div>
        </div>
      </div>

      <h3 className="mt-6 text-title3 font-semibold">{t("Màu ngữ nghĩa (semantic)", "Semantic colors")}</h3>
      <p className="mt-2 max-w-3xl text-body2 text-foreground-2">
        {t(
          "Một số shared color được dành riêng để truyền đạt phản hồi, trạng thái hoặc mức khẩn cấp, dựa trên liên tưởng thực tế: ",
          "Some shared colors are reserved for feedback, status or urgency, based on real-world associations: ",
        )}
        <span className="text-danger-foreground-1">{t("đỏ = nguy hiểm", "red = danger")}</span>,{" "}
        <span className="text-warning-foreground-1">{t("vàng/cam = thận trọng", "yellow/orange = caution")}</span>,{" "}
        <span className="text-success-foreground-1">{t("xanh lá = tích cực", "green = positive")}</span>
        {t(". Luôn đi kèm icon/chữ để giảm tải nhận thức.", ". Always pair them with an icon or text to reduce cognitive load.")}
      </p>
      <Tile className="mt-4">
        <div className="flex flex-wrap items-center justify-center gap-8">
          <CheckmarkCircle48Regular className="size-20 text-success-foreground-1" />
          <ErrorCircle48Regular className="size-20 text-danger-foreground-1" />
          <Info48Regular className="size-20 text-brand-foreground-1" />
          <Warning48Regular className="size-20 text-warning-foreground-1" />
        </div>
      </Tile>
      <div className="mt-4">
        <DoDont
          dos={
            en
              ? [
                  "Use semantic colors for important messages: errors, warnings, success.",
                  "Always pair them with an icon and text (MessageBar, a Badge with a label).",
                  "Be consistent: the same status always gets the same color.",
                ]
              : [
                  "Dùng màu ngữ nghĩa cho thông điệp quan trọng: lỗi, cảnh báo, thành công.",
                  "Luôn ghép với icon và chữ (MessageBar, Badge có nhãn).",
                  "Dùng nhất quán: cùng một trạng thái luôn cùng một màu.",
                ]
          }
          donts={
            en
              ? [
                  "Don't use semantic colors for decoration (a red button for looks, a green heading).",
                  "Don't make color the only signal (a red input with no message).",
                ]
              : [
                  "Không dùng màu ngữ nghĩa để trang trí (nút đỏ cho đẹp, tiêu đề xanh lá).",
                  "Không để màu là tín hiệu duy nhất (chỉ tô đỏ ô nhập mà không có thông báo).",
                ]
          }
        />
      </div>
    </>
  );
}

function BrandSection() {
  const { locale } = useLocale();
  const t = useT();
  const en = locale === "en";
  const [brand, setBrand] = React.useState<(typeof BRANDS)[number]["id"]>("sakura");
  return (
    <>
      {en ? (
        <>
          <p className="max-w-3xl text-body2 text-foreground-2">
            The brand color makes a product recognizable at a glance. Apply it to <strong className="font-semibold text-foreground-1">specific areas</strong>{" "}
            to add emphasis and help people find their way. Each brand is a 16-step ramp; switching brands only takes{" "}
            <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">data-brand</code>.
          </p>
          <p className="mt-2 max-w-3xl text-body2 text-foreground-2">
            The default Yugen UI brand is <strong className="font-semibold text-brand-foreground-1">Sakura 桜 #C2347A</strong>, a deep
            cherry blossom pink. It reaches <strong className="font-semibold text-foreground-1">5.16:1</strong> with white text, and its hue
            sits about 30° away from <span className="text-danger-foreground-1">danger</span> red, so a primary button is never mistaken for a
            destructive action. The light steps 130–160 are the petal tones (#FFA7C9 → #FDEDF3).
          </p>
        </>
      ) : (
        <>
          <p className="max-w-3xl text-body2 text-foreground-2">
            Brand color tạo nhận diện tức thì cho sản phẩm. Áp dụng có chủ đích vào <strong className="font-semibold text-foreground-1">vùng cụ thể</strong> để
            tạo điểm nhấn và giữ người dùng định hướng. Mỗi brand là một ramp 16 bậc; đổi brand chỉ cần{" "}
            <code className="rounded-small bg-background-4 px-1 font-mono text-caption1">data-brand</code>.
          </p>
          <p className="mt-2 max-w-3xl text-body2 text-foreground-2">
            Brand mặc định của Yugen UI là <strong className="font-semibold text-brand-foreground-1">Sakura 桜 #C2347A</strong> — hồng
            anh đào đậm, tương phản <strong className="font-semibold text-foreground-1">5.16:1</strong> với chữ trắng, và lệch
            hue ~30° so với đỏ <span className="text-danger-foreground-1">danger</span> để nút chính không bao giờ bị nhầm với
            hành động phá huỷ. Bậc nhạt 130–160 chính là sắc cánh hoa (#FFA7C9 → #FDEDF3).
          </p>
        </>
      )}

      <div className="mt-4 flex flex-wrap gap-2" role="radiogroup" aria-label={t("Chọn brand", "Choose a brand")}>
        {BRANDS.map((b) => (
          <button
            key={b.id}
            type="button"
            role="radio"
            aria-checked={brand === b.id}
            onClick={() => setBrand(b.id)}
            className={cn(
              "inline-flex h-8 items-center gap-2 rounded-circular border px-3 text-body1 transition-colors duration-faster",
              brand === b.id ? "border-brand-stroke bg-brand-background-2 font-semibold text-brand-foreground-2" : "border-stroke-1 hover:bg-subtle-hover",
            )}
          >
            <span data-brand={b.id} className="size-3 rounded-circular bg-brand-background" />
            {b.label[locale]}
          </button>
        ))}
      </div>

      <div data-brand={brand} className="mt-4">
        <div className="flex overflow-hidden rounded-2xlarge border border-stroke-2">
          {BRAND_STEPS.map((step) => (
            <div key={step} className="flex h-24 flex-1 items-end justify-center pb-2" style={{ background: `var(--brand-${step})` }}>
              {/* brand-90 của mọi brand chỉ ~3.7:1 với chữ trắng → từ bậc 90 dùng chữ đen (≥ 4.5:1 cho nhãn 10px). */}
              <span className={cn("font-mono text-[10px]", step < 90 ? "text-(--white)" : "text-(--black)")}>{step}</span>
            </div>
          ))}
        </div>

        <h3 className="mt-6 text-title3 font-semibold">{t("Brand dùng ở đâu", "Where the brand goes")}</h3>
        <Tile className="mt-4">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="flex flex-col items-start gap-3">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{t("Hành động chính (CTA)", "Primary action (CTA)")}</p>
              <div className="flex gap-2">
                <Button appearance="primary">{t("Bắt đầu", "Get started")}</Button>
                <Button>{t("Để sau", "Not now")}</Button>
              </div>
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{t("Liên kết", "Link")}</p>
              <a href={docsPath("/foundations/color")} className="text-body1 text-link underline-offset-2 hover:text-link-hover hover:underline">
                {t("Xem hướng dẫn màu", "Read the color guide")}
              </a>
            </div>
            <div className="flex flex-col items-start gap-3">
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{t("Trạng thái chọn / bật", "Selected / on state")}</p>
              <Tabs defaultValue="a">
                <TabsList size="small">
                  <TabsTrigger value="a">{t("Đang chọn", "Selected")}</TabsTrigger>
                  <TabsTrigger value="b">{t("Khác", "Other")}</TabsTrigger>
                </TabsList>
              </Tabs>
              <div className="flex items-center gap-4">
                <Checkbox label={t("Đã chọn", "Checked")} defaultChecked />
                <Switch label={t("Bật", "On")} defaultChecked />
              </div>
              <p className="text-caption1 font-semibold tracking-wide text-foreground-3 uppercase">{t("Chỉ báo focus", "Focus indicator")}</p>
              <Input placeholder={t("Click để thấy thanh brand", "Click to see the brand bar")} rootClassName="w-64" />
            </div>
          </div>
        </Tile>
      </div>

      <div className="mt-4">
        <DoDont
          dos={
            en
              ? [
                  "Use the brand for primary buttons and CTAs, selected and on states, focus and links.",
                  "Keep the brand to small areas so it stays an accent.",
                  "Use the tint step (Background2) for light selection areas such as nav items and tint badges.",
                ]
              : [
                  "Dùng brand cho nút/CTA chính, trạng thái chọn, bật, focus và liên kết.",
                  "Giữ brand ở diện tích nhỏ để nó luôn là điểm nhấn.",
                  "Dùng bậc tint (Background2) cho vùng chọn nhạt như nav item, badge tint.",
                ]
          }
          donts={
            en
              ? [
                  "Don't spread the brand over large areas (header, sidebar, page background). It weakens the hierarchy and makes navigation harder.",
                  "Don't use the brand for body text or decorative headings.",
                  "Don't mix two brands in the same content area.",
                ]
              : [
                  "Không phủ brand lên diện tích lớn (header, sidebar, nền trang) — làm loãng phân cấp và khó điều hướng.",
                  "Không dùng brand cho chữ thân bài hoặc tiêu đề trang trí.",
                  "Không trộn hai brand trong cùng một vùng nội dung.",
                ]
          }
        />
      </div>
      <div className="mt-4">
        <CodeBlock
          code={
            en
              ? `// index.html: change the brand for the whole app
<html data-brand="web">

// One region only (also set data-theme if it sits inside a different theme)
<section data-theme="light" data-brand="teams">...</section>`
              : `// index.html — đổi brand cho toàn ứng dụng
<html data-brand="web">

// Một vùng riêng (đặt kèm data-theme nếu nằm trong theme khác)
<section data-theme="light" data-brand="teams">...</section>`
          }
        />
      </div>
    </>
  );
}

const TRY: Text = { vi: "Thử hover / nhấn", en: "Try hover / press" };

const STATE_ROWS = [
  {
    name: "Primary",
    states: [
      ["Rest", "colorBrandBackground"],
      ["Hover", "colorBrandBackgroundHover"],
      ["Pressed", "colorBrandBackgroundPressed"],
    ],
    demo: (l: Locale) => <Button appearance="primary">{TRY[l]}</Button>,
  },
  {
    name: "Secondary",
    states: [
      ["Rest", "colorNeutralBackground1"],
      ["Hover", "colorNeutralBackground1Hover"],
      ["Pressed", "colorNeutralBackground1Pressed"],
    ],
    demo: (l: Locale) => <Button>{TRY[l]}</Button>,
  },
  {
    name: "Subtle",
    states: [
      ["Rest", "transparent"],
      ["Hover", "colorSubtleBackgroundHover"],
      ["Pressed", "colorSubtleBackgroundPressed"],
    ],
    demo: (l: Locale) => <Button appearance="subtle">{TRY[l]}</Button>,
  },
  {
    name: "Selected (tint)",
    states: [
      ["Rest", "colorBrandBackground2"],
      ["Hover", "colorBrandBackground2Hover"],
      ["Pressed", "colorBrandBackground2Pressed"],
    ],
    demo: (l: Locale) => <Badge appearance="tint">{l === "en" ? "Selected" : "Đang chọn"}</Badge>,
  },
] as const;

function StateSwatch({ token, theme }: { token: string; theme: string }) {
  const value = useTokenValue(token, theme);
  const isTransparent = token === "transparent";
  return (
    <div className="flex min-w-0 items-center gap-2">
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
  const { locale } = useLocale();
  const t = useT();
  const en = locale === "en";
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        {en ? (
          <>
            On the web, components <strong className="font-semibold text-foreground-1">get darker as you interact</strong>: lightest at rest,
            darker on hover, darkest when pressed or selected. (Windows does the opposite: controls get lighter as you interact.)
          </>
        ) : (
          <>
            Trên web, component <strong className="font-semibold text-foreground-1">đậm dần khi tương tác</strong>: sáng nhất
            khi nghỉ, đậm hơn khi hover, đậm nhất khi nhấn/chọn. (Windows làm ngược lại: control sáng dần khi tương tác.)
          </>
        )}
      </p>
      <div className="mt-4 overflow-x-auto rounded-2xlarge border border-stroke-2 bg-background-1">
        <table className="w-full min-w-170 table-fixed text-left text-body1">
          <thead>
            <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
              <th className="w-28 px-4 py-2">{t("Kiểu", "Appearance")}</th>
              <th className="px-4 py-2">Rest</th>
              <th className="px-4 py-2">Hover</th>
              <th className="px-4 py-2">Pressed</th>
              <th className="w-44 px-4 py-2">{t("Thử", "Try it")}</th>
            </tr>
          </thead>
          <tbody>
            {STATE_ROWS.map((row) => (
              <tr key={row.name} className="border-b border-stroke-3 last:border-b-0">
                <td className="px-4 py-3 font-semibold">{row.name}</td>
                {row.states.map(([label, token]) => (
                  <td key={label} className="px-4 py-3">
                    <StateSwatch token={token} theme={theme} />
                  </td>
                ))}
                <td className="px-4 py-3">{row.demo(locale)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h3 className="mt-6 text-title3 font-semibold">{t("Trạng thái focus", "Focus state")}</h3>
      <p className="mt-2 max-w-3xl text-body2 text-foreground-2">
        {en ? (
          <>
            With keyboard focus, <strong className="font-semibold text-foreground-1">the control color stays the same</strong>. Instead the
            control gets a thicker outline (2px <code className="font-mono text-caption1">colorStrokeFocus2</code>), so keyboard interaction
            looks different from mouse interaction. Press Tab to try it.
          </>
        ) : (
          <>
            Khi focus bằng bàn phím, <strong className="font-semibold text-foreground-1">màu control không đổi</strong> — thay
            vào đó khung ngoài có nét dày hơn (2px <code className="font-mono text-caption1">colorStrokeFocus2</code>) để phân
            biệt tương tác bàn phím với chuột. Nhấn Tab để thử.
          </>
        )}
      </p>
      <Tile className="mt-4">
        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="flex flex-col items-center gap-2">
            <Button appearance="primary">Rest</Button>
            <span className="text-caption1 text-foreground-3">{t("Bình thường", "Normal")}</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Button appearance="primary" className="outline-2 outline-offset-1 outline-stroke-focus outline-solid">
              Focus
            </Button>
            <span className="text-caption1 text-foreground-3">{t("Cùng màu, thêm nét focus", "Same color, plus the focus outline")}</span>
          </div>
        </div>
      </Tile>
    </>
  );
}

const GRADIENTS = [
  {
    name: "Sakura",
    utility: "bg-gradient-sakura",
    text: "text-gradient-sakura",
    tokens: { vi: "colorGradientSakura1 → 3 · chữ ký Yugen", en: "colorGradientSakura1 → 3 · Yugen signature" },
    gradient: "sakura" as const,
  },
  {
    name: "Dusk",
    utility: "bg-gradient-dusk",
    text: "text-gradient-dusk",
    tokens: { vi: "colorGradientDusk1 → 3 · chạng vạng", en: "colorGradientDusk1 → 3 · twilight" },
    gradient: "dusk" as const,
  },
  {
    name: "Sunset",
    utility: "bg-gradient-sunset",
    text: "text-gradient-sunset",
    tokens: { vi: "colorGradientSunset1 → 3 · hoàng hôn", en: "colorGradientSunset1 → 3 · sunset" },
    gradient: "sunset" as const,
  },
  {
    name: "Aurora",
    utility: "bg-gradient-aurora",
    text: "text-gradient-aurora",
    tokens: { vi: "colorGradientAurora1 → 3 · tông lạnh", en: "colorGradientAurora1 → 3 · cool tones" },
    gradient: "aurora" as const,
  },
  {
    name: "Brand",
    utility: "bg-gradient-brand",
    text: "text-gradient-brand",
    tokens: { vi: "gradientBrand (theo data-brand)", en: "gradientBrand (follows data-brand)" },
    gradient: "brand" as const,
  },
];

function GradientSection() {
  const { locale } = useLocale();
  const en = locale === "en";
  return (
    <>
      <p className="max-w-3xl text-body2 text-foreground-2">
        {en ? (
          <>
            In Fluent 2, gradients are <strong className="font-semibold text-foreground-1">expressive</strong>: they appear in illustrations,
            heroes and landing pages to suggest light and movement. Gradients are{" "}
            <strong className="font-semibold text-foreground-1">not</strong> functional colors, so never use them for controls or states.
          </>
        ) : (
          <>
            Gradient trong Fluent 2 là ngôn ngữ <strong className="font-semibold text-foreground-1">biểu cảm</strong>: xuất hiện
            ở minh hoạ, hero, trang giới thiệu — tạo cảm giác ánh sáng và chuyển động. Gradient{" "}
            <strong className="font-semibold text-foreground-1">không</strong> phải màu chức năng nên không bao giờ dùng cho
            control hay trạng thái.
          </>
        )}
      </p>

      <Tile className="mt-4 flex flex-col items-center gap-2 py-16">
        <p className="relative inline-block font-display text-[clamp(48px,7vw,96px)] leading-none font-normal">
          <GradientText gradient="sakura">Yugen UI</GradientText>
          <WavyUnderline gradient="sakura" className="absolute inset-x-0 -bottom-5 h-5" />
        </p>
      </Tile>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {GRADIENTS.map((g) => (
          <div key={g.name} className="overflow-hidden rounded-2xlarge border border-stroke-2 bg-background-1">
            <div className={cn("h-28", g.utility)} />
            <div className="p-4">
              <p className={cn("font-display text-title2 font-semibold", g.text)}>{g.name}</p>
              <p className="mt-1 font-mono text-caption1 text-brand-foreground-1">
                {g.utility} · {g.text}
              </p>
              <p className="mt-0.5 font-mono text-caption1 text-foreground-3">{g.tokens[locale]}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4">
        <CodeBlock
          code={`import { GradientText, WavyUnderline, BloomArt } from "@/components/ui";

<h1 className="relative inline-block font-display text-display">
  <GradientText gradient="sakura">Yugen UI</GradientText>
  <WavyUnderline gradient="sakura" className="absolute inset-x-0 -bottom-4 h-5" />
</h1>

<div className="h-28 rounded-2xlarge bg-gradient-dusk" />`}
        />
      </div>

      <div className="mt-4">
        <DoDont
          dos={
            en
              ? [
                  "Use them for heroes, illustrations, onboarding, empty states and marketing pages.",
                  "Use gradient text only at 28px or larger (title2 and up), with every color stop at 3:1 or more against the background.",
                  "Use at most one gradient accent per view.",
                  "Use the gradient tokens (they have dark variants) instead of mixing your own color stops.",
                ]
              : [
                  "Dùng cho hero, minh hoạ, onboarding, empty state, trang marketing.",
                  "Chữ gradient chỉ ở cỡ ≥ 28px (title2 trở lên) và mọi điểm màu đạt ≥ 3:1 với nền.",
                  "Tối đa một điểm nhấn gradient trong một khung nhìn.",
                  "Dùng token gradient có sẵn (có biến thể dark), không tự pha stop màu.",
                ]
          }
          donts={
            en
              ? [
                  "Don't use gradients on Button, Input, nav, status Badge or any other control.",
                  "Don't use gradient text for body text, labels or numbers.",
                  "Don't use gradients to show status (success / error).",
                  "Don't animate gradients when the user has turned on reduced motion (prefers-reduced-motion).",
                ]
              : [
                  "Không dùng gradient cho Button, Input, nav, Badge trạng thái hay bất kỳ control nào.",
                  "Không dùng chữ gradient cho thân bài, nhãn, số liệu.",
                  "Không dùng gradient để biểu thị trạng thái (thành công/lỗi).",
                  "Không chạy animation gradient khi người dùng bật giảm chuyển động (prefers-reduced-motion).",
                ]
          }
        />
      </div>
    </>
  );
}

const CONTRAST_PAIRS: { fg: string; bg: string; kind: "text" | "ui" | "decor"; label: Text }[] = [
  { fg: "colorNeutralForeground1", bg: "colorNeutralBackground1", kind: "text", label: { vi: "Chữ chính", en: "Primary text" } },
  { fg: "colorNeutralForeground2", bg: "colorNeutralBackground1", kind: "text", label: { vi: "Chữ phụ", en: "Secondary text" } },
  { fg: "colorNeutralForeground3", bg: "colorNeutralBackground1", kind: "text", label: { vi: "Chữ mờ", en: "Muted text" } },
  { fg: "colorNeutralForeground4", bg: "colorNeutralBackground1", kind: "text", label: { vi: "Placeholder", en: "Placeholder" } },
  { fg: "colorNeutralForegroundOnBrand", bg: "colorBrandBackground", kind: "text", label: { vi: "Chữ trên nút primary", en: "Text on a primary button" } },
  { fg: "colorBrandForegroundLink", bg: "colorNeutralBackground1", kind: "text", label: { vi: "Liên kết", en: "Link" } },
  { fg: "colorBrandForeground2", bg: "colorBrandBackground2", kind: "text", label: { vi: "Chữ trên tint brand", en: "Text on the brand tint" } },
  { fg: "colorStatusDangerForeground1", bg: "colorStatusDangerBackground1", kind: "text", label: { vi: "Lỗi", en: "Error" } },
  { fg: "colorStatusSuccessForeground1", bg: "colorStatusSuccessBackground1", kind: "text", label: { vi: "Thành công", en: "Success" } },
  { fg: "colorStatusWarningForeground1", bg: "colorStatusWarningBackground1", kind: "text", label: { vi: "Cảnh báo", en: "Warning" } },
  {
    fg: "colorNeutralStrokeAccessible",
    bg: "colorNeutralBackground1",
    kind: "ui",
    label: { vi: "Viền control (checkbox, đáy input)", en: "Control border (checkbox, input underline)" },
  },
  { fg: "colorCompoundBrandStroke", bg: "colorNeutralBackground1", kind: "ui", label: { vi: "Chỉ báo focus / chọn", en: "Focus / selection indicator" } },
  { fg: "colorNeutralStroke1", bg: "colorNeutralBackground1", kind: "decor", label: { vi: "Viền trang trí", en: "Decorative border" } },
  { fg: "colorNeutralForegroundDisabled", bg: "colorNeutralBackground1", kind: "decor", label: { vi: "Disabled", en: "Disabled" } },
];

const REQUIRED = { text: 4.5, ui: 3, decor: 0 };

function ContrastRow({ fg, bg, kind, label, theme }: (typeof CONTRAST_PAIRS)[number] & { theme: string }) {
  const { locale } = useLocale();
  const t = useT();
  const fgValue = useTokenValue(fg, theme);
  const bgValue = useTokenValue(bg, theme);
  const ratio = contrastRatio(fgValue, bgValue);
  const required = REQUIRED[kind];
  const pass = ratio !== null && ratio >= required;

  return (
    <tr className="border-b border-stroke-3 last:border-b-0">
      <td className="px-4 py-2">
        <span
          // Mẫu "Aa" vẽ đúng cặp token; hàng decor (viền trang trí, disabled) cố ý tương phản thấp — xem e2e/a11y-allowlist.ts.
          data-contrast-sample={kind}
          className="inline-flex h-9 w-14 items-center justify-center rounded-medium border border-stroke-2 text-body2 font-semibold"
          style={{ background: `var(--${bg})`, color: `var(--${fg})` }}
        >
          Aa
        </span>
      </td>
      <td className="px-4 py-2">
        <p className="text-body1">{label[locale]}</p>
        <p className="font-mono text-caption2 text-foreground-3">
          {fg} / {bg}
        </p>
      </td>
      <td className="px-4 py-2 font-mono text-body1 tabular-nums">{ratio ? `${ratio.toFixed(2)}:1` : "—"}</td>
      <td className="px-4 py-2">
        {kind === "decor" ? (
          <span className="text-caption1 text-foreground-3">{t("Không yêu cầu", "Not required")}</span>
        ) : (
          <span className={cn("inline-flex items-center gap-1 text-caption1 font-semibold", pass ? "text-success-foreground-1" : "text-danger-foreground-1")}>
            {pass ? <CheckmarkCircle16Filled /> : <DismissCircle16Filled />}
            {pass ? t("Đạt", "Pass") : t("Không đạt", "Fail")} {required}:1
          </span>
        )}
      </td>
    </tr>
  );
}

function AccessibilitySection({ theme }: { theme: string }) {
  const { locale } = useLocale();
  const t = useT();
  return (
    <>
      <ol className="flex max-w-3xl list-decimal flex-col gap-2 ps-4 text-body2 text-foreground-2">
        <li>
          {t(
            "Đảm bảo tương phản đủ cho người thị lực kém hoặc mù màu: chữ ≥ 4.5:1 (chữ lớn ≥ 3:1), thành phần UI ≥ 3:1.",
            "Keep enough contrast for people with low vision or color blindness: text ≥ 4.5:1 (large text ≥ 3:1), UI components ≥ 3:1.",
          )}
        </li>
        <li>
          {t(
            "Khi có thể, cho phép người dùng tự chọn bảng màu (light / dark / brand) phù hợp với họ.",
            "Where you can, let people pick the color scheme that suits them (light / dark / brand).",
          )}
        </li>
        <li>
          {t(
            "Không dùng màu làm cách truyền đạt duy nhất — luôn đi kèm chữ, icon hoặc hình dạng.",
            "Don't use color as the only way to convey meaning. Always add text, an icon or a shape.",
          )}
        </li>
      </ol>
      <p className="mt-4 text-body1 text-foreground-3">
        {locale === "en" ? (
          <>
            The table below is computed <strong className="font-semibold text-foreground-1">live</strong> from the current tokens. Switch the
            theme at the top to check dark mode.
          </>
        ) : (
          <>
            Bảng dưới đây được tính <strong className="font-semibold text-foreground-1">trực tiếp</strong> từ token đang áp
            dụng — đổi theme ở góc trên để kiểm tra dark mode.
          </>
        )}
      </p>
      {/* tabIndex: bảng cuộn ngang được bằng bàn phím (axe scrollable-region-focusable). */}
      <div tabIndex={0} className="mt-2 overflow-x-auto rounded-2xlarge border border-stroke-2 bg-background-1">
        <table className="w-full min-w-160 text-left">
          <thead>
            <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
              <th className="px-4 py-2">{t("Mẫu", "Sample")}</th>
              <th className="px-4 py-2">{t("Cặp token", "Token pair")}</th>
              <th className="px-4 py-2">{t("Tỉ lệ", "Ratio")}</th>
              <th className="px-4 py-2">WCAG AA</th>
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
    <div className="flex items-center gap-3 rounded-xlarge border border-stroke-2 bg-background-1 p-2">
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

const TOKEN_GROUPS: { title: Text; tokens: [string, string][] }[] = [
  {
    title: { vi: "Neutral", en: "Neutral" },
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
    title: { vi: "Brand", en: "Brand" },
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
    title: { vi: "Trạng thái", en: "Status" },
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
  const { locale } = useLocale();
  return (
    <div className="flex flex-col gap-6">
      <p className="max-w-3xl text-body2 text-foreground-2">
        {locale === "en" ? (
          <>
            Each palette value is stored as a context-free <strong className="font-semibold text-foreground-1">global token</strong>.{" "}
            <strong className="font-semibold text-foreground-1">Alias tokens</strong> add context, so designers and developers can pick the
            right color without looking up hex codes. Components only use utilities mapped from aliases.
          </>
        ) : (
          <>
            Mỗi giá trị trong bảng màu được lưu thành <strong className="font-semibold text-foreground-1">global token</strong>{" "}
            không ngữ cảnh. <strong className="font-semibold text-foreground-1">Alias token</strong> gắn ngữ cảnh để designer
            và developer chọn đúng màu mà không phải tra mã HEX. Component chỉ dùng utility map từ alias.
          </>
        )}
      </p>
      {TOKEN_GROUPS.map((group) => (
        <div key={group.title.en}>
          <h3 className="mb-3 text-subtitle1 font-semibold">{group.title[locale]}</h3>
          <div className="grid gap-2 md:grid-cols-2">
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

export const COLOR_SECTIONS: Record<Locale, { id: string; label: string }[]> = {
  vi: [
    { id: "palettes", label: "Bảng màu Fluent" },
    { id: "neutral", label: "Neutral" },
    { id: "shared", label: "Shared & semantic" },
    { id: "brand", label: "Brand" },
    { id: "states", label: "Trạng thái tương tác" },
    { id: "gradient", label: "Gradient" },
    { id: "a11y", label: "Khả năng tiếp cận" },
    { id: "tokens", label: "Color tokens" },
  ],
  en: [
    { id: "palettes", label: "Fluent palettes" },
    { id: "neutral", label: "Neutral" },
    { id: "shared", label: "Shared & semantic" },
    { id: "brand", label: "Brand" },
    { id: "states", label: "Interaction states" },
    { id: "gradient", label: "Gradient" },
    { id: "a11y", label: "Accessibility" },
    { id: "tokens", label: "Color tokens" },
  ],
};

export function ColorPage({ theme }: { theme: string }) {
  const { locale } = useLocale();
  const t = useT();
  const label = (id: string) => COLOR_SECTIONS[locale].find((s) => s.id === id)?.label ?? id;
  return (
    <>
      <PageHeader
        eyebrow="Foundations"
        title={t("Màu sắc", "Color")}
        lead={t(
          "Màu là công cụ để thể hiện phong cách, gợi cảm xúc và truyền đạt ý nghĩa. Bảng màu chuẩn hoá và cách dùng có chủ đích tạo nên trải nghiệm quen thuộc, dễ chịu và nhất quán.",
          "Color sets the tone of an interface and carries meaning. A standard palette, used with intent, keeps the experience familiar and consistent.",
        )}
      />
      <ColorMosaic />

      <div className="mt-6">
        <DocSection
          id="palettes"
          title={label("palettes")}
          description={t(
            "Fluent định nghĩa ba bảng màu: neutral, shared và brand. Mỗi bảng đảm nhận một vai trò riêng.",
            "Fluent defines three palettes, each with its own role: neutral, shared and brand.",
          )}
        >
          <PalettesSection />
        </DocSection>
        <DocSection
          id="neutral"
          title={label("neutral")}
          description={t(
            "Bảng neutral gồm đen, trắng và các sắc xám làm nền tảng cho giao diện: bề mặt, chữ, bố cục. Trong component, neutral thường biểu thị thay đổi trạng thái.",
            "The neutral palette holds black, white and the grays that form the base of the interface: surfaces, text, layout. In components, neutrals usually show state changes.",
          )}
        >
          <NeutralSection />
        </DocSection>
        <DocSection id="shared" title={label("shared")}>
          <SharedSection />
        </DocSection>
        <DocSection id="brand" title={label("brand")}>
          <BrandSection />
        </DocSection>
        <DocSection id="states" title={label("states")}>
          <StatesSection theme={theme} />
        </DocSection>
        <DocSection id="gradient" title={label("gradient")}>
          <GradientSection />
        </DocSection>
        <DocSection id="a11y" title={label("a11y")}>
          <AccessibilitySection theme={theme} />
        </DocSection>
        <DocSection id="tokens" title={label("tokens")}>
          <TokensSection theme={theme} />
        </DocSection>
      </div>
    </>
  );
}
