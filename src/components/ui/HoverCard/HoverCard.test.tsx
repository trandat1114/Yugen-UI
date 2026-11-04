import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./HoverCard";

function Demo(props: Partial<React.ComponentProps<typeof HoverCardContent>>) {
  return (
    <HoverCard openDelay={0} closeDelay={0}>
      <HoverCardTrigger href="/u/an">@an</HoverCardTrigger>
      <HoverCardContent data-testid="card" {...props}>
        Nguyễn An — Kỹ sư
      </HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  it("rê chuột vào trigger mở thẻ; rời ra thì đóng", async () => {
    const user = userEvent.setup();
    render(<Demo className="w-64" />);
    expect(screen.queryByTestId("card")).not.toBeInTheDocument();
    await user.hover(screen.getByRole("link", { name: "@an" }));
    const card = await screen.findByTestId("card");
    expect(card).toHaveTextContent("Nguyễn An — Kỹ sư");
    expect(card).toHaveClass("w-64", "p-4", "shadow-16");
    await user.unhover(screen.getByRole("link", { name: "@an" }));
    await waitFor(() => expect(screen.queryByTestId("card")).not.toBeInTheDocument());
  });

  it("focus bàn phím vào trigger cũng mở thẻ", async () => {
    const user = userEvent.setup();
    render(<Demo />);
    await user.tab();
    expect(await screen.findByTestId("card")).toBeInTheDocument();
  });

  it("withArrow; ref tới bề mặt; dir + theme của provider lồng", async () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <YugenProvider dir="rtl" theme="dark">
        <HoverCard open>
          <HoverCardTrigger href="#">Mở</HoverCardTrigger>
          <HoverCardContent ref={ref} withArrow data-testid="card">
            Thẻ
          </HoverCardContent>
        </HoverCard>
      </YugenProvider>,
    );
    const card = await screen.findByTestId("card");
    expect(ref.current).toBe(card);
    expect(card).toHaveAttribute("dir", "rtl");
    expect(card).toHaveAttribute("data-theme", "dark");
    expect(card.querySelector("svg")).toHaveClass("fill-background-1");
  });
});
