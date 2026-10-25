export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number;
}

/** Quotes a cell when needed; cells that a spreadsheet would run as a formula get a leading apostrophe. */
function cell(value: string | number) {
  let text = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** RFC 4180 CSV with CRLF line ends. */
export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]) {
  return [columns.map((c) => cell(c.header)), ...rows.map((row) => columns.map((c) => cell(c.value(row))))]
    .map((line) => line.join(","))
    .join("\r\n");
}

/** Saves the text as a file. The byte order mark makes Excel read UTF-8 (accented names) correctly. */
export function downloadCsv(filename: string, csv: string) {
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
  const a = Object.assign(document.createElement("a"), { href: url, download: filename });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 0);
}
