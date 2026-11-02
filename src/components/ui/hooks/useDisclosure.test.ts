import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useDisclosure } from "./useDisclosure";

describe("useDisclosure", () => {
  it("mở / đóng / đảo và báo onOpenChange", () => {
    const onOpenChange = vi.fn();
    const { result } = renderHook(() => useDisclosure({ onOpenChange }));
    expect(result.current.open).toBe(false);
    act(() => result.current.onOpen());
    expect(result.current.open).toBe(true);
    act(() => result.current.onToggle());
    expect(result.current.open).toBe(false);
    act(() => result.current.onClose());
    expect(onOpenChange.mock.calls).toEqual([[true], [false]]);
  });

  it("defaultOpen", () => {
    expect(renderHook(() => useDisclosure({ defaultOpen: true })).result.current.open).toBe(true);
  });

  it("controlled: chỉ báo onOpenChange, đổi theo `open` của cha", () => {
    const onOpenChange = vi.fn();
    const { result, rerender } = renderHook(({ open }) => useDisclosure({ open, onOpenChange }), { initialProps: { open: false } });
    act(() => result.current.onOpen());
    expect(result.current.open).toBe(false);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    rerender({ open: true });
    expect(result.current.open).toBe(true);
    act(() => result.current.onToggle());
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it("các hàm điều khiển giữ identity giữa các lần render", () => {
    const { result, rerender } = renderHook(() => useDisclosure());
    const { setOpen, onOpen, onClose, onToggle } = result.current;
    act(() => onOpen());
    rerender();
    expect(result.current.setOpen).toBe(setOpen);
    expect(result.current.onOpen).toBe(onOpen);
    expect(result.current.onClose).toBe(onClose);
    expect(result.current.onToggle).toBe(onToggle);
  });
});
