import { X, User, Building2, ExternalLink, Linkedin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface NodeDetailsProps {
  nodeData: any;
  onClose: () => void;
}

export const NodeDetails = ({ nodeData, onClose }: NodeDetailsProps) => {
  const isPerson = nodeData.role !== undefined;
  
  return (
    <Card className="absolute top-4 right-4 w-80 p-6 bg-card/95 backdrop-blur-sm border border-border shadow-network z-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold bg-gradient-primary bg-clip-text text-transparent">
          {isPerson ? 'Person Details' : 'Startup Details'}
        </h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="hover:bg-destructive/10 hover:text-destructive"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
      
      {isPerson ? (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-network-node-person/20 rounded-full">
              <User className="w-6 h-6 text-network-node-person" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{nodeData.name}</h3>
              {nodeData.role && (
                <p className="text-sm text-muted-foreground">{nodeData.role}</p>
              )}
            </div>
          </div>
          
          {nodeData.isFounder && (
            <Badge className="bg-network-primary/20 text-network-primary border-network-primary/30">
              Founder
            </Badge>
          )}
          
          {nodeData.sisterOrgs && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Sister Organizations</h4>
              <p className="text-sm text-muted-foreground">{nodeData.sisterOrgs}</p>
            </div>
          )}
          
          {nodeData.interests && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Interests</h4>
              <p className="text-sm text-muted-foreground">{nodeData.interests}</p>
            </div>
          )}
          
          {nodeData.linkedinWebsite && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-2">Links</h4>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open(nodeData.linkedinWebsite, '_blank')}
              >
                <Linkedin className="w-4 h-4 mr-2" />
                LinkedIn/Website
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            </div>
          )}
          
          {nodeData.notes && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground">{nodeData.notes}</p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-network-node-startup/20 rounded-full">
              <Building2 className="w-6 h-6 text-network-node-startup" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{nodeData.name}</h3>
              {nodeData.domain && (
                <p className="text-sm text-muted-foreground">{nodeData.domain}</p>
              )}
            </div>
          </div>
          
          {nodeData.status && (
            <Badge 
              variant="outline"
              className={`
                ${nodeData.status.toLowerCase() === 'active' ? 'bg-green-500/20 text-green-400 border-green-500/30' : ''}
                ${nodeData.status.toLowerCase() === 'stealth' ? 'bg-orange-500/20 text-orange-400 border-orange-500/30' : ''}
                ${nodeData.status.toLowerCase() === 'paused' ? 'bg-gray-500/20 text-gray-400 border-gray-500/30' : ''}
              `}
            >
              {nodeData.status}
            </Badge>
          )}
          
          {nodeData.url && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-2">Website</h4>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start"
                onClick={() => window.open(nodeData.url, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Website
              </Button>
            </div>
          )}
          
          {nodeData.notes && (
            <div>
              <h4 className="font-medium text-sm text-foreground mb-1">Notes</h4>
              <p className="text-sm text-muted-foreground">{nodeData.notes}</p>
            </div>
          )}
        </div>
      )}
    </Card>
  );
};