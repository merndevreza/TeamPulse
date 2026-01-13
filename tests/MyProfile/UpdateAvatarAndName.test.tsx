/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import UpdateAvatarAndName from "@/app/(main)/my-profile/_components/UpdateAvatarAndName";
import { updateMyProfile } from "@/app/actions/my-profile/update-my-profile";
import { ActionStateProvider } from "@/app/contexts/ActionStateContext";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

// Mock the server action
vi.mock("@/app/actions/my-profile/update-my-profile", () => ({
  updateMyProfile: vi.fn(),
}));

describe("UpdateAvatarAndName", () => {
  const mockProfile = {
    id: 1,
    email: "test@example.com",
    first_name: "John",
    last_name: "Doe",
    role: "user",
  };

  // Test wrapper component that provides the necessary context
  const TestWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
      <ActionStateProvider>
        {children}
      </ActionStateProvider>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders with initial profile data", () => {
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Check that the name fields are filled with the profile data
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
    
    expect(firstNameInput.value).toBe("John");
    expect(lastNameInput.value).toBe("Doe");
    
    // Initial state should show edit button and disabled inputs
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(firstNameInput).toBeDisabled();
    expect(lastNameInput).toBeDisabled();
  });

  it("enters edit mode when Edit button is clicked", () => {
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Click edit button
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Should now show Save and Cancel buttons
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
    
    // Inputs should be enabled
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
    expect(firstNameInput).not.toBeDisabled();
    expect(lastNameInput).not.toBeDisabled();
  });

  it("allows editing first and last name", () => {
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Change input values
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
    
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });
    fireEvent.change(lastNameInput, { target: { value: "Smith" } });
    
    expect(firstNameInput.value).toBe("Jane");
    expect(lastNameInput.value).toBe("Smith");
  });

  it("reverts changes when Cancel is clicked", () => {
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Change input values
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
    
    fireEvent.change(firstNameInput, { target: { value: "Jane" } });
    fireEvent.change(lastNameInput, { target: { value: "Smith" } });
    
    // Click cancel
    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);
    
    // Values should be reverted and edit mode should be exited
    const firstNameInputAfter = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInputAfter = screen.getByDisplayValue("Doe") as HTMLInputElement;
    
    expect(firstNameInputAfter.value).toBe("John");
    expect(lastNameInputAfter.value).toBe("Doe");
    expect(firstNameInputAfter).toBeDisabled();
    expect(lastNameInputAfter).toBeDisabled();
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("validates input - shows error for empty fields", async () => {
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Clear both inputs
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "" } });
      fireEvent.change(lastNameInput, { target: { value: "" } });
    });
    
    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
    });
    
    // Should show validation error
    expect(screen.getByText(/please provide at least one name field/i)).toBeInTheDocument();
  });

  it("validates input - shows error for too long names", async () => {
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Set too long first name (31 characters)
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(firstNameInput, { 
        target: { value: "ThisFirstNameIsMuchTooLongForTheValidation" } 
      });
      // Trigger blur event to show validation error
      fireEvent.blur(firstNameInput);
    });
    
    // Should show validation error immediately after blur
    expect(screen.getByText(/first name must be 30 characters or less/i)).toBeInTheDocument();
  });

  it("successfully updates profile on save", async () => {
    // Mock successful response
    const mockUpdatedProfile = {
      id: 1,
      email: "test@example.com",
      first_name: "Jane",
      last_name: "Smith",
      role: "user",
    };
    
    (updateMyProfile as any).mockResolvedValue({
      success: true,
      message: "Profile updated successfully.",
      data: mockUpdatedProfile,
      status: 200,
      statusText: "OK",
    });
    
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Change input values
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    const lastNameInput = screen.getByDisplayValue("Doe") as HTMLInputElement;
    
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "Jane" } });
      fireEvent.change(lastNameInput, { target: { value: "Smith" } });
    });
    
    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
      // Run timers to handle success message timeout
      await Promise.resolve(); // Let React process state updates
    });
    
    // Should call updateMyProfile with correct data
    expect(updateMyProfile).toHaveBeenCalled();
    
    // Verify FormData contents from the updateMyProfile call
    const formDataArg = (updateMyProfile as any).mock.calls[0][0];
    expect(formDataArg instanceof FormData).toBeTruthy();
    expect(formDataArg.get("first_name")).toBe("Jane");
    expect(formDataArg.get("last_name")).toBe("Smith");
    
    // Should show success message
    expect(screen.getByText(/profile updated successfully/i)).toBeInTheDocument();
    
    // Should exit edit mode
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    
    // Input values should be updated
    const updatedFirstName = screen.getByDisplayValue("Jane") as HTMLInputElement;
    const updatedLastName = screen.getByDisplayValue("Smith") as HTMLInputElement;
    expect(updatedFirstName.value).toBe("Jane");
    expect(updatedLastName.value).toBe("Smith");
    
    // Fast-forward to clear success message
    await act(async () => {
      vi.advanceTimersByTime(3000);
    });
    
    // Success message should be gone
    expect(screen.queryByText(/profile updated successfully/i)).not.toBeInTheDocument();
  });

  it("handles API error on save", async () => {
    // Mock error response
    (updateMyProfile as any).mockResolvedValue({
      success: false,
      message: "Failed to update profile.",
      status: 400,
      statusText: "Bad Request",
    });
    
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Change input values
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "Jane" } });
    });
    
    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
      await Promise.resolve(); // Let React process state updates
    });
    
    // Should show error message
    expect(screen.getByText(/failed to update profile/i)).toBeInTheDocument();
    
    // Should remain in edit mode
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("handles authentication error and redirects", async () => {
    // Mock auth error response
    (updateMyProfile as any).mockResolvedValue({
      success: false,
      message: "Authentication required.",
      status: 401,
      statusText: "Unauthorized",
      shouldClearAuth: true
    });
    
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Change input values
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "Jane" } });
    });
    
    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
      await Promise.resolve(); // Let React process state updates
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
    (updateMyProfile as any).mockImplementation(() => {
      throw new Error("Unexpected error");
    });
    
    render(<UpdateAvatarAndName profile={mockProfile} />, { wrapper: TestWrapper });
    
    // Enter edit mode
    const editButton = screen.getByRole("button", { name: /edit/i });
    fireEvent.click(editButton);
    
    // Change input values
    const firstNameInput = screen.getByDisplayValue("John") as HTMLInputElement;
    await act(async () => {
      fireEvent.change(firstNameInput, { target: { value: "Jane" } });
    });
    
    // Click save
    const saveButton = screen.getByRole("button", { name: /save/i });
    await act(async () => {
      fireEvent.click(saveButton);
      await Promise.resolve(); // Let React process state updates
    });
    
    // Should show generic error message
    expect(screen.getByText(/an unexpected error occurred/i)).toBeInTheDocument();
  });
});
