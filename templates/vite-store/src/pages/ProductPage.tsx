import * as React from "react";
import { ArrowLeft16Regular, Box20Regular, ShoppingBag20Regular, Checkmark16Regular } from "@fluentui/react-icons";
import {
  Button,
  Carousel,
  CarouselCard,
  CarouselThumbnail,
  CarouselThumbnails,
  CarouselViewport,
  ColorSwatch,
  Field,
  Radio,
  RadioGroup,
  RatingDisplay,
  SpinButton,
  SwatchPicker,
  toast,
} from "yugen-ui";
import { MAX_QUANTITY } from "../cart";
import { useHeadings, useStore } from "../context";
import { loaders } from "../Layout";
import { freeShippingFrom } from "../lines";
import { ProductArt, type ArtView } from "../ProductArt";
import { COLORS, findProduct, unitPrice, type ColorId, type Product } from "../products";
import { Link, SHOP } from "../router";
import NotFoundPage from "./NotFoundPage";

const VIEWS: ArtView[] = ["front", "detail", "colors"];

/** Three pictures of the product in the chosen colour, with thumbnails to switch. */
function Gallery({ product, color }: { product: Product; color: ColorId }) {
  const { t } = useStore();
  const name = t.products[product.id].name;
  const colorName = t.colors[color];
  const alt = (view: ArtView) => (view === "colors" ? t.product.views.colors(name) : t.product.views[view](name, colorName));
  return (
    <Carousel aria-label={t.product.gallery(name)} className="flex min-w-0 flex-col gap-3">
      <CarouselViewport className="rounded-large">
        {VIEWS.map((view) => (
          <CarouselCard key={view}>
            <div className="aspect-square rounded-large bg-background-3 p-6 @3xl/app:p-10">
              <ProductArt product={product} color={color} view={view} label={alt(view)} />
            </div>
          </CarouselCard>
        ))}
      </CarouselViewport>
      <CarouselThumbnails>
        {VIEWS.map((view) => (
          <CarouselThumbnail key={view} className="size-16 p-1">
            <ProductArt product={product} color={color} view={view} />
          </CarouselThumbnail>
        ))}
      </CarouselThumbnails>
    </Carousel>
  );
}

export default function ProductPage({ id }: { id: string }) {
  const product = findProduct(id);
  return product ? <ProductView product={product} /> : <NotFoundPage kind="product" />;
}

function ProductView({ product }: { product: Product }) {
  const { t, format, price, cart, setCartOpen, embedded } = useStore();
  const { H1, H2 } = useHeadings();
  const text = t.products[product.id];
  const [color, setColor] = React.useState<ColorId>(product.colors[0]);
  const [size, setSize] = React.useState(product.sizes?.[0].id);
  const [quantity, setQuantity] = React.useState(1);
  const colorLabelId = React.useId();
  const detailsId = React.useId();
  const amount = price(unitPrice(product, size));

  const add = () => cart.add({ productId: product.id, color, ...(size && { size }), quantity });
  const addAndTell = () => {
    add();
    const variant = [t.colors[color], product.sizes?.find((s) => s.id === size)?.label].filter(Boolean).join(", ");
    // Embedded in the docs there is no toaster: show the cart instead.
    if (embedded) setCartOpen(true);
    else
      toast({
        intent: "success",
        title: t.product.added,
        body: t.product.addedBody(quantity, `${text.name} (${variant})`),
        action: { label: t.product.viewCart, onClick: () => setCartOpen(true) },
      });
  };

  return (
    <div className="flex flex-col gap-4">
      <Link to={SHOP} className="inline-flex items-center gap-1 self-start rounded-medium text-body1 text-link hover:text-link-hover hover:underline">
        <ArrowLeft16Regular aria-hidden className="rtl:-scale-x-100" />
        {t.product.back}
      </Link>

      <div className="grid gap-6 @3xl/app:grid-cols-2 @3xl/app:gap-10">
        <Gallery product={product} color={color} />

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <p className="text-body1 text-foreground-3">{t.categories[product.category]}</p>
            <H1 className="font-display text-title2 font-semibold text-balance">{text.name}</H1>
            <RatingDisplay value={product.rating} count={product.reviews} color="marigold" />
            <p className="text-title3 font-semibold tabular-nums">{format.money(amount)}</p>
          </div>
          <p className="text-body1 text-foreground-2">{text.description}</p>

          <div className="flex flex-col gap-2">
            <p id={colorLabelId} className="text-body1">
              {t.product.color}: <span className="font-semibold">{t.colors[color]}</span>
            </p>
            <SwatchPicker
              aria-labelledby={colorLabelId}
              shape="circular"
              size="large"
              selectedValue={color}
              onSelectionChange={(v) => setColor(v as ColorId)}
            >
              {product.colors.map((id) => (
                <ColorSwatch key={id} value={id} color={COLORS[id]} aria-label={t.colors[id]} />
              ))}
            </SwatchPicker>
          </div>

          {product.sizes && (
            <Field label={t.product.size}>
              <RadioGroup layout="horizontal" value={size} onValueChange={setSize}>
                {product.sizes.map((s) => (
                  <Radio key={s.id} value={s.id} label={`${s.label} · ${format.money(price(s.price))}`} />
                ))}
              </RadioGroup>
            </Field>
          )}

          <div className="flex flex-wrap items-end gap-3">
            <Field label={t.product.quantity} className="w-28">
              <SpinButton min={1} max={MAX_QUANTITY} value={quantity} onValueChange={(v) => setQuantity(v ?? 1)} />
            </Field>
            <Button appearance="primary" icon={<ShoppingBag20Regular />} onClick={addAndTell} onPointerEnter={() => void loaders.checkout()}>
              {t.product.add}
            </Button>
            <Button asChild>
              <Link to={{ name: "checkout" }} onClick={add} onPointerEnter={() => void loaders.checkout()}>
                {t.product.buyNow}
              </Link>
            </Button>
          </div>

          <p className="flex items-start gap-2 text-body1 text-foreground-3">
            <Box20Regular aria-hidden className="mt-0.5 shrink-0" />
            {t.product.shipping(format.money(freeShippingFrom(price)))}
          </p>

          <div className="flex flex-col gap-2 border-t border-stroke-2 pt-4">
            <H2 id={detailsId} className="text-subtitle2 font-semibold">
              {t.product.details}
            </H2>
            <ul aria-labelledby={detailsId} className="flex flex-col gap-1.5">
              {text.details.map((detail) => (
                <li key={detail} className="flex items-start gap-2 text-body1 text-foreground-2">
                  <Checkmark16Regular aria-hidden className="mt-0.5 shrink-0 text-brand-foreground-1" />
                  {detail}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
