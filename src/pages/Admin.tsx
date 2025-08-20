import { useState } from 'react';
import { useAdmin } from '@/contexts/AdminContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FileUpload } from '@/components/FileUpload';
import { NetworkDataTable } from '@/components/admin/NetworkDataTable';
import { parseExcelFile } from '@/utils/excelParser';
import { useToast } from '@/hooks/use-toast';
import { Shield, Database, Users, Building2, GitBranch, Eye, LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';

const AdminLogin = () => {
  const [password, setPassword] = useState('');
  const { login } = useAdmin();
  const { toast } = useToast();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      toast({
        title: "Welcome to Admin Panel",
        description: "You have successfully logged in.",
      });
    } else {
      toast({
        title: "Login failed",
        description: "Invalid password. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-network flex items-center justify-center p-6">
      <Card className="w-full max-w-md p-8 bg-card/80 backdrop-blur-sm border-primary/20">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Shield className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Access
          </h1>
          <p className="text-muted-foreground mt-2">
            Enter password to manage Edventure Network
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              className="mt-1"
            />
          </div>
          <Button type="submit" className="w-full">
            Login to Admin Panel
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary">
            ← Back to Network View
          </Link>
        </div>
      </Card>
    </div>
  );
};

const AdminDashboard = () => {
  const { networkData, setNetworkData, logout } = useAdmin();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await parseExcelFile(file);
      setNetworkData(data);
      toast({
        title: "Network data updated!",
        description: `Loaded ${data.people.length} people, ${data.startups.length} startups, and ${data.relationships.length} relationships.`,
      });
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to parse the Excel file",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearData = () => {
    setNetworkData(null);
    toast({
      title: "Data cleared",
      description: "Network data has been cleared.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-network">
      {/* Header */}
      <div className="bg-card/10 backdrop-blur-sm border-b border-border/50 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Database className="w-8 h-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Edventure Admin Panel
              </h1>
              <p className="text-sm text-muted-foreground">
                Manage network data and connections
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Link to="/">
              <Button variant="outline" size="sm" className="border-primary/30 hover:bg-primary/10">
                <Eye className="w-4 h-4 mr-2" />
                View Network
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={logout}
              className="border-destructive/30 hover:bg-destructive/10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="p-6 bg-card/50 border-primary/20">
            <div className="flex items-center space-x-3">
              <Users className="w-8 h-8 text-network-node-person" />
              <div>
                <p className="text-2xl font-bold">{networkData?.people.length || 0}</p>
                <p className="text-muted-foreground">People</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 border-primary/20">
            <div className="flex items-center space-x-3">
              <Building2 className="w-8 h-8 text-network-node-startup" />
              <div>
                <p className="text-2xl font-bold">{networkData?.startups.length || 0}</p>
                <p className="text-muted-foreground">Startups</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-6 bg-card/50 border-primary/20">
            <div className="flex items-center space-x-3">
              <GitBranch className="w-8 h-8 text-network-edge" />
              <div>
                <p className="text-2xl font-bold">{networkData?.relationships.length || 0}</p>
                <p className="text-muted-foreground">Connections</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Upload Section */}
        <Card className="p-6 bg-card/50 border-primary/20">
          <h2 className="text-lg font-semibold mb-4">Upload Network Data</h2>
          <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          
          {networkData && (
            <div className="mt-4 flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={clearData}
                className="border-destructive/30 hover:bg-destructive/10"
              >
                Clear Data
              </Button>
            </div>
          )}
        </Card>

        {/* Data Management */}
        {networkData && (
          <NetworkDataTable data={networkData} onDataChange={setNetworkData} />
        )}
      </div>
    </div>
  );
};

const Admin = () => {
  const { isAuthenticated } = useAdmin();
  
  return isAuthenticated ? <AdminDashboard /> : <AdminLogin />;
};

export default Admin;