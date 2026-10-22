/**
 * Ghi ROADMAP.md từ src/docs/roadmap.ts (cùng dữ liệu với trang Cộng đồng › Lộ trình).
 *
 *   npm run roadmap   # sau khi sửa roadmap.ts; src/docs/roadmap.test.ts báo lỗi nếu ROADMAP.md lệch
 */
import fs from "node:fs";
import path from "node:path";
import { roadmapMarkdown } from "../src/docs/roadmap";

const file = path.resolve(__dirname, "../ROADMAP.md");
fs.writeFileSync(file, roadmapMarkdown());
console.log(`roadmap: ghi ${path.relative(process.cwd(), file)}`);
