import type { ReactNode } from "react";
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
import StatsBlock from "@/docs/block-library/02-stats";
import PayoutBlock from "@/docs/block-library/03-payout";
import TeamBlock from "@/docs/block-library/04-team";
import PreferencesBlock from "@/docs/block-library/05-preferences";
import TransactionsBlock from "@/docs/block-library/06-transactions";
import SavingsBlock from "@/docs/block-library/07-savings";
import BookingBlock from "@/docs/block-library/08-booking";
import FeedbackBlock from "@/docs/block-library/09-feedback";
import EmptyInboxBlock from "@/docs/block-library/10-empty-inbox";
import AnalyticsBlock from "@/docs/block-library/11-analytics";
import AiAssistantBlock from "@/docs/block-library/12-ai-assistant";

export type PageId = "overview" | "analytics" | "assistant" | "inbox" | "calendar" | "team" | "billing" | "settings";

export interface PageDef {
  id: PageId;
  /** Nhãn ngắn trên sidebar, breadcrumb, bảng lệnh. */
  label: string;
  title: string;
  /** Mô tả dưới tiêu đề — App dùng lại cho <meta name="description">. */
  description: string;
  icon: ReactNode;
  section: "workspace" | "manage";
  /** Số đếm trên sidebar (CounterBadge). */
  badge?: number;
  actions?: ReactNode;
  content: ReactNode;
}

/** Thêm trang mới: thêm một mục vào đây — sidebar, bảng lệnh, breadcrumb và tiêu đề tab tự cập nhật. */
export const PAGES: PageDef[] = [
  {
    id: "overview",
    label: "Tổng quan",
    title: "Tổng quan",
    description: "Số liệu chính của Sakura Studio trong 30 ngày qua.",
    icon: <Board20Regular />,
    section: "workspace",
    actions: (
      <Button
        icon={<ArrowDownload20Regular />}
        onClick={() => toast({ intent: "success", title: "Đã xuất báo cáo", body: "Tệp CSV đang được tải xuống." })}
      >
        Xuất báo cáo
      </Button>
    ),
    content: (
      <>
        <StatsBlock />
        <div className="grid items-start gap-4 @3xl:grid-cols-2">
          <TransactionsBlock />
          <SavingsBlock />
        </div>
      </>
    ),
  },
  {
    id: "analytics",
    label: "Phân tích",
    title: "Phân tích",
    description: "Xu hướng lượt khách, doanh thu và tỉ trọng kênh bán.",
    icon: <ChartMultiple20Regular />,
    section: "workspace",
    content: <AnalyticsBlock />,
  },
  {
    id: "assistant",
    label: "Trợ lý AI",
    title: "Trợ lý AI",
    description: "Hỏi về số liệu, soạn email hay tóm tắt cuộc họp.",
    icon: <Sparkle20Regular />,
    section: "workspace",
    content: (
      <div className="flex justify-center">
        <AiAssistantBlock />
      </div>
    ),
  },
  {
    id: "inbox",
    label: "Hộp thư",
    title: "Hộp thư",
    description: "Tin nhắn từ khách hàng và thành viên nhóm.",
    icon: <Mail20Regular />,
    section: "workspace",
    badge: 3,
    content: (
      <div className="mx-auto w-full max-w-2xl">
        <EmptyInboxBlock />
      </div>
    ),
  },
  {
    id: "calendar",
    label: "Lịch hẹn",
    title: "Lịch hẹn",
    description: "Chọn ngày và khung giờ cho buổi tư vấn tiếp theo.",
    icon: <CalendarLtr20Regular />,
    section: "workspace",
    content: (
      <div className="mx-auto w-full max-w-2xl">
        <BookingBlock />
      </div>
    ),
  },
  {
    id: "team",
    label: "Đội ngũ",
    title: "Đội ngũ",
    description: "Mời thành viên và phân quyền trong không gian làm việc.",
    icon: <People20Regular />,
    section: "manage",
    content: (
      <div className="mx-auto w-full max-w-3xl">
        <TeamBlock />
      </div>
    ),
  },
  {
    id: "billing",
    label: "Thanh toán",
    title: "Thanh toán",
    description: "Ngưỡng chi trả tự động và lịch sử thanh toán.",
    icon: <Payment20Regular />,
    section: "manage",
    content: (
      <div className="grid items-start gap-4 @3xl:grid-cols-2">
        <PayoutBlock />
        <TransactionsBlock />
      </div>
    ),
  },
  {
    id: "settings",
    label: "Cài đặt",
    title: "Cài đặt",
    description: "Tuỳ chọn tài khoản, thông báo và góp ý cho đội sản phẩm.",
    icon: <Settings20Regular />,
    section: "manage",
    content: (
      <div className="grid items-start gap-4 @3xl:grid-cols-2">
        <PreferencesBlock />
        <FeedbackBlock />
      </div>
    ),
  },
];

export const PAGE_BY_ID = Object.fromEntries(PAGES.map((p) => [p.id, p])) as Record<PageId, PageDef>;

export const isPageId = (value: string): value is PageId => value in PAGE_BY_ID;
