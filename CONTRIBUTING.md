# Đóng góp cho Yugen UI · Contributing to Yugen UI

Cảm ơn bạn đã quan tâm! · Thanks for your interest! The Vietnamese guide comes first, followed by a short English
version. Both point to [Design.md](./Design.md) — the project rulebook, which always wins when in doubt.

Mọi người tham gia đều phải tuân thủ [Quy tắc ứng xử](./CODE_OF_CONDUCT.md). Lỗ hổng bảo mật: **không** mở issue công
khai, xem [SECURITY.md](./SECURITY.md).

---

## Tiếng Việt

### Cài đặt

Yêu cầu Node.js **20+** và npm.

```bash
npm install
npm run dev          # trang docs tại http://localhost:5173
```

### Lệnh

| Lệnh | Việc làm |
|---|---|
| `npm run dev` | Chạy trang docs (Vite) |
| `npm run typecheck` | Kiểm tra kiểu (`tsc -b`) |
| `npm run lint:classes` | Kiểm tra class Tailwind ở dạng canonical (`node scripts/canonical-classes.mjs --fix` để tự sửa) |
| `npm run build:lib` | Build thư viện vào `dist/` (JS + `.d.ts` + `theme.css` / `styles.css` / `tokens.css`) |
| `npm run build:docs` | Build trang docs vào `dist-docs/` |
| `npm run build` | Cả hai |
| `npm run pack:check` | Xem trước nội dung gói npm (`npm pack --dry-run`) |

### Luật bắt buộc (tóm tắt Design.md §0)

1. Không hard-code HEX/rgb, px, ms, cubic-bezier trong `.tsx` — chỉ dùng utility map từ token.
2. Palette mặc định của Tailwind đã tắt (`bg-blue-500`, `rounded-lg`, `shadow-md`, `text-sm` không tồn tại).
3. Spacing dùng hậu tố Fluent viết hoa: `p-M`, `gap-S`, `px-XL`. Cỡ chữ chỉ dùng type ramp `text-caption2 … text-display`.
4. Luôn gộp class bằng `cn()` (`src/lib/cn.ts`), không dùng `twMerge` gốc.
5. Không dùng `dark:`; chỉ dùng thuộc tính logic (`ms/me/ps/pe/start/end`) để RTL hoạt động.
6. Neutral cho bề mặt/chữ/viền · Brand chỉ cho CTA, trạng thái chọn, focus, link · Semantic chỉ cho trạng thái.
7. Gradient chỉ cho minh hoạ/hero — không bao giờ trên control.
8. Tương phản chữ ≥ 4.5:1, thành phần UI ≥ 3:1; không dùng màu làm tín hiệu duy nhất.
9. Hành vi phức tạp dùng Radix / `cmdk` / `react-day-picker`; icon chỉ dùng `@fluentui/react-icons`. Không thêm thư
   viện UI/animation khác.

### Thêm component

1. Tạo `src/components/ui/<Name>/<Name>.tsx` theo Design.md §5 (named export, `forwardRef`, `className` cuối `cn(...)`,
   đủ trạng thái hover/pressed/disabled/focus-visible, bàn phím, `aria-*`).
2. Thêm `export * from "./<Name>/<Name>";` vào đúng nhóm trong `src/components/ui/index.ts` — gói npm export mọi thứ
   có trong barrel này.
3. Viết trang docs: thêm một `ComponentDoc` vào file trong `src/docs/registry/` (`slug`, `name`, `category`, `lead`,
   `description`, `importCode`, `hero`, `examples` — **`code` phải giống hệt JSX trong `render`**, `dos`/`donts`,
   `props`). Sidebar, tìm kiếm, trang chủ tự sinh từ registry.
4. Dependency mới (nếu thật sự cần) phải nằm trong `dependencies` của `package.json` — maintainer quyết định.

### Thêm block

1. Tạo `src/docs/block-library/NN-ten.tsx` với `export const meta = { title, description, order }` và
   `export default function …`.
2. Chỉ import từ `@/components/ui` và `@fluentui/react-icons` để người dùng copy được nguyên file.

### Quy ước commit

Theo [Conventional Commits](https://www.conventionalcommits.org/):

```
feat(button): thêm appearance "tint"
fix(combobox): giữ focus khi xoá tag bằng Backspace
docs(theming): ví dụ brand tự tạo
```

Loại: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`. Thay đổi phá vỡ API: thêm `!`
(`feat(field)!: …`) và mô tả trong phần thân commit.

### Checklist PR

- [ ] `npm run typecheck`, `npm run lint:classes`, `npm run build:lib`, `npm run build:docs` đều pass.
- [ ] Không HEX/px/ms tuỳ ý; spacing viết hoa; cỡ chữ theo type ramp; dùng class dùng chung (Design.md §5.7).
- [ ] Màu đúng vai trò; không brand diện tích lớn; không gradient trên control.
- [ ] Đủ trạng thái hover / pressed / disabled / focus-visible; bàn phím hoạt động; đã thử RTL.
- [ ] Đã kiểm tra Sakura / Web / Teams × Light / Dark và High contrast.
- [ ] Có mục registry (hoặc file block); code mẫu khớp với render.
- [ ] Đã thêm dòng vào `CHANGELOG.md` (mục `Unreleased`).

---

## English

### Setup

Requires Node.js **20+** and npm. Run `npm install`, then `npm run dev` (docs site at http://localhost:5173).
Scripts: `typecheck`, `lint:classes` (Tailwind canonical classes; `node scripts/canonical-classes.mjs --fix`
repairs them), `build:lib` (library → `dist/`), `build:docs` (docs → `dist-docs/`), `build` (both), `pack:check`.

### Rules

[Design.md](./Design.md) is mandatory. In short: only token-mapped utilities (no raw HEX/px/ms), Tailwind's
default palette is disabled, upper-case Fluent spacing (`p-M`, `gap-S`), type-ramp font sizes only, always merge
classes with `cn()`, no `dark:` variant, logical properties only (RTL), brand colour only for CTAs / selection /
focus / links, gradients never on controls, WCAG contrast (4.5:1 text, 3:1 UI), Radix / `cmdk` /
`react-day-picker` for behaviour and `@fluentui/react-icons` for icons.

### Adding a component, docs or a block

1. `src/components/ui/<Name>/<Name>.tsx` (named export, `forwardRef`, user `className` last in `cn(...)`, all
   interaction states, keyboard support, ARIA), then export it from `src/components/ui/index.ts` — the npm package
   exports everything in that barrel.
2. Add a `ComponentDoc` to a file in `src/docs/registry/` (example `code` must match the rendered JSX exactly).
3. Blocks: `src/docs/block-library/NN-name.tsx` with `export const meta` + a default export, importing only from
   `@/components/ui` and `@fluentui/react-icons`.

### Commits and pull requests

Use [Conventional Commits](https://www.conventionalcommits.org/) (`feat(scope): …`, `fix`, `docs`, `refactor`,
`chore`…; `!` for breaking changes). Before opening a PR: typecheck, class lint, `build:lib` and `build:docs` pass;
checked in light / dark / high contrast, all brands and RTL; registry docs added; `CHANGELOG.md` updated under
`Unreleased`. Fill in the pull-request template.
