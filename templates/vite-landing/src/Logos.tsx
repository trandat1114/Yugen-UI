import type { ReactNode } from "react";
import { cn } from "yugen-ui";

/** The product mark: a note on the brand colour. */
export function Logo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" aria-hidden className={cn("shrink-0", className)}>
      <rect width="24" height="24" rx="6" className="fill-brand-background" />
      <path d="M7 5.5h7l3 3v10H7z" className="fill-foreground-on-brand" />
      <path d="M9.5 11.5h5M9.5 14.5h3.5" strokeWidth="1.5" strokeLinecap="round" className="fill-none stroke-brand-background" />
    </svg>
  );
}

/** Made-up companies for the logo row: a simple glyph and the name, in the current text colour. */
const WORDMARKS: { name: string; glyph: ReactNode }[] = [
  { name: "Kumo", glyph: <path d="M8 24a6 6 0 0 1 .4-12 8 8 0 0 1 15.2 2.4A4.8 4.8 0 0 1 23 24z" /> },
  {
    name: "Riverline",
    glyph: (
      <path
        d="M2 10c4-3 8 3 12 0s8 3 12 0M2 16c4-3 8 3 12 0s8 3 12 0M2 22c4-3 8 3 12 0s8 3 12 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    ),
  },
  { name: "Hoshi Labs", glyph: <path d="M14 3l2.8 8.2L25 14l-8.2 2.8L14 25l-2.8-8.2L3 14l8.2-2.8z" /> },
  { name: "Larchwood", glyph: <path d="M14 3l8 11h-4.5l5.5 8H15.5v4h-3v-4H5l5.5-8H6z" /> },
  {
    name: "Tidepool",
    glyph: (
      <>
        <circle cx="14" cy="15" r="10" fill="none" stroke="currentColor" strokeWidth="2.5" />
        <circle cx="14" cy="15" r="4.5" />
      </>
    ),
  },
];

/** A row of customer wordmarks, drawn as SVG (no image requests). */
export function LogoRow({ label }: { label: string }) {
  return (
    <ul aria-label={label} className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-foreground-3">
      {WORDMARKS.map(({ name, glyph }) => {
        // Room for the glyph, a gap and the name at 18px.
        const width = Math.round(44 + name.length * 10.5);
        return (
          <li key={name}>
            <svg role="img" aria-label={name} viewBox={`0 0 ${width} 30`} width={width} height="30" className="h-7 w-auto">
              <g fill="currentColor">{glyph}</g>
              <text x="36" y="21" fill="currentColor" fontSize="18" fontWeight="600" letterSpacing="-0.2">
                {name}
              </text>
            </svg>
          </li>
        );
      })}
    </ul>
  );
}
