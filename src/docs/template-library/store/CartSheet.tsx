import { Cart24Regular, Delete20Regular, Dismiss20Regular } from "@fluentui/react-icons";
import {
  Button,
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SpinButton,
  toast,
} from "@/components/ui";
import { MAX_QUANTITY } from "./cart";
import { useStore } from "./context";
import { loaders } from "./Layout";
import { describeLines, subtotalOf } from "./lines";
import { ProductArt } from "./ProductArt";
import { Link, SHOP } from "./router";

/** The cart: a side panel on wide screens, a bottom sheet on narrow ones. Loaded the first time it is about to open. */
export default function CartSheet() {
  const { t, format, price, cart, cartOpen, setCartOpen, embedded } = useStore();
  const lines = describeLines(cart.lines, t, price);
  const subtotal = subtotalOf(lines, t.currency);
  const close = () => setCartOpen(false);

  return (
    <Sheet open={cartOpen} onOpenChange={setCartOpen} snapPoints={[0.6, 0.92]} defaultSnapPoint={0.92}>
      <SheetContent>
        <SheetHeader
          action={
            <SheetClose asChild>
              <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label={t.cart.close} />
            </SheetClose>
          }
        >
          <SheetTitle>{t.cart.title}</SheetTitle>
          <SheetDescription>{t.cart.items(cart.count)}</SheetDescription>
        </SheetHeader>

        <SheetBody>
          {lines.length === 0 ? (
            <Empty className="py-10">
              <EmptyHeader>
                <EmptyMedia>
                  <Cart24Regular />
                </EmptyMedia>
                <EmptyTitle>{t.cart.emptyTitle}</EmptyTitle>
                <EmptyDescription>{t.cart.emptyBody}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                <Button asChild appearance="primary">
                  <Link to={SHOP} onClick={close}>
                    {t.cart.browse}
                  </Link>
                </Button>
              </EmptyContent>
            </Empty>
          ) : (
            <ul className="flex flex-col divide-y divide-stroke-2">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3 py-3">
                  <div className="size-16 shrink-0 rounded-medium bg-background-3 p-1.5">
                    <ProductArt product={line.product} color={line.color} />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <Link
                          to={{ name: "product", id: line.productId }}
                          onClick={close}
                          onPointerEnter={() => void loaders.product()}
                          className="rounded-small text-body1 font-semibold hover:underline"
                        >
                          {line.name}
                        </Link>
                        <p className="text-caption1 text-foreground-3">{line.variant}</p>
                      </div>
                      <p className="shrink-0 text-body1 font-semibold tabular-nums">{format.money(line.total)}</p>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <SpinButton
                        size="small"
                        min={1}
                        max={MAX_QUANTITY}
                        value={line.quantity}
                        onValueChange={(v) => cart.setQuantity(line.key, v ?? 1)}
                        aria-label={t.cart.quantityOf(line.name)}
                        className="w-24"
                      />
                      <Button
                        appearance="subtle"
                        size="small"
                        icon={<Delete20Regular />}
                        aria-label={t.cart.remove(line.name)}
                        onClick={() => {
                          cart.remove(line.key);
                          if (!embedded)
                            toast({
                              title: t.cart.removed(line.name),
                              action: {
                                label: t.cart.undo,
                                onClick: () =>
                                  cart.add({ productId: line.productId, color: line.color, ...(line.size && { size: line.size }), quantity: line.quantity }),
                              },
                            });
                        }}
                      />
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </SheetBody>

        {lines.length > 0 && (
          <SheetFooter>
            <div className="flex w-full items-baseline justify-between gap-2 text-subtitle2 font-semibold">
              <span>{t.cart.subtotal}</span>
              <span className="tabular-nums">{format.money(subtotal)}</span>
            </div>
            <p className="w-full text-caption1 text-foreground-3">{t.cart.note}</p>
            <Button asChild appearance="primary" className="w-full">
              <Link to={{ name: "checkout" }} onClick={close} onPointerEnter={() => void loaders.checkout()}>
                {t.cart.checkout}
              </Link>
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
