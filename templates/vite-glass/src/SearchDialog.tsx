import * as React from "react";
import { Location20Regular } from "@fluentui/react-icons";
import { Dialog, DialogContent, DialogSurface, DialogTitle, SearchBox } from "yugen-ui";
import type { Content } from "./content/types";
import { Link } from "./router";
import { TRIPS } from "./trips";

/** Trips whose title, place or highlights contain every word of the query (case and accents ignored). */
export function searchTrips(t: Content, query: string) {
  const fold = (s: string) => s.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();
  const words = fold(query).split(/\s+/).filter(Boolean);
  return TRIPS.filter((trip) => {
    const text = t.trips[trip.id];
    const haystack = fold([text.title, text.place, ...text.highlights, t.categories[trip.category]].join(" "));
    return words.every((word) => haystack.includes(word));
  });
}

export interface SearchDialogProps {
  t: Content;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/** Search from the sidebar, the mobile header or the tab bar: a glass dialog with live results. */
export function SearchDialog({ t, open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = React.useState("");
  const results = searchTrips(t, query);

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
    >
      <DialogSurface material="glass" className="max-w-lg">
        <DialogTitle>{t.search.title}</DialogTitle>
        <SearchBox
          autoFocus
          aria-label={t.search.title}
          placeholder={t.search.placeholder}
          value={query}
          onValueChange={setQuery}
          appearance="glass"
        />
        <DialogContent>
          <h3 className="pt-2 pb-1 text-caption1 font-semibold text-foreground-3">{t.search.trips}</h3>
          {results.length === 0 ? (
            <p role="status" className="py-2 text-body1 text-foreground-2">
              {t.search.empty}
            </p>
          ) : (
            <ul className="flex flex-col gap-0.5">
              {results.map((trip) => (
                <li key={trip.id}>
                  <Link
                    to={{ name: "trip", id: trip.id }}
                    onClick={() => onOpenChange(false)}
                    className="flex items-center gap-3 rounded-xlarge px-2 py-2 text-body1 hover:bg-subtle-hover active:bg-subtle-pressed"
                  >
                    <Location20Regular aria-hidden className="shrink-0 text-foreground-3" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{t.trips[trip.id].title}</span>
                      <span className="block truncate text-caption1 text-foreground-3">{t.trips[trip.id].place}</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </DialogSurface>
    </Dialog>
  );
}
