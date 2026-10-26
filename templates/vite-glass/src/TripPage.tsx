import * as React from "react";
import {
  ArrowLeft20Regular,
  Heart20Filled,
  Heart20Regular,
  Info20Regular,
  Link20Regular,
  Map20Regular,
  MoreHorizontal20Regular,
  Share20Regular,
} from "@fluentui/react-icons";
import {
  Carousel,
  CarouselCard,
  CarouselNavContainer,
  CarouselViewport,
  Menu,
  MenuItem,
  MenuPopover,
  MenuTrigger,
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  Toolbar,
  ToolbarButton,
  ToolbarDivider,
  ToolbarGroup,
  ToolbarToggleButton,
  toast,
} from "yugen-ui";
import { cn } from "yugen-ui";
import { formatDate, PAGE_INSET } from "./HomePage";
import type { PageProps } from "./Layout";
import NotFoundPage from "./NotFoundPage";
import { PHOTOS } from "./photos";
import { PhotoImage } from "./Photo";
import { Link, useRouter } from "./router";
import { findTrip } from "./trips";

/** A trip: glass toolbar over the gallery, the story, and the details in a glass bottom sheet. */
export default function TripPage(props: PageProps & { id: string }) {
  const { t, id, embedded } = props;
  const { href, navigate } = useRouter();
  const trip = findTrip(id);
  const [favorite, setFavorite] = React.useState(false);
  if (!trip) return <NotFoundPage {...props} />;

  const text = t.trips[trip.id];
  const H1 = embedded ? "h2" : "h1";
  const H2 = embedded ? "h3" : "h2";
  const url = () => new URL(href({ name: "trip", id: trip.id }), window.location.href).href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url());
      toast({ intent: "success", title: t.trip.linkCopied });
    } catch {
      /* clipboard blocked: nothing to undo */
    }
  };
  const share = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: text.title, url: url() });
      } catch {
        /* cancelled */
      }
    } else void copyLink();
  };

  return (
    <article>
      {/* Groups with fixed spacing: navigation · actions on the trip · details. One backdrop for the whole bar. */}
      <div className="scroll-edge sticky top-0 z-10 flex justify-center px-3 pt-3 @3xl/app:ps-26 @5xl/app:ps-70">
        <Toolbar material="glass" aria-label={t.trip.actions}>
          <ToolbarButton asChild>
            <Link to={{ name: "home" }}>
              <ArrowLeft20Regular aria-hidden className="rtl:-scale-x-100" />
              {t.trip.back}
            </Link>
          </ToolbarButton>
          <ToolbarDivider />
          <ToolbarGroup>
            <ToolbarButton icon={<Share20Regular />} aria-label={t.trip.share} onClick={share} />
            <ToolbarToggleButton
              icon={<Heart20Regular />}
              checkedIcon={<Heart20Filled />}
              aria-label={t.trip.favorite}
              checked={favorite}
              onCheckedChange={setFavorite}
            />
            <Menu>
              <MenuTrigger asChild>
                <ToolbarButton icon={<MoreHorizontal20Regular />} aria-label={t.trip.more} />
              </MenuTrigger>
              <MenuPopover material="glass" align="end">
                <MenuItem icon={<Link20Regular />} onSelect={() => void copyLink()}>
                  {t.trip.copyLink}
                </MenuItem>
                <MenuItem icon={<Map20Regular />} onSelect={() => navigate({ name: "explore" })}>
                  {t.trip.openOnMap}
                </MenuItem>
              </MenuPopover>
            </Menu>
          </ToolbarGroup>
          <ToolbarDivider />
          <Sheet mode="bottom" snapPoints={[0.5, 0.92]}>
            <SheetTrigger asChild>
              <ToolbarButton icon={<Info20Regular />}>{t.trip.details}</ToolbarButton>
            </SheetTrigger>
            <SheetContent material="glass">
              <SheetHeader>
                <SheetTitle>{text.title}</SheetTitle>
              </SheetHeader>
              <SheetBody>
                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-body1">
                  <dt className="text-foreground-3">{t.trip.when}</dt>
                  <dd>
                    {formatDate(t, trip.start)} · {t.home.days(trip.days)}
                  </dd>
                  <dt className="text-foreground-3">{t.trip.distance}</dt>
                  <dd>{trip.distanceKm} km</dd>
                </dl>
                <h3 className="pt-4 pb-1 text-subtitle2 font-semibold">{t.trip.highlights}</h3>
                <ul className="list-disc ps-5 text-body1 text-foreground-2">
                  {text.highlights.map((h) => (
                    <li key={h}>{h}</li>
                  ))}
                </ul>
              </SheetBody>
            </SheetContent>
          </Sheet>
        </Toolbar>
      </div>

      {/* The gallery runs under the sidebar too (background extension). */}
      <div className="-mt-16">
        <Carousel loop aria-label={t.trip.gallery} className="w-full">
          <CarouselViewport>
            {trip.photos.map((key, i) => (
              <CarouselCard key={key} aria-label={t.trip.photo(i + 1, trip.photos.length)}>
                <PhotoImage
                  photo={PHOTOS[key]}
                  alt=""
                  sizes="100vw"
                  eager={i === 0}
                  className="h-[min(70vh,36rem)] w-full"
                />
              </CarouselCard>
            ))}
          </CarouselViewport>
          <CarouselNavContainer className="pt-3" />
        </Carousel>
      </div>

      <div className={cn("mx-auto max-w-3xl pt-6", PAGE_INSET)}>
        <p className="text-body1 font-semibold text-brand-foreground-1">{text.place}</p>
        <H1 className="mt-1 font-display text-title2 font-semibold @3xl/app:text-title1">{text.title}</H1>
        <p className="mt-2 text-body2 text-foreground-2">{text.summary}</p>
        <div className="mt-6 flex flex-col gap-4 text-body2">
          {text.story.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <H2 className="mt-8 font-display text-subtitle1 font-semibold">{t.trip.highlights}</H2>
        <ul className="mt-2 list-disc ps-5 text-body1 text-foreground-2">
          {text.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
