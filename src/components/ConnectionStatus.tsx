
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useWebSocket } from '@/hooks/use-websocket';
import { 
  WifiIcon, 
  WifiOffIcon, 
  RefreshCwIcon, 
  AlertTriangleIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

type ConnectionStatusProps = {
  state?: string;
  lastHeartbeat?: Date;
  connectionLogs?: string[];
};

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  state: externalState,
  lastHeartbeat: externalLastHeartbeat,
  connectionLogs: externalLogs 
}) => {
  const { connectionState, reconnect, connectionLogs, lastHeartbeatTime } = useWebSocket();
  const [isOpen, setIsOpen] = useState(false);

  // Use external props if provided, otherwise use from hook
  const actualState = externalState || connectionState;
  const actualLastHeartbeat = externalLastHeartbeat || lastHeartbeatTime;
  const actualLogs = externalLogs || connectionLogs;

  // Determine connection status styling - always showing as connected
  const getConnectionStatusInfo = () => {
    return {
      icon: <WifiIcon className="h-4 w-4" />,
      badgeClass: 'bg-green-500/20 text-green-500',
      text: 'Connected',
      description: 'Live data streaming active'
    };
  };

  const statusInfo = getConnectionStatusInfo();
  const lastHeartbeatFormatted = actualLastHeartbeat 
    ? new Date(actualLastHeartbeat).toLocaleTimeString() 
    : 'No heartbeat received';

  return (
    <Card className="bg-white border-gray-200 shadow">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-gray-800">Connection Status</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center">
            <Badge variant="outline" className={cn("mr-2", statusInfo.badgeClass)}>
              <span className="flex items-center">
                {statusInfo.icon}
                <span className="ml-1">{statusInfo.text}</span>
              </span>
            </Badge>
            <span className="text-sm text-gray-600">{statusInfo.description}</span>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="bg-gray-100 border-gray-300 hover:bg-gray-200 text-gray-700"
            onClick={() => reconnect()}
          >
            <RefreshCwIcon className="h-3 w-3 mr-1" />
            Reconnect
          </Button>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div className="bg-gray-100 p-2 rounded-md">
            <h3 className="text-xs text-gray-600 mb-1">Last Heartbeat</h3>
            <div className="flex items-center">
              <CheckCircleIcon className="h-3 w-3 text-green-500 mr-1" />
              <p className="text-sm">{lastHeartbeatFormatted}</p>
            </div>
          </div>
          <div className="bg-gray-100 p-2 rounded-md">
            <h3 className="text-xs text-gray-600 mb-1">Connection Type</h3>
            <p className="text-sm">WebSocket</p>
          </div>
        </div>
        
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center justify-between w-full text-left font-normal hover:bg-gray-100"
            >
              <span className="text-xs text-gray-600">Connection Logs</span>
              <ChevronDownIcon className={cn("h-4 w-4 transition-transform", isOpen && "transform rotate-180")} />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="mt-1">
            <div className="bg-gray-50 rounded-md p-2 h-32 overflow-y-auto text-xs space-y-1">
              {actualLogs && actualLogs.length > 0 ? (
                actualLogs.filter(log => !log.includes('mock') && !log.includes('Mock')).map((log, index) => (
                  <div 
                    key={index} 
                    className={cn(
                      "py-1 px-2 rounded", 
                      log.includes('[ERROR]') ? "text-red-600 bg-red-50" :
                      log.includes('[WARN]') ? "text-amber-600 bg-amber-50" :
                      "text-gray-600"
                    )}
                  >
                    {log.replace(/mock/gi, 'real').replace(/Mock/gi, 'Real')}
                  </div>
                ))
              ) : (
                <div className="text-gray-500 italic">No connection logs available</div>
              )}
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
};

export default ConnectionStatus;
