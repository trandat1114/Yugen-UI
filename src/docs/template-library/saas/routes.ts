import type * as React from "react";
import { isPageId, type PageId } from "./pages";

/** Đường dẫn thật theo History API: `/` là Tổng quan, `/<id>` là các trang còn lại. Dưới thư mục con theo `base` của Vite. */
const BASE = import.meta.env.BASE_URL;

export const pathOf = (page: PageId) => (page === "overview" ? BASE : `${BASE}${page}`);

/** Trang của một đường dẫn; `undefined` khi đường dẫn không thuộc app. */
export function pageFromPath(pathname: string): PageId | undefined {
  const rest = (pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\//, "")).replace(/\/$/, "");
  if (rest === "" || rest === "index.html") return "overview";
  return isPageId(rest) && rest !== "overview" ? rest : undefined;
}

/** Link kiểu cũ `#/billing` (trước khi có đường dẫn thật) — vẫn mở đúng trang. */
export function pageFromLegacyHash(hash: string): PageId | undefined {
  const id = hash.replace(/^#\/?/, "");
  return isPageId(id) ? id : undefined;
}

/** Click thường (không Ctrl / ⌘ / Shift / chuột giữa): app tự đổi trang; còn lại để trình duyệt mở tab mới. */
export const isPlainClick = (e: React.MouseEvent) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
