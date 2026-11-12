import * as React from "react";
import type { VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";
import { cvx } from "@/lib/cvx";
import { useComponentDefaults } from "../YugenProvider/context";

/** Fluent 2 Avatar — https://fluent2.microsoft.design/components/web/react/core/avatar/usage */
const avatarVariants = cvx(
  "relative inline-flex shrink-0 items-center justify-center overflow-hidden font-semibold select-none",
  {
    variants: {
      size: {
        20: "size-5 text-[9px]",
        24: "size-6 text-caption2",
        32: "size-8 text-caption1",
        40: "size-10 text-body1",
        48: "size-12 text-subtitle2",
        64: "size-16 text-subtitle1",
        96: "size-24 text-title2",
      },
      shape: {
        circular: "rounded-circular",
        square: "rounded-medium",
      },
    },
    defaultVariants: { size: 32, shape: "circular" },
  },
);

const COLORFUL = [
  "bg-cranberry-bg text-cranberry-fg",
  "bg-marigold-bg text-marigold-fg",
  "bg-teal-bg text-teal-fg",
  "bg-lavender-bg text-lavender-fg",
  "bg-forest-bg text-forest-fg",
  "bg-steel-bg text-steel-fg",
] as const;

const PRESENCE = {
  available: "bg-success-background-3",
  busy: "bg-danger-background-3",
  away: "bg-warning-background-3",
  offline: "bg-background-1 ring-[1.5px] ring-inset ring-foreground-3",
} as const;

export type AvatarLoadingStatus = "loading" | "loaded" | "error";

/** Attributes passed to the avatar's `<img>`. The name stays on the wrapper (`role="img"` + `aria-label`). */
export type AvatarImageOptions = Pick<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "srcSet" | "sizes" | "loading" | "decoding" | "crossOrigin" | "referrerPolicy" | "fetchPriority"
>;

/** Props for `renderImage`: spread them on a framework image component (Next.js `<Image>`, a CDN component). */
export interface AvatarImageRenderProps extends AvatarImageOptions {
  src: string;
  alt: "";
  className: string;
  onLoad: () => void;
  onError: () => void;
}

export interface AvatarProps extends VariantProps<typeof avatarVariants> {
  name: string;
  src?: string;
  /** `<img>` attributes: `srcSet`, `sizes`, `loading`, `decoding`, `crossOrigin`, `referrerPolicy`, `fetchPriority`. */
  image?: AvatarImageOptions;
  /** Renders the image with another component, e.g. `(props) => <Image {...props} width={40} height={40} />`. */
  renderImage?: (props: AvatarImageRenderProps) => React.ReactNode;
  /** Called with `"loading"`, then `"loaded"` or `"error"`, for each `src`. */
  onLoadingStatusChange?: (status: AvatarLoadingStatus) => void;
  /** Milliseconds to wait before showing the initials while the image loads. */
  fallbackDelay?: number;
  color?: "neutral" | "brand" | "colorful";
  presence?: keyof typeof PRESENCE;
  className?: string;
}

function initialsOf(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[words.length - 1][0]).toUpperCase();
}

function hashOf(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

/**
 * Load state of `src`, kept per URL so a new `src` starts over at "loading". The `<img>` is in the server HTML, so the
 * browser can finish loading it before React hydrates and the load event is gone: the effect reads `complete` then.
 */
function useImageStatus(src: string | undefined, frame: React.RefObject<HTMLSpanElement | null>) {
  const [state, setState] = React.useState<{ src?: string; status: AvatarLoadingStatus }>({ src, status: "loading" });
  const status: AvatarLoadingStatus = !src ? "error" : state.src === src ? state.status : "loading";
  const settle = React.useCallback((next: AvatarLoadingStatus) => setState({ src, status: next }), [src]);

  React.useEffect(() => {
    const img = frame.current?.querySelector("img");
    if (!src || !img?.complete) return;
    let active = true;
    if (img.naturalWidth > 0) settle("loaded");
    // An SVG without width / height can report naturalWidth 0 once loaded; decode() tells it apart from a broken image.
    else if (typeof img.decode === "function") img.decode().then(() => active && settle("loaded"), () => active && settle("error"));
    else settle("error");
    return () => {
      active = false;
    };
  }, [src, frame, settle]);

  return { status, settle };
}

export function Avatar(inProps: AvatarProps) {
  const {
    name,
    src,
    image,
    renderImage,
    onLoadingStatusChange,
    fallbackDelay = 400,
    size,
    shape,
    color = "neutral",
    presence,
    className,
  } = useComponentDefaults("Avatar", inProps);
  const frame = React.useRef<HTMLSpanElement>(null);
  const { status, settle } = useImageStatus(src, frame);

  // Initials appear at once without an image, after `fallbackDelay` while it loads, and stay hidden once it has loaded
  // (a transparent logo would show them through).
  const [waited, setWaited] = React.useState<string>();
  React.useEffect(() => {
    if (status !== "loading" || fallbackDelay <= 0) return;
    const timer = setTimeout(() => setWaited(src), fallbackDelay);
    return () => clearTimeout(timer);
  }, [status, src, fallbackDelay]);
  const showInitials = status === "error" || (status === "loading" && (fallbackDelay <= 0 || waited === src));

  const onStatus = React.useRef(onLoadingStatusChange);
  React.useEffect(() => {
    onStatus.current = onLoadingStatusChange;
  });
  React.useEffect(() => {
    if (src) onStatus.current?.(status);
  }, [src, status]);

  const colorClass =
    color === "brand"
      ? "bg-brand-background text-foreground-on-brand"
      : color === "colorful"
        ? COLORFUL[hashOf(name) % COLORFUL.length]
        : "bg-background-6 text-foreground-3";
  const small = size === 20 || size === 24;

  let img: React.ReactNode = null;
  if (src && status !== "error") {
    const imgProps: AvatarImageRenderProps = {
      ...image,
      src,
      alt: "",
      className: "absolute inset-0 size-full object-cover",
      onLoad: () => settle("loaded"),
      onError: () => settle("error"),
    };
    img = renderImage ? renderImage(imgProps) : <img {...imgProps} />;
  }

  return (
    <span className="relative inline-flex shrink-0" role="img" aria-label={name}>
      <span ref={frame} className={avatarVariants({ size, shape, className: [colorClass, className] })}>
        {showInitials && <span aria-hidden>{initialsOf(name)}</span>}
        {img}
      </span>
      {presence && (
        <span
          className={cn(
            "absolute -inset-e-px -bottom-px rounded-circular ring-2 ring-background-1",
            small ? "size-2" : "size-3",
            PRESENCE[presence],
          )}
        />
      )}
    </span>
  );
}

declare module "../YugenProvider/context" {
  interface YugenComponentDefaults {
    Avatar: AvatarProps;
  }
}
