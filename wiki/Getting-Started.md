# Getting Started · Bắt đầu

Yêu cầu: React 19 (khuyên dùng) hoặc 18.3, TypeScript 5 (khuyên dùng). Tailwind CSS v4 là tuỳ chọn.

## 1. Chọn cách dùng

| Cách | Khi nào | Lệnh |
|---|---|---|
| **CLI `@yugen-ui/cli`** — đơn giản nhất | Dự án có sẵn: cài gói + thêm theme vào CSS trong một lệnh | `npx @yugen-ui/cli@latest init` |
| **Starter template** | Bắt đầu nhanh một app hoàn chỉnh (starter, SaaS, blog…) | `npm create yugen-ui@latest my-app` |
| **Chép mã nguồn** | Muốn sở hữu và sửa sâu mã nguồn | `npx @yugen-ui/cli@latest init --mode source` rồi `npx @yugen-ui/cli add button` |
| **npm + Tailwind v4** (tự làm) | Như dòng đầu, không dùng CLI | `npm install yugen-ui` + `@import "yugen-ui/theme.css"` |
| **npm, không Tailwind** | Dự án dùng CSS khác | `import "yugen-ui/styles.css"` (hoặc `npx @yugen-ui/cli init` tự thêm) |
| **shadcn CLI** | Dự án đã dùng shadcn/ui | `npx shadcn@latest init https://trandat1114.github.io/Yugen-UI/r/init.json` rồi `add …/r/button.json` |

Chi tiết: [@yugen-ui/cli](https://trandat1114.github.io/Yugen-UI/#/concepts/cli), [README](https://github.com/trandat1114/Yugen-UI#readme),
[Cài bằng shadcn CLI](https://trandat1114.github.io/Yugen-UI/#/concepts/shadcn-registry).

## 2. Thiết lập tối thiểu (npm + Tailwind v4)

`npx @yugen-ui/cli@latest init` (chọn `package`) làm hộ bước CSS bên dưới và in đoạn bọc `YugenProvider`; kiểm tra lại bằng
`npx @yugen-ui/cli doctor`. Tự làm:

```css
/* src/index.css */
@import "tailwindcss";
@import "yugen-ui/theme.css";
```

```tsx
import { YugenProvider, Button } from "yugen-ui";

export function App() {
  return (
    <YugenProvider applyToDocument withToaster theme="light" brand="sakura">
      <Button appearance="primary">Xin chào</Button>
    </YugenProvider>
  );
}
```

> ⚠ `theme.css` **tắt** scale mặc định của Tailwind (màu, bo góc, bóng, cỡ chữ): `bg-blue-500`, `rounded-lg`, `text-sm`
> không còn. Dùng utility của Yugen: `bg-background-1`, `text-foreground-2`, `p-3`, `rounded-medium`, `text-body1`.

## 3. Next.js App Router

Mọi file component trong gói đã có `"use client"` — import thẳng trong Server Component. Đặt `YugenProvider` trong
`app/layout.tsx`, thêm `suppressHydrationWarning` lên `<html>` nếu bạn đổi theme bằng script trước khi hydrate.
Xem thêm: [SSR & Next.js](https://trandat1114.github.io/Yugen-UI/#/concepts/ssr).

## 4. Bước tiếp theo

- Đổi màu thương hiệu: [[Theming and Tokens]].
- Xem mọi component và chép ví dụ: [docs](https://trandat1114.github.io/Yugen-UI/) — mỗi ví dụ có nút Copy và StackBlitz.
- Vướng mắc? Hỏi ở [Discussions Q&A](https://github.com/trandat1114/Yugen-UI/discussions/categories/q-a).
