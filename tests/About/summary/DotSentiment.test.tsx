import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import DotSentiments from "@/components/About/summary/DotSentiments";
import { UserDotsSummary, UserMostDotSummary } from "@/app/actions/api/types";

const makeUser = (overrides: Partial<UserMostDotSummary>): UserMostDotSummary => ({
  id: 1,
  email: "a@example.com",
  first_name: "Ann",
  last_name: "Lee",
  full_name: "Ann Lee",
  total_dots: 5,
  thumbs_up_count: 3,
  ok_count: 1,
  loop_count: 1,
  is_active: true,
  ...overrides,
});

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

describe("DotSentiments", () => {
  test("renders both sections when both have users", () => {
    const summary = makeSummary({
      most_dots_received_from: [makeUser({ id: 1, first_name: "Alice", last_name: "L", full_name: "Alice L" })],
      most_dots_given_to: [makeUser({ id: 2, first_name: "Bob", last_name: "S", full_name: "Bob S" })],
    });
    render(<DotSentiments userDotsSummary={summary} />);
    expect(screen.getByText(/Most dots received from/i)).toBeInTheDocument();
    expect(screen.getByText(/Most dots given to/i)).toBeInTheDocument();
    expect(screen.getByText("Alice L")).toBeInTheDocument();
    expect(screen.getByText("Bob S")).toBeInTheDocument();
    expect(screen.getAllByText("Sentiment")).toHaveLength(2);
  });

  test("renders only received section", () => {
    const summary = makeSummary({
      most_dots_received_from: [makeUser({ id: 3, first_name: "Carol", last_name: "T", full_name: "Carol T" })],
      most_dots_given_to: [],
    });
    render(<DotSentiments userDotsSummary={summary} />);
    expect(screen.getByText(/Most dots received from/i)).toBeInTheDocument();
    expect(screen.queryByText(/Most dots given to/i)).toBeNull();
    expect(screen.getByText("Carol T")).toBeInTheDocument();
    expect(screen.getAllByText("Sentiment")).toHaveLength(1);
  });

  test("renders only given section", () => {
    const summary = makeSummary({
      most_dots_received_from: [],
      most_dots_given_to: [makeUser({ id: 4, first_name: "Dan", last_name: "Q", full_name: "Dan Q" })],
    });
    render(<DotSentiments userDotsSummary={summary} />);
    expect(screen.getByText(/Most dots given to/i)).toBeInTheDocument();
    expect(screen.queryByText(/Most dots received from/i)).toBeNull();
    expect(screen.getByText("Dan Q")).toBeInTheDocument();
    expect(screen.getAllByText("Sentiment")).toHaveLength(1);
  });

  test("renders no sections when array empty", () => {
    const summary = makeSummary({});
    render(<DotSentiments userDotsSummary={summary} />);
    expect(screen.queryByText(/Most dots received from/i)).toBeNull();
    expect(screen.queryByText(/Most dots given to/i)).toBeNull();
  });
});
