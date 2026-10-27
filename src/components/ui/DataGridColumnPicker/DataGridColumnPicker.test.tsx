import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { createColumn, DataGrid, type DataGridSortState } from "../DataGrid/DataGrid";
import { dataGridMessagesEn } from "../DataGrid/messages";
import { Toolbar } from "../Toolbar/Toolbar";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { DataGridColumnPicker } from "./DataGridColumnPicker";

type Person = { id: string; name: string; age: number };

const people: Person[] = [
  { id: "a", name: "An", age: 30 },
  { id: "b", name: "Bình", age: 25 },
];

const columns = [
  createColumn<Person>({ columnId: "name", label: "Tên", renderCell: (p) => p.name, hideable: false }),
  createColumn<Person>({ columnId: "age", label: "Tuổi", renderCell: (p) => p.age, compare: (a, b) => a.age - b.age }),
  createColumn<Person>({ columnId: "code", label: "Mã", renderCell: (p) => p.id }),
];

function Harness({
  initial = [],
  sortState,
  onChange,
}: {
  initial?: string[];
  sortState?: DataGridSortState;
  onChange?: (hidden: Set<string>) => void;
}) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(initial));
  return (
    <YugenProvider>
      <DataGridColumnPicker
        columns={columns}
        hiddenColumns={hidden}
        onHiddenColumnsChange={(_, data) => {
          setHidden(data.hiddenColumns);
          onChange?.(data.hiddenColumns);
        }}
        sortState={sortState}
      />
      <DataGrid aria-label="Người" items={people} columns={columns} getRowId={(p) => p.id} hiddenColumns={hidden} />
    </YugenProvider>
  );
}

// Menu mở là modal: phần còn lại của trang bị aria-hidden, nên truy vấn lưới với hidden: true.
const headers = () =>
  within(screen.getByRole("grid", { hidden: true }))
    .getAllByRole("columnheader", { hidden: true })
    .map((h) => h.textContent);

describe("DataGridColumnPicker", () => {
  it("tích / bỏ tích ẩn hiện cột trên lưới, menu vẫn mở để chọn tiếp", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));

    const age = screen.getByRole("menuitemcheckbox", { name: "Tuổi" });
    expect(age).toHaveAttribute("aria-checked", "true");
    await user.click(age);
    expect(onChange).toHaveBeenLastCalledWith(new Set(["age"]));
    expect(headers()).toEqual(["Tên", "Mã"]);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(age).toHaveAttribute("aria-checked", "false");

    await user.click(screen.getByRole("menuitemcheckbox", { name: "Mã" }));
    expect(headers()).toEqual(["Tên"]);
  });

  it("Space trên mục cũng giữ menu mở", async () => {
    const user = userEvent.setup();
    render(<Harness />);
    screen.getByRole("button", { name: "Cột" }).focus();
    await user.keyboard("{Enter}");
    const age = screen.getByRole("menuitemcheckbox", { name: "Tuổi" });
    age.focus();
    await user.keyboard(" ");
    expect(headers()).toEqual(["Tên", "Mã"]);
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("khoá cột hideable: false và cột hiện cuối cùng", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["age", "code"]} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    const name = screen.getByRole("menuitemcheckbox", { name: "Tên" });
    expect(name).toHaveAttribute("aria-checked", "true");
    expect(name).toHaveAttribute("aria-disabled", "true");
  });

  it("số cột đang ẩn là mô tả của nút; Hiện tất cả cột chỉ bật khi có cột ẩn", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["age"]} />);
    const button = screen.getByRole("button", { name: "Cột" });
    expect(button).toHaveAccessibleDescription("1 cột đang ẩn");
    await user.click(button);
    const showAll = screen.getByRole("menuitem", { name: "Hiện tất cả cột" });
    await user.click(showAll);
    expect(headers()).toEqual(["Tên", "Tuổi", "Mã"]);
    expect(showAll).toHaveAttribute("aria-disabled", "true");
    expect(button).not.toHaveAccessibleDescription();
  });

  it("đánh dấu cột đang sắp xếp, kể cả khi cột bị ẩn", async () => {
    const user = userEvent.setup();
    render(<Harness initial={["age"]} sortState={{ sortColumn: "age", sortDirection: "ascending" }} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    expect(screen.getByRole("menuitemcheckbox", { name: "Tuổi (tăng dần)" })).toHaveAttribute("aria-checked", "false");
  });

  it("trong Toolbar tự thành mục của Toolbar", () => {
    render(
      <Toolbar aria-label="Bảng">
        <DataGridColumnPicker columns={columns} hiddenColumns={new Set()} onHiddenColumnsChange={() => {}} />
      </Toolbar>,
    );
    expect(screen.getByRole("button", { name: "Cột" })).toHaveAttribute("data-toolbar-item", "");
  });

  it("messages tiếng Anh", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider messages={{ dataGrid: dataGridMessagesEn }}>
        <DataGridColumnPicker columns={columns} hiddenColumns={new Set(["age", "code"])} onHiddenColumnsChange={() => {}} />
      </YugenProvider>,
    );
    const button = screen.getByRole("button", { name: "Columns" });
    expect(button).toHaveAccessibleDescription("2 columns hidden");
    await user.click(button);
    expect(screen.getByRole("menuitem", { name: "Show all columns" })).toBeInTheDocument();
  });
});
