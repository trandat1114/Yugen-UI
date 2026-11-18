import { Open16Regular } from "@fluentui/react-icons";
import { Card } from "@/components/ui";
import { DocSection, PageHeader } from "../blocks";
import { useLocale } from "../i18n";
import { SUPPORT } from "../support";

const COPY = {
  en: {
    title: "Support Yugen UI",
    lead: "Yugen UI is free and open source. If it saves you time, you can help keep it maintained.",
    links: "Ways to support",
    external: "(opens the payment site)",
    supporters: "Supporters",
  },
  vi: {
    title: "Ủng hộ Yugen UI",
    lead: "Yugen UI miễn phí và mã nguồn mở. Nếu thư viện giúp bạn tiết kiệm thời gian, bạn có thể góp phần duy trì nó.",
    links: "Cách ủng hộ",
    external: "(mở trang thanh toán)",
    supporters: "Người ủng hộ",
  },
} as const;

/** /support (#183): links to payment sites only, read from src/docs/support.ts. */
export function SupportPage({ support = SUPPORT }: { support?: typeof SUPPORT }) {
  const { locale } = useLocale();
  const lang = locale === "en" ? "en" : "vi";
  const c = COPY[lang];
  return (
    <div className="pb-16">
      <PageHeader title={c.title} lead={support.message?.[lang] ?? c.lead} />
      <DocSection id="links" title={c.links}>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {support.links.map((link) => (
            <li key={link.href}>
              <Card className="h-full p-4">
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-body1-strong text-foreground-1 hover:underline"
                >
                  {link.label}
                  <Open16Regular aria-hidden />
                  <span className="sr-only">{c.external}</span>
                </a>
                {link.note && <p className="mt-1 text-body2 text-foreground-2">{link.note[lang]}</p>}
              </Card>
            </li>
          ))}
        </ul>
      </DocSection>
      {support.supporters.length > 0 && (
        <DocSection id="supporters" title={c.supporters}>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-body2 text-foreground-2">
            {support.supporters.map((s) => (
              <li key={s.name}>
                {s.href ? (
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground-1 hover:underline">
                    {s.name}
                  </a>
                ) : (
                  s.name
                )}
              </li>
            ))}
          </ul>
        </DocSection>
      )}
    </div>
  );
}
