import { Open16Regular } from "@fluentui/react-icons";
import { Card, MessageBar, WavyUnderline } from "@/components/ui";
import { DocSection, PageHeader } from "../blocks";
import { useLocale } from "../i18n";
import { SUPPORT } from "../support";

const COPY = {
  en: {
    title: "Support Yugen UI with a coffee",
    lead: "Yugen UI is free and open source. If it saves you time, you can help keep it maintained.",
    kicker: "With sincere thanks",
    steps: [
      "Open your banking app.",
      "Scan the code and choose the amount.",
      "Check the recipient name before confirming.",
    ],
    qrCaption: "The amount is entirely up to you.",
    verify: "Remember to check the recipient name shown in your banking app.",
    links: "Ways to support",
    external: "(opens the payment site)",
    supporters: "Supporters",
  },
  vi: {
    title: "Ủng hộ Yugen UI một ly cà phê",
    lead: "Yugen UI miễn phí và mã nguồn mở. Nếu thư viện giúp bạn tiết kiệm thời gian, bạn có thể góp phần duy trì nó.",
    kicker: "Chân thành biết ơn bạn",
    steps: [
      "Mở ứng dụng ngân hàng.",
      "Quét mã và chọn số tiền.",
      "Kiểm tra tên người nhận trước khi xác nhận.",
    ],
    qrCaption: "Số tiền hoàn toàn tùy bạn.",
    verify: "Nhớ kiểm tra tên người nhận hiển thị trong ứng dụng ngân hàng.",
    links: "Cách ủng hộ",
    external: "(mở trang thanh toán)",
    supporters: "Người ủng hộ",
  },
} as const;

/** /support (#183): payment links and VietQR configuration come from src/docs/support.ts. */
export function SupportPage({ support = SUPPORT }: { support?: typeof SUPPORT }) {
  const { locale } = useLocale();
  const lang = locale === "en" ? "en" : "vi";
  const c = COPY[lang];
  return (
    <div className="pb-16">
      <PageHeader title={c.title} lead={support.message?.[lang] ?? c.lead}>
        {support.notice?.[lang] && (
          <MessageBar intent="warning" layout="multiline">
            {support.notice[lang]}
          </MessageBar>
        )}
      </PageHeader>
      {support.qr && (
        <DocSection id="vietqr">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem]">
              <div className="flex min-h-128 flex-col justify-between overflow-hidden rounded-2xlarge border border-stroke-2 bg-linear-to-br from-brand-background-2/40 via-background-2 to-background-2 p-4 md:p-6">
                <div className="max-w-xl">
                  <p className="relative z-10 inline-flex rounded-full bg-background-2 px-2 py-0.5 text-caption1 font-semibold text-brand-foreground-2 shadow-4">{c.kicker}</p>
                  <WavyUnderline gradient="sakura" animated={false} thickness={1.5} className="mt-2 h-3 w-36 opacity-70" />
                  <ol className="mt-6 grid gap-3 text-body1 text-foreground-2">
                    {c.steps.map((step, index) => (
                      <li key={step} className="flex items-start gap-3">
                        <span className="inline-flex size-7 shrink-0 items-center justify-center rounded-circular bg-brand-background-2 text-caption1 font-semibold text-brand-foreground-2">
                          {index + 1}
                        </span>
                        <span className="pt-0.5">{step}</span>
                      </li>
                    ))}
                  </ol>
                  <p className="mt-6 max-w-prose text-body2 text-foreground-3">{c.verify}</p>
                </div>
                <div aria-hidden className="mt-8 flex h-56 items-end justify-center overflow-hidden">
                  <img
                    src={`${import.meta.env.BASE_URL}support/coffee-sakura.png`}
                    alt=""
                    width={768}
                    height={576}
                    decoding="async"
                    className="h-full w-auto max-w-none opacity-95"
                  />
                </div>
              </div>
              <Card className="relative mx-auto w-full max-w-[24rem] overflow-hidden rounded-2xlarge border border-brand-stroke bg-white p-3 shadow-16">
                <div className="rounded-xlarge bg-white p-2">
                  <img
                    src={`${import.meta.env.BASE_URL}${support.qr.src.replace(/^\/+/, "")}`}
                    alt={support.qr.alt[lang]}
                    width={360}
                    height={444}
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
                <p className="px-2 pb-1 pt-3 text-center text-caption1 text-foreground-3">{c.qrCaption}</p>
              </Card>
            </div>
        </DocSection>
      )}
      {support.links.length > 0 && (
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
      )}
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
