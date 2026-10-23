import { MessageBar } from "@/components/ui";
import { cn } from "@/lib/cn";
import { SITE } from "../site";
import { useLocale } from ".";

/** Mục hướng dẫn dịch trong CONTRIBUTING.md (phần English, heading "Translating the docs"). */
export const TRANSLATION_GUIDE_URL = `${SITE.links.repository}/blob/main/CONTRIBUTING.md#translating-the-docs`;

/**
 * Chế độ tiếng Anh, trang (hoặc một phần trang) chưa dịch: báo đang hiện bản gốc tiếng Việt + link hướng dẫn dịch.
 * Ở tiếng Việt không render gì.
 */
export function FallbackNotice({ partial, className }: { partial?: boolean; className?: string }) {
  const { locale, t } = useLocale();
  if (locale !== "en") return null;
  return (
    <MessageBar intent="info" className={cn("mt-5", className)}>
      {t(partial ? "fallback.partial" : "fallback.page")}{" "}
      {SITE.links.repository && (
        <a href={TRANSLATION_GUIDE_URL} target="_blank" rel="noreferrer" className="text-link underline hover:text-link-hover">
          {t("fallback.help")}
        </a>
      )}
    </MessageBar>
  );
}
