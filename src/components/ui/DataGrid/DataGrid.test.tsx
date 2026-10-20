import { describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { createColumn, DataGrid, sortItems, type DataGridProps } from "./DataGrid";

type Person = { id: string; name: string; age: number };

const people: Person[] = [
  { id: "a", name: "Cường", age: 30 },
  { id: "b", name: "An", age: 25 },
  { id: "c", name: "Bình", age: 30 },
  { id: "d", name: "Dũng", age: 22 },
];

const columns = [
  createColumn<Person>({
    columnId: "name",
    renderHeaderCell: () => "Tên",
    renderCell: (p) => p.name,
    compare: (a, b) => a.name.localeCompare(b.name, "vi"),
  }),
  createColumn<Person>({
    columnId: "age",
    renderHeaderCell: () => "Tuổi",
    renderCell: (p) => p.age,
    compare: (a, b) => a.age - b.age,
  }),
];

function setup(props: Partial<DataGridProps<Person>> = {}, dir: "ltr" | "rtl" = "ltr") {
  const user = userEvent.setup();
  const utils = render(
    <YugenProvider dir={dir}>
      <button type="button">trước</button>
      <DataGrid aria-label="Người" items={people} columns={columns} getRowId={(p) => p.id} {...props} />
      <button type="button">sau</button>
    </YugenProvider>,
  );
  const grid = utils.getByRole("grid");
  const names = () =>
    within(grid)
      .getAllByRole("row")
      .slice(1)
      .map((row) => row.querySelector('[role="gridcell"]')?.textContent);
  const rowOf = (id: string) => grid.querySelector<HTMLElement>(`[data-row-id="${id}"]`)!;
  const cell = (row: number, col: number) =>
    grid.querySelector<HTMLElement>(`[data-row-index="${row}"] [data-col-index="${col}"]`)!;
  return { user, grid, names, rowOf, cell, ...utils };
}

describe("sortItems", () => {
  it("sắp xếp ổn định cả hai chiều, không đổi mảng gốc", () => {
    const asc = sortItems(people, columns, { sortColumn: "age", sortDirection: "ascending" }).map((p) => p.id);
    expect(asc).toEqual(["d", "b", "a", "c"]);
    const desc = sortItems(people, columns, { sortColumn: "age", sortDirection: "descending" }).map((p) => p.id);
    expect(desc).toEqual(["a", "c", "b", "d"]); // a và c bằng nhau → giữ thứ tự gốc
    expect(people.map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
    expect(sortItems(people, columns, undefined)).not.toBe(people);
    expect(sortItems(people, columns, { sortColumn: "x", sortDirection: "ascending" }).map((p) => p.id)).toEqual(["a", "b", "c", "d"]);
  });
});

describe("DataGrid — sắp xếp", () => {
  it("click tiêu đề sắp xếp, đảo chiều, aria-sort; Enter / Space trên tiêu đề", async () => {
    const onSortChange = vi.fn();
    const { user, grid, names } = setup({ sortable: true, onSortChange });
    const [nameHeader, ageHeader] = within(grid).getAllByRole("columnheader");
    expect(nameHeader).toHaveAttribute("aria-sort", "none");

    await user.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "ascending");
    expect(names()).toEqual(["An", "Bình", "Cường", "Dũng"]);
    expect(nameHeader).toHaveTextContent("(tăng dần)");
    expect(onSortChange).toHaveBeenLastCalledWith(expect.anything(), { sortColumn: "name", sortDirection: "ascending" });

    await user.click(nameHeader);
    expect(nameHeader).toHaveAttribute("aria-sort", "descending");
    expect(names()).toEqual(["Dũng", "Cường", "Bình", "An"]);

    ageHeader.focus();
    await user.keyboard("{Enter}");
    expect(ageHeader).toHaveAttribute("aria-sort", "ascending");
    expect(nameHeader).toHaveAttribute("aria-sort", "none");
    await user.keyboard(" ");
    expect(ageHeader).toHaveAttribute("aria-sort", "descending");
  });

  it("không sortable → không có aria-sort", () => {
    const { grid } = setup();
    expect(within(grid).getAllByRole("columnheader")[0]).not.toHaveAttribute("aria-sort");
  });
});

describe("DataGrid — chọn hàng", () => {
  it("single: click chọn một hàng, aria-selected", async () => {
    const onSelectionChange = vi.fn();
    const { user, rowOf } = setup({ selectionMode: "single", onSelectionChange });
    await user.click(rowOf("b"));
    expect(rowOf("b")).toHaveAttribute("aria-selected", "true");
    await user.click(rowOf("c"));
    expect(rowOf("b")).toHaveAttribute("aria-selected", "false");
    expect(rowOf("c")).toHaveAttribute("aria-selected", "true");
    expect(onSelectionChange).toHaveBeenLastCalledWith(expect.anything(), { selectedItems: new Set(["c"]) });
  });

  it("multiselect: checkbox tiêu đề indeterminate, chọn / bỏ tất cả", async () => {
    const { user, grid, rowOf } = setup({ selectionMode: "multiselect" });
    expect(grid).toHaveAttribute("aria-multiselectable", "true");
    const all = within(grid).getByRole("checkbox", { name: "Chọn tất cả hàng" });
    await user.click(within(rowOf("a")).getByRole("checkbox"));
    expect(rowOf("a")).toHaveAttribute("aria-selected", "true");
    expect(all).toHaveAttribute("data-state", "indeterminate");
    await user.click(all);
    expect(all).toHaveAttribute("data-state", "checked");
    expect(within(grid).getAllByRole("row").slice(1).every((r) => r.getAttribute("aria-selected") === "true")).toBe(true);
    await user.click(all);
    expect(all).toHaveAttribute("data-state", "unchecked");
  });

  it("Space chọn hàng đang focus; Shift + mũi tên và Shift + click chọn theo khoảng", async () => {
    const { user, cell, rowOf } = setup({ selectionMode: "multiselect" });
    cell(1, 1).focus();
    await user.keyboard(" ");
    expect(rowOf("a")).toHaveAttribute("aria-selected", "true");
    await user.keyboard("{Shift>}{ArrowDown}{ArrowDown}{/Shift}");
    expect(["a", "b", "c"].every((id) => rowOf(id).getAttribute("aria-selected") === "true")).toBe(true);
    expect(cell(3, 1)).toHaveFocus();
    // Thu khoảng lại.
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}");
    expect(rowOf("c")).toHaveAttribute("aria-selected", "false");
    // Shift + click từ mốc "a" tới "d".
    await user.keyboard("{Shift>}");
    await user.click(rowOf("d"));
    await user.keyboard("{/Shift}");
    expect(["a", "b", "c", "d"].every((id) => rowOf(id).getAttribute("aria-selected") === "true")).toBe(true);
  });
});

