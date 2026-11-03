import namespaces from "virtual:yugen-messages";
import { withCode } from "./blocks";
import { useLocale } from "./i18n";
import { docsPath } from "./router";
import { SITE } from "./site";

/** Giá trị dài hơn mức này (thường là hàm tóm tắt của biểu đồ) chỉ hiện link tới mã nguồn. */
const MAX_INLINE = 140;

function Value({ value, folder }: { value: string; folder: string }) {
  const { t } = useLocale();
  if (!value) return <>—</>;
  if (value.length <= MAX_INLINE) return <code className="font-mono text-[13px] wrap-anywhere">{value}</code>;
  return (
    <a
      className="text-link underline hover:text-link-hover"
      href={`${SITE.links.repository}/blob/main/src/components/ui/${folder}/messages.ts`}
      target="_blank"
      rel="noreferrer"
    >
      {t("messages.seeSource")}
    </a>
  );
}

/** Ô giá trị: khung hẹp ẩn hàng tiêu đề nên mỗi ô có nhãn riêng; `lang` nằm trên giá trị, nhãn theo ngôn ngữ trang. */
function ValueCell({ label, lang, value, folder }: { label: string; lang: string; value: string; folder: string }) {
  return (
    <td className="px-4 py-3 text-foreground-2 @max-2xl:mt-2 @max-2xl:block @max-2xl:p-0">
      <span className="block text-caption1 font-semibold text-foreground-3 @2xl:hidden">{label}</span>
      <span lang={lang}>
        <Value value={value} folder={folder} />
      </span>
    </td>
  );
}

/**
 * Bảng chuỗi giao diện có sẵn (namespace của `messages` trên YugenProvider): khoá, kiểu, mặc định tiếng Việt, bản tiếng Anh
 * (`messagesEn`). Nạp lười cùng dữ liệu `virtual:yugen-messages` — trang không có mục này không tải dữ liệu.
 * Bố cục như bảng props (#266): độ rộng cột cố định; khung hẹp hơn 42rem thì mỗi khoá một khối, không phải cuộn ngang.
 */
export default function MessagesTable({ names }: { names: string[] }) {
  const { t, locale } = useLocale();
  const docLang = locale === "en" ? "vi" : undefined;
  const shown = namespaces.filter((n) => names.includes(n.namespace));
  return (
    <div className="flex flex-col gap-4">
      <p className="max-w-3xl text-body2 text-foreground-2">
        {t("messages.intro")}{" "}
        <a className="text-link underline hover:text-link-hover" href={docsPath("/concepts/localization")}>
          {t("messages.link")}
        </a>
      </p>
      {shown.map((ns) => (
        <div key={ns.namespace} className="flex flex-col gap-2">
          <h3 className="font-mono text-body1 font-semibold text-foreground-1">messages.{ns.namespace}</h3>
          <div className="@container overflow-hidden rounded-xlarge border border-stroke-2 bg-background-1">
            <table aria-label={`messages.${ns.namespace}`} className="w-full table-fixed border-collapse text-start text-body1 @max-2xl:block">
              <thead className="@max-2xl:sr-only">
                <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
                  <th className="w-[32%] px-4 py-2 text-start">
                    {t("messages.key")} · {t("blocks.type")}
                  </th>
                  <th className="px-4 py-2 text-start">{t("messages.vi")}</th>
                  <th className="px-4 py-2 text-start">{t("messages.en")}</th>
                </tr>
              </thead>
              <tbody className="@max-2xl:block">
                {ns.keys.map((k) => (
                  <tr key={k.key} className="border-b border-stroke-3 align-top last:border-b-0 @max-2xl:block @max-2xl:px-4 @max-2xl:py-3">
                    <td className="px-4 py-3 @max-2xl:block @max-2xl:p-0">
                      <span dir="ltr" className="block font-mono text-[13px] font-semibold wrap-anywhere text-brand-foreground-1">
                        {k.key}
                      </span>
                      <span dir="ltr" className="mt-1 block font-mono text-[13px] wrap-anywhere text-foreground-2">
                        {k.type}
                      </span>
                      {k.doc && (
                        <p lang={docLang} className="mt-1 text-caption1 text-foreground-3">
                          {withCode(k.doc)}
                        </p>
                      )}
                    </td>
                    <ValueCell label={t("messages.vi")} lang="vi" value={k.vi} folder={ns.folder} />
                    <ValueCell label={t("messages.en")} lang="en" value={k.en} folder={ns.folder} />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
