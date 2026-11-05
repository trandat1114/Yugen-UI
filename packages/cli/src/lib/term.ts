/**
 * Giao diện dòng lệnh chỉ dùng Node: màu qua `node:util` styleText, prompt qua `node:readline`.
 * Thay @clack/prompts + picocolors (#381) để CLI không có dependency nào lúc chạy.
 *
 * - Màu tự tắt khi stdout không phải TTY, khi có NO_COLOR, và bật lại với FORCE_COLOR (styleText kiểm tra stream).
 * - select / multiselect: raw mode + phím mũi tên; text / confirm: một dòng readline (có sửa dòng, lịch sử).
 * - Ctrl+C / Esc: in "Cancelled." rồi ném CancelledError.
 */
import * as readline from "node:readline";
import { createInterface } from "node:readline/promises";
import { styleText } from "node:util";
import { CancelledError } from "./errors.js";

type Format = Parameters<typeof styleText>[0];
type Input = NodeJS.ReadableStream & { isTTY?: boolean; setRawMode?: (mode: boolean) => unknown };
type Output = NodeJS.WritableStream & { isTTY?: boolean; columns?: number; rows?: number };

/** Luồng vào / ra của prompt (test truyền stream giả). */
export interface IO {
  input: Input;
  output: Output;
}

const defaultIO = (): IO => ({ input: process.stdin, output: process.stdout });

const paint = (format: Format) => (text: string | number) => styleText(format, String(text), { stream: process.stdout });

export const pc = {
  bold: paint("bold"),
  dim: paint("dim"),
  underline: paint("underline"),
  red: paint("red"),
  green: paint("green"),
  yellow: paint("yellow"),
  cyan: paint("cyan"),
  blue: paint("blue"),
  magenta: paint("magenta"),
  black: paint("black"),
  bgMagenta: paint("bgMagenta"),
};

/** Terminal hiển thị được ký tự khung Unicode (cùng ý với is-unicode-supported). */
function unicodeSupported(env = process.env) {
  if (process.platform !== "win32") return env.TERM !== "linux";
  return (
    !!env.CI ||
    !!env.WT_SESSION ||
    env.TERM_PROGRAM === "vscode" ||
    env.TERMINAL_EMULATOR === "JetBrains-JediTerm" ||
    env.ConEmuTask === "{cmd::Cmder}" ||
    env.TERM === "xterm-256color" ||
    env.TERM === "alacritty"
  );
}

const U = unicodeSupported();
export const S = {
  bar: U ? "│" : "|",
  start: U ? "┌" : "T",
  end: U ? "└" : "-",
  active: U ? "◆" : "*",
  done: U ? "◇" : "o",
  cancel: U ? "■" : "x",
  warn: U ? "▲" : "!",
  info: U ? "●" : "i",
  radioOn: U ? "●" : ">",
  radioOff: U ? "○" : " ",
  checkOn: U ? "◼" : "[x]",
  checkOff: U ? "◻" : "[ ]",
  frames: U ? ["◒", "◐", "◓", "◑"] : ["-", "\\", "|", "/"],
};

const HIDE_CURSOR = "\x1b[?25l";
const SHOW_CURSOR = "\x1b[?25h";
/** Lên `n` dòng, về đầu dòng, xoá từ đó tới hết màn hình. */
const clearUp = (n: number) => (n > 0 ? `\x1b[${n}A\r\x1b[0J` : "");

/** Cắt chuỗi thường (chưa tô màu) cho vừa một dòng terminal, để đếm dòng khi vẽ lại luôn đúng. */
export function fit(text: string, width: number) {
  const chars = [...text];
  return chars.length <= width ? text : `${chars.slice(0, Math.max(1, width - 1)).join("")}…`;
}

function cancelled(output: Output): never {
  output.write(`${pc.dim(S.end)}  ${pc.red("Cancelled.")}\n\n`);
  throw new CancelledError();
}

/* ------------------------------------------------------------------ khung */

export interface Spinner {
  start(message: string): void;
  message(message: string): void;
  stop(message?: string): void;
  error(message?: string): void;
}

