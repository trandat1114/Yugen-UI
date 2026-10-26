import { Calendar20Regular, Map20Regular } from "@fluentui/react-icons";
import { Badge, Button } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { PageProps } from "./Layout";
import { PHOTOS } from "./photos";
import { PhotoImage } from "./Photo";
import { Link } from "./router";
import { TRIPS } from "./trips";

/** Space for the floating navigation: the sidebar from 768px, the header and tab bar below. */
export const PAGE_INSET = "px-4 pb-28 @3xl/app:ps-26 @3xl/app:pe-6 @3xl/app:pb-10 @5xl/app:ps-70";

export function formatDate(t: PageProps["t"], iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString(t.locale, { day: "numeric", month: "short", year: "numeric" });
}

/** Journal: a full-bleed photo under the floating bars, then the trips. */
export default function HomePage({ t, appearance, embedded }: PageProps) {
  const H1 = embedded ? "h2" : "h1";
  const H2 = embedded ? "h3" : "h2";
  const km = TRIPS.reduce((sum, trip) => sum + trip.distanceKm, 0).toLocaleString(t.locale);
  const media = appearance.overMedia === "clear" ? "glass-clear" : "glass";

  return (
    <div>
      {/* Content layer: the photo runs edge to edge, under the sidebar and the header. */}
      <section className="relative isolate flex min-h-104 items-end @3xl/app:min-h-128">
        <PhotoImage photo={PHOTOS.coastCliff} alt="" sizes="100vw" eager className="absolute inset-0 -z-10 size-full" />
        {media === "glass-clear" && <div aria-hidden className="glass-scrim absolute inset-0 -z-10" />}
        <div className={cn("w-full pt-24", PAGE_INSET, "pb-6 @3xl/app:pb-8")}>
          <div className={cn(media, "max-w-xl rounded-4xlarge border border-transparent p-5 shadow-16 @3xl/app:p-6")}>
            <H1 className="font-display text-title2 font-semibold text-foreground-1 @3xl/app:text-title1">{t.home.title}</H1>
            <p className="mt-2 text-body2 text-foreground-2">{t.home.lead}</p>
            <Button asChild appearance="glass-prominent" shape="circular" size="large" className="mt-4">
              <Link to={{ name: "explore" }}>
                <Map20Regular aria-hidden />
                {t.home.cta}
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section aria-labelledby="trips-title" className={cn("pt-8", PAGE_INSET)}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <H2 id="trips-title" className="font-display text-title3 font-semibold">
            {t.home.tripsTitle}
          </H2>
          <p className="text-body1 text-foreground-3">{t.home.tripsSummary(TRIPS.length, km)}</p>
        </div>
        <ul className="mt-4 grid gap-4 @xl/app:grid-cols-2 @6xl/app:grid-cols-3">
          {TRIPS.map((trip) => {
            const text = t.trips[trip.id];
            return (
              <li key={trip.id}>
                <Link
                  to={{ name: "trip", id: trip.id }}
                  className="group/trip flex h-full flex-col overflow-hidden rounded-3xlarge border border-stroke-2 bg-background-1 shadow-4 transition-shadow duration-normal hover:shadow-16"
                >
                  <PhotoImage
                    photo={PHOTOS[trip.photos[0]]}
                    alt=""
                    sizes="(min-width: 1280px) 400px, (min-width: 768px) 50vw, 100vw"
                    className="aspect-16/10 w-full"
                  />
                  <span className="flex flex-1 flex-col gap-1 p-4">
                    <Badge appearance="tint" color="brand" className="self-start">
                      {t.categories[trip.category]}
                    </Badge>
                    <span className="text-subtitle2 font-semibold group-hover/trip:underline">{text.title}</span>
                    <span className="text-body1 text-foreground-2">{text.summary}</span>
                    <span className="mt-auto flex items-center gap-1.5 pt-2 text-caption1 text-foreground-3">
                      <Calendar20Regular aria-hidden className="size-4" />
                      {formatDate(t, trip.start)} · {t.home.days(trip.days)} · {trip.distanceKm} km
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
