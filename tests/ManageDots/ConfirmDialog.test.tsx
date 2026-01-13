import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import ConfirmDialog from "@/app/(main)/manage-dots/_components/ConfirmDialog";
import React from "react";

describe("ConfirmDialog", () => {
  it("does not render when show=false", () => {
    const { container } = render(
      <ConfirmDialog
        show={false}
        title="Delete?"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders title, subtitle, and buttons", () => {
    render(
      <ConfirmDialog
        show
        title="Are you sure you want to delete this Category?"
        subtitle="The category will be deleted permanently"
        cancelLabel="Cancel"
        confirmLabel="Delete"
        onCancel={() => {}}
        onConfirm={() => {}}
      />
    );
    expect(screen.getByText(/delete this Category/)).toBeInTheDocument();
    expect(screen.getByText(/deleted permanently/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
  });

  it("calls onConfirm and onCancel", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        show
        title="Confirm delete?"
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));
    expect(onConfirm).toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalled();
  });

  it("closes on overlay click and Escape", async () => {
    const user = userEvent.setup();
    const onCancel = vi.fn();
    render(
      <ConfirmDialog
        show
        title="Confirm"
        onCancel={onCancel}
        onConfirm={() => {}}
      />
    );
    const overlay = document.querySelector(".fixed.inset-0.z-40")!;
    await user.click(overlay);
    expect(onCancel).toHaveBeenCalledTimes(1);

    await user.keyboard("{Escape}");
    expect(onCancel).toHaveBeenCalledTimes(2);
  });
});
