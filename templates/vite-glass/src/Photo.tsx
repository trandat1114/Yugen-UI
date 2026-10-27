import { Earth20Filled } from "@fluentui/react-icons";
import { cn } from "yugen-ui";
import type { Photo } from "./photos";

export interface PhotoImageProps {
  photo: Photo;
  /** Empty for decorative photos (a heading or caption already says what they show). */
  alt: string;
  /** Rendered width, for the browser to pick 640 or 1280 (the `sizes` attribute). */
  sizes: string;
  /** Above the fold: load right away instead of when scrolled into view. */
  eager?: boolean;
  className?: string;
}

/** A photo in two widths; the browser downloads the one that fits. Width / height reserve the space (no layout shift). */
export function PhotoImage({ photo, alt, sizes, eager = false, className }: PhotoImageProps) {
  return (
    <img
      src={photo.small}
      srcSet={`${photo.small} 640w, ${photo.large} 1280w`}
      sizes={sizes}
      width={1280}
      height={800}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      className={cn("object-cover", className)}
    />
  );
}

/** App logo in the sidebar and the mobile header. */
export function Logo() {
  return (
    <span aria-hidden className="flex size-8 shrink-0 items-center justify-center rounded-circular bg-brand-background text-foreground-on-brand">
      <Earth20Filled />
    </span>
  );
}
