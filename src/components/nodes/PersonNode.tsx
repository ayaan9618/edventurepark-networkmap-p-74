import { Handle, Position, NodeProps } from '@xyflow/react';
import { User, Crown } from 'lucide-react';
import { Card } from '@/components/ui/card';

export const PersonNode = ({ data, selected }: NodeProps) => {
  const isFounder = data.isFounder;
  
  return (
    <Card className={`
      relative p-4 min-w-[160px] border-2 transition-all duration-300 ease-smooth
      ${isFounder 
        ? 'bg-gradient-to-br from-network-primary/20 to-network-secondary/20 border-network-primary shadow-glow' 
        : 'bg-gradient-to-br from-network-node-person/20 to-network-node-person/5 border-network-node-person/30'
      }
      ${selected ? 'scale-110 shadow-glow' : 'hover:scale-105'}
      shadow-lg backdrop-blur-sm
    `}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-network-node-person border-2 border-white"
      />
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-network-node-person border-2 border-white"
      />
      
      <div className="flex items-center space-x-3">
        <div className={`
          relative p-2 rounded-full
          ${isFounder 
            ? 'bg-network-primary/20' 
            : 'bg-network-node-person/20'
          }
        `}>
          {isFounder && (
            <div className="absolute -top-1 -right-1">
              <Crown className="w-4 h-4 text-yellow-400 fill-current" />
            </div>
          )}
          <User className={`
            w-6 h-6
            ${isFounder ? 'text-network-primary' : 'text-network-node-person'}
          `} />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className={`
            font-semibold text-sm truncate
            ${isFounder ? 'text-network-primary' : 'text-foreground'}
          `}>
            {String(data.name || 'Unknown')}
          </h3>
          {data.role && (
            <p className="text-xs text-muted-foreground truncate">
              {String(data.role)}
            </p>
          )}
          {isFounder && (
            <div className="flex items-center space-x-1 mt-1">
              <div className="w-2 h-2 bg-network-primary rounded-full animate-pulse" />
              <span className="text-xs font-medium text-network-primary">
                Founder
              </span>
            </div>
          )}
        </div>
      </div>
      
      {data.interests && (
        <div className="mt-2 text-xs text-muted-foreground">
          <span className="font-medium">Interests:</span> {String(data.interests)}
        </div>
      )}
    </Card>
  );
};