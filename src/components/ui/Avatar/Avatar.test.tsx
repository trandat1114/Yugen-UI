import { afterEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { Avatar, type AvatarImageRenderProps } from "./Avatar";

describe("Avatar", () => {
  it("role img với tên đầy đủ; chữ viết tắt aria-hidden", async () => {
    render(<Avatar name="Nguyễn Văn An" />);
    const avatar = screen.getByRole("img", { name: "Nguyễn Văn An" });
    const initials = await screen.findByText("NA");
    expect(avatar).toContainElement(initials);
    expect(initials).toHaveAttribute("aria-hidden", "true");
  });

  it("chữ viết tắt: một từ lấy 2 ký tự đầu; tên rỗng không có chữ", async () => {
    const { rerender } = render(<Avatar name="linh" />);
    expect(await screen.findByText("LI")).toBeInTheDocument();
    rerender(<Avatar name="   " />);
    expect(screen.getByRole("img").textContent).toBe("");
  });

  it("size / shape / color; className lên khung tròn", () => {
    const { container } = render(<Avatar name="An" size={64} shape="square" color="brand" className="ring-2" />);
    const root = container.querySelector(".ring-2");
    expect(root).toHaveClass("size-16", "rounded-medium", "bg-brand-background");
  });

  it("color colorful: màu ổn định theo tên", () => {
    const { container, rerender } = render(<Avatar name="Trần Bình" color="colorful" />);
    const first = container.querySelector('[role="img"] > span')!.className;
    rerender(<Avatar name="Trần Bình" color="colorful" />);
    expect(container.querySelector('[role="img"] > span')!.className).toBe(first);
    expect(first).toMatch(/bg-(cranberry|marigold|teal|lavender|forest|steel)-bg/);
  });

  it("presence: chấm trạng thái theo màu, nhỏ hơn với avatar cỡ 20/24", () => {
    const { container, rerender } = render(<Avatar name="An" presence="available" />);
    const dot = () => container.querySelector('[role="img"] > span:last-child')!;
    expect(dot()).toHaveClass("bg-success-background-3", "size-3");
    rerender(<Avatar name="An" presence="busy" size={24} />);
    expect(dot()).toHaveClass("bg-danger-background-3", "size-2");
    rerender(<Avatar name="An" presence="offline" />);
    expect(dot()).toHaveClass("ring-foreground-3");
  });

  describe("image", () => {
    const img = (container: HTMLElement) => container.querySelector("img");

    it("passes the image options to the <img>; the name stays on the wrapper", () => {
      const { container } = render(
        <Avatar
          name="Alex Chen"
          src="/alex.png"
          image={{ srcSet: "/alex.png 1x, /alex@2x.png 2x", loading: "lazy", crossOrigin: "anonymous", referrerPolicy: "no-referrer" }}
        />,
      );
      expect(img(container)).toHaveAttribute("src", "/alex.png");
      expect(img(container)).toHaveAttribute("alt", "");
      expect(img(container)).toHaveAttribute("srcset", "/alex.png 1x, /alex@2x.png 2x");
      expect(img(container)).toHaveAttribute("loading", "lazy");
      expect(img(container)).toHaveAttribute("crossorigin", "anonymous");
      expect(img(container)).toHaveAttribute("referrerpolicy", "no-referrer");
      expect(screen.getByRole("img", { name: "Alex Chen" })).toContainElement(img(container));
    });

    it("shows the initials when the image fails, hides them once it loads", () => {
      const onStatus = vi.fn();
      const { container, rerender } = render(
        <Avatar name="Alex Chen" src="/broken.png" fallbackDelay={0} onLoadingStatusChange={onStatus} />,
      );
      expect(onStatus).toHaveBeenLastCalledWith("loading");
      fireEvent.error(img(container)!);
      expect(img(container)).toBeNull();
      expect(screen.getByText("AC")).toBeInTheDocument();
      expect(onStatus).toHaveBeenLastCalledWith("error");

      rerender(<Avatar name="Alex Chen" src="/alex.png" fallbackDelay={0} onLoadingStatusChange={onStatus} />);
      expect(onStatus).toHaveBeenLastCalledWith("loading");
      fireEvent.load(img(container)!);
      expect(screen.queryByText("AC")).toBeNull();
      expect(onStatus).toHaveBeenLastCalledWith("loaded");
    });

    it("waits fallbackDelay before showing the initials while the image loads", () => {
      vi.useFakeTimers();
      try {
        render(<Avatar name="Alex Chen" src="/slow.png" fallbackDelay={250} />);
        expect(screen.queryByText("AC")).toBeNull();
        act(() => vi.advanceTimersByTime(250));
        expect(screen.getByText("AC")).toBeInTheDocument();
      } finally {
        vi.useRealTimers();
      }
    });

    it("renderImage renders another component with the same props and fallback", () => {
      const received: AvatarImageRenderProps[] = [];
      const FrameworkImage = (props: AvatarImageRenderProps & { width: number }) => (
        <img data-framework="" {...props} />
      );
      const { container } = render(
        <Avatar
          name="Alex Chen"
          src="/alex.png"
          fallbackDelay={0}
          image={{ sizes: "40px" }}
          renderImage={(props) => {
            received.push(props);
            return <FrameworkImage {...props} width={40} />;
          }}
        />,
      );
      expect(img(container)).toHaveAttribute("data-framework");
      expect(received.at(-1)).toMatchObject({ src: "/alex.png", alt: "", sizes: "40px" });
      fireEvent.error(img(container)!);
      expect(img(container)).toBeNull();
      expect(screen.getByText("AC")).toBeInTheDocument();
    });

    describe("loaded before hydration (complete is already true)", () => {
      const proto = HTMLImageElement.prototype;
      const decodeBefore = Object.getOwnPropertyDescriptor(proto, "decode");
      function mockImage(naturalWidth: number, decode?: () => Promise<void>) {
        vi.spyOn(proto, "complete", "get").mockReturnValue(true);
        vi.spyOn(proto, "naturalWidth", "get").mockReturnValue(naturalWidth);
        Object.defineProperty(proto, "decode", { configurable: true, writable: true, value: decode });
      }
      afterEach(() => {
        vi.restoreAllMocks();
        if (decodeBefore) Object.defineProperty(proto, "decode", decodeBefore);
        else delete (proto as { decode?: unknown }).decode;
      });

      it("a decoded image counts as loaded", () => {
        mockImage(96);
        const onStatus = vi.fn();
        render(<Avatar name="Alex Chen" src="/alex.png" fallbackDelay={0} onLoadingStatusChange={onStatus} />);
        expect(onStatus).toHaveBeenLastCalledWith("loaded");
        expect(screen.queryByText("AC")).toBeNull();
      });

      it("naturalWidth 0: decode() decides (an SVG without a size loads, a broken image fails)", async () => {
        mockImage(0, () => Promise.resolve());
        const onStatus = vi.fn();
        const { unmount } = render(<Avatar name="Alex Chen" src="/logo.svg" onLoadingStatusChange={onStatus} />);
        await waitFor(() => expect(onStatus).toHaveBeenLastCalledWith("loaded"));
        unmount();

        mockImage(0, () => Promise.reject(new Error("EncodingError")));
        const { container } = render(<Avatar name="Alex Chen" src="/broken.png" onLoadingStatusChange={onStatus} />);
        await waitFor(() => expect(onStatus).toHaveBeenLastCalledWith("error"));
        expect(container.querySelector("img")).toBeNull();
        expect(screen.getByText("AC")).toBeInTheDocument();
      });

      it("naturalWidth 0 without decode(): error", () => {
        mockImage(0, undefined);
        delete (proto as { decode?: unknown }).decode;
        render(<Avatar name="Alex Chen" src="/broken.png" />);
        expect(screen.getByText("AC")).toBeInTheDocument();
      });
    });

    it("no src: initials at once and no status callback", () => {
      const onStatus = vi.fn();
      const { container } = render(<Avatar name="Alex Chen" onLoadingStatusChange={onStatus} />);
      expect(img(container)).toBeNull();
      expect(screen.getByText("AC")).toBeInTheDocument();
      expect(onStatus).not.toHaveBeenCalled();
    });
  });
});
