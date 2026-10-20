# Component Guidelines · Viết component

Luật đầy đủ và bắt buộc nằm ở [`Design.md`](https://github.com/trandat1114/Yugen-UI/blob/main/Design.md). Trang này là
lối tắt khi bạn bắt tay vào làm.

## Thêm một component — từng bước

1. Mở / nhận một issue (`confirmed`, hoặc ý tưởng đã thống nhất ở Discussions **Ideas**).
2. `src/components/ui/<Name>/<Name>.tsx` — `forwardRef`, `className` cuối cùng trong `cn()`, JSDoc tiếng Việt, `displayName`.
3. Thêm `export * from "./<Name>/<Name>";` vào đúng nhóm trong `src/components/ui/index.ts`.
4. Trang docs: thêm `ComponentDoc` vào một file `src/docs/registry/*.tsx` — `slug`, `name`, `category`, `lead` là chuỗi literal;
   `code` của ví dụ phải chạy được khi chép ra (dùng `setup` cho dữ liệu dùng chung).
5. Mô tả tiếng Anh: `<slug>: { lead: "…" }` trong `src/docs/i18n/en/components.ts` (test bắt buộc).
6. Test: `<Name>.test.tsx` cạnh component (hành vi, bàn phím, ARIA). Thêm case SSR vào `src/test/ssrCases.tsx` nếu có state phụ thuộc môi trường.
7. `npx changeset` → chọn `minor` (component mới) và viết một câu cho người dùng (tiếng Anh).
8. Chạy checklist ở [[Testing and Quality]] + axe cho trang của bạn:
   `npx playwright test e2e/a11y.spec.ts --project=a11y --grep "<slug>"`.

## Ví dụ thực tế: thêm `Quote` và `Autocomplete` (0.7, nhánh `next`)

| Bước | Làm gì | File |
|---|---|---|
| 1 | Nhánh `feat/quote-autocomplete` từ `next` (tính năng mới → `next`) | — |
| 2 | Component, tái dùng thứ có sẵn: `SearchBox`, `listboxOptionClass`, `popoverSurfaceClass`, `normalizeSearchText`, `useSpinDelay` | `src/components/ui/Quote/`, `Autocomplete/` |
| 3 | Export vào đúng nhóm của barrel | `src/components/ui/index.ts` |
| 4 | Trang docs, code cắt bằng `#region` | `src/docs/registry/content-search.tsx` |
| 5 | Mô tả tiếng Anh cho 2 slug | `src/docs/i18n/en/components.ts` |
| 6 | Test: khớp không dấu, ↓/Enter/Esc, ARIA combobox, ngữ nghĩa `<figure>` | `Autocomplete.test.tsx` |
| 7 | `check:examples`, `check:props`, axe theo slug → sửa vùng cuộn không focus được mà axe báo | — |
| 8 | 2 changeset `minor` (mỗi component một file); sửa ví dụ SearchBox chỉ là docs → không cần changeset | `.changeset/*.md` |
| 9 | PR vào `next`; maintainer phát hành `0.7.0-next.N` khi muốn cho người dùng thử | — |

Bài học rút ra: Radix Popover tự bắt Esc ở cấp document trước ô nhập — đóng popover qua `onOpenChange`, đừng chỉ nghe
`onKeyDown`; file có thể dùng CRLF — script sửa hàng loạt phải chuẩn hoá xuống dòng.

## 10 điều hay sai nhất

| Sai | Đúng |
|---|---|
| `bg-[#c2347a]`, `p-[12px]`, `duration-[200ms]` | `bg-brand-background`, `p-M`, `duration-normal` |
| `ml-2`, `left-0`, `text-left` | `ms-S`, `inset-s-0`, `text-start` |
| `start-L`, `data-[disabled]:` | `inset-s-L`, `data-disabled:` (`npm run lint:classes -- --fix`) |
| `outline-none` không thay thế | giữ focus ring `focus-visible:outline-stroke-focus` |
| Icon chỉ hướng không lật | `rtl:-scale-x-100` |
| Đọc `Date.now()` / `window` / `matchMedia` khi render | effect, hoặc `useSyncExternalStore` + server snapshot |
| `useLayoutEffect` thẳng | `useIsomorphicLayoutEffect` (`_internal/`) |
| Tự viết popup / menu | Radix primitive + `usePortalThemeProps()` |
| Nút chỉ có icon không tên | `aria-label` tiếng Việt |
| Đổi tên prop ngay | thêm prop mới + `warnDeprecated()`, xoá ở major — xem [Phiên bản](https://trandat1114.github.io/Yugen-UI/#/concepts/versioning) |

## Yugen Labs

Component vượt ngoài Fluent 2 (AI kit, Chart, Trace, DataGrid…) nằm trong nhóm **Yugen Labs**, có luật riêng ở
Design.md §7.1 (ví dụ Chart: màu phân loại thứ tự cố định, một trục Y, luôn có bảng dữ liệu tương đương).