describe("DataGrid — bàn phím", () => {
  it("một tab stop, mũi tên / Home / End / Ctrl+End, Tab rời lưới", async () => {
    const { user, cell } = setup();
    await user.tab();
    await user.tab();
    expect(cell(0, 0)).toHaveFocus();
    await user.keyboard("{ArrowDown}{ArrowRight}");
    expect(cell(1, 1)).toHaveFocus();
    await user.keyboard("{Home}");
    expect(cell(1, 0)).toHaveFocus();
    await user.keyboard("{Control>}{End}{/Control}");
    expect(cell(4, 1)).toHaveFocus();
    await user.keyboard("{Control>}{Home}{/Control}");
    expect(cell(0, 0)).toHaveFocus();
    await user.keyboard("{PageDown}");
    expect(cell(4, 0)).toHaveFocus();
    expect(cell(4, 0)).toHaveAttribute("tabindex", "0");
    expect(cell(1, 0)).toHaveAttribute("tabindex", "-1");
    await user.tab();
    expect(document.activeElement).toHaveTextContent("sau");
  });

  it("RTL: ArrowLeft đi về cuối dòng", async () => {
    const { user, cell } = setup({}, "rtl");
    cell(1, 0).focus();
    await user.keyboard("{ArrowLeft}");
    expect(cell(1, 1)).toHaveFocus();
    await user.keyboard("{ArrowRight}");
    expect(cell(1, 0)).toHaveFocus();
  });

  it("focusMode row: focus cả hàng", async () => {
    const { user, cell, rowOf } = setup({ focusMode: "row" });
    cell(0, 0).focus();
    await user.keyboard("{ArrowDown}");
    expect(rowOf("a")).toHaveFocus();
    await user.keyboard("{End}");
    expect(rowOf("d")).toHaveFocus();
  });

  it("tay nắm đổi độ rộng: phím mũi tên ±10px, Shift ±50px, đảo chiều trong RTL", async () => {
    const onColumnResize = vi.fn();
    const ltr = setup({ resizableColumns: true, columnSizingOptions: { name: { defaultWidth: 200 } }, onColumnResize });
    const handle = within(ltr.grid).getAllByRole("separator")[0];
    expect(handle).toHaveAttribute("aria-valuenow", "200");
    handle.focus();
    await ltr.user.keyboard("{ArrowRight}");
    expect(onColumnResize).toHaveBeenLastCalledWith(expect.anything(), { columnId: "name", width: 210 });
    await ltr.user.keyboard("{Shift>}{ArrowLeft}{/Shift}");
    expect(handle).toHaveAttribute("aria-valuenow", "160");
    ltr.unmount();

    const rtl = setup({ resizableColumns: true, columnSizingOptions: { name: { defaultWidth: 200 } } }, "rtl");
    const rtlHandle = within(rtl.grid).getAllByRole("separator")[0];
    rtlHandle.focus();
    await rtl.user.keyboard("{ArrowLeft}");
    expect(rtlHandle).toHaveAttribute("aria-valuenow", "210");
  });

  it("kéo tay nắm bằng con trỏ, RTL đảo chiều", () => {
    const { grid, unmount } = setup({ resizableColumns: true, columnSizingOptions: { name: { defaultWidth: 200 } } }, "rtl");
    const handle = within(grid).getAllByRole("separator")[0];
    fireEvent.pointerDown(handle, { button: 0, clientX: 500, pointerId: 1 });
    fireEvent.pointerMove(handle, { clientX: 440, pointerId: 1 });
    fireEvent.pointerUp(handle, { clientX: 440, pointerId: 1 });
    expect(handle).toHaveAttribute("aria-valuenow", "260");
    unmount();
  });
});

