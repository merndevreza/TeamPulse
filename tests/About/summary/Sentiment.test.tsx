import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import Sentiment from "@/components/About/summary/Sentiment";
import { UserMostDotSummary } from "@/app/actions/api/types";

const makeUser = (overrides: Partial<UserMostDotSummary>): UserMostDotSummary => ({
  id: 1,
  email: "u@example.com",
  first_name: "Test",
  last_name: "User",
  full_name: "Test User",
  total_dots: 0,
  thumbs_up_count: 0,
  ok_count: 0,
  loop_count: 0,
  is_active: true,
  ...overrides,
});

const renderAndGetCountNodes = (user: UserMostDotSummary) => {
  const { container } = render(<Sentiment user={user} />);
  // Sentiment count <p> nodes are the ones inside the second flex div containing numbers
  return container.querySelectorAll("div.w-\\[10\\.6vw\\] p");
};

describe("Sentiment", () => {
  test("renders name and all three sentiments when counts > 0", () => {
    const user = makeUser({ first_name: "Alice", last_name: "R", thumbs_up_count: 5, ok_count: 3, loop_count: 1 });
    const nodes = renderAndGetCountNodes(user);
    expect(screen.getByText("Alice R")).toBeInTheDocument();
    expect(screen.getByTestId("user-sentiment-thumbs_up")).toHaveTextContent("5");
    expect(screen.getByTestId("user-sentiment-ok")).toHaveTextContent("3");
    expect(screen.getByTestId("user-sentiment-loop")).toHaveTextContent("1");
    expect(nodes.length).toBe(3);
  });

  test("shows okay count as 0 in sentiment when okay_count is 0", () => {
    const user = makeUser({ first_name: "Bob", last_name: "S", thumbs_up_count: 4, ok_count: 0, loop_count: 2 });
    const nodes = renderAndGetCountNodes(user);
    expect(screen.getByText("Bob S")).toBeInTheDocument();
    expect(screen.getByTestId("user-sentiment-thumbs_up")).toHaveTextContent("4");
    expect(screen.getByTestId("user-sentiment-ok")).toHaveTextContent("0");
    expect(screen.getByTestId("user-sentiment-loop")).toHaveTextContent("2");
    expect(nodes.length).toBe(3);
  });
});
