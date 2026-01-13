/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UserList from "@/components/DotActions/UserList";

const setAllUsersMock = vi.fn();

const filteredUsersStub = [
  { id: 1, first_name: "Alice", last_name: "A" },
  { id: 2, first_name: "Bob", last_name: "B" },
];

vi.mock("@/app/contexts/AllUsersContext", () => ({
  useAllUsers: () => ({
    filteredUsers: filteredUsersStub,
    setAllUsers: setAllUsersMock,
  }),
}));

vi.mock("@/components/Search/Search", () => ({
  UsersSearch: () => <div data-testid="UsersSearch">UsersSearch</div>,
}));

function Host({
  initialSelected = [] as number[],
  initialShow = true,
  users = filteredUsersStub,
}: {
  initialSelected?: number[];
  initialShow?: boolean;
  users?: any[];
}) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>(initialSelected);
  const [showUserList, setShowUserList] = useState(initialShow);
  return (
    <>
      <div id="text-field-component" />
      <UserList
        allUsers={users as any}
        selectedUsers={selectedUsers}
        setSelectedUsers={setSelectedUsers}
        showUserList={showUserList}
        setShowUserList={setShowUserList}
      />
      <pre data-testid="sel">{JSON.stringify(selectedUsers)}</pre>
      <div data-testid="visible-flag">{showUserList ? "open" : "closed"}</div>
    </>
  );
}

beforeEach(() => {
  setAllUsersMock.mockClear();
});

describe("UserList", () => {
  it("calls setAllUsers with allUsers prop", async () => {
    render(<Host users={filteredUsersStub} />);
    await waitFor(() => {
      expect(setAllUsersMock).toHaveBeenCalledWith(filteredUsersStub);
    });
  });

  it("auto-opens when no selected users (effect)", async () => {
    render(<Host initialSelected={[]} initialShow={false} />);
    await waitFor(() =>
      expect(screen.getByTestId("visible-flag").textContent).toBe("open")
    );
  });

  it("renders filtered users when open", () => {
    render(<Host initialShow={true} />);
    expect(screen.getByText("Alice A")).toBeInTheDocument();
    expect(screen.getByText("Bob B")).toBeInTheDocument();
  });

  it("selects and deselects a user (toggle)", () => {
    render(<Host initialShow={true} />);
    const btn = screen.getByText("Alice A");
    fireEvent.click(btn);
    expect(JSON.parse(screen.getByTestId("sel").textContent || "[]")).toEqual([
      1,
    ]);
    fireEvent.click(btn);
    expect(JSON.parse(screen.getByTestId("sel").textContent || "[]")).toEqual(
      []
    );
  });
});
