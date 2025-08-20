import { useState } from 'react';
import { NetworkGraph } from '@/components/NetworkGraph';
import { NodeDetails } from '@/components/NodeDetails';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

import { NetworkData } from '@/types/network';
import { useToast } from '@/hooks/use-toast';
import { useAdmin } from '@/contexts/AdminContext';
import { Network, Users, Building2, GitBranch, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const { networkData } = useAdmin();

  const handleNodeClick = (nodeId: string, nodeData: any) => {
    setSelectedNode(nodeData);
  };

  if (!networkData) {
    return (
      <div className="min-h-screen bg-gradient-network p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-glow opacity-50 rounded-full blur-2xl" />
              <div className="relative p-6 bg-primary/10 rounded-full border border-primary/20">
                <Network className="w-12 h-12 text-primary" />
              </div>
            </div>
          </div>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-primary bg-clip-text text-transparent">
            EVP Network
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            No network data available. Please use the admin panel to upload data.
          </p>
          <Link to="/admin">
            <Button className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-network">
              <Settings className="w-4 h-4 mr-2" />
              Go to Admin Panel
            </Button>
          </Link>
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
              EVP Network
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