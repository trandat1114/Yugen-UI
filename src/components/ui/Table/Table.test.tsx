import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Table,
  TableBody,
  TableCell,
  TableCellActions,
  TableCellLayout,
  TableHeader,
  TableHeaderCell,
  TableRow,
  TableSelectionCell,
  tableMessagesVi,
  type TableProps,
} from "./Table";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

function Files(
  props: TableProps & { ref?: React.Ref<HTMLTableElement>; onSort?: () => void; onSelect?: (checked: boolean) => void },
) {
  const { onSort, onSelect, ...table } = props;
  return (
    <Table aria-label="Tệp" {...table}>
      <TableHeader>
        <TableRow>
          <TableSelectionCell checked="mixed" onCheckedChange={onSelect} />
          <TableHeaderCell sortDirection="ascending" onClick={onSort}>
            Tên
          </TableHeaderCell>
          <TableHeaderCell sortable={false}>Cỡ</TableHeaderCell>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow selected>
          <TableSelectionCell checked onCheckedChange={onSelect} />
          <TableCell>
            <TableCellLayout media={<svg data-testid="media" />} description="Sửa hôm qua" appearance="primary" truncate>
              Báo cáo.docx
            </TableCellLayout>
            <TableCellActions>
              <button>Chia sẻ</button>
            </TableCellActions>
          </TableCell>
          <TableCell>12 KB</TableCell>
        </TableRow>
        <TableRow appearance="neutral">
          <TableSelectionCell subtle />
          <TableCell>Ảnh.png</TableCell>
          <TableCell>2 MB</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}

describe("Table", () => {
  it("cấu trúc bảng: columnheader / row / cell; ref + className; cỡ medium", () => {
    const ref = { current: null as HTMLTableElement | null };
    render(<Files ref={ref} className="min-w-120" />);
    const table = screen.getByRole("table", { name: "Tệp" });
    expect(ref.current).toBe(table);
    expect(table).toHaveClass("min-w-120", "text-body1", "table-fixed");
    expect(screen.getAllByRole("columnheader")).toHaveLength(3);
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getAllByRole("row")[1]).toHaveClass("h-11");
    expect(screen.getByRole("columnheader", { name: "Cỡ" })).toHaveAttribute("scope", "col");
  });

  it("sortable: cột thành nút trong th có aria-sort; sortable={false} giữ chữ thường", async () => {
    const user = userEvent.setup();
    const onSort = vi.fn();
    render(<Files sortable onSort={onSort} />);
    const name = screen.getByRole("columnheader", { name: "Tên" });
    expect(name).toHaveAttribute("aria-sort", "ascending");
    await user.click(within(name).getByRole("button", { name: "Tên" }));
    expect(onSort).toHaveBeenCalledTimes(1);
    expect(name.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    const size = screen.getByRole("columnheader", { name: "Cỡ" });
    expect(size).not.toHaveAttribute("aria-sort");
    expect(within(size).queryByRole("button")).not.toBeInTheDocument();
  });

  it("cột sortable chưa sắp xếp: aria-sort none, không có icon", () => {
    render(
      <Table size="extra-small">
        <TableHeader>
          <TableRow>
            <TableHeaderCell sortable>Ngày</TableHeaderCell>
          </TableRow>
        </TableHeader>
      </Table>,
    );
    const header = screen.getByRole("columnheader", { name: "Ngày" });
    expect(header).toHaveAttribute("aria-sort", "none");
    expect(header.querySelector("svg")).toBeNull();
    expect(screen.getByRole("table")).toHaveClass("text-caption1");
    expect(screen.getByRole("row")).toHaveClass("h-6", "border-stroke-2");
  });

  it("hàng: selected = brand, appearance neutral; hàng tiêu đề không có hover", () => {
    render(<Files size="small" />);
    const [header, first, second] = screen.getAllByRole("row");
    expect(header).not.toHaveClass("hover:bg-subtle-hover");
    expect(first).toHaveAttribute("data-selected", "true");
    expect(first).toHaveClass("bg-brand-background-2", "h-8.5");
    expect(second).toHaveClass("bg-subtle-pressed");
  });

  it("TableSelectionCell: checkbox có nhãn, mixed ở tiêu đề, báo onCheckedChange dạng boolean; subtle ẩn khi chưa chọn", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    render(<Files onSelect={onSelect} />);
    const all = screen.getByRole("checkbox", { name: "Chọn tất cả hàng" });
    expect(all).toBePartiallyChecked();
    expect(all.closest("th")).not.toBeNull();
    const rows = screen.getAllByRole("checkbox", { name: "Chọn hàng" });
    expect(rows[0]).toBeChecked();
    await user.click(rows[0]);
    expect(onSelect).toHaveBeenLastCalledWith(false);
    await user.click(all);
    expect(onSelect).toHaveBeenLastCalledWith(true);
    expect(rows[1].closest("td")).toHaveClass("opacity-0");
  });

  it("TableCellLayout + TableCellActions", () => {
    render(<Files />);
    expect(screen.getByTestId("media")).toBeInTheDocument();
    expect(screen.getByText("Báo cáo.docx")).toHaveClass("font-semibold", "truncate");
    expect(screen.getByText("Sửa hôm qua")).toHaveClass("text-caption1", "truncate");
    expect(screen.getByRole("button", { name: "Chia sẻ" }).parentElement).toHaveClass("opacity-0", "group-hover/row:opacity-100");
  });

  it("nhãn checkbox: tiếng Anh mặc định, tiếng Việt qua tableMessagesVi, aria-label riêng thắng", () => {
    const { unmount } = renderBare(<Files />);
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox", { name: "Select row" })).toHaveLength(2);
    unmount();
    renderBare(
      <YugenProvider messages={{ table: tableMessagesVi }}>
        <Table>
          <TableBody>
            <TableRow>
              <TableSelectionCell />
              <TableSelectionCell aria-label="Chọn Báo cáo" />
            </TableRow>
          </TableBody>
        </Table>
      </YugenProvider>,
    );
    expect(screen.getByRole("checkbox", { name: "Chọn hàng" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: "Chọn Báo cáo" })).toBeInTheDocument();
  });
});
