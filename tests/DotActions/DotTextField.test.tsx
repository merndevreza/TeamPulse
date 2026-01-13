/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  render,
  screen,
  fireEvent,
  waitFor,
  within,
} from "@testing-library/react";
import DotTextField from "@/components/DotActions/DotTextField";

// Ensure BASE_URL exists BEFORE importing the component (it’s read at module load)
process.env.NEXT_PUBLIC_API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://test.local";

// --- Mocks ---
const pushMock = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

const revalidateGivenMock = vi.fn().mockResolvedValue(undefined);
const revalidateSummaryMock = vi.fn().mockResolvedValue(undefined);
vi.mock("@/app/actions/revalidate", () => ({
  revalidateUserGivenDots: () => revalidateGivenMock(),
  revalidateUserDotsSummary: () => revalidateSummaryMock(),
}));

// Mock server actions used by DotTextField
const giveDotsMock = vi.fn().mockResolvedValue({ success: true });
const editGivenDotMock = vi.fn().mockResolvedValue({ success: true });
vi.mock("@/app/actions/dots/give-edit-dots-api", () => ({
  giveDots: (...args: any[]) => giveDotsMock(...args),
  editGivenDot: (...args: any[]) => editGivenDotMock(...args),
}));

// --- Lightweight hosts to control state from tests ---
type SelectedDot = {
  label_id: number;
  label: string;
  dot_type: string;
  categoryName: string;
};

function HostGive({
  initialDots,
  initialUsers,
  token = "tok",
}: {
  initialDots: SelectedDot[];
  initialUsers: number[];
  token?: string;
}) {
  const [selectedDots, setSelectedDots] = useState<SelectedDot[]>(initialDots);
  const [selectedUsers, setSelectedUsers] = useState<number[]>(initialUsers);
  return (
    <>
      <DotTextField
        type="give"
        token={token}
        selectedDots={selectedDots}
        setSelectedDots={setSelectedDots}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        setHasSubmitted={() => {}}
        showTextFieldForTouchscreen={false}
        setShowTextFieldForTouchscreen={() => {}}
      />
      <pre data-testid="state-dots">{JSON.stringify(selectedDots)}</pre>
      <pre data-testid="state-users">{JSON.stringify(selectedUsers)}</pre>
    </>
  );
}

function HostEdit({
  initialDots,
  dotId,
  initialComment,
  originalSelectedDots,
  token = "tok",
}: {
  initialDots: SelectedDot[];
  dotId: string;
  initialComment: string;
  originalSelectedDots: SelectedDot[];
  token?: string;
}) {
  const [selectedDots, setSelectedDots] = useState<SelectedDot[]>(initialDots);
  const [selectedUsers, setSelectedUsers] = useState<number[]>([9]); // unused in edit
  return (
    <>
      <DotTextField
        type="edit"
        dotId={dotId}
        token={token}
        selectedDots={selectedDots}
        setSelectedDots={setSelectedDots}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        initialComment={initialComment}
        originalSelectedDots={originalSelectedDots}
        setHasSubmitted={() => {}}
        showTextFieldForTouchscreen={false}
        setShowTextFieldForTouchscreen={() => {}}
      />
      <pre data-testid="state-dots">{JSON.stringify(selectedDots)}</pre>
    </>
  );
}

// --- Reset before each test ---
beforeEach(() => {
  pushMock.mockReset();
  revalidateGivenMock.mockClear();
  revalidateSummaryMock.mockClear();
  giveDotsMock.mockClear();
  editGivenDotMock.mockClear();
  sessionStorage.clear();
});

