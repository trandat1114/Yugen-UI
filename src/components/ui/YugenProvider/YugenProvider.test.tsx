import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider, useYugen } from "./YugenProvider";
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
