import * as React from "react";
import { Document20Regular, NumberSymbol20Regular } from "@fluentui/react-icons";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "yugen-ui";
import { useSite } from "./pages";
import { buildIndex, searchIndex, type SearchEntry } from "./search";

// Front matter and headings of every page. This file is loaded when the palette first opens, so the index is not part of
// the first load. In the build, the docsContent plugin in vite.config.ts trims each file to its outline.
const outlines = import.meta.glob<string>("./content/*/docs/*/*.md", { query: "?raw&outline", import: "default", eager: true });

const indexes = new Map<string, SearchEntry[]>();

function indexFor(lang: string) {
  let index = indexes.get(lang);
  if (!index) {
    const prefix = `./content/${lang}/docs/`;
    index = buildIndex(Object.fromEntries(Object.entries(outlines).filter(([file]) => file.startsWith(prefix))));
    indexes.set(lang, index);
  }
  return index;
}

export interface SearchPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (entry: SearchEntry) => void;
}

/** Ctrl / ⌘ K: page titles and h2 / h3 headings, grouped by section. */
export default function SearchPalette({ open, onOpenChange, onSelect }: SearchPaletteProps) {
  const { t } = useSite();
  const [query, setQuery] = React.useState("");
  const index = indexFor(t.lang);
  const results = React.useMemo(() => searchIndex(index, query), [index, query]);
  const groups = React.useMemo(() => {
    const map = new Map<string, SearchEntry[]>();
    for (const entry of results) map.set(entry.section, [...(map.get(entry.section) ?? []), entry]);
    return [...map];
  }, [results]);

  return (
    <CommandDialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next);
        if (!next) setQuery("");
      }}
      title={t.search.title}
      // Filtering and order come from searchIndex (accents ignored); cmdk only handles the keyboard.
      shouldFilter={false}
    >
      <CommandInput value={query} onValueChange={setQuery} placeholder={t.search.placeholder} />
      <CommandList>
        <CommandEmpty>{t.search.empty}</CommandEmpty>
        {groups.map(([section, entries]) => (
          <CommandGroup key={section} heading={section}>
            {entries.map((entry) => (
              <CommandItem
                key={entry.id}
                value={entry.id}
                icon={entry.hash ? <NumberSymbol20Regular /> : <Document20Regular />}
                onSelect={() => {
                  onOpenChange(false);
                  setQuery("");
                  onSelect(entry);
                }}
              >
                <span className="min-w-0 flex-1 truncate">{entry.title}</span>
                {entry.hash && <span className="max-w-[40%] shrink-0 truncate text-caption1 text-foreground-3">{entry.page.title}</span>}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </CommandDialog>
  );
}
