import { BoxSearch24Regular, DocumentDismiss20Regular } from "@fluentui/react-icons";
import { Button, Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from "yugen-ui";
import { useHeadings, useStore } from "../context";
import { Link, SHOP } from "../router";

/** Unknown path or product: says so and offers a way back to the grid. */
export default function NotFoundPage({ kind = "page" }: { kind?: "page" | "product" }) {
  const { t } = useStore();
  const { H1 } = useHeadings();
  const text =
    kind === "product"
      ? { title: t.product.notFoundTitle, body: t.product.notFoundBody, action: t.product.back }
      : t.notFound;
  return (
    <Empty className="py-16">
      <EmptyHeader>
        <EmptyMedia>{kind === "product" ? <BoxSearch24Regular /> : <DocumentDismiss20Regular />}</EmptyMedia>
        <H1 className="font-display text-subtitle1 font-semibold text-foreground-1">{text.title}</H1>
        <EmptyDescription>{text.body}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={SHOP}>{text.action}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
