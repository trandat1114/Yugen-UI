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

export const meta = { title: "Empty inbox", description: "Filter tabs with an Empty state that has an action", order: 10 };

export default function EmptyInboxBlock() {
  return (
    <Card size="large" className="gap-3 rounded-xlarge p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-subtitle1 font-semibold">Notifications</h3>
        <Button appearance="subtle" size="small" icon={<ArrowClockwise20Regular />} aria-label="Refresh" />
      </div>
      <Tabs defaultValue="unread">
        <TabsList size="small">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
          <TabsTrigger value="mentions">Mentions</TabsTrigger>
        </TabsList>
      </Tabs>
      <Empty variant="outline">
        <EmptyHeader>
          <EmptyMedia>
            <MailInbox24Regular />
          </EmptyMedia>
          <EmptyTitle>You&apos;re all caught up</EmptyTitle>
          <EmptyDescription>New notifications will show up here. Enjoy the quiet.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button appearance="primary">Notification settings</Button>
        </EmptyContent>
      </Empty>
    </Card>
  );
}