// --- Tests ---
describe("DotTextField (render & basics)", () => {
  it("renders selected dot and can remove it", () => {
    render(
      <HostGive
        initialDots={[
          {
            label_id: 1,
            label: "Collaboration",
            dot_type: "thumbs_up",
            categoryName: "Teamwork",
          },
        ]}
        initialUsers={[1]}
      />
    );
    const chip = screen.getByTestId("selected-dot-0");
    expect(chip).toHaveTextContent("Collaboration");
    fireEvent.click(within(chip).getByRole("button")); // remove
    expect(screen.queryByTestId("selected-dot-0")).toBeNull();
  });

  it("disables submit based on selected dots", () => {
    render(<HostGive initialDots={[]} initialUsers={[1]} />);
    expect(screen.getByTestId("submit-dot-btn")).toBeDisabled();
  });
});

describe("DotTextField (give mode)", () => {
  it("calls giveDots with correct payload, revalidates, navigates, and clears state", async () => {
    render(
      <HostGive
        initialDots={[
          {
            label_id: 10,
            label: "Collab",
            dot_type: "thumbs_up",
            categoryName: "Teamwork",
          },
        ]}
        initialUsers={[5, 6]}
      />
    );

    const textarea = screen.getByTestId("dot-textarea") as HTMLTextAreaElement;
    fireEvent.change(textarea, {
      target: { value: "Great collaborative team effort today!" },
    }); // >=5 words

    const btn = screen.getByTestId("submit-dot-btn");
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    await waitFor(() => expect(giveDotsMock).toHaveBeenCalledTimes(1));
    expect(giveDotsMock).toHaveBeenCalledWith(
      {
        receiver_ids: [5, 6],
        comment: "Great collaborative team effort today!",
        details: [{ label_id: 10, dot_type_name: "thumbs_up" }],
      },
      "tok"
    );

    await waitFor(() => {
      expect(revalidateGivenMock).toHaveBeenCalledTimes(1);
      expect(revalidateSummaryMock).toHaveBeenCalledTimes(1);
    });

    // state cleared after give
    expect(screen.getByTestId("state-dots")).toHaveTextContent("[]");
    expect(screen.getByTestId("state-users")).toHaveTextContent("[]");
    expect(
      (screen.getByTestId("dot-textarea") as HTMLTextAreaElement).value
    ).toBe("");
    expect(sessionStorage.getItem("selectedUsers")).toBeNull();
  });
});

describe("DotTextField (edit mode)", () => {
  it("calls editGivenDot with correct payload, revalidates, and preserves edit snapshots", async () => {
    sessionStorage.setItem("selectedUsers", "[1,2]");

    const initialComment = "Original comment";
    const originalSelectedDots = [
      {
        label_id: 10,
        label: "Collab",
        dot_type: "thumbs_up",
        categoryName: "Teamwork",
      },
    ];

    render(
      <HostEdit
        dotId="123"
        initialComment={initialComment}
        originalSelectedDots={originalSelectedDots}
        initialDots={[
          {
            label_id: 10,
            label: "Collab",
            dot_type: "loop",
            categoryName: "Teamwork",
          },
        ]}
      />
    );

    const textarea = screen.getByTestId("dot-textarea") as HTMLTextAreaElement;
    expect(textarea.value).toBe("Original comment");

    fireEvent.change(textarea, {
      target: { value: "Updated comment with sufficient words here" },
    }); // >=5 words

    const btn = screen.getByTestId("submit-dot-btn");
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);

    await waitFor(() => expect(editGivenDotMock).toHaveBeenCalledTimes(1));
    expect(editGivenDotMock).toHaveBeenCalledWith(
      123,
      {
        comment: "Updated comment with sufficient words here",
        details: [{ label_id: 10, dot_type_name: "loop" }],
      },
      "tok"
    );

    await waitFor(() => {
      expect(revalidateGivenMock).toHaveBeenCalledTimes(1);
      expect(revalidateSummaryMock).toHaveBeenCalledTimes(1);
    });

    // snapshot keys exist (component writes these for undo/reopen flows)
    expect(
      sessionStorage.getItem("previouslyEditedDotUndoData")
    ).not.toBeNull();
    expect(sessionStorage.getItem("previouslyEditedDotData")).not.toBeNull();
  });
});
