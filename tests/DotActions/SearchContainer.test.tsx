/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import SearchContainer from "@/components/DotActions/SearchContainer";

vi.mock("@/components/Search/Search", () => ({
  DotsSearch: () => <div data-testid="DotsSearch">DotsSearch</div>,
}));

describe("SearchContainer", () => {
  it("renders search component", () => {
    render(<SearchContainer selectedDots={[]} />);
    expect(screen.getByTestId("DotsSearch")).toBeInTheDocument();
  });

  it("shows correct count text", () => {
    render(
      <SearchContainer
        selectedDots={[
          { label_id: 1, label: "A", dot_type: "ok", categoryName: "Cat" } as any,
          { label_id: 2, label: "B", dot_type: "loop", categoryName: "Cat" } as any,
        ]}
      />
    );
    expect(screen.getByText("2 / 5 (max) selected")).toBeInTheDocument();
  });
});
