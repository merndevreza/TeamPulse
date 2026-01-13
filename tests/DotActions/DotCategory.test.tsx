/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import DotCategory from "@/components/DotActions/DotCategory";

type SelectedDot = {
  label_id: number;
  label: string;
  dot_type: string;
  categoryName: string;
};

function Host({ category }: { category: any }) {
  const [selected, setSelected] = useState<SelectedDot[]>([]);
  return (
    <>
      <DotCategory
        category={category}
        selectedDots={selected}
        setSelectedDots={setSelected}
        type="give"
      />
      <pre data-testid="state">{JSON.stringify(selected)}</pre>
    </>
  );
}

const baseCategory = {
  id: 1,
  name: "Teamwork",
  labels: [
    { id: 101, label: "Collaboration" },
    { id: 102, label: "Support" },
    { id: 103, label: "Initiative" },
    { id: 104, label: "Quality" },
    { id: 105, label: "Ownership" },
    { id: 106, label: "Creativity" },
  ],
};

function getState(): SelectedDot[] {
  return JSON.parse(screen.getByTestId("state").textContent || "[]");
}

describe("DotCategory", () => {
  it("renders category name and labels", () => {
    render(<Host category={baseCategory} />);
    expect(screen.getByText("Teamwork")).toBeInTheDocument();
    expect(screen.getByText("Collaboration")).toBeInTheDocument();
    expect(screen.getByText("Creativity")).toBeInTheDocument();
  });

  it("selects a label with thumbs_up", () => {
    render(<Host category={baseCategory} />);
    fireEvent.click(screen.getByTestId("select-101-thumbs_up"));
    const state = getState();
    expect(state).toHaveLength(1);
    expect(state[0]).toMatchObject({
      label_id: 101,
      label: "Collaboration",
      dot_type: "thumbs_up",
      categoryName: "Teamwork",
    });
  });

  it("updates existing label type instead of duplicating", () => {
    render(<Host category={baseCategory} />);
    fireEvent.click(screen.getByTestId("select-101-thumbs_up"));
    fireEvent.click(screen.getByTestId("select-101-ok"));
    const state = getState();
    expect(state).toHaveLength(1);
    expect(state[0].dot_type).toBe("ok");
  });

  it("applies max 5 selection constraint (drops 5th when adding 6th)", () => {
    render(<Host category={baseCategory} />);
    // Select first 6 labels
    baseCategory.labels.forEach((l) =>
      fireEvent.click(screen.getByTestId(`select-${l.id}-thumbs_up`))
    );
    const state = getState();
    expect(state).toHaveLength(5);
    const labels = state.map((d) => d.label);
    // First four kept, 5th (Ownership) replaced by 6th (Creativity)
    expect(labels).toEqual([
      "Collaboration",
      "Support",
      "Initiative",
      "Quality",
      "Creativity",
    ]);
    expect(labels).not.toContain("Ownership");
  });
});
