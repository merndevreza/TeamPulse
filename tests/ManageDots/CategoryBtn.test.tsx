/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, beforeEach, vi } from "vitest";
import React from "react";

/**
 * Hoisted test doubles — anything used by a vi.mock factory must
 * be created via vi.hoisted so it exists when Vitest hoists the mock.
 */
const { createDotCategoryMock } = vi.hoisted(() => {
  return {
    createDotCategoryMock: vi.fn(async () => ({ success: true })),
  };
});

/**
 * Mock ONLY the child popup used by the button.
 * Keep the component under test real.
 */
vi.mock("@/app/(main)/manage-dots/_components/CreateCategoryPopup", () => ({
  __esModule: true,
  default: (props: any) =>
    props.show ? (
      <div role="dialog" aria-label="Create Category Popup">
        <button onClick={() => props.onSubmit("Finance")}>Create</button>
        <button onClick={() => props.setShowPopup(false)}>Cancel</button>
      </div>
    ) : null,
}));

/**
 * Mock the server action module using the hoisted spy above.
 */
vi.mock("@/app/actions/manage-dots/manage-dots-api", () => ({
  __esModule: true,
  createDotCategory: createDotCategoryMock,
}));

/**
 * Import the REAL component AFTER mocks.
 */
import CreateCategoryBtn from "@/app/(main)/manage-dots/_components/CreateCategoryBtn";

describe("CreateCategoryBtn", () => {
  beforeEach(() => {
    createDotCategoryMock.mockClear();
  });

  it("opens popup on click", async () => {
    const user = userEvent.setup();
    render(<CreateCategoryBtn />);
    await user.click(screen.getByRole("button", { name: /Create Category/i }));
    expect(
      screen.getByRole("dialog", { name: "Create Category Popup" })
    ).toBeInTheDocument();
  });

  it("submits and closes popup on success", async () => {
    const user = userEvent.setup();
    render(<CreateCategoryBtn />);

    await user.click(screen.getByRole("button", { name: /Create Category/i }));
    await user.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(createDotCategoryMock).toHaveBeenCalledWith("Finance");
    });

    await waitFor(() => {
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
