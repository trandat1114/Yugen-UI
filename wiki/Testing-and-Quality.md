# Testing and Quality · Kiểm thử & CI

## Lệnh

| Lệnh | Kiểm tra gì |
|---|---|
| `npm run typecheck` | TypeScript strict (app + config) |
| `npm run lint:classes` | Class Tailwind ở dạng canonical (`-- --fix` để tự sửa) |
| `npm test` | Vitest: logic, bàn phím, SSR / hydration (~470 test) |
| `npm run test:e2e` | Playwright: axe trên mọi trang docs (sáng / tối, + tương phản cao / RTL), kéo-thả, chạm |
| `npm run test:visual` | So ảnh chụp với bản chuẩn (chỉ ảnh Linux được commit; CI chạy trên PR đổi giao diện) |
| `npm run test:engines` | Tương tác trên Firefox, Safari desktop và iPhone (WebKit) |
| `npm run check:examples` | Mọi ví dụ docs typecheck được khi chép ra dùng với `yugen-ui` |
| `npm run check:props` | Bảng props trên docs khớp type thật |
| `npm run check:release` | `package.json` = `news.ts` = `CHANGELOG.md` |
| `npm run size` | Ngân sách dung lượng (gzip) — sau `npm run build:lib` |
| `node scripts/sync-templates.mjs --check` | Template khớp block |

## CI (`.github/workflows/ci.yml`)

Push / PR chỉ đổi tài liệu để đọc (README, wiki, CONTRIBUTING, PR / issue template…) không chạy CI, Browser engines và
Docs (`paths-ignore`). `CHANGELOG.md`, `ROADMAP.md` và Markdown trong `src/` / `templates/` vẫn chạy CI vì có check đọc
chúng. Thêm file docs mới vào danh sách trong cả ba workflow. Nếu sau này bật required status checks, check của workflow
bị bỏ qua sẽ treo ở "Expected": khi đó chuyển sang lọc trong job thay vì `paths-ignore`.

| Job | Chạy |
|---|---|
| Build · Node 22 / 24 / 26 | typecheck, lint:classes, các check:*, sync-templates, build lib + docs, pack, size |
| Unit tests (React 19) | `npm test` |
| React 18 | cài React 18.3 tạm thời → typecheck, test, build:lib |
| E2E · shard 1/3 … 3/3 | `test:e2e --shard=n/3` song song (blob report; `test-results-n` khi lỗi) |
| E2E (Playwright + axe) | gộp blob report thành một báo cáo HTML (`playwright-report`); đỏ nếu một shard đỏ — tên check cố định |

Workflow riêng **Browser engines** (`engines.yml`): `npm run test:engines` hằng tuần (thứ Hai), trên PR vào `main`, trên PR
vào `next` có đổi `e2e/` / `playwright.config.ts` / chính workflow, và khi gọi tay. Bản chạy theo lịch hỏng thì mở issue "E2E on Firefox / WebKit is failing" (hoặc bình luận nếu đang mở), xanh
lại thì tự đóng. Khác biệt giữa engine ghi ở trang docs Trình duyệt & nền tảng › Kiểm thử trên từng engine.

## Sửa CI đỏ — các ca hay gặp

| Triệu chứng | Nguyên nhân thường gặp | Cách sửa |
|---|---|---|
| React 19: `Type '…' is not assignable to type 'Ref<…>'` | ref callback trả về giá trị (`ref={(el) => list.push(el)}`) | viết thân hàm `{ list.push(el); }` |
| React 19: `Expected 1 arguments` ở `useRef` | `useRef<T>()` không có giá trị đầu | `useRef<T \| undefined>(undefined)` |
| `sync-templates --check` lệch | đổi block hoặc version mà chưa sinh lại | `node scripts/sync-templates.mjs` |
| `check:release` lỗi | thiếu mục trong `src/docs/news.ts` / CHANGELOG | thêm mục cho version mới |
| `check:examples` lỗi | ví dụ dùng biến chỉ có trong file docs | thêm `setup: declarationsOf(RAW, [...])` |
| axe: `aria-allowed-attr` | thuộc tính ARIA không hợp lệ với role (vd. `aria-orientation` trên `<ol>`) | đổi sang `data-*` hoặc đúng role |
| Visual khác biệt | đổi giao diện có chủ đích | Workflow **Visual regression** trên nhánh, tick `update` → tải `visual-screenshots` → chép vào `e2e/__screenshots__/` → commit. Ảnh diff: artifact `visual-test-results` |
| size-limit vượt | thêm dependency / component lớn | tối ưu, hoặc nâng `limit` trong `.size-limit.cjs` kèm lý do trong PR |

## Bản Node.js trong CI

Build và CLI chạy trên mọi bản Node.js đã phát hành và chưa EOL (LTS + Current); các job chạy một bản dùng Active LTS
mới nhất. `node scripts/node-versions.mjs` so workflow với [lịch phát hành](https://github.com/nodejs/Release) (exit 1 nếu
lệch, `--write` để sửa); workflow `node-versions.yml` chạy hằng tuần và mở PR vào `next`. `engines` của CLI không tự đổi:
nâng là bản minor của CLI.

## Thử với React 18 trên máy

Repo chạy React 19. Muốn kiểm tra React 18.3 (vẫn được hỗ trợ): chép repo ra thư mục khác (bỏ `node_modules`), `npm ci`,
rồi `npm i --no-save react@^18.3 react-dom@^18.3 @types/react@^18.3 @types/react-dom@^18.3` và chạy
`npx tsc -b && npx vitest run`.
