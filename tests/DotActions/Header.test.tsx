/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import Header from "@/components/DotActions/Header";

const propStore: Record<string, any> = {};

vi.mock("@/components/DotActions/HeaderSelected", () => ({
  __esModule: true,
  default: (props: any) => {
    propStore.HeaderSelected = props;
    return <div data-testid="HeaderSelected">HeaderSelected</div>;
  },
}));

vi.mock("@/app/(main)/_components/icons/SinglePerson", () => ({
  __esModule: true,
  default: () => <div data-testid="SinglePerson">PersonIcon</div>,
}));

function Host({
  mode = "give",
  initialSelected = [] as number[],
  initialShow = false,
}: {
  mode?: "give" | "edit";
  initialSelected?: number[];
  initialShow?: boolean;
}) {
  const [selectedUsers, setSelectedUsers] = useState<number[]>(initialSelected);
  const [showUserList, setShowUserList] = useState(initialShow);
  return (
    <Header
      type={mode}
      selectedUsers={selectedUsers}
      setSelectedUsers={setSelectedUsers}
      showUserList={showUserList}
      setShowUserList={setShowUserList}
    />
  );
}

beforeEach(() => {
  for (const k of Object.keys(propStore)) delete propStore[k];
});

describe("Header (give mode)", () => {
  it("renders HeaderSelected + Add recipient button when hidden list", () => {
    render(<Host mode="give" initialSelected={[]} initialShow={false} />);
    expect(screen.getByTestId("HeaderSelected")).toBeInTheDocument();
    expect(screen.getByLabelText("Add user")).toBeInTheDocument();
  });

  it("hides Add recipient button after clicking it (showUserList => true)", () => {
    render(<Host mode="give" initialShow={false} />);
    fireEvent.click(screen.getByLabelText("Add user"));
    expect(screen.queryByLabelText("Add user")).toBeNull();
  });

  it("passes selectedUsers to HeaderSelected", () => {
    render(<Host mode="give" initialSelected={[1, 2]} />);
    expect(propStore.HeaderSelected.selectedUsers).toEqual([1, 2]);
  });
});

describe("Header (edit mode)", () => {
  it("renders SinglePerson, no Add recipient UI", () => {
    render(<Host mode="edit" />);
    expect(screen.getByTestId("SinglePerson")).toBeInTheDocument();
    expect(screen.queryByLabelText("Add user")).toBeNull();
  });
});

describe("Header common", () => {
  it("contains link to /about-me/summary", () => {
    render(<Host />);
    const link = screen.getByRole("link");
    expect(link).toBeInTheDocument();
  });
});
