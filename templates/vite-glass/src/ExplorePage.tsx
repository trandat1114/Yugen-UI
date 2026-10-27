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
} from "yugen-ui";
import { cn } from "yugen-ui";
import type { PageProps } from "./Layout";
import { minScale, ZOOM } from "./map";
import { Link } from "./router";
import { searchTrips } from "./SearchDialog";
import { TRIPS, type Category, type Trip } from "./trips";
import { MapPins, OVERSCAN, useMapView } from "./useMapView";

const FILTERS: ("all" | Category)[] = ["all", "sakura", "coast", "mountains", "desert", "forest"];
const CANVAS_BOX = { left: `${-OVERSCAN * 100}%`, top: `${-OVERSCAN * 100}%`, width: `${(1 + 2 * OVERSCAN) * 100}%`, height: `${(1 + 2 * OVERSCAN) * 100}%` };

/** Pins are content on the map, not controls: solid brand, so nothing has to blur behind them while the map moves. */
const PIN =
  "pointer-events-auto absolute top-0 left-0 flex size-10 will-change-transform -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-circular bg-brand-background text-foreground-on-brand shadow-8 ring-2 ring-background-1 hover:bg-brand-background-hover";

/**
 * Explore: a full-screen map with every trip pinned at its coordinates, and floating controls over it. The map fits the
 * trips of the filter and the search; drag it (it glides on), pinch, scroll or double-click to zoom. Pins too close to
 * tell apart join into one with the number of trips. A map is not a photo: the controls use the regular glass, with no
 * scrim.
 */
export default function ExplorePage({ t, embedded }: PageProps) {
  const [filter, setFilter] = React.useState<(typeof FILTERS)[number]>("all");
  const [query, setQuery] = React.useState("");
  const [openTrip, setOpenTrip] = React.useState<string | null>(null);
  const H1 = embedded ? "h2" : "h1";
  const matches = new Set(searchTrips(t, query).map((trip) => trip.id));
  const visible = TRIPS.filter((trip) => (filter === "all" || trip.category === filter) && matches.has(trip.id));
  // In the docs preview the page scrolls under the wheel; zoom needs Ctrl or a pinch there.
  const map = useMapView(visible, { wheel: embedded ? "ctrl" : "always", onMoveStart: () => setOpenTrip(null) });

  return (
    <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="relative isolate h-full min-h-120 overflow-hidden">
      {/* The map in the theme's backgrounds: water behind, the land on a canvas bigger than the screen, so it moves as
          one layer. Not mirrored in RTL. */}
      <div
        ref={map.mapRef}
        {...map.handlers}
        className="absolute inset-0 -z-10 cursor-grab touch-none bg-background-5 select-none active:cursor-grabbing"
      >
        {/* Colors for the canvas: land in `color`, coast in `border-color` (no border is drawn). */}
        <canvas
          ref={map.canvasRef}
          role="img"
          aria-label={t.explore.picture}
          style={CANVAS_BOX}
          className="absolute border-stroke-2 text-background-1 will-change-transform"
        />
      </div>

      {/* Pins, placed by the map in screen pixels; under the bars. */}
      {FILTERS.map((value) => (
        <TabsContent key={value} value={value} className="pointer-events-none absolute inset-0 -z-10 pt-0">
          <MapPins map={map}>
            {(group) =>
              group.trips.length === 1 ? (
                <TripPin
                  key={group.key}
                  t={t}
                  trip={group.trips[0]}
                  open={openTrip === group.key}
                  onOpenChange={(open) => setOpenTrip(open ? group.key : null)}
                  buttonRef={map.pinRef(group.key)}
                />
              ) : (
                <button
                  key={group.key}
                  ref={map.pinRef(group.key)}
                  type="button"
                  aria-label={t.explore.group(group.trips.map((trip) => t.trips[trip.id].title))}
                  className={cn(PIN, "text-body1 font-semibold")}
                  onClick={() => map.fitTrips(group.trips)}
                >
                  {group.trips.length}
                </button>
              )
            }
          </MapPins>
        </TabsContent>
      ))}

      {/* Title and search at the top (search at the trailing end), zoom on the side, filters at the bottom. */}
      <div ref={map.barsRef} className="pointer-events-none flex h-full flex-col justify-between gap-3 p-3 pb-24 @3xl/app:ps-26 @3xl/app:pb-3 @5xl/app:ps-70">
        <Toolbar material="glass" aria-label={t.explore.title} className="pointer-events-auto self-stretch @xl/app:self-start">
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
          <TabsList material="glass" aria-label={t.explore.filters} size="small" className="pointer-events-auto max-w-full overflow-x-auto">
            {FILTERS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {t.explore.categories[value]}
              </TabsTrigger>
            ))}
          </TabsList>
          <Toolbar material="glass" orientation="vertical" aria-label={t.explore.controls} className="pointer-events-auto">
            <ToolbarButton
              icon={<ZoomIn20Regular />}
              aria-label={t.explore.zoomIn}
              disabled={!map.view || map.view.k >= ZOOM.max}
              onClick={() => map.zoomBy(ZOOM.step)}
            />
            <ToolbarButton
              icon={<ZoomOut20Regular />}
              aria-label={t.explore.zoomOut}
              disabled={!map.screen || !map.view || map.view.k <= minScale(map.screen.size) * 1.001}
              onClick={() => map.zoomBy(1 / ZOOM.step)}
            />
          </Toolbar>
        </div>
      </div>
      {matches.size === 0 && (
        <p role="status" className="glass absolute inset-x-0 top-20 mx-auto w-fit rounded-circular px-4 py-2 text-body1 shadow-8">
          {t.explore.noMatch}
        </p>
      )}
    </Tabs>
  );
}

interface TripPinProps {
  t: PageProps["t"];
  trip: Trip;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  buttonRef: (el: HTMLButtonElement | null) => void;
}

function TripPin({ t, trip, open, onOpenChange, buttonRef }: TripPinProps) {
  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <button ref={buttonRef} type="button" aria-label={t.trips[trip.id].title} className={PIN}>
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
  );
}
