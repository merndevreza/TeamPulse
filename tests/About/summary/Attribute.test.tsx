import React from "react";
import { render, screen } from "@testing-library/react";
import Attribute from "@/components/About/summary/Attribute";
import { AttributeSummary } from "@/app/actions/api/types";
import { describe, test, expect } from "vitest";

const makeAttribute = (
  overrides: Partial<AttributeSummary>
): AttributeSummary => ({
  label_text: "Ownership",
  category_name: "Culture",
  total_count: 0,
  thumbs_up_count: 0,
  ok_count: 0,
  loop_count: 0,
  ...overrides,
});

describe("Attribute", () => {
  test("renders all three sentiments when all counts > 0", () => {
    const attr = makeAttribute({
      total_count: 10,
      thumbs_up_count: 5,
      loop_count: 2,
    });
    render(<Attribute attribute={attr} />);

    expect(screen.getByText("Ownership")).toBeInTheDocument();
    // Counts present
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    // Three sentiment <p> nodes
    const sentimentParas = screen.getAllByText(/^\d+$/);
    expect(sentimentParas).toHaveLength(3);
  });

  test("shows 0 thumbs_up when thumbs_up_count is zero", () => {
    const attr = makeAttribute({
      total_count: 5,
      thumbs_up_count: 0,
      loop_count: 2,
      // ok = 3
    });
    render(<Attribute attribute={attr} />);

    expect(
      screen.getByTestId("attribute-sentiment-thumbs_up")
    ).toHaveTextContent("0"); // ok
    expect(screen.getByTestId("attribute-sentiment-ok")).toHaveTextContent("3"); // ok
    expect(screen.getByTestId("attribute-sentiment-loop")).toHaveTextContent(
      "2"
    ); // loop
  });
});
