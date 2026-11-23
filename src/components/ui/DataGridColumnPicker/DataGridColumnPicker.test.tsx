import { describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { installMatchMedia, setMediaQueries } from "@/test/matchMedia";
import { createColumn, DataGrid, getOrderedColumns, type DataGridSortState } from "../DataGrid/DataGrid";
import { dataGridMessagesEn } from "../DataGrid/messages";
import { Toolbar } from "../Toolbar/Toolbar";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { DataGridColumnPicker, type DataGridColumnPickerProps } from "./DataGridColumnPicker";

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

  it("onColumnOrderChange: Alt + ↓ đổi thứ tự cột trên lưới, focus ở lại mục, menu vẫn mở", async () => {
    const user = userEvent.setup();
    const onOrder = vi.fn();
    function Ordered() {
      const [order, setOrder] = useState<string[]>([]);
      return (
        <YugenProvider>
          <DataGridColumnPicker
            columns={columns}
            hiddenColumns={new Set()}
            onHiddenColumnsChange={() => {}}
            columnOrder={order}
            onColumnOrderChange={(_, data) => {
              setOrder(data.columnOrder);
              onOrder(data.columnOrder);
            }}
          />
          <DataGrid aria-label="Người" items={people} columns={columns} getRowId={(p) => p.id} columnOrder={order} />
        </YugenProvider>
      );
    }
    render(<Ordered />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    const name = screen.getByRole("menuitemcheckbox", { name: "Tên" });
    expect(name).toHaveAttribute("aria-keyshortcuts", "Alt+ArrowUp Alt+ArrowDown");
    name.focus();
    await user.keyboard("{Alt>}{ArrowDown}{/Alt}");
    expect(onOrder).toHaveBeenLastCalledWith(["age", "name", "code"]);
    expect(headers()).toEqual(["Tuổi", "Tên", "Mã"]);
    expect(screen.getAllByRole("menuitemcheckbox").map((i) => i.textContent)).toEqual(["Tuổi", "Tên", "Mã"]);
    expect(screen.getByRole("menuitemcheckbox", { name: "Tên" })).toHaveFocus();
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("getOrderedColumns: id lạ bị bỏ, cột thiếu đứng sau, không đổi thì giữ tham chiếu", () => {
    expect(getOrderedColumns(columns, ["code", "x", "name"]).map((c) => c.columnId)).toEqual(["code", "name", "age"]);
    expect(getOrderedColumns(columns, ["name", "age"])).toBe(columns);
    expect(getOrderedColumns(columns, undefined)).toBe(columns);
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

type PickerOptions = Pick<
  DataGridColumnPickerProps<(typeof columns)[number]>,
  "compact" | "mode" | "resettable" | "sortState" | "children"
>;

/** Picker + lưới dùng chung cột ẩn và thứ tự cột; `reorder` bật kéo đổi thứ tự. */
function Enterprise({
  initialHidden = [],
  initialOrder = [],
  reorder = false,
  onHidden,
  onOrder,
  ...options
}: PickerOptions & {
  initialHidden?: string[];
  initialOrder?: string[];
  reorder?: boolean;
  onHidden?: (hidden: Set<string>) => void;
  onOrder?: (order: string[]) => void;
}) {
  const [hidden, setHidden] = useState<ReadonlySet<string>>(() => new Set(initialHidden));
  const [order, setOrder] = useState<string[]>(initialOrder);
  return (
    <>
      <DataGridColumnPicker
        columns={columns}
        hiddenColumns={hidden}
        onHiddenColumnsChange={(_, data) => {
          setHidden(data.hiddenColumns);
          onHidden?.(data.hiddenColumns);
        }}
        columnOrder={order}
        onColumnOrderChange={
          reorder
            ? (_, data) => {
                setOrder(data.columnOrder);
                onOrder?.(data.columnOrder);
              }
            : undefined
        }
        {...options}
      />
      <DataGrid aria-label="Người" items={people} columns={columns} getRowId={(p) => p.id} hiddenColumns={hidden} columnOrder={order} />
    </>
  );
}

const WIDE = { "min-width: 48rem": true };

describe("DataGridColumnPicker — bảng dày đặc (#413)", () => {
  it("compact: nhãn chỉ còn cho trình đọc màn hình, số cột ẩn vẫn thấy và là mô tả", () => {
    render(<Enterprise compact initialHidden={["age", "code"]} />);
    const button = screen.getByRole("button", { name: "Cột" });
    expect(button).toHaveAccessibleDescription("2 cột đang ẩn");
    expect(within(button).getByText("Cột")).toHaveClass("sr-only");
    expect(within(button).getByText("2")).toBeVisible();
    expect(button).toHaveClass("min-w-0");
  });

  it("cột hideable: false nhận focus, có mô tả lý do và không bỏ tích được", async () => {
    const user = userEvent.setup();
    const onHidden = vi.fn();
    render(<Enterprise onHidden={onHidden} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    const name = screen.getByRole("menuitemcheckbox", { name: "Tên" });
    expect(name).toHaveAttribute("aria-disabled", "true");
    expect(name).not.toHaveAttribute("data-disabled");
    expect(name).toHaveAccessibleDescription("Luôn hiện");
    await user.keyboard("{ArrowDown}");
    expect(name).toHaveFocus();
    await user.keyboard(" ");
    await user.click(name);
    expect(onHidden).not.toHaveBeenCalled();
    expect(name).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("menuitemcheckbox", { name: "Tuổi" })).not.toHaveAccessibleDescription();
  });

  it("resettable: Đặt lại cột về trạng thái mặc định, tắt khi đã ở mặc định", async () => {
    const user = userEvent.setup();
    const onHidden = vi.fn();
    const onOrder = vi.fn();
    render(
      <Enterprise
        reorder
        resettable={{ hiddenColumns: ["code"] }}
        initialHidden={["age"]}
        initialOrder={["code", "name", "age"]}
        onHidden={onHidden}
        onOrder={onOrder}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Cột" }));
    const reset = screen.getByRole("menuitem", { name: "Đặt lại cột" });
    expect(reset).not.toHaveAttribute("aria-disabled");
    await user.click(reset);
    expect(onHidden).toHaveBeenLastCalledWith(new Set(["code"]));
    expect(onOrder).toHaveBeenLastCalledWith([]);
    expect(headers()).toEqual(["Tên", "Tuổi"]);
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(reset).toHaveAttribute("aria-disabled", "true");
  });

  it("resettable={true}: mặc định là mọi cột hiện; không có onColumnOrderChange thì chỉ xét cột ẩn", async () => {
    const user = userEvent.setup();
    render(<Enterprise resettable initialOrder={["code", "name", "age"]} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    expect(screen.getByRole("menuitem", { name: "Đặt lại cột" })).toHaveAttribute("aria-disabled", "true");
    await user.click(screen.getByRole("menuitemcheckbox", { name: "Tuổi" }));
    await user.click(screen.getByRole("menuitem", { name: "Đặt lại cột" }));
    expect(headers()).toEqual(["Mã", "Tên", "Tuổi"]);
  });

  it("mode auto: menu khi màn hình rộng, Sheet khi hẹp hơn breakpoint", async () => {
    const user = userEvent.setup();
    // Mỗi matchMedia mới: useMediaQuery bỏ MediaQueryList đã cache từ các test trước.
    installMatchMedia();
    setMediaQueries(WIDE);
    const { unmount } = render(<Enterprise mode="auto" />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    unmount();

    setMediaQueries({});
    render(<Enterprise mode="auto" />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Cột" })).toBeInTheDocument();
  });

  it("Sheet: tích ẩn / hiện cột, cột bắt buộc có lý do, Hiện tất cả cột và Đóng", async () => {
    const user = userEvent.setup();
    render(<Enterprise mode="sheet" resettable sortState={{ sortColumn: "age", sortDirection: "descending" }} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    const sheet = screen.getByRole("dialog", { name: "Cột" });
    const group = within(sheet).getByRole("group", { name: "Cột" });

    const name = within(group).getByRole("checkbox", { name: "Tên" });
    expect(name).toBeChecked();
    expect(name).toBeDisabled();
    expect(name).toHaveAccessibleDescription("Luôn hiện");

    await user.click(within(group).getByRole("checkbox", { name: "Tuổi (giảm dần)" }));
    expect(headers()).toEqual(["Tên", "Mã"]);
    expect(screen.getByRole("button", { name: "Cột", hidden: true })).toHaveAccessibleDescription("1 cột đang ẩn");

    await user.click(within(sheet).getByRole("button", { name: "Hiện tất cả cột" }));
    expect(headers()).toEqual(["Tên", "Tuổi", "Mã"]);
    expect(within(sheet).getByRole("button", { name: "Hiện tất cả cột" })).toBeDisabled();
    expect(within(sheet).getByRole("button", { name: "Đặt lại cột" })).toBeDisabled();

    await user.click(within(sheet).getByRole("button", { name: "Đóng" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("Sheet: tay nắm nhìn thấy được, đổi thứ tự bằng Space + mũi tên, focus ở lại tay nắm", async () => {
    const user = userEvent.setup();
    const onOrder = vi.fn();
    render(<Enterprise mode="sheet" reorder onOrder={onOrder} />);
    await user.click(screen.getByRole("button", { name: "Cột" }));
    const handle = screen.getByRole("button", { name: "Sắp xếp lại Tên" });
    handle.focus();
    await user.keyboard(" {ArrowDown} ");
    expect(onOrder).toHaveBeenLastCalledWith(["age", "name", "code"]);
    expect(headers()).toEqual(["Tuổi", "Tên", "Mã"]);
    expect(screen.getByRole("button", { name: "Sắp xếp lại Tên" })).toHaveFocus();
    expect(screen.getAllByRole<HTMLInputElement>("checkbox").map((c) => c.labels?.[0]?.textContent)).toEqual(["Tuổi", "Tên", "Mã"]);
  });

  it("messages tiếng Anh cho phần mới", async () => {
    const user = userEvent.setup();
    render(
      <YugenProvider messages={{ dataGrid: dataGridMessagesEn }}>
        <Enterprise mode="sheet" resettable />
      </YugenProvider>,
    );
    await user.click(screen.getByRole("button", { name: "Columns" }));
    const sheet = screen.getByRole("dialog", { name: "Columns" });
    expect(within(sheet).getByRole("checkbox", { name: "Tên" })).toHaveAccessibleDescription("Always shown");
    expect(within(sheet).getByRole("button", { name: "Reset columns" })).toBeInTheDocument();
    expect(within(sheet).getByRole("button", { name: "Close" })).toBeInTheDocument();
  });
});
