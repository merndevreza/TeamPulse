// UserContext.tsx
"use client";

import {
  createContext,
  Dispatch,
  SetStateAction,
  useState,
  ReactNode,
  useContext,
} from "react";
import {
 OtherUser,
 UserForAdmin,
} from "../actions/api/types";

// Define the shape of the context
type AllUsersContextType = {
  allUsers: OtherUser[] | null;
  setAllUsers: Dispatch<SetStateAction<OtherUser[] | null>>;
  filteredUsers: OtherUser[] | null;
  setFilteredUsers: Dispatch<SetStateAction<OtherUser[] | null>>;

  allUsersAdmin: UserForAdmin[] | null;
  setAllUsersAdmin: Dispatch<SetStateAction<UserForAdmin[] | null>>;
  filteredUsersAdmin: UserForAdmin[] | null;
  setFilteredUsersAdmin: Dispatch<SetStateAction<UserForAdmin[] | null>>;
};

// Create the context with default values
const AllUsersContext = createContext<AllUsersContextType>({
  allUsers: null,
  setAllUsers: () => {},
  filteredUsers: null,
  setFilteredUsers: () => {},
  allUsersAdmin: null,
  setAllUsersAdmin: () => {},
  filteredUsersAdmin: null,
  setFilteredUsersAdmin: () => {},
});

// Provider component
export function AllUsersProvider({ children }: { children: ReactNode }) {
  const [allUsers, setAllUsers] = useState<OtherUser[] | null>(null);
  const [filteredUsers, setFilteredUsers] = useState<OtherUser[] | null>(allUsers);
  const [allUsersAdmin, setAllUsersAdmin] = useState<UserForAdmin[] | null>(null);
  const [filteredUsersAdmin, setFilteredUsersAdmin] = useState<UserForAdmin[] | null>(allUsersAdmin);

  return (
    <AllUsersContext.Provider
      value={{
        allUsers,
        setAllUsers,
        filteredUsers,
        setFilteredUsers,
        allUsersAdmin,
        setAllUsersAdmin,
        filteredUsersAdmin,
        setFilteredUsersAdmin,
      }}
    >
      {children}
    </AllUsersContext.Provider>
  );
}

// Custom hook for easier usage
export function useAllUsers() {
  return useContext(AllUsersContext);
}