export function spinner(output: Output = process.stdout): Spinner {
  const tty = !!output.isTTY;
  let text = "";
  let frame = 0;
  let timer: NodeJS.Timeout | undefined;
  const showCursor = () => output.write(SHOW_CURSOR);
  const draw = () => output.write(`\r\x1b[2K${pc.magenta(S.frames[frame++ % S.frames.length])}  ${text}`);
  const end = (symbol: string, message: string) => {
    if (timer) clearInterval(timer);
    timer = undefined;
    if (tty) {
      output.write(`\r\x1b[2K${symbol}  ${message}\n${SHOW_CURSOR}`);
      process.off("exit", showCursor);
    } else output.write(`${symbol}  ${message}\n`);
  };
  return {
    start(message) {
      text = message;
      output.write(`${pc.dim(S.bar)}\n`);
      if (!tty) return void output.write(`${pc.magenta(S.active)}  ${message}\n`);
      process.once("exit", showCursor);
      output.write(HIDE_CURSOR);
      draw();
      timer = setInterval(draw, 80);
    },
    message(message) {
      text = message;
    },
    stop(message = text) {
      end(pc.green(S.done), message);
    },
    error(message = text) {
      end(pc.red(S.cancel), message);
    },
  };
}

/** Một mục log: ký hiệu ở dòng đầu, các dòng sau thụt theo thanh dọc. */
const logLine =
  (symbol: () => string) =>
  (message: string, output: Output = process.stdout) => {
    const [first, ...rest] = message.split("\n");
    output.write(`${pc.dim(S.bar)}\n${symbol()}  ${first}\n${rest.map((line) => `${pc.dim(S.bar)}  ${line}\n`).join("")}`);
  };

/** intro / outro / note / cancel / spinner / log: cùng tên với @clack/prompts để mã gọi không đổi. */
export const p = {
  log: {
    message: logLine(() => pc.dim(S.bar)),
    info: logLine(() => pc.blue(S.info)),
    step: logLine(() => pc.green(S.done)),
    success: logLine(() => pc.green(S.active)),
    warn: logLine(() => pc.yellow(S.warn)),
    error: logLine(() => pc.red(S.cancel)),
  },
  intro(title: string, output: Output = process.stdout) {
    output.write(`${pc.dim(S.start)}  ${title}\n`);
  },
  outro(message: string, output: Output = process.stdout) {
    output.write(`${pc.dim(S.bar)}\n${pc.dim(S.end)}  ${message}\n\n`);
  },
  note(body: string, title = "", output: Output = process.stdout) {
    const lines = body.split("\n").map((line) => `${pc.dim(S.bar)}  ${line}`);
    output.write(`${pc.dim(S.bar)}\n${pc.green(S.done)}  ${title}\n${lines.join("\n")}\n`);
  },
  cancel(message: string, output: Output = process.stdout) {
    output.write(`${pc.dim(S.end)}  ${pc.red(message)}\n\n`);
  },
  spinner,
};

/* ------------------------------------------------------------------ prompt một dòng */

async function ask(io: IO, message: string, hint: string, parse: (answer: string) => { value?: string; error?: string }) {
  const rl = createInterface({ input: io.input, output: io.output, terminal: !!io.output.isTTY });
  const ac = new AbortController();
  rl.on("SIGINT", () => ac.abort());
  rl.on("close", () => ac.abort());
  io.output.write(`${pc.dim(S.bar)}\n${pc.cyan(S.active)}  ${message}${hint ? ` ${pc.dim(hint)}` : ""}\n`);
  try {
    for (;;) {
      let answer: string;
      try {
        answer = await rl.question(`${pc.cyan(S.bar)}  `, { signal: ac.signal });
      } catch {
        return cancelled(io.output);
      }
      const { value, error } = parse(answer.trim());
      if (value !== undefined) return value;
      io.output.write(`${pc.yellow(S.warn)}  ${error}\n`);
    }
  } finally {
    rl.removeAllListeners("close");
    rl.close();
  }
}

export function textPrompt(
  message: string,
  initial: string,
  validate?: (value: string) => string | undefined,
  io: IO = defaultIO(),
): Promise<string> {
  return ask(io, message, initial ? `(${initial})` : "", (answer) => {
    const value = answer || initial;
    const error = validate?.(value);
    return error ? { error } : { value };
  });
}

export async function confirmPrompt(message: string, initial: boolean, io: IO = defaultIO()): Promise<boolean> {
  const value = await ask(io, message, initial ? "(Y/n)" : "(y/N)", (answer) => {
    if (!answer) return { value: initial ? "y" : "n" };
    if (/^(y|yes)$/i.test(answer)) return { value: "y" };
    if (/^(n|no)$/i.test(answer)) return { value: "n" };
    return { error: "Type y or n." };
  });
  return value === "y";
}

/* ------------------------------------------------------------------ danh sách chọn */

export interface Choice<T extends string> {
  value: T;
  label?: string;
  hint?: string;
}

