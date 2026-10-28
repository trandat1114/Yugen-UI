import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { DescriptionItem, DescriptionList } from "./DescriptionList";
import { descriptionListMessagesEn } from "./messages";

describe("DescriptionList", () => {
  afterEach(() => vi.restoreAllMocks());

  it("pairs each label with its value in a dl", () => {
    const { container } = render(
      <DescriptionList columns={2}>
        <DescriptionItem label="Mã đơn">DH-2041</DescriptionItem>
        <DescriptionItem label="Ngày đặt">28/10/2026</DescriptionItem>
      </DescriptionList>,
    );
    const dl = container.querySelector("dl")!;
    expect(dl.style.gridTemplateColumns).toContain("repeat(auto-fill");
    expect([...dl.querySelectorAll("dt")].map((dt) => dt.textContent)).toEqual(["Mã đơn", "Ngày đặt"]);
    expect([...dl.querySelectorAll("dd")].map((dd) => dd.textContent)).toEqual(["DH-2041", "28/10/2026"]);
  });

  it("copies the shown value, or the given string", async () => {
    const user = userEvent.setup();
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue();
    render(
      <DescriptionList>
        <DescriptionItem label="Mã đơn" copyable>
          DH-2041
        </DescriptionItem>
        <DescriptionItem label="Email" copyable="an@example.com">
          <a href="mailto:an@example.com">Gửi email</a>
        </DescriptionItem>
      </DescriptionList>,
    );
    await user.click(screen.getByRole("button", { name: "Sao chép Mã đơn" }));
    expect(writeText).toHaveBeenLastCalledWith("DH-2041");
    expect(screen.getAllByRole("status").some((s) => s.textContent === "Đã sao chép vào bộ nhớ tạm")).toBe(true);
    await user.click(screen.getByRole("button", { name: "Sao chép Email" }));
    expect(writeText).toHaveBeenLastCalledWith("an@example.com");
  });

  it("reads its strings from YugenProvider", () => {
    render(
      <YugenProvider messages={{ descriptionList: descriptionListMessagesEn }}>
        <DescriptionList layout="inline">
          <DescriptionItem label="Order" copyable>
            #2041
          </DescriptionItem>
        </DescriptionList>
      </YugenProvider>,
    );
    expect(screen.getByRole("button", { name: "Copy Order" })).toBeInTheDocument();
  });
});
