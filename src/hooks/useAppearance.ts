import { useCallback, useEffect, useState } from "react";
import type { YugenDir, YugenTheme } from "@/components/ui";

export type AppBrand = "sakura" | "web" | "teams";

export interface Appearance {
  theme: YugenTheme;
  brand: AppBrand;
  dir: YugenDir;
}

/** Cùng key với script chống nháy trong index.html. */
export const APPEARANCE_STORAGE_KEY = "yugen-ui-appearance";

function initialAppearance(): Appearance {
  const fallback: Appearance = {
    theme: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
    brand: "sakura",
    dir: "ltr",
  };
  try {
    const raw = localStorage.getItem(APPEARANCE_STORAGE_KEY);
    // Giống "globals" của Storybook: ?theme=dark&brand=web&dir=rtl ghi đè giá trị đã lưu.
    const params = new URLSearchParams(window.location.search);
    const saved = {
      ...(raw ? (JSON.parse(raw) as Partial<Appearance>) : {}),
      ...Object.fromEntries(["theme", "brand", "dir"].flatMap((k) => (params.get(k) ? [[k, params.get(k)]] : []))),
    } as Partial<Appearance>;
    return {
      theme: saved.theme === "light" || saved.theme === "dark" || saved.theme === "high-contrast" ? saved.theme : fallback.theme,
      brand: saved.brand === "web" || saved.brand === "teams" || saved.brand === "sakura" ? saved.brand : fallback.brand,
      dir: saved.dir === "rtl" ? "rtl" : "ltr",
    };
  } catch {
    return fallback;
  }
}

/** Theme / brand / hướng chữ của trang docs (giống thanh addon của Storybook). */
export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>(initialAppearance);

  useEffect(() => {
    try {
      localStorage.setItem(APPEARANCE_STORAGE_KEY, JSON.stringify(appearance));
    } catch {
      /* storage bị chặn: bỏ qua */
    }
  }, [appearance]);

  const update = useCallback((patch: Partial<Appearance>) => setAppearance((a) => ({ ...a, ...patch })), []);

  return { ...appearance, update };
}
