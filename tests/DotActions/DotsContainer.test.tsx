/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import DotsContainer from "@/components/DotActions/DotsContainer";

const propStore: Record<string, any> = {};
function record(name: string, props: any) {
  propStore[name] = props;
  return <div data-testid={name}>{name}</div>;
}

// Mock DotCategory to capture props
vi.mock("@/components/DotActions/DotCategory", () => ({
  __esModule: true,
  default: (props: any) => record("DotCategory", props),
}));

// Mock DotsContext
const setAllDotsMock = vi.fn();
const filteredDotsStub = [
  {
    id: 1,
    name: "Cat A",
    labels: [{ id: 11, label: "L1" }],
  },
  {
    id: 2,
    name: "Cat B",
    labels: [{ id: 21, label: "L2" }],
  },
];

vi.mock("@/app/contexts/DotsContext", () => ({
  useDots: () => ({
    filteredDots: filteredDotsStub,
    setAllDots: setAllDotsMock,
  }),
}));

const allDotsProp = [
  {
    id: 100,
    name: "Original",
    labels: [{ id: 999, label: "Orig" }],
  },
];

type SelectedDot = {
  label_id: number;
  label: string;
  dot_type: string;
  categoryName: string;
};

function Host({
  mode = "give",
  initialSelected = [] as SelectedDot[],
}: {
  mode?: "give" | "edit";
  initialSelected?: SelectedDot[];
}) {
  const [selected, setSelected] = useState<SelectedDot[]>(initialSelected);
  return (
    <DotsContainer
      allDots={allDotsProp as any}
      selectedDots={selected}
      setSelectedDots={setSelected}
      type={mode}
    />
  );
}

beforeEach(() => {
  setAllDotsMock.mockClear();
  for (const k of Object.keys(propStore)) delete propStore[k];
});

describe("DotsContainer", () => {
  it("calls setAllDots with provided allDots (effect)", async () => {
    render(<Host />);
    await waitFor(() => {
      expect(setAllDotsMock).toHaveBeenCalledWith(allDotsProp);
    });
  });

  it("renders one DotCategory per filteredDots entry", () => {
    render(<Host />);
    const items = screen.getAllByTestId("DotCategory");
    expect(items).toHaveLength(filteredDotsStub.length);
  });

  it("passes empty selectedDots to DotCategory in give mode", () => {
    const preset: SelectedDot[] = [];
    render(<Host mode="give" initialSelected={preset} />);
    // Last captured DotCategory props
    expect(propStore.DotCategory.selectedDots).toEqual([]); // give mode forces empty
  });

  it("passes through selectedDots in edit mode", () => {
    const preset: SelectedDot[] = [
      {
        label_id: 21,
        label: "L2",
        dot_type: "ok",
        categoryName: "Cat B",
      },
    ];
    render(<Host mode="edit" initialSelected={preset} />);
    expect(propStore.DotCategory.selectedDots).toEqual(preset);
  });
});
