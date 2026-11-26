import { useEffect, useState, type ReactNode } from "react";
import { Heart24Filled, Open16Regular, QrCode24Regular } from "@fluentui/react-icons";
import { Button, Checkbox, Field, Form, FormErrorSummary, Input, MessageBar, Select, Textarea } from "@/components/ui";
import { cn } from "@/lib/cn";
import { useLocale } from "../i18n";
import { SakuraBlossom } from "../YugenMark";
import { SUPPORT } from "../support";

const COPY = {
  en: {
    title: "Support Yugen UI with a coffee",
    lead: "Yugen UI is free and open source. If it saves you time, you can help keep it maintained.",
    vietqrTag: "VND · Vietnamese banking apps",
    steps: [
      "Open your banking app.",
      "Scan the code and choose the amount.",
      "Check that the recipient name matches the one under the code, then confirm.",
    ],
    qrCaption: "The amount is entirely up to you.",
    sponsorsTag: "USD · international",
    sponsorsSteps: ["Open the GitHub Sponsors page.", "Choose a sponsorship tier.", "Choose whether your sponsorship is public or private."],
    sponsorsCta: "Sponsor on GitHub",
    links: "Ways to support",
    external: "(opens the payment site)",
    supporters: "Supporters",
    formTitle: "Tell us about a VietQR contribution",
    formLead:
      "This step is optional. After a VietQR transfer, you can send a few details so the maintainer can verify it. Your name is shown only after verification and with your consent. GitHub Sponsors contributions are recorded automatically.",
    contributionDate: "Contribution date",
    amount: "Amount in VND (optional)",
    recognition: "How should we list you?",
    anonymous: "Anonymous",
    name: "Name",
    github: "GitHub handle",
    displayName: "Name to show",
    githubHandle: "GitHub handle",
    transferNote: "Transfer note (optional)",
    message: "Message (optional)",
    consent: "I agree that the maintainer may use this choice for the monthly acknowledgement after verification.",
    submit: "Send acknowledgement",
    submitted: "Thanks. Your acknowledgement is waiting for verification.",
    unavailable: "The acknowledgement form is not configured yet.",
    failed: "The form could not be sent. Please try again later.",
    requiredName: "Enter the name or handle to display.",
    requiredConsent: "Choose whether your acknowledgement can be published.",
  },
  vi: {
    title: "Ủng hộ Yugen UI một ly cà phê",
    lead: "Yugen UI miễn phí và mã nguồn mở. Nếu thư viện giúp bạn tiết kiệm thời gian, bạn có thể góp phần duy trì nó.",
    vietqrTag: "VND · ứng dụng ngân hàng Việt Nam",
    steps: [
      "Mở ứng dụng ngân hàng.",
      "Quét mã và chọn số tiền.",
      "Kiểm tra tên người nhận khớp với tên dưới mã, rồi xác nhận.",
    ],
    qrCaption: "Số tiền hoàn toàn tùy bạn.",
    sponsorsTag: "USD · quốc tế",
    sponsorsSteps: ["Mở trang GitHub Sponsors.", "Chọn mức tài trợ.", "Chọn công khai hoặc riêng tư cho khoản tài trợ."],
    sponsorsCta: "Tài trợ trên GitHub",
    links: "Cách ủng hộ",
    external: "(mở trang thanh toán)",
    supporters: "Người ủng hộ",
    formTitle: "Gửi thông tin ghi nhận VietQR",
    formLead:
      "Bước này không bắt buộc. Sau khi chuyển khoản VietQR, bạn có thể gửi vài thông tin để maintainer đối soát. Tên của bạn chỉ hiện sau khi đối soát và khi bạn đồng ý. Đóng góp qua GitHub Sponsors được ghi nhận tự động.",
    contributionDate: "Ngày ủng hộ",
    amount: "Số tiền VND (không bắt buộc)",
    recognition: "Ghi nhận bạn dưới dạng",
    anonymous: "Ẩn danh",
    name: "Tên",
    github: "GitHub handle",
    displayName: "Tên hiển thị",
    githubHandle: "GitHub handle",
    transferNote: "Nội dung CK (không bắt buộc)",
    message: "Lời nhắn (không bắt buộc)",
    consent: "Tôi đồng ý để maintainer dùng lựa chọn này trong phần cảm ơn hằng tháng sau khi đối soát.",
    submit: "Gửi thông tin ghi nhận",
    submitted: "Cảm ơn bạn. Thông tin đang chờ đối soát.",
    unavailable: "Form ghi nhận chưa được cấu hình.",
    failed: "Không gửi được form. Vui lòng thử lại sau.",
    requiredName: "Hãy nhập tên hoặc handle muốn hiển thị.",
    requiredConsent: "Hãy chọn cách bạn cho phép ghi nhận.",
  },
} as const;

