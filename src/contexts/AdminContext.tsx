import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  const [networkData, setNetworkDataState] = useState<NetworkData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem('evp-network-data');
    const savedAuth = localStorage.getItem('evp-admin-auth');
    
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);
        setNetworkDataState(parsedData);
      } catch (error) {
        console.error('Failed to load saved network data:', error);
      }
    }
    
    if (savedAuth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  // Save data to localStorage whenever networkData changes
  const setNetworkData = (data: NetworkData | null) => {
    setNetworkDataState(data);
    if (data) {
      localStorage.setItem('evp-network-data', JSON.stringify(data));
    } else {
      localStorage.removeItem('evp-network-data');
    }
  };

  const login = (password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('evp-admin-auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('evp-admin-auth');
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