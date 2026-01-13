'use client';

import React, { createContext, useState, useCallback, useMemo } from 'react';
import { ActionStateContextType, ActionStateProviderProps } from './types';

const ActionStateContext = createContext<ActionStateContextType | undefined>(undefined);

// Action State Provider Component
export const ActionStateProvider: React.FC<ActionStateProviderProps> = ({ children }) => {
   const [isActionRunning, setIsActionRunning] = useState<boolean>(false);
   const [actionType, setActionType] = useState<string | null>(null);

   const setActionRunning = useCallback((type: string) => {
      setIsActionRunning(true);
      setActionType(type);
   }, []);

   const clearActionRunning = useCallback(() => {
      setIsActionRunning(false);
      setActionType(null);
   }, []);

   const contextValue = useMemo(() => ({
      isActionRunning,
      actionType,
      setActionRunning,
      clearActionRunning,
   }), [isActionRunning, actionType, setActionRunning, clearActionRunning]);

   return (
      <ActionStateContext.Provider value={contextValue}>
         {children}
      </ActionStateContext.Provider>
   );
};

export { ActionStateContext };
export default ActionStateProvider;