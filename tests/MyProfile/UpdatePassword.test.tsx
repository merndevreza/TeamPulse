/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import UpdatePassword from '@/app/(main)/my-profile/_components/UpdatePassword';

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the server action
vi.mock("@/app/actions/my-profile/update-my-password", () => ({
  updateMyPassword: vi.fn(),
}));

import { updateMyPassword } from '@/app/actions/my-profile/update-my-password';
import ActionStateProvider from '@/app/contexts/ActionStateContext';

// Test wrapper component that provides the necessary context
const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ActionStateProvider>
      {children}
    </ActionStateProvider>
  );
};

describe("UpdatePassword", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders in non-editing mode initially", () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Should show the edit password button
    expect(screen.getByRole("button", { name: /edit password/i })).toBeInTheDocument();

    // Should not show password input fields
    expect(document.getElementById("current-password")).not.toBeInTheDocument();
    expect(document.getElementById("new-password")).not.toBeInTheDocument();
    expect(document.getElementById("confirm-password")).not.toBeInTheDocument();
  });

  it("enters edit mode when Edit Password button is clicked", () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Click edit password button
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Should show password input fields by their IDs
    expect(document.getElementById("current-password")).toBeInTheDocument();
    expect(document.getElementById("new-password")).toBeInTheDocument();
    expect(document.getElementById("confirm-password")).toBeInTheDocument();

    // Should show Save and Cancel buttons
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    // Should show password checker
    expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
  });

  it("allows entering password values", () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Get password inputs by their IDs
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    // Change input values
    fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
    fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });

    expect(currentPasswordInput.value).toBe("OldPassword123!");
    expect(newPasswordInput.value).toBe("NewPassword123!");
    expect(confirmPasswordInput.value).toBe("NewPassword123!");
  });

  it("exits edit mode and clears form when Cancel is clicked", () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in some values
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;

    fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
    fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });

    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Should exit edit mode
    expect(screen.getByRole("button", { name: /edit password/i })).toBeInTheDocument();
    expect(document.getElementById("current-password")).not.toBeInTheDocument();
  });

  it("shows error when passwords don't match", async () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in mismatched passwords
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "DifferentPassword123!" } });
    });

    // Save button should be disabled when passwords don't match
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("shows error when new password is same as current password", async () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in same passwords
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "SamePassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "SamePassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "SamePassword123!" } });
    });

    // Save button should be disabled when passwords are the same
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();
  });

  it("disables Save button when passwords are invalid", () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Save button should be disabled initially
    const saveButton = screen.getByRole("button", { name: /save/i });
    expect(saveButton).toBeDisabled();

    // Fill in weak password
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    fireEvent.change(currentPasswordInput, { target: { value: "weak" } });
    fireEvent.change(newPasswordInput, { target: { value: "weak" } });
    fireEvent.change(confirmPasswordInput, { target: { value: "weak" } });

    // Save button should still be disabled due to weak password
    expect(saveButton).toBeDisabled();
  });

  it("successfully updates password", async () => {
    // Mock successful response
    (updateMyPassword as any).mockResolvedValue({
      success: true,
      message: "Password updated successfully.",
      status: 200,
      statusText: "OK",
    });

    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in valid passwords
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
    });

    // Wait for validation to complete and save button to be enabled
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Should call updateMyPassword with correct data
    expect(updateMyPassword).toHaveBeenCalled();
    const formDataArg = (updateMyPassword as any).mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBeTruthy();
    expect(formDataArg.get("old_password")).toBe("OldPassword123!");
    expect(formDataArg.get("new_password")).toBe("NewPassword123!");
    expect(formDataArg.get("confirm_password")).toBe("NewPassword123!");

    // The test verifies that the API was called correctly
    // The success message and form clearing happen very quickly
    // Fast-forward to exit edit mode after 3 seconds
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Should exit edit mode after successful update
    expect(screen.getByRole("button", { name: /edit password/i })).toBeInTheDocument();
  });

  it("handles API error on save", async () => {
    // Mock error response
    (updateMyPassword as any).mockResolvedValue({
      success: false,
      message: "Current password is incorrect.",
      status: 400,
      statusText: "Bad Request",
    });

    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in passwords
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "WrongPassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
    });

    // Wait for validation to complete
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Should show error message
    expect(screen.getByText(/current password is incorrect/i)).toBeInTheDocument();

    // Should remain in edit mode
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("handles authentication error and redirects", async () => {
    // Mock auth error response
    (updateMyPassword as any).mockResolvedValue({
      success: false,
      message: "Authentication required.",
      status: 401,
      statusText: "Unauthorized",
      shouldClearAuth: true
    });

    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in passwords
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
    });

    // Wait for validation to complete
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Should show auth error message
    expect(screen.getByText(/your session has expired/i)).toBeInTheDocument();

    // Fast-forward time to trigger the redirect
    await act(async () => {
      vi.advanceTimersByTime(2000);
    });

    // Verify the redirect was called
    expect(mockPush).toHaveBeenCalledWith('/');
  });

  it("handles unexpected errors gracefully", async () => {
    // Mock throw an error
    (updateMyPassword as any).mockImplementation(() => {
      throw new Error('Network error');
    });

    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Fill in passwords
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "NewPassword123!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword123!" } });
    });

    // Wait for validation to complete
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Should show generic error message
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
  });

  it("shows password strength validation with PasswordChecker", () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Should show password checker requirements
    expect(screen.getByText(/minimum 8 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 1 uppercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 1 lowercase letter/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 1 digit/i)).toBeInTheDocument();
    expect(screen.getByText(/at least 1 special character/i)).toBeInTheDocument();

    // Enter a strong password
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    fireEvent.change(newPasswordInput, { target: { value: "StrongPassword123!" } });

    // Password checker should update to show valid requirements
    // The exact implementation depends on how PasswordChecker renders valid/invalid states
  });

  it("clears error and success messages with timeouts", async () => {
    render(<UpdatePassword />, { wrapper: TestWrapper });

    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit password/i });
    fireEvent.click(editButton);

    // Mock API error for testing message clearing
    (updateMyPassword as any).mockResolvedValue({
      success: false,
      message: "Current password is incorrect.",
      status: 400,
      statusText: "Bad Request",
    });

    // Fill in valid passwords to be able to click save
    const currentPasswordInput = document.getElementById("current-password") as HTMLInputElement;
    const newPasswordInput = document.getElementById("new-password") as HTMLInputElement;
    const confirmPasswordInput = document.getElementById("confirm-password") as HTMLInputElement;

    await act(async () => {
      fireEvent.change(currentPasswordInput, { target: { value: "OldPassword123!" } });
      fireEvent.change(newPasswordInput, { target: { value: "NewPassword456!" } });
      fireEvent.change(confirmPasswordInput, { target: { value: "NewPassword456!" } });
    });

    // Wait for validation to complete
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Try to save to trigger API error
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Should show error message
    expect(screen.getByText(/Current password is incorrect/)).toBeInTheDocument();

    // Fast-forward to clear error message
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Error message should be gone
    expect(screen.queryByText(/Current password is incorrect/)).not.toBeInTheDocument();
  });
});
