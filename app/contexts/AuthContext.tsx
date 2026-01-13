'use client';

import React, { createContext, useState, useCallback, useMemo } from 'react';
import { AuthContextType, AuthProviderProps } from './types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Auth Provider Component
export const AuthProvider: React.FC<AuthProviderProps> = ({ userInfo,  children }) => {
   const [user, setUser] = useState({
      userId: userInfo.userId || null,
      email: userInfo.email || null,
      role: userInfo.role || null,
      isValid: userInfo.isValid || false,
   });
   const [isAuthenticated, setIsAuthenticated] = useState(userInfo.isValid || false);

   const clearUser = useCallback(() => {
      setIsAuthenticated(false);
      setUser({ userId: null, email: null, role: null, isValid: false });
   }, []);

   const contextValue = useMemo(() => ({
      user,
      isAuthenticated,
      setIsAuthenticated,
      clearUser,
   }), [user, isAuthenticated, clearUser]);
   return (
      <AuthContext.Provider value={contextValue}>
         {children}
      </AuthContext.Provider>
   );
};

export default AuthContext;