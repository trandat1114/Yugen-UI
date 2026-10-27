import { useStore } from "./context";
import type { LineView } from "./lines";
import { ProductArt } from "./ProductArt";

/** Small list of the lines, for the review step and the order page. */
export function LineList({ lines, money }: { lines: Pick<LineView, "key" | "product" | "color" | "name" | "variant" | "quantity" | "total">[]; money?: (value: number) => string }) {
  const { format } = useStore();
  const show = money ?? format.money;
  return (
    <ul className="flex flex-col gap-3">
      {lines.map((line) => (
        <li key={line.key} className="flex items-center gap-3">
          <div className="relative size-12 shrink-0 rounded-medium bg-background-3 p-1">
            <ProductArt product={line.product} color={line.color} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-body1 font-semibold">{line.name}</p>
            <p className="text-caption1 text-foreground-3">
              {line.variant} · × {format.count(line.quantity)}
            </p>
          </div>
          <p className="shrink-0 text-body1 tabular-nums">{show(line.total)}</p>
        </li>
      ))}
    </ul>
  );
}
