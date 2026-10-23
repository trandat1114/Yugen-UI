import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { YugenProvider } from "../YugenProvider/YugenProvider";
import { Rating, RatingDisplay, ratingMessagesEn } from "./Rating";

describe("Rating messages", () => {
  it("định dạng số theo locale của provider (mặc định vi-VN)", () => {
    render(<RatingDisplay value={4.5} count={1280} />);
    expect(screen.getByRole("img")).toHaveAccessibleName("Đánh giá 4,5 trên 5 sao, 1.280 lượt");
  });

  it("ratingMessagesEn + locale en-US", () => {
    render(
      <YugenProvider locale="en-US" messages={{ rating: ratingMessagesEn }}>
        <RatingDisplay value={4.5} count={1280} />
        <Rating max={2} />
      </YugenProvider>,
    );
    expect(screen.getByRole("img")).toHaveAccessibleName("Rated 4.5 out of 5 stars, 1,280 ratings");
    expect(screen.getByRole("radio", { name: "1 star" })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "2 stars" })).toBeInTheDocument();
  });
});
