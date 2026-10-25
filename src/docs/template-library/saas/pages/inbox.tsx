import { ArrowClockwise20Regular, MailInbox24Regular } from "@fluentui/react-icons";
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
import type { PageProps } from "../pages";

export default function InboxPage({ t }: PageProps) {
  const c = t.inbox;
  return (
    <div className="mx-auto w-full max-w-2xl">
      <Card size="large" className="gap-3 rounded-xlarge p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-subtitle1 font-semibold">{c.title}</h3>
          <Button appearance="subtle" size="small" icon={<ArrowClockwise20Regular />} aria-label={c.refresh} />
        </div>
        <Tabs defaultValue="unread">
          <TabsList size="small">
            <TabsTrigger value="all">{c.tabs.all}</TabsTrigger>
            <TabsTrigger value="unread">{c.tabs.unread}</TabsTrigger>
            <TabsTrigger value="mentions">{c.tabs.mentions}</TabsTrigger>
          </TabsList>
        </Tabs>
        <Empty variant="outline">
          <EmptyHeader>
            <EmptyMedia>
              <MailInbox24Regular />
            </EmptyMedia>
            <EmptyTitle>{c.emptyTitle}</EmptyTitle>
            <EmptyDescription>{c.emptyBody}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button appearance="primary">{c.settings}</Button>
          </EmptyContent>
        </Empty>
      </Card>
    </div>
  );
}
