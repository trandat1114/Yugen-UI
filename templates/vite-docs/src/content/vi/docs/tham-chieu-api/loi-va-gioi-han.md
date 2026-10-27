---
title: Lỗi và giới hạn
description: Định dạng lỗi, các mã lỗi có thể gặp, header giới hạn request và cách thử lại an toàn.
order: 3
---

## Định dạng lỗi

Request thất bại trả về mã `4xx` hoặc `5xx` kèm nội dung JSON:

```json
{
  "error": {
    "code": "missing_scope",
    "message": "This key cannot write notes. Add the notes:write scope.",
    "requestId": "req_3k9v"
  }
}
```

Gửi kèm `requestId` khi liên hệ bộ phận hỗ trợ.

## Mã lỗi

| Mã HTTP | Mã lỗi | Ý nghĩa |
| --- | --- | --- |
| 400 | `invalid_request` | Thiếu trường hoặc sai kiểu; `message` nêu tên trường |
| 401 | `invalid_key` | Key bị thiếu, gõ sai hoặc đã thu hồi |
| 403 | `missing_scope` | Key thiếu phạm vi (xem [Phạm vi](/tham-chieu-api/xac-thuc/#pham-vi)) |
| 404 | `not_found` | Đối tượng không tồn tại, hoặc key không thấy được nó |
| 409 | `conflict` | Ghi chú đã thay đổi kể từ lúc bạn đọc |
| 429 | `rate_limited` | Quá nhiều request; chờ rồi thử lại |
| 500 | `server_error` | Lỗi phía chúng tôi; thử lại sau |

Trong SDK, mọi lỗi là một `SakuraError` với cùng `status`, `code` và `requestId`.

## Giới hạn request

Mỗi key gửi được 100 request trong 10 giây. Response nào cũng cho biết bạn đang ở đâu:

| Header | Mô tả |
| --- | --- |
| `RateLimit-Limit` | Số request cho phép trong khung thời gian |
| `RateLimit-Remaining` | Số request còn lại trong khung |
| `RateLimit-Reset` | Số giây tới khi khung mới bắt đầu |

## Thử lại an toàn

Thử lại response `429` và `5xx` với thời gian chờ tăng dần. SDK đã tự làm việc này tối đa ba lần; với HTTP client của
riêng bạn:

```ts
async function withRetry<T>(request: () => Promise<Response>, attempts = 3): Promise<T> {
  for (let i = 0; ; i++) {
    const response = await request();
    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || i + 1 >= attempts) throw new Error(`HTTP ${response.status}`);
    const seconds = Number(response.headers.get("RateLimit-Reset") ?? 2 ** i);
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
}
```

> [!NOTE]
> Request `POST` thử lại được mà không tạo bản trùng khi có header `Idempotency-Key` với giá trị do bạn chọn.
