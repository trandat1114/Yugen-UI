---
title: Chia sẻ và phân quyền
description: Các vai trò, chia sẻ sổ ghi chú với người khác, link công khai và thu hồi quyền.
order: 2
---

Quyền truy cập đặt theo từng sổ. Mọi người trong workspace thấy danh sách sổ, nhưng chỉ mở được những sổ đã chia sẻ với
mình.

## Vai trò

| Vai trò | Đọc | Bình luận | Sửa ghi chú | Quản lý quyền |
| --- | --- | --- | --- | --- |
| Người xem | Có | Không | Không | Không |
| Người bình luận | Có | Có | Không | Không |
| Người sửa | Có | Có | Có | Không |
| Chủ sở hữu | Có | Có | Có | Có |

Quản trị viên workspace là chủ sở hữu của mọi sổ.

## Chia sẻ một sổ

```ts
await sakura.notebooks.share("nb_8f2k", {
  email: "lan@example.com",
  role: "editor",
});
```

Người ngoài workspace nhận lời mời qua email và tham gia với tư cách khách. Khách chỉ thấy những gì được chia sẻ với họ,
và không tính phí ở gói nào.

## Link công khai

Link công khai cho phép bất kỳ ai có địa chỉ đọc một sổ mà không cần đăng nhập. Mặc định link tắt, và chỉ chủ sở hữu bật
được.

```ts
const { url } = await sakura.notebooks.publish("nb_8f2k", { expiresIn: "30d" });
```

> [!NOTE]
> Trang công khai chỉ đọc và không được công cụ tìm kiếm lập chỉ mục. Bình luận và lịch sử vẫn riêng tư.

## Thu hồi quyền

```ts
await sakura.notebooks.unshare("nb_8f2k", { email: "lan@example.com" });
await sakura.notebooks.unpublish("nb_8f2k");
```

Thu hồi quyền có hiệu lực ngay trên mọi thiết bị. Bản họ đã xuất ra trước đó không bị ảnh hưởng.
