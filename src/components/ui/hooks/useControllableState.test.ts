import { describe, expect, it, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { useControllableState } from "./useControllableState";

describe("useControllableState", () => {
  it("uncontrolled: tự giữ state, nhận cả giá trị lẫn hàm cập nhật, gọi onChange khi đổi", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](2));
    expect(result.current[0]).toBe(2);
    act(() => result.current[1]((n) => n + 1));
    expect(result.current[0]).toBe(3);
    expect(onChange.mock.calls).toEqual([[2], [3]]);
  });

  it("bỏ qua khi giá trị không đổi", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ defaultValue: 1, onChange }));
    act(() => result.current[1](1));
    act(() => result.current[1]((n) => n));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("controlled: không tự đổi, chỉ báo onChange; đổi theo `value` của cha", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(({ value }) => useControllableState({ value, defaultValue: 0, onChange }), {
      initialProps: { value: 5 },
    });
    act(() => result.current[1](9));
    expect(result.current[0]).toBe(5);
    expect(onChange).toHaveBeenCalledWith(9);
    rerender({ value: 9 });
    expect(result.current[0]).toBe(9);
  });

  it("controlled: hàm cập nhật nhận giá trị của cha", () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useControllableState({ value: 5, defaultValue: 0, onChange }));
    act(() => result.current[1]((n) => n * 2));
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it("hai lần set liên tiếp trong một sự kiện: hàm cập nhật thấy kết quả lần trước", () => {
    const { result } = renderHook(() => useControllableState({ defaultValue: 0 }));
    act(() => {
      result.current[1]((n) => n + 1);
      result.current[1]((n) => n + 1);
    });
    expect(result.current[0]).toBe(2);
  });

  it("hàm set có identity ổn định, gọi onChange mới nhất", () => {
    const first = vi.fn();
    const second = vi.fn();
    const { result, rerender } = renderHook(({ onChange }) => useControllableState({ defaultValue: 0, onChange }), {
      initialProps: { onChange: first },
    });
    const set = result.current[1];
    rerender({ onChange: second });
    expect(result.current[1]).toBe(set);
    act(() => set(1));
    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledWith(1);
  });

  it("defaultValue dạng hàm chỉ chạy một lần", () => {
    const init = vi.fn(() => ["a"]);
    const { result, rerender } = renderHook(() => useControllableState({ defaultValue: init }));
    rerender();
    expect(result.current[0]).toEqual(["a"]);
    expect(init).toHaveBeenCalledTimes(1);
  });
});
