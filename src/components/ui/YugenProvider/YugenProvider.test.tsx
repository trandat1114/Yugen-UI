import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider, glassNavigationDefaults, useYugen } from "./YugenProvider";
import { YugenContext } from "./context";
import { Button } from "../Button/Button";
import { Input } from "../Input/Input";
import { Nav } from "../Nav/Nav";
import { Tabs, TabsList, TabsTrigger } from "../Tabs/Tabs";
import { Toolbar } from "../Toolbar/Toolbar";
import { Dialog, DialogSurface, DialogTitle } from "../Dialog/Dialog";
import { messagesEn } from "../messages-en";
import { messagesVi } from "../messages-vi";
import * as ui from "../index";

const MESSAGE_MODULES = import.meta.glob<Record<string, unknown>>("../*/messages.ts", { eager: true });

function OpenDialog() {
  return (
    <Dialog open>
      <DialogSurface aria-describedby={undefined}>
        <DialogTitle>Tiêu đề</DialogTitle>
      </DialogSurface>
    </Dialog>
  );
}

// render gốc, không qua ngữ cảnh tiếng Việt mà src/test/setup.ts bọc quanh mọi test: kiểm tra mặc định thật.
const { render: renderBare } = await vi.importActual<typeof import("@testing-library/react")>("@testing-library/react");

function Locale() {
  return <span data-testid="locale">{useYugen().locale}</span>;
}

