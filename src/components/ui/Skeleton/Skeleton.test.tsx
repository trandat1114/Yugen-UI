import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import {
  Skeleton,
  SkeletonAvatar,
  SkeletonCard,
  SkeletonItem,
  SkeletonList,
  SkeletonTable,
  SkeletonText,
  skeletonMessagesVi,
} from "./Skeleton";

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

const items = (root: HTMLElement) => Array.from(root.querySelectorAll<HTMLElement>('[aria-hidden="true"]'));

describe("Skeleton", () => {
  it("role progressbar + aria-busy; item aria-hidden; ref + className", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <Skeleton ref={ref} className="w-80">
        <SkeletonItem />
        <SkeletonItem shape="circle" size={40} />
        <SkeletonItem shape="square" size={24} />
      </Skeleton>,
    );
    const root = screen.getByRole("progressbar", { name: "Đang tải nội dung" });
    expect(ref.current).toBe(root);
    expect(root).toHaveAttribute("aria-busy", "true");
    expect(root).toHaveClass("w-80");
    const [rect, circle, square] = items(root);
    expect(rect).toHaveClass("w-full", "h-4", "after:animate-sweep");
    expect(circle).toHaveClass("rounded-circular", "size-10");
    expect(square).toHaveClass("rounded-medium", "size-6");
  });

  it("animation / appearance của Skeleton áp cho item con; item ghi đè được", () => {
    render(
      <Skeleton animation="pulse" appearance="translucent">
        <SkeletonItem data-testid="a" />
        <SkeletonItem data-testid="b" animation="wave" appearance="opaque" />
      </Skeleton>,
    );
    expect(screen.getByTestId("a")).toHaveClass("animate-pulse", "opacity-50");
    expect(screen.getByTestId("b")).toHaveClass("after:animate-sweep");
    expect(screen.getByTestId("b")).not.toHaveClass("opacity-50");
  });

  it("nhãn: tiếng Anh mặc định, tiếng Việt qua skeletonMessagesVi", () => {
    const { unmount } = renderBare(<Skeleton />);
    expect(screen.getByRole("progressbar", { name: "Loading content" })).toBeInTheDocument();
    unmount();
    renderBare(
      <YugenProvider messages={{ skeleton: skeletonMessagesVi }}>
        <SkeletonText />
      </YugenProvider>,
    );
    expect(screen.getByRole("progressbar", { name: "Đang tải nội dung" })).toBeInTheDocument();
  });
});

describe("Skeleton presets", () => {
  it("đứng riêng là một progressbar; lồng trong Skeleton thì không lặp role", () => {
    const { unmount } = render(<SkeletonAvatar size={48} shape="square" />);
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
    unmount();
    render(
      <Skeleton animation="pulse">
        <SkeletonAvatar />
        <SkeletonText lines={2} />
      </Skeleton>,
    );
    expect(screen.getAllByRole("progressbar")).toHaveLength(1);
    // Kế thừa animation của Skeleton cha.
    expect(items(screen.getByRole("progressbar"))[0]).toHaveClass("animate-pulse");
  });

  it("SkeletonText: n dòng, dòng cuối ngắn hơn; ít nhất một dòng; size", () => {
    const { rerender } = render(<SkeletonText lines={4} size="large" />);
    const lines = () => items(screen.getByRole("progressbar"));
    expect(lines()).toHaveLength(4);
    expect(lines()[3]).toHaveClass("w-3/5", "h-5");
    expect(lines()[0]).not.toHaveClass("w-3/5");
    rerender(<SkeletonText lines={0} />);
    expect(lines()).toHaveLength(1);
    expect(lines()[0]).not.toHaveClass("w-3/5");
  });

  it("SkeletonCard: header + ảnh + tiêu đề + mô tả + nút; tắt từng phần", () => {
    const { rerender } = render(<SkeletonCard header lines={3} actions={1} />);
    const root = () => screen.getByRole("progressbar");
    expect(root()).toHaveClass("shadow-4", "rounded-medium");
    // header: avatar + 2 dòng; ảnh; tiêu đề; 3 dòng; 1 nút.
    expect(items(root())).toHaveLength(3 + 1 + 1 + 3 + 1);
    expect(root().querySelector(".aspect-video")).not.toBeNull();
    rerender(<SkeletonCard media={false} lines={0} actions={0} />);
    expect(items(root())).toHaveLength(1);
  });

  it("SkeletonList: mỗi dòng avatar + 2 dòng chữ", () => {
    render(<SkeletonList rows={2} avatarSize={32} avatarShape="square" />);
    const all = items(screen.getByRole("progressbar"));
    expect(all).toHaveLength(6);
    expect(all[0]).toHaveClass("size-8", "rounded-medium");
  });

  it("SkeletonTable: rows × columns (+ dòng tiêu đề), lưới theo số cột", () => {
    const { container, rerender } = render(<SkeletonTable rows={2} columns={3} />);
    expect(items(screen.getByRole("progressbar"))).toHaveLength(9);
    expect(container.querySelector<HTMLElement>(".grid")!.style.gridTemplateColumns).toBe("repeat(3, minmax(0, 1fr))");
    rerender(<SkeletonTable rows={1} columns={0} header={false} />);
    expect(items(screen.getByRole("progressbar"))).toHaveLength(1);
  });
});
