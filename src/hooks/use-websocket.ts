
import { useState, useEffect } from 'react';
import { PriceData, generateAllPriceData } from '@/utils/mockData';

interface TickerData {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: string;
  volume?: number;
  change24h?: number;
  bid?: number;
  ask?: number;
}

export function useWebSocket() {
  const [tickerData, setTickerData] = useState<PriceData[]>([]);
  const [connectionState, setConnectionState] = useState<string>('using-mock-data');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);

  useEffect(() => {
    // Log that we're using mock data
    const mockLog = '[INFO] Using mock data instead of WebSocket connection';
    setConnectionLogs(prev => [...prev, mockLog]);
    
    // Set initial mock data
    const initialMockData = generateAllPriceData();
    setTickerData(initialMockData);
    
    // Update mock data periodically to simulate real-time updates
    const interval = setInterval(() => {
      const updatedMockData = generateAllPriceData();
      setTickerData(updatedMockData);
      
      // Simulate heartbeat
      setLastHeartbeatTime(new Date());
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  // Function to simulate reconnection
  const reconnect = () => {
    setConnectionLogs(prev => [...prev, '[INFO] Reconnect requested, continuing with mock data']);
    // We're already using mock data, so nothing to reconnect to
  };

  return {
    tickerData,
    connectionState,
    connectionLogs,
    lastHeartbeatTime,
    reconnect,
    isConnected
  };
}
