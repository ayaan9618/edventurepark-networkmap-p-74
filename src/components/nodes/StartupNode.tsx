import { Handle, Position, NodeProps } from '@xyflow/react';
import { Building2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const StartupNode = ({ data, selected }: NodeProps) => {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'stealth':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
      case 'paused':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
      default:
        return 'bg-network-node-startup/20 text-network-node-startup border-network-node-startup/30';
    }
  };
  
  return (
    <Card className={`
      relative p-4 min-w-[180px] border-2 transition-all duration-300 ease-smooth
      bg-gradient-to-br from-network-node-startup/20 to-network-node-startup/5 
      border-network-node-startup/30
      ${selected ? 'scale-110 shadow-glow' : 'hover:scale-105'}
      shadow-lg backdrop-blur-sm
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-network-node-startup border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-network-node-startup border-2 border-white"
      />
      
      <div className="flex items-start space-x-3">
        <div className="p-2 bg-network-node-startup/20 rounded-full">
          <Building2 className="w-6 h-6 text-network-node-startup" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2">
            <h3 className="font-semibold text-sm text-foreground truncate">
              {String(data.name || 'Unknown Startup')}
            </h3>
            {data.url && (
              <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-network-node-startup cursor-pointer" />
            )}
          </div>
          
          {data.domain && (
            <p className="text-xs text-muted-foreground truncate mt-1">
              {String(data.domain)}
            </p>
          )}
          
          {data.status && (
            <Badge 
              variant="outline" 
              className={`mt-2 text-xs ${getStatusColor(String(data.status))}`}
            >
              {String(data.status)}
            </Badge>
          )}
        </div>
      </div>
      
      {data.notes && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">Notes:</span> {String(data.notes)}
        </div>
      )}
    </Card>
  );
};