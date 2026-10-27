---
title: Dùng CLI
description: Đăng nhập, xem và tạo ghi chú từ terminal, xuất sổ ra file Markdown và chạy CLI trong CI.
order: 3
---

Lệnh `sakura` làm được các việc thường ngày của API ngay trong terminal. Cài cùng SDK
([Cài CLI](/bat-dau/cai-dat/#cai-cli)) hoặc chạy bằng `npx`.

## Đăng nhập

```npm
npx @sakura-notes/cli login
```

`login` mở trình duyệt, hỏi dùng workspace nào và lưu key vào keychain của hệ điều hành. Trên server, đặt
`SAKURA_API_KEY` thay cho bước này.

## Các lệnh

| Lệnh | Tác dụng |
| --- | --- |
| `sakura whoami` | Workspace và phạm vi của key hiện tại |
| `sakura notebooks list` | Các sổ bạn mở được |
| `sakura notes list --notebook <id>` | Ghi chú mới nhất của một sổ |
| `sakura notes new <title>` | Tạo ghi chú; nội dung đọc từ stdin |
| `sakura export <notebook>` | Ghi mọi ghi chú ra file Markdown |
| `sakura import <folder>` | Tạo hoặc cập nhật ghi chú từ file Markdown |

Lệnh nào cũng nhận `--json` để script đọc được kết quả.

## Xuất và nhập

```bash
npx sakura export nb_8f2k --out ./notes
```

Mỗi ghi chú thành một file `./notes/<title>.md`, id và thẻ nằm trong front matter. Sửa file xong thì gửi thay đổi lên. Ghi
chú được khớp theo id, nên file đã đổi tên vẫn cập nhật đúng ghi chú:

```bash
npx sakura import ./notes --notebook nb_8f2k
```

## Trong CI

Giữ một sổ khớp với một thư mục trong repository, ví dụ ghi chú phát hành:

```yaml title=.github/workflows/notes.yml
- run: npx @sakura-notes/cli import ./docs/releases --notebook nb_4r8t
  env:
    SAKURA_API_KEY: ${{ secrets.SAKURA_API_KEY }}
```
