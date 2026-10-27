---
title: Bắt đầu nhanh
description: Tạo API key, kết nối SDK và viết ghi chú đầu tiên trong khoảng năm phút.
order: 3
---

Hướng dẫn này tạo một ghi chú trong sổ bằng một script nhỏ. Bạn cần Node.js 20 và SDK
([Cài đặt](/bat-dau/cai-dat/)).

## 1. Tạo API key

Trong ứng dụng, mở **Cài đặt › API key** và chọn **Key mới**. Đặt tên, chọn phạm vi `notes:write` rồi sao chép key: key
chỉ hiện một lần.

> [!TIP]
> Mỗi ứng dụng hay script dùng một key riêng. Khi thu hồi một key, những thứ khác vẫn chạy bình thường.

## 2. Tạo client

```ts title=src/sakura.ts
import { SakuraNotes } from "@sakura-notes/sdk";

export const sakura = new SakuraNotes({
  apiKey: process.env.SAKURA_API_KEY!,
});
```

## 3. Viết một ghi chú

Lấy id của sổ trên thanh địa chỉ của ứng dụng (`/nb_…`) hoặc bằng `npx sakura notebooks list`, rồi:

```ts tab=TypeScript
import { sakura } from "./sakura";

const note = await sakura.notes.create({
  notebookId: "nb_8f2k",
  title: "Tổng kết sprint",
  body: "## Quyết định\n\n- Ra mắt tìm kiếm vào thứ Sáu",
  tags: ["sprint", "tong-ket"],
});

console.log(note.id); // note_5c1m…
```

```bash tab=curl
curl https://api.sakuranotes.example/v1/notes \
  -H "Authorization: Bearer $SAKURA_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"notebookId":"nb_8f2k","title":"Tổng kết sprint","tags":["sprint"]}'
```

```bash tab=CLI
npx sakura notes new "Tổng kết sprint" --notebook nb_8f2k --tag sprint
```

Ghi chú hiện ngay trong ứng dụng với mọi người mở được sổ đó.

## 4. Đọc lại

```ts
const { data } = await sakura.notes.list({ notebookId: "nb_8f2k", limit: 5 });

for (const note of data) console.log(note.title, note.updatedAt);
```

## Tiếp theo

- Sắp xếp ghi chú và chọn ai được xem: [Sắp xếp ghi chú](/huong-dan/sap-xep-ghi-chu/) và
  [Chia sẻ và phân quyền](/huong-dan/chia-se-va-phan-quyen/).
- Nhận thay đổi ngay khi chúng xảy ra bằng [webhook](/huong-dan/webhook/).
