import { lazy, type ComponentType, type ReactNode } from "react";
import {
  ArrowDownload20Regular,
  Board20Regular,
  CalendarLtr20Regular,
  ChartMultiple20Regular,
  Mail20Regular,
  Payment20Regular,
  People20Regular,
  Settings20Regular,
  Sparkle20Regular,
} from "@fluentui/react-icons";
import { Button, toast } from "@/components/ui";
import type { Content, PageId } from "./content/types";

export type { PageId };

/** Props của mọi trang trong pages/<id>.tsx. */
export interface PageProps {
  t: Content;
}

type PageModule = { default: ComponentType<PageProps> };

// Mỗi trang một module nạp lười: lần tải đầu chỉ có trang đang mở, các trang khác nạp khi trình duyệt rảnh (preloadPages).
const LOADERS: Record<PageId, () => Promise<PageModule>> = {
  overview: () => import("./pages/overview"),
  analytics: () => import("./pages/analytics"),
  assistant: () => import("./pages/assistant"),
  inbox: () => import("./pages/inbox"),
  calendar: () => import("./pages/calendar"),
  team: () => import("./pages/team"),
  billing: () => import("./pages/billing"),
  settings: () => import("./pages/settings"),
};

/** Nạp trước mọi trang — App gọi khi trình duyệt rảnh sau lần render đầu, để chuyển trang không phải chờ. */
export function preloadPages() {
  for (const load of Object.values(LOADERS)) void load();
}

export const exportReport = (t: Content) => toast({ intent: "success", ...t.exportReport.toast });

export interface PageDef {
  id: PageId;
  icon: ReactNode;
  section: "workspace" | "manage";
  /** Số đếm trên sidebar (CounterBadge). */
  badge?: number;
  /** Nút cạnh tiêu đề trang. */
  actions?: (t: Content) => ReactNode;
  /** Nội dung trang (pages/<id>.tsx). Nhãn, tiêu đề và mô tả nằm trong content: `t.pages[id]`. */
  Page: ComponentType<PageProps>;
}

/**
 * Thêm trang mới: tạo pages/<id>.tsx, thêm id vào `PageId` và `pages` trong content/, rồi thêm một mục vào đây — sidebar,
 * bảng lệnh, breadcrumb và tiêu đề tab tự cập nhật.
 */
export const PAGES: PageDef[] = [
  {
    id: "overview",
    icon: <Board20Regular />,
    section: "workspace",
    actions: (t) => (
      <Button icon={<ArrowDownload20Regular />} onClick={() => exportReport(t)}>
        {t.exportReport.label}
      </Button>
    ),
    Page: lazy(LOADERS.overview),
  },
  { id: "analytics", icon: <ChartMultiple20Regular />, section: "workspace", Page: lazy(LOADERS.analytics) },
  { id: "assistant", icon: <Sparkle20Regular />, section: "workspace", Page: lazy(LOADERS.assistant) },
  { id: "inbox", icon: <Mail20Regular />, section: "workspace", badge: 3, Page: lazy(LOADERS.inbox) },
  { id: "calendar", icon: <CalendarLtr20Regular />, section: "workspace", Page: lazy(LOADERS.calendar) },
  { id: "team", icon: <People20Regular />, section: "manage", Page: lazy(LOADERS.team) },
  { id: "billing", icon: <Payment20Regular />, section: "manage", Page: lazy(LOADERS.billing) },
  { id: "settings", icon: <Settings20Regular />, section: "manage", Page: lazy(LOADERS.settings) },
];

export const PAGE_BY_ID = Object.fromEntries(PAGES.map((p) => [p.id, p])) as Record<PageId, PageDef>;

export const isPageId = (value: string): value is PageId => value in PAGE_BY_ID;
