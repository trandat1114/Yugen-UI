# Getting Started · Bắt đầu

Yêu cầu: React 18 hoặc 19, TypeScript 5 (khuyên dùng). Tailwind CSS v4 là tuỳ chọn.

## 1. Chọn cách dùng

| Cách | Khi nào | Lệnh |
|---|---|---|
| **npm + Tailwind v4** | Dự án mới / đã có Tailwind v4 — khuyên dùng | `npm install yugen-ui` + `@import "yugen-ui/theme.css"` |
| **npm, không Tailwind** | Dự án dùng CSS khác | `import "yugen-ui/styles.css"` |
| **shadcn CLI** | Muốn sở hữu và sửa sâu mã nguồn | `npx shadcn@latest add https://trandat1114.github.io/Yugen-UI/r/button.json` |
| **Starter template** | Bắt đầu nhanh một app hoàn chỉnh | `npx degit trandat1114/Yugen-UI/templates/vite-dashboard my-app` |

Chi tiết từng cách: [README](https://github.com/trandat1114/Yugen-UI#readme) và trang
[Cài bằng shadcn CLI](https://trandat1114.github.io/Yugen-UI/#/concepts/shadcn-registry).

## 2. Thiết lập tối thiểu (npm + Tailwind v4)

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
> không còn. Dùng utility của Yugen: `bg-background-1`, `text-foreground-2`, `p-M`, `rounded-medium`, `text-body1`.

## 3. Next.js App Router

Mọi file component trong gói đã có `"use client"` — import thẳng trong Server Component. Đặt `YugenProvider` trong
`app/layout.tsx`, thêm `suppressHydrationWarning` lên `<html>` nếu bạn đổi theme bằng script trước khi hydrate.
Xem thêm: [SSR & Next.js](https://trandat1114.github.io/Yugen-UI/#/concepts/ssr).

## 4. Bước tiếp theo

- Đổi màu thương hiệu: [[Theming and Tokens]].
- Xem mọi component và chép ví dụ: [docs](https://trandat1114.github.io/Yugen-UI/) — mỗi ví dụ có nút Copy và StackBlitz.
- Vướng mắc? Hỏi ở [Discussions Q&A](https://github.com/trandat1114/Yugen-UI/discussions/categories/q-a).
