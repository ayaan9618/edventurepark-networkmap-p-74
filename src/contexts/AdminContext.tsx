import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkData } from '@/types/network';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface AdminContextType {
  networkData: NetworkData | null;
  setNetworkData: (data: NetworkData | null) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  uploadNetworkData: (data: NetworkData, filename: string) => Promise<boolean>;
  refreshNetworkData: () => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider = ({ children }: { children: ReactNode }) => {
  const [networkData, setNetworkDataState] = useState<NetworkData | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Check authentication status on mount
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        await loadNetworkData();
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNetworkData = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('get-network-data');
      
      if (error) {
        console.error('Error loading network data:', error);
        toast({
          title: "Error",
          description: "Failed to load network data",
          variant: "destructive"
        });
        return;
      }

      if (data?.networkData) {
        setNetworkDataState(data.networkData);
      }
    } catch (error) {
      console.error('Error loading network data:', error);
      toast({
        title: "Error", 
        description: "Failed to load network data",
        variant: "destructive"
      });
    }
  };

  const setNetworkData = (data: NetworkData | null) => {
    setNetworkDataState(data);
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Login Failed",
          description: error.message,
          variant: "destructive"
        });
        return false;
      }

      if (data.user) {
        setIsAuthenticated(true);
        await loadNetworkData();
        toast({
          title: "Success",
          description: "Logged in successfully"
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      setNetworkDataState(null);
      toast({
        title: "Success",
        description: "Logged out successfully"
      });
    } catch (error) {
      console.error('Logout error:', error);
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive"
      });
    }
  };

  const uploadNetworkData = async (data: NetworkData, filename: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      const { data: result, error } = await supabase.functions.invoke('upload-network-data', {
        body: { networkData: data, filename }
      });

      if (error) {
        console.error('Upload error:', error);
        toast({
          title: "Upload Failed",
          description: "Failed to upload network data",
          variant: "destructive"
        });
        return false;
      }

      if (result?.success) {
        setNetworkDataState(data);
        toast({
          title: "Success",
          description: `Uploaded ${result.counts.people} people, ${result.counts.startups} startups, and ${result.counts.relationships} relationships`
        });
        return true;
      }

      return false;
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred during upload",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshNetworkData = async (): Promise<void> => {
    await loadNetworkData();
  };

  return (
    <AdminContext.Provider value={{
      networkData,
      setNetworkData,
      isAuthenticated,
      isLoading,
      login,
      logout,
      uploadNetworkData,
      refreshNetworkData
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