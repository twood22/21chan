import { useContext } from 'react';
import { ChanContext, type ChanContextType } from '@/contexts/ChanContext';

export function useChanContext(): ChanContextType {
  const context = useContext(ChanContext);
  if (!context) {
    throw new Error('useChanContext must be used within a ChanProvider');
  }
  return context;
}
