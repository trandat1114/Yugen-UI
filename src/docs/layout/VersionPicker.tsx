import { ChevronDown16Regular } from "@fluentui/react-icons";
import { Button, Menu, MenuItemRadio, MenuPopover, MenuRadioGroup, MenuTrigger } from "@/components/ui";
import { useLocale } from "../i18n";
import { localePathOf, parseLocation, pathOf } from "../router";
import { currentMinor, siteRoot, type DocsVersion } from "./VersionMenu";

const label = (version: string) => (version === "next" ? "next" : `v${version}`);

export interface VersionPickerProps {
  versions: DocsVersion[];
}

/** Phần menu của VersionMenu (nạp lười). */
export function VersionPicker({ versions }: VersionPickerProps) {
  const { t } = useLocale();
  const go = (version: string) => {
    const target = versions.find((v) => v.version === version);
    if (!target) return;
    // Giữ trang và ngôn ngữ đang xem khi đổi phiên bản. ?lang= ghi rõ ngôn ngữ vì bản ≤ 0.13 mặc định tiếng Việt, bản mới
    // mặc định tiếng Anh (#277); mọi bản đều đọc ?lang= và #/….
    const { route, lang } = parseLocation(window.location.pathname);
    const page = target.routing === "path" ? localePathOf(route, lang) : `?lang=${lang}#/${pathOf(route)}`;
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
