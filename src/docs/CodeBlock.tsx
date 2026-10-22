import * as React from "react";
import { Copy16Regular, Checkmark16Regular } from "@fluentui/react-icons";
import { cn } from "@/lib/cn";
import { useLocale } from "./i18n";

const TOKEN_RE =
  /((?<=^|\s)\/\/.*$|\{\/\*[\s\S]*?\*\/\})|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*|\/?>)|\b(import|from|export|const|let|function|return|default|true|false|null|undefined)\b|([A-Za-z_][\w-]*)(?==)/gm;

const TOKEN_CLASS = {
  comment: "text-foreground-4 italic",
  string: "text-warning-foreground-1",
  tag: "text-brand-foreground-1",
  keyword: "text-lavender-fg",
  attr: "text-teal-fg",
};

function highlight(code: string) {
  const out: React.ReactNode[] = [];
  let last = 0;
  let key = 0;
  TOKEN_RE.lastIndex = 0;
  for (let m = TOKEN_RE.exec(code); m; m = TOKEN_RE.exec(code)) {
    if (m.index > last) out.push(code.slice(last, m.index));
    const cls = m[1]
      ? TOKEN_CLASS.comment
      : m[2]
        ? TOKEN_CLASS.string
        : m[3]
          ? TOKEN_CLASS.tag
          : m[4]
            ? TOKEN_CLASS.keyword
            : TOKEN_CLASS.attr;
    out.push(
      <span key={key++} className={cls}>
        {m[0]}
      </span>,
    );
    last = m.index + m[0].length;
  }
  out.push(code.slice(last));
  return out;
}

export function useCopy(text: string) {
  const [copied, setCopied] = React.useState(false);
  const copy = React.useCallback(async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }, [text]);
  return { copied, copy };
}

/** `collapse`: dưới sm chỉ còn icon (chữ chuyển thành sr-only). */
export function CopyButton({ text, className, collapse }: { text: string; className?: string; collapse?: boolean }) {
  const { copied, copy } = useCopy(text);
  const { t } = useLocale();
  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex h-7 shrink-0 items-center gap-XS whitespace-nowrap rounded-medium px-S text-caption1 font-semibold text-foreground-2",
        "transition-colors duration-faster hover:bg-subtle-hover hover:text-foreground-1",
        className,
      )}
    >
      {copied ? <Checkmark16Regular className="text-success-foreground-1" /> : <Copy16Regular />}
      <span className={cn(collapse && "max-sm:sr-only")}>{copied ? t("copy.copied") : t("copy.copy")}</span>
    </button>
  );
}

export function CodeBlock({ code, className, bare }: { code: string; className?: string; bare?: boolean }) {
  return (
    <div
      data-theme="dark"
      className={cn(
        "group/code relative bg-background-3",
        !bare && "overflow-hidden rounded-xlarge border border-stroke-3",
        className,
      )}
    >
      <CopyButton text={code} className="absolute top-S inset-e-S opacity-0 group-hover/code:opacity-100 focus-visible:opacity-100" />
      {/* tabIndex: khối code cuộn ngang được bằng bàn phím (axe scrollable-region-focusable); outline thụt vào vì khung overflow-hidden. */}
      <pre dir="ltr" tabIndex={0} className="overflow-x-auto p-L pe-24 text-left font-mono text-[13px] leading-[1.6] text-foreground-1 -outline-offset-2">
        <code>{highlight(code)}</code>
      </pre>
    </div>
  );
}
