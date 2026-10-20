# Component Guidelines · Viết component

Luật đầy đủ và bắt buộc nằm ở [`Design.md`](https://github.com/trandat1114/Yugen-UI/blob/main/Design.md). Trang này là
lối tắt khi bạn bắt tay vào làm.

## Thêm một component — từng bước

1. Mở / nhận một issue (`confirmed`, hoặc ý tưởng đã thống nhất ở Discussions **Ideas**).
2. `src/components/ui/<Name>/<Name>.tsx` — `forwardRef`, `className` cuối cùng trong `cn()`, JSDoc tiếng Việt, `displayName`.
3. Thêm `export * from "./<Name>/<Name>";` vào đúng nhóm trong `src/components/ui/index.ts`.
4. Trang docs: thêm `ComponentDoc` vào một file `src/docs/registry/*.tsx` — `slug`, `name`, `category`, `lead` là chuỗi literal;
   `code` của ví dụ phải chạy được khi chép ra (dùng `setup` cho dữ liệu dùng chung).
5. Test: `<Name>.test.tsx` cạnh component (hành vi, bàn phím, ARIA). Thêm case SSR vào `src/test/ssrCases.tsx` nếu có state phụ thuộc môi trường.
6. `npx changeset` → chọn `minor` (component mới) và viết một câu cho người dùng.
7. Chạy checklist ở [[Testing and Quality]] trước khi mở PR.

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
