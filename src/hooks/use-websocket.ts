
import { useState, useEffect } from 'react';
import { generateAllPriceData } from '@/utils/mockData';

interface TickerData {
  exchange: string;
  symbol: string;
  price: number;
  timestamp: string;
}

export function useWebSocket() {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [connectionState, setConnectionState] = useState<string>('using-mock-data');
  const [connectionLogs, setConnectionLogs] = useState<string[]>([]);
  const [lastHeartbeatTime, setLastHeartbeatTime] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false); // Added missing isConnected state

  useEffect(() => {
    // Log that we're using mock data
    const mockLog = '[INFO] Using mock data instead of WebSocket connection';
    setConnectionLogs(prev => [...prev, mockLog]);
    
    // Set initial mock data using the correct function from mockData.ts
    const initialMockData = generateAllPriceData();
    setTickerData(initialMockData);
    
    // Update mock data periodically to simulate real-time updates
    const interval = setInterval(() => {
      const updatedMockData = generateAllPriceData().map(item => ({
        exchange: item.exchange,
        symbol: item.symbol,
        price: item.last, // Use the 'last' property which exists in the generated data
        timestamp: new Date().toISOString()
      }));
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
    isConnected // Return the isConnected state
  };
}
