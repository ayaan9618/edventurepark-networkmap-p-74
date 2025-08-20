import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { NetworkData } from '@/types/network';
import { supabase } from '@/integrations/supabase/client';
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
      }
      // Always try to load network data regardless of auth status
      await loadNetworkData();
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadNetworkData = async () => {
    try {
      // Load data directly from database tables
      const [peopleResult, startupsResult, relationshipsResult] = await Promise.all([
        supabase.from('people').select('*'),
        supabase.from('startups').select('*'),  
        supabase.from('relationships').select('*')
      ]);

      if (peopleResult.error || startupsResult.error || relationshipsResult.error) {
        console.error('Error loading network data:', {
          people: peopleResult.error,
          startups: startupsResult.error,
          relationships: relationshipsResult.error
        });
        return;
      }

      const networkData: NetworkData = {
        people: peopleResult.data.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          interests: p.interests?.[0] || '',
          linkedinWebsite: p.linkedin_website,
          isFounder: p.is_founder
        })),
        startups: startupsResult.data.map(s => ({
          id: s.id,
          name: s.name,
          domain: s.domain,
          status: s.status,
          url: s.url
        })),
        relationships: relationshipsResult.data.map(r => ({
          personId: r.person_id,
          startupId: r.startup_id,
          role: r.role
        }))
      };

      setNetworkDataState(networkData);
    } catch (error) {
      console.error('Error loading network data:', error);
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
      
      // Clear existing data and insert new data
      const deleteResults = await Promise.all([
        supabase.from('relationships').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('people').delete().neq('id', '00000000-0000-0000-0000-000000000000'),
        supabase.from('startups').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      ]);

      const deleteError = deleteResults.find(r => r.error)?.error;
      if (deleteError) {
        console.error('Delete error:', deleteError);
        toast({
          title: "Upload Failed",
          description: "Failed to clear existing data",
          variant: "destructive"
        });
        return false;
      }

      // Insert new data
      const [peopleResult, startupsResult, relationshipsResult] = await Promise.all([
        supabase.from('people').insert(data.people.map(p => ({
          id: p.id,
          name: p.name,
          role: p.role,
          interests: p.interests ? [p.interests] : null,
          linkedin_website: p.linkedinWebsite,
          is_founder: p.isFounder || false
        }))),
        supabase.from('startups').insert(data.startups.map(s => ({
          id: s.id,
          name: s.name,
          domain: s.domain,
          status: s.status,
          url: s.url
        }))),
        supabase.from('relationships').insert(data.relationships.map(r => ({
          person_id: r.personId,
          startup_id: r.startupId,
          role: r.role
        })))
      ]);

      if (peopleResult.error || startupsResult.error || relationshipsResult.error) {
        console.error('Insert error:', {
          people: peopleResult.error,
          startups: startupsResult.error,
          relationships: relationshipsResult.error
        });
        toast({
          title: "Upload Failed",
          description: "Failed to upload network data",
          variant: "destructive"
        });
        return false;
      }

      // Reload the data
      await loadNetworkData();
      toast({
        title: "Success",
        description: `Uploaded ${data.people.length} people, ${data.startups.length} startups, and ${data.relationships.length} relationships`
      });
      return true;
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