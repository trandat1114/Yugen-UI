import * as React from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  Field,
  Input,
} from "yugen-ui";
import type { Conversation } from "./conversations";
import type { Content } from "./content/types";

/** A dialog's target stays set while the dialog animates out. */
export function useDialogTarget<T>() {
  const [state, setState] = React.useState<{ open: boolean; target: T | null }>({ open: false, target: null });
  return {
    ...state,
    show: (target: T) => setState({ open: true, target }),
    onOpenChange: (open: boolean) => setState((s) => ({ ...s, open })),
  };
}

export function RenameDialog({
  open,
  conversation,
  onOpenChange,
  onRename,
  t,
}: {
  open: boolean;
  conversation: Conversation | null;
  onOpenChange: (open: boolean) => void;
  onRename: (title: string) => void;
  t: Content;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface
        aria-describedby={undefined}
        className="max-w-md"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.select();
        }}
      >
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            onRename(inputRef.current?.value ?? "");
            onOpenChange(false);
          }}
        >
          <DialogTitle>{t.rename.title}</DialogTitle>
          <DialogContent>
            <Field label={t.rename.label}>
              <Input ref={inputRef} key={conversation?.id} defaultValue={conversation?.title} maxLength={80} required />
            </Field>
          </DialogContent>
          <DialogActions>
            <DialogClose asChild>
              <Button>{t.rename.cancel}</Button>
            </DialogClose>
            <Button type="submit" appearance="primary">
              {t.rename.save}
            </Button>
          </DialogActions>
        </form>
      </DialogSurface>
    </Dialog>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  body,
  confirm,
  cancel,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  body: string;
  confirm: string;
  cancel: string;
  onConfirm: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogSurface className="max-w-md">
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{body}</DialogDescription>
        <DialogActions>
          <DialogClose asChild>
            <Button>{cancel}</Button>
          </DialogClose>
          <Button
            appearance="danger"
            onClick={() => {
              onConfirm();
              onOpenChange(false);
            }}
          >
            {confirm}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
