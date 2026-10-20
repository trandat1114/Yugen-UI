# Changesets

Thư mục này do [Changesets](https://github.com/changesets/changesets) quản lý. Mỗi PR có thay đổi người dùng thấy
được (component, prop, token, CSS, sửa lỗi…) thêm **một file changeset** ở đây; docs, test, CI thuần thì không cần.

```bash
npx changeset          # chọn patch / minor, viết một câu tóm tắt cho người dùng → tạo .changeset/<tên-ngẫu-nhiên>.md
```

- `patch`: sửa lỗi, cải tiến nhỏ không đổi API. `minor`: component / prop / token mới — và, khi còn `0.x`, cả thay đổi
  phá vỡ API (ghi rõ "**Breaking:**" ở đầu tóm tắt). `major` dành cho 1.0 trở đi.
- Lúc phát hành, maintainer chạy `npx changeset version`: gộp mọi file ở đây vào `CHANGELOG.md` (mục `## x.y.z` mới
  chèn ngay dưới tiêu đề `# Changelog`), tăng `version` trong `package.json` rồi xoá các file đã dùng. Quy trình đầy
  đủ: [CONTRIBUTING.md](../CONTRIBUTING.md) và Design.md §8.

---

This folder is managed by [Changesets](https://github.com/changesets/changesets). Every PR with a user-facing change
adds a changeset (`npx changeset` → pick patch / minor → write a one-line, user-facing summary). Maintainers run
`npx changeset version` at release time; see [CONTRIBUTING.md](../CONTRIBUTING.md).
