import * as React from "react";
import { SITE } from "../site";
import type { VersionPickerProps } from "./VersionPicker";

export interface DocsVersion {
  version: string;
  /** Đường dẫn tương đối với gốc site ("" = bản mới nhất). */
  path: string;
  /** "path": URL kiểu /components/button (có prerender). Bản cũ (≤ 0.10) không có trường này và dùng #/components/button. */
  routing?: "path" | "hash";
}

/** Gốc site: BASE_URL bỏ đi đoạn "vX.Y/" (phiên bản cũ) hoặc "next/" (bản xem trước). */
export const siteRoot = () => import.meta.env.BASE_URL.replace(/(v\d+\.\d+|next)\/$/, "");
export const currentMinor = /\/next\/$/.test(import.meta.env.BASE_URL) ? "next" : SITE.version.split(".").slice(0, 2).join(".");

/**
 * Menu chọn phiên bản docs — chỉ hiện khi versions.json (sinh bởi scripts/build-versioned-docs.mjs) có ≥ 2 bản. Phần menu
 * (Radix Menu) nạp lười sau khi biết có menu (#307): local và bản build thường không có versions.json, không tải.
 */
export function VersionMenu() {
  const [picker, setPicker] = React.useState<{ Picker: React.ComponentType<VersionPickerProps>; versions: DocsVersion[] } | null>(null);

  React.useEffect(() => {
    let alive = true;
    fetch(`${siteRoot()}versions.json`)
      .then((r) => (r.ok ? (r.json() as Promise<DocsVersion[]>) : []))
      .then(async (list) => {
        if (!Array.isArray(list) || list.length < 2) return;
        const { VersionPicker } = await import("./VersionPicker");
        if (alive) setPicker({ Picker: VersionPicker, versions: list });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (!picker) return null;
  const { Picker, versions } = picker;
  return <Picker versions={versions} />;
}
