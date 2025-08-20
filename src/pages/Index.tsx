import { useState, useEffect } from 'react';
import { FileUpload } from '@/components/FileUpload';
import { NetworkGraph } from '@/components/NetworkGraph';
import { NodeDetails } from '@/components/NodeDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { parseExcelFile, generateSampleData } from '@/utils/excelParser';
import { NetworkData } from '@/types/network';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import { Network, Users, Building2, GitBranch, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { networkData, setNetworkData } = useAdmin();

  // Load sample data on first visit if no data exists
  useEffect(() => {
    if (!networkData) {
      const sampleData = generateSampleData();
      setNetworkData(sampleData);
    }
  }, [networkData, setNetworkData]);

  const handleFileUpload = async (file: File) => {
    setIsLoading(true);
    try {
      const data = await parseExcelFile(file);
      setNetworkData(data);
      toast({
        title: "File uploaded successfully!",
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

  const loadSampleData = () => {
    const sampleData = generateSampleData();
    setNetworkData(sampleData);
    toast({
      title: "Sample data loaded!",
      description: "Explore the Edventure Park network with sample data.",
    });
  };

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNode(nodeData);
  };

  if (!networkData) {
    return (
      <div className="min-h-screen bg-gradient-network p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-glow opacity-50 rounded-full blur-2xl" />
                <div className="relative p-6 bg-primary/10 rounded-full border border-primary/20">
                  <Network className="w-12 h-12 text-primary" />
                </div>
              </div>
            </div>
            <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
              Edventure Nexus
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualize the network of people and startups at Edventure Park in an interactive spider-web graph
            </p>
          </div>

          {/* Upload Section */}
          <div className="mb-8">
            <FileUpload onFileUpload={handleFileUpload} isLoading={isLoading} />
          </div>

          {/* Sample Data Section */}
          <div className="text-center">
            <Card className="p-6 bg-card/50 border-primary/20">
              <h3 className="text-lg font-semibold mb-3">Try Sample Data</h3>
              <p className="text-muted-foreground mb-4">
                Don't have an Excel file ready? Load our sample Edventure Park network data to explore the visualization.
              </p>
              <Button 
                onClick={loadSampleData}
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-network"
              >
                <Network className="w-4 h-4 mr-2" />
                Load Sample Network
              </Button>
            </Card>
          </div>

          {/* Instructions */}
          <div className="mt-12 grid md:grid-cols-3 gap-6">
            <Card className="p-6 bg-card/30 border-border/50">
              <Users className="w-8 h-8 text-network-node-person mb-3" />
              <h3 className="font-semibold mb-2">People Sheet</h3>
              <p className="text-sm text-muted-foreground">
                Person ID, Name, Role, Sister Orgs, Interests, LinkedIn/Website, Notes
              </p>
            </Card>
            <Card className="p-6 bg-card/30 border-border/50">
              <Building2 className="w-8 h-8 text-network-node-startup mb-3" />
              <h3 className="font-semibold mb-2">Startups Sheet</h3>
              <p className="text-sm text-muted-foreground">
                Startup ID, Name, URL, Domain, Status, Notes
              </p>
            </Card>
            <Card className="p-6 bg-card/30 border-border/50">
              <GitBranch className="w-8 h-8 text-network-edge mb-3" />
              <h3 className="font-semibold mb-2">Relationships Sheet</h3>
              <p className="text-sm text-muted-foreground">
                Person ID, Startup ID, Role in Startup
              </p>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gradient-network overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-card/10 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center space-x-3">
          <Network className="w-8 h-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Edventure Nexus
            </h1>
            <p className="text-sm text-muted-foreground">
              {networkData.people.length} people • {networkData.startups.length} startups • {networkData.relationships.length} connections
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link to="/admin">
            <Button 
              variant="outline" 
              size="sm"
              className="border-primary/30 hover:bg-primary/10"
            >
              <Settings className="w-4 h-4 mr-2" />
              Admin Panel
            </Button>
          </Link>
          <Button 
            variant="outline" 
            size="sm"
            onClick={loadSampleData}
            className="border-primary/30 hover:bg-primary/10"
          >
            <Network className="w-4 h-4 mr-2" />
            Sample Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setNetworkData(null)}
            className="border-primary/30 hover:bg-primary/10"
          >
            New Upload
          </Button>
        </div>
      </div>

      {/* Network Graph */}
      <div className="relative h-[calc(100vh-80px)]">
        <NetworkGraph 
          data={networkData} 
          onNodeClick={handleNodeClick}
        />
        
        {/* Node Details Panel */}
        {selectedNode && (
          <NodeDetails 
            nodeData={selectedNode}
            onClose={() => setSelectedNode(null)}
          />
        )}
      </div>
    </div>
  );
};

export default Index;