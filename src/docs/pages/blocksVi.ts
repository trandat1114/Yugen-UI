import { toBlocks, type BlockModule } from "./BlocksPage";

/**
 * Block bản tiếng Việt cho trang /vi/blocks (BlocksPage nạp lười file này): cùng các file trong block-library qua `?lang=vi`
 * — plugin yugenDemoLang (vite.plugins.ts) thay chữ theo từ điển block-library/vi/<file>.json. Mã nguồn cho tab Code cũng là
 * bản đã dịch, khớp với preview.
 *
 * Dùng `toBlocks` của BlocksPage (đã nạp khi file này được gọi) cũng giữ cho chunk tiếng Việt phụ thuộc đúng những module mà
 * trang Blocks phụ thuộc — Rolldown không phải chia lại chunk chung của trang tiếng Anh.
 */
export const blocks = toBlocks(
  import.meta.glob<BlockModule>("../block-library/*.tsx", { eager: true, query: "?lang=vi" }),
  import.meta.glob<string>("../block-library/*.tsx", { eager: true, query: "?lang=vi&raw", import: "default" }),
);
