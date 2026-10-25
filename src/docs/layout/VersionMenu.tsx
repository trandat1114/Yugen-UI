import * as React from "react";
import { ChevronDown16Regular } from "@fluentui/react-icons";
import { Button, Menu, MenuItemRadio, MenuPopover, MenuRadioGroup, MenuTrigger } from "@/components/ui";
import { SITE } from "../site";
import { useLocale } from "../i18n";
import { localePathOf, parseLocation, pathOf } from "../router";

interface DocsVersion {
  version: string;
  /** Đường dẫn tương đối với gốc site ("" = bản mới nhất). */
  path: string;
  /** "path": URL kiểu /components/button (có prerender). Bản cũ (≤ 0.10) không có trường này và dùng #/components/button. */
  routing?: "path" | "hash";
}

/** Gốc site: BASE_URL bỏ đi đoạn "vX.Y/" (phiên bản cũ) hoặc "next/" (bản xem trước). */
const siteRoot = () => import.meta.env.BASE_URL.replace(/(v\d+\.\d+|next)\/$/, "");
const currentMinor = /\/next\/$/.test(import.meta.env.BASE_URL) ? "next" : SITE.version.split(".").slice(0, 2).join(".");
const label = (version: string) => (version === "next" ? "next" : `v${version}`);

/** Menu chọn phiên bản docs — chỉ hiện khi versions.json (sinh bởi scripts/build-versioned-docs.mjs) có ≥ 2 bản. */
export function VersionMenu() {
  const [versions, setVersions] = React.useState<DocsVersion[]>([]);
  const { t } = useLocale();

  React.useEffect(() => {
    let alive = true;
    fetch(`${siteRoot()}versions.json`)
      .then((r) => (r.ok ? (r.json() as Promise<DocsVersion[]>) : []))
      .then((list) => alive && Array.isArray(list) && setVersions(list))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);

  if (versions.length < 2) return null;
  const go = (version: string) => {
    const target = versions.find((v) => v.version === version);
    if (!target) return;
    // Giữ trang và ngôn ngữ đang xem khi đổi phiên bản (bản cũ: #/… và ?lang=en).
    const { route, lang } = parseLocation(window.location.pathname);
    const page = target.routing === "path" ? localePathOf(route, lang) : `${lang === "en" ? "?lang=en" : ""}#/${pathOf(route)}`;
    window.location.href = `${siteRoot()}${target.path}${page}`;
  };

  return (
    <Menu>
      <MenuTrigger asChild>
        <Button appearance="subtle" size="small" className="gap-0.5 font-normal" aria-label={t("version.label", { version: currentMinor })}>
          {label(currentMinor)}
          <ChevronDown16Regular />
        </Button>
      </MenuTrigger>
      <MenuPopover>
        <MenuRadioGroup value={currentMinor} onValueChange={go}>
          {versions.map((v, i) => (
            <MenuItemRadio key={v.version} value={v.version}>
              {label(v.version)}
              {i === 0 ? t("version.latest") : v.version === "next" ? t("version.next") : ""}
            </MenuItemRadio>
          ))}
        </MenuRadioGroup>
      </MenuPopover>
    </Menu>
  );
}
