import { BookOpen20Regular, DocumentDismiss20Regular } from "@fluentui/react-icons";
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "yugen-ui";
import type { PageProps } from "./Layout";
import { Link } from "./router";

/** Unknown path or trip: says why and offers a way back. */
export default function NotFoundPage({ t, embedded }: PageProps) {
  const H1 = embedded ? "h2" : "h1";
  return (
    <Empty className="min-h-full pt-24 pb-28">
      <EmptyHeader>
        <EmptyMedia>
          <DocumentDismiss20Regular />
        </EmptyMedia>
        <H1 className="font-display text-subtitle1 font-semibold text-foreground-1">{t.notFound.title}</H1>
        <EmptyDescription>{t.notFound.body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={{ name: "home" }}>
            <BookOpen20Regular aria-hidden />
            {t.notFound.action}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
