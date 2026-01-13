import { Dispatch, ReactNode, SetStateAction } from "react";
interface UserType {
   userId?: number | null;
   email?: string | null;
   role?: string | null;
   isValid?: boolean;
}
// Auth Context interface
export interface AuthContextType {
   user: UserType;
   isAuthenticated: boolean;
   setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
   clearUser: () => void;
}

// AuthProvider Props
export interface AuthProviderProps {
   children: ReactNode; 
   userInfo : UserType;
}

// Action State Context interface
export interface ActionStateContextType {
   isActionRunning: boolean;
   actionType: string | null;
   setActionRunning: (actionType: string) => void;
   clearActionRunning: () => void;
}

// ActionStateProvider Props
export interface ActionStateProviderProps {
   children: ReactNode;
}