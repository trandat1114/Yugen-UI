import { ArrowRight20Regular } from "@fluentui/react-icons";
import { Button, Empty, EmptyContent, EmptyDescription } from "@/components/ui";
import type { PageLink } from "./content/types";
import type { DocPage } from "./docs";
import { useSite } from "./pages";
import { Link, type Route } from "./router";

export const routeOf = (page: Pick<DocPage, "section" | "slug">): Route => ({ name: "page", section: page.section, page: page.slug });

const routeOfLink = (link: PageLink): Route => {
  const [section, page] = link.page.split("/");
  return { name: "page", section, page };
};

type HeadingLevel = "h1" | "h2";

/** Landing page: what the product is, two ways in, and every section with its pages. */
export function HomePage({ headingLevel }: { headingLevel: HeadingLevel }) {
  const { t, docs } = useSite();
  const Heading = headingLevel;
  const SubHeading = headingLevel === "h1" ? "h2" : "h3";
  const CardHeading = headingLevel === "h1" ? "h3" : "h4";
  return (
    <div className="@container mx-auto flex max-w-4xl flex-col gap-10">
      <div className="flex flex-col items-start gap-4">
        <p className="text-caption1 font-semibold tracking-wide text-brand-foreground-1 uppercase">{t.home.eyebrow}</p>
        <Heading className="font-display text-title1 font-semibold text-foreground-1 @2xl:text-large-title">{t.home.title}</Heading>
        <p className="max-w-2xl text-subtitle2 font-normal text-foreground-2">{t.home.lead}</p>
        <div className="flex flex-wrap gap-2">
          <Button asChild appearance="primary">
            <Link to={routeOfLink(t.home.primary)}>
              {t.home.primary.label}
              <ArrowRight20Regular className="rtl:-scale-x-100" />
            </Link>
          </Button>
          <Button asChild>
            <Link to={routeOfLink(t.home.secondary)}>{t.home.secondary.label}</Link>
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <SubHeading className="font-display text-title3 font-semibold text-foreground-1">{t.home.sections}</SubHeading>
        <div className="grid gap-4 @2xl:grid-cols-2 @4xl:grid-cols-3">
          {docs.sections.map((section) => (
            <div key={section.slug} className="flex flex-col gap-3 rounded-xlarge border border-stroke-2 bg-background-2 p-5">
              <div className="flex flex-col gap-0.5">
                <CardHeading className="text-subtitle1 font-semibold text-foreground-1">{section.title}</CardHeading>
                <p className="text-caption1 text-foreground-3">{t.home.pageCount(section.pages.length)}</p>
              </div>
              <ul className="flex flex-col gap-1.5">
                {section.pages.map((page) => (
                  <li key={page.key}>
                    <Link to={routeOf(page)} className="text-body1 text-link underline-offset-2 hover:text-link-hover hover:underline">
                      {page.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function NotFound({ headingLevel }: { headingLevel: HeadingLevel }) {
  const { t } = useSite();
  const Heading = headingLevel;
  return (
    <Empty className="py-8">
      <Heading className="font-display text-title3 font-semibold text-foreground-1">{t.notFound.title}</Heading>
      <EmptyDescription>{t.notFound.body}</EmptyDescription>
      <EmptyContent>
        <Button asChild appearance="primary">
          <Link to={{ name: "home" }}>{t.notFound.home}</Link>
        </Button>
      </EmptyContent>
    </Empty>
  );
}
