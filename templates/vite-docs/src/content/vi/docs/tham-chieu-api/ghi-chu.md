---
title: Ghi chú
description: Đối tượng ghi chú và các endpoint để liệt kê, tạo, sửa và xoá ghi chú.
order: 2
---

Base URL: `https://api.sakuranotes.example/v1`. Request và response đều là JSON.

## Đối tượng ghi chú

```json
{
  "id": "note_5c1m",
  "notebookId": "nb_8f2k",
  "title": "Tổng kết sprint",
  "body": "## Quyết định\n\n- Ra mắt tìm kiếm vào thứ Sáu",
  "tags": ["sprint", "tong-ket"],
  "pinned": false,
  "archived": false,
  "createdAt": "2026-10-27T09:41:00Z",
  "updatedAt": "2026-10-27T10:02:00Z"
}
```

## Liệt kê ghi chú

`GET /notes` trả về các ghi chú, mới sửa gần nhất xếp trước, mỗi lần 20 ghi chú.

| Tham số | Kiểu | Mô tả |
| --- | --- | --- |
| `notebookId` | string | Chỉ ghi chú của sổ này |
| `tag` | string | Chỉ ghi chú có thẻ này |
| `limit` | number | Từ 1 đến 100, mặc định 20 |
| `cursor` | string | `nextCursor` của trang trước |

```bash tab=curl
curl "https://api.sakuranotes.example/v1/notes?notebookId=nb_8f2k&limit=20" \
  -H "Authorization: Bearer $SAKURA_API_KEY"
```

```ts tab=TypeScript
const page = await sakura.notes.list({ notebookId: "nb_8f2k", limit: 20 });
// page.data: Note[], page.nextCursor: string | null
```

## Tạo ghi chú

`POST /notes` với `notebookId` và `title`; `body` (Markdown) và `tags` không bắt buộc. Trả về ghi chú mới với mã `201`.

```bash tab=curl
curl https://api.sakuranotes.example/v1/notes \
  -H "Authorization: Bearer $SAKURA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"notebookId":"nb_8f2k","title":"Họp nhìn lại","tags":["sprint"]}'
```

```ts tab=TypeScript
const note = await sakura.notes.create({ notebookId: "nb_8f2k", title: "Họp nhìn lại", tags: ["sprint"] });
```

## Sửa ghi chú

`PATCH /notes/{id}` với các trường cần đổi. Trường nào bỏ trống thì giữ nguyên giá trị.

```ts
await sakura.notes.update("note_5c1m", { title: "Tổng kết sprint 42", pinned: true });
```

## Xoá ghi chú

`DELETE /notes/{id}` trả về `204`. Ghi chú đã xoá nằm trong thùng rác của workspace 30 ngày và khôi phục được từ ứng dụng.

```ts
await sakura.notes.delete("note_5c1m");
```
