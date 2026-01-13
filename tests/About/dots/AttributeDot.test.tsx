import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, test, expect } from "vitest";
import AttributeDot from "@/components/About/dots/AttributeDot";
import { DotCategory, DotDetail } from "@/app/actions/api/types";

const allDots: DotCategory[] = [
  {
    id: 1,
    name: "Category One",
    labels: [
      { id: 101, label: "Collaboration" },
      { id: 102, label: "Quality" },
    ],
  },
  {
    id: 2,
    name: "Category Two",
    labels: [{ id: 201, label: "Efficiency" }],
  },
];

const makeDetail = (overrides: Partial<DotDetail>) =>
  ({
    id: 1,
    label_id: 101,
    dot_type_name: "thumbs_up",
    ...overrides,
  } as DotDetail);

describe("AttributeDot", () => {
  test("renders thumbs_up icon and label", () => {
    render(
      <AttributeDot
        dot_type_name="thumbs_up"
        dot={makeDetail({ label_id: 101, dot_type_name: "thumbs_up" })}
        allDots={allDots}
      />
    );
    expect(screen.getByTestId("icon-thumbs_up")).toBeInTheDocument();
    expect(screen.getByText("Collaboration")).toBeInTheDocument();
  });

  test("renders ok icon and correct label", () => {
    render(
      <AttributeDot
        dot_type_name="ok"
        dot={makeDetail({ label_id: 102, dot_type_name: "ok" })}
        allDots={allDots}
      />
    );
    expect(screen.getByTestId("icon-ok")).toBeInTheDocument();
    expect(screen.getByText("Quality")).toBeInTheDocument();
  });

  test("renders loop icon and correct label", () => {
    render(
      <AttributeDot
        dot_type_name="loop"
        dot={makeDetail({ label_id: 201, dot_type_name: "loop" })}
        allDots={allDots}
      />
    );
    expect(screen.getByTestId("icon-loop")).toBeInTheDocument();
    expect(screen.getByText("Efficiency")).toBeInTheDocument();
  });

  test("does not render label text if label id not found", () => {
    render(
      <AttributeDot
        dot_type_name="thumbs_up"
        dot={makeDetail({ label_id: 999 })}
        allDots={allDots}
      />
    );
    expect(screen.getByTestId("icon-thumbs_up")).toBeInTheDocument();
    expect(screen.queryByText("Collaboration")).toBeNull();
    expect(screen.queryByText("Quality")).toBeNull();
    expect(screen.queryByText("Efficiency")).toBeNull();
  });
});
