import * as p from "@clack/prompts";
import pc from "picocolors";
import { CancelledError, CliError } from "./errors.js";

export { p, pc };

export interface Ctx {
  /** Được hỏi người dùng: có TTY, không -y, không chạy trong CI. Ngược lại mọi prompt lấy giá trị mặc định. */
  interactive: boolean;
}

export const makeCtx = (yes = false): Ctx => ({
  interactive: !yes && !!process.stdin.isTTY && !!process.stdout.isTTY && !process.env.CI,
});

function guard<T>(value: T): Exclude<T, symbol> {
  if (p.isCancel(value)) {
    p.cancel("Cancelled.");
    throw new CancelledError();
  }
  return value as Exclude<T, symbol>;
}

export interface Choice<T extends string> {
  value: T;
  label?: string;
  hint?: string;
}

export async function select<T extends string>(ctx: Ctx, message: string, options: Choice<T>[], initial: T): Promise<T> {
  if (!ctx.interactive) return initial;
  return guard(await p.select<T>({ message, options: options as Parameters<typeof p.select<T>>[0]["options"], initialValue: initial }));
}

export async function multiselect<T extends string>(ctx: Ctx, message: string, options: Choice<T>[]): Promise<T[]> {
  if (!ctx.interactive) return [];
  return guard(
    await p.multiselect<T>({ message, options: options as Parameters<typeof p.multiselect<T>>[0]["options"], required: true }),
  );
}

export async function confirm(ctx: Ctx, message: string, initial: boolean): Promise<boolean> {
  if (!ctx.interactive) return initial;
  return guard(await p.confirm({ message, initialValue: initial }));
}

export async function text(ctx: Ctx, message: string, initial: string, validate?: (v: string) => string | undefined) {
  if (!ctx.interactive) {
    const error = validate?.(initial);
    if (error) throw new CliError(error);
    return initial;
  }
  const value = guard(
    await p.text({ message, placeholder: initial, defaultValue: initial, validate: (v) => validate?.(v || initial) }),
  );
  return value || initial;
}

/** Danh sách đường dẫn mờ, cắt bớt khi dài (`yugen add all` ghi hơn trăm file). */
export function fileList(files: string[], max = 12) {
  const shown = files.slice(0, max).map((f) => pc.dim(`  ${f}`));
  if (files.length > max) shown.push(pc.dim(`  … and ${files.length - max} more`));
  return shown.join("\n");
}
