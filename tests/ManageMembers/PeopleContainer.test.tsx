/* eslint-disable @typescript-eslint/no-explicit-any */
// PeopleContainer.test.tsx
import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, within, waitFor } from "@testing-library/react";

// ---- Module Mocks ----
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/app/actions/manage-members/manage-members-api", () => ({
  makeUserAdmin: vi.fn(),
  setUserActive: vi.fn(),
  deleteAdminUser: vi.fn(),
}));

vi.mock("@/components/Search/Search", () => ({
  UsersSearchAdmin: ({ setResults }: any) => (
    <button data-testid="mock-search" onClick={() => setResults?.([])}>
      mock search
    </button>
  ),
}));
vi.mock("@/components/Avatar/InitialsAvatar", () => ({
  __esModule: true,
  default: ({ firstName, lastName }: any) => (
    <div data-testid="avatar">
      {firstName} {lastName}
    </div>
  ),
}));
vi.mock("@/components/CommonSVGs/AdminRouteSVGs", () => ({
  EditSVG: () => <span>EditIcon</span>,
  MakeAdminSVG: () => <span>MakeAdminIcon</span>,
  DeactivateSVG: () => <span>DeactivateIcon</span>,
  DeleteSVG: () => <span>DeleteIcon</span>,
}));


import {
  deleteAdminUser,
} from "@/app/actions/manage-members/manage-members-api";
import PeopleContainer from "@/app/(main)/manage-members/_components/PeopleContainer";

// ---- Fixtures ----
const usersFixture = [
  {
    id: 1,
    first_name: "Ada",
    last_name: "Lovelace",
    email: "ada@example.com",
    role: "member",
    is_active: true,
    last_login: "2025-09-10T12:00:00Z",
  },
  {
    id: 2,
    first_name: "Alan",
    last_name: "Turing",
    email: "alan@example.com",
    role: "member",
    is_active: false,
    last_login: "2025-09-12T12:00:00Z",
  },
] as any;

const renderPeople = (override: Partial<React.ComponentProps<typeof PeopleContainer>> = {}) =>
  render(<PeopleContainer users={usersFixture} statusTitle="People" {...override} />);

// Helper: find all menu buttons ("..." triggers)
const getMenuButtons = () =>
  screen
    .getAllByRole("button")
    .filter((b) => (b as HTMLButtonElement).getAttribute("aria-haspopup") === "menu");

// Helper: after opening a menu, find the one that is actually open
const getOpenMenu = () => {
  const menus = screen.getAllByRole("menu", { hidden: true });
  const open = menus.find((m) => m.getAttribute("aria-hidden") === "false");
  if (!open) throw new Error("No open menu found");
  return open;
};

beforeEach(() => {
  vi.resetAllMocks();
});

describe("PeopleContainer", () => {
  it("renders the provided users", () => {
    renderPeople();
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("Alan Turing")).toBeInTheDocument();
  });

  it("opens the actions menu for the first user and lists context-aware items; closes on Escape", () => {
    renderPeople();

    const menuButtons = getMenuButtons();
    fireEvent.click(menuButtons[0]); // Ada

    const menu = getOpenMenu();
    expect(menu).toBeVisible();

    expect(within(menu).getByText("Edit user")).toBeInTheDocument();
    expect(within(menu).getByText("Make admin")).toBeInTheDocument();
    expect(within(menu).getByText("Deactivate user")).toBeInTheDocument();
    expect(within(menu).getByText("Delete user")).toBeInTheDocument();

    // Close with Escape
    fireEvent.keyDown(document, { key: "Escape" });
    // Menu element still exists in DOM but should not be visible
    expect(menu).not.toBeVisible();
  });

  it("shows 'Activate user' for an inactive user", () => {
    renderPeople();

    const menuButtons = getMenuButtons();
    fireEvent.click(menuButtons[1]); // Alan (inactive)

    const menu = getOpenMenu();
    expect(menu).toBeVisible();
    expect(within(menu).getByText("Activate user")).toBeInTheDocument();
  });

  it("deletes a user after confirmation", async () => {
    (deleteAdminUser as any).mockResolvedValue({ success: true });

    renderPeople();

    const menuButtons = getMenuButtons();
    fireEvent.click(menuButtons[0]); // Ada

    const menu = getOpenMenu();
    fireEvent.click(within(menu).getByText("Delete user"));

    const dialog = screen.getByRole("dialog");
    expect(within(dialog).getByText(/are you sure you want to delete/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole("button", { name: /delete/i }));

    expect(deleteAdminUser).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(screen.queryByText("Ada Lovelace")).not.toBeInTheDocument();
    });
    expect(screen.getByText("Alan Turing")).toBeInTheDocument();
  });
});
