---
title: Webhook
description: Nhận một request HTTP khi ghi chú thay đổi, kiểm tra request đến từ Sakura Notes và xử lý gửi lại.
order: 4
---

Webhook gửi một request `POST` tới server của bạn khi có việc xảy ra trong workspace, nên bạn không phải gọi API liên tục để
dò thay đổi.

## Tạo endpoint

```ts
const webhook = await sakura.webhooks.create({
  url: "https://example.com/hooks/sakura",
  events: ["note.created", "note.updated"],
});

console.log(webhook.secret); // whsec_…, chỉ hiện một lần
```

## Sự kiện

| Sự kiện | Gửi khi |
| --- | --- |
| `note.created` | Một ghi chú được tạo, trong ứng dụng hoặc qua API |
| `note.updated` | Tiêu đề, nội dung, thẻ hoặc sổ của ghi chú thay đổi |
| `note.deleted` | Một ghi chú bị xoá (không tính lưu trữ) |
| `notebook.shared` | Có người được cấp quyền vào một sổ |

Nội dung request là JSON:

```json
{
  "id": "evt_7h2p",
  "type": "note.updated",
  "createdAt": "2026-10-27T09:41:00Z",
  "data": { "noteId": "note_5c1m", "notebookId": "nb_8f2k" }
}
```

## Kiểm tra chữ ký

Mỗi request có header `Sakura-Signature`. Hãy kiểm tra trước khi tin nội dung: ai cũng gửi được request tới một URL công
khai.

```ts title=server.ts
import { verifyWebhook } from "@sakura-notes/sdk";

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("Sakura-Signature");
  const event = await verifyWebhook(body, signature, process.env.SAKURA_WEBHOOK_SECRET!);
  if (!event) return new Response("Invalid signature", { status: 400 });

  if (event.type === "note.updated") {
    // Sự kiện chỉ chứa id: đọc lại ghi chú để lấy nội dung.
  }
  return new Response(null, { status: 204 });
}
```

## Gửi lại

Trả về mã `2xx` trong vòng 10 giây. Nếu không, request được gửi lại sau 1 phút, 10 phút, 1 giờ và 6 giờ, sau đó sự kiện bị
bỏ. Cùng một sự kiện có thể đến hai lần: dùng `id` của nó để bỏ qua bản trùng.
