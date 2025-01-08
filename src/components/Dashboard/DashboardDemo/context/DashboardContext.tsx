import { createContext, useContext, useState, ReactNode } from 'react';

interface DashboardContextType {
  selectedRegions: Set<string>;
  setSelectedRegions: (regions: Set<string>) => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());

  return (
    <DashboardContext.Provider value={{ selectedRegions, setSelectedRegions }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
}