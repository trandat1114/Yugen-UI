---
title: Xác thực
description: Gửi API key dưới dạng bearer token, chọn phạm vi cho key và đổi key mà không gián đoạn.
order: 1
---

Mọi request đều cần API key. Key thuộc về một workspace và được tạo ở **Cài đặt › API key**.

## Gửi key

Đặt key vào header `Authorization` dưới dạng bearer token. Request thiếu key, hoặc dùng key đã thu hồi, nhận mã `401`.

```bash
curl https://api.sakuranotes.example/v1/notebooks \
  -H "Authorization: Bearer $SAKURA_API_KEY"
```

SDK và CLI tự đọc `SAKURA_API_KEY` và gửi header này.

## Loại key

| Tiền tố | Loại | Dùng ở đâu |
| --- | --- | --- |
| `sk_live_` | Secret key | Server, script và CI, không bao giờ dùng trong trình duyệt |
| `sk_test_` | Key thử | Workspace sandbox có dữ liệu mẫu; không tính phí |

## Phạm vi

Key chỉ làm được những gì phạm vi của nó cho phép. Hãy cấp ít phạm vi nhất đủ cho công việc.

| Phạm vi | Cho phép |
| --- | --- |
| `notes:read` | Xem danh sách và đọc ghi chú, sổ ghi chú |
| `notes:write` | Tạo, sửa, chuyển và xoá ghi chú |
| `sharing:write` | Chia sẻ sổ và quản lý link công khai |
| `webhooks:write` | Tạo và xoá endpoint webhook |

Request vượt ngoài phạm vi của key nhận mã `403` kèm mã lỗi `missing_scope`.

## Đổi key

1. Tạo key mới với cùng phạm vi.
2. Deploy key mới song song với key cũ rồi chuyển ứng dụng sang key mới.
3. Thu hồi key cũ. Việc thu hồi có hiệu lực ngay.

> [!TIP]
> **Cài đặt › API key** hiện lần cuối mỗi key được dùng, nhờ đó bạn biết lúc nào key cũ không còn request nào.
