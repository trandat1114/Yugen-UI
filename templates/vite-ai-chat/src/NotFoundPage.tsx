import { ChatDismiss20Regular, Compose20Regular, DocumentDismiss20Regular } from "@fluentui/react-icons";
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "yugen-ui";
import type { Content } from "./content/types";
import { Link } from "./router";

export interface NotFoundPageProps {
  t: Content;
  /** chat: `/c/<id>` with an unknown id · page: any other unknown path. */
  kind: "chat" | "page";
}

/** The title is in the header; the page says why and offers a way out. */
export default function NotFoundPage({ t, kind }: NotFoundPageProps) {
  return (
    <Empty className="min-h-0 overflow-y-auto">
      <EmptyHeader>
        <EmptyMedia>{kind === "chat" ? <ChatDismiss20Regular /> : <DocumentDismiss20Regular />}</EmptyMedia>
        <EmptyDescription>{kind === "chat" ? t.notFound.chatBody : t.notFound.body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={{ name: "new" }}>
            <Compose20Regular aria-hidden />
            {t.notFound.action}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
