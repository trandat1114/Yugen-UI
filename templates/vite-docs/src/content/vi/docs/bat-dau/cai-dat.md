---
title: Cài đặt
description: Cài SDK TypeScript và công cụ dòng lệnh, đặt các biến môi trường mà chúng đọc.
order: 2
---

## Yêu cầu

- Node.js 20 trở lên, hoặc Bun 1.1 trở lên.
- Một workspace Sakura Notes ở gói bất kỳ. Gói miễn phí đã có quyền dùng API.

## Cài SDK

```npm
npm install @sakura-notes/sdk
```

Gói có sẵn ES module và type TypeScript, không có phụ thuộc nào, chạy được trên Node.js, Bun, Deno và các runtime edge như
Cloudflare Workers.

## Cài CLI

Thêm CLI vào dự án dưới dạng devDependency để cả nhóm dùng cùng một phiên bản:

```npm
npm install -D @sakura-notes/cli
```

Hoặc chạy một lần mà không cần cài:

```npm
npx @sakura-notes/cli login
```

## Biến môi trường

Hai công cụ đọc cùng các biến, nên script và CLI dùng chung một cấu hình.

| Biến | Bắt buộc | Mô tả |
| --- | --- | --- |
| `SAKURA_API_KEY` | Có | Secret key tạo ở **Cài đặt › API key** |
| `SAKURA_WORKSPACE` | Không | Id workspace mặc định, cho key dùng được nhiều workspace |
| `SAKURA_API_URL` | Không | Địa chỉ API khác, ví dụ một proxy |

```bash title=.env
SAKURA_API_KEY=sk_live_4f8a…
SAKURA_WORKSPACE=ws_2h7d
```

> [!WARNING]
> Đừng bao giờ commit secret key. Thêm `.env` vào `.gitignore` và lưu key trong phần cấu hình bí mật của nơi bạn deploy.

## Kiểm tra cấu hình

```bash
npx sakura whoami
```

Lệnh này in ra workspace và phạm vi của key. Nếu báo lỗi, key đang thiếu hoặc đã bị thu hồi: xem
[Lỗi và giới hạn](/tham-chieu-api/loi-va-gioi-han/).