describe("YugenProvider messages", () => {
  it("mặc định tiếng Anh khi không có provider (#277)", () => {
    renderBare(<OpenDialog />);
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("messagesVi đổi chuỗi có sẵn sang tiếng Việt", () => {
    renderBare(
      <YugenProvider messages={messagesVi}>
        <OpenDialog />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Đóng" })).toBeInTheDocument();
  });

  it("messagesEn đổi chuỗi có sẵn sang tiếng Anh", () => {
    render(
      <YugenProvider messages={messagesEn}>
        <OpenDialog />
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Close" })).toBeInTheDocument();
  });

  it("provider lồng kế thừa và chỉ ghi đè chuỗi được truyền", () => {
    render(
      <YugenProvider messages={messagesEn}>
        <YugenProvider messages={{ dialog: { close: "Shut" } }}>
          <OpenDialog />
        </YugenProvider>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Shut" })).toBeInTheDocument();
  });

  it("prop nhãn riêng vẫn ưu tiên hơn messages", () => {
    render(
      <YugenProvider messages={messagesEn}>
        <Dialog open>
          <DialogSurface aria-describedby={undefined}>
            <DialogTitle action={<button type="button">Riêng</button>}>Tiêu đề</DialogTitle>
          </DialogSurface>
        </Dialog>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Riêng" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Close" })).toBeNull();
  });

  it("locale mặc định en-US và provider lồng kế thừa locale của provider ngoài", () => {
    const { rerender } = renderBare(<Locale />);
    expect(screen.getByTestId("locale")).toHaveTextContent("en-US");
    rerender(
      <YugenProvider locale="vi-VN">
        <YugenProvider>
          <Locale />
        </YugenProvider>
      </YugenProvider>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("vi-VN");
  });

  it("messagesEn không còn chữ tiếng Việt", () => {
    const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    for (const [namespace, messages] of Object.entries(messagesEn)) {
      for (const [key, value] of Object.entries(messages as Record<string, unknown>)) {
        expect(VI.test(String(value)), `${namespace}.${key}`).toBe(false);
      }
    }
  });

  it("gói xuất mọi messages.ts; messagesEn và messagesVi gom đủ hai bản", () => {
    const sets = { En: messagesEn, Vi: messagesVi } as const;
    const namespaces: Record<keyof typeof sets, string[]> = { En: [], Vi: [] };
    for (const [file, mod] of Object.entries(MESSAGE_MODULES)) {
      for (const [name, value] of Object.entries(mod)) {
        expect(ui, `${file}: ${name}`).toHaveProperty(name, value);
        const match = name.match(/^(\w+)Messages(En|Vi)$/);
        if (!match) continue;
        const [, ns, lang] = match as unknown as [string, string, keyof typeof sets];
        namespaces[lang].push(ns);
        expect((sets[lang] as unknown as Record<string, unknown>)[ns], `${ns} (${lang})`).toBe(value);
        // Tên không hậu tố (lỗi thời, bỏ ở 1.0) là bản tiếng Việt.
        if (lang === "Vi") expect(mod[`${ns}Messages`], ns).toBe(value);
      }
    }
    expect(Object.keys(messagesEn).sort()).toEqual(namespaces.En.sort());
    expect(Object.keys(messagesVi).sort()).toEqual(namespaces.Vi.sort());
  });
});

describe("YugenProvider defaults & density (#171)", () => {
  const button = (name: string) => screen.getByRole("button", { name });

  it("defaults áp cho mọi instance; prop của instance thắng", () => {
    render(
      <YugenProvider defaults={{ Button: { shape: "circular", size: "large" } }}>
        <Button>Mặc định</Button>
        <Button size="small">Riêng</Button>
      </YugenProvider>,
    );
    expect(button("Mặc định")).toHaveClass("rounded-circular", "h-10");
    expect(button("Riêng")).toHaveClass("rounded-circular", "h-6");
  });

  it("provider lồng gộp defaults theo từng component", () => {
    render(
      <YugenProvider defaults={{ Button: { shape: "circular" }, Input: { appearance: "filled-darker" } }}>
        <YugenProvider defaults={{ Button: { size: "small" } }}>
          <Button>Lồng</Button>
          <Input aria-label="Tìm" />
        </YugenProvider>
      </YugenProvider>,
    );
    expect(button("Lồng")).toHaveClass("rounded-circular", "h-6");
    expect(screen.getByRole("textbox", { name: "Tìm" }).parentElement).toHaveClass("bg-background-3");
  });

  it("density compact: control mặc định size small, size của instance và defaults vẫn thắng", () => {
    render(
      <YugenProvider density="compact">
        <Button>Gọn</Button>
        <Button size="large">To</Button>
        <YugenProvider defaults={{ Button: { size: "medium" } }}>
          <Button>Vừa</Button>
        </YugenProvider>
      </YugenProvider>,
    );
    expect(button("Gọn")).toHaveClass("h-6");
    expect(button("To")).toHaveClass("h-10");
    expect(button("Vừa")).toHaveClass("h-8");
  });

  it("density ghi data-density lên thẻ bao; provider lồng kế thừa, useYugen() trả về density", () => {
    function Density() {
      return <span data-testid="density">{useYugen().density}</span>;
    }
    const { container, rerender } = renderBare(<Density />);
    expect(screen.getByTestId("density")).toHaveTextContent("default");
    rerender(
      <YugenProvider density="comfortable">
        <YugenProvider>
          <Density />
        </YugenProvider>
      </YugenProvider>,
    );
    expect(screen.getByTestId("density")).toHaveTextContent("comfortable");
    expect(container.querySelectorAll("[data-density]")).toHaveLength(1);
    expect(container.querySelector("[data-density]")).toHaveAttribute("data-density", "comfortable");
  });

  it("applyToDocument ghi data-density lên <html> và gỡ khi unmount", () => {
    const { unmount } = render(<YugenProvider applyToDocument density="compact" />);
    expect(document.documentElement).toHaveAttribute("data-density", "compact");
    unmount();
    expect(document.documentElement).not.toHaveAttribute("data-density");
  });

  it("bề mặt portal của provider lồng mang data-density", () => {
    render(
      <YugenProvider density="compact">
        <OpenDialog />
      </YugenProvider>,
    );
    expect(screen.getByRole("dialog")).toHaveAttribute("data-density", "compact");
  });

  it("glassNavigationDefaults: component điều hướng thành glass, material của instance thắng (#230)", () => {
    render(
      <YugenProvider defaults={{ ...glassNavigationDefaults, Button: { shape: "circular" } }}>
        <Toolbar aria-label="Mặc định" />
        <Toolbar aria-label="Trên ảnh" material="glass-clear" />
        <Tabs defaultValue="a">
          <TabsList aria-label="Tab">
            <TabsTrigger value="a">A</TabsTrigger>
          </TabsList>
        </Tabs>
        <Nav aria-label="Điều hướng" />
        <Button>Tròn</Button>
      </YugenProvider>,
    );
    expect(screen.getByRole("toolbar", { name: "Mặc định" })).toHaveClass("glass");
    expect(screen.getByRole("toolbar", { name: "Trên ảnh" })).toHaveClass("glass-clear");
    expect(screen.getByRole("toolbar", { name: "Trên ảnh" })).not.toHaveClass("glass");
    expect(screen.getByRole("tablist", { name: "Tab" })).toHaveClass("glass");
    expect(screen.getByRole("navigation", { name: "Điều hướng" })).toHaveClass("glass");
    expect(button("Tròn")).toHaveClass("rounded-circular");
    expect(Object.keys(glassNavigationDefaults)).toEqual([
      "Toolbar",
      "TabsList",
      "Nav",
      "MenuPopover",
      "MenuSubPopover",
      "PopoverSurface",
      "TooltipContent",
      "DialogSurface",
      "DrawerSurface",
      "SheetContent",
    ]);
  });

  it("defaults viết thẳng trong JSX: provider render lại với object bằng nhau không đổi context", () => {
    const seen: unknown[] = [];
    function Probe() {
      seen.push(React.useContext(YugenContext));
      return null;
    }
    const MemoProbe = React.memo(Probe);
    const { rerender } = render(
      <YugenProvider defaults={{ Button: { size: "small" } }}>
        <MemoProbe />
      </YugenProvider>,
    );
    rerender(
      <YugenProvider defaults={{ Button: { size: "small" } }}>
        <MemoProbe />
      </YugenProvider>,
    );
    expect(seen).toHaveLength(1);
    rerender(
      <YugenProvider defaults={{ Button: { size: "large" } }}>
        <MemoProbe />
      </YugenProvider>,
    );
    expect(seen).toHaveLength(2);
  });
});
