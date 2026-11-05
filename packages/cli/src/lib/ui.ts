import { CliError } from "./errors.js";
import { confirmPrompt, multiselectPrompt, p, pc, selectPrompt, textPrompt, type Choice } from "./term.js";

export { p, pc, type Choice };

export interface Ctx {
  /** Được hỏi người dùng: có TTY, không -y, không chạy trong CI. Ngược lại mọi prompt lấy giá trị mặc định. */
  interactive: boolean;
}

export const makeCtx = (yes = false): Ctx => ({
  interactive: !yes && !!process.stdin.isTTY && !!process.stdout.isTTY && !process.env.CI,
});

export async function select<T extends string>(ctx: Ctx, message: string, options: Choice<T>[], initial: T): Promise<T> {
  if (!ctx.interactive) return initial;
  return selectPrompt(message, options, initial);
}

export async function multiselect<T extends string>(ctx: Ctx, message: string, options: Choice<T>[]): Promise<T[]> {
  if (!ctx.interactive) return [];
  return multiselectPrompt(message, options);
}

export async function confirm(ctx: Ctx, message: string, initial: boolean): Promise<boolean> {
  if (!ctx.interactive) return initial;
  return confirmPrompt(message, initial);
}

export async function text(ctx: Ctx, message: string, initial: string, validate?: (v: string) => string | undefined) {
  if (!ctx.interactive) {
    const error = validate?.(initial);
    if (error) throw new CliError(error);
    return initial;
  }
  return textPrompt(message, initial, validate);
}

/** Danh sách đường dẫn mờ, cắt bớt khi dài (`yugen add all` ghi hơn trăm file). */
export function fileList(files: string[], max = 12) {
  const shown = files.slice(0, max).map((f) => pc.dim(`  ${f}`));
  if (files.length > max) shown.push(pc.dim(`  … and ${files.length - max} more`));
  return shown.join("\n");
}
