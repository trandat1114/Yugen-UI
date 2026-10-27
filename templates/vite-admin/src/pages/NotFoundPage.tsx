import { DocumentDismiss20Regular, People20Regular } from "@fluentui/react-icons";
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "yugen-ui";
import { useAdmin } from "../context";
import { Link } from "../router";
import { useHeadings } from "../ui";

/** Unknown path: says so and offers a way back. */
export default function NotFoundPage() {
  const { t } = useAdmin();
  const { H1 } = useHeadings();
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia>
          <DocumentDismiss20Regular />
        </EmptyMedia>
        <H1 className="font-display text-subtitle1 font-semibold text-foreground-1">{t.notFound.title}</H1>
        <EmptyDescription>{t.notFound.body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={{ name: "customers" }}>
            <People20Regular aria-hidden />
            {t.notFound.action}
          </Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
