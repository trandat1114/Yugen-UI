---
title: Giới thiệu
description: Sakura Notes là gì, dữ liệu được tổ chức ra sao, và ba cách làm việc với nó từ mã của bạn.
order: 1
---

Sakura Notes là ứng dụng ghi chú cho nhóm. Ghi chú viết bằng Markdown, nằm trong các sổ ghi chú dùng chung và đồng bộ tới
thiết bị của mọi thành viên trong một, hai giây. Việc gì làm được trong ứng dụng thì mã của bạn cũng làm được.

## Dữ liệu được tổ chức thế nào

- **Workspace** là nhóm của bạn. Thanh toán, thành viên và API key thuộc về workspace.
- **Sổ ghi chú** (notebook) gom các ghi chú trong một workspace, ví dụ *Sản phẩm* hay *Biên bản họp*. Quyền truy cập đặt
  theo từng sổ.
- **Ghi chú** (note) là một tài liệu Markdown có tiêu đề, thẻ và lịch sử chỉnh sửa.

Mỗi đối tượng có id kèm tiền tố để dễ phân biệt trong log: `ws_` cho workspace, `nb_` cho sổ ghi chú và `note_` cho ghi
chú.

## Ba cách dùng từ mã

| Công cụ | Dùng cho |
| --- | --- |
| [SDK](/bat-dau/cai-dat/) | Ứng dụng TypeScript và JavaScript, trên server hoặc trong script |
| [REST API](/tham-chieu-api/ghi-chu/) | Mọi ngôn ngữ; SDK chỉ là một lớp mỏng bên trên |
| [CLI](/huong-dan/dung-cli/) | Terminal và CI: xuất, nhập và sửa nhanh |

Cả ba dùng chung [API key](/tham-chieu-api/xac-thuc/) và chung giới hạn số request.

## Đọc tiếp

Mới bắt đầu? Trang [bắt đầu nhanh](/bat-dau/bat-dau-nhanh/) tạo một ghi chú từ mã trong khoảng năm phút. Nếu đã có key,
xem thẳng [các endpoint ghi chú](/tham-chieu-api/ghi-chu/).
