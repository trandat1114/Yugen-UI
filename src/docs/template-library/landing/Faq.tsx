import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, Link } from "@/components/ui";
import { useLanding } from "./context";

/** Questions and answers in an Accordion, one open at a time. */
export function Faq() {
  const { t, embedded, sectionId } = useLanding();
  const H2 = embedded ? "h3" : "h2";
  const titleId = `${sectionId("faq")}-title`;

  return (
    <section id={sectionId("faq")} aria-labelledby={titleId} className="scroll-mt-16 px-4 py-16 @3xl/landing:py-24">
      <div className="mx-auto grid max-w-6xl gap-8 @4xl/landing:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] @4xl/landing:gap-16">
        <div>
          <H2 id={titleId} className="font-display text-title2 font-semibold text-foreground-1 @3xl/landing:text-title1">
            {t.faq.title}
          </H2>
          <p className="mt-3 text-body2 text-foreground-2">
            {t.faq.lead}{" "}
            <Link href={`mailto:${t.faq.email}`} inline>
              {t.faq.contact}
            </Link>
          </p>
        </div>
        <Accordion type="single" collapsible appearance="outline" expandIconPosition="end" defaultValue="0">
          {t.faq.items.map((item, i) => (
            <AccordionItem key={item.question} value={String(i)}>
              <AccordionHeader>{item.question}</AccordionHeader>
              <AccordionPanel>{item.answer}</AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
