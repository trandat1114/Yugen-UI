import { afterEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { renderToString } from "react-dom/server";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AriaLiveAnnouncer } from "../AriaLive/AriaLive";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { arrayMove, Sortable, SortableGroup, SortableHandle, SortableItem, type SortableEndData } from "./Sortable";
import { sortableMessagesEn } from "./messages";

const LABELS: Record<string, string> = { tao: "Táo", cam: "Cam", le: "Lê" };

function Fruits({ onSortEnd, onValueChange }: { onSortEnd?: (d: SortableEndData) => void; onValueChange?: (v: string[]) => void }) {
  const [items, setItems] = useState(["tao", "cam", "le"]);
  return (
    <AriaLiveAnnouncer>
      <Sortable
        aria-label="Trái cây"
        value={items}
        onValueChange={(v) => {
          setItems(v);
          onValueChange?.(v);
        }}
        onSortEnd={onSortEnd}
      >
        {items.map((id) => (
          <SortableItem key={id} value={id} label={LABELS[id]}>
            <SortableHandle />
            {LABELS[id]}
          </SortableItem>
        ))}
      </Sortable>
    </AriaLiveAnnouncer>
  );
}

const handle = (label: string) => screen.getByRole("button", { name: `Sắp xếp lại ${label}` });
const order = () => Array.from(document.querySelectorAll("[data-sortable-item]")).map((el) => el.textContent);
const assertive = () => document.querySelector('[data-yugen-live-region="assertive"]')?.textContent;

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Sortable — bàn phím", () => {
  it("Space nhấc, mũi tên di chuyển, Enter thả; focus ở lại tay nắm, mỗi bước được đọc", async () => {
    const user = userEvent.setup();
    const onSortEnd = vi.fn();
    render(<Fruits onSortEnd={onSortEnd} />);
    const tao = handle("Táo");
    expect(tao).toHaveAttribute("aria-pressed", "false");
    expect(tao).toHaveAccessibleDescription(/Space hoặc Enter để nhấc mục lên/);

    tao.focus();
    await user.keyboard(" ");
    expect(tao).toHaveAttribute("aria-pressed", "true");
    expect(tao.closest("[data-sortable-item]")).toHaveAttribute("data-dragging", "keyboard");
    await waitFor(() => expect(assertive()).toBe("Đã nhấc Táo, vị trí 1 trên 3."));

    await user.keyboard("{ArrowDown}");
    expect(order()).toEqual(["Cam", "Táo", "Lê"]);
    expect(handle("Táo")).toHaveFocus();
    expect(onSortEnd).not.toHaveBeenCalled();

    await user.keyboard("{Enter}");
    expect(handle("Táo")).toHaveAttribute("aria-pressed", "false");
    expect(onSortEnd).toHaveBeenCalledExactlyOnceWith({
      item: "tao",
      from: { list: "", index: 0 },
      to: { list: "", index: 1 },
      canceled: false,
    });
    await waitFor(() => expect(assertive()).toBe("Đã thả Táo ở vị trí 2 trên 3."));
  });

  it("Home / End, và mũi tên ở mép không làm gì", async () => {
    const user = userEvent.setup();
    render(<Fruits />);
    handle("Táo").focus();
    await user.keyboard(" {ArrowUp}");
    expect(order()).toEqual(["Táo", "Cam", "Lê"]);
    await user.keyboard("{End}");
    expect(order()).toEqual(["Cam", "Lê", "Táo"]);
    await user.keyboard("{Home} ");
    expect(order()).toEqual(["Táo", "Cam", "Lê"]);
  });

  it("Esc trả lại thứ tự lúc nhấc lên", async () => {
    const user = userEvent.setup();
    const onSortEnd = vi.fn();
    const onValueChange = vi.fn();
    render(<Fruits onSortEnd={onSortEnd} onValueChange={onValueChange} />);
    handle("Táo").focus();
    await user.keyboard(" {ArrowDown}{ArrowDown}");
    expect(order()).toEqual(["Cam", "Lê", "Táo"]);
    await user.keyboard("{Escape}");
    expect(order()).toEqual(["Táo", "Cam", "Lê"]);
    expect(onValueChange).toHaveBeenLastCalledWith(["tao", "cam", "le"]);
    expect(onSortEnd).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ to: { list: "", index: 0 }, canceled: true }));
    expect(handle("Táo")).toHaveFocus();
    await waitFor(() => expect(assertive()).toBe("Đã huỷ. Táo về lại vị trí 1 trên 3."));
  });

  it("bấm ra ngoài khi đang nhấc: thả tại chỗ", async () => {
    const onSortEnd = vi.fn();
    const user = userEvent.setup();
    render(<Fruits onSortEnd={onSortEnd} />);
    handle("Táo").focus();
    await user.keyboard(" {ArrowDown}");
    fireEvent.pointerDown(document.body);
    expect(onSortEnd).toHaveBeenCalledWith(expect.objectContaining({ to: { list: "", index: 1 }, canceled: false }));
    expect(handle("Táo")).toHaveAttribute("aria-pressed", "false");
  });
});