describe("DataGrid — ảo hoá", () => {
  const many: Person[] = Array.from({ length: 10000 }, (_, i) => ({ id: "p" + i, name: "Người " + i, age: i % 90 }));

  it("chỉ render cửa sổ hàng, aria-rowcount / aria-rowindex đúng, cuộn cập nhật cửa sổ", () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(440);
    const { getByRole } = render(
      <DataGrid aria-label="Nhiều" virtualized height={440} items={many} columns={columns} getRowId={(p) => p.id} />,
    );
    const grid = getByRole("grid");
    expect(grid).toHaveAttribute("aria-rowcount", "10001");
    const rows = () => within(grid).getAllByRole("row").slice(1);
    expect(rows().length).toBeLessThan(40);
    expect(rows()[0]).toHaveAttribute("aria-rowindex", "2");

    grid.scrollTop = 44 * 5000;
    fireEvent.scroll(grid);
    const indexes = rows().map((r) => Number(r.getAttribute("aria-rowindex")));
    expect(rows().length).toBeLessThan(40);
    expect(indexes).toContain(5002);
    expect(Math.min(...indexes)).toBeGreaterThan(4900);
  });

  it("Ctrl+End cuộn tới và focus hàng cuối", async () => {
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(440);
    const user = userEvent.setup();
    const { getByRole } = render(
      <DataGrid aria-label="Nhiều" virtualized height={440} items={many} columns={columns} getRowId={(p) => p.id} />,
    );
    const grid = getByRole("grid");
    grid.querySelector<HTMLElement>('[data-row-index="1"] [data-col-index="0"]')!.focus();
    await user.keyboard("{Control>}{End}{/Control}");
    const last = grid.querySelector('[data-row-index="10000"] [data-col-index="1"]');
    expect(last).toHaveFocus();
    expect(last?.closest('[role="row"]')).toHaveAttribute("aria-rowindex", "10001");
    expect(grid.scrollTop).toBeGreaterThan(0);
  });
});

describe("DataGrid — trạng thái", () => {
  it("rỗng → Empty mặc định", () => {
    const { getByText } = render(<DataGrid aria-label="Trống" items={[] as Person[]} columns={columns} getRowId={(p) => p.id} />);
    expect(getByText("Không có dữ liệu")).toBeInTheDocument();
  });

  it("loading → aria-busy, khung xương chỉ hiện sau 300ms", () => {
    vi.useFakeTimers();
    const { getByRole, rerender } = render(
      <DataGrid aria-label="Tải" loading items={[] as Person[]} columns={columns} getRowId={(p) => p.id} />,
    );
    const grid = getByRole("grid");
    expect(grid).toHaveAttribute("aria-busy", "true");
    expect(grid.querySelector(".invisible")).not.toBeNull();
    expect(grid.textContent).not.toContain("Không có dữ liệu");
    act(() => {
      vi.advanceTimersByTime(300);
    });
    expect(grid.querySelector(".invisible")).toBeNull();
    expect(grid.querySelectorAll('[aria-hidden="true"].grid').length).toBe(5);
    rerender(<DataGrid aria-label="Tải" items={people} columns={columns} getRowId={(p) => p.id} />);
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(grid).not.toHaveAttribute("aria-busy");
    expect(within(grid).getAllByRole("row")).toHaveLength(5);
  });
});
