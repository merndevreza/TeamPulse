/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DotCategory from "@/app/(main)/manage-dots/_components/DotCategory";
import type { DotCategory as DotCategoryType } from "@/app/actions/api/types";
import { describe, it, expect, vi } from "vitest";
import React from "react";

// Mock popups as lightweight stubs to observe open/submit calls
vi.mock("@/app/(main)/manage-dots/_components/CreateCategoryPopup", () => ({
  default: (props: any) => {
    if (!props.show) return null;
    return (
      <div role="dialog" aria-label={props.title}>
        <button onClick={() => props.onSubmit("Edited Label")}>
          {props.submitLabel}
        </button>
        <button onClick={() => props.setShowPopup(false)}>Cancel</button>
      </div>
    );
  },
}));

vi.mock("@/components/manage-dots/_components/ConfirmDialog", () => ({
  default: (props: any) =>
    props.show ? (
      <div role="dialog" aria-label="Confirm">
        <button onClick={props.onConfirm}>Delete</button>
        <button onClick={props.onCancel}>Cancel</button>
      </div>
    ) : null,
}));

// Mock server actions
vi.mock("@/app/actions/manage-dots/manage-dots-api", () => ({
  updateDotCategory: vi.fn(async () => ({ success: true })),
  deleteDotCategory: vi.fn(async () => ({ success: true })),
  createDotLabel: vi.fn(async () => ({ success: true })),
  updateDotLabel: vi.fn(async () => ({ success: true })),
  deleteDotLabel: vi.fn(async () => ({ success: true })),
}));

function makeDot(): DotCategoryType {
  return {
    id: 1,
    name: "Category A",
    labels: [
      { id: 11, label: "Alpha" } as any,
      { id: 12, label: "Beta" } as any,
    ],
  } as any;
}

describe("DotCategory", () => {
  it("renders labels", () => {
    render(<DotCategory dot={makeDot()} />);
    expect(screen.getByTestId("dot-category-name-1")).toBeInTheDocument();
    expect(screen.getByTestId("dot-label-11")).toBeInTheDocument();
    expect(screen.getByTestId("dot-label-12")).toBeInTheDocument();
  });

  it("opens create popup and calls createDotLabel", async () => {
    const user = userEvent.setup();
    const { createDotLabel } = await import("@/app/actions/manage-dots/manage-dots-api");

    render(<DotCategory dot={makeDot()} />);
    await user.click(screen.getByRole("button", { name: "+ Create new dot" }));

    // popup opens
    const dlg = screen.getByRole("dialog", { name: /Create Dot/i });
    await user.click(within(dlg).getByRole("button", { name: /Create|Save/i }));

    await waitFor(() => {
      expect(createDotLabel).toHaveBeenCalledWith(1, "Edited Label");
    });
  });

  it("opens edit popup and calls updateDotLabel", async () => {
    const user = userEvent.setup();
    const { updateDotLabel } = await import("@/app/actions/manage-dots/manage-dots-api");

    render(<DotCategory dot={makeDot()} />);

    // reveal row actions by keyboard: Tab into the row buttons
    // find the list item for "Alpha"
    const alphaRow = screen.getByTestId("dot-label-11").closest("li")!;
    // simulate focus within: click the first button after revealing
    // the action container is not in DOM text-wise, so we hover the row:
    await user.hover(alphaRow);

    // click the first action button (Edit icon)
    const editBtn = within(alphaRow).getAllByRole("button")[0];
    await user.click(editBtn);

    const dlg = screen.getByRole("dialog", { name: /Edit Dot/i });
    await user.click(within(dlg).getByRole("button", { name: /Save|Create/i }));

    await waitFor(() => {
      expect(updateDotLabel).toHaveBeenCalledWith(11, {
        category: 1,
        label: "Edited Label",
      });
    });
  });
});
