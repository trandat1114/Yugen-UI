import * as React from "react";
import { useControllableState } from "./useControllableState";

export interface UseDisclosureOptions {
  /** Trạng thái mở do bên ngoài giữ (controlled). */
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export interface UseDisclosureReturn {
  open: boolean;
  setOpen: (open: boolean) => void;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

/**
 * Trạng thái mở / đóng cho dialog, menu, panel… Các hàm điều khiển có identity ổn định nên truyền thẳng vào
 * `onClick` hay `onOpenChange` mà không làm con render lại.
 *
 * ```tsx
 * const { open, setOpen, onOpen } = useDisclosure();
 * <Button onClick={onOpen}>Mở</Button>
 * <Dialog open={open} onOpenChange={setOpen}>…</Dialog>
 * ```
 */
export function useDisclosure({ open, defaultOpen = false, onOpenChange }: UseDisclosureOptions = {}): UseDisclosureReturn {
  const [isOpen, setOpen] = useControllableState({ value: open, defaultValue: defaultOpen, onChange: onOpenChange });
  const onOpen = React.useCallback(() => setOpen(true), [setOpen]);
  const onClose = React.useCallback(() => setOpen(false), [setOpen]);
  const onToggle = React.useCallback(() => setOpen((prev) => !prev), [setOpen]);
  return { open: isOpen, setOpen, onOpen, onClose, onToggle };
}
