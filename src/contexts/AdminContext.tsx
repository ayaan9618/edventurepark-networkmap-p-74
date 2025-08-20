import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkData } from '@/types/network';
import { supabase, isSupabaseConfigured, checkSupabaseConnection } from '@/lib/supabase';
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
      if (!checkSupabaseConnection()) {
        // Fallback to localStorage if Supabase is not configured
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
        setIsLoading(false);
        return;
      }

      const { data: { session } } = await supabase!.auth.getSession();
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
      if (!checkSupabaseConnection()) {
        return; // Data already loaded from localStorage in checkAuthStatus
      }

      const { data, error } = await supabase!.functions.invoke('get-network-data');
      
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
    // Save to localStorage as backup when Supabase is not available
    if (!isSupabaseConfigured) {
      if (data) {
        localStorage.setItem('evp-network-data', JSON.stringify(data));
      } else {
        localStorage.removeItem('evp-network-data');
      }
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      
      if (!checkSupabaseConnection()) {
        // Fallback authentication for demo purposes
        const DEMO_CREDENTIALS = [
          { email: 'admin@edventure.com', password: 'edventure2024' },
          { email: 'demo@admin.com', password: 'admin123' }
        ];
        
        const isValidCredentials = DEMO_CREDENTIALS.some(
          cred => cred.email === email && cred.password === password
        );
        
        if (isValidCredentials) {
          setIsAuthenticated(true);
          localStorage.setItem('evp-admin-auth', 'true');
          toast({
            title: "Success",
            description: "Logged in successfully (Demo Mode)"
          });
          return true;
        } else {
          toast({
            title: "Login Failed",
            description: "Invalid credentials",
            variant: "destructive"
          });
          return false;
        }
      }

      const { data, error } = await supabase!.auth.signInWithPassword({
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
      if (checkSupabaseConnection()) {
        await supabase!.auth.signOut();
      } else {
        localStorage.removeItem('evp-admin-auth');
      }
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
      
      if (!checkSupabaseConnection()) {
        // Fallback to localStorage
        setNetworkDataState(data);
        localStorage.setItem('evp-network-data', JSON.stringify(data));
        toast({
          title: "Success",
          description: `Uploaded ${data.people.length} people, ${data.startups.length} startups, and ${data.relationships.length} relationships (Local Storage)`
        });
        return true;
      }

      const { data: result, error } = await supabase!.functions.invoke('upload-network-data', {
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