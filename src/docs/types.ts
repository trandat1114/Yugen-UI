import type { ReactNode } from "react";

export interface Example {
  title: string;
  description?: string;
  code: string;
  /** Code dùng chung (dữ liệu / hàm mẫu) cần thêm vào trước `code` để chạy độc lập — StackBlitz, check:examples. */
  setup?: string;
  render: () => ReactNode;
}

export interface PropDoc {
  name: string;
  type: string;
  defaultValue?: string;
  description: string;
}

/** Thứ tự nhóm trong sidebar và trang chủ. */
export const CATEGORIES = [
  "Hành động",
  "Nhập liệu",
  "Điều hướng",
  "Hiển thị dữ liệu",
  "Phản hồi",
  "Bề mặt & overlay",
  "Bố cục",
  "Chuyển động",
  "Tiện ích",
  "Yugen Labs",
] as const;

export type ComponentCategory = (typeof CATEGORIES)[number];

export interface ComponentDoc {
  slug: string;
  name: string;
  category: ComponentCategory;
  lead: string;
  description: string;
  importCode: string;
  hero: Example;
  examples: Example[];
  dos: string[];
  donts: string[];
  props: PropDoc[];
}

/**
 * Phần nạp sẵn của một trang component (sidebar, trang chủ, command palette, header trang) — trích lúc build,
 * không kéo theo demo / code mẫu. `file`: file trong src/docs/registry chứa doc (nạp lười theo file).
 */
export type ComponentMeta = Pick<ComponentDoc, "slug" | "name" | "category" | "lead"> & { file: string };

/** Nhóm trang "Khái niệm" (tương đương mục Concepts của Fluent UI Storybook). */
export const CONCEPT_GROUPS = ["Bắt đầu", "Nhà phát triển", "Khả năng tiếp cận", "Yugen Labs", "Chuyển đổi"] as const;
export type ConceptGroup = (typeof CONCEPT_GROUPS)[number];

export interface ConceptMeta {
  /** Dùng trong URL: /concepts/<slug> */
  slug: string;
  title: string;
  group: ConceptGroup;
  order: number;
  /** Một câu dẫn hiển thị dưới tiêu đề. */
  lead: string;
  /** Mục lục "Trên trang này" — id phải trùng id của DocSection trong trang. */
  toc: { id: string; label: string }[];
}
