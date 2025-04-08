
import React from 'react';
import { 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  Loader2, 
  Database,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { ConnectionState } from '@/hooks/use-websocket';

interface ConnectionStatusProps {
  state: ConnectionState;
  lastHeartbeat: Date | null;
  connectionLogs: string[];
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  state,
  lastHeartbeat,
  connectionLogs
}) => {
  // Determine status display based on state
  const getStatusDisplay = () => {
    switch (state) {
      case 'connected':
        return {
          icon: <Wifi className="h-5 w-5 text-green-400" />,
          label: 'Connected',
          color: 'text-green-400',
          bgColor: 'bg-green-400/20',
          description: 'Live data streaming'
        };
      case 'connecting':
        return {
          icon: <Loader2 className="h-5 w-5 text-yellow-400 animate-spin" />,
          label: 'Connecting',
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-400/20',
          description: 'Attempting to connect...'
        };
      case 'disconnected':
        return {
          icon: <WifiOff className="h-5 w-5 text-gray-400" />,
          label: 'Disconnected',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          description: 'No connection to server'
        };
      case 'error':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-red-400" />,
          label: 'Connection Error',
          color: 'text-red-400',
          bgColor: 'bg-red-400/20',
          description: 'Failed to connect to server'
        };
      case 'using-mock-data':
        return {
          icon: <Database className="h-5 w-5 text-purple-400" />,
          label: 'Using Mock Data',
          color: 'text-purple-400',
          bgColor: 'bg-purple-400/20',
          description: 'Connection failed, using local data'
        };
      default:
        return {
          icon: <AlertTriangle className="h-5 w-5 text-gray-400" />,
          label: 'Unknown',
          color: 'text-gray-400',
          bgColor: 'bg-gray-400/20',
          description: 'Status unknown'
        };
    }
  };

  const statusDisplay = getStatusDisplay();
  const lastHeartbeatText = lastHeartbeat 
    ? `Last heartbeat: ${new Date(lastHeartbeat).toLocaleTimeString()}`
    : 'No heartbeat received';

  return (
    <div className="rounded-lg border border-gray-700 bg-crypto-light-card">
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            {statusDisplay.icon}
            <span className={`font-medium ${statusDisplay.color}`}>{statusDisplay.label}</span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs ${statusDisplay.bgColor} ${statusDisplay.color}`}>
            {statusDisplay.description}
          </div>
        </div>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="text-xs text-gray-400">
                {lastHeartbeatText}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Heartbeats verify the connection is alive</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Accordion type="single" collapsible className="border-t border-gray-700">
        <AccordionItem value="connection-logs">
          <AccordionTrigger className="px-4 py-2 text-sm text-gray-400 hover:text-white hover:no-underline">
            Connection Logs
          </AccordionTrigger>
          <AccordionContent>
            <div className="px-4 pb-4 max-h-80 overflow-y-auto">
              <div className="bg-crypto-dark rounded p-2 font-mono text-xs">
                {connectionLogs.length > 0 ? (
                  connectionLogs.map((log, index) => (
                    <div key={index} className={`py-1 ${log.includes('[ERROR]') ? 'text-red-400' : log.includes('[WARN]') ? 'text-yellow-400' : 'text-gray-300'}`}>
                      {log}
                    </div>
                  ))
                ) : (
                  <div className="text-gray-500">No connection logs available</div>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};

export default ConnectionStatus;
