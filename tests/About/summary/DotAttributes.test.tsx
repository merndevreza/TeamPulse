import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import DotAttributes from "@/components/About/summary/DotAttributes";
import { AttributeSummary, UserDotsSummary } from "@/app/actions/api/types";

// Helper to build AttributeSummary
const makeAttr = (overrides: Partial<AttributeSummary>): AttributeSummary => ({
  label_text: "Ownership",
  category_name: "Culture",
  total_count: 5,
  thumbs_up_count: 2,
  ok_count: 2,
  loop_count: 1,
  ...overrides,
});

// Minimal full UserDotsSummary builder
const makeSummary = (overrides: Partial<UserDotsSummary>): UserDotsSummary => ({
  total_dots_given: 0,
  total_dots_received: 0,
  dots_given_by_type: {},
  dots_received_by_type: {},
  last_dot_given: "",
  last_dot_received: "",
  most_dots_received_from: [],
  most_dots_given_to: [],
  top_attributes_received: [],
  top_attributes_given: [],
  dots_received_details: [],
  dots_given_details: [],
  ...overrides,
});

describe("DotAttributes", () => {
  test("renders both RECEIVED and GIVEN sections with attributes", () => {
    const summary = makeSummary({
      top_attributes_received: [
        makeAttr({ label_text: "Ownership", thumbs_up_count: 3, total_count: 7, loop_count: 2 }),
      ],
      top_attributes_given: [
        makeAttr({ label_text: "Collaboration", thumbs_up_count: 4, total_count: 6, loop_count: 1 }),
      ],
    });

    render(<DotAttributes userDotsSummary={summary} />);

    expect(screen.getByText(/Top attributes RECEIVED/i)).toBeInTheDocument();
    expect(screen.getByText(/Top attributes GIVEN/i)).toBeInTheDocument();
    expect(screen.getByText("Ownership")).toBeInTheDocument();
    expect(screen.getByText("Collaboration")).toBeInTheDocument();
    expect(screen.getAllByText("Sentiment")).toHaveLength(2);
  });

  test("renders only RECEIVED section when GIVEN empty", () => {
    const summary = makeSummary({
      top_attributes_received: [makeAttr({ label_text: "Impact" })],
      top_attributes_given: [],
    });
    render(<DotAttributes userDotsSummary={summary} />);

    expect(screen.getByText(/Top attributes RECEIVED/i)).toBeInTheDocument();
    expect(screen.queryByText(/Top attributes GIVEN/i)).toBeNull();
    expect(screen.getByText("Impact")).toBeInTheDocument();
    expect(screen.getAllByText("Sentiment")).toHaveLength(1);
  });

  test("renders only GIVEN section when RECEIVED empty", () => {
    const summary = makeSummary({
      top_attributes_received: [],
      top_attributes_given: [makeAttr({ label_text: "Velocity" })],
    });
    render(<DotAttributes userDotsSummary={summary} />);

    expect(screen.getByText(/Top attributes GIVEN/i)).toBeInTheDocument();
    expect(screen.queryByText(/Top attributes RECEIVED/i)).toBeNull();
    expect(screen.getByText("Velocity")).toBeInTheDocument();
    expect(screen.getAllByText("Sentiment")).toHaveLength(1);
  });

  test("renders container with no sections when both arrays empty", () => {
    const summary = makeSummary({
      top_attributes_received: [],
      top_attributes_given: [],
    });
    render(<DotAttributes userDotsSummary={summary} />);

    expect(screen.queryByText(/Top attributes RECEIVED/i)).toBeNull();
    expect(screen.queryByText(/Top attributes GIVEN/i)).toBeNull();
    // Container div present (role not defined, so just sanity check by absence of titles)
  });
});
