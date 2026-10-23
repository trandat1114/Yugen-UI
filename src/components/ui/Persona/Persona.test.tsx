import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
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
