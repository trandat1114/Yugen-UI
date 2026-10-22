/** Lỗi người dùng sửa được: in thông báo, không in stack. */
export class CliError extends Error {
  constructor(
    message: string,
    readonly hint?: string,
  ) {
    super(message);
  }
}

/** Người dùng bấm Ctrl+C / Esc trong prompt. */
export class CancelledError extends Error {}
