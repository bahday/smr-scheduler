import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Mechanic } from '../types';

type ActingAs = { role: 'admin' } | { role: 'mechanic'; mechanic: Mechanic };

interface ActingAsContextValue {
  actingAs: ActingAs;
  setActingAs: (v: ActingAs) => void;
}

const ActingAsContext = createContext<ActingAsContextValue | null>(null);

export function ActingAsProvider({ children }: { children: ReactNode }) {
  const [actingAs, setActingAs] = useState<ActingAs>({ role: 'admin' });
  return (
    <ActingAsContext.Provider value={{ actingAs, setActingAs }}>
      {children}
    </ActingAsContext.Provider>
  );
}

export function useActingAs() {
  const ctx = useContext(ActingAsContext);
  if (!ctx) throw new Error('useActingAs must be used within ActingAsProvider');
  return ctx;
}
