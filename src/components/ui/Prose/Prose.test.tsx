import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Prose } from "./Prose";

describe("Prose", () => {
  it("adds the yugen-prose utility and the base text size", () => {
    render(
      <Prose data-testid="prose">
        <h2>Cài đặt</h2>
      </Prose>,
    );
    expect(screen.getByTestId("prose")).toHaveClass("yugen-prose", "text-body1");
  });

  it("renders into its child with asChild and switches the base size", () => {
    render(
      <Prose asChild size="large">
        <article data-testid="article">
          <p>Đoạn văn</p>
        </article>
      </Prose>,
    );
    const article = screen.getByTestId("article");
    expect(article.tagName).toBe("ARTICLE");
    expect(article).toHaveClass("text-body2");
  });
});
