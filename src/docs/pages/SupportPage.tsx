import { useEffect, useState } from "react";
import { Open16Regular } from "@fluentui/react-icons";
import { Button, Card, Checkbox, Field, Form, FormErrorSummary, Input, MessageBar, Select, Textarea, WavyUnderline } from "@/components/ui";
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
    formTitle: "Tell us how to acknowledge your support",
    formLead: "After you donate, you can send a short note for the maintainer to verify. Your name is only shown after approval and consent.",
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
    formTitle: "Gửi thông tin ghi nhận ủng hộ",
    formLead: "Sau khi chuyển khoản, bạn có thể gửi vài thông tin để maintainer đối soát. Tên chỉ hiện sau khi được duyệt và có sự đồng ý.",
    contributionDate: "Ngày ủng hộ",
    amount: "Số tiền VND (không bắt buộc)",
    recognition: "Bạn muốn được ghi nhận thế nào?",
    anonymous: "Ẩn danh",
    name: "Tên",
    github: "GitHub handle",
    displayName: "Tên hiển thị",
    githubHandle: "GitHub handle",
    transferNote: "Nội dung chuyển khoản (không bắt buộc)",
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
      <DocSection id="acknowledgement" title={c.formTitle} description={c.formLead}>
        {submitted && <MessageBar intent="success" layout="multiline">{c.submitted}</MessageBar>}
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
          className="grid max-w-3xl gap-4 rounded-2xlarge border border-stroke-2 bg-background-2 p-4 md:grid-cols-2 md:p-6"
        >
          <FormErrorSummary className="md:col-span-2" />
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="sr-only" />
          <Field name="contributionDate" label={c.contributionDate} required>
            <Input name="contributionDate" type="date" required />
          </Field>
          <Field name="amountVnd" label={c.amount}>
            <Input name="amountVnd" type="number" min={1} max={1000000000} inputMode="numeric" />
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
          <Field name="transferNote" label={c.transferNote}>
            <Input name="transferNote" maxLength={80} />
          </Field>
          <Field name="message" label={c.message} className="md:col-span-2">
            <Textarea name="message" maxLength={280} rows={3} />
          </Field>
          <Field name="consent" className="md:col-span-2">
            <Checkbox name="consent" value="yes" label={c.consent} required />
          </Field>
          <div className="md:col-span-2">
            <Button type="submit" appearance="primary">{c.submit}</Button>
          </div>
        </Form>
      </DocSection>
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
      {supporters.length > 0 && (
        <DocSection id="supporters" title={c.supporters}>
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
        </DocSection>
      )}
    </div>
  );
}