describe("Sortable — con trỏ", () => {
  it("không kéo được: bấm tay nắm để nhấc, bấm tay nắm khác để đặt vào chỗ đó", async () => {
    const user = userEvent.setup();
    const onSortEnd = vi.fn();
    render(<Fruits onSortEnd={onSortEnd} />);
    await user.click(handle("Lê"));
    expect(handle("Lê")).toHaveAttribute("aria-pressed", "true");
    await user.click(handle("Táo"));
    expect(order()).toEqual(["Lê", "Táo", "Cam"]);
    expect(onSortEnd).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ item: "le", to: { list: "", index: 0 } }));
    expect(handle("Lê")).toHaveAttribute("aria-pressed", "false");
  });

  it("kéo tay nắm qua nửa mục kế bên thì đổi chỗ; click sau lần kéo bị chặn", async () => {
    // Mỗi mục cao 40px theo thứ tự trong DOM, cộng phần transform đang gắn.
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      const box = (x: number, y: number, w: number, h: number) =>
        ({ x, y, left: x, top: y, width: w, height: h, right: x + w, bottom: y + h }) as DOMRect;
      if (this.hasAttribute("data-sortable-list")) return box(0, 0, 200, 120);
      const item = this.closest<HTMLElement>("[data-sortable-item]");
      if (!item) return box(0, 0, 0, 0);
      const index = Array.from(item.parentElement!.children).indexOf(item);
      const m = /translate3d\(([-\d.]+)px, ([-\d.]+)px/.exec(item.style.transform);
      return box(m ? +m[1] : 0, index * 40 + (m ? +m[2] : 0), 200, 40);
    });
    const onSortEnd = vi.fn();
    const onClick = vi.fn();
    render(<Fruits onSortEnd={onSortEnd} />);
    document.addEventListener("click", onClick);
    const pointer = { pointerId: 1, isPrimary: true, button: 0, pointerType: "mouse" };

    fireEvent.pointerDown(handle("Táo"), { ...pointer, clientX: 10, clientY: 20 });
    fireEvent.pointerMove(window, { ...pointer, clientX: 10, clientY: 22 });
    expect(handle("Táo").closest("[data-sortable-item]")).not.toHaveAttribute("data-dragging");
    fireEvent.pointerMove(window, { ...pointer, clientX: 10, clientY: 75 });
    expect(handle("Táo").closest("[data-sortable-item]")).toHaveAttribute("data-dragging", "pointer");
    await waitFor(() => expect(order()).toEqual(["Cam", "Táo", "Lê"]));

    fireEvent.pointerUp(window, { ...pointer, clientX: 10, clientY: 75 });
    fireEvent.click(handle("Táo"));
    expect(onClick).not.toHaveBeenCalled();
    expect(handle("Táo")).toHaveAttribute("aria-pressed", "false");
    expect(handle("Táo").closest("[data-sortable-item]")).not.toHaveAttribute("data-dragging");
    expect(onSortEnd).toHaveBeenCalledExactlyOnceWith({
      item: "tao",
      from: { list: "", index: 0 },
      to: { list: "", index: 1 },
      canceled: false,
    });
    document.removeEventListener("click", onClick);
  });
});

