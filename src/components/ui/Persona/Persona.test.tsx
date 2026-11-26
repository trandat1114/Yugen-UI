import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { PresenceBadge, presenceBadgeMessagesEn } from "../PresenceBadge/PresenceBadge";
import { Persona } from "./Persona";

describe("Persona / PresenceBadge messages", () => {
  it("mặc định tiếng Việt", () => {
    render(<PresenceBadge status="busy" outOfOffice />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Bận, không ở văn phòng");
  });

  it("Persona dùng chung namespace presenceBadge", () => {
    render(
      <YugenProvider messages={{ presenceBadge: presenceBadgeMessagesEn }}>
        <Persona name="An" presence="busy" presenceOnly />
        <PresenceBadge status="available" outOfOffice />
      </YugenProvider>,
    );
    expect(screen.getByRole("img", { name: "Busy" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Available, out of office" })).toBeInTheDocument();
  });
});

describe("Persona avatars", () => {
  const team = [{ name: "Alex Chen" }, { name: "Maria Garcia" }, { name: "Sam Lee" }, { name: "Priya Patel" }, { name: "Jordan Kim" }];

  it("renders an AvatarGroup named by primaryText, with a +N button past maxAvatars", () => {
    render(<Persona avatars={team} primaryText="Alex Chen, Maria Garcia and 3 others" secondaryText="Design review" />);
    const group = screen.getByRole("group", { name: "Alex Chen, Maria Garcia and 3 others" });
    expect(within(group).getAllByRole("img").map((el) => el.getAttribute("aria-label"))).toEqual(["Alex Chen", "Maria Garcia"]);
    expect(within(group).getByRole("button")).toHaveTextContent("+3");
  });

  it("names the group by the people when the primary text is not a string", () => {
    render(<Persona avatars={team.slice(0, 2)} primaryText={<b>Pair</b>} maxAvatars={5} />);
    expect(screen.getByRole("group", { name: "Alex Chen, Maria Garcia" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("uses the Persona size for every avatar and supports the pie layout", () => {
    const { container, rerender } = render(<Persona size="large" avatars={team.slice(0, 2)} name="Pair" />);
    expect(container.querySelectorAll(".size-10")).toHaveLength(2);
    rerender(<Persona size="large" avatarLayout="pie" avatars={team.slice(0, 3)} name="Trio" />);
    expect(within(screen.getByRole("group", { name: "Trio" })).getByRole("button")).toHaveClass("size-10");
  });

  it("keeps avatar and avatars apart in the types", () => {
    render(
      <>
        {/* @ts-expect-error a Persona takes one avatar or several, not both */}
        <Persona name="A" avatar={{ color: "brand" }} avatars={team} />
        {/* @ts-expect-error presence belongs to a single avatar */}
        <Persona name="B" avatars={team} presence="busy" />
      </>,
    );
    expect(screen.getAllByRole("group")).toHaveLength(2);
  });
});
