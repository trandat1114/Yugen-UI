/**
 * Lấy nguyên văn các khai báo cấp cao nhất (`const` / `function` / `type`) theo tên từ mã nguồn thô của một file docs
 * (`import RAW from "./file.tsx?raw"`). Dùng làm `Example.setup` — dữ liệu / hàm mẫu mà nhiều ví dụ dùng chung —
 * để "Mở trong StackBlitz" và `npm run check:examples` có đủ code chạy độc lập.
 */
export function declarationsOf(raw: string, names: string[]): string {
  const src = raw.replace(/\r\n/g, "\n");
  return names
    .map((name) => {
      const head = new RegExp(`^(?:export\\s+)?(?:const|let|function|type|interface)\\s+${name}\\b`, "m").exec(src);
      if (!head) return `// Không tìm thấy khai báo "${name}"`;
      return src.slice(head.index, endOf(src, head.index)).trim();
    })
    .join("\n\n");
}

/** Vị trí kết thúc khai báo: hết ngoặc ở độ sâu 0 rồi gặp `;` hoặc xuống dòng sau `}` (bỏ qua chuỗi và chú thích). */
function endOf(src: string, from: number): number {
  let depth = 0;
  let seenBlock = false;
  for (let i = from; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === "`") {
      i = skipString(src, i, c);
      continue;
    }
    if (c === "/" && src[i + 1] === "/") {
      i = src.indexOf("\n", i);
      if (i < 0) return src.length;
      continue;
    }
    if (c === "/" && src[i + 1] === "*") {
      i = src.indexOf("*/", i + 2) + 1;
      continue;
    }
    if (c === "{" || c === "[" || c === "(") {
      depth++;
      if (c === "{") seenBlock = true;
    } else if (c === "}" || c === "]" || c === ")") {
      depth--;
      if (depth === 0 && c === "}" && seenBlock && /^\s*\n/.test(src.slice(i + 1, i + 3)) && !/^\s*[;,.)]/.test(src.slice(i + 1))) {
        return i + 1;
      }
    } else if (c === ";" && depth === 0) return i + 1;
  }
  return src.length;
}

function skipString(src: string, start: number, quote: string): number {
  for (let i = start + 1; i < src.length; i++) {
    if (src[i] === "\\") i++;
    else if (quote === "`" && src[i] === "$" && src[i + 1] === "{") {
      let depth = 1;
      i += 2;
      for (; i < src.length && depth > 0; i++) {
        if (src[i] === "{") depth++;
        else if (src[i] === "}") depth--;
      }
      i--;
    } else if (src[i] === quote) return i;
  }
  return src.length;
}
