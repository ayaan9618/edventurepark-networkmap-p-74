import { createContext, useContext, useState, ReactNode } from 'react';
import { NetworkData } from '@/types/network';

interface AdminContextType {
  networkData: NetworkData | null;
  setNetworkData: (data: NetworkData | null) => void;
  isAuthenticated: boolean;
  login: (password: string) => boolean;
  logout: () => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Simple password for demo - replace with proper auth later
const ADMIN_PASSWORD = 'edventure2024';

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [networkData, setNetworkData] = useState<NetworkData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
  };

  return (
    <AdminContext.Provider value={{
      networkData,
      setNetworkData,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};