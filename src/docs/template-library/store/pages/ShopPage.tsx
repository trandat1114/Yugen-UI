import * as React from "react";
import { Dismiss16Regular, SearchInfo24Regular } from "@fluentui/react-icons";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Field,
  RatingDisplay,
  Select,
  Slider,
  TagPicker,
} from "@/components/ui";
import { useHeadings, useStore } from "../context";
import { EMPTY_QUERY, filterProducts, isFiltered, priceCeiling, SORTS, type ShopQuery, type Sort } from "../filters";
import { loaders } from "../Layout";
import { priceStep } from "../money";
import { ProductArt } from "../ProductArt";
import { CATEGORIES, PRODUCTS, type Category, type Product } from "../products";
import { Link, useRouter } from "../router";

/** One product in the grid: the whole card is the link to its page. */
function ProductCard({ product }: { product: Product }) {
  const { t, format, price } = useStore();
  const { H2 } = useHeadings();
  const text = t.products[product.id];
  const amount = format.money(price(product.price));
  return (
    <li className="group relative flex flex-col gap-3 rounded-large bg-background-1 p-3 shadow-4 transition-shadow duration-faster ease-easy-ease hover:shadow-8 has-[a:focus-visible]:outline-2 has-[a:focus-visible]:outline-offset-2 has-[a:focus-visible]:outline-stroke-focus">
      <div className="aspect-square overflow-hidden rounded-medium bg-background-3 p-4">
        <ProductArt product={product} className="transition-transform duration-normal ease-easy-ease group-hover:scale-105 motion-reduce:transition-none" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1 px-1 pb-1">
        <p className="text-caption1 text-foreground-3">{t.categories[product.category]}</p>
        <H2 className="text-body1 font-semibold">
          <Link
            to={{ name: "product", id: product.id }}
            onPointerEnter={() => void loaders.product()}
            onFocus={() => void loaders.product()}
            className="outline-none after:absolute after:inset-0 after:rounded-large"
          >
            {text.name}
          </Link>
        </H2>
        <p className="text-caption1 text-foreground-3">{text.blurb}</p>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-2">
          <span className="text-body1 font-semibold tabular-nums">{product.sizes ? t.shop.from(amount) : amount}</span>
          <RatingDisplay value={product.rating} count={product.reviews} size="small" compact />
        </div>
      </div>
    </li>
  );
}

/** Category, price and sort controls. Every change is a new URL, so Back undoes it. */
function Filters({ query, ceiling, onChange }: { query: ShopQuery; ceiling: number; onChange: (query: ShopQuery) => void }) {
  const { t, format, embedded } = useStore();
  const { H2 } = useHeadings();
  const step = priceStep(t.currency);
  const headingId = React.useId();
  const committed = React.useMemo<[number, number]>(() => [query.min ?? 0, Math.min(query.max ?? ceiling, ceiling)], [query.min, query.max, ceiling]);
  // While dragging, the slider shows its own value; the URL changes when the thumb is released.
  const [range, setRange] = React.useState(committed);
  React.useEffect(() => setRange(committed), [committed]);
  const options = CATEGORIES.map((c) => ({ value: c, label: t.categories[c] }));
  const Region = embedded ? "div" : "section";

  return (
    <Region aria-labelledby={headingId} className="flex flex-col gap-5 rounded-large bg-background-1 p-4 shadow-4">
      <H2 id={headingId} className="text-subtitle2 font-semibold">
        {t.shop.filters}
      </H2>
      <Field label={t.shop.category}>
        <TagPicker
          options={options}
          value={query.categories}
          onValueChange={(categories) => onChange({ ...query, categories: categories as Category[] })}
          placeholder={query.categories.length === 0 ? t.shop.allCategories : undefined}
          className="min-w-0"
        />
      </Field>
      <div className="flex flex-col gap-1">
        <Slider
          label={t.shop.price}
          min={0}
          max={ceiling}
          step={step}
          minStepsBetweenThumbs={1}
          value={range}
          onValueChange={(v) => setRange([v[0], v[1]])}
          onValueCommit={([min, max]) =>
            onChange({ ...query, min: min > 0 ? min : undefined, max: max < ceiling ? max : undefined })
          }
        />
        <p className="text-caption1 text-foreground-3 tabular-nums" aria-hidden>
          {t.shop.priceRange(format.money(range[0]), format.money(range[1]))}
        </p>
      </div>
    </Region>
  );
}

export default function ShopPage({ query }: { query: ShopQuery }) {
  const { t, price } = useStore();
  const { navigate } = useRouter();
  const { H1 } = useHeadings();
  const productPrice = React.useCallback((p: Product) => price(p.price), [price]);
  const ceiling = React.useMemo(() => priceCeiling(PRODUCTS, productPrice, priceStep(t.currency)), [productPrice, t.currency]);
  const products = React.useMemo(() => filterProducts(PRODUCTS, query, productPrice), [query, productPrice]);
  const update = (next: ShopQuery) => navigate({ name: "shop", query: next });
  const clear = () => update({ ...EMPTY_QUERY, sort: query.sort });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <H1 className="font-display text-title2 font-semibold text-balance">{t.shop.title}</H1>
        <p className="text-body1 text-foreground-3">{t.shop.lead}</p>
      </div>

      <div className="grid gap-6 @3xl/app:grid-cols-[16rem_1fr] @3xl/app:items-start">
        <Filters query={query} ceiling={ceiling} onChange={update} />

        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <p role="status" className="text-body1 text-foreground-2">
              {t.shop.results(products.length)}
            </p>
            <div className="flex flex-wrap items-end gap-2">
              {isFiltered(query) && (
                <Button appearance="subtle" icon={<Dismiss16Regular />} onClick={clear}>
                  {t.shop.clear}
                </Button>
              )}
              <Field label={t.shop.sort} orientation="horizontal" className="items-center">
                <Select value={query.sort} onChange={(e) => update({ ...query, sort: e.target.value as Sort })} className="w-48">
                  {SORTS.map((sort) => (
                    <option key={sort} value={sort}>
                      {t.shop.sorts[sort]}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </div>

          {products.length > 0 ? (
            <ul className="grid grid-cols-2 gap-3 @xl/app:grid-cols-3 @3xl/app:gap-4 @6xl/app:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </ul>
          ) : (
            <Empty variant="outline" className="py-12">
              <EmptyHeader>
                <EmptyMedia>
                  <SearchInfo24Regular />
                </EmptyMedia>
                <EmptyTitle>{t.shop.emptyTitle}</EmptyTitle>
                <EmptyDescription>{t.shop.emptyBody}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button appearance="primary" onClick={clear}>
                  {t.shop.clear}
                </Button>
              </EmptyContent>
            </Empty>
          )}
        </div>
      </div>
    </div>
  );
}
