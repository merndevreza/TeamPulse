'use client';

import { useContext } from 'react';
import { ActionStateContext } from '@/app/contexts/ActionStateContext';
import { ActionStateContextType } from '@/app/contexts/types';

/**
 * Custom hook to use ActionState context
 * @returns ActionStateContextType - The action state context value
 * @throws Error if used outside of ActionStateProvider
 */
export const useActionState = (): ActionStateContextType => {
   const context = useContext(ActionStateContext);
   
   if (context === undefined) {
      throw new Error('useActionState must be used within an ActionStateProvider');
   }
   
   return context;
};

export default useActionState;