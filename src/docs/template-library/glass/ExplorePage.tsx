import * as React from "react";
import { Location20Filled, ZoomIn20Regular, ZoomOut20Regular } from "@fluentui/react-icons";
import {
  Button,
  Popover,
  PopoverSurface,
  PopoverTrigger,
  SearchBox,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Toolbar,
  ToolbarButton,
} from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PageProps } from "./Layout";
import { PHOTOS } from "./photos";
import { PhotoImage } from "./Photo";
import { Link } from "./router";
import { searchTrips } from "./SearchDialog";
import { TRIPS, type Category } from "./trips";

const FILTERS: ("all" | Category)[] = ["all", "sakura", "coast", "mountains", "desert", "forest"];
const ZOOM = { min: 1, max: 2, step: 0.25 };

/**
 * Explore: one full-screen picture with every trip as a pin, and floating controls over it. Over a photo the controls
 * use the clear glass (Settings › Controls over photos), on top of a dimmed photo (glass-scrim) so white text stays
 * legible.
 */
export default function ExplorePage({ t, appearance, embedded }: PageProps) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = React.useState("");
  const [zoom, setZoom] = React.useState(1);
  const clear = appearance.overMedia === "clear";
  const media = clear ? "glass-clear" : "glass";
  const H1 = embedded ? "h2" : "h1";
  const matches = new Set(searchTrips(t, query).map((trip) => trip.id));
  const zoomBy = (delta: number) => setZoom((z) => Math.min(ZOOM.max, Math.max(ZOOM.min, z + delta)));

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="relative isolate h-full min-h-120 overflow-hidden">
      {/* The picture (and the pins on it) scale together; the pins scale back so they keep their size. */}
      <div
        className="absolute inset-0 -z-10 origin-center transition-transform duration-gentle ease-easy-ease motion-reduce:transition-none"
        style={{ transform: `scale(${zoom})` }}
      >
        <PhotoImage photo={PHOTOS.gionWeeping} alt={t.explore.picture} sizes="100vw" eager className="size-full" />
        {clear && <div aria-hidden className="glass-scrim absolute inset-0" />}
        {FILTERS.map((value) => (
          <TabsContent key={value} value={value} className="absolute inset-0 pt-0">
            {TRIPS.filter((trip) => (value === "all" || trip.category === value) && matches.has(trip.id)).map((trip) => (
              <Popover key={trip.id}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    aria-label={t.trips[trip.id].title}
                    style={{ insetInlineStart: `${trip.pin.x}%`, top: `${trip.pin.y}%`, scale: `${1 / zoom}` }}
                    className={cn(
                      media,
                      "absolute flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-circular border border-transparent shadow-8 rtl:translate-x-1/2",
                      "text-brand-foreground-1",
                      clear
                        ? "hover:[--glass-bg:var(--colorGlassClearBackgroundHover)]"
                        : "hover:[--glass-bg:var(--colorGlassBackgroundHover)]",
                    )}
                  >
                    <Location20Filled />
                  </button>
                </PopoverTrigger>
                <PopoverSurface material="glass" withArrow className="w-64">
                  <p className="text-body1 font-semibold">{t.trips[trip.id].title}</p>
                  <p className="text-caption1 text-foreground-3">
                    {t.trips[trip.id].place} · {t.categories[trip.category]}
                  </p>
                  <Button asChild appearance="glass-prominent" shape="circular" size="small" className="mt-3">
                    <Link to={{ name: "trip", id: trip.id }}>{t.explore.openTrip}</Link>
                  </Button>
                </PopoverSurface>
              </Popover>
            ))}
          </TabsContent>
        ))}
      </div>

      {/* Title and search at the top (search at the trailing end), zoom on the side, filters at the bottom. */}
      <div className="pointer-events-none flex h-full flex-col justify-between gap-3 p-3 pb-24 @3xl/app:ps-26 @3xl/app:pb-3 @5xl/app:ps-70">
        <Toolbar material={media} aria-label={t.explore.title} className="pointer-events-auto self-stretch @xl/app:self-start">
          <H1 className="px-3 text-body1 font-semibold whitespace-nowrap">{t.explore.title}</H1>
          <SearchBox
            appearance="glass"
            size="small"
            aria-label={t.explore.search}
            placeholder={t.explore.search}
            value={query}
            onValueChange={setQuery}
            rootClassName="min-w-0 flex-1 @xl/app:w-56 @xl/app:flex-none"
          />
        </Toolbar>

        <div className="flex items-end justify-between gap-3">
          <TabsList material={media} aria-label={t.explore.filters} size="small" className="pointer-events-auto max-w-full overflow-x-auto">
            {FILTERS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {t.explore.categories[value]}
              </TabsTrigger>
            ))}
          </TabsList>
          <Toolbar material={media} orientation="vertical" aria-label={t.explore.controls} className="pointer-events-auto">
            <ToolbarButton icon={<ZoomIn20Regular />} aria-label={t.explore.zoomIn} disabled={zoom >= ZOOM.max} onClick={() => zoomBy(ZOOM.step)} />
            <ToolbarButton icon={<ZoomOut20Regular />} aria-label={t.explore.zoomOut} disabled={zoom <= ZOOM.min} onClick={() => zoomBy(-ZOOM.step)} />
          </Toolbar>
        </div>
      </div>
      {matches.size === 0 && (
        <p role="status" className={cn(media, "absolute inset-x-0 top-20 mx-auto w-fit rounded-circular px-4 py-2 text-body1 shadow-8")}>
          {t.explore.noMatch}
        </p>
      )}
    </Tabs>
  );
}
