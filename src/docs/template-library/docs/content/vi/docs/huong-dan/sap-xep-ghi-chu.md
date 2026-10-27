---
title: Sắp xếp ghi chú
description: Sổ ghi chú và thẻ, cách ghim, lưu trữ và chuyển ghi chú từ mã.
order: 1
---

## Sổ ghi chú

Mỗi sổ chứa các ghi chú về một chủ đề. Tạo một sổ cho mỗi nhóm, dự án hay loạt cuộc họp; một workspace có bao nhiêu sổ
cũng được.

```ts
const notebook = await sakura.notebooks.create({
  name: "Duyệt thiết kế",
  parentId: "nb_1a4z", // không bắt buộc: đặt trong một sổ khác
});
```

Sổ lồng được một cấp. Cây sâu hơn sẽ bị làm phẳng trong ứng dụng, nên hãy giữ cấu trúc nông.

## Thẻ

Thẻ xuyên qua các sổ. Mỗi ghi chú có tối đa 20 thẻ, viết thường, gồm chữ cái, chữ số và `-`.

```ts
await sakura.notes.update("note_5c1m", { tags: ["sprint", "quyet-dinh"] });

const decisions = await sakura.notes.list({ tag: "quyet-dinh" });
```

## Ghim và lưu trữ

Ghi chú được ghim luôn nằm đầu sổ. Ghi chú đã lưu trữ rời khỏi danh sách và kết quả tìm kiếm nhưng vẫn giữ lịch sử, và
khôi phục được bất cứ lúc nào.

| Trường | Kiểu | Tác dụng |
| --- | --- | --- |
| `pinned` | boolean | Giữ ghi chú ở đầu sổ |
| `archived` | boolean | Ẩn ghi chú khỏi danh sách và tìm kiếm |

```ts
await sakura.notes.update("note_5c1m", { pinned: true });
await sakura.notes.update("note_9d3x", { archived: true });
```

## Chuyển ghi chú

Đổi `notebookId` để chuyển ghi chú sang sổ khác. Bình luận và lịch sử đi theo ghi chú; người chỉ mở được sổ cũ sẽ không
còn thấy nó.

```ts
await sakura.notes.update("note_5c1m", { notebookId: "nb_3q9w" });
```
