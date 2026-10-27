import * as React from "react";
import { Dismiss20Regular } from "@fluentui/react-icons";
import {
  Button,
  Dialog,
  DialogActions,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogSurface,
  DialogTitle,
  Drawer,
  DrawerBody,
  DrawerClose,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerSurface,
  SkeletonText,
} from "yugen-ui";
import type { Customer, CustomerInput } from "./api";
import { useAdmin } from "./context";

// The form brings react-hook-form and zod: loaded the first time a drawer opens, not with the list.
const CustomerForm = React.lazy(() => import("./CustomerForm"));

/** Keeps the last non-null value, so a drawer or dialog keeps its content while it animates out. */
function useLast<T>(value: T | null): T | null {
  const [last, setLast] = React.useState(value);
  if (value !== null && value !== last) setLast(value);
  return value ?? last;
}

export interface CustomerDrawerProps {
  /** `"new"` to create, a customer to edit, null when closed. */
  editing: Customer | "new" | null;
  onClose: () => void;
  onSubmit: (values: CustomerInput, customer?: Customer) => void;
}

/** Create or edit a customer in a drawer from the end side. */
export function CustomerDrawer({ editing, onClose, onSubmit }: CustomerDrawerProps) {
  const { t } = useAdmin();
  const shown = useLast(editing);
  const customer = shown === "new" ? undefined : (shown ?? undefined);
  const title = customer ? t.form.editTitle : t.form.createTitle;
  const close = (
    <DrawerClose asChild>
      <Button appearance="subtle" icon={<Dismiss20Regular />} aria-label={t.common.close} />
    </DrawerClose>
  );
  return (
    <Drawer open={editing !== null} onOpenChange={(open) => !open && onClose()}>
      <DrawerSurface position="end" size="medium" aria-describedby={undefined} className="flex flex-col">
        <React.Suspense
          fallback={
            <>
              <DrawerHeader>
                <DrawerHeaderTitle action={close}>{title}</DrawerHeaderTitle>
              </DrawerHeader>
              <DrawerBody>
                <SkeletonText lines={6} />
              </DrawerBody>
            </>
          }
        >
          <CustomerForm
            key={customer?.id ?? "new"}
            customer={customer}
            title={title}
            close={close}
            onCancel={onClose}
            onSubmit={(values) => onSubmit(values, customer)}
          />
        </React.Suspense>
      </DrawerSurface>
    </Drawer>
  );
}

export interface DeleteDialogProps {
  /** Customers to delete; null when closed. */
  customers: Customer[] | null;
  onCancel: () => void;
  onConfirm: (customers: Customer[]) => void;
  /** The request is running (pages that wait for the server before leaving). */
  busy?: boolean;
}

/** Confirms a delete. Cancel has the focus, so Enter right away does no harm. */
export function DeleteDialog({ customers, onCancel, onConfirm, busy }: DeleteDialogProps) {
  const { t } = useAdmin();
  const shown = useLast(customers) ?? [];
  const name = shown[0]?.name ?? "";
  return (
    <Dialog open={customers !== null} onOpenChange={(open) => !open && !busy && onCancel()}>
      <DialogSurface modalType="alert" className="max-w-md">
        <DialogTitle action={null}>{t.remove.title(shown.length, name)}</DialogTitle>
        <DialogContent>
          <DialogDescription>{t.remove.body(shown.length)}</DialogDescription>
        </DialogContent>
        <DialogActions>
          <DialogClose asChild>
            <Button disabled={busy}>{t.common.cancel}</Button>
          </DialogClose>
          <Button appearance="danger" loading={busy} onClick={() => onConfirm(shown)}>
            {t.remove.confirm(shown.length)}
          </Button>
        </DialogActions>
      </DialogSurface>
    </Dialog>
  );
}
