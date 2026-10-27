import * as React from "react";
import { Checkmark16Filled } from "@fluentui/react-icons";
import { Badge, Button, ToggleGroup, ToggleGroupItem } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { Content } from "./content/types";
import { SectionLink, useLanding } from "./context";

export type BillingPeriod = "monthly" | "yearly";

// Creating an Intl.NumberFormat is slow (locale data): one per locale, currency and number of decimals.
const formats = new Map<string, Intl.NumberFormat>();

/** A price in the content's currency and locale: "$8", "$6.40", "159.000 ₫". */
export function formatPrice(t: Content, amount: number) {
  const digits = Number.isInteger(amount) ? 0 : 2;
  const key = `${t.locale} ${t.currency} ${digits}`;
  let format = formats.get(key);
  if (!format) {
    format = new Intl.NumberFormat(t.locale, {
      style: "currency",
      currency: t.currency,
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    });
    formats.set(key, format);
  }
  return format.format(amount);
}

/** Plans side by side with a monthly / yearly switch. Prices and plans come from the content (also the JSON-LD offers). */
export function Pricing() {
  const { t, embedded, sectionId } = useLanding();
  const [period, setPeriod] = React.useState<BillingPeriod>("yearly");
  const H2 = embedded ? "h3" : "h2";
  const H3 = embedded ? "h4" : "h3";
  const p = t.pricing;

  return (
    <section id={sectionId("pricing")} aria-labelledby={`${sectionId("pricing")}-title`} className="scroll-mt-16 px-4 py-16 @3xl/landing:py-24">
      <div className="mx-auto flex max-w-6xl flex-col items-center text-center">
        <H2 id={`${sectionId("pricing")}-title`} className="font-display text-title2 font-semibold text-foreground-1 @3xl/landing:text-title1">
          {p.title}
        </H2>
        <p className="mt-3 max-w-xl text-body2 text-foreground-2">{p.lead}</p>
        <ToggleGroup
          type="single"
          value={period}
          // A single toggle group can be emptied by pressing the selected item again: keep one period selected.
          onValueChange={(value) => value && setPeriod(value as BillingPeriod)}
          aria-label={p.period.label}
          className="mt-8"
        >
          <ToggleGroupItem value="monthly">{p.period.monthly}</ToggleGroupItem>
          <ToggleGroupItem value="yearly" className="gap-2">
            {p.period.yearly}
            <Badge appearance="tint" color="success">
              {p.period.save}
            </Badge>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      <ul className="mx-auto mt-10 grid max-w-6xl gap-4 @4xl/landing:grid-cols-3">
        {p.plans.map((plan) => {
          const price = plan.price[period];
          return (
            <li
              key={plan.id}
              className={cn(
                "relative flex flex-col rounded-2xlarge border bg-background-1 p-6",
                plan.featured ? "border-brand-stroke shadow-16 outline-1 outline-brand-stroke" : "border-stroke-2 shadow-2",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <H3 className="font-display text-subtitle1 font-semibold text-foreground-1">{plan.name}</H3>
                {plan.featured && (
                  <Badge appearance="filled" color="brand" shape="circular">
                    {p.featured}
                  </Badge>
                )}
              </div>
              <p className="mt-1 text-body1 text-foreground-2">{plan.description}</p>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-2">
                <span className="font-display text-title1 font-semibold text-foreground-1 tabular-nums">{formatPrice(t, price)}</span>
                <span className="text-body1 text-foreground-3">{p.perPerson}</span>
              </p>
              <p className="mt-1 min-h-5 text-caption1 text-foreground-3">
                {price === 0 ? p.freeForever : period === "yearly" ? p.billedYearly(formatPrice(t, price * 12)) : p.billedMonthly}
              </p>
              <Button asChild appearance={plan.featured ? "primary" : "secondary"} size="large" className="mt-6 w-full">
                <SectionLink to="signup">{plan.cta}</SectionLink>
              </Button>
              <ul className="mt-6 flex flex-col gap-2.5 border-t border-stroke-2 pt-6">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2 text-body1 text-foreground-1">
                    <Checkmark16Filled aria-hidden className="mt-0.5 size-4 shrink-0 text-brand-foreground-1" />
                    {feature}
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