function Board({ onSortEnd }: { onSortEnd?: (d: SortableEndData) => void }) {
  const [value, setValue] = useState<Record<string, string[]>>({ todo: ["a", "b"], done: ["c"] });
  return (
    <SortableGroup value={value} onValueChange={setValue} onSortEnd={onSortEnd}>
      {(["todo", "done"] as const).map((list) => (
        <Sortable key={list} listId={list} label={list === "todo" ? "Cần làm" : "Xong"}>
          {value[list].map((id) => (
            <SortableItem key={id} value={id} label={`Việc ${id}`}>
              <SortableHandle />
            </SortableItem>
          ))}
        </Sortable>
      ))}
    </SortableGroup>
  );
}

describe("SortableGroup", () => {
  it("mũi tên ngang chuyển mục sang danh sách kế bên, focus theo mục", async () => {
    const user = userEvent.setup();
    const onSortEnd = vi.fn();
    render(
      <AriaLiveAnnouncer>
        <Board onSortEnd={onSortEnd} />
      </AriaLiveAnnouncer>,
    );
    handle("Việc a").focus();
    await user.keyboard(" {ArrowRight}");
    const lists = document.querySelectorAll("[data-sortable-list]");
    expect(lists[1].querySelectorAll("[data-sortable-item]")).toHaveLength(2);
    expect(lists[1]).toHaveAttribute("data-over");
    expect(handle("Việc a")).toHaveFocus();
    await waitFor(() => expect(assertive()).toBe("Việc a: sang Xong, vị trí 1 trên 2."));
    await user.keyboard("{ArrowRight}{Enter}");
    expect(onSortEnd).toHaveBeenCalledExactlyOnceWith({
      item: "a",
      from: { list: "todo", index: 0 },
      to: { list: "done", index: 0 },
      canceled: false,
    });
  });
});

describe("SortableItem shortcuts", () => {
  it("Alt + mũi tên di chuyển ngay, focus ở lại mục", async () => {
    const user = userEvent.setup();
    const onSortEnd = vi.fn();
    function Tags() {
      const [items, setItems] = useState(["tao", "cam", "le"]);
      return (
        <Sortable orientation="horizontal" value={items} onValueChange={setItems} onSortEnd={onSortEnd}>
          {items.map((id) => (
            <SortableItem key={id} value={id} asChild handle shortcuts>
              <button type="button">{LABELS[id]}</button>
            </SortableItem>
          ))}
        </Sortable>
      );
    }
    render(<Tags />);
    const tao = screen.getByRole("button", { name: "Táo" });
    expect(tao).toHaveAttribute("aria-keyshortcuts", "Alt+ArrowLeft Alt+ArrowRight");
    tao.focus();
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}");
    expect(order()).toEqual(["Cam", "Táo", "Lê"]);
    expect(screen.getByRole("button", { name: "Táo" })).toHaveFocus();
    expect(onSortEnd).toHaveBeenCalledExactlyOnceWith(expect.objectContaining({ to: { list: "", index: 1 } }));
    await user.keyboard("{ArrowRight}");
    expect(order()).toEqual(["Cam", "Táo", "Lê"]);
  });
});

describe("Sortable — khác", () => {
  it("render ở server không đụng tới window", () => {
    expect(() => renderToString(<Fruits />)).not.toThrow();
  });

  it("messages tiếng Anh", () => {
    render(
      <YugenProvider messages={{ sortable: sortableMessagesEn }}>
        <Sortable value={["tao"]}>
          <SortableItem value="tao" label="Apple">
            <SortableHandle />
          </SortableItem>
        </Sortable>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Reorder Apple" })).toHaveAccessibleDescription(/Press Space or Enter/);
  });

  it("tay nắm của mục disabled bị tắt", () => {
    render(
      <Sortable value={["tao"]}>
        <SortableItem value="tao" label="Táo" disabled>
          <SortableHandle />
        </SortableItem>
      </Sortable>,
    );
    expect(handle("Táo")).toBeDisabled();
  });

  it("arrayMove", () => {
    expect(arrayMove(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"]);
    expect(arrayMove(["a", "b", "c"], 2, 0)).toEqual(["c", "a", "b"]);
    expect(arrayMove(["a"], 3, 0)).toEqual(["a"]);
  });

  it("gỡ nhóm giữa lúc kéo dọn listener", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Fruits />);
    handle("Táo").focus();
    await user.keyboard(" ");
    const remove = vi.spyOn(window, "removeEventListener");
    act(() => unmount());
    expect(remove).toHaveBeenCalledWith("keydown", expect.any(Function), true);
  });
});
