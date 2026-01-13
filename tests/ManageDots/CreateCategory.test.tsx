import CreateCategoryPopup from "@/app/(main)/manage-dots/_components/CreateCategoryPopup";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import React from "react";


describe("CreateCategoryPopup", () => {
  it("renders nothing when show=false", () => {
    const { container } = render(
      <CreateCategoryPopup
        show={false}
        setShowPopup={() => {}}
        title="Create Category"
        label="New Category Name"
        submitLabel="Create"
        onSubmit={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title and label when visible", () => {
    render(
      <CreateCategoryPopup
        show
        setShowPopup={() => {}}
        title="Create Category"
        label="New Category Name"
        submitLabel="Create"
        onSubmit={() => {}}
      />
    );
    expect(screen.getByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText("Create Category")).toBeInTheDocument();
    expect(screen.getByLabelText("New Category Name")).toBeInTheDocument();
  });

  it("calls onSubmit with trimmed value and then disables submit when empty", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <CreateCategoryPopup
        show
        setShowPopup={() => {}}
        title="Create Category"
        label="New Category Name"
        submitLabel="Create"
        onSubmit={onSubmit}
      />
    );
    const input = screen.getByLabelText("New Category Name");
    await user.type(input, "  Finance  ");
    await user.click(screen.getByRole("button", { name: "Create" }));
    expect(onSubmit).toHaveBeenCalledWith("Finance");

    // after clearing, button should be disabled
    await user.clear(input);
    expect(screen.getByRole("button", { name: "Create" })).toBeDisabled();
  });

  it("closes when overlay is clicked", async () => {
    const user = userEvent.setup();
    const setShowPopup = vi.fn();
    render(
      <CreateCategoryPopup
        show
        setShowPopup={setShowPopup}
        title="Create Dot"
        label="Dot Label"
        submitLabel="Save"
        onSubmit={() => {}}
      />
    );
    // overlay has aria-hidden; click outside dialog
    const overlay = screen.getByRole("presentation", { hidden: true }) || document.querySelector(".fixed.inset-0.z-40");
    // fallback: click the first overlay div
    const overlayDiv = overlay instanceof HTMLElement ? overlay : document.querySelector(".fixed.inset-0.z-40")!;
    await user.click(overlayDiv);
    expect(setShowPopup).toHaveBeenCalledWith(false);
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    const setShowPopup = vi.fn();
    render(
      <CreateCategoryPopup
        show
        setShowPopup={setShowPopup}
        title="Create Category"
        label="New Category Name"
        submitLabel="Create"
        onSubmit={() => {}}
      />
    );
    await user.keyboard("{Escape}");
    expect(setShowPopup).toHaveBeenCalledWith(false);
  });
});
