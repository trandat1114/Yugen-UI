import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { AvatarGroup, AvatarGroupItem, avatarGroupMessagesVi, type AvatarGroupProps } from "./AvatarGroup";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

const NAMES = ["An", "Bình", "Chi", "Dũng", "Em", "Giang", "Hà"];

function Team({ count = 7, ...props }: Partial<AvatarGroupProps> & { count?: number; ref?: React.Ref<HTMLDivElement> }) {
  return (
    <AvatarGroup aria-label="Nhóm dự án" {...props}>
      {NAMES.slice(0, count).map((name) => (
        <AvatarGroupItem key={name} name={name} />
      ))}
    </AvatarGroup>
  );
}

describe("AvatarGroup", () => {
  it("group; ref + className; spread mặc định: tối đa 5 ô gồm nút +N", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(<Team ref={ref} className="me-2" />);
    const group = screen.getByRole("group", { name: "Nhóm dự án" });
    expect(ref.current).toBe(group);
    expect(group).toHaveClass("me-2", "gap-1");
    expect(within(group).getAllByRole("img")).toHaveLength(4);
    // Số đếm hiển thị nằm trong tên nút (WCAG 2.5.3).
    expect(screen.getByRole("button", { name: /^\+3/ })).toHaveTextContent("+3 Xem thêm 3 thành viên");
  });

  it("nút +N mở danh sách đầy đủ các thành viên bị ẩn", async () => {
    const user = userEvent.setup();
    render(<Team />);
    await user.click(screen.getByRole("button", { name: /^\+3/ }));
    const list = await screen.findByRole("list", { name: "Danh sách thành viên" });
    expect(within(list).getAllByRole("listitem").map((li) => li.lastElementChild?.textContent)).toEqual(["Em", "Giang", "Hà"]);
  });

  it("không vượt maxAvatars: không có nút tràn; stack chồng lên nhau với viền nền", () => {
    render(<Team count={3} layout="stack" size={48} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    const group = screen.getByRole("group");
    expect(group).toHaveClass("[&>*+*]:-ms-2");
    expect(group.querySelector(".ring-2")).not.toBeNull();
  });

  it("overflowIndicator icon: nút … có aria-label; overflowLabel ghi đè", () => {
    const { rerender } = render(<Team maxAvatars={3} overflowIndicator="icon" />);
    expect(screen.getByRole("button", { name: "Xem thêm 5 thành viên" })).toBeInTheDocument();
    rerender(<Team maxAvatars={3} overflowIndicator="icon" overflowLabel="Mọi người" />);
    expect(screen.getByRole("button", { name: "Mọi người" })).toBeInTheDocument();
  });

  it("pie: tối đa 3 ô ghép trong một nút, tên nút từ chữ ẩn; mở popover liệt kê tất cả", async () => {
    const user = userEvent.setup();
    render(<Team count={4} layout="pie" />);
    const button = screen.getByRole("button", { name: "Xem 4 thành viên" });
    expect(button).toHaveClass("grid-cols-2", "grid-rows-2");
    expect(button.querySelectorAll('span[aria-hidden="true"] [role="img"]')).toHaveLength(3);
    await user.click(button);
    expect(within(await screen.findByRole("list")).getAllByRole("listitem")).toHaveLength(4);
  });

  it("chuỗi có sẵn: tiếng Anh mặc định (số ít / số nhiều), tiếng Việt qua avatarGroupMessagesVi", () => {
    const { unmount } = renderBare(<Team count={6} />);
    expect(screen.getByRole("button", { name: /^\+2/ })).toHaveTextContent("View 2 more members");
    unmount();
    const pie = renderBare(<Team count={1} layout="pie" />);
    expect(screen.getByRole("button", { name: "View 1 member" })).toBeInTheDocument();
    pie.unmount();
    renderBare(
      <YugenProvider messages={{ avatarGroup: avatarGroupMessagesVi }}>
        <Team count={2} layout="pie" />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Xem 2 thành viên" })).toBeInTheDocument();
  });
});
