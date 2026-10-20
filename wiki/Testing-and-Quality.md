# Testing and Quality · Kiểm thử & CI

## Lệnh

| Lệnh | Kiểm tra gì |
|---|---|
| `npm run typecheck` | TypeScript strict (app + config) |
| `npm run lint:classes` | Class Tailwind ở dạng canonical (`-- --fix` để tự sửa) |
| `npm test` | Vitest: logic, bàn phím, SSR / hydration (~470 test) |
| `npm run test:e2e` | Playwright: axe trên mọi trang docs (sáng / tối, + tương phản cao / RTL), kéo-thả, chạm |
| `npm run test:visual` | So ảnh chụp với bản chuẩn (`e2e/__screenshots__/`, theo hệ điều hành) |
| `npm run check:examples` | Mọi ví dụ docs typecheck được khi chép ra dùng với `yugen-ui` |
| `npm run check:props` | Bảng props trên docs khớp type thật |
| `npm run check:release` | `package.json` = `news.ts` = `CHANGELOG.md` |
| `npm run size` | Ngân sách dung lượng (gzip) — sau `npm run build:lib` |
| `node scripts/sync-templates.mjs --check` | Template khớp block |

## CI (`.github/workflows/ci.yml`)

| Job | Chạy |
|---|---|
| Build · Node 20 / 22 | typecheck, lint:classes, các check:*, sync-templates, build lib + docs, pack, size |
| Unit tests (React 18) | `npm test` |
| React 19 | cài React 19 tạm thời → typecheck, test, build:lib |
| E2E (Playwright + axe) | chromium, upload `playwright-report` khi lỗi |

## Sửa CI đỏ — các ca hay gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| React 19: `Type '…' is not assignable to type 'Ref<…>'` | ref callback trả về giá trị (`ref={(el) => list.push(el)}`) | viết thân hàm `{ list.push(el); }` |
| React 19: `Expected 1 arguments` ở `useRef` | `useRef<T>()` không có giá trị đầu | `useRef<T \| undefined>(undefined)` |
| `sync-templates --check` lệch | đổi block hoặc version mà chưa sinh lại | `node scripts/sync-templates.mjs` |
| `check:release` lỗi | thiếu mục trong `src/docs/news.ts` / CHANGELOG | thêm mục cho version mới |
| `check:examples` lỗi | ví dụ dùng biến chỉ có trong file docs | thêm `setup: declarationsOf(RAW, [...])` |
| axe: `aria-allowed-attr` | thuộc tính ARIA không hợp lệ với role (vd. `aria-orientation` trên `<ol>`) | đổi sang `data-*` hoặc đúng role |
| Visual khác biệt | đổi giao diện có chủ đích | `npm run test:visual -- --update-snapshots`; Linux: workflow **Visual** với `update` |
| size-limit vượt | thêm dependency / component lớn | tối ưu, hoặc nâng `limit` trong `.size-limit.cjs` kèm lý do trong PR |

## Thử với React 19 trên máy

Đừng cài React 19 vào repo đang làm. Chép repo ra thư mục khác (bỏ `node_modules`), `npm ci`, rồi
`npm i --no-save react@^19 react-dom@^19 @types/react@^19 @types/react-dom@^19` và chạy `npx tsc -b && npx vitest run`.
