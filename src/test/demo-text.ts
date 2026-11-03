/** Chữ cái chỉ tiếng Việt dùng (giống scripts/check-demo-language.mjs) và các nguyên âm có dấu. */
const VIETNAMESE = /[ăâđêôơưĩũĂÂĐÊÔƠƯĨŨàáảãạèéẻẽẹìíỉịòóỏõọùúủụỳýỷỹỵÀÁẢÃẠÈÉẺẼẸÌÍỈỊÒÓỎÕỌÙÚỦỤỲÝỶỸỴẠ-ỹ]/u;

/** Attribute / thuộc tính không chứa chữ hiển thị (class, giá trị kỹ thuật, khoá dữ liệu…). */
const NON_UI_CONTEXTS = new Set([
  "className",
  "class",
  "style",
  "href",
  "src",
  "srcSet",
  "type",
  "id",
  "htmlFor",
  "key",
  "role",
  "dir",
  "lang",
  "d",
  "viewBox",
  "fill",
  "stroke",
  "xmlns",
  "rel",
  "target",
  "autoComplete",
  "inputMode",
  "pattern",
  "accept",
  "appearance",
  "variant",
  "color",
  "size",
  "shape",
  "side",
  "align",
  "orientation",
  "layout",
  "position",
  "mode",
  "language",
  "icon",
  "index",
  "dataKey",
  "valueKey",
  "labelKey",
  "currency",
  "timeZone",
  "locale",
  "kind",
  "tone",
  "intent",
  "presence",
  "status",
  "state",
  "trend",
  "method",
  "accent",
  "brand",
  "theme",
  "anchor",
  "placement",
  "sort",
  "field",
  "accessorKey",
  "highlightLines",
  "filename",
]);

/** Một token của danh sách class Tailwind / định danh kỹ thuật. */
const TECH_TOKEN = /^[!@a-z0-9[\]().:/%_#=,'*&>+~-]*[-:/[\]_.#=]+[!a-z0-9[\]().:/%_#=,'*&>+~-]*$/;

/** Chuỗi trông như chữ cho người đọc (không phải class, định danh, đường dẫn, mã, số). */
export function looksLikeText(text: string): boolean {
  const s = text.trim();
  if (!/[A-Za-z]{2}/.test(s)) return false;
  if (/^(https?:|mailto:|tel:|\/|\.\/|#[\w-]+$|var\(|@\/)/.test(s)) return false;
  // Một dòng mã (code mẫu dạng mảng dòng, hàng bảng markdown, CSS…).
  if (/[{}<>]|=>|="|\w\(|;$|^\s{2,}|^[-+@|[=]|^(import|export|const|function|return)\b/.test(text)) return false;
  if (/^[\w.+-]+@[\w-]+(\.[\w-]+)+$/.test(s)) return false; // email
  if (/^[\w.-]+\.(tsx?|jsx?|css|json|md|png|jpe?g|svg|pdf|docx?|xlsx?|zip|txt|csv|fig|mp4|mp3)$/i.test(s)) return false; // tên tệp
  if (!/\s/.test(s)) {
    if (/^[a-z][a-zA-Z0-9]*$/.test(s)) return false; // định danh / giá trị thường
    if (/^[A-Z0-9_]+$/.test(s)) return false; // HẰNG / mã / đơn vị viết hoa
    if (TECH_TOKEN.test(s)) return false;
    return /^[A-Z][a-z]/.test(s) || /[…?!]$/.test(s);
  }
  const tokens = s.split(/\s+/);
  // Danh sách class: mọi token là token kỹ thuật hoặc chữ thường ngắn, và có ít nhất một token chứa - : / [ ].
  if (tokens.every((t) => /^[!@a-z0-9[\]().:/%_#=,'*&>+~-]+$/.test(t)) && tokens.some((t) => /[-:/[\]]/.test(t))) return false;
  return true;
}

/**
 * Chuỗi demo cần bản tiếng Việt: chữ JSX; chuỗi / template trông như chữ, trừ attribute kỹ thuật; chú thích tiếng Anh (code
 * mẫu hiện cả chú thích). Chuỗi đã là tiếng Việt thì thôi.
 */
export function isUiText(t: { kind: string; text: string; context: string; inCode: boolean }): boolean {
  if (VIETNAMESE.test(t.text)) return false;
  if (t.kind === "comment") return !/^(#region|#endregion|eslint|@ts-|prettier|biome|[-=*]{3})/.test(t.text) && /[A-Za-z]{2,}(\s+\S+){2,}/.test(t.text);
  if (t.kind === "jsx") return looksLikeText(t.text);
  if (NON_UI_CONTEXTS.has(t.context) || /^(on[A-Z]|aria-(hidden|controls|labelledby|describedby|live|current))/.test(t.context) || t.context.startsWith("data-"))
    return false;
  return looksLikeText(t.kind === "template" ? t.text.replace(/\$\{[^}]*\}/g, "") : t.text);
}
