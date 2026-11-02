---
"yugen-ui": minor
---

Export nhóm hook dùng chung mà chính các component dùng: `useControllableState`, `useDisclosure`, `useLocalStorage` (an toàn SSR, đồng bộ giữa các tab), `useClipboard`, `useHotkeys` (bỏ qua ô nhập, mũi tên theo chiều chữ khi RTL), `useDebouncedValue`, `useIntersection` và `useElementSize`, cùng `useMediaQuery` (trước nằm trong Sheet). Trang docs "Hooks" có ví dụ cho từng hook; ToggleButton, Pagination, CodeBlock và DescriptionList chuyển sang dùng bản chung.
