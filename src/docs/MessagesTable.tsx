import namespaces from "virtual:yugen-messages";
import { useLocale } from "./i18n";
import { docsPath } from "./router";
import { SITE } from "./site";

/** Giá trị dài hơn mức này (thường là hàm tóm tắt của biểu đồ) chỉ hiện link tới mã nguồn. */
const MAX_INLINE = 140;

function Value({ value, folder }: { value: string; folder: string }) {
  const { t } = useLocale();
  if (!value) return <>—</>;
  if (value.length <= MAX_INLINE) return <code className="font-mono text-[13px] wrap-break-word">{value}</code>;
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

/**
 * Bảng chuỗi giao diện có sẵn (namespace của `messages` trên YugenProvider): khoá, kiểu, mặc định tiếng Việt, bản tiếng Anh
 * (`messagesEn`). Nạp lười cùng dữ liệu `virtual:yugen-messages` — trang không có mục này không tải dữ liệu.
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
          <div
            role="region"
            aria-label={`messages.${ns.namespace}`}
            tabIndex={0}
            className="overflow-x-auto rounded-xlarge border border-stroke-2 bg-background-1"
          >
            <table className="w-full border-collapse text-start text-body1">
              <thead>
                <tr className="border-b border-stroke-2 bg-background-3 text-caption1 font-semibold text-foreground-2">
                  <th className="px-4 py-2 text-start">{t("messages.key")}</th>
                  <th className="px-4 py-2 text-start">{t("blocks.type")}</th>
                  <th className="px-4 py-2 text-start">{t("messages.vi")}</th>
                  <th className="px-4 py-2 text-start">{t("messages.en")}</th>
                </tr>
              </thead>
              <tbody>
                {ns.keys.map((k) => (
                  <tr key={k.key} className="border-b border-stroke-3 align-top last:border-b-0">
                    <td className="px-4 py-3">
                      <span className="font-mono text-[13px] font-semibold whitespace-nowrap text-brand-foreground-1">{k.key}</span>
                      {k.doc && (
                        <p lang={docLang} className="mt-1 max-w-xs text-caption1 text-foreground-3">
                          {k.doc}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 font-mono text-[13px] text-foreground-2">{k.type}</td>
                    <td lang="vi" className="px-4 py-3 text-foreground-2">
                      <Value value={k.vi} folder={ns.folder} />
                    </td>
                    <td lang="en" className="px-4 py-3 text-foreground-2">
                      <Value value={k.en} folder={ns.folder} />
                    </td>
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