/**
 * Danh sách chọn bằng phím: ↑ ↓ (hoặc k j) di chuyển, Space đánh dấu (multi), Enter xác nhận, Esc / Ctrl+C huỷ.
 * Danh sách dài cuộn trong một cửa sổ vừa màn hình.
 */
function choose<T extends string>(io: IO, message: string, options: Choice<T>[], multi: boolean, initial?: T): Promise<T[]> {
  const { input, output } = io;
  const n = options.length;
  const width = Math.max(20, (output.columns ?? 80) - 1);
  const visible = Math.max(3, Math.min(n, (output.rows ?? 24) - 6, 12));
  let cursor = Math.max(0, options.findIndex((o) => o.value === initial));
  const picked = new Set<number>();
  let drawn = 0;
  let warning = "";

  const label = (o: Choice<T>) => o.label ?? o.value;
  const render = () => {
    const top = Math.min(Math.max(0, cursor - Math.floor(visible / 2)), Math.max(0, n - visible));
    const help = multi ? "  space: select · enter: confirm" : "";
    const lines = [`${pc.cyan(S.active)}  ${fit(message, width - 3 - help.length)}${pc.dim(help)}`];
    if (top > 0) lines.push(`${pc.cyan(S.bar)}  ${pc.dim("…")}`);
    for (let i = top; i < Math.min(n, top + visible); i++) {
      const o = options[i];
      const active = i === cursor;
      const mark = multi ? (picked.has(i) ? pc.green(S.checkOn) : pc.dim(S.checkOff)) : active ? pc.green(S.radioOn) : pc.dim(S.radioOff);
      const markWidth = [...(multi ? S.checkOn : S.radioOn)].length;
      const text = fit(`${label(o)}${active && o.hint ? ` (${o.hint})` : ""}`, width - 4 - markWidth);
      lines.push(`${pc.cyan(S.bar)}  ${mark} ${active ? text : pc.dim(text)}`);
    }
    if (top + visible < n) lines.push(`${pc.cyan(S.bar)}  ${pc.dim("…")}`);
    if (warning) lines.push(`${pc.yellow(S.warn)}  ${warning}`);
    output.write(clearUp(drawn) + lines.join("\n") + "\n");
    drawn = lines.length;
  };

  return new Promise<T[]>((resolve, reject) => {
    const raw = !!input.isTTY && typeof input.setRawMode === "function";
    readline.emitKeypressEvents(input as NodeJS.ReadableStream);
    if (raw) input.setRawMode!(true);
    input.resume();

    const finish = (result: number[] | null) => {
      input.off("keypress", onKey);
      if (raw) input.setRawMode!(false);
      input.pause();
      output.write(clearUp(drawn) + SHOW_CURSOR);
      if (!result) {
        output.write(`${pc.red(S.cancel)}  ${message}\n`);
        try {
          cancelled(output);
        } catch (e) {
          reject(e);
        }
        return;
      }
      const values = result.map((i) => options[i]);
      output.write(`${pc.green(S.done)}  ${message}\n${pc.dim(S.bar)}  ${pc.dim(fit(values.map(label).join(", "), width - 3))}\n`);
      resolve(values.map((o) => o.value));
    };

    const onKey = (_: string, key: readline.Key | undefined) => {
      if (!key) return;
      if ((key.ctrl && key.name === "c") || key.name === "escape") return finish(null);
      if (key.name === "up" || key.name === "k") cursor = (cursor - 1 + n) % n;
      else if (key.name === "down" || key.name === "j") cursor = (cursor + 1) % n;
      else if (key.name === "home") cursor = 0;
      else if (key.name === "end") cursor = n - 1;
      else if (multi && key.name === "space") {
        if (picked.has(cursor)) picked.delete(cursor);
        else picked.add(cursor);
        warning = "";
      } else if (key.name === "return" || key.name === "enter") {
        if (!multi) return finish([cursor]);
        if (picked.size) return finish([...picked].sort((a, b) => a - b));
        warning = "Select at least one item with Space.";
      } else return;
      render();
    };

    input.on("keypress", onKey);
    output.write(`${pc.dim(S.bar)}\n${HIDE_CURSOR}`);
    render();
  });
}

export async function selectPrompt<T extends string>(message: string, options: Choice<T>[], initial: T, io: IO = defaultIO()): Promise<T> {
  const [value] = await choose(io, message, options, false, initial);
  return value;
}

export function multiselectPrompt<T extends string>(message: string, options: Choice<T>[], io: IO = defaultIO()): Promise<T[]> {
  return choose(io, message, options, true);
}
