# Theming and Tokens · Theme & token

## Theme, brand, hướng chữ

```tsx
<YugenProvider applyToDocument theme="dark" brand="sakura" dir="rtl">…</YugenProvider>
```

| Thuộc tính | Giá trị |
|---|---|
| `theme` | `light` · `dark` · `high-contrast` |
| `brand` | `sakura` (mặc định) · `web` (Fluent Blue) · `teams` · brand tự tạo |
| `dir` | `ltr` · `rtl` |

Provider lồng nhau được (ví dụ một vùng dark trong trang light). Portal (Dialog, Menu…) tự theo provider gần nhất qua
`usePortalThemeProps()`.

## Tạo brand riêng

1. Mở [Theme Designer](https://trandat1114.github.io/Yugen-UI/#/theme-designer), chọn màu key (bậc 80).
2. Kiểm tra các ô tương phản (≥ 4.5:1), chỉnh *vibrancy* / *hue torsion* nếu cần.
3. **Xuất**:
   - **CSS** → dán khối `[data-brand="ten-brand"] { --brand-10 … --brand-160 }` vào CSS của bạn.
   - **W3C Design Tokens (DTCG)** → Style Dictionary 4, Figma Variables, Penpot.
   - **Tokens Studio** → plugin Tokens Studio for Figma (bộ `global` / `light` / `dark`).
4. Đặt `brand="ten-brand"` cho `YugenProvider`.

Bằng code: `generateBrandRamp("#0F6CBD")`, `rampToCss()`, `rampToDesignTokens()`, `rampToTokensStudio()` — đều export từ `yugen-ui`.

## Dùng token trong CSS của bạn

```css
.my-panel {
  background: var(--colorNeutralBackground1);
  color: var(--colorNeutralForeground2);
  padding: var(--spacingL);
  border-radius: var(--borderRadiusMedium);
  box-shadow: var(--shadow4);
}
```

Chỉ cần biến CSS? `import "yugen-ui/tokens.css"`.

## Luật màu (tóm tắt)

- Neutral cho bề mặt / chữ; **brand chỉ cho** CTA, trạng thái chọn, focus, link; semantic chỉ cho trạng thái.
- Không phủ brand lên diện tích lớn; gradient chỉ cho hero / minh hoạ, không bao giờ trên control.
- Chữ ≥ 4.5:1, thành phần UI ≥ 3:1; không dùng màu làm tín hiệu duy nhất.

Đầy đủ: Design.md §4 và trang [Màu sắc](https://trandat1114.github.io/Yugen-UI/#/foundations/color).
