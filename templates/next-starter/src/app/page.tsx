import Link from "next/link";
import { Badge, Button, Card, CardHeader, Text } from "yugen-ui";
import { ArrowRight20Regular, Settings20Regular } from "../components/icons";
import content from "../content";

const t = content.home;

/**
 * Server Component (no "use client"): Yugen components are client components, and a Server Component can render them
 * when their props can be serialized: text, numbers, elements. Event handlers need a Client Component (see Settings).
 */
export default function HomePage() {
  const time = new Date().toLocaleTimeString(content.locale, { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col gap-8">
      <section className="flex flex-col items-start gap-4">
        <h1 className="font-display text-title1 font-semibold">{t.title}</h1>
        <p className="max-w-2xl text-body2 text-foreground-2">{t.lead}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild appearance="primary">
            <Link href="/settings">
              <Settings20Regular aria-hidden />
              {t.settings}
            </Link>
          </Button>
          <Button asChild>
            <a href="https://trandat1114.github.io/Yugen-UI/concepts/ssr">
              {t.docs}
              <ArrowRight20Regular aria-hidden className="rtl:-scale-x-100" />
            </a>
          </Button>
        </div>
      </section>

      <section aria-labelledby="server-title" className="rounded-xlarge border border-stroke-2 bg-background-2 p-5">
        <Badge appearance="tint" color="brand">
          {t.serverTitle}
        </Badge>
        <h2 id="server-title" className="sr-only">
          {t.serverTitle}
        </h2>
        <Text as="p" className="mt-2 text-foreground-2">
          {t.renderedAt(time)}
        </Text>
      </section>

      <ul className="grid gap-4 sm:grid-cols-2">
        {t.features.map((feature) => (
          <li key={feature.title}>
            <Card className="h-full">
              <CardHeader header={<h2 className="text-subtitle2 font-semibold">{feature.title}</h2>} description={feature.body} />
            </Card>
          </li>
        ))}
      </ul>
    </div>
  );
}
