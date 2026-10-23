import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider, useYugen } from "./YugenProvider";
import { Dialog, DialogSurface, DialogTitle } from "../Dialog/Dialog";
import { messagesEn } from "../messages-en";
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

function Locale() {
  return <span data-testid="locale">{useYugen().locale}</span>;
}

describe("YugenProvider messages", () => {
  it("giữ chuỗi tiếng Việt mặc định khi không có provider", () => {
    render(<OpenDialog />);
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

  it("locale mặc định vi-VN và provider lồng kế thừa locale của provider ngoài", () => {
    const { rerender } = render(<Locale />);
    expect(screen.getByTestId("locale")).toHaveTextContent("vi-VN");
    rerender(
      <YugenProvider locale="en-US">
        <YugenProvider>
          <Locale />
        </YugenProvider>
      </YugenProvider>,
    );
    expect(screen.getByTestId("locale")).toHaveTextContent("en-US");
  });

  it("messagesEn không còn chữ tiếng Việt", () => {
    const VI = /[ăâđêôơưạảấầẩẫậắằẳẵặẹẻẽếềểễệỉịọỏốồổỗộớờởỡợụủứừửữựỳỵỷỹ]/i;
    for (const [namespace, messages] of Object.entries(messagesEn)) {
      for (const [key, value] of Object.entries(messages as Record<string, unknown>)) {
        expect(VI.test(String(value)), `${namespace}.${key}`).toBe(false);
      }
    }
  });

  it("gói xuất mọi messages.ts và messagesEn gom đủ bản tiếng Anh", () => {
    const namespaces: string[] = [];
    for (const [file, mod] of Object.entries(MESSAGE_MODULES)) {
      for (const [name, value] of Object.entries(mod)) {
        expect(ui, `${file}: ${name}`).toHaveProperty(name, value);
        const ns = name.match(/^(\w+)MessagesEn$/)?.[1];
        if (ns) {
          namespaces.push(ns);
          expect((messagesEn as unknown as Record<string, unknown>)[ns], ns).toBe(value);
        }
      }
    }
    expect(Object.keys(messagesEn).sort()).toEqual(namespaces.sort());
  });
});
