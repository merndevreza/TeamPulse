/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { render, screen } from "@testing-library/react";
import Attribute from "@/components/About/dots/Attribute";
import { test, expect, describe } from "vitest";

const baseDot = {
  id: 10,
  giver_name: "Alice Giver",
  receiver_name: "Bob Receiver",
  giver_id: 1,
  receiver_id: 2,
  comment: "Great collaboration on the project.",
  created_at: "2024-01-15T13:45:00Z",
};

const makeDetails = () => ([
  { id: 1, label_id: 11, dot_type_name: "thumbs_up" },
  { id: 2, label_id: 12, dot_type_name: "thumbs_up" },
  { id: 3, label_id: 13, dot_type_name: "ok" },
  { id: 4, label_id: 14, dot_type_name: "loop" },
  { id: 5, label_id: 15, dot_type_name: "loop" },
  { id: 6, label_id: 16, dot_type_name: "loop" },
]);

const buildDot = (overrides: any = {}) => ({
  ...baseDot,
  details: makeDetails(),
  ...overrides,
});

describe("Attribute component", () => {
  const allDots: any[] = [];

  test("renders receiver name and edit link when type=given", () => {
    render(<Attribute type="given" dot={buildDot()} allDots={allDots} />);
    expect(screen.getByText("Bob Receiver")).toBeInTheDocument();
    expect(screen.getByTestId("edit-link")).toBeInTheDocument();
  });

  test("renders giver name and hides edit link when type=received", () => {
    render(<Attribute type="received" dot={buildDot()} allDots={allDots} />);
    expect(screen.getByText("Alice Giver")).toBeInTheDocument();
    expect(screen.queryByTestId("edit-link")).toBeNull();
  });

  test("renders comment text", () => {
    render(<Attribute type="given" dot={buildDot()} allDots={allDots} />);
    expect(screen.getByText("Great collaboration on the project.")).toBeInTheDocument();
  });

  test("aggregates and displays sentiment counts correctly", () => {
    render(<Attribute type="given" dot={buildDot()} allDots={allDots} />);
    expect(screen.getByTestId("sentiment-thumbs_up")).toHaveTextContent("2");
    expect(screen.getByTestId("sentiment-ok")).toHaveTextContent("1");
    expect(screen.getByTestId("sentiment-loop")).toHaveTextContent("3");
  });
});
