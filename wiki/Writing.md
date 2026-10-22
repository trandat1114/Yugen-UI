# Writing · Viết nội dung

Áp dụng cho trang docs (vi + en), template, thông báo của CLI, README, mục Có gì mới và changeset.

## Nguyên tắc

1. **Nói người đọc làm được gì.** Câu mở đầu trả lời "dùng để làm gì", không giới thiệu lan man.
2. **Một ý mỗi câu.** Câu dài hơn hai dòng thì tách.
3. **Không lặp lại thứ đã hiện ngay bên cạnh.** Tab, nút, tiêu đề đã nói thì đoạn văn không nói lại.
4. **Không lạc đề.** Công cụ ngoài dự án (giget, …) không có chỗ trong docs của Yugen.
5. **Không từ ngữ quảng cáo**: "mạnh mẽ", "tuyệt vời", "đã nở hoa". Không gạch ngang ( — ) để chêm ý phụ. Không liệt kê ba ý cho có nhịp.
6. **Không nói điều hiển nhiên** ("hover để…", "bấm vào nút để…").
7. **Gọi đúng tên** như người dùng thấy (bảng dưới).
8. **Fluent 2** chỉ nhắc ở phần Ghi công và trang Chuyển từ Fluent UI.

## Tên gọi

| Dùng | Không dùng |
|---|---|
| `yugen-ui` (gói npm), Yugen UI (sản phẩm) | Yugen-UI, YugenUI |
| `@yugen-ui/cli` | CLI yugen, yugen CLI |
| `create-yugen-ui` | trình tạo app Yugen |
| Có gì mới · What's new | Changelog (khi nói về trang docs) |
| Starter, SaaS, Blog, Dashboard, AI chat | "Sakura Studio · Yugen UI", "Yugen UI · Dashboard" |

Lệnh luôn chạy được trên mọi shell: không nối bằng `&&`, không dùng `npm create … -- --tuỳ-chọn` (PowerShell bỏ mất `--`). Dùng `npx create-yugen-ui@latest my-app --template starter`, mỗi lệnh một dòng.

## Tiếng Việt

- Tự nhiên, rõ, ngắn. Đọc to lên nghe như người nói, không như bản dịch.
- Giữ thuật ngữ tiếng Anh khi không có từ Việt thông dụng: theme, token, props, component, template.
- Viết hoa chữ đầu câu và tên riêng, không viết hoa mỗi từ trong tiêu đề.
- Dùng "bạn" khi cần xưng hô; tránh "chúng tôi".

## Tiếng Anh

- Plain words, short sentences, sentence case for headings.
- Active voice; "you" for the reader.
- Same facts as the Vietnamese page. Translate the meaning, not word by word.

## Trước / sau

| Trước | Sau | Vì sao |
|---|---|---|
| Muốn sở hữu mã nguồn? | Cần tuỳ biến sâu? | Nói mức độ tuỳ biến, không nói chuyện sở hữu |
| theme đã ghi nhớ | lưu theme người dùng chọn | Rõ ai làm gì |
| mọi thứ đã nối sẵn | cấu hình sẵn sàng | Từ tự nhiên hơn |
| Ứng dụng của bạn đã nở hoa. | Dự án đã chạy. Sửa `src/Welcome.tsx` để bắt đầu. | Nói việc tiếp theo, không ẩn dụ |
| …kèm trang chào hoa anh đào cho thấy Yugen UI làm được gì — xoá đi khi bắt đầu viết. | (bỏ) | Gạch ngang chêm ý, không thêm thông tin |
| Tab npm / pnpm / yarn / bun + khối code liệt kê cùng lệnh cho từng trình quản lý gói | Chỉ giữ tab | Lặp nội dung |
| "Dựa trên Fluent 2, không phải sản phẩm của Microsoft" ở footer mọi trang | Chỉ ở Ghi công | Đã có ở trang giới thiệu |

## Changeset, CHANGELOG và Có gì mới

- **Changeset** (tiếng Anh): một đoạn ngắn cho người dùng gói. Nói đổi gì, ảnh hưởng gì. Không nói chuyện nội bộ (tên file, PR) trừ khi người dùng cần biết.
- **Có gì mới** (`src/docs/news.ts`, tiếng Việt): tiêu đề vài từ, tóm tắt một câu, mỗi mục một thay đổi kèm `href` tới trang docs. Bản CLI ghi vào `CLI_NEWS` / `CREATE_NEWS`.
- Thay đổi phá vỡ: ghi rõ cách chuyển.

## Checklist cho PR có đổi nội dung

- [ ] Không có câu lặp lại tab, nút hay tiêu đề ngay bên cạnh
- [ ] Không có gạch ngang chêm ý, từ quảng cáo, hay điều hiển nhiên
- [ ] Tên gọi đúng bảng trên; lệnh chạy được trên PowerShell
- [ ] Bản tiếng Việt đọc tự nhiên; bản tiếng Anh cùng nội dung
- [ ] Fluent 2 không xuất hiện ngoài Ghi công / trang chuyển đổi
