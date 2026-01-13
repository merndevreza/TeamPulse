import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import TopSummary from "@/components/About/summary/TopSummary";
import { UserDotsSummary } from "@/app/actions/api/types";

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

describe("TopSummary", () => {
  test("renders counts and truncated dates", () => {
    const summary = makeSummary({
      total_dots_received: 42,
      total_dots_given: 17,
      last_dot_received: "2024-05-21T12:34:56Z",
      last_dot_given: "2024-06-01T09:00:00Z",
    });
    render(<TopSummary userDotsSummary={summary} />);

    expect(screen.getByText("Dots Received")).toBeInTheDocument();
    expect(screen.getByText("Dots Given")).toBeInTheDocument();
    expect(screen.getByText("Last Dot Received")).toBeInTheDocument();
    expect(screen.getByText("Last Dot Given")).toBeInTheDocument();

    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("17")).toBeInTheDocument();
    expect(screen.getByText("2024-05-21")).toBeInTheDocument();
    expect(screen.getByText("2024-06-01")).toBeInTheDocument();
  });

  test("falls back to N/A when dates missing", () => {
    const summary = makeSummary({
      total_dots_received: 3,
      total_dots_given: 5,
      last_dot_received: "",
      last_dot_given: "",
    });
    render(<TopSummary userDotsSummary={summary} />);

    // Two N/A entries (received & given dates)
    const naNodes = screen.getAllByText("N/A");
    expect(naNodes).toHaveLength(2);
  });
});
