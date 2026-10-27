import { Avatar, Quote } from "@/components/ui";
import { useLanding } from "./context";

/** Three short quotes from customers (made up: replace them with real ones). */
export function Testimonials() {
  const { t, embedded, sectionId } = useLanding();
  const H2 = embedded ? "h3" : "h2";
  const titleId = `${sectionId("top")}-testimonials`;

  return (
    <section aria-labelledby={titleId} className="bg-background-2 px-4 py-16 @3xl/landing:py-24">
      <div className="mx-auto max-w-6xl">
        <H2 id={titleId} className="font-display text-title2 font-semibold text-foreground-1 @3xl/landing:text-title1">
          {t.testimonials.title}
        </H2>
        <ul className="mt-10 grid gap-4 @4xl/landing:grid-cols-3">
          {t.testimonials.items.map((item) => (
            <li key={item.name} className="flex rounded-2xlarge border border-stroke-2 bg-background-1 p-6 shadow-2">
              <Quote
                author={item.name}
                authorTitle={item.role}
                // The name is already in the caption: the initials are decoration.
                avatar={
                  <span aria-hidden>
                    <Avatar name={item.name} color="brand" size={40} />
                  </span>
                }
                className="justify-between"
              >
                {item.quote}
              </Quote>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
