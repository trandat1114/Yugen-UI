# Design.md — Yugen UI 幽玄

**Yugen UI** là design system cho **React + Tailwind CSS v4**, tạo bởi **trandat1114**, lấy cảm hứng từ
[Microsoft Fluent 2](https://fluent2.microsoft.design/) (cấu trúc token, thang đo, hành vi component) và danh mục
component của [shadcn/ui](https://ui.shadcn.com/docs/components). Màu chủ đạo là **Sakura 桜** (hoa anh đào).

> Yugen UI không phải sản phẩm chính thức của Microsoft. Tên token, thang spacing/typography/radius/elevation/motion
> theo Fluent UI React v9; bảng màu Sakura, gradient và brand ramp do Yugen UI định nghĩa.

Tài liệu này là **bộ quy tắc bắt buộc**. Mọi người (và AI) khi thêm/sửa giao diện phải tuân thủ đúng từng mục.

---

## 0. TL;DR — 14 luật không được phá

1. **Không hard-code** màu HEX/rgb, px, ms, cubic-bezier trong `.tsx`. Chỉ dùng utility map từ token.
2. Palette mặc định của Tailwind **đã bị tắt** (`bg-blue-500`, `rounded-lg`, `shadow-md`, `text-sm` không tồn tại).
3. Spacing dùng **hậu tố viết hoa** đúng tên Fluent: `p-M`, `gap-S`, `px-XL`, `mt-XXXL`, `gap-SNudge`.
4. Cỡ chữ chỉ dùng type ramp: `text-caption2 … text-display`. Weight chỉ `font-normal` / `font-semibold`.
5. Luôn gộp class bằng `cn()` (`src/lib/cn.ts`) — **không** dùng `twMerge` gốc (sẽ xoá nhầm `text-body1`).
6. Không dùng `dark:` variant. Theme (light/dark/high-contrast) và brand nằm trong token (`data-theme`, `data-brand`).
   Chỉ dùng thuộc tính logic (`ms/me/ps/pe/inset-s/inset-e`) để RTL hoạt động; icon chỉ hướng thêm `rtl:-scale-x-100`.
7. **Neutral** cho bề mặt/chữ/viền · **Brand (Sakura)** chỉ cho CTA, chọn/bật, focus, link · **Semantic** chỉ cho trạng thái.
8. **Không phủ brand lên diện tích lớn** (header, sidebar, nền trang, card lớn).
9. **Gradient chỉ cho minh hoạ/hero/marketing** — không bao giờ trên control hay để biểu thị trạng thái.
10. **Không dùng màu làm tín hiệu duy nhất**; chữ ≥ 4.5:1, thành phần UI ≥ 3:1 (kiểm tra ở trang Màu sắc › Khả năng tiếp cận).
11. Hành vi phức tạp dùng **Radix primitive** / `cmdk` / `react-day-picker`; icon chỉ dùng **`@fluentui/react-icons`**.
12. Component/Block mới chỉ coi là xong khi có trang docs (registry) hoặc file trong `block-library` (xem §8).
13. **Class phải ở dạng canonical** của Tailwind v4 (`inset-s-L` chứ không `start-L`, `data-disabled:` chứ không
    `data-[disabled]:`, `h-110` chứ không `h-[440px]`). `npm run lint:classes` phải báo sạch; sửa tự động bằng
    `node scripts/canonical-classes.mjs --fix`.
14. **Mọi thao tác bất đồng bộ có đủ 4 trạng thái** loading / empty / error / success, và tuân theo Wait UX (§6.5):
    không chớp loader dưới 300ms, có lối thoát (Thử lại / Huỷ) khi lỗi.

---

## 1. Công nghệ & cấu trúc thư mục

| Hạng mục | Lựa chọn |
|---|---|
| Build | Vite 6 + React 18 + TypeScript strict |
| Style | Tailwind CSS v4 (CSS-first, **không** có `tailwind.config.js`) |
| Hành vi / a11y | `@radix-ui/react-*`, `cmdk` (Command, Combobox, TagPicker), `react-day-picker` v10 (Calendar), `react-resizable-panels` v4 |
| Biến thể | `class-variance-authority` |
| Gộp class | `cn()` = `clsx` + `tailwind-merge` đã cấu hình scale của Yugen |
| Icon | `@fluentui/react-icons` (Fluent System Icons) |

```
src/
  styles/tokens.css            # Global + Alias token, brand themes, gradient, shell — NGUỒN GIÁ TRỊ DUY NHẤT
  styles/charts.css            # Token biểu đồ (categorical 1–8, sequential, diverging) + animate-chart-*
  index.css                    # Tắt scale mặc định + @theme bridge + @utility (duration, gradient) + keyframes + base
  lib.ts                       # Entry của gói npm (barrel components/ui + cn + brandRamp)
  lib/cn.ts                    # cn() — bắt buộc dùng
  lib/brandRamp.ts             # sinh brand ramp OKLCH + kiểm tra tương phản (Theme Designer)
  hooks/useAppearance.ts       # theme / brand / dir của trang docs (localStorage "yugen-ui-appearance")
  components/ui/<Name>/<Name>.tsx   # 1 component = 1 thư mục; export qua components/ui/index.ts (barrel theo nhóm)
  components/ui/Decorative/    # GradientText, WavyUnderline, BloomArt — chỉ cho minh hoạ
  docs/                        # Trang tài liệu (không phải thư viện)
    types.ts                   # ComponentDoc, CATEGORIES
    registry/*.tsx             # Mỗi file export `docs: ComponentDoc[]` — tự gom bằng import.meta.glob
    block-library/*.tsx        # Mỗi file là một Block (export default + meta) — mã nguồn hiển thị qua ?raw
    concepts/*.tsx             # Trang "Khái niệm" (export meta: ConceptMeta + default) — như mục Concepts của Storybook
    blocks.tsx, CodeBlock.tsx  # ExampleFrame, ExampleTile, DoDont, PropsTable, OnThisPage…
    pages/, layout/            # HomePage, ComponentPage, BlocksPage, NewsPage, CommunityPage · Sidebar, TopBar, DocsCommandPalette
    site.ts                    # Tên, phiên bản, tác giả, link repo/issues/discussions/npm (để trống = hiện "Sắp có")
    news.ts                    # Dữ liệu trang "Có gì mới" (#/news) — cập nhật cùng CHANGELOG.md mỗi lần phát hành
    YugenMark.tsx              # Logo enso + hoa anh đào
scripts/
  canonical-classes.mjs        # Kiểm tra / sửa class Tailwind không canonical (npm run lint:classes)
  build-css.mjs                # Sinh dist/theme.css, dist/styles.css, dist/tokens.css cho gói npm
vite.config.ts                 # Site docs → dist-docs/
vite.lib.config.ts             # Thư viện → dist/ (ESM, preserveModules, banner "use client")
```

Quy ước: named export trùng tên file, import qua `@/components/ui`, không `export default` cho component dùng lại.

---

## 2. Kiến trúc token

| Lớp | Ví dụ | Ai được dùng |
|---|---|---|
| **Global** | `--grey-14`, `--brand-80`, `--red-shade-10`, `--shared-teal`, `--shell-light` | `tokens.css`; riêng `Decorative/*` và trang docs bảng màu được đọc `--brand-*`, `--shared-*` |
| **Alias** | `--colorNeutralForeground1`, `--colorBrandBackground`, `--spacingM`, `--borderRadiusMedium`, `--shadow16`, `--durationNormal`, `--colorGradientSakura1` | `index.css` (map sang Tailwind) |
| **Utility** | `text-foreground-1`, `bg-brand-background`, `p-M`, `rounded-medium`, `shadow-16`, `duration-normal`, `bg-gradient-sakura` | Component `.tsx` |

- Tên alias **trùng 1-1 với token Fluent UI v9** → tra cứu được trên tài liệu Fluent.
- **Theme**: light ở `:root, [data-theme="light"]`, dark ở `[data-theme="dark"]`.
- **Brand**: ramp 16 bậc `--brand-10 … --brand-160`, đổi bằng `data-brand`:

  | `data-brand` | Brand80 (key) | Ghi chú |
  |---|---|---|
  | *(mặc định)* / `sakura` | `#C2347A` Sakura 桜 | 5.16:1 với chữ trắng; hue lệch ~30° so với đỏ danger để không nhầm nút xoá |
  | `web` | `#0F6CBD` Fluent Communication Blue | Brand gốc của Fluent 2 |
  | `teams` | `#5B5FC7` | Tím chàm "Dusk" — dùng cho BloomArt hoàng hôn |

  Ramp Sakura: `#240C16 · #391324 · #4C1930 · #61213F · #79274D · #912D5C · #A72F69 · #C2347A · #E24A92 · #FA65A8 ·
  #FB7CB2 · #FD8EBC · #FFA7C9 · #FEC1D7 · #FED6E4 · #FDEDF3` (bậc 130–160 là sắc cánh hoa).
  Ramp mới sinh bằng cách giữ đường cong lightness/chroma OKLCH của Communication Blue và đổi hue; Brand80 phải ≥ 4.5:1 trên nền trắng.
- **Lồng theme/brand**: đặt `data-theme` và/hoặc `data-brand` trên bất kỳ phần tử nào. Khi lồng brand bên trong
  một theme khác `<html>`, đặt **cả hai attribute trên cùng phần tử**. Phần tử mang attribute nên tự đặt `bg-*`.
- **App shell**: `bg-shell` (nền trang `#FFFBFC` / `#1C191B`) và `bg-shell-nav` (`#FFF7FA` / `#141213`) — neutral ánh hồng rất nhẹ cho đồng bộ Sakura. Bề mặt component vẫn dùng neutral chuẩn Fluent.

---

## 3. Bảng tra utility ⇄ token

### 3.1 Màu

| Utility | Token | Dùng cho |
|---|---|---|
| `text-foreground-1/2/3/4` | `colorNeutralForeground1..4` | Chữ chính → phụ → mờ → placeholder |
| `text-foreground-disabled` / `-on-brand` / `-inverted` | `colorNeutralForeground{Disabled,OnBrand,Inverted}` | Disabled, chữ trên nền brand/đặc, nền đảo |
| `text-foreground-1-static` | `colorNeutralForeground1Static` | Chữ tối cố định mọi theme, trên nền đặc sáng (Badge warning) |
| `text-brand-foreground-1`, `text-brand-foreground-2` (+`-hover`) | `colorBrandForeground1/2(Hover)` | Icon/chữ nhấn brand; chữ trên tint brand |
| `text-link`, `text-link-hover` | `colorBrandForegroundLink(Hover)` | Link |
| `bg-shell`, `bg-shell-nav` | `colorShellBackground`, `colorShellNavBackground` | Nền trang, thanh điều hướng |
| `bg-background-1` (+`-hover`, `-pressed`) | `colorNeutralBackground1(...)` | Bề mặt: Card, Dialog, Input, Menu, Popover |
| `bg-background-2..6`, `bg-background-disabled`, `bg-background-inverted` | `colorNeutralBackground2..6…` | Vùng nội dung, nền lõm, avatar neutral |
| `bg-stencil-1`, `bg-stencil-2` | `colorNeutralStencil1/2` | Skeleton |
| `bg-subtle-hover`, `bg-subtle-pressed` | `colorSubtleBackgroundHover/Pressed` | Hover phần tử trong suốt |
| `bg-brand-background` (+`-hover`, `-pressed`) | `colorBrandBackground(...)` | Primary, switch/checkbox/radio bật, slider |
| `bg-brand-background-2` (+`-hover`, `-pressed`) | `colorBrandBackground2(...)` | Tint brand: mục chọn trong nav/pagination, badge tint |
| `border-stroke-1` (+`-hover`, `-pressed`), `border-stroke-2/3`, `border-stroke-disabled` | `colorNeutralStroke*` | Viền control, divider, viền bề mặt |
| `border-stroke-accessible` | `colorNeutralStrokeAccessible` | Viền đạt 3:1 (checkbox, radio, đáy input, rail slider) |
| `border-stroke-on-brand` | `colorNeutralStrokeOnBrand` | Vạch chia trên nền brand (SplitButton) |
| `border-brand-stroke`, `border-brand-stroke-2` | `colorCompoundBrandStroke`, `colorBrandStroke2` | Focus underline, indicator chọn, viền pill |
| `outline-stroke-focus` | `colorStrokeFocus2` | Focus ring |
| `bg-overlay` | `colorBackgroundOverlay` | Lớp phủ Dialog/Drawer |
| `*-danger-/success-/warning-` `background-1`, `background-3`, `foreground-1`, `border-1` | `colorStatus*` | Background1 nhạt · Background3 đặc · Foreground1 chữ/icon |
| `bg-{cranberry,marigold,teal,lavender,forest,steel}-bg` / `text-…-fg`, `text-marigold-active` | `colorPalette*` | Avatar colorful, ô icon, sao Rating |

### 3.2 Spacing (lưới 4px)

| Utility | Token | px |
|---|---|---|
| `*-XXS` / `*-XS` / `*-SNudge` / `*-S` | `spacingXXS` / `XS` / `SNudge` / `S` | 2 / 4 / 6 / 8 |
| `*-MNudge` / `*-M` / `*-L` | `spacingMNudge` / `M` / `L` | 10 / 12 / 16 |
| `*-XL` / `*-XXL` / `*-XXXL` | `spacingXL` / `XXL` / `XXXL` | 20 / 24 / 32 |

Viết hoa là **bắt buộc**: tên thường (`p-xl`) không tồn tại và nếu thêm sẽ va chạm thang container của Tailwind
(`max-w-xl` thành 20px). Kích thước phần tử (`h-8`, `size-5`, `w-64`) dùng thang số gốc (bội 4px).

### 3.3 Type ramp

| Utility | Size / LH | Dùng cho |
|---|---|---|
| `text-caption2` / `text-caption1` | 10/14 · 12/16 | Chú thích, hint, badge, tooltip |
| `text-body1` | 14/20 | **Mặc định** cho UI |
| `text-body2` / `text-subtitle2` | 16/22 | Đoạn văn dài / tiêu đề nhỏ (semibold) |
| `text-subtitle1` | 20/28 | Tiêu đề Dialog/Card, đoạn dẫn |
| `text-title3/2/1` | 24/32 · 28/36 · 32/40 | Tiêu đề section / trang |
| `text-large-title`, `text-display` | 40/52 · 68/92 | Hero |

Font: `font-sans` (Segoe UI Variable Text), `font-display` (Segoe UI Variable Display, cho tiêu đề ≥ 20px), `font-mono` (Cascadia Code).
Component `Text` và các preset `Display`, `Title1…3`, `Subtitle1/2`, `Body1/2`, `Caption1/2` bọc sẵn ramp này.

### 3.4 Bo góc, elevation, motion

| Bo góc | px | Dùng cho |
|---|---|---|
| `rounded-small` | 2 | Checkbox, button small, Kbd |
| `rounded-medium` | 4 | **Control mặc định**, Card, Menu, Popover, MessageBar, Toast |
| `rounded-large` | 6 | Button large |
| `rounded-xlarge` | 8 | Dialog, nav item, code block |
| `rounded-2xlarge/3xlarge/4xlarge` | 12/16/24 | Bề mặt marketing, tile, block, art |
| `rounded-circular` | ∞ | Avatar, Badge, Switch, thumb Slider, FAB |

| Shadow | Dùng cho | | Motion | Dùng cho |
|---|---|---|---|---|
| `shadow-2` | Bề mặt nghỉ rất thấp | | `duration-faster` 100ms | Hover/pressed control |
| `shadow-4` | Card mặc định | | `duration-fast` 150ms | Đóng/ẩn |
| `shadow-8` | Card hover, Tooltip | | `duration-normal` 200ms | Mở overlay, indicator |
| `shadow-16` | Menu, Popover, Toast | | `duration-gentle/slow` 250/300ms | Drawer, bề mặt lớn |
| `shadow-28` | Drawer nhỏ | | `ease-decelerate-mid` / `ease-accelerate-mid` | Đi vào / đi ra |
| `shadow-64` | Dialog, Drawer | | `ease-easy-ease` | Đổi trạng thái tại chỗ |

Animation có sẵn: `animate-fade-in/out`, `animate-surface-in/out`, `animate-shimmer` (Skeleton),
`animate-indeterminate` (ProgressBar), `animate-slide-in/out-{start,end,bottom}` (Drawer, Sheet, Toast), `animate-spin` (Spinner),
`animate-chart-grow`, `animate-chart-grow-x`, `animate-chart-draw` (Chart).
Luôn thêm `motion-reduce:animate-none` cho animation lặp vô hạn hoặc chuyển động vào cảnh lớn.

---

## 4. Quy tắc màu sắc

> Màu là công cụ để thể hiện phong cách, gợi cảm xúc và truyền đạt ý nghĩa. Yugen UI có **ba bảng màu** như Fluent:
> neutral, shared, brand — với brand mặc định là **Sakura**.

### 4.1 Neutral — nền tảng
- Đen, trắng, xám cho **bề mặt, chữ, bố cục**; trong component, neutral thường biểu thị **thay đổi trạng thái**.
- **Phân cấp thị giác**: bề mặt quan trọng nhất sáng nhất — `bg-background-1` + `shadow-4`, tối dần về nền
  (`background-2` → `background-4`). Phân cấp bằng neutral + elevation trước khi nghĩ tới màu.

### 4.2 Shared & semantic
- Shared color (avatar, lịch, badge, tag) **dùng tiết kiệm**, chỉ để nhấn vùng quan trọng; ở dark mode tự dịch độ sáng/bão hoà qua alias.
- **Semantic** (danger / success / warning) **chỉ** cho phản hồi, trạng thái, mức khẩn cấp; luôn kèm icon + chữ; không trang trí; không là tín hiệu duy nhất.

### 4.3 Brand — Sakura 桜
- ✅ Button primary / CTA, trạng thái **chọn/bật** (tab, checkbox, radio, switch, slider, toggle), **focus indicator**, link,
  tint nhạt `brand-background-2` cho mục đang chọn (nav, pagination).
- ❌ Không phủ brand lên diện tích lớn; không dùng brand cho chữ thân bài; không trộn hai brand trong một vùng.
- ❌ Không dùng brand cho hành động phá huỷ — dùng `appearance="danger"` (đỏ `#C50F1F`, khác hue rõ rệt với Sakura).
- Bậc ramp cho alias (light / dark): Foreground1 80/100 · Foreground2 70/120 · Link 70/100 · Background 80/70 ·
  Hover 70/80 · Pressed 40/40 · Background2 160/20 · Background2Hover 150/30 · Background2Pressed 130/10 ·
  CompoundStroke 80/100 · Stroke2 140/50.

### 4.4 Trạng thái tương tác
- Web: **đậm dần khi tương tác** (rest → hover → pressed/selected); dùng đúng bộ ba `X` / `XHover` / `XPressed`.
- **Focus**: màu control không đổi; thêm outline 2px `stroke-focus` chỉ khi `:focus-visible`.
- Disabled: `foreground-disabled` / `background-disabled` / `stroke-disabled`; không dùng opacity.

### 4.5 Gradient — ngôn ngữ biểu cảm
| Gradient | Light | Utility / component | Tính chất |
|---|---|---|---|
| **Sakura** (chữ ký) | `#C2347A → #E0659A → #A855C9` | `bg-gradient-sakura`, `text-gradient-sakura`, `<GradientText gradient="sakura">` | Hồng anh đào → phong lan |
| **Dusk** | `#6A5AE0 → #A855C9 → #E0457B` | `bg-gradient-dusk`, `text-gradient-dusk` | Hoàng hôn chàm → hồng |
| **Sunset** | `#A855C9 → #E0457B → #D4704A` | `bg-gradient-sunset`, `text-gradient-sunset` | Bình minh tím → hồng → cam đào |
| **Aurora** | `#2886DE → #23A99B → #7D6CF0` | `bg-gradient-aurora`, `text-gradient-aurora` | Tông lạnh tương phản |
| **Brand** | `brand50 → brand80 → brand90` | `bg-gradient-brand`, `text-gradient-brand` | Theo `data-brand` |
| Hero glow | hồng anh đào + oải hương | `bg-hero-glow` | Quầng sáng nền hero |

Mỗi gradient có biến thể dark sáng hơn. Mọi stop light đạt **≥ 3:1** trên nền trắng.
`<WavyUnderline>` (gạch lượn sóng, tự dừng khi `prefers-reduced-motion`) và `<BloomArt>` (hoa bloom theo brand) dùng kèm.

- ✅ Hero, minh hoạ, onboarding, empty state, marketing; tối đa **một** điểm nhấn gradient mỗi khung nhìn; chữ gradient chỉ ≥ 28px.
- ❌ Không gradient trên Button, Input, Nav, Badge, Menu… hay bất kỳ control nào; không để biểu thị trạng thái;
  không cho thân bài/nhãn/số liệu; không tự pha stop — thêm token (kèm dark) nếu cần.

### 4.6 Khả năng tiếp cận
1. Chữ ≥ **4.5:1** (chữ lớn ≥ 3:1); thành phần UI và viền control ≥ **3:1**. Viền trang trí và disabled không bắt buộc.
2. Cho người dùng tự chọn theme/brand khi có thể.
3. Không dùng màu làm cách truyền đạt duy nhất.
4. Kiểm tra mọi cặp màu mới ở trang **Màu sắc › Khả năng tiếp cận** (tính trực tiếp từ token, light & dark).

---

## 5. Quy tắc viết component

1. **API thống nhất**: `appearance`, `size` (`small | medium | large`), `shape`, `color` (ngữ nghĩa) hoặc `intent` (mức độ).
2. **Chiều cao control**: small 24px (`h-6`), medium 32px (`h-8`, mặc định), large 40px (`h-10`).
3. **Đủ trạng thái**: rest → `hover:` → `active:` → `disabled:` → `focus-visible` (§4.4).
4. **forwardRef** cho component bọc DOM; hỗ trợ `asChild` (Radix `Slot`) cho phần tử hành động.
5. `className` người dùng luôn ở **cuối** `cn(...)`.
6. **Accessibility**: label liên kết bằng `useId`; icon-only có `aria-label`; `aria-invalid`; `role="alert"` cho lỗi;
   điều hướng bàn phím đầy đủ (Tree, Toolbar, List, Tabs, Menu, Combobox).
7. **Tái sử dụng class dùng chung, không chép lại**:
   - Ô nhập kiểu Fluent → `fieldControlClass` / `fieldAppearanceClass` (`Field`, `Select`).
   - Nhãn/hint/validation → bọc control trong `<Field>` (truyền element hoặc render-prop `(props) => …`).
   - Bề mặt nổi → `popoverSurfaceClass` (`Popover`); item menu → `menuItemClass`, `menuPopoverClass` (`Menu`);
     option listbox → `listboxOptionClass`, `cmdkOptionClass`.
8. Đặc trưng phải giữ:
   - Input/Textarea/Select/Dropdown/Combobox/DatePicker: đáy `stroke-accessible` + thanh brand 2px chạy từ giữa khi focus.
   - Tabs: active chữ semibold `foreground-1` + thanh brand 3px; hover thanh xám.
   - Card: tách nền bằng `shadow-4`. Menu/Popover/Toast: `shadow-16`. Dialog/Drawer: `shadow-64`.
   - Nav (component): hover `bg-subtle-hover`; chọn `bg-brand-background-2-hover` + `text-brand-foreground-2` + vạch brand 4px.
     (Sidebar của trang docs dùng hover tint brand — đó là style riêng của site docs.)
   - Badge mặc định circular/filled/brand; Radio chấm brand 10px; Slider thumb có vòng `background-1` bên trong.
   - SplitButton: hành động chính không lặp lại trong menu.
9. Không thêm thư viện UI/animation khác (MUI, Ant, Framer Motion…).
10. **Bề mặt nổi tự viết** (render qua Portal) phải gắn `{...usePortalThemeProps()}` lên Content để theo theme/brand/dir của YugenProvider lồng.
11. **Thang z-index cố định**: `z-30` thanh trên sticky · `z-40` lớp phủ sidebar mobile · `z-50` mọi overlay (Dialog, Drawer, Popover, Menu, Tooltip, listbox) · `z-100` vùng Toast. Không dùng z-index tuỳ ý.
12. **Focus**: không bao giờ `outline-none` mà không có chỉ báo thay thế; trong vùng `overflow-hidden` dùng `-outline-offset-2` để outline không bị cắt.
13. **Thông báo**: lỗi quan trọng trong Toast dùng `timeout: -1` (không tự tắt); kết quả bất đồng bộ không có UI thì `useAnnounce()`.
14. **Next.js App Router**: thêm `"use client"` đầu mỗi file component khi copy sang; hằng class dùng chung (`fieldControlClass`…) vẫn import được trong client component.
15. **Không phá API trong bản minor/patch** (từ 1.0; trước 1.0 phải ghi "Thay đổi lớn"). Muốn bỏ một prop/giá trị/export: thêm thay thế,
    đánh dấu JSDoc `@deprecated` và gọi `warnDeprecated(id, "dùng …", "x.0.0")` từ `@/lib/deprecate` — chỉ xoá ở bản major sau đó.
    Chi tiết: `#/concepts/versioning`.
16. **SSR an toàn**: không đọc `Date.now()`, `Math.random()`, `window`, `matchMedia`, `localStorage` hay kích thước layout trong lúc render —
    làm trong effect, hoặc `useSyncExternalStore` có `getServerSnapshot` (`useMediaQuery`). Id dùng `React.useId()`.

---

## 6. Theming, hướng chữ & toàn cục

### 6.1 YugenProvider (tương đương FluentProvider)
```tsx
<YugenProvider applyToDocument withToaster theme="light" brand="sakura" dir="ltr">
  <App />
</YugenProvider>
```
- `theme`: `"light" | "dark" | "high-contrast"` · `brand`: `"sakura" | "web" | "teams" | <tên brand tự tạo>` · `dir`: `"ltr" | "rtl"`.
- `applyToDocument` (provider gốc): ghi `data-theme`, `data-brand`, `dir` lên `<html>` để portal (Dialog, Menu, Tooltip…) cũng đúng theme.
  Provider lồng (không `applyToDocument`) bọc nội dung trong `<div data-theme data-brand dir>`.
- Đã gồm `DirectionProvider` của Radix (bắt buộc cho RTL), `TooltipProvider`; `withToaster` gắn `<Toaster />`.
- `useYugen()` đọc `{ theme, brand, dir }` hiện tại.
- Script inline trong `index.html` áp theme/brand/dir trước khi React render (không nháy). Trang docs nhận query
  `?theme=dark&brand=web&dir=rtl` (giống `globals` của Storybook) để chia sẻ link đúng giao diện.

### 6.2 Tương phản cao (`data-theme="high-contrast"`)
Nền đen, chữ trắng, nhấn **cyan `#1AEBFF`** (chữ trên nền nhấn màu đen), link **vàng `#FFFF00`**, disabled **xanh lá `#3FF23F`**.
Mọi `shadow-*` thành viền trắng 1px; gradient quy về trắng. Component **không cần sửa gì** nếu chỉ dùng utility token.
Không dựa vào bóng đổ hay màu nền nhạt để truyền đạt trạng thái — luôn có viền/chữ/icon.

### 6.3 Hướng chữ RTL
- Bật bằng `dir="rtl"` (YugenProvider hoặc `<html dir>`). Thanh trên cùng của docs có công tắc **LTR / RTL**.
- **Bắt buộc dùng thuộc tính logic**: `ms-* me-* ps-* pe-* inset-s-* inset-e-* border-s border-e rounded-s-* rounded-e-* rounded-ss/se/es/ee-* text-start text-end`
  (`start-*`/`end-*` vẫn chạy nhưng không canonical — luật 13).
  Cấm `ml/mr/pl/pr/left/right/border-l/border-r/rounded-l/rounded-r/text-left/text-right` (trừ căn giữa đối xứng `left-1/2 -translate-x-1/2`).
- Icon chỉ hướng (chevron/arrow trái-phải, prev/next, gửi, trả lời) thêm `rtl:-scale-x-100`. Không lật icon trung tính.
- Chuyển động ngang: thêm biến thể `rtl:` (vd. thumb Switch `rtl:data-[state=checked]:-translate-x-5.5`); animation
  `animate-slide-*-start/end` đã tự đảo chiều qua biến `--yugen-dir` (1 | -1).
- Bàn phím tự viết: đổi vai ArrowLeft/ArrowRight theo `useDirection()` của `@radix-ui/react-direction`.
- Code (`<pre>`, mã HEX, số tài khoản) luôn `dir="ltr"`.

### 6.4 Toàn cục khác
- Khung Example trên docs đổi được **Yugen / Web / Teams × Light / Dark** và **Tương phản cao**.
- Brand tự tạo: dùng trang **Theme Designer** (`#/theme-designer`) → copy block `[data-brand="ten"] { --brand-10…160 }` vào `tokens.css`.
  Thuật toán nằm ở `src/lib/brandRamp.ts` (`generateBrandRamp`, `adjustKeyForContrast`, `contrastRatio`).
- Trang docs có bảng lệnh **Ctrl/⌘ + K** (trang, component, khái niệm, đổi theme/brand/hướng chữ).

### 6.5 Wait UX — trải nghiệm chờ
Chọn tín hiệu theo thời gian **dự kiến**, không theo thói quen (chi tiết: `#/concepts/wait-ux`):

| Thời gian | Hiển thị | Dùng |
|---|---|---|
| < 100ms | Không gì cả | Trạng thái hover/pressed của control |
| 100ms – 1s | Không loader, hoặc tín hiệu nhẹ sau delay | `useSpinDelay(loading, { delay: 300, minDuration: 500 })` |
| 1 – 3s | Spinner tại chỗ hoặc khung xương nếu biết bố cục | `<Button loading loadingText>`, `AsyncContent`, `SkeletonText/Avatar/Card/List/Table` |
| 3 – 10s | Tiến trình xác định + đang làm gì + cho huỷ | `ProgressBar value`, `PageProgress`, `Trace` |
| > 10s | Chạy nền, cho rời đi, báo khi xong | `toast`, `useAnnounce` |

- **Không chớp**: loader chỉ hiện khi chờ > 300ms và đã hiện thì giữ ≥ 500ms (`useSpinDelay`).
- **Giữ bố cục đứng yên**: khung xương phải cùng kích thước với nội dung thật; nút đang `loading` giữ nguyên độ rộng.
- **Chuyển trang**: `<PageProgress />` một lần ở gốc app + `<PageProgressFallback>` làm fallback của `Suspense`.
- **Optimistic**: chỉ cho thao tác gần như luôn thành công và hoàn tác được (`useOptimisticList`); lỗi thì trả lại và báo.
- **Lỗi**: `ErrorState` / `AsyncContent status="error"` luôn có hành động **Thử lại**; không chỉ báo bằng màu.
- **A11y**: vùng đang tải có `aria-busy`; kết quả không có UI đọc qua live region polite; không tự động focus vào loader.

### 6.6 Thích ứng desktop & mobile
- Cùng một nội dung, hai dạng: **Sheet** là panel cạnh (`side="start" | "end"`, `size`) trên màn rộng và **bottom sheet kéo được**
  dưới `breakpoint` (mặc định 768px) với `snapPoints` (mặc định `[0.5, 0.9]`). Ép dạng bằng `mode="side" | "bottom"`.
- Vùng không được kéo (slider, danh sách cuộn ngang) gắn `data-sheet-no-drag`. Footer bám đáy và chừa safe-area.
- `Drawer` vẫn dùng cho panel cố định trên desktop (overlay/inline); điều hướng chính trên mobile dùng Sheet/Drawer `start`.
- Rẽ nhánh theo kích thước bằng `useMediaQuery(query, { defaultValue })` — `defaultValue` là giá trị khi SSR.
- Khung media dùng `AspectRatio ratio={16 / 9}` để không giật bố cục khi ảnh/video tải.

### 6.7 Giọng văn & thanh công cụ của trang docs
- Câu ngắn, nói đúng sự việc, có số liệu khi có. Không dùng tính từ quảng cáo ("mạnh mẽ", "liền mạch", "trôi chảy"…),
  không chêm ý bằng "—", không liệt kê ba vế chỉ để có nhịp, không hướng dẫn điều hiển nhiên ("rê chuột để…").
- Quy tắc nội bộ (gradient chỉ cho minh hoạ…) nằm trong file này, không đưa lên trang chủ.
- "Dựa trên Fluent 2" chỉ ghi ở footer và trang chuyển đổi từ Fluent. Không đặt ở hero, sidebar hay meta description.
- Thanh công cụ không xuống dòng: mỗi nút `shrink-0 whitespace-nowrap`; thiếu chỗ thì chỉ còn icon (chữ thành `sr-only`
  hoặc `aria-label`), không để chữ bẻ dòng. Mỗi chức năng một nút, không đặt hai nút làm cùng việc.
- Kiểm tra ở 360 · 390 · 768 · 1024 · 1280px; không được có cuộn ngang toàn trang.

---

## 7. Danh mục component (111 trang docs)

| Nhóm | Component |
|---|---|
| **Provider** | YugenProvider (+ `useYugen`, `usePortalThemeProps`) |
| **Hành động** (9) | Button (+ `loading`, `loadingText`), CompoundButton, MenuButton, SplitButton, ButtonGroup, ToggleButton, ToggleGroup, Toolbar, Link |
| **Nhập liệu** (25) | Field, Label, Input, Textarea, SearchBox, Select (native), Dropdown, Combobox, Tag (+TagGroup), TagPicker, Checkbox, RadioGroup, Switch, Slider, SpinButton, InputOTP, Rating, SwatchPicker, Calendar, DatePicker, TimePicker, DateRangePicker `presets`, FileUpload, Form (react-hook-form + zod, chỉ ví dụ) |
| **Điều hướng** (9) | Tabs, Breadcrumb, Pagination, Nav, Menu, Menubar, ContextMenu, Command, Stepper / Wizard |
| **Hiển thị dữ liệu** (14) | Avatar, AvatarGroup, Persona, PresenceBadge, Badge, CounterBadge, Kbd, Text, Image, List, Table (+DataTable mẫu), Tree, Carousel (loop, autoplay có tiến độ, `slidesPerView`, `CarouselThumbnails`), DataGrid (sort, chọn dòng, đổi cỡ cột, ảo hoá) |
| **Phản hồi** (7) | MessageBar, Toast, ProgressBar, Spinner, Skeleton (+ `SkeletonText/Avatar/Card/List/Table`), Empty, InfoLabel |
| **Bề mặt & overlay** (7) | Card, Dialog, Drawer (overlay + inline), Popover, TeachingPopover, HoverCard, Tooltip |
| **Bố cục** (7) | Accordion (`appearance` flush / separated / outline), AspectRatio, Collapsible, Divider, ScrollArea, Resizable (`collapsible`, `persistKey`), Overflow |
| **Chuyển động** (6) | Fade, Scale, Slide, Collapse, Blur & Rotate, Stagger (+ hook `usePresence`) |
| **Tiện ích** (4) | VisuallyHidden, AriaLiveAnnouncer + `useAnnounce`, Focus management (`useArrowNavigationGroup`, `useFocusableGroup`), `useMediaQuery` |
| **Yugen Labs** (24) | Xem §7.1 |
| **Trang trí** | GradientText, WavyUnderline, BloomArt |

(Tương đương shadcn: Alert → MessageBar, Alert Dialog → `DialogSurface modalType="alert"`, Sheet → Sheet (thích ứng) hoặc Drawer,
Separator → Divider, Sidebar → Nav, Native Select → Select, Select → Dropdown, Item → List, Chart → Chart (không cần Recharts).
Tương đương Fluent: FluentProvider → YugenProvider, DataGrid → Table + DataTable mẫu.)
Props chi tiết: xem trang docs tương ứng; hướng dẫn chuyên sâu: mục **Khái niệm** trên docs (`#/concepts/…`).

### 7.1 Yugen Labs — phần mở rộng riêng, không có trong Fluent 2
| Nhóm | Thành phần | Khái niệm |
|---|---|---|
| **Wait UX** | `useSpinDelay`, `LoadingOverlay`, `PageProgress` (+ `PageProgressFallback`, `usePageProgress`, `pageProgress`, `createPageProgress`), `AsyncContent`, `ErrorState`, Skeleton presets, `useOptimisticList` | `#/concepts/wait-ux` |
| **Thích ứng** | `Sheet` (+ `SheetTrigger/Content/Header/Title/Description/Body/Footer/Close`) | `#/concepts/adaptive-overlays` |
| **Trực quan hoá** | `BarChart`, `LineChart`, `AreaChart` (stacked / 100%, `brush`), `ScatterChart`, `Heatmap`, `DonutChart`, `Sparkline`, `StatTile`, `ChartContainer/Legend/Tooltip/Table/Patterns` | `#/concepts/data-visualization` |
| **Hội thoại & AI** | `MessageScroller`, `MessageBubble`, `MessageReaction`, `MessageDaySeparator`, `TypingIndicator`, `ChatComposer` | `#/concepts/chat-ux` |
| **AI kit** | `StreamingMarkdown` (parser an toàn, không `dangerouslySetInnerHTML`), `Citation`, `CitationList`, `Reasoning`, `PromptInput` | `#/concepts/chat-ux` |
| **Hướng dẫn & thông báo** | `Tour` (+ `useTour`), `NotificationCenter` (+ `useNotifications`) | — |
| **Minh bạch tiến trình** | `Trace`, `TraceStep`, `TraceLog`, `TraceStatusIcon` (pending · running · success · error · skipped · cancelled) | `#/concepts/agent-trace` |
| **Thu thập ý kiến** | `Questionnaire` (single, multiple, rating, scale, text, longText, yesNo) | — |
| **Mã nguồn** | `CodeBlock` (highlight, số dòng, dòng nhấn, diff), `CodeTabs`, `PackageManagerTabs`, `CopyCodeButton` | — |

Luật riêng của Labs:
- **Chart**: chọn dạng trước rồi mới tới màu · màu phân loại dùng `--colorChartCategorical1…8` **theo thứ tự cố định**, không xoay vòng;
  chuỗi thứ 9 trở đi gộp vào "Khác" (`--colorChartOther`) · **một trục Y**, không bao giờ hai trục · legend khi ≥ 2 chuỗi ·
  chữ/số dùng token chữ, không dùng màu của chuỗi · luôn có tooltip (hover + bàn phím) và **bảng dữ liệu tương đương** (`ChartTable`) ·
  dark mode có bộ màu riêng đã kiểm tra trên nền tối · palette mới phải qua bộ kiểm tra mù màu trước khi thêm vào `charts.css`.
- **Trace**: trạng thái luôn có icon + chữ (không chỉ màu); bước đang chạy hiện thời gian trực tiếp; thay đổi trạng thái đọc qua live region polite.
- **MessageScroller**: chỉ tự cuộn xuống khi người dùng đang ở đáy; nếu đang đọc tin cũ thì hiện nút "N tin nhắn mới"; tải thêm lịch sử giữ nguyên vị trí;
  tin đang stream chỉ đọc cho trình đọc màn hình khi đã nhận đủ.
- **Questionnaire**: mỗi màn một câu; Enter để tiếp, phím số để chọn; kiểm tra `required` trước khi qua câu; có bước xem lại trước khi gửi.
- **CodeBlock**: luôn `dir="ltr"`; nút copy có trạng thái "Đã copy" và đọc được bằng trình đọc màn hình.

### 7.2 Giới hạn đã biết
- **Resizable** ở RTL: nhóm ngang tự lật theo hướng chữ (`mirrorInRtl`, bật mặc định) — `react-resizable-panels` đã sắp panel theo thứ tự
  hiển thị nên kéo và phím mũi tên đi đúng chiều con trỏ (có test e2e). `mirrorInRtl={false}` giữ bố cục LTR.
- **Sheet** dạng bottom: cử chỉ kéo/vuốt mới kiểm tra bằng chuột và trình giả lập cảm ứng; cần thử thêm trên thiết bị iOS/Android thật.
- **Chart** viết tay bằng SVG: chưa có trục log hay bản đồ; brush luôn trái→phải như vùng vẽ (cả khi RTL); dữ liệu rất lớn nên lấy mẫu trước.
- Chưa có: ColorPicker đầy đủ, TimePicker qua nửa đêm. Overflow cần item có độ rộng tự nhiên (không `flex-1`).

---

## 8. Quy trình mở rộng

### Thêm component
1. Tạo `src/components/ui/<Name>/<Name>.tsx` theo §5, thêm `export * from "./<Name>/<Name>";` vào đúng nhóm trong `src/components/ui/index.ts`.
2. Thêm `ComponentDoc` vào một file trong `src/docs/registry/` (hoặc file mới export `docs`): `slug`, `name`,
   `category` (một trong `CATEGORIES` ở `src/docs/types.ts`), `lead`, `description`, `importCode`, `hero`,
   `examples` (**`code` phải giống hệt JSX trong `render`**), `dos`/`donts` (2–3 ý), `props`.
3. Sidebar, tìm kiếm, trang chủ tự sinh từ registry — không sửa tay.

### Thêm block
1. Tạo `src/docs/block-library/NN-ten.tsx` với `export const meta = { title, description, order }` và `export default function …`.
2. Chỉ import từ `@/components/ui` + `@fluentui/react-icons` để người dùng copy được nguyên file.
3. Tab "Code" tự hiển thị mã nguồn của chính file đó (`?raw`).

### Thêm trang Khái niệm
1. Tạo `src/docs/concepts/<slug>.tsx` (export default trang) và `src/docs/concepts/<slug>.meta.ts` với
   `export const meta: ConceptMeta = { slug, title, group, order, lead, toc }` (`group` thuộc `CONCEPT_GROUPS`).
2. Sidebar, bảng lệnh Ctrl+K và route `#/concepts/<slug>` tự sinh; trang được tải lười (lazy).

### Phát hành phiên bản (Changesets + News + npm)
0. Trong mỗi PR có thay đổi người dùng thấy được: `npx changeset` (patch / minor, tóm tắt cho người dùng). Từ 0.6.0
   `CHANGELOG.md` do Changesets sinh — không sửa tay.
1. `npm run version-packages` (= `changeset version` + đồng bộ `templates/` + lockfile) — gộp changeset vào `CHANGELOG.md`, tăng `version` trong `package.json` (theo SemVer; khi còn
   `0.x`, đổi API = minor + `breaking`). `SITE.version` của site docs đọc thẳng từ `package.json`, không cần sửa.
2. Thêm mục mới vào **đầu** mảng `NEWS` trong `src/docs/news.ts` (`kind`: `new` | `improved` | `fixed` | `breaking`, kèm `href`
   tới trang docs). Chấm báo "Có gì mới" trên thanh trên tự hiện cho người chưa xem.
3. `npm install --package-lock-only` → `npm run check:release` (`package.json` = `news.ts` = `CHANGELOG.md`) →
   `npm run typecheck && npm test && npm run build && npm run size` → `npm run pack:check` để xem trước nội dung gói.
4. Commit rồi `git tag vX.Y.Z && git push --tags` — workflow `.github/workflows/release.yml` kiểm tra tag, chạy test,
   build và `npm publish --provenance` (cần secret `NPM_TOKEN`; tag có `-` → dist-tag `next`).

---

## 9. Checklist trước khi merge

- [ ] Không có HEX/px/ms tuỳ ý trong `.tsx` (trừ minh hoạ trong `Decorative/`, logo, dữ liệu mẫu của docs).
- [ ] Spacing viết hoa; cỡ chữ theo type ramp; dùng class dùng chung (§5.7).
- [ ] Màu đúng vai trò (§4); không brand diện tích lớn; không gradient trên control.
- [ ] Đủ trạng thái hover / pressed / disabled / focus-visible; bàn phím hoạt động.
- [ ] Kiểm tra Yugen / Web / Teams × Light / Dark và bảng tương phản.
- [ ] Có mục registry (hoặc file block), code mẫu khớp với render.
- [ ] Thao tác bất đồng bộ có đủ loading / empty / error (có Thử lại) / success; loader dùng `useSpinDelay` (§6.5).
- [ ] Kiểm tra ở RTL và ở màn hình 390px (Sheet/Drawer, bảng, biểu đồ không tràn ngang).
- [ ] Component mới được export trong `src/components/ui/index.ts` (để có trong gói npm).
- [ ] `npm run typecheck`, `npm run lint:classes`, `npm run build` đều pass, không còn cảnh báo.
- [ ] `npm test` và `npm run test:e2e` pass (axe không báo lỗi); đổi giao diện có chủ đích thì cập nhật ảnh `test:visual`.
- [ ] `npm run size` vẫn trong ngân sách (`.size-limit.cjs`); tăng `limit` phải có lý do trong PR.
- [ ] Thay đổi người dùng thấy được có changeset (`npx changeset`).
- [ ] Nội dung (docs, template, thông báo CLI) theo [wiki › Writing](https://github.com/trandat1114/Yugen-UI/wiki/Writing).

---

## 10. Lệnh & credit

```bash
npm install
npm run dev            # site docs — http://localhost:5173
npm run typecheck      # tsc -b
npm run lint:classes   # class Tailwind canonical (thêm --fix khi chạy trực tiếp script để tự sửa)
npm run build:lib      # gói npm → dist/ (JS ESM + .d.ts + theme.css / styles.css / tokens.css)
npm run build:docs     # site docs → dist-docs/
npm run build          # build:lib + build:docs
npm run pack:check     # npm pack --dry-run — xem trước file sẽ lên npm
npm run preview
npm test               # Vitest + Testing Library (unit, bàn phím, SSR) — test:watch khi đang viết
npm run test:e2e       # Playwright: axe × theme × hướng chữ, kéo chuột, chạm mô phỏng
npm run test:visual    # so sánh ảnh chụp (baseline theo nền tảng trong e2e/__screenshots__)
npm run size           # ngân sách dung lượng (size-limit, sau build:lib)
npx changeset          # thêm changeset cho PR · `npm run version-packages` khi phát hành
npm run check:release  # package.json = news.ts = CHANGELOG.md (thêm --tag vX.Y.Z để so cả tag)
```

### Dùng gói npm `yugen-ui`
```bash
npm install yugen-ui
```
```css
/* Cách A — có Tailwind CSS v4 (khuyên dùng): token + utility Yugen, tự quét component trong gói */
@import "tailwindcss";
@import "yugen-ui/theme.css";
```
```ts
// Cách B — không dùng Tailwind: CSS đã biên dịch sẵn (chỉ gồm class mà component Yugen dùng)
import "yugen-ui/styles.css";
// Chỉ cần biến CSS: import "yugen-ui/tokens.css";
```
```tsx
import { YugenProvider, Button } from "yugen-ui";
```
- Gói chỉ có ESM, tree-shake được (`preserveModules`), mọi file component có `"use client"` (dùng thẳng trong Next.js App Router).
- `theme.css` cũng tắt scale mặc định của Tailwind trong app người dùng (luật 2) — ghi rõ điều này khi hướng dẫn tích hợp.
- Chế độ copy-paste (như shadcn) vẫn dùng được: chép `src/components/ui/<Name>`, `src/lib/cn.ts`, `src/styles/*.css`, `src/index.css`.

### Cộng đồng
- Trang `#/community` (cách tham gia, lộ trình, FAQ) và `#/news` lấy link từ `src/docs/site.ts` — điền `repository`, `issues`,
  `discussions`, `npm` khi có; link trống hiện "Sắp có", không bao giờ đoán URL.
- Quy trình đóng góp: `CONTRIBUTING.md`; ứng xử: `CODE_OF_CONDUCT.md`; báo lỗ hổng: `SECURITY.md`; mẫu issue/PR trong `.github/`.

**Yugen UI** © trandat1114 — lấy cảm hứng từ Microsoft Fluent 2 và shadcn/ui. Icon: Fluent System Icons (MIT). Giấy phép MIT.