/** Cùng nền, viền, bo góc và padding cho mọi card của trang. */
const CARD = "rounded-2xlarge border border-stroke-2 bg-background-2 p-4 sm:p-5";

/** Logo GitHub (Octicons mark-github), chỉ để chỉ nơi link dẫn tới. */
function GitHubMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden className={className}>
      <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
    </svg>
  );
}

/** Bông anh đào trang trí (hình chung với logo và hero). */
function Blossom({ className }: { className: string }) {
  return (
    <svg viewBox="-11 -11 22 22" aria-hidden className={cn("pointer-events-none absolute", className)}>
      <SakuraBlossom />
    </svg>
  );
}

/**
 * Một kênh ủng hộ. VietQR và GitHub Sponsors cùng khung (biểu tượng, tên, nhãn, 3 bước, khối chính) để ngang hàng nhau;
 * khối chính giãn theo card cao hơn khi hai card đứng cạnh nhau.
 */
function Channel({ id, icon, title, tag, steps, children }: { id: string; icon: ReactNode; title: string; tag: string; steps: readonly string[]; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn(CARD, "flex scroll-mt-24 flex-col")}>
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xlarge bg-brand-background-2 text-brand-foreground-2 [&_svg]:size-6">
          {icon}
        </span>
        <div className="min-w-0">
          <h2 id={`${id}-title`} className="text-subtitle1 font-semibold text-foreground-1">
            {title}
          </h2>
          <p className="text-caption1 text-foreground-3">{tag}</p>
        </div>
      </div>
      <ol className="mt-4 grid gap-2.5">
        {steps.map((step, index) => (
          <li key={step} className="flex items-start gap-3 text-body1 text-foreground-1">
            <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-circular bg-brand-background-2 text-caption1 font-semibold text-brand-foreground-2">
              {index + 1}
            </span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
      <div className="mt-4 flex flex-1 flex-col">{children}</div>
    </section>
  );
}

/** Như DocSection nhưng tiêu đề nhỏ hơn, hợp với H1 của trang này. */
function Section({ id, title, description, children }: { id: string; title: string; description?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-stroke-2 pt-6 pb-8">
      <h2 id={`${id}-title`} className="font-display text-title3 font-semibold text-foreground-1">
        {title}
      </h2>
      {description && <p className="mt-1 max-w-3xl text-body1 text-foreground-2">{description}</p>}
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** /support (#183): payment links and VietQR configuration come from src/docs/support.ts. */
export function SupportPage({ support = SUPPORT, supportApiUrl = import.meta.env.VITE_SUPPORT_API_URL as string | undefined }: { support?: typeof SUPPORT; supportApiUrl?: string }) {
  const { locale } = useLocale();
  const lang = locale === "en" ? "en" : "vi";
  const c = COPY[lang];
  const [submitted, setSubmitted] = useState(false);
  const [remoteSupporters, setRemoteSupporters] = useState<typeof support.supporters>([]);

  useEffect(() => {
    if (!supportApiUrl) return;
    let cancelled = false;
    void fetch(supportApiUrl, { headers: { Accept: "application/json" } })
      .then((response) => (response.ok ? response.json() : null))
      .then((body: unknown) => {
        const data = (body as { data?: unknown } | null)?.data;
        if (!cancelled && Array.isArray(data)) setRemoteSupporters(data.filter((item): item is (typeof support.supporters)[number] => Boolean(item && typeof item === "object" && typeof (item as { name?: unknown }).name === "string")));
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [supportApiUrl, support.supporters]);

  const supporters = [...support.supporters, ...remoteSupporters];
  const sponsors = support.links.find((link) => /^https:\/\/github\.com\/sponsors\/[^/]+\/?$/.test(link.href));
  const otherLinks = support.links.filter((link) => link !== sponsors);
  const twoChannels = Boolean(support.qr && sponsors);
  const submitAcknowledgement = async (formData: FormData) => {
    if (!supportApiUrl) return { errors: { form: c.unavailable } };
    const recognition = String(formData.get("recognition") ?? "anonymous");
    const payload = {
      contributionDate: String(formData.get("contributionDate") ?? ""),
      amountVnd: formData.get("amountVnd") ? Number(formData.get("amountVnd")) : undefined,
      displayName: String(formData.get("displayName") ?? "").trim() || undefined,
      githubHandle: String(formData.get("githubHandle") ?? "").trim() || undefined,
      recognition,
      transferNote: String(formData.get("transferNote") ?? "").trim() || undefined,
      message: String(formData.get("message") ?? "").trim() || undefined,
      locale: lang,
      consent: formData.get("consent") === "yes",
      website: String(formData.get("website") ?? ""),
    };
    const response = await fetch(supportApiUrl, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    if (!response.ok) return { errors: { form: c.failed } };
    setSubmitted(true);
    return null;
  };
  const form = (
    <Form
      action={submitAcknowledgement}
      validate={(formData) => {
        const recognition = String(formData.get("recognition") ?? "anonymous");
        if (recognition === "name" && !String(formData.get("displayName") ?? "").trim()) return { displayName: c.requiredName };
        if (recognition === "github" && !String(formData.get("githubHandle") ?? "").trim()) return { githubHandle: c.requiredName };
        return undefined;
      }}
      onChange={() => {
        if (submitted) setSubmitted(false);
      }}
      className="relative mt-4 grid items-start gap-4 @md/form:grid-cols-2"
    >
      <FormErrorSummary className="@md/form:col-span-2" />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
      {/* Chuyển khoản (ngày, số tiền, nội dung CK) rồi cách ghi nhận (lựa chọn, tên, GitHub). */}
      <Field name="contributionDate" label={c.contributionDate} required>
        <Input name="contributionDate" type="date" required />
      </Field>
      <Field name="amountVnd" label={c.amount}>
        <Input name="amountVnd" type="number" min={1} max={1000000000} inputMode="numeric" />
      </Field>
      <Field name="transferNote" label={c.transferNote}>
        <Input name="transferNote" maxLength={80} />
      </Field>
      <Field name="recognition" label={c.recognition} required>
        <Select name="recognition" defaultValue="anonymous" required>
          <option value="anonymous">{c.anonymous}</option>
          <option value="name">{c.name}</option>
          <option value="github">{c.github}</option>
        </Select>
      </Field>
      <Field name="displayName" label={c.displayName}>
        <Input name="displayName" maxLength={80} />
      </Field>
      <Field name="githubHandle" label={c.githubHandle}>
        <Input name="githubHandle" maxLength={40} placeholder="octocat" />
      </Field>
      <Field name="message" label={c.message} className="@md/form:col-span-2">
        <Textarea name="message" maxLength={280} rows={3} />
      </Field>
      {/* Nhãn riêng để ô đánh dấu nằm ở dòng đầu khi nhãn xuống nhiều dòng. */}
      <Field name="consent" required className="@md/form:col-span-2">
        {(props) => (
          <span className="flex items-start gap-2">
            <Checkbox {...props} value="yes" />
            <label htmlFor={props.id} className="cursor-pointer pt-1 text-body1 text-foreground-1">
              {c.consent}
            </label>
          </span>
        )}
      </Field>
      <div className="@md/form:col-span-2">
        <Button type="submit" appearance="primary">
          {c.submit}
        </Button>
      </div>
    </Form>
  );

  return (
    <div className="pb-16">
      <header className="flex items-center gap-6 pt-8 pb-6">
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-title2 font-semibold tracking-[-0.01em] text-pretty text-foreground-1 sm:text-title1">{c.title}</h1>
          <p className="mt-2 max-w-3xl text-body2 text-foreground-2">{support.message?.[lang] ?? c.lead}</p>
          {support.notice?.[lang] && (
            <MessageBar intent="info" layout="multiline" className="mt-4 w-fit max-w-3xl">
              {support.notice[lang]}
            </MessageBar>
          )}
        </div>
        {/* Điểm nhấn nhỏ; ẩn trên di động (ảnh lazy không tải khi bị ẩn). */}
        <img
          src={`${import.meta.env.BASE_URL}support/coffee-sakura.png`}
          alt=""
          width={1448}
          height={1086}
          loading="lazy"
          decoding="async"
          className="hidden h-auto w-28 shrink-0 sm:block md:w-40"
        />
      </header>
      {/*
        Thứ tự đọc, cũng là thứ tự trên màn hẹp: hai kênh ủng hộ (VietQR, GitHub Sponsors) → form ghi nhận VietQR (không bắt
        buộc). Khi đủ rộng, hai kênh đứng cạnh nhau, cao bằng nhau; form trải hết chiều ngang bên dưới.
      */}
      <div className="@container pb-8">
        <div className={cn("grid gap-4", twoChannels && "@3xl:grid-cols-2 @3xl:gap-5")}>
          {support.qr && (
            <Channel id="vietqr" icon={<QrCode24Regular />} title="VietQR" tag={c.vietqrTag} steps={c.steps}>
              <figure className="m-0 flex flex-1 flex-col justify-center rounded-xlarge bg-background-1 sm:p-2">
                {/* Nền trắng và khoảng trắng quanh mã ở mọi theme để app ngân hàng quét được. */}
                <div className="mx-auto w-full max-w-94 rounded-xlarge bg-white p-2">
                  <img
                    src={`${import.meta.env.BASE_URL}${support.qr.src.replace(/^\/+/, "")}`}
                    alt={support.qr.alt[lang]}
                    width={360}
                    height={458}
                    decoding="async"
                    className="block h-auto w-full"
                  />
                </div>
                <figcaption className="mt-3 text-center text-caption1 text-foreground-2">{c.qrCaption}</figcaption>
              </figure>
            </Channel>
          )}
          {sponsors && (
            <Channel id="github-sponsors" icon={<Heart24Filled />} title={sponsors.label} tag={c.sponsorsTag} steps={c.sponsorsSteps}>
              <div className="relative flex flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-xlarge bg-brand-background-2 px-4 py-10 text-center">
                <Blossom className="-top-3 -left-3 size-16 -rotate-12 opacity-70" />
                <Blossom className="bottom-6 left-6 size-6 rotate-45 opacity-50" />
                <Blossom className="-right-5 -bottom-5 size-20 rotate-12 opacity-60 sm:-right-6 sm:-bottom-6 sm:size-32" />
                <span className="relative inline-flex size-28 items-center justify-center rounded-circular bg-background-1 text-foreground-1 shadow-8">
                  <GitHubMark className="size-14" />
                  <span className="absolute -right-1 -bottom-1 inline-flex size-10 items-center justify-center rounded-circular bg-background-1 text-brand-foreground-1 shadow-4">
                    <Heart24Filled className="size-6" />
                  </span>
                </span>
                <p className="relative text-body1-strong break-all text-foreground-1">{sponsors.href.replace(/^https:\/\//, "").replace(/\/$/, "")}</p>
                <Button asChild appearance="primary" className="relative">
                  <a href={sponsors.href} target="_blank" rel="noopener noreferrer">
                    {c.sponsorsCta}
                    <Open16Regular aria-hidden />
                    <span className="sr-only">{c.external}</span>
                  </a>
                </Button>
                {sponsors.note && <p className="relative max-w-xs text-caption1 text-foreground-2">{sponsors.note[lang]}</p>}
              </div>
            </Channel>
          )}
          <section
            id="acknowledgement"
            aria-labelledby="acknowledgement-title"
            className={cn(CARD, "@container/form scroll-mt-24", twoChannels && "@3xl:col-span-2")}
          >
            <h2 id="acknowledgement-title" className="text-subtitle1 font-semibold text-foreground-1">
              {c.formTitle}
            </h2>
            <p className="mt-1 max-w-3xl text-body1 text-foreground-2">{c.formLead}</p>
            {submitted && (
              <MessageBar intent="success" layout="multiline" className="mt-4">
                {c.submitted}
              </MessageBar>
            )}
            {form}
          </section>
        </div>
      </div>
      {otherLinks.length > 0 && (
        <Section id="links" title={c.links}>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherLinks.map((link) => (
              <li key={link.href} className={cn(CARD, "h-full")}>
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
              </li>
            ))}
          </ul>
        </Section>
      )}
      {supporters.length > 0 && (
        <Section id="supporters" title={c.supporters}>
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-body2 text-foreground-2">
            {supporters.map((s, index) => (
              <li key={`${s.name}-${index}`}>
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
        </Section>
      )}
    </div>
  );
}
