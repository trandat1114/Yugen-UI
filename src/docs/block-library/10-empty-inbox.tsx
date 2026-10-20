import { MailInbox24Regular, ArrowClockwise20Regular } from "@fluentui/react-icons";
import {
  Button,
  Card,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui";

export const meta = { title: "Hộp thư trống", description: "Tabs lọc kèm trạng thái Empty có hành động", order: 10 };

export default function EmptyInboxBlock() {
  return (
    <Card size="large" className="gap-M rounded-xlarge p-XL">
      <div className="flex items-center justify-between gap-M">
        <h3 className="text-subtitle1 font-semibold">Thông báo</h3>
        <Button appearance="subtle" size="small" icon={<ArrowClockwise20Regular />} aria-label="Làm mới" />
      </div>
      <Tabs defaultValue="unread">
        <TabsList size="small">
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="unread">Chưa đọc</TabsTrigger>
          <TabsTrigger value="mentions">Nhắc đến tôi</TabsTrigger>
        </TabsList>
      </Tabs>
      <Empty variant="outline">
        <EmptyHeader>
          <EmptyMedia>
            <MailInbox24Regular />
          </EmptyMedia>
          <EmptyTitle>Bạn đã đọc hết thông báo</EmptyTitle>
          <EmptyDescription>Thông báo mới sẽ xuất hiện ở đây. Hãy tận hưởng khoảng lặng nhé.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button appearance="primary">Cài đặt thông báo</Button>
        </EmptyContent>
      </Empty>
    </Card>
  );
}
