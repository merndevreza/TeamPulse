/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import Wrapper, { SelectedDot } from "@/components/DotActions/Wrapper";
import { DotDetailedResult } from "@/app/actions/api/types";

// --- Mocks ---

// Capture props passed to each mocked child for assertions
const propStore: Record<string, any> = {};

function record(name: string, props: any) {
  propStore[name] = props;
  return <div data-testid={name}>{name}</div>;
}

vi.mock("@/components/DotActions/Header", () => ({
  __esModule: true,
  default: (props: any) => record("Header", props),
}));

vi.mock("@/components/DotActions/UserList", () => ({
  __esModule: true,
  default: (props: any) => record("UserList", props),
}));

vi.mock("@/components/DotActions/SearchContainer", () => ({
  __esModule: true,
  default: (props: any) => record("SearchContainer", props),
}));

vi.mock("@/components/DotActions/DotsContainer", () => ({
  __esModule: true,
  default: (props: any) => record("DotsContainer", props),
}));

vi.mock("@/components/DotActions/DotTextField", () => ({
  __esModule: true,
  default: (props: any) => record("DotTextField", props),
}));

// --- Mock data ---

const allDots = [
  {
    id: 1,
    name: "Teamwork",
    labels: [
      { id: 10, label: "Collaboration" },
      { id: 11, label: "Supportive" },
    ],
  },
  {
    id: 2,
    name: "Delivery",
    labels: [{ id: 20, label: "On Time" }],
  },
];

function createMockGivenDot(
  id: number,
  details: { label_id: number; dot_type_name: string }[]
): DotDetailedResult {
  return {
    id,
    giver_name: "Giver X",
    giver_is_active: true,
    receiver_is_active: true,
    receiver_name: "Receiver Y",
    giver_id: 1,
    receiver_id: 2,
    comment: "Sample comment",
    dot_quality: "good",
    details: details.map((d, idx) => ({
      id: idx + 1,
      label_id: d.label_id,
      dot_type_name: d.dot_type_name,
    })),
    created_at: new Date().toISOString(),
  };
}

const detailedGivenDots: DotDetailedResult[] = [
  createMockGivenDot(555, [
    { label_id: 10, dot_type_name: "gold" },
    { label_id: 20, dot_type_name: "silver" },
  ]),
  createMockGivenDot(777, [{ label_id: 11, dot_type_name: "thumbs_up" }]),
];

// --- Reset before each test ---
beforeEach(() => {
  for (const k of Object.keys(propStore)) delete propStore[k];
});

// --- Helpers ---
function renderWrapper(
  partial?: Partial<React.ComponentProps<typeof Wrapper>>
) {
  return render(
    <Wrapper
      token="tok"
      allDots={allDots as any}
      allUsers={[{ id: 1, first_name: "A", last_name: "B" } as any]}
      type="give"
      dotId=""
      {...partial}
    />
  );
}

// --- Tests ---

describe("Wrapper (give mode)", () => {
  it("renders all child components", () => {
    renderWrapper();
    expect(screen.getByTestId("Header")).toBeInTheDocument();
    expect(screen.getByTestId("UserList")).toBeInTheDocument();
    expect(screen.getByTestId("SearchContainer")).toBeInTheDocument();
    expect(screen.getByTestId("DotsContainer")).toBeInTheDocument();
    expect(screen.getByTestId("DotTextField")).toBeInTheDocument();
  });

  it("passes correct type prop to Header", () => {
    renderWrapper({ type: "give" });
    expect(propStore.Header.type).toBe("give");
  });

  it("starts with empty selectedDots in DotsContainer", () => {
    renderWrapper({ type: "give" });
    expect(propStore.DotsContainer.selectedDots).toEqual([]);
  });

  it("does not pass existingDotFeedback to DotTextField", () => {
    renderWrapper({ type: "give" });
    expect(propStore.DotTextField.existingDotFeedback).toBeUndefined();
  });
});

describe("Wrapper (edit mode)", () => {
  it("hides UserList in edit mode", () => {
    renderWrapper({ type: "edit", detailedGivenDots });
    expect(screen.queryByTestId("UserList")).toBeNull();
  });

  it("pre-populates selectedDots from existingDotFeedback", async () => {
    renderWrapper({ type: "edit", dotId: "555", detailedGivenDots });

    await waitFor(() => {
      const received = propStore.DotsContainer.selectedDots as SelectedDot[];
      expect(received).toHaveLength(2);
      const labels = received.map((d) => d.label).sort();
      expect(labels).toEqual(["Collaboration", "On Time"]);
      const categories = received.map((d) => d.categoryName);
      expect(categories).toContain("Teamwork");
      expect(categories).toContain("Delivery");
    });
  });

  it("does not pre-populate when dotId does not match", async () => {
    renderWrapper({ type: "edit", dotId: "999", detailedGivenDots });
    await waitFor(() => {
      expect(propStore.DotsContainer.selectedDots).toEqual([]);
    });
  });
});

describe("Prop flow basics", () => {
  it("forwards token to DotTextField", () => {
    renderWrapper({ token: "abc123" });
    expect(propStore.DotTextField.token).toBe("abc123");
  });

  it("starts with empty selectedUsers", () => {
    renderWrapper();
    expect(propStore.Header.selectedUsers).toEqual([]);
  });
});
